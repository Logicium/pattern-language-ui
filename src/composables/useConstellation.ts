import { ref, type Ref } from 'vue'
import type { ConstellationNode } from '@/types'

const nodes: ConstellationNode[] = [
  { x: 0, y: 0, targetX: 0.15, targetY: 0.25, label: 'Anchor', opacity: 0 },
  { x: 0, y: 0, targetX: 0.45, targetY: 0.15, label: 'Youth', opacity: 0 },
  { x: 0, y: 0, targetX: 0.75, targetY: 0.30, label: 'Learning', opacity: 0 },
  { x: 0, y: 0, targetX: 0.25, targetY: 0.65, label: 'Creative', opacity: 0 },
  { x: 0, y: 0, targetX: 0.65, targetY: 0.60, label: 'Digital', opacity: 0 },
  { x: 0, y: 0, targetX: 0.85, targetY: 0.80, label: 'Timebank', opacity: 0 }
]

const connections: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [4, 5]
]

export function useConstellation(canvasRef: Ref<HTMLCanvasElement | null>) {
  let animationFrame: number | null = null
  let startTime = 0

  const drawConstellation = (canvas: HTMLCanvasElement, timestamp: number) => {
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

    // Animate nodes into position
    nodes.forEach((node, i) => {
      const delay = i * 200
      const progress = Math.min((elapsed - delay) / 1000, 1)

      if (progress > 0) {
        const easeProgress = 1 - Math.pow(1 - progress, 3) // ease out cubic
        node.x = node.targetX * easeProgress
        node.y = node.targetY * easeProgress
        node.opacity = Math.min(progress * 2, 1)
      }
    })

    // Draw connections
    ctx.strokeStyle = '#d47b5f'
    ctx.lineWidth = 0.5

    connections.forEach(([i, j], idx) => {
      const delay = idx * 150 + 800
      const progress = Math.min((elapsed - delay) / 800, 1)
      const nodeI = nodes[i]
      const nodeJ = nodes[j]

      if (progress > 0 && nodeI && nodeJ && nodeI.opacity > 0 && nodeJ.opacity > 0) {
        const opacity = Math.min(progress, 0.25)
        ctx.globalAlpha = opacity

        ctx.beginPath()
        ctx.moveTo(nodeI.x * rect.width, nodeI.y * rect.height)
        ctx.lineTo(nodeJ.x * rect.width, nodeJ.y * rect.height)
        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      if (node.opacity > 0) {
        // Draw dot
        ctx.globalAlpha = node.opacity
        ctx.fillStyle = '#2a2a2a'
        ctx.beginPath()
        ctx.arc(node.x * rect.width, node.y * rect.height, 4, 0, Math.PI * 2)
        ctx.fill()

        // Draw label
        ctx.globalAlpha = node.opacity * 0.7
        ctx.fillStyle = '#6a6a6a'
        ctx.font = '300 11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x * rect.width, node.y * rect.height + 20)
      }
    })

    // Continue animation for first 3 seconds, then stop
    if (elapsed < 3000) {
      animationFrame = requestAnimationFrame((ts) => drawConstellation(canvas, ts))
    }
  }

  const initCanvas = () => {
    if (canvasRef.value) {
      startTime = 0
      nodes.forEach(node => {
        node.x = 0
        node.y = 0
        node.opacity = 0
      })
      animationFrame = requestAnimationFrame((ts) => drawConstellation(canvasRef.value!, ts))
    }
  }

  const cleanup = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }

  return {
    initCanvas,
    cleanup
  }
}
