<template>
  <div class="content-block">
    <div class="block-header">
      <h2 class="section-subtitle">Notes & Learnings</h2>
    </div>

    <!-- Edits in place — click the text, type, autosaves on blur -->
    <div class="notes-display">
      <EditableText
        class="text-secondary"
        :text="playbook.notes || ''"
        :can-edit="isUserMember"
        :placeholder="isUserMember
          ? 'Document your overall learnings, insights, challenges overcome, and advice for others implementing this pattern...'
          : 'No notes added yet.'"
        @save="$emit('saveNotes', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EditableText from '@/components/EditableText.vue'

defineProps<{
  playbook: any
  isUserMember: boolean
}>()

defineEmits<{
  saveNotes: [value: string]
}>()
</script>

<style scoped>
.notes-display {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-accent-3);
  line-height: 1.8;
  margin-top: 2.5rem;
}
</style>
