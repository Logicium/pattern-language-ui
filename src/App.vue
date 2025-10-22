<template>
  <div class="home-page">
    <!-- Navigation -->
    <nav class="nav-bar">
      <div class="nav-container">
        <div class="logo">PATTERN_LANGUAGE.AI</div>
        <div class="nav-links">
          <a href="#about">About</a>
          <a href="#patterns">Patterns</a>
          <a href="#case-studies">Stories</a>
          <button class="btn-minimal">Start</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Building Thriving<br>Rural Communities
          </h1>
          <div class="typing-container">
            <span class="typed-text">{{ currentTypedText }}</span>
            <span class="cursor" :class="{ blinking: !isTyping }"></span>
          </div>
        </div>

        <div class="hero-description">
          <p>
            A collaborative tool empowering rural communities<br>
            to design, plan, and implement innovative solutions<br>
            to complex challenges.
          </p>
        </div>
      </div>

      <div class="hero-interactive">
        <canvas ref="constellationCanvas" class="pattern-constellation"></canvas>
      </div>

      <button class="floating-cta">Explore</button>
    </section>

    <!-- Patterns Section -->
    <section class="patterns-section">
      <div class="section-header">
        <span class="section-number">01</span>
        <h2 class="section-title">Featured Patterns</h2>
      </div>

      <div class="patterns-grid">
        <div
            v-for="(pattern, index) in highlightedPatterns"
            :key="pattern.id"
            class="pattern-item"
        >
          <div class="pattern-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="pattern-content">
            <h3>{{ pattern.title }}</h3>
            <p>{{ pattern.description }}</p>
            <div class="pattern-meta">
              <span v-for="addr in pattern.addresses" :key="addr">
                {{ addr }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Case Studies Section -->
    <section class="case-studies-section">
      <div class="section-header">
        <span class="section-number">02</span>
        <h2 class="section-title">Success Stories</h2>
      </div>

      <div class="studies-container">
        <div
            v-for="study in caseStudies"
            :key="study.id"
            class="study-card"
        >
          <div class="study-visual" :style="{ backgroundColor: study.color }">
            <div class="study-location">{{ study.location }}</div>
          </div>
          <div class="study-content">
            <h3>{{ study.title }}</h3>
            <div class="study-section">
              <span class="study-label">Challenge</span>
              <p>{{ study.problem }}</p>
            </div>
            <div class="study-section">
              <span class="study-label">Solution</span>
              <p>{{ study.solution }}</p>
            </div>
            <div class="study-patterns">
              <span v-for="p in study.patterns" :key="p">{{ p }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Ready to transform<br>your community?</h2>
        <button class="cta-button">Create Profile</button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-brand">PatternLanguage.ai</div>
          <p>Community-led regeneration<br>for rural America</p>
        </div>
        <div class="footer-col">
          <span class="footer-title">Resources</span>
          <a href="#">Pattern Library</a>
          <a href="#">Workshop Guide</a>
          <a href="#">Documentation</a>
        </div>
        <div class="footer-col">
          <span class="footer-title">Community</span>
          <a href="#">Network</a>
          <a href="#">Events</a>
          <a href="#">Support</a>
        </div>
        <div class="footer-col">
          <span class="footer-title">Contact</span>
          <a href="#">hello@patternlanguage.ai</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 PatternLanguage.ai</span>
        <span>Inspired by Christopher Alexander & Emergent Campus</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Canvas reference
const constellationCanvas = ref<HTMLCanvasElement | null>(null)

// Typing animation
const typingPhrases = [
  "create affordable housing for returning youth?",
  "revive our downtown with local makers?",
  "build a community learning hub?",
  "turn heritage into sustainable income?",
  "establish a timebank for local services?",
  "develop a regenerative food system?"
]

const currentTypedText = ref('')
const isTyping = ref(true)
let currentPhraseIndex = 0
let currentCharIndex = 0

// Constellation data
interface Node {
  x: number
  y: number
  targetX: number
  targetY: number
  label: string
  opacity: number
}

const nodes: Node[] = [
  { x: 0, y: 0, targetX: 0.15, targetY: 0.25, label: 'Anchor', opacity: 0 },
  { x: 0, y: 0, targetX: 0.45, targetY: 0.15, label: 'Youth', opacity: 0 },
  { x: 0, y: 0, targetX: 0.75, targetY: 0.30, label: 'Learning', opacity: 0 },
  { x: 0, y: 0, targetX: 0.25, targetY: 0.65, label: 'Creative', opacity: 0 },
  { x: 0, y: 0, targetX: 0.65, targetY: 0.60, label: 'Digital', opacity: 0 },
  { x: 0, y: 0, targetX: 0.85, targetY: 0.80, label: 'Timebank', opacity: 0 }
]

const connections = [
  [0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [4, 5]
]

let animationFrame: number | null = null
let startTime = 0

// Canvas constellation animation
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

    if (progress > 0 && nodes[i].opacity > 0 && nodes[j].opacity > 0) {
      const opacity = Math.min(progress, 0.25)
      ctx.globalAlpha = opacity

      ctx.beginPath()
      ctx.moveTo(nodes[i].x * rect.width, nodes[i].y * rect.height)
      ctx.lineTo(nodes[j].x * rect.width, nodes[j].y * rect.height)
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
      ctx.letterSpacing = '0.05em'
      ctx.fillText(node.label, node.x * rect.width, node.y * rect.height + 20)
    }
  })

  // Continue animation for first 3 seconds, then stop
  if (elapsed < 3000) {
    animationFrame = requestAnimationFrame((ts) => drawConstellation(canvas, ts))
  }
}

const initCanvas = () => {
  if (constellationCanvas.value) {
    startTime = 0
    nodes.forEach(node => {
      node.x = 0
      node.y = 0
      node.opacity = 0
    })
    animationFrame = requestAnimationFrame((ts) => drawConstellation(constellationCanvas.value!, ts))
  }
}

// Typing animation - simplified approach
const typePhrase = () => {
  const currentPhrase = typingPhrases[currentPhraseIndex]

  if (currentCharIndex <= currentPhrase.length) {
    currentTypedText.value = currentPhrase.substring(0, currentCharIndex)
    currentCharIndex++
    isTyping.value = true

    if (currentCharIndex <= currentPhrase.length) {
      setTimeout(typePhrase, 60)
    } else {
      // Finished typing, pause then reset
      isTyping.value = false
      setTimeout(() => {
        currentCharIndex = 0
        currentPhraseIndex = (currentPhraseIndex + 1) % typingPhrases.length
        typePhrase()
      }, 2500)
    }
  }
}

const startTypingAnimation = () => {
  typePhrase()
}

onMounted(() => {
  startTypingAnimation()
  initCanvas()

  // Handle resize
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  window.removeEventListener('resize', initCanvas)
})

const highlightedPatterns = [
  {
    id: 1,
    title: 'Community Anchor Point',
    description: 'A welcoming, multipurpose hub where everything connects—programs, people, and possibility.',
    addresses: ['Isolation', 'Fragmentation', 'Low Trust']
  },
  {
    id: 2,
    title: 'Youth Return Pathway',
    description: 'Clear, welcoming routes for young people to come home and thrive with purpose.',
    addresses: ['Talent Drain', 'Aging Population']
  },
  {
    id: 3,
    title: 'Creative Workyards',
    description: 'Shared spaces for making, learning, and building creative enterprises.',
    addresses: ['Economic Stagnation', 'Underused Assets']
  },
  {
    id: 4,
    title: 'Digital Root System',
    description: 'Community-led broadband as the backbone for modern rural life and opportunity.',
    addresses: ['Infrastructure Decay', 'Skills Gap']
  },
  {
    id: 5,
    title: 'Social Timebank',
    description: 'A circular system where time and skills count alongside money.',
    addresses: ['Low Civic Trust', 'Civic Apathy']
  },
  {
    id: 6,
    title: 'Village Learning Hub',
    description: 'Flexible, local learning for all ages—from certifications to creative skills.',
    addresses: ['Skills Gap', 'Generational Poverty']
  }
]

const caseStudies = [
  {
    id: 1,
    location: 'Trinidad, Colorado',
    color: '#e8b4a0',
    title: 'From Ghost Town to Creative Hub',
    problem: 'Downtown vacancy, youth flight, and declining population left the historic main street empty.',
    solution: 'Emergent Campus created a mixed-use community anchor with coworking, youth programs, and cultural activation.',
    patterns: ['Community Anchor', 'Creative Workyards', 'Main Street']
  },
  {
    id: 2,
    location: 'Rural Nebraska',
    color: '#b8d4c8',
    title: 'School Building Becomes Community Center',
    problem: 'Closed school left a gap in community gathering space and youth programming.',
    solution: 'Multi-use resource center with workforce training, library services, and civic hub.',
    patterns: ['Anchor Point', 'Learning Hub', 'Micro-Credential']
  },
  {
    id: 3,
    location: 'Eastern Oregon',
    color: '#c9b8e8',
    title: 'Mobile Anchor Reaches Remote Residents',
    problem: 'Distance and transportation barriers prevented residents from accessing services.',
    solution: 'Converted bus as mobile community center bringing programs to isolated areas.',
    patterns: ['Anchor Point', 'Mobility Hubs', 'Digital Literacy']
  }
]
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.home-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fdfbf7;
  color: #2a2a2a;
  font-weight: 300;
  letter-spacing: -0.01em;
}

/* Navigation */
.nav-bar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(253, 251, 247, 0.8);
  backdrop-filter: blur(20px);
  z-index: 1000;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  color: #e8b4a0;
  animation: colorShift 8s ease infinite;
}

@keyframes colorShift {
  0%, 100% { color: #e8b4a0; }
  33% { color: #b8d4c8; }
  66% { color: #c9b8e8; }
}

.nav-links {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.nav-links a {
  color: #6a6a6a;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.02em;
  transition: color 0.4s ease;
}

.nav-links a:hover {
  color: #2a2a2a;
}

.btn-minimal {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #2a2a2a;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  z-index: 1;
}

.btn-minimal::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, #e8b4a0, #b8d4c8, #c9b8e8, #e8b4a0);
  background-size: 300% 100%;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
  animation: borderSwirl 3s linear infinite;
}

.btn-minimal:hover::before {
  opacity: 1;
}

.btn-minimal:hover {
  color: #fdfbf7;
  border-color: transparent;
}

@keyframes borderSwirl {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

/* Hero Section */
.hero {
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 4rem 3rem;
  position: relative;
  background: linear-gradient(135deg,
  rgba(232, 180, 160, 0.03) 0%,
  rgba(184, 212, 200, 0.03) 50%,
  rgba(201, 184, 232, 0.03) 100%);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 200;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #2a2a2a;
  margin-bottom: 2rem;
}

.typing-container {
  font-size: 1.125rem;
  color: #d47b5f;
  font-weight: 300;
  min-height: 40px;
  letter-spacing: -0.01em;
  padding: 1rem 1.5rem;
  background: rgba(232, 180, 160, 0.08);
  border-left: 2px solid #e8b4a0;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.125rem;
  background: #d47b5f;
  margin-left: 4px;
  vertical-align: middle;
}

.cursor.blinking {
  animation: blink 1.2s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.hero-description {
  display: flex;
  align-items: flex-end;
}

.hero-description p {
  font-size: 1rem;
  line-height: 1.8;
  color: #6a6a6a;
  font-weight: 300;
}

/* Interactive Constellation */
.hero-interactive {
  height: 280px;
  position: relative;
  margin-top: 2rem;
}

.pattern-constellation {
  width: 100%;
  height: 100%;
  display: block;
}

.floating-cta {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: absolute;
  bottom: 3rem;
  right: 4rem;
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #2a2a2a;
  padding: 0.875rem 1.75rem;
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.4s ease;
  z-index: 1;
}

.floating-cta::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, #e8b4a0, #b8d4c8, #c9b8e8, #e8b4a0);
  background-size: 300% 100%;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
  animation: borderSwirl 3s linear infinite;
}

.floating-cta:hover::before {
  opacity: 1;
}

.floating-cta:hover {
  color: #fdfbf7;
  border-color: transparent;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: baseline;
  gap: 2rem;
  margin-bottom: 4rem;
  padding: 0 0 1rem 0;
  position: relative;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, #e8b4a0, #b8d4c8, #c9b8e8) 1;
}

.section-number {
  font-size: 0.875rem;
  color: #6a6a6a;
  font-weight: 300;
  letter-spacing: 0.1em;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 200;
  letter-spacing: -0.02em;
  color: #2a2a2a;
}

/* Patterns Section */
.patterns-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10rem 4rem;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: rgba(42, 42, 42, 0.1);
  border: 1px solid rgba(42, 42, 42, 0.1);
}

.pattern-item {
  background: #fdfbf7;
  padding: 3rem;
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 2rem;
  transition: all 0.4s ease;
  position: relative;
}

.pattern-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 0;
  transition: height 0.4s ease;
}

.pattern-item:nth-child(6n+1)::before { background: #e8b4a0; }
.pattern-item:nth-child(6n+2)::before { background: #b8d4c8; }
.pattern-item:nth-child(6n+3)::before { background: #c9b8e8; }
.pattern-item:nth-child(6n+4)::before { background: #e8b4a0; }
.pattern-item:nth-child(6n+5)::before { background: #b8d4c8; }
.pattern-item:nth-child(6n+6)::before { background: #c9b8e8; }

.pattern-item:hover {
  background: #f8f6f2;
}

.pattern-item:hover::before {
  height: 100%;
}

.pattern-number {
  font-size: 0.875rem;
  color: #6a6a6a;
  font-weight: 300;
  padding-top: 0.25rem;
}

.pattern-content h3 {
  font-size: 1.25rem;
  font-weight: 300;
  margin-bottom: 1rem;
  color: #2a2a2a;
  letter-spacing: -0.01em;
}

.pattern-content p {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #6a6a6a;
  margin-bottom: 1.5rem;
  font-weight: 300;
}

.pattern-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pattern-meta span {
  font-size: 0.75rem;
  color: #6a6a6a;
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  font-weight: 300;
  transition: all 0.3s ease;
}

.pattern-item:nth-child(6n+1) .pattern-meta span {
  background: rgba(232, 180, 160, 0.1);
  border-color: #e8b4a0;
}
.pattern-item:nth-child(6n+2) .pattern-meta span {
  background: rgba(184, 212, 200, 0.1);
  border-color: #b8d4c8;
}
.pattern-item:nth-child(6n+3) .pattern-meta span {
  background: rgba(201, 184, 232, 0.1);
  border-color: #c9b8e8;
}
.pattern-item:nth-child(6n+4) .pattern-meta span {
  background: rgba(232, 180, 160, 0.1);
  border-color: #e8b4a0;
}
.pattern-item:nth-child(6n+5) .pattern-meta span {
  background: rgba(184, 212, 200, 0.1);
  border-color: #b8d4c8;
}
.pattern-item:nth-child(6n+6) .pattern-meta span {
  background: rgba(201, 184, 232, 0.1);
  border-color: #c9b8e8;
}

/* Case Studies */
.case-studies-section {
  background: #f8f6f2;
  padding: 10rem 4rem;
}

.studies-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.study-card {
  background: #fdfbf7;
  overflow: hidden;
  transition: transform 0.4s ease;
}

.study-card:hover {
  transform: translateY(-8px);
}

.study-visual {
  height: 280px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 2rem;
}

.study-location {
  font-size: 0.8125rem;
  font-weight: 300;
  color: #2a2a2a;
  letter-spacing: 0.08em;
  background: rgba(253, 251, 247, 0.95);
  padding: 0.5rem 1rem;
  backdrop-filter: blur(10px);
}

.study-content {
  padding: 2.5rem;
}

.study-content h3 {
  font-size: 1.25rem;
  font-weight: 300;
  margin-bottom: 2rem;
  color: #2a2a2a;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.study-section {
  margin-bottom: 1.5rem;
}

.study-label {
  display: block;
  font-size: 0.75rem;
  color: #9a9a9a;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  font-weight: 300;
}

.study-section p {
  font-size: 0.875rem;
  line-height: 1.7;
  color: #6a6a6a;
  font-weight: 300;
}

.study-patterns {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.study-patterns span {
  font-size: 0.6875rem;
  color: #6a6a6a;
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  font-weight: 300;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
  padding: 12rem 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
  transparent 0%,
  #e8b4a0 25%,
  #b8d4c8 50%,
  #c9b8e8 75%,
  transparent 100%);
}

.cta-content {
  text-align: center;
}

.cta-content h2 {
  font-size: 3.5rem;
  font-weight: 200;
  color: #fdfbf7;
  margin-bottom: 3rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.cta-button {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: transparent;
  border: 1px solid #fdfbf7;
  color: #fdfbf7;
  padding: 1rem 2.5rem;
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  z-index: 1;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, #e8b4a0, #b8d4c8, #c9b8e8, #e8b4a0);
  background-size: 300% 100%;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
  animation: borderSwirl 3s linear infinite;
}

.cta-button:hover::before {
  opacity: 1;
}

.cta-button:hover {
  color: #fdfbf7;
  border-color: transparent;
  box-shadow: 0 0 30px rgba(184, 212, 200, 0.3);
}

/* Footer */
.footer {
  background: #fdfbf7;
  padding: 6rem 4rem 3rem;
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 4rem;
  right: 4rem;
  height: 1px;
  background: linear-gradient(90deg,
  #e8b4a0 0%,
  #b8d4c8 50%,
  #c9b8e8 100%);
}

.footer-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.footer-brand {
  font-size: 0.95rem;
  font-weight: 300;
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
}

.footer-col p {
  font-size: 0.875rem;
  line-height: 1.7;
  color: #6a6a6a;
  font-weight: 300;
}

.footer-title {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: #9a9a9a;
  margin-bottom: 1.25rem;
  font-weight: 300;
}

.footer-col a {
  display: block;
  color: #6a6a6a;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  font-weight: 300;
  transition: color 0.4s ease;
}

.footer-col a:hover {
  color: #2a2a2a;
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 3rem;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9a9a9a;
  font-weight: 300;
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-container,
  .hero,
  .patterns-section {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 4rem;
  }

  .hero-title {
    font-size: 3.5rem;
  }

  .patterns-grid {
    grid-template-columns: 1fr;
  }

  .studies-container {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-content h2 {
    font-size: 2.5rem;
  }
}
</style>