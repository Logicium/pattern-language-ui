<template>
  <div ref="containerRef" class="lattice-canvas" :class="{ 'is-ready': isReady }">
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
let lineGroup: THREE.Group
let pointMesh: THREE.Points
let baseGeometry: THREE.BufferGeometry
let edgeGeometry: THREE.BufferGeometry
let pointGeometry: THREE.BufferGeometry
let animationFrameId: number | null = null
let time = 0
let cleanupResize: (() => void) | null = null

const palette = [
  new THREE.Color('#e8b4a0'),
  new THREE.Color('#b8d4c8'),
  new THREE.Color('#c9b8e8'),
  new THREE.Color('#d8d8d8'),
]

// Background tone of the hero (matches --color-bg-primary in global.css).
// Edge colors are mixed toward this color as alpha drops, so they vanish into the page rather
// than going black.
const backgroundTone = new THREE.Color('#fdfbf7')

interface Vertex {
  x: number
  y: number
  baseZ: number
  phase: number
  color: THREE.Color
  alpha: number
}

const vertices: Vertex[] = []
const edgeIndexPairs: [number, number][] = []

const initThreeJS = () => {
  if (!containerRef.value) return
  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200)
  // Sit above and behind so the lattice plane recedes into perspective like the ribbon.
  camera.position.set(0, 7, 13)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // Triangular lattice rendered as a wide horizontal strip that recedes into the distance —
  // sized so the left/right edges always fall outside the viewport.
  const cols = 56
  const rows = 26
  const spacingX = 0.7
  const spacingZ = 0.55
  const aspectRatio = width / height
  const xScale = Math.max(1.5, aspectRatio * 1.2)
  const planeWidth = cols * spacingX * xScale
  const planeDepth = rows * spacingZ
  const halfWidth = planeWidth / 2
  const halfDepth = planeDepth / 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2 === 0 ? 0 : spacingX / 2)
      const x = (c - cols / 2) * spacingX * xScale + offsetX * xScale
      // Z runs back into the distance (negative = farther from camera).
      const z = (r - rows / 2) * spacingZ
      const colorIndex = (r + c) % palette.length

      // Ribbon-style soft horizontal falloff at the left/right and front/back ends.
      const fadeWidth = 0.25
      const nx = (x + halfWidth) / planeWidth
      let alphaX = 1
      if (nx < fadeWidth) alphaX = nx / fadeWidth
      else if (nx > 1 - fadeWidth) alphaX = (1 - nx) / fadeWidth
      alphaX = alphaX * alphaX * (3 - 2 * alphaX)

      const fadeDepth = 0.18
      const nz = (z + halfDepth) / planeDepth
      let alphaZ = 1
      if (nz < fadeDepth) alphaZ = nz / fadeDepth
      else if (nz > 1 - fadeDepth) alphaZ = (1 - nz) / fadeDepth
      alphaZ = alphaZ * alphaZ * (3 - 2 * alphaZ)

      vertices.push({
        x,
        y: 0,
        baseZ: z,
        phase: (r + c) * 0.18 + Math.abs(x) * 0.05,
        color: palette[colorIndex]!.clone(),
        alpha: alphaX * alphaZ,
      })
    }
  }

  // Connect each vertex to neighbors (right, down-left, down-right) — yields a triangle mesh.
  const idx = (r: number, c: number) => r * cols + c
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const here = idx(r, c)
      if (c < cols - 1) edgeIndexPairs.push([here, idx(r, c + 1)])
      if (r < rows - 1) {
        if (r % 2 === 0) {
          edgeIndexPairs.push([here, idx(r + 1, c)])
          if (c > 0) edgeIndexPairs.push([here, idx(r + 1, c - 1)])
        } else {
          edgeIndexPairs.push([here, idx(r + 1, c)])
          if (c < cols - 1) edgeIndexPairs.push([here, idx(r + 1, c + 1)])
        }
      }
    }
  }

  baseGeometry = new THREE.BufferGeometry()
  const positionArr = new Float32Array(vertices.length * 3)
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i]!
    positionArr[i * 3] = v.x
    positionArr[i * 3 + 1] = v.y
    positionArr[i * 3 + 2] = v.baseZ
  }
  baseGeometry.setAttribute('position', new THREE.BufferAttribute(positionArr, 3))

  // Edge geometry uses its own position buffer (flat list of vertex pairs).
  edgeGeometry = new THREE.BufferGeometry()
  const edgePositions = new Float32Array(edgeIndexPairs.length * 2 * 3)
  const edgeColors = new Float32Array(edgeIndexPairs.length * 2 * 3)
  edgeGeometry.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3))
  edgeGeometry.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3))

  const edgeMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
  })
  lineGroup = new THREE.Group()
  const lines = new THREE.LineSegments(edgeGeometry, edgeMaterial)
  lineGroup.add(lines)
  scene.add(lineGroup)

  // Point cloud at each vertex for a constellation feel.
  pointGeometry = new THREE.BufferGeometry()
  pointGeometry.setAttribute('position', new THREE.BufferAttribute(positionArr.slice(), 3))
  const pointColors = new Float32Array(vertices.length * 3)
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i]!
    pointColors[i * 3] = backgroundTone.r + (v.color.r - backgroundTone.r) * v.alpha
    pointColors[i * 3 + 1] = backgroundTone.g + (v.color.g - backgroundTone.g) * v.alpha
    pointColors[i * 3 + 2] = backgroundTone.b + (v.color.b - backgroundTone.b) * v.alpha
  }
  pointGeometry.setAttribute('color', new THREE.BufferAttribute(pointColors, 3))
  const pointMaterial = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
  })
  pointMesh = new THREE.Points(pointGeometry, pointMaterial)
  scene.add(pointMesh)

  const handleResize = () => {
    if (!containerRef.value) return
    const w = containerRef.value.clientWidth
    const h = containerRef.value.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', handleResize)
  cleanupResize = () => window.removeEventListener('resize', handleResize)

  isReady.value = true
  animate()
}

const animate = () => {
  if (!baseGeometry || !edgeGeometry) return
  time += 0.008

  const basePositions = baseGeometry.attributes.position as THREE.BufferAttribute
  const pointPositions = pointGeometry.attributes.position as THREE.BufferAttribute
  const edgePositions = edgeGeometry.attributes.position as THREE.BufferAttribute
  const edgeColors = edgeGeometry.attributes.color as THREE.BufferAttribute

  // Lift each vertex on its own phase — wave runs along Y so the strip ripples like a tide.
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i]!
    const wave = Math.sin(time * 1.4 + v.phase) * 0.55
        + Math.sin(time * 0.9 + v.phase * 1.7) * 0.22
    basePositions.setY(i, wave)
    pointPositions.setY(i, wave)
  }
  basePositions.needsUpdate = true
  pointPositions.needsUpdate = true

  // Restream edge buffer with the same per-vertex pre-baked alpha (smooth horizontal/depth fade).
  for (let e = 0; e < edgeIndexPairs.length; e++) {
    const pair = edgeIndexPairs[e]!
    const a = pair[0]
    const b = pair[1]
    const ax = basePositions.getX(a), ay = basePositions.getY(a), az = basePositions.getZ(a)
    const bx = basePositions.getX(b), by = basePositions.getY(b), bz = basePositions.getZ(b)

    edgePositions.setXYZ(e * 2, ax, ay, az)
    edgePositions.setXYZ(e * 2 + 1, bx, by, bz)

    const va = vertices[a]!
    const vb = vertices[b]!
    // Lerp from background tone → vertex color by alpha so falloff blends into the page.
    const arA = backgroundTone.r + (va.color.r - backgroundTone.r) * va.alpha
    const agA = backgroundTone.g + (va.color.g - backgroundTone.g) * va.alpha
    const abA = backgroundTone.b + (va.color.b - backgroundTone.b) * va.alpha
    const arB = backgroundTone.r + (vb.color.r - backgroundTone.r) * vb.alpha
    const agB = backgroundTone.g + (vb.color.g - backgroundTone.g) * vb.alpha
    const abB = backgroundTone.b + (vb.color.b - backgroundTone.b) * vb.alpha
    edgeColors.setXYZ(e * 2, arA, agA, abA)
    edgeColors.setXYZ(e * 2 + 1, arB, agB, abB)
  }
  edgePositions.needsUpdate = true
  edgeColors.needsUpdate = true

  // Subtle horizontal drift only — no vertical sway, to keep the strip flat against the camera.
  camera.position.x = Math.sin(time * 0.1) * 1.2
  camera.lookAt(0, 0, 0)

  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  initThreeJS()
})

onUnmounted(() => {
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
  if (cleanupResize) cleanupResize()
  if (baseGeometry) baseGeometry.dispose()
  if (edgeGeometry) edgeGeometry.dispose()
  if (pointGeometry) pointGeometry.dispose()
  if (pointMesh) (pointMesh.material as THREE.Material).dispose()
  if (renderer) {
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }
})
</script>

<style scoped>
.lattice-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  pointer-events: none;
  overflow: hidden;
}

.lattice-canvas.is-ready { opacity: 1; }

.lattice-canvas :deep(canvas) { display: block; }

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
}
</style>
