<template>
  <div class="content-block">
    <div class="block-header">
      <h2 class="section-subtitle">Summary</h2>
    </div>
    <!-- New format: structured summary (each block edits in place) -->
    <div v-if="playbook.summary" class="summary-content">
      <div class="summary-item">
        <h3 class="summary-label text-xs text-tertiary">THE PROBLEM</h3>
        <EditableText
          class="text-secondary"
          :text="playbook.summary.problem || ''"
          :can-edit="isUserMember"
          placeholder="Describe the problem this playbook addresses..."
          @save="$emit('updateSummary', 'problem', $event)"
        />
      </div>
      <div class="summary-item">
        <h3 class="summary-label text-xs text-tertiary">OUR APPROACH</h3>
        <EditableText
          class="text-secondary"
          :text="playbook.summary.approach || ''"
          :can-edit="isUserMember"
          placeholder="Describe your approach..."
          @save="$emit('updateSummary', 'approach', $event)"
        />
      </div>
      <div class="summary-item">
        <h3 class="summary-label text-xs text-tertiary">SUCCESS IN 90 DAYS</h3>
        <EditableText
          class="text-secondary"
          :text="playbook.summary.success90Days || ''"
          :can-edit="isUserMember"
          placeholder="What does success look like in 90 days?"
          @save="$emit('updateSummary', 'success90Days', $event)"
        />
      </div>
    </div>
    <!-- Old format: simple solution text -->
    <div v-else class="solution-display">
      <EditableText
        class="text-secondary"
        :text="playbook.solution || ''"
        :can-edit="isUserMember"
        placeholder="Describe the solution..."
        @save="$emit('updateSummary', 'solution', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EditableText from '@/components/EditableText.vue'

defineProps<{
  playbook: any
  isUserMember?: boolean
}>()

defineEmits<{
  updateSummary: [field: 'problem' | 'approach' | 'success90Days' | 'solution', value: string]
}>()
</script>

<style scoped>
.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.solution-display {
  padding-top: 2.5rem;
}

.solution-display p {
  line-height: 1.8;
  font-size: 1rem;
}
</style>
