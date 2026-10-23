<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** Only while the game has the screen; the ordinary pointer returns outside it. */
const props = defineProps<{ active: boolean }>()

/**
 * A dot and a ring, blended by difference so they read on every field.
 * The ring lags the pointer and grows over anything clickable; elements
 * with `data-cursor` hand it a word to carry. Switches on at the first real
 * mouse movement rather than trusting a media query, because some embedded
 * browsers report a coarse pointer for a desktop mouse. Same grammar as the
 * studio's other sites.
 */
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const label = ref('')
const hot = ref(false)
const down = ref(false)
const on = ref(false)
let raf = 0
let x = -100
let y = -100
let rx = -100
let ry = -100

const activate = () => {
  if (on.value) return
  on.value = true
  document.body.classList.add('no-cursor')
  raf = requestAnimationFrame(tick)
}

const deactivate = () => {
  on.value = false
  cancelAnimationFrame(raf)
  document.body.classList.remove('no-cursor')
}

const move = (e: PointerEvent) => {
  if (e.pointerType === 'touch' || !props.active) {
    if (on.value) deactivate()
    return
  }
  activate()
  x = e.clientX
  y = e.clientY
  const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('a, button, [data-cursor], .nlabel')
  hot.value = !!t && !(t as HTMLButtonElement).disabled
  label.value = t?.dataset.cursor ?? ''
}
const press = () => (down.value = true)
const release = () => (down.value = false)

const tick = () => {
  rx += (x - rx) * 0.16
  ry += (y - ry) * 0.16
  if (dot.value) dot.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
  if (ring.value) ring.value.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
  raf = requestAnimationFrame(tick)
}

watch(
  () => props.active,
  (a) => {
    if (!a) deactivate()
    else if (window.matchMedia('(pointer: fine)').matches) activate()
  }
)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', press, { passive: true })
  window.addEventListener('pointerup', release, { passive: true })
  if (props.active && window.matchMedia('(pointer: fine)').matches) activate()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', move)
  window.removeEventListener('pointerdown', press)
  window.removeEventListener('pointerup', release)
  deactivate()
})
</script>

<template>
  <div v-if="on" class="cursor" aria-hidden="true">
    <div ref="dot" class="dot" :class="{ down }"></div>
    <div ref="ring" class="ring" :class="{ hot, down, labelled: !!label }">
      <span class="word">{{ label }}</span>
    </div>
  </div>
</template>

<style>
body.no-cursor,
body.no-cursor * {
  cursor: none !important;
}
</style>

<style scoped>
.cursor {
  position: fixed;
  inset: 0;
  z-index: 200;
  pointer-events: none;
  mix-blend-mode: difference;
  color: #fff;
}
.dot,
.ring {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  will-change: transform;
}
.dot {
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  background: currentColor;
  transition: transform 0.2s ease;
}
.ring {
  width: 38px;
  height: 38px;
  margin: -19px 0 0 -19px;
  border: 1.5px solid currentColor;
  display: grid;
  place-items: center;
  transition:
    width 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    margin 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease;
}
.ring.hot {
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
}
.ring.down {
  width: 28px;
  height: 28px;
  margin: -14px 0 0 -14px;
}
.ring.labelled {
  width: 92px;
  height: 92px;
  margin: -46px 0 0 -46px;
  background: currentColor;
}
.word {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #000;
  opacity: 0;
  transition: opacity 0.4s;
}
.labelled .word {
  opacity: 1;
}
</style>
