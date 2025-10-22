<template>
  <div class="about-page">
    <Navbar />
    
    <!-- Hero -->
    <section class="about-hero gradient-bg">
      <div class="container">
        <h1 class="hero-title">Building Tools for<br>Rural Regeneration</h1>
        <p class="hero-subtitle text-secondary">
          Inspired by Christopher Alexander's pattern language and<br>
          forged in the real work of rural community development.
        </p>
      </div>
    </section>

    <!-- Mission -->
    <section class="section mission-section">
      <div class="container">
        <div class="mission-grid">
          <div class="mission-text">
            <span class="label text-xs text-tertiary">Our Mission</span>
            <h2 class="section-title">Empowering Communities<br>to Shape Their Future</h2>
          </div>
          <div class="mission-content">
            <p class="text-secondary">
              PatternLanguage.ai is a collaborative tool that helps rural communities design, 
              plan, and implement innovative solutions to complex challenges. We believe that 
              local wisdom, paired with thoughtful structure, can unlock thriving futures.
            </p>
            <p class="text-secondary">
              Born from work at Emergent Campus in Trinidad, Colorado, this platform makes the 
              methodology of pattern languages accessible to any community ready to build 
              resilience, opportunity, and belonging.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Principles -->
    <section class="section principles-section">
      <div class="container">
        <h2 class="section-title mb-md">How We Work</h2>
        <div class="principles-grid">
          <div v-for="principle in principles" :key="principle.id" class="principle-card">
            <div class="principle-number text-xs text-tertiary">
              {{ String(principle.id).padStart(2, '0') }}
            </div>
            <h3>{{ principle.title }}</h3>
            <p class="text-sm text-secondary">{{ principle.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="section team-section">
      <div class="container">
        <div class="section-header">
          <span class="section-number">Team</span>
          <h2 class="section-title">Who We Are</h2>
        </div>
        <div class="team-grid">
          <div v-for="member in team" :key="member.id" class="team-card">
            <div class="team-avatar"></div>
            <h3>{{ member.name }}</h3>
            <span class="team-role text-xs text-tertiary">{{ member.role }}</span>
            <p class="text-sm text-secondary">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Inspiration -->
    <section class="section inspiration-section">
      <div class="container inspiration-content">
        <div class="inspiration-text">
          <span class="label text-xs text-tertiary">Inspiration</span>
          <h2 class="section-title">Standing on Shoulders</h2>
          <p class="text-secondary">
            This work builds on Christopher Alexander's <em>A Pattern Language</em>—a way of 
            capturing design wisdom as modular, combinable patterns. We've adapted his methodology 
            for rural revitalization, blending it with contemporary practices in self-management, 
            open systems, and community-led development.
          </p>
          <p class="text-secondary">
            From Emergent Campus to the Game of Values workshops, we've learned that when 
            communities embody their values and use them as filters, decisions become clearer 
            and momentum builds.
          </p>
        </div>
        <div class="inspiration-visual">
          <div class="quote-block">
            <p class="quote-text">
              "A pattern language gives each person who uses it the power to create an 
              infinite variety of new and unique buildings, just as their language gives them 
              the power to create an infinite variety of sentences."
            </p>
            <span class="quote-author text-xs text-tertiary">— Christopher Alexander</span>
          </div>
        </div>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Navbar, Footer, CTASection } from '@/components'
import { teamMembers, principles } from '@/utils/data'

const team = teamMembers
</script>

<style scoped>
.about-page {
  min-height: 100vh;
}

.about-hero {
  padding: 12rem var(--container-padding) 8rem;
  text-align: center;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.8;
}

.mission-section {
  background: var(--color-bg-primary);
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 6rem;
  align-items: start;
}

.label {
  display: block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.mission-content p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.mission-content p:last-child {
  margin-bottom: 0;
}

.principles-section {
  background: var(--color-bg-secondary);
}

.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
}

.principle-card {
  padding: 3rem;
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-1);
  transition: all var(--transition-base);
}

.principle-card:nth-child(2) {
  border-left-color: var(--color-accent-2);
}

.principle-card:nth-child(3) {
  border-left-color: var(--color-accent-3);
}

.principle-card:nth-child(4) {
  border-left-color: var(--color-accent-1);
}

.principle-card:hover {
  transform: translateX(8px);
}

.principle-number {
  display: block;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
}

.principle-card h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.principle-card p {
  line-height: 1.7;
}

.team-section {
  background: var(--color-bg-primary);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4rem;
}

.team-card {
  text-align: center;
}

.team-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
  margin: 0 auto 2rem;
}

.team-card h3 {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 0.5rem;
}

.team-role {
  display: block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.team-card p {
  line-height: 1.7;
}

.inspiration-section {
  background: var(--color-bg-secondary);
}

.inspiration-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
}

.inspiration-text p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.inspiration-text em {
  font-style: italic;
  color: var(--color-text-primary);
}

.quote-block {
  padding: 3rem;
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-3);
}

.quote-text {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-text-primary);
  font-style: italic;
  margin-bottom: 2rem;
}

.quote-author {
  display: block;
  letter-spacing: 0.1em;
}

@media (max-width: 1024px) {
  .mission-grid,
  .inspiration-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .principles-grid,
  .team-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .about-hero {
    padding: 10rem var(--container-padding) 6rem;
  }
}
</style>
