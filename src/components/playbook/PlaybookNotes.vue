<template>
  <div class="content-block">
    <div class="block-header">
      <h2 class="section-subtitle">Notes & Learnings</h2>
      <button 
        v-if="!isEditingNotes && isUserMember"
        @click="$emit('startEditingNotes')"
        class="btn-text text-xs"
      >
        Edit
      </button>
    </div>
    
    <!-- Display Mode -->
    <div v-if="!isEditingNotes" class="notes-display">
      <p v-if="playbook.notes" class="text-secondary">{{ playbook.notes }}</p>
      <p v-else class="text-tertiary" style="font-style: italic;">
        {{ isUserMember ? 'No notes added yet. Click Edit to add your learnings and insights.' : 'No notes added yet.' }}
      </p>
    </div>

    <!-- Edit Mode -->
    <div v-else-if="isUserMember" class="notes-edit">
      <textarea
        :value="editableNotes"
        @input="$emit('update:editableNotes', ($event.target as HTMLTextAreaElement).value)"
        class="notes-textarea"
        rows="6"
        placeholder="Document your overall learnings, insights, challenges overcome, and advice for others implementing this pattern..."
      ></textarea>
      <div class="form-actions" style="margin-top: 1rem;">
        <button @click="$emit('saveNotes')" class="btn btn-sm">Save</button>
        <button @click="$emit('cancelEditingNotes')" class="btn-text text-xs">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playbook: any
  isUserMember: boolean
  isEditingNotes: boolean
  editableNotes: string
}>()

defineEmits<{
  startEditingNotes: []
  'update:editableNotes': [value: string]
  saveNotes: []
  cancelEditingNotes: []
}>()
</script>

<style scoped>
.notes-display {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-accent-3);
  line-height: 1.8;
  padding-top: 2.5rem;
}

.notes-edit {
  padding-top: 2.5rem;
}

.notes-textarea {
  width: 100%;
  padding: 1.5rem;
  font-family: var(--font-family);
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  resize: vertical;
  transition: border-color var(--transition-base);
}

.notes-textarea:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.notes-textarea::placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.6;
}
</style>
