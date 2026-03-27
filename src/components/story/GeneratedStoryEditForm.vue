<template>
  <div class="content-block">
    <h2 class="section-subtitle">Edit Story</h2>
    
    <div class="form-group">
      <label class="text-xs text-tertiary">Title</label>
      <input
        v-model="editableStory.title"
        type="text"
        class="form-input"
        placeholder="Story title..."
      />
    </div>

    <div class="form-group">
      <label class="text-xs text-tertiary">Problem Statement</label>
      <textarea
        v-model="editableStory.problem"
        class="form-textarea"
        rows="2"
        placeholder="Brief problem description..."
      ></textarea>
    </div>

    <div class="form-group">
      <label class="text-xs text-tertiary">Solution Summary</label>
      <textarea
        v-model="editableStory.solution"
        class="form-textarea"
        rows="2"
        placeholder="Brief solution description..."
      ></textarea>
    </div>

    <div class="form-group">
      <label class="text-xs text-tertiary">Full Story (Markdown)</label>
      <textarea
        v-model="editableStory.story"
        class="story-textarea"
        rows="20"
        placeholder="Write your inspiring success story in markdown format..."
      ></textarea>
    </div>

    <div class="form-group">
      <label class="text-xs text-tertiary">Color (Hex)</label>
      <input
        v-model="editableStory.color"
        type="text"
        class="form-input"
        placeholder="#b8d4c8"
      />
    </div>

    <div class="form-group">
      <label class="text-xs text-tertiary">Image URL</label>
      <input
        v-model="editableStory.image"
        type="text"
        class="form-input"
        placeholder="https://example.com/image.jpg"
      />
      <div v-if="editableStory.image" class="image-preview" style="margin-top: 1rem;">
        <img :src="editableStory.image" alt="Story image preview" style="max-width: 100%; border-radius: 4px;" />
      </div>
      <p class="text-xs text-tertiary" style="margin-top: 0.5rem; opacity: 0.7;">
        Paste an image URL or use the file upload button below
      </p>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none;"
        @change="handleFileChange"
      />
      <button 
        type="button"
        @click="fileInput?.click()"
        class="btn-secondary btn-sm"
        style="margin-top: 0.75rem; width: auto;"
      >
        Upload Image File
      </button>
    </div>

    <div class="form-actions" style="margin-top: 2rem;">
      <button @click="$emit('save')" class="btn">Save Changes</button>
      <button @click="$emit('cancel')" class="btn-text text-xs">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ editableStory: any }>()

const emit = defineEmits<{
  'save': []
  'cancel': []
  'upload': [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('upload', file)
}
</script>

<style scoped>
.content-block {
  background: var(--color-bg-primary);
  padding: 4rem;
}

.section-subtitle {
  font-size: 1.75rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-input,
.form-textarea,
.story-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-family);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  transition: border-color var(--transition-base);
}

.story-textarea {
  font-size: 1rem;
  line-height: 1.8;
}

.form-input:focus,
.form-textarea:focus,
.story-textarea:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.form-textarea,
.story-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-sm {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  text-align: center;
}

.btn-secondary {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  text-align: center;
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.btn-text {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color var(--transition-base);
  padding: 0;
}

.btn-text:hover {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .content-block { padding: 2rem; }
}
</style>
