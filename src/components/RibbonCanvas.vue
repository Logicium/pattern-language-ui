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
  '#e8b4a0',
  '#b8d4c8',
  '#c9b8e8',
  '#d8d8d8',
  '#c0c0c0',
  '#e0e0e0',
]

const initThreeJS = () => {
  if (!containerRef.value) return
  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000)
  camera.position.set(0, 8, 13)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // Geometry
  const segX = 100
  const segY = 30
  const aspectRatio = width / height
  const planeWidth = 20 * aspectRatio * 1.35 // extended width for infinite effect
  const planeHeight = 10

  geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segX, segY)

  // Horizontal line indices
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

  const positions = geometry.attributes.position
  if (!positions) return // ✅ added back check

  const colors_array = new Float32Array(positions.count * 3)

  const halfWidth = planeWidth / 2
  const halfHeight = planeHeight / 2

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    const depthFactor = (z + halfHeight) / planeHeight
    const perspectiveScale = 1 + (depthFactor * depthFactor * 2.5)
    const scaledX = x * perspectiveScale
    positions.setX(i, scaledX)

    const scaledWidth = planeWidth * perspectiveScale
    const normalizedX = (scaledX + scaledWidth / 2) / scaledWidth
    const verticalIndex = Math.floor(i / (segX + 1))
    const color = new THREE.Color(colors[verticalIndex % colors.length])

    let alpha = 1
    const fadeWidth = 0.15
    if (normalizedX < fadeWidth) {
      alpha = normalizedX / fadeWidth
    } else if (normalizedX > (1 - fadeWidth)) {
      alpha = (1 - normalizedX) / fadeWidth
    }
    alpha = alpha * alpha * (3 - 2 * alpha)
    colors_array[i * 3] = color.r * alpha
    colors_array[i * 3 + 1] = color.g * alpha
    colors_array[i * 3 + 2] = color.b * alpha
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors_array, 3))

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    opacity: 0.95,
    transparent: true,
    linewidth: 4,
  })

  lineSegments = new THREE.LineSegments(geometry, material)
  scene.add(lineSegments)

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
  if (!positions) return // ✅ added back check

  geometry.computeBoundingBox()
  const bounds = geometry.boundingBox
  if (!bounds) return // ✅ added check for bounding box
  const planeWidth = bounds.max.x - bounds.min.x
  const halfWidth = planeWidth / 2

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    const normalizedX = (x + halfWidth) / planeWidth
    const normalizedZ = (z + 5) / 10

    const wave1 = Math.sin(normalizedX * Math.PI * 2 + time * 1.5) * 0.76
    const wave2 = Math.sin(normalizedX * Math.PI * 3 + normalizedZ * Math.PI * 2 + time * 1.2) * 0.38
    const wave3 = Math.sin(normalizedZ * Math.PI * 4 + time * 0.8) * 0.285

    positions.setY(i, wave1 + wave2 + wave3)
  }

  positions.needsUpdate = true

  camera.position.x = Math.sin(time * 0.1) * 2
  camera.lookAt(0, 0, 0)

  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  const cleanup = initThreeJS()

  onUnmounted(() => {
    if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
    if (cleanup) cleanup()
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
  filter: none;
}

/* Smoother, wider radial blur overlay */
.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
}
</style>
