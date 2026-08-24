<script setup lang="ts">
const days = [
  {
    name: 'Friday_',
    hl: 'htf-hl',
    items: [
      ['6:00 PM', 'Sign-in & mixer'],
      ['7:00 PM', 'Intro & team formation'],
      ['8:00 PM', 'Hacking begins!']
    ]
  },
  {
    name: 'Saturday_',
    hl: 'htf-hl htf-hl--pink',
    items: [
      ['10:00 AM', 'Keynote — Tasha Upchurch: Vibe Coding Your Project'],
      ['12:00 PM', 'Lunch & mentor sessions'],
      ['2:00 PM', 'Keynote — Brad Rowland: Why the Future is HERE'],
      ['6:00 PM', 'Dinner with Trinidad State College']
    ]
  },
  {
    name: 'Sunday_',
    hl: 'htf-hl htf-hl--yellow',
    items: [
      ['11:00 AM', 'Submissions due'],
      ['1:00 PM', 'Demos & judging'],
      ['2:30 PM', 'Awards ceremony']
    ]
  }
]
</script>

<template>
  <div class="slide">
    <h2 class="htf-display htf-display--md rise" style="--d: 0.1s">The weekend_</h2>

    <div class="days">
      <div
        v-for="(day, di) in days"
        :key="day.name"
        class="day rise"
        :style="{ '--d': `${0.25 + di * 0.15}s` }"
      >
        <h3 class="htf-display htf-display--md day__name">
          <span :class="day.hl">{{ day.name }}</span>
        </h3>
        <ul class="day__list">
          <li v-for="[time, what] in day.items" :key="time" class="day__item">
            <span class="day__time">{{ time }}</span>
            <span class="day__what">{{ what }}</span>
          </li>
        </ul>
      </div>
    </div>

    <p class="htf-body note rise" style="--d: 0.85s">
      Borrowed laptops at the front desk. A snack station in the hallway. Mentors on call all
      weekend. Nobody got turned away for not being "technical enough."
    </p>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 3rem);
}

.days {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.5rem, 4vw, 4rem);
}

.day__name {
  margin-bottom: clamp(1rem, 2.5vh, 1.75rem);
}

.day__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.7rem, 1.8vh, 1.2rem);
}

.day__item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  padding-left: 0.9rem;
}

.day__time {
  font-family: var(--htf-font);
  font-weight: 700;
  font-size: clamp(0.7rem, 1vw, 0.85rem);
  letter-spacing: 0.1em;
  color: var(--htf-green);
}

.day__what {
  font-family: var(--htf-font);
  font-weight: 500;
  font-size: clamp(0.8rem, 1.2vw, 1.05rem);
  color: var(--htf-gray);
  line-height: 1.4;
}

.note {
  max-width: 70ch;
  color: rgba(255, 255, 255, 0.55);
}
</style>
