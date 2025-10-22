# Pattern Language UI - Refactored Architecture

## Overview
This is a modern, New York art gallery-style website for Pattern Language, built with Vue 3, TypeScript, and a clean component-based architecture.

## Project Structure

```
src/
├── assets/
│   └── styles/
│       └── global.css              # Global styles with CSS variables
├── components/
│   ├── layout/
│   │   ├── Navbar.vue             # Fixed navigation bar
│   │   └── Footer.vue             # Site footer with links
│   ├── sections/
│   │   ├── HeroSection.vue        # Hero with typing animation & constellation
│   │   ├── FeaturedPatternsSection.vue  # Pattern grid display
│   │   ├── FeaturedStoriesSection.vue   # Case studies cards
│   │   └── CTASection.vue         # Call-to-action section
│   └── index.ts                   # Component exports
├── composables/
│   ├── useTypingAnimation.ts      # Typing animation logic
│   └── useConstellation.ts        # Canvas constellation animation
├── types/
│   └── index.ts                   # TypeScript interfaces
├── utils/
│   └── data.ts                    # Static data (patterns, case studies)
├── views/
│   └── HomePage.vue               # Main homepage view
├── router/
│   └── index.ts                   # Vue Router configuration
├── App.vue                        # Root component with router-view
└── main.ts                        # Application entry point
```

## Key Design Decisions

### 1. CSS Architecture
- **Global Variables**: All colors, spacing, and transitions defined in CSS custom properties
- **Utility Classes**: Reusable classes for common patterns (`.btn`, `.section`, `.container`, etc.)
- **Semantic Modifiers**: Class extensions (`.btn-lg`, `.btn-light`) for variations
- **Component-Scoped Styles**: Each component has minimal scoped styles, leveraging global utilities

### 2. Component Organization
- **Layout Components**: Persistent UI elements (Navbar, Footer)
- **Section Components**: Content blocks composing pages
- **View Components**: Page-level compositions using sections

### 3. Code Separation
- **Composables**: Reusable reactive logic (typing animation, canvas rendering)
- **Utils**: Pure functions and static data
- **Types**: Centralized TypeScript interfaces

### 4. Styling Philosophy
- Minimal duplication through CSS variables
- Semantic class names
- Consistent spacing and typography scales
- Shared animations and transitions

## CSS Variable Reference

```css
/* Colors */
--color-bg-primary: #fdfbf7
--color-bg-secondary: #f8f6f2
--color-bg-dark: #2a2a2a
--color-text-primary: #2a2a2a
--color-text-secondary: #6a6a6a
--color-text-tertiary: #9a9a9a
--color-accent-1: #e8b4a0
--color-accent-2: #b8d4c8
--color-accent-3: #c9b8e8
--color-accent-warm: #d47b5f

/* Spacing */
--spacing-xs: 0.5rem
--spacing-sm: 1rem
--spacing-md: 2rem
--spacing-lg: 4rem
--spacing-xl: 6rem

/* Layout */
--container-max: 1400px
--container-padding: 4rem
```

## Utility Classes

### Layout
- `.container` - Max-width centered container with padding
- `.section` - Standard section padding (10rem vertical)
- `.section-compact` - Compact section padding (6rem vertical)

### Typography
- `.text-sm` - Small text (0.875rem)
- `.text-xs` - Extra small text (0.75rem)
- `.text-secondary` - Secondary text color
- `.text-tertiary` - Tertiary text color

### Spacing
- `.mt-sm`, `.mb-sm` - Small margin top/bottom
- `.mt-md`, `.mb-md` - Medium margin top/bottom

### Components
- `.btn` - Base button style
- `.btn-lg` - Large button variant
- `.btn-light` - Light-colored button
- `.card` - Card container with hover effect
- `.gradient-bg` - Subtle gradient background

### Effects
- `.section-header` - Section header with gradient border
- `.tag` - Tag/badge style

## Composables Usage

### useTypingAnimation
```typescript
const { currentTypedText, isTyping, startTypingAnimation } = useTypingAnimation()

onMounted(() => {
  startTypingAnimation()
})
```

### useConstellation
```typescript
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { initCanvas, cleanup } = useConstellation(canvasRef)

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', initCanvas)
})
```

## Data Types

### Pattern
```typescript
interface Pattern {
  id: number
  title: string
  description: string
  addresses: string[]
}
```

### CaseStudy
```typescript
interface CaseStudy {
  id: number
  location: string
  color: string
  title: string
  problem: string
  solution: string
  patterns: string[]
}
```

## Adding New Pages

1. Create view component in `src/views/`
2. Add route to `src/router/index.ts`
3. Import and use existing components/sections
4. Leverage global styles and utilities

Example:
```typescript
// router/index.ts
{
  path: '/patterns',
  name: 'patterns',
  component: () => import('@/views/PatternsPage.vue')
}
```

## Animation Patterns

### Border Swirl (buttons)
- Gradient border animation on hover
- 3s infinite loop
- Used via `.btn::before` pseudo-element

### Color Shift (logo)
- Cycles through accent colors
- 8s ease infinite

### Blink (cursor)
- 1.2s on/off cycle
- Applied when typing completes

## Responsive Breakpoints

- **Desktop**: > 1024px (default)
- **Tablet**: ≤ 1024px (container padding: 2rem)
- **Mobile**: ≤ 768px (single column layouts, smaller type)

## Performance Optimizations

1. **Canvas Animation**: Stops after 3 seconds
2. **Scoped Styles**: Minimal CSS per component
3. **Lazy Loading**: Ready for route-based code splitting
4. **CSS Variables**: Single source of truth, efficient updates

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Next Steps / Future Pages

Ready to add:
- `/patterns` - Full pattern library
- `/about` - About page
- `/case-studies` - Expanded stories
- `/community` - Community features
- `/profile` - User profile creation

Each can reuse existing components and styling patterns.
