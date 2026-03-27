<template>
  <div v-if="playbook.kpis && playbook.kpis.length > 0" class="content-block">
    <div class="block-header">
      <h2 class="section-subtitle">Key Performance Indicators</h2>
    </div>
    <div class="kpis-grid">
      <div 
        v-for="(kpi, index) in playbook.kpis" 
        :key="kpi.id"
        class="kpi-card"
        :data-accent="((index % 3) + 1)"
      >
        <!-- Display Mode -->
        <div v-if="editingKpiId !== kpi.id">
          <div class="kpi-header">
            <span class="kpi-category text-xs text-tertiary">
              {{ formatKpiCategory(kpi.category) }}
            </span>
            <button
              v-if="isUserMember"
              @click="$emit('startEdit', kpi)"
              class="kpi-edit-btn text-xs"
            >
              Edit
            </button>
          </div>
          <h3 class="kpi-title text-sm">{{ kpi.title }}</h3>
          <p class="kpi-description text-xs text-secondary">{{ kpi.description }}</p>
          
          <div class="kpi-metrics">
            <div class="kpi-target-row">
              <span class="text-xs text-tertiary">Target:</span>
              <span class="text-xs">{{ kpi.target || 'Not set' }}</span>
            </div>
            <div v-if="kpi.target" class="kpi-progress-row">
              <span class="text-xs text-tertiary">Progress:</span>
              <span class="text-xs">{{ kpi.currentProgress || '0' }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="kpi.target && kpi.currentProgress" class="kpi-progress-bar">
            <div 
              class="kpi-progress-fill"
              :style="{ width: calculateKpiProgress(kpi) + '%' }"
            ></div>
          </div>
          <div v-if="kpi.target && kpi.currentProgress" class="kpi-progress-text text-xs text-tertiary">
            {{ calculateKpiProgress(kpi) }}% complete
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else-if="isUserMember" class="kpi-edit-form">
          <div class="kpi-header">
            <span class="kpi-category text-xs text-tertiary">
              {{ formatKpiCategory(kpi.category) }}
            </span>
          </div>
          <h3 class="kpi-title text-sm">{{ kpi.title }}</h3>
          <p class="kpi-description text-xs text-secondary">{{ kpi.description }}</p>
          
          <div class="form-group" style="margin-top: 1rem;">
            <label class="text-xs text-tertiary">Target Value</label>
            <input
              :value="editingKpi.target"
              @input="$emit('update:editingKpi', { ...editingKpi, target: ($event.target as HTMLInputElement).value })"
              type="text"
              class="form-input"
              placeholder="e.g., '20 members' or '80%'"
            />
            <p class="text-xs text-tertiary" style="margin-top: 0.25rem; font-style: italic;">
              For percentage goals, enter the target as a number (e.g., "100" for 100%)
            </p>
          </div>
          
          <div class="form-group">
            <label class="text-xs text-tertiary">Current Progress</label>
            <input
              :value="editingKpi.currentProgress"
              @input="$emit('update:editingKpi', { ...editingKpi, currentProgress: ($event.target as HTMLInputElement).value })"
              type="text"
              class="form-input"
              placeholder="e.g., '15' or '3/10'"
            />
            <p class="text-xs text-tertiary" style="margin-top: 0.25rem; font-style: italic;">
              For numerical targets: enter a number. For percentage goals: enter as "current/total" (e.g., "3/10")
            </p>
          </div>

          <div class="form-actions">
            <button @click="$emit('saveEdit')" class="btn btn-sm">Save</button>
            <button @click="$emit('cancelEdit')" class="btn-text text-xs">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playbook: any
  isUserMember: boolean
  editingKpiId: string | null
  editingKpi: { target: string; currentProgress: string }
  formatKpiCategory: (category: string) => string
  calculateKpiProgress: (kpi: any) => number
}>()

defineEmits<{
  startEdit: [kpi: any]
  saveEdit: []
  cancelEdit: []
  'update:editingKpi': [value: { target: string; currentProgress: string }]
}>()
</script>

<style scoped>
.kpis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid rgba(42, 42, 42, 0.08);
}

.kpi-card {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  border-right: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.kpi-card:hover {
  background: var(--color-bg-secondary);
}

.kpi-card:nth-child(2n) {
  border-right: none;
}

.kpi-card:nth-last-child(-n+2) {
  border-bottom: none;
}

.kpi-card[data-accent="1"] { border-left-color: var(--color-accent-1); }
.kpi-card[data-accent="2"] { border-left-color: var(--color-accent-2); }
.kpi-card[data-accent="3"] { border-left-color: var(--color-accent-3); }

.kpi-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-category {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.kpi-edit-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.12);
  cursor: pointer;
  transition: all var(--transition-base);
  border-radius: 2px;
}

.kpi-edit-btn:hover {
  background: rgba(42, 42, 42, 0.04);
  border-color: rgba(42, 42, 42, 0.24);
}

.kpi-title {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #2c2c2c;
}

.kpi-description {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.kpi-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.kpi-target-row,
.kpi-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(42, 42, 42, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
}

.kpi-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2));
  transition: width 0.3s ease;
}

.kpi-progress-text {
  margin-top: 0.5rem;
  text-align: right;
}

.kpi-edit-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.kpi-edit-form .form-group {
  margin-top: 0.75rem;
}

.kpi-edit-form .form-actions {
  margin-top: 1rem;
}
</style>
