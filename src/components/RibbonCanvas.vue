<template>
  <div
    ref="containerRef"
    class="ribbon-canvas"
    :style="{ opacity: isReady ? 1 : 0 }"
  >
    <div class="blur-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement | null>(null)
const isReady = ref(false)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let lineSegments: THREE.LineSegments
let geometry: THREE.BufferGeometry
let animationFrameId: number | null = null
let time = 0

const colors = [
  '#e8b4a0', // accent-1
  '#b8d4c8', // accent-2
  '#c9b8e8', // accent-3
  '#d8d8d8', // light gray
  '#c0c0c0', // medium gray
  '#e0e0e0', // lighter gray
]

const initThreeJS = () => {
  if (!containerRef.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // Setup scene
  scene = new THREE.Scene()
  
  // Setup camera - positioned to view from above at an angle
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000)
  camera.position.set(0, 8, 13)
  camera.lookAt(0, 0, 0)

  // Setup renderer with transparency
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 0) // Transparent background
  container.appendChild(renderer.domElement)

  // Create flowing ribbon geometry
  const segX = 100 // Horizontal segments
  const segY = 30  // Vertical segments (number of lines) - reduced from 50 for fewer, more visible lines
  
  // Make geometry wider to extend to container edges
  const aspectRatio = width / height
  const planeWidth = 20 * aspectRatio // Scale width based on aspect ratio
  const planeHeight = 10
  
  geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segX, segY)
  
  // Create line indices for horizontal lines only
  const idx: number[] = []
  let startIdx = 0
  for (let y = 0; y < segY + 1; y++) {
    for (let x = 0; x < segX; x++) {
      idx.push(startIdx + x, startIdx + x + 1)
    }
    startIdx += segX + 1
  }
  geometry.setIndex(idx)
  geometry.rotateX(Math.PI * -0.5)

  // Adjust vertex positions to compensate for perspective
  // Lines further away need to extend wider to disappear off-screen
  const positions = geometry.attributes.position
  const colors_array = new Float32Array(positions.count * 3)
  
  const halfWidth = planeWidth / 2
  const halfHeight = planeHeight / 2
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    
    // Calculate distance from camera (further back = larger z value)
    const depthFactor = (z + halfHeight) / planeHeight // 0 at near, 1 at far
    
    // Scale x position based on depth - further lines extend wider
    // Using exponential scaling for even more extension at far distances
    const perspectiveScale = 1 + (depthFactor * depthFactor * 2.5) // Up to 250% wider for far lines
    const scaledX = x * perspectiveScale
    positions.setX(i, scaledX)
    
    // Recalculate for colors
    const scaledWidth = planeWidth * perspectiveScale
    const normalizedX = (scaledX + scaledWidth / 2) / scaledWidth // Normalize to 0-1
    
    // Pick color based on vertical position (line index)
    const verticalIndex = Math.floor(i / (segX + 1))
    const color = new THREE.Color(colors[verticalIndex % colors.length])
    
    // Apply gradient blur fade at edges (more aggressive fade)
    let alpha = 1
    const fadeWidth = 0.15 // 15% fade zone on each side
    
    if (normalizedX < fadeWidth) {
      // Smooth fade from left edge
      alpha = normalizedX / fadeWidth
    } else if (normalizedX > (1 - fadeWidth)) {
      // Smooth fade to right edge
      alpha = (1 - normalizedX) / fadeWidth
    }
    
    // Apply cubic easing for smoother fade
    alpha = alpha * alpha * (3 - 2 * alpha)
    
    colors_array[i * 3] = color.r * alpha
    colors_array[i * 3 + 1] = color.g * alpha
    colors_array[i * 3 + 2] = color.b * alpha
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3))

  // Create material with vertex colors and increased line width
  const material = new THREE.LineBasicMaterial({ 
    vertexColors: true,
    opacity: 0.95, // Slightly increased for better visibility with blur
    transparent: true,
    linewidth: 4 // Increased from 2 for thicker lines
  })

  lineSegments = new THREE.LineSegments(geometry, material)
  scene.add(lineSegments)

  // Handle window resize
  const handleResize = () => {
    const width = container.clientWidth
    const height = container.clientHeight
    
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    
    renderer.setSize(width, height)
  }
  
  window.addEventListener('resize', handleResize)

  isReady.value = true
  animate()

  return () => {
    window.removeEventListener('resize', handleResize)
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
}

const animate = () => {
  if (!geometry) return

  time += 0.008

  const positions = geometry.attributes.position
  const colors_attr = geometry.attributes.color
  const segX = 100
  
  // Get plane dimensions
  const bounds = geometry.boundingBox
  if (!bounds) {
    geometry.computeBoundingBox()
  }
  const planeWidth = bounds ? (bounds.max.x - bounds.min.x) : 20
  const halfWidth = planeWidth / 2
  
  // Animate the wave motion
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    
    // Create flowing wave motion
    const normalizedX = (x + halfWidth) / planeWidth
    const normalizedZ = (z + 5) / 10
    
    // Multiple sine waves for complex motion
    const wave1 = Math.sin(normalizedX * Math.PI * 2 + time * 1.5) * 0.8
    const wave2 = Math.sin(normalizedX * Math.PI * 3 + normalizedZ * Math.PI * 2 + time * 1.2) * 0.4
    const wave3 = Math.sin(normalizedZ * Math.PI * 4 + time * 0.8) * 0.3
    
    // Combine waves for natural flowing motion
    const y = wave1 + wave2 + wave3
    
    positions.setY(i, y)
  }
  
  positions.needsUpdate = true
  
  // Gentle camera rotation for added depth
  camera.position.x = Math.sin(time * 0.1) * 2
  camera.lookAt(0, 0, 0)

  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  const cleanup = initThreeJS()
  
  onUnmounted(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
    if (cleanup) cleanup()
    
    // Cleanup Three.js resources
    if (geometry) geometry.dispose()
    if (lineSegments) {
      const material = lineSegments.material as THREE.Material
      material.dispose()
    }
    if (renderer) renderer.dispose()
  })
})
</script>

<style scoped>
.ribbon-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.6s ease;
  pointer-events: none;
  overflow: hidden;
}

.ribbon-canvas :deep(canvas) {
  display: block;
  filter: none; /* Remove global blur */
}

/* Radial gradient blur overlay - blurs center where text is */
.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  /* Mask reveals blur in center, crisp at edges */
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 65%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 65%);
}
</style>
