<template>
  <div class="pattern-constellation-wrapper">
    <canvas ref="canvasRef" class="pattern-constellation"></canvas>
    <canvas ref="blurredCanvasRef" class="pattern-constellation-blurred"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePatternGraph } from '@/composables/usePatternGraph'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const blurredCanvasRef = ref<HTMLCanvasElement | null>(null)

const { initCanvas, cleanup } = usePatternGraph(canvasRef, blurredCanvasRef)

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', initCanvas)
})
</script>

<style scoped>
.pattern-constellation-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pattern-constellation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: auto;
  opacity: 1;
  mask-image: linear-gradient(to bottom, 
    transparent 0%, 
    black 30%, 
    black 70%, 
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(to bottom, 
    transparent 0%, 
    black 30%, 
    black 70%, 
    transparent 100%
  );
}

.pattern-constellation-blurred {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  filter: blur(8px);
  mask-image: linear-gradient(to bottom, 
    black 0%, 
    transparent 30%, 
    transparent 70%, 
    black 100%
  );
  -webkit-mask-image: linear-gradient(to bottom, 
    black 0%, 
    transparent 30%, 
    transparent 70%, 
    black 100%
  );
}
</style>
