<template>
  <div class="settings-section" data-accent="2">
    <h2 class="section-title">AI Assistant</h2>
    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Conversation Style</label>
      <select v-model="aiPreferences.conversationStyle" class="form-input">
        <option value="concise">Concise & Direct</option>
        <option value="detailed">Detailed & Explanatory</option>
        <option value="collaborative">Collaborative & Exploratory</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Suggestion Frequency</label>
      <select v-model="aiPreferences.suggestionFrequency" class="form-input">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
    <div class="checkbox-list">
      <label class="checkbox-label text-sm">
        <input v-model="aiPreferences.autoSuggestions" type="checkbox" class="checkbox" />
        <span>Enable automatic pattern suggestions</span>
      </label>
      <label class="checkbox-label text-sm">
        <input v-model="aiPreferences.relatedPatterns" type="checkbox" class="checkbox" />
        <span>Show related patterns in responses</span>
      </label>
    </div>
    <button class="btn" @click="save">Save Preferences</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'

const emit = defineEmits<{ 'saved': [message: string] }>()

const aiPreferences = reactive({
  conversationStyle: 'detailed',
  suggestionFrequency: 'medium',
  autoSuggestions: true,
  relatedPatterns: true
})

onMounted(() => {
  const saved = localStorage.getItem('ai_preferences')
  if (saved) Object.assign(aiPreferences, JSON.parse(saved))
})

const save = () => {
  localStorage.setItem('ai_preferences', JSON.stringify(aiPreferences))
  emit('saved', 'AI preferences saved')
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 3rem;
  padding: 3rem;
  background: var(--color-bg-primary);
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.settings-section[data-accent="2"] { border-left-color: var(--color-accent-2); }
.settings-section:hover { box-shadow: 0 4px 16px rgba(42, 42, 42, 0.06); }

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 2rem;
}

.form-group { margin-bottom: 1.5rem; }

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  transition: all var(--transition-base);
}

.form-input:focus { outline: none; border-color: var(--color-accent-2); background: var(--color-bg-primary); }
.form-input:hover { border-color: rgba(42, 42, 42, 0.15); }

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 0.75rem;
  transition: all var(--transition-base);
  border-left: 2px solid transparent;
}

.checkbox-label:hover {
  background: var(--color-bg-primary);
  border-left-color: var(--color-accent-2);
  padding-left: 1rem;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: var(--color-accent-2);
}

.checkbox-label span { line-height: 1.5; }

@media (max-width: 768px) {
  .settings-section { padding: 2rem; }
  .section-title { font-size: 1.25rem; }
}
</style>
