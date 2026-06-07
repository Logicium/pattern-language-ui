<template>
  <div ref="containerRef" class="orbit-canvas" :class="{ 'is-ready': isReady }">
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
let ringGroup: THREE.Group
let animationFrameId: number | null = null
let time = 0
let cleanupResize: (() => void) | null = null

interface OrbitRing {
  group: THREE.Group
  speed: number
  baseRotation: number
  nodes: THREE.Mesh[]
  edge: THREE.Line
  nodeMaterials: THREE.MeshBasicMaterial[]
}

const rings: OrbitRing[] = []

const colors = [
  new THREE.Color('#e8b4a0'),
  new THREE.Color('#b8d4c8'),
  new THREE.Color('#c9b8e8'),
  new THREE.Color('#d47b5f'),
]

const initThreeJS = () => {
  if (!containerRef.value) return
  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
  camera.position.set(0, 0, 18)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  ringGroup = new THREE.Group()
  ringGroup.rotation.x = Math.PI * 0.18
  scene.add(ringGroup)

  // Build 4 concentric rings of varying radii, node counts, tilts and rotation speeds.
  const ringSpecs = [
    { radius: 2.5, nodes: 7, speed: 0.18, tilt: 0.0 },
    { radius: 4.8, nodes: 12, speed: -0.11, tilt: 0.25 },
    { radius: 7.2, nodes: 18, speed: 0.07, tilt: -0.18 },
    { radius: 9.8, nodes: 26, speed: -0.04, tilt: 0.1 },
  ]

  ringSpecs.forEach((spec, ringIdx) => {
    const g = new THREE.Group()
    g.rotation.z = spec.tilt
    ringGroup.add(g)

    const nodes: THREE.Mesh[] = []
    const nodeMaterials: THREE.MeshBasicMaterial[] = []
    const linePoints: THREE.Vector3[] = []

    for (let i = 0; i < spec.nodes; i++) {
      const angle = (i / spec.nodes) * Math.PI * 2
      const x = Math.cos(angle) * spec.radius
      const y = Math.sin(angle) * spec.radius

      const nodeSize = ringIdx === 0 ? 0.18 : ringIdx === 1 ? 0.13 : 0.09
      const geom = new THREE.SphereGeometry(nodeSize, 12, 12)
      const color = colors[(ringIdx + i) % colors.length]!
      const mat = new THREE.MeshBasicMaterial({
        color: color.clone(),
        transparent: true,
        opacity: 0.95,
      })
      const node = new THREE.Mesh(geom, mat)
      node.position.set(x, y, 0)
      g.add(node)
      nodes.push(node)
      nodeMaterials.push(mat)
      linePoints.push(new THREE.Vector3(x, y, 0))
    }

    // Close the ring loop.
    linePoints.push(linePoints[0]!.clone())

    const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.18,
    })
    const edge = new THREE.Line(lineGeom, lineMat)
    g.add(edge)

    rings.push({
      group: g,
      speed: spec.speed,
      baseRotation: Math.random() * Math.PI * 2,
      nodes,
      edge,
      nodeMaterials,
    })
  })

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
  time += 0.01

  for (const ring of rings) {
    ring.group.rotation.z = ring.baseRotation + time * ring.speed
    // Subtle node pulse opacity.
    for (let i = 0; i < ring.nodeMaterials.length; i++) {
      const mat = ring.nodeMaterials[i]!
      mat.opacity = 0.6 + 0.35 * (0.5 + 0.5 * Math.sin(time * 1.5 + i * 0.7))
    }
  }

  // Whole field gentle tilt and breathe.
  ringGroup.rotation.y = Math.sin(time * 0.15) * 0.18
  ringGroup.rotation.x = 0.18 + Math.sin(time * 0.1) * 0.05

  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  initThreeJS()
})

onUnmounted(() => {
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
  if (cleanupResize) cleanupResize()
  for (const ring of rings) {
    ring.nodes.forEach((n) => {
      n.geometry.dispose()
      ;(n.material as THREE.Material).dispose()
    })
    ring.edge.geometry.dispose()
    ;(ring.edge.material as THREE.Material).dispose()
  }
  if (renderer) {
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }
})
</script>

<style scoped>
.orbit-canvas {
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

.orbit-canvas.is-ready { opacity: 1; }

.orbit-canvas :deep(canvas) { display: block; }

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
  mask-image: radial-gradient(ellipse at center, black 22%, transparent 82%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 22%, transparent 82%);
}
</style>
