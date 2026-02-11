# Pattern Language UI - Code Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring strategy for the Pattern Language UI codebase. The current implementation is functional but suffers from significant code duplication, oversized files, and lack of reusable components. This plan focuses on creating a maintainable, DRY (Don't Repeat Yourself) architecture without changing any existing functionality.

## Current State Analysis

### File Size Issues

**Critical Files (>1000 lines):**
- `FullPlaybookPage.vue` - **1,965 lines** (template: 600+, script: 600+, styles: 1039)

**Large Files (600-800 lines):**
- `ResourcesPage.vue` - 812 lines (styles: 530)
- `SignupPage.vue` - 716 lines
- `GeneratedStoryPage.vue` - 718 lines (styles: 375)
- `ChatPage.vue` - 696 lines (styles: 472)
- `DashboardStoriesPage.vue` - 615 lines (styles: 407)

**Medium Files (400-600 lines):**
- `ProfileEditPage.vue` - 495 lines (styles: 247)
- `FullStoryPage.vue` - 494 lines
- `PatternsPage.vue` - 419 lines
- `FullPatternPage.vue` - 414 lines
- `PlaybooksPage.vue` - 406 lines (styles: 260)

### Key Problems Identified

1. **Massive Style Duplication**: Repeated CSS patterns across 100+ files
2. **Component Logic Duplication**: Form handling, modal management, CRUD operations
3. **UI Pattern Repetition**: Headers, cards, tabs, badges, status indicators
4. **State Management Repetition**: Loading states, error handling, form validation
5. **Utility Function Duplication**: Date formatting, name parsing, URL handling

## Refactoring Strategy

### Phase 1: Shared Styles & Design System

#### 1.1 Audit of Existing Global Styles
**Location**: `src/assets/styles/global.css`

**Already Available (DO NOT DUPLICATE):**
- ✅ CSS Variables (colors, typography, spacing, transitions)
- ✅ Typography base styles (h1-h6)
- ✅ Text utilities: `.text-xs`, `.text-sm`, `.text-secondary`, `.text-tertiary`
- ✅ Base button (`.btn`, `.btn-lg`) with border swirl animation
- ✅ Container (`.container`)
- ✅ Section spacing (`.section`, `.section-compact`)
- ✅ Gradient background (`.gradient-bg`)
- ✅ Card base (`.card`)
- ✅ Basic spacing utilities (`.mt-sm`, `.mt-md`, `.mb-sm`, `.mb-md`)
- ✅ Section headers (`.section-header`, `.section-number`, `.section-title`)
- ✅ Story/image overlay system (`.color-overlay`, `.story-image`, etc.)

**What's MISSING (Need to Create):**

#### 1.2 New Style Files to Create

##### `buttons.css` - Button Variants
**Location**: `src/assets/styles/buttons.css`

```css
/* Button Variants - Repeated in 12+ files */
.btn-secondary {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  transition: color var(--transition-fast);
}

.btn-text:hover {
  color: var(--color-text-primary);
}

.btn-text:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger,
.btn-secondary.btn-danger {
  border-color: rgba(232, 180, 160, 0.3);
  color: var(--color-accent-warm);
}

.btn-danger:hover,
.btn-secondary.btn-danger:hover {
  border-color: var(--color-accent-1);
  background: rgba(232, 180, 160, 0.05);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Action buttons for cards */
.action-btn-primary {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
  text-decoration: none;
  display: inline-block;
  font-size: 0.875rem;
  transition: all var(--transition-base);
  text-align: center;
}

.action-btn-primary:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.action-btn-secondary {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  transition: all var(--transition-base);
  cursor: pointer;
}

.action-btn-secondary:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}
```

**Eliminates:** ~500 lines of duplicated button styles across 12+ files

---

##### `forms.css` - Form Elements
**Location**: `src/assets/styles/forms.css`

```css
/* Form Groups and Labels */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Form Inputs - Repeated in 15+ files */
.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-family);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  transition: border-color var(--transition-base);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-bg-secondary);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-top: 0.5rem;
}

/* Form Errors */
.form-error {
  color: var(--color-accent-warm);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Search Inputs */
.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  font-family: var(--font-family);
  font-size: 0.875rem;
  transition: border-color var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
}
```

**Eliminates:** ~600 lines of duplicated form styles across 15+ files

---

##### `layouts.css` - Page & Section Layouts
**Location**: `src/assets/styles/layouts.css`

```css
/* Page Headers - Repeated in 8+ files */
.page-header {
  padding: 4rem 0;
  background: var(--color-bg-secondary);
}

.page-header .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.page-title {
  font-size: 3rem;
  font-weight: var(--font-weight-light);
  margin: 0;
  letter-spacing: -0.02em;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-text {
  flex: 1;
}

/* Content Sections */
.page-content {
  padding: 6rem 0;
}

.content-layout {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.content-block {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-subtitle {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  margin: 0;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.block-header .section-subtitle {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Two Column Layout */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 4rem;
  align-items: start;
}

.main-content {
  min-width: 0;
}

.sidebar {
  position: sticky;
  top: 2rem;
}

/* Sidebar Blocks */
.sidebar-block {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
}

.sidebar-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: 1.5rem;
}

/* Tabs Navigation - Repeated in 5+ files */
.tabs-section {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
}

.tab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 1rem 2rem;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.05em;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

/* Empty States - Repeated in 8+ files */
.empty-state {
  text-align: center;
  padding: 6rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.2;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
  }
  
  .page-header {
    padding: 3rem 0;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tab {
    padding: 0.75rem 1rem;
  }
}
```

**Eliminates:** ~400 lines of duplicated layout styles across 8+ files

---

##### `cards.css` - Card Components
**Location**: `src/assets/styles/cards.css`

```css
/* Base Card Styles (extends global.css .card) */
.resource-card,
.playbook-card,
.story-card {
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  cursor: pointer;
}

.resource-card:hover,
.playbook-card:hover,
.story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

/* Card Headers */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-number {
  letter-spacing: 0.1em;
}

.card-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-light);
  margin: 0;
  line-height: 1.3;
}

.card-subtitle,
.card-location {
  font-size: 0.875rem;
  margin-top: -0.5rem;
}

.card-description {
  line-height: 1.7;
  flex: 1;
}

/* Card Meta */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
}

/* Card Tags */
.card-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
}

/* Accent Colors */
.resource-card[data-accent="1"],
.playbook-card[data-accent="1"] {
  border-left: 3px solid var(--color-accent-1);
}

.resource-card[data-accent="2"],
.playbook-card[data-accent="2"] {
  border-left: 3px solid var(--color-accent-2);
}

.resource-card[data-accent="3"],
.playbook-card[data-accent="3"] {
  border-left: 3px solid var(--color-accent-3);
}

/* Grid Layouts */
.resources-grid,
.playbooks-grid,
.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .resources-grid,
  .playbooks-grid,
  .stories-grid {
    grid-template-columns: 1fr;
  }
}
```

**Eliminates:** ~300 lines of duplicated card styles

---

##### `components.css` - Miscellaneous Components
**Location**: `src/assets/styles/components.css`

```css
/* Status Badges - Repeated in 6+ files */
.status-badge {
  padding: 0.25rem 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: inline-block;
}

.status-active,
.status-published {
  border-color: var(--color-accent-2);
  color: var(--color-accent-2);
  background: rgba(184, 212, 200, 0.1);
}

.status-completed {
  border-color: var(--color-accent-2);
  color: var(--color-accent-2);
}

.status-paused {
  border-color: var(--color-text-tertiary);
  color: var(--color-text-tertiary);
}

.status-draft {
  border-color: var(--color-text-secondary);
  color: var(--color-text-secondary);
}

/* Progress Bars - Repeated in 4+ files */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(42, 42, 42, 0.1);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg,
    var(--color-accent-1),
    var(--color-accent-2),
    var(--color-accent-3));
  background-size: 200% 100%;
  transition: width var(--transition-base);
  animation: gradientFlow 3s linear infinite;
}

.progress-fill.progress-complete {
  animation: gradientFlow 1s linear infinite;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: var(--font-weight-medium);
}

/* Badges */
.badge {
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  display: inline-block;
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.badge:hover {
  border-color: var(--color-text-primary);
}

.badge-pattern {
  border-color: var(--color-accent-1);
  color: var(--color-accent-1);
}

.badge-challenge {
  border-color: var(--color-accent-3);
  color: var(--color-accent-3);
}

/* Members Display */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.member-card:hover {
  border-color: var(--color-text-primary);
}

.member-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-accent-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.member-name {
  text-align: center;
  font-weight: var(--font-weight-medium);
}

.member-role {
  text-align: center;
}

/* Timeline - Repeated in 2+ files */
.timeline {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.timeline-value {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-marker[data-accent="1"] {
  background: var(--color-accent-1);
}

.timeline-marker[data-accent="2"] {
  background: var(--color-accent-2);
}

.timeline-marker[data-accent="3"] {
  background: var(--color-accent-3);
}

.timeline-date {
  margin: 0;
  color: var(--color-text-primary);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(42, 42, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: var(--color-bg-primary);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(42, 42, 42, 0.15);
}

.modal-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--color-text-primary);
}

.modal-content {
  padding: 2rem;
}

.modal-subtitle {
  margin-bottom: 1.5rem;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
```

**Eliminates:** ~400 lines of duplicated component styles

---

#### 1.3 Style Import Strategy

**Update `main.ts` or `App.vue` to import in this order:**
```typescript
import '@/assets/styles/global.css'      // Base (existing)
import '@/assets/styles/buttons.css'     // NEW
import '@/assets/styles/forms.css'       // NEW
import '@/assets/styles/layouts.css'     // NEW
import '@/assets/styles/cards.css'       // NEW
import '@/assets/styles/components.css'  // NEW
```

**Total Style Reduction:** ~2,200 lines of duplicate CSS eliminated

---

### Phase 2: Reusable UI Components

#### 2.1 Form Components
**Priority: HIGH** - Used in 15+ files

**New Components to Create:**

##### `BaseInput.vue`
```vue
<template>
  <div class="form-group">
    <label v-if="label" class="form-label text-xs text-tertiary">
      {{ label }}
    </label>
    <input
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="form-input"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="form-error text-xs">{{ error }}</span>
  </div>
</template>
```

**Files that will benefit:**
- `ProfileEditPage.vue`
- `SignupPage.vue`
- `LoginPage.vue`
- `SettingsPage.vue`
- `FullPlaybookPage.vue` (task forms)
- `GeneratedStoryPage.vue`

##### `BaseTextarea.vue`
Similar to BaseInput but for textarea elements

##### `BaseSelect.vue`
For dropdowns (state selection, etc.)

##### `FormSection.vue`
Wrapper for form sections with consistent styling

---

#### 2.2 Layout Components
**Priority: HIGH** - Used in all dashboard pages

##### `PageHeader.vue`
```vue
<template>
  <section class="page-header gradient-bg">
    <div class="container">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">{{ title }}</h1>
          <p v-if="subtitle" class="text-sm text-secondary">{{ subtitle }}</p>
        </div>
        <slot name="actions"></slot>
      </div>
      <slot></slot> <!-- For search inputs, etc. -->
    </div>
  </section>
</template>
```

**Current Duplication:**
- `PlaybooksPage.vue` - Lines 3-14
- `DashboardStoriesPage.vue` - Lines 3-9
- `ResourcesPage.vue` - Lines 3-18
- `ChatPage.vue` - Lines 3-15
- 8+ more files

##### `TabNavigation.vue`
```vue
<template>
  <section class="tabs-section">
    <div class="container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab text-xs', { active: modelValue === tab.key }]"
          @click="$emit('update:modelValue', tab.key)"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
    </div>
  </section>
</template>
```

**Current Duplication:**
- `PlaybooksPage.vue` - Lines 16-44
- `DashboardStoriesPage.vue` - Lines 12-36
- `ResourcesPage.vue` - Lines 21-51
- Used in 5+ files

##### `ContentSection.vue`
For main content areas with consistent padding/structure

##### `EmptyState.vue`
```vue
<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon || '∅' }}</div>
    <h3>{{ title }}</h3>
    <p class="text-secondary">{{ message }}</p>
    <slot name="action"></slot>
  </div>
</template>
```

**Current Duplication:**
- `PlaybooksPage.vue` - Lines 120-128
- `DashboardStoriesPage.vue` - Lines 64-71, 99-107, 192-199
- `ResourcesPage.vue` - Lines 217-223
- 6+ more instances

---

#### 2.3 Card Components
**Priority: HIGH** - Most common UI pattern

##### `ResourceCard.vue`
Unified card for patterns, stories, challenges, links
```vue
<template>
  <div 
    class="resource-card"
    :class="[resourceType, { clickable }]"
    :data-accent="accentIndex"
  >
    <div class="card-header">
      <div class="card-number text-xs text-tertiary">{{ number }}</div>
      <slot name="badge"></slot>
    </div>
    <h3 class="card-title">{{ title }}</h3>
    <div v-if="subtitle" class="card-subtitle text-xs text-secondary">
      {{ subtitle }}
    </div>
    <p class="card-description text-sm text-secondary">{{ description }}</p>
    <slot name="tags"></slot>
    <div class="card-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
```

**Replaces patterns in:**
- `ResourcesPage.vue` - 4 different card types (lines 56-154)
- `DashboardStoriesPage.vue` - Story cards
- `PlaybooksPage.vue` - Playbook cards

##### `PlaybookCard.vue`
Specialized card with progress bar for playbooks

##### `StoryCard.vue`
Specialized card with color overlay for stories

##### `TaskItem.vue`
Reusable task display/edit component
```vue
<template>
  <div 
    class="task-item"
    :class="{ editing: isEditing, completed: task.completed }"
    :data-accent="accentIndex"
  >
    <!-- Display mode -->
    <div v-if="!isEditing" class="task-main">
      <TaskCheckbox v-if="editable" v-model="task.completed" />
      <TaskContent :task="task" />
      <TaskActions 
        v-if="editable"
        @edit="startEdit"
        @delete="$emit('delete')"
        @toggle-notes="toggleNotes"
      />
    </div>
    
    <!-- Edit mode -->
    <TaskEditForm
      v-else
      v-model="editData"
      @save="saveEdit"
      @cancel="cancelEdit"
    />
    
    <!-- Notes section -->
    <TaskNotes 
      v-if="showNotes && editable"
      v-model="task.notes"
    />
  </div>
</template>
```

**Current Duplication:**
- `FullPlaybookPage.vue` - Lines 250-350 (massive task rendering logic)
- `FullTaskPage.vue` - Similar patterns

---

#### 2.4 Status & Badge Components
**Priority: MEDIUM**

##### `StatusBadge.vue`
```vue
<template>
  <span 
    class="status-badge text-xs" 
    :class="`status-${status}`"
  >
    {{ statusLabel }}
  </span>
</template>
```

**Replaces:**
- Status badges in `FullPlaybookPage.vue`
- Status badges in `DashboardStoriesPage.vue`
- Status badges in `GeneratedStoryPage.vue`

##### `ProgressBar.vue`
```vue
<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :class="{ 'progress-complete': progress >= 100 }"
        :style="progressStyle"
      ></div>
    </div>
    <div v-if="showLabel" class="progress-label text-xs text-tertiary">
      {{ label }}
    </div>
  </div>
</template>
```

**Current Duplication:**
- `FullPlaybookPage.vue` - Lines 26-37
- `PlaybooksPage.vue` - Lines 88-100
- Used in 3+ files

##### `MetaItem.vue`
For displaying key-value metadata pairs

##### `TagList.vue`
For displaying pattern tags, addresses, etc.

---

#### 2.5 Modal & Overlay Components
**Priority: MEDIUM** - Already have some, need more

**Existing (Keep):**
- `ConfirmModal.vue`
- `MessageModal.vue`
- `SlideInModal.vue`
- `InviteToPlaybookModal.vue`

**New Components:**

##### `ResourcePickerModal.vue`
Extract from `ResourcesPage.vue` (lines 178-227)
```vue
<template>
  <transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click="close">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" @click="close">×</button>
        </div>
        <div class="modal-content">
          <p class="text-sm text-secondary modal-subtitle">
            {{ message }}
          </p>
          <slot name="list"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>
```

##### `UserSearchModal.vue`
For searching and inviting users (from `FullPlaybookPage.vue`)

---

#### 2.6 Data Display Components
**Priority: MEDIUM**

##### `Timeline.vue`
```vue
<template>
  <div class="timeline">
    <div 
      v-for="(item, index) in items"
      :key="index"
      class="timeline-item"
    >
      <span class="timeline-label text-xs text-tertiary">
        {{ item.label }}
      </span>
      <div class="timeline-value">
        <div class="timeline-marker" :data-accent="item.accent || (index + 1)"></div>
        <p class="timeline-date text-sm">{{ formatDate(item.date) }}</p>
      </div>
    </div>
  </div>
</template>
```

**Current location:** `FullPlaybookPage.vue` lines 68-93

##### `MembersList.vue`
User avatars with names and roles
**Current location:** `FullPlaybookPage.vue` lines 116-133

##### `ResourcesList.vue`
Display list of linked resources
**Current location:** `FullPlaybookPage.vue` lines 386-421

---

### Phase 3: Composable Functions

#### 3.1 Form Management Composables

##### `useForm.ts`
```typescript
export function useForm<T>(initialData: T) {
  const formData = ref<T>(initialData)
  const errors = ref<Partial<Record<keyof T, string>>>({})
  const isDirty = ref(false)
  const isSubmitting = ref(false)

  const reset = () => {
    formData.value = { ...initialData }
    errors.value = {}
    isDirty.value = false
  }

  const validate = (rules: ValidationRules<T>) => {
    // Validation logic
  }

  return {
    formData,
    errors,
    isDirty,
    isSubmitting,
    reset,
    validate
  }
}
```

**Replaces form logic in:**
- `ProfileEditPage.vue`
- `SignupPage.vue`
- `LoginPage.vue`
- `GeneratedStoryPage.vue`
- Task edit forms in `FullPlaybookPage.vue`

##### `useEditMode.ts`
```typescript
export function useEditMode() {
  const isEditing = ref(false)
  const originalData = ref(null)
  
  const startEditing = (data: any) => {
    originalData.value = JSON.parse(JSON.stringify(data))
    isEditing.value = true
  }
  
  const cancelEditing = () => {
    isEditing.value = false
    return originalData.value
  }
  
  const saveEdit = () => {
    isEditing.value = false
    originalData.value = null
  }
  
  return {
    isEditing,
    startEditing,
    cancelEditing,
    saveEdit
  }
}
```

**Current Duplication:**
- `FullPlaybookPage.vue` - Task editing, notes editing, resources editing
- `GeneratedStoryPage.vue` - Story editing
- `ProfileEditPage.vue` - Profile editing

---

#### 3.2 Data Fetching Composables

##### `useAsyncData.ts`
```typescript
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options?: { immediate?: boolean }
) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchFn()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  if (options?.immediate) {
    execute()
  }

  return { data, loading, error, execute }
}
```

**Replaces async patterns in:**
- `FullPlaybookPage.vue` - Multiple data fetching scenarios
- `PlaybooksPage.vue` - Local playbooks loading
- `ProfilePage.vue` - User data loading

##### `usePagination.ts`
```typescript
export function usePagination<T>(
  items: Ref<T[]>,
  options: { itemsPerPage?: number } = {}
) {
  const currentPage = ref(1)
  const itemsPerPage = ref(options.itemsPerPage || 12)

  const totalPages = computed(() => 
    Math.ceil(items.value.length / itemsPerPage.value)
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return items.value.slice(start, end)
  })

  const goToPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    goToPage
  }
}
```

**Current Duplication:**
- `ResourcesPage.vue` - 4 separate pagination implementations (lines 250-329)

---

#### 3.3 UI State Composables

##### `useToast.ts`
```typescript
export function useToast() {
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref<'success' | 'error' | 'info'>('success')

  const toast = (message: string, type = 'success') => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
  }

  const success = (message: string) => toast(message, 'success')
  const error = (message: string) => toast(message, 'error')
  const info = (message: string) => toast(message, 'info')

  return {
    showToast,
    toastMessage,
    toastType,
    toast,
    success,
    error,
    info
  }
}
```

**Current Duplication:**
- `FullPlaybookPage.vue` - Toast notifications (10+ instances)
- `GeneratedStoryPage.vue` - Toast notifications
- `ProfileEditPage.vue` - Toast notifications

##### `useModal.ts`
```typescript
export function useModal() {
  const isOpen = ref(false)
  const data = ref<any>(null)

  const open = (modalData?: any) => {
    data.value = modalData
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    data.value = null
  }

  return {
    isOpen,
    data,
    open,
    close
  }
}
```

**Current Duplication:**
- Modal state management in 10+ files
- Simpler alternative to multiple `ref(false)` declarations

##### `useConfirm.ts`
```typescript
export function useConfirm() {
  const showConfirm = ref(false)
  const confirmData = ref<{
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  const confirm = async (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    confirmData.value = { title, message, onConfirm }
    showConfirm.value = true
  }

  return {
    showConfirm,
    confirmData,
    confirm
  }
}
```

**Replaces patterns in:**
- `FullPlaybookPage.vue` - Delete confirmations (3+ instances)
- `GeneratedStoryPage.vue` - Delete confirmation
- Other pages with confirmation modals

---

#### 3.4 Utility Composables

##### `useFormatters.ts`
```typescript
export function useFormatters() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return {
    formatDate,
    formatDateShort,
    formatTime,
    getInitials,
    getHostname
  }
}
```

**Current Duplication:**
- `formatDate()` - duplicated in 10+ files
- `getInitials()` - duplicated in 5+ files
- `getHostname()` - duplicated in 3+ files

##### `useImageUpload.ts`
```typescript
export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  const uploadImage = async (file: File) => {
    isUploading.value = true
    uploadError.value = null
    
    try {
      // Upload logic using Vercel Blob API
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const { url } = await response.json()
      return url
    } catch (error) {
      uploadError.value = 'Failed to upload image'
      throw error
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    uploadError,
    uploadImage
  }
}
```

**Current Duplication:**
- `ProfileEditPage.vue` - Image upload logic
- `GeneratedStoryPage.vue` - Image upload logic

---

### Phase 4: Specialized Feature Composables

#### 4.1 Playbook Management

##### `usePlaybookActions.ts`
```typescript
export function usePlaybookActions(playbookId: Ref<string | number>) {
  const playbooksStore = usePlaybooksStore()
  const { toast } = useToast()

  const markComplete = async () => {
    try {
      await playbooksApi.updateStatus(playbookId.value, 'completed')
      await playbooksStore.fetchPlaybooks()
      toast.success('Playbook marked as complete')
    } catch (error) {
      toast.error('Failed to update playbook')
    }
  }

  const togglePause = async () => {
    // Similar pattern
  }

  const deletePlaybook = async () => {
    // Similar pattern
  }

  return {
    markComplete,
    togglePause,
    deletePlaybook
  }
}
```

**Replaces:** Repeated action handlers in `FullPlaybookPage.vue`

##### `useTaskManagement.ts`
```typescript
export function useTaskManagement(playbookId: Ref<string | number>) {
  const { isEditing, startEditing, cancelEditing } = useEditMode()
  const newTask = ref({ title: '', description: '', dueDate: '' })
  const editingTask = ref(null)

  const addTask = async (task: Task) => {
    // Add task logic
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Update logic
  }

  const deleteTask = async (taskId: string) => {
    // Delete logic
  }

  const toggleTask = async (taskId: string) => {
    // Toggle completion logic
  }

  return {
    isEditing,
    newTask,
    editingTask,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    startEditing,
    cancelEditing
  }
}
```

**Replaces:** 200+ lines of task management in `FullPlaybookPage.vue`

---

#### 4.2 Collaboration Features

##### `useCollaboration.ts`
```typescript
export function useCollaboration(playbookId: Ref<string | number>) {
  const members = ref<PlaybookMember[]>([])
  const loading = ref(false)

  const loadMembers = async () => {
    loading.value = true
    try {
      members.value = await playbooksApi.getMembers(playbookId.value)
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      loading.value = false
    }
  }

  const inviteMember = async (userId: number) => {
    // Invite logic
  }

  const removeMember = async (memberId: number) => {
    // Remove logic
  }

  const userRole = computed(() => {
    // Calculate user's role in playbook
  })

  const isUserMember = computed(() => {
    // Check if current user is a member
  })

  return {
    members,
    loading,
    userRole,
    isUserMember,
    loadMembers,
    inviteMember,
    removeMember
  }
}
```

**Replaces:** Collaboration logic scattered throughout `FullPlaybookPage.vue`

---

### Phase 5: Directory Structure Reorganization

#### Proposed Structure:

```
src/
├── components/
│   ├── base/              # Generic reusable components
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseTextarea.vue
│   │   ├── BaseSelect.vue
│   │   └── BaseCheckbox.vue
│   │
│   ├── forms/             # Form-specific components
│   │   ├── FormGroup.vue
│   │   ├── FormSection.vue
│   │   ├── FormActions.vue
│   │   └── FormError.vue
│   │
│   ├── layout/            # Layout components
│   │   ├── PageHeader.vue
│   │   ├── PageSection.vue
│   │   ├── ContentBlock.vue
│   │   ├── TabNavigation.vue
│   │   ├── EmptyState.vue
│   │   └── Sidebar.vue
│   │
│   ├── cards/             # Card components
│   │   ├── ResourceCard.vue
│   │   ├── PlaybookCard.vue
│   │   ├── StoryCard.vue
│   │   ├── TaskCard.vue
│   │   └── MemberCard.vue
│   │
│   ├── display/           # Data display components
│   │   ├── StatusBadge.vue
│   │   ├── ProgressBar.vue
│   │   ├── Timeline.vue
│   │   ├── MetaItem.vue
│   │   ├── TagList.vue
│   │   └── MembersList.vue
│   │
│   ├── modals/            # Modal components
│   │   ├── ConfirmModal.vue        # (existing)
│   │   ├── MessageModal.vue        # (existing)
│   │   ├── SlideInModal.vue        # (existing)
│   │   ├── ResourcePickerModal.vue
│   │   └── UserSearchModal.vue
│   │
│   ├── playbook/          # Playbook-specific components
│   │   ├── PlaybookHero.vue
│   │   ├── PlaybookOverview.vue
│   │   ├── PlaybookActions.vue
│   │   ├── TaskList.vue
│   │   ├── TaskItem.vue
│   │   ├── TaskEditForm.vue
│   │   └── ResourcesList.vue
│   │
│   └── story/             # Story-specific components
│       ├── StoryHero.vue
│       ├── StoryContent.vue
│       └── StoryActions.vue
│
├── composables/
│   ├── core/              # Core functionality
│   │   ├── useForm.ts
│   │   ├── useEditMode.ts
│   │   ├── useAsyncData.ts
│   │   └── usePagination.ts
│   │
│   ├── ui/                # UI state management
│   │   ├── useToast.ts
│   │   ├── useModal.ts
│   │   ├── useConfirm.ts
│   │   └── useLoading.ts
│   │
│   ├── utils/             # Utility composables
│   │   ├── useFormatters.ts
│   │   ├── useImageUpload.ts
│   │   └── useDebounce.ts
│   │
│   └── features/          # Feature-specific composables
│       ├── usePlaybookActions.ts
│       ├── useTaskManagement.ts
│       ├── useCollaboration.ts
│       └── useStoryGeneration.ts
│
├── assets/
│   └── styles/
│       ├── main.css              # (existing)
│       ├── utilities.css         # NEW: Utility classes
│       ├── components.css        # NEW: Component styles
│       ├── buttons.css           # NEW: Button variants
│       ├── forms.css             # NEW: Form elements
│       └── layouts.css           # NEW: Layout patterns
│
└── views/
    └── dashboard/         # Cleaned up, much smaller files
        ├── FullPlaybookPage.vue    # Target: <400 lines
        ├── ResourcesPage.vue       # Target: <300 lines
        ├── ChatPage.vue            # Target: <300 lines
        └── ...
```

---

## Implementation Phases & Timeline

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up shared styles and base components

**Prerequisites:**
- ✅ Review `global.css` - already has excellent foundation
- ✅ Identify what's missing vs. what's duplicated

**Tasks:**
1. Create new style files (buttons, forms, layouts, cards, components)
2. Extract CSS duplications from individual `.vue` files
3. Update import strategy in `main.ts` or `App.vue`
4. Create base form components (`BaseInput`, `BaseTextarea`, `BaseSelect`)
5. Create base button component wrapper (optional - may just use CSS classes)
6. Test in 2-3 pages to ensure no visual regressions

**Files to Refactor First:**
- `FullPlaybookPage.vue` - Remove 1,039 lines of duplicate styles
- `ResourcesPage.vue` - Remove 530 lines of duplicate styles
- `ChatPage.vue` - Remove 472 lines of duplicate styles

**Success Metrics:**
- New style files created and imported
- CSS duplication reduced by 70%+ (from ~2,200 to <600 lines)
- Form components used in at least 5 pages
- No visual changes to existing pages

---

### Phase 2: Layout Components (Week 3-4)
**Goal**: Extract common layout patterns

1. Create `PageHeader.vue`, `TabNavigation.vue`, `EmptyState.vue`
2. Create `ContentBlock.vue`, `ContentSection.vue`
3. Refactor 3-4 dashboard pages to use new components
4. Create `FormSection.vue` and `FormGroup.vue`

**Success Metrics:**
- 8+ pages using new layout components
- Average page size reduced by 20%
- Consistent header/tab patterns across all pages

---

### Phase 3: Card & Display Components (Week 5-6)
**Goal**: Unify card patterns and data display

1. Create `ResourceCard.vue` (unified)
2. Create specialized cards (`PlaybookCard`, `StoryCard`, `TaskCard`)
3. Create display components (`StatusBadge`, `ProgressBar`, `Timeline`)
4. Refactor `ResourcesPage.vue`, `PlaybooksPage.vue`, `DashboardStoriesPage.vue`

**Success Metrics:**
- Single card component handling 80% of use cases
- `ResourcesPage.vue` reduced to <400 lines
- Consistent card styling across all pages

---

### Phase 4: Core Composables (Week 7-8)
**Goal**: Extract reusable logic patterns

1. Create `useForm.ts`, `useEditMode.ts`, `useAsyncData.ts`
2. Create `useToast.ts`, `useModal.ts`, `useConfirm.ts`
3. Create `useFormatters.ts` (consolidate all utility functions)
4. Create `usePagination.ts`
5. Refactor 5+ pages to use new composables

**Success Metrics:**
- Date formatting centralized (no duplicates)
- Toast notifications standardized
- Form handling logic reduced by 50%

---

### Phase 5: Feature Composables & Task Components (Week 9-10)
**Goal**: Break down the massive `FullPlaybookPage.vue`

1. Create `TaskItem.vue`, `TaskEditForm.vue`, `TaskList.vue`
2. Create `useTaskManagement.ts`, `usePlaybookActions.ts`
3. Create `useCollaboration.ts`
4. Create `PlaybookOverview.vue`, `PlaybookActions.vue`
5. Refactor `FullPlaybookPage.vue` to use new components/composables

**Success Metrics:**
- `FullPlaybookPage.vue` reduced to <600 lines (from 1965)
- Task management extracted into separate module
- Collaboration logic reusable in other contexts

---

### Phase 6: Final Cleanup & Documentation (Week 11-12)
**Goal**: Polish and document the refactored codebase

1. Remove all dead code
2. Ensure all components have prop types and documentation
3. Create component usage guide
4. Performance testing
5. Create migration guide for future developers

**Success Metrics:**
- All files under 500 lines
- 90% code coverage for composables
- Complete component documentation
- Zero functional regressions

---

## Expected Outcomes

### Quantitative Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Largest file | 1,965 lines | <600 lines | 69% reduction |
| Average dashboard file | 580 lines | <350 lines | 40% reduction |
| CSS duplication | ~2,200 lines | <200 lines | 91% reduction |
| Form logic duplication | ~800 lines | <150 lines | 81% reduction |
| Total LOC (dashboard views) | ~7,000 lines | ~3,500 lines | 50% reduction |
| Total style files | 1 (global.css) | 6 (organized) | Better organization |

### Qualitative Improvements

1. **Maintainability**: Changes to UI patterns require editing 1 file instead of 15+
2. **Consistency**: Unified components ensure consistent UX
3. **Developer Experience**: New features easier to implement with reusable components
4. **Testing**: Smaller components easier to test in isolation
5. **Performance**: Better code splitting opportunities
6. **Onboarding**: New developers can understand structure faster

---

## Risk Mitigation

### Potential Risks

1. **Breaking existing functionality**
   - **Mitigation**: Incremental refactoring, comprehensive testing after each phase
   
2. **Visual regressions**
   - **Mitigation**: Visual regression testing, side-by-side comparisons
   
3. **Time overruns**
   - **Mitigation**: Prioritize high-impact refactorings first, each phase delivers value
   
4. **Team coordination**
   - **Mitigation**: Feature freeze during major refactoring phases, clear communication

### Testing Strategy

1. **Unit Tests**: All new composables and components
2. **Integration Tests**: Refactored pages maintain functionality
3. **Visual Tests**: Screenshot comparisons for each page
4. **Manual QA**: Full app walkthrough after each phase

---

## Component Creation Priority

### Immediate (Phase 1-2)
1. ✅ Base form components (BaseInput, BaseTextarea, BaseSelect)
2. ✅ PageHeader
3. ✅ TabNavigation
4. ✅ EmptyState
5. ✅ useFormatters composable

### High Priority (Phase 3-4)
6. ✅ ResourceCard (unified)
7. ✅ StatusBadge
8. ✅ ProgressBar
9. ✅ useToast
10. ✅ useModal
11. ✅ usePagination

### Medium Priority (Phase 5)
12. ✅ TaskItem
13. ✅ Timeline
14. ✅ MembersList
15. ✅ useTaskManagement
16. ✅ usePlaybookActions

### Nice-to-Have (Phase 6)
17. ⚠️ FormSection wrapper
18. ⚠️ MetaItem display
19. ⚠️ ResourcesList
20. ⚠️ useImageUpload optimization

---

## Success Criteria

The refactoring will be considered successful when:

1. ✅ No file exceeds 600 lines
2. ✅ CSS duplication reduced by >90% (leveraging existing global.css)
3. ✅ Form logic centralized in composables
4. ✅ All pages use shared layout components
5. ✅ Button/form styles eliminated from individual components
6. ✅ Zero functional regressions
7. ✅ Zero visual regressions
8. ✅ Code is easier to understand and modify
9. ✅ Future feature development is 30-50% faster
10. ✅ Consistent design system across all pages

---

## Appendix: Code Smell Examples

### Example 1: Repeated Date Formatting
**Found in:** 12+ files
```javascript
// FullPlaybookPage.vue
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// PlaybooksPage.vue - EXACT SAME FUNCTION
const formatDate = (dateString: string) => { /* ... identical ... */ }

// ResourcesPage.vue - EXACT SAME FUNCTION
const formatDate = (dateString: string | undefined) => { /* ... identical ... */ }
```

**Solution:** Single `useFormatters()` composable

---

### Example 2: Repeated Task Item Template
**Found in:** FullPlaybookPage.vue (250+ lines), FullTaskPage.vue

```vue
<!-- Repeated complex task rendering logic -->
<div class="task-item">
  <div v-if="editingTaskId !== task.id" class="task-main">
    <div class="task-checkbox-wrapper">
      <input type="checkbox" :checked="task.completed" @change="toggleTask(task.id)" />
    </div>
    <!-- 100+ more lines of task rendering -->
  </div>
  <div v-else class="task-edit-form">
    <!-- 80+ lines of task editing form -->
  </div>
</div>
```

**Solution:** `<TaskItem>` component with display/edit modes

---

### Example 3: Repeated Button Styles
**Found in:** 15+ files with identical CSS

```css
/* Repeated in FullPlaybookPage, GeneratedStoryPage, ProfileEditPage, etc. */
.btn-secondary {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}
```

**Solution:** Global `buttons.css` with all button variants

---

### Example 4: Repeated Empty State
**Found in:** 8+ files

```vue
<!-- Nearly identical across multiple files -->
<div class="empty-state">
  <div class="empty-icon">∅</div>
  <h3>No {{ itemType }} yet</h3>
  <p class="text-secondary">{{ message }}</p>
  <button class="btn" @click="action">{{ actionText }}</button>
</div>
```

**Solution:** `<EmptyState>` component with slots

---

## Next Steps

1. **Review this plan** with the development team
2. **Prioritize phases** based on current development needs
3. **Set up testing infrastructure** before starting refactoring
4. **Create feature branch** for refactoring work
5. **Begin Phase 1** with style consolidation

---

**Document Version:** 1.0  
**Last Updated:** January 22, 2026  
**Author:** Code Audit Analysis  
**Status:** Ready for Review
