<template>
  <div class="settings-section" data-accent="2">
    <h2 class="section-title">AI Assistant</h2>
    <p class="text-sm text-secondary section-blurb">
      Shape how the assistant talks to you. These apply to every conversation.
    </p>

    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Conversation Style</label>
      <AppDropdown
        v-model="prefs.conversationStyle"
        :options="[
          { value: 'concise', label: 'Concise & Direct' },
          { value: 'detailed', label: 'Detailed & Explanatory' },
          { value: 'collaborative', label: 'Collaborative & Exploratory' },
        ]"
      />
    </div>

    <div class="checkbox-list">
      <label class="checkbox-label text-sm">
        <AppCheckbox v-model="prefs.communityGrounding" />
        <span>
          <strong>Ground answers in my community</strong>
          <span class="text-xs text-tertiary">Tailor advice to your town, state, and the challenges on your profile</span>
        </span>
      </label>
      <label class="checkbox-label text-sm">
        <AppCheckbox v-model="prefs.patternReferences" />
        <span>
          <strong>Reference patterns from the library</strong>
          <span class="text-xs text-tertiary">Cite specific patterns and wicked problems you can explore on the platform</span>
        </span>
      </label>
      <label class="checkbox-label text-sm">
        <AppCheckbox v-model="prefs.actionSteps" />
        <span>
          <strong>End with next steps</strong>
          <span class="text-xs text-tertiary">Close substantive answers with two or three concrete, doable actions</span>
        </span>
      </label>
    </div>

    <button class="btn" :disabled="saving" @click="save">
      {{ saving ? 'Saving…' : 'Save Preferences' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppDropdown from '@/components/AppDropdown.vue'
import { settingsApi } from '@/services/api'

const emit = defineEmits<{ 'saved': [message: string] }>()

// Defaults mirror the backend's (detailed, grounded, referenced, no step lists)
const prefs = reactive({
  conversationStyle: 'detailed',
  communityGrounding: true,
  patternReferences: true,
  actionSteps: false,
})

const saving = ref(false)

onMounted(async () => {
  try {
    const settings = await settingsApi.get()
    if (settings.aiPreferences) Object.assign(prefs, settings.aiPreferences)
  } catch (error) {
    console.error('Failed to load AI preferences:', error)
  }
})

const save = async () => {
  saving.value = true
  try {
    await settingsApi.update({ aiPreferences: { ...prefs } })
    emit('saved', 'AI preferences saved')
  } catch (error) {
    console.error('Failed to save AI preferences:', error)
    emit('saved', 'Failed to save AI preferences')
  } finally {
    saving.value = false
  }
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
  margin-bottom: 0.75rem;
}

.section-blurb { margin-bottom: 2rem; }

.form-group { margin-bottom: 1.5rem; }

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
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

.checkbox-label > span {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  line-height: 1.5;
}

.checkbox-label strong { font-weight: var(--font-weight-medium); }

@media (max-width: 768px) {
  .settings-section { padding: 2rem; }
  .section-title { font-size: 1.25rem; }
}
</style>
