import { ref, type Ref } from 'vue'
import { allPatterns } from '@/utils/data'

interface GraphNode {
  id: number
  title: string
  x: number
  y: number
  connections: number
  radius: number
  angle: number // for circular layout
  distance: number // from center
  color: string
}

interface Connection {
  from: number
  to: number
  color: string
}

const accentColors = [
  '#d4c4b8', // desaturated warm
  '#c4d4cc', // desaturated cool
  '#d4c8dc', // desaturated purple
  '#d8d8d8'  // gray
]

const nodeColors = [
  '#d4c4b8', // desaturated warm peach
  '#c4d4cc', // desaturated cool teal
  '#d4c8dc', // desaturated soft purple
  '#d8d0c0', // desaturated warm tan
  '#c0d0d8', // desaturated sky blue
  '#d8c0d0', // desaturated rose
]

export function usePatternGraph(canvasRef: Ref<HTMLCanvasElement | null>, blurredCanvasRef?: Ref<HTMLCanvasElement | null>) {
  let animationFrame: number | null = null
  let nodes: GraphNode[] = []
  let connections: Connection[] = []
  let rotation = 0
  let startTime = 0
  let isPaused = false
  let hoveredNode: GraphNode | null = null
  let mouseX = 0
  let mouseY = 0

  // Build the graph from pattern data
  const buildGraph = () => {
    // Use all patterns for the visualization
    const selectedPatterns = allPatterns
    
    // Build nodes with connection counts
    const connectionCounts = new Map<number, number>()
    selectedPatterns.forEach(pattern => {
      connectionCounts.set(pattern.id, 0)
    })

    // Count connections for each pattern
    const patternMap = new Map(selectedPatterns.map(p => [p.title, p.id]))
    selectedPatterns.forEach(pattern => {
      pattern.relatedPatterns?.forEach(relatedTitle => {
        if (patternMap.has(relatedTitle)) {
          const fromId = pattern.id
          const toId = patternMap.get(relatedTitle)!
          connectionCounts.set(fromId, (connectionCounts.get(fromId) || 0) + 1)
          connectionCounts.set(toId, (connectionCounts.get(toId) || 0) + 1)
        }
      })
    })

    // Create nodes in circular layout
    nodes = selectedPatterns.map((pattern, index) => {
      const angle = (index / selectedPatterns.length) * Math.PI * 2
      const connectionCount = connectionCounts.get(pattern.id) || 0
      
      // Node size based on connections (min 3, max 7) - tighter range
      const radius = Math.max(3, Math.min(7, 3 + connectionCount * 0.5))
      
      // Vary distance from center slightly for visual interest
      const baseDistance = 0.70 // Increased to use more canvas space
      const distanceVariation = 0.08 // Slightly increased variation
      const distance = baseDistance + (Math.sin(index * 2.3) * distanceVariation)

      // Assign color based on pattern category or cycling through colors
      const colorIndex = index % nodeColors.length
      const color = nodeColors[colorIndex]!

      return {
        id: pattern.id,
        title: pattern.title,
        x: 0,
        y: 0,
        connections: connectionCount,
        radius,
        angle,
        distance,
        color
      }
    })

    // Create connections
    connections = []
    selectedPatterns.forEach(pattern => {
      pattern.relatedPatterns?.forEach(relatedTitle => {
        if (patternMap.has(relatedTitle)) {
          const fromId = pattern.id
          const toId = patternMap.get(relatedTitle)!
          
          // Avoid duplicate connections
          const exists = connections.some(c => 
            (c.from === fromId && c.to === toId) || 
            (c.from === toId && c.to === fromId)
          )
          
          if (!exists) {
            const colorIndex = connections.length % accentColors.length
            connections.push({
              from: fromId,
              to: toId,
              color: accentColors[colorIndex]!
            })
          }
        }
      })
    })
  }

  // Draw a curved line using quadratic bezier curve
  const drawCurvedLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    curvature: number = 0.2
  ) => {
    // Calculate control point for curve
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    
    // Perpendicular offset for curve
    const dx = x2 - x1
    const dy = y2 - y1
    const dist = Math.sqrt(dx * dx + dy * dy)
    const offset = dist * curvature
    
    // Control point perpendicular to line
    const controlX = midX + (-dy / dist) * offset
    const controlY = midY + (dx / dist) * offset

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(controlX, controlY, x2, y2)
    ctx.stroke()
  }

  // Check if mouse is over a node
  const checkHover = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // Convert mouse position to logical canvas coordinates
    const x = mouseX / dpr
    const y = mouseY / dpr

    hoveredNode = null
    for (const node of nodes) {
      const dx = x - node.x
      const dy = y - node.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance <= node.radius + 5) {
        hoveredNode = node
        canvas.style.cursor = 'pointer'
        return
      }
    }
    canvas.style.cursor = 'default'
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const drawGraph = (canvas: HTMLCanvasElement, timestamp: number) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Slow rotation (complete rotation every 60 seconds) - pause when hovering
    if (!isPaused) {
      rotation = (elapsed / 60000) * Math.PI * 2
    }

    const centerX = rect.width / 2
    const centerY = rect.height * 0.8 // Move center down to 80% from top (20% from bottom)
    const scale = Math.min(rect.width, rect.height) * 1.1 // Increased to fill wider canvas

    // Update node positions with rotation
    nodes.forEach(node => {
      const rotatedAngle = node.angle + rotation
      node.x = centerX + Math.cos(rotatedAngle) * node.distance * scale
      node.y = centerY + Math.sin(rotatedAngle) * node.distance * scale
    })

    // Check for hover
    checkHover(canvas)

    // Fade in animation for first 2 seconds
    const fadeProgress = Math.min(elapsed / 2000, 1)
    ctx.globalAlpha = fadeProgress

    // Draw connections with curved lines
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from)
      const toNode = nodes.find(n => n.id === conn.to)

      if (fromNode && toNode) {
        ctx.strokeStyle = conn.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = fadeProgress * 0.4

        drawCurvedLine(
          ctx,
          fromNode.x,
          fromNode.y,
          toNode.x,
          toNode.y,
          0.15
        )
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node
      ctx.globalAlpha = fadeProgress

      // Draw subtle glow effect only when hovered
      if (isHovered) {
        const glowColor = node.color
        const rgb = hexToRgb(glowColor)
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3
        )
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`)
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw single circle node
      ctx.fillStyle = node.color
      ctx.globalAlpha = fadeProgress
      ctx.beginPath()
      ctx.arc(node.x, node.y, isHovered ? node.radius * 1.3 : node.radius, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw tooltip for hovered node
    if (hoveredNode) {
      ctx.globalAlpha = fadeProgress
      ctx.font = '300 11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.letterSpacing = '0.05em'
      
      const text = hoveredNode.title.toUpperCase()
      const textWidth = ctx.measureText(text).width
      const padding = 10
      const tooltipX = hoveredNode.x
      const tooltipY = hoveredNode.y - hoveredNode.radius - 15
      
      // Draw simple minimalist text only (no background box)
      ctx.fillStyle = '#2a2a2a'
      ctx.fillText(text, tooltipX, tooltipY)
    }

    // Also draw to blurred canvas if provided
    if (blurredCanvasRef?.value) {
      const blurredCanvas = blurredCanvasRef.value
      const blurredCtx = blurredCanvas.getContext('2d')
      if (blurredCtx) {
        blurredCanvas.width = canvas.width
        blurredCanvas.height = canvas.height
        blurredCtx.drawImage(canvas, 0, 0)
      }
    }

    // Continue animation
    animationFrame = requestAnimationFrame((ts) => drawGraph(canvas, ts))
  }

  // Mouse event handlers
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // Store mouse position in canvas pixel coordinates
    mouseX = (e.clientX - rect.left) * dpr
    mouseY = (e.clientY - rect.top) * dpr
    
    // Check if hovering over a node
    const wasHovering = isPaused
    const nowHovering = hoveredNode !== null
    
    // If we just started hovering, capture the current rotation to pause smoothly
    if (!wasHovering && nowHovering) {
      isPaused = true
      // Recalculate startTime based on current rotation to maintain position
      const currentTime = performance.now()
      startTime = currentTime - (rotation / (Math.PI * 2)) * 60000
    } else if (wasHovering && !nowHovering) {
      isPaused = false
      // Reset startTime to continue rotation smoothly from current position
      const currentTime = performance.now()
      startTime = currentTime - (rotation / (Math.PI * 2)) * 60000
    } else {
      isPaused = nowHovering
    }
  }

  const handleMouseLeave = () => {
    isPaused = false
    hoveredNode = null
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'default'
    }
  }

  const initCanvas = () => {
    if (canvasRef.value) {
      startTime = 0
      rotation = 0
      buildGraph()
      
      // Add mouse event listeners
      canvasRef.value.addEventListener('mousemove', handleMouseMove)
      canvasRef.value.addEventListener('mouseleave', handleMouseLeave)
      
      animationFrame = requestAnimationFrame((ts) => drawGraph(canvasRef.value!, ts))
    }
  }

  const cleanup = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
    if (canvasRef.value) {
      canvasRef.value.removeEventListener('mousemove', handleMouseMove)
      canvasRef.value.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  return {
    initCanvas,
    cleanup
  }
}
