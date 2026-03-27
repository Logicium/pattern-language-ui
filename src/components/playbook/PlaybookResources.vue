<template>
  <div v-if="playbook.resources.length > 0" class="content-block">
    <div class="block-header">
      <h2 class="section-subtitle">Resources</h2>
      <button 
        v-if="!isEditingResources && isUserMember"
        @click="$emit('startEditingResources')"
        class="btn-text text-xs"
      >
        Edit
      </button>
    </div>
    
    <!-- Display Mode -->
    <div v-if="!isEditingResources" class="resources-grid">
      <a
        v-for="resource in playbook.resources.filter((r: any) => r.type === 'link')"
        :key="`${resource.type}-${resource.id}`"
        :href="resource.url"
        target="_blank"
        rel="noopener noreferrer"
        class="resource-card resource-card-link text-sm"
      >
        <span class="resource-type text-xs text-tertiary">{{ resource.type }}</span>
        <span>{{ resource.title }}</span>
        <span class="link-indicator">↗</span>
      </a>
      
      <router-link
        v-for="resource in playbook.resources.filter((r: any) => r.type !== 'link')"
        :key="`${resource.type}-${resource.id}`"
        :to="getResourceLink(resource)"
        class="resource-card text-sm"
      >
        <span class="resource-type text-xs text-tertiary">{{ resource.type }}</span>
        <span>{{ resource.title }}</span>
      </router-link>
    </div>

    <!-- Edit Mode -->
    <div v-else>
      <div class="resources-grid">
        <div
          v-for="resource in playbook.resources"
          :key="`${resource.type}-${resource.id}`"
          class="resource-card resource-card-editable text-sm"
        >
          <div class="resource-card-content">
            <div class="resource-card-info">
              <span class="resource-type text-xs text-tertiary">{{ resource.type }}</span>
              <span>{{ resource.title }}</span>
            </div>
            <button @click="$emit('confirmDeleteResource', resource.id)" class="delete-resource-btn">×</button>
          </div>
        </div>
      </div>
      <div style="margin-top: 1.5rem;">
        <button @click="$emit('cancelEditingResources')" class="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getResourceLink } from '@/utils/formatters'

defineProps<{
  playbook: any
  isUserMember: boolean
  isEditingResources: boolean
}>()

defineEmits<{
  startEditingResources: []
  cancelEditingResources: []
  confirmDeleteResource: [resourceId: number]
}>()
</script>

<style scoped>
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.25rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all var(--transition-base);
  border: 1px solid rgba(42, 42, 42, 0.08);
  position: relative;
}

.resource-card:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-accent-2);
}

.resource-card-link {
  position: relative;
}

.link-indicator {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  font-size: 1rem;
  color: var(--color-text-tertiary);
  transition: all var(--transition-base);
}

.resource-card-link:hover .link-indicator {
  color: var(--color-text-primary);
  transform: translateX(2px) translateY(-2px);
}

.resource-card-editable {
  cursor: default;
}

.resource-card-editable:hover {
  background: var(--color-bg-primary);
  border-color: rgba(42, 42, 42, 0.08);
}

.resource-card-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.resource-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}

.delete-resource-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(232, 180, 160, 0.3);
  background: transparent;
  color: var(--color-accent-warm);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  padding: 0;
  font-weight: var(--font-weight-normal);
  flex-shrink: 0;
}

.delete-resource-btn:hover {
  background: rgba(232, 180, 160, 0.1);
  border-color: var(--color-accent-1);
  color: var(--color-accent-1);
}

.resource-type {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
