<template>
  <nav class="pagination" aria-label="Pagination">
    <div class="pagination-left">
      <div class="pagination-info">
        <span class="text-sm text-secondary">
          {{ startItem }}–{{ endItem }} of {{ totalItems }}
        </span>
      </div>
      
      <div v-if="perPageOptions && perPageOptions.length > 1" class="per-page-selector">
        <label for="per-page" class="text-xs text-tertiary">Per Page</label>
        <select
          id="per-page"
          :value="itemsPerPage"
          @change="handlePerPageChange"
          class="per-page-select text-sm"
        >
          <option
            v-for="option in perPageOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="pagination-controls">
      <button
        @click="goToPrevious"
        :disabled="currentPage === 1"
        class="pagination-btn"
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
        </svg>
      </button>

      <div class="pagination-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="['pagination-number', { active: page === currentPage }]"
          :aria-label="`Page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="goToNext"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  scrollTargetId?: string
  perPageOptions?: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:itemsPerPage': [itemsPerPage: number]
}>()

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 7
  
  if (totalPages.value <= maxVisible) {
    // Show all pages if total is less than max
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    // Calculate range around current page
    let start = Math.max(2, props.currentPage - 2)
    let end = Math.min(totalPages.value - 1, props.currentPage + 2)
    
    // Adjust range if too close to edges
    if (props.currentPage <= 3) {
      end = 5
    } else if (props.currentPage >= totalPages.value - 2) {
      start = totalPages.value - 4
    }
    
    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // Always show last page
    if (totalPages.value > 1) {
      pages.push(totalPages.value)
    }
  }
  
  return pages
})

const goToPage = (page: number) => {
  if (page !== props.currentPage && page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
    
    // Smooth scroll to target element or top of page
    if (props.scrollTargetId) {
      const target = document.getElementById(props.scrollTargetId)
      if (target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 100
        window.scrollTo({ top: targetPosition, behavior: 'smooth' })
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const goToPrevious = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

const goToNext = () => {
  if (props.currentPage < totalPages.value) {
    goToPage(props.currentPage + 1)
  }
}

const handlePerPageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newItemsPerPage = parseInt(target.value, 10)
  emit('update:itemsPerPage', newItemsPerPage)
  
  // Reset to first page when items per page changes
  if (props.currentPage !== 1) {
    emit('update:currentPage', 1)
  }
  
  // Scroll to target
  if (props.scrollTargetId) {
    const targetEl = document.getElementById(props.scrollTargetId)
    if (targetEl) {
      const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - 100
      window.scrollTo({ top: targetPosition, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 0;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  margin-top: 4rem;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.pagination-info {
  letter-spacing: 0.05em;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.per-page-selector label {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.per-page-select {
  min-width: 70px;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.12);
  cursor: pointer;
  transition: all var(--transition-base);
  letter-spacing: 0.02em;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%232a2a2a' stroke-width='1.5' stroke-linecap='square'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
}

.per-page-select:hover {
  border-color: var(--color-text-primary);
}

.per-page-select:focus {
  outline: none;
  border-color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.12);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
  margin: 0 1rem;
}

.pagination-number {
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all var(--transition-base);
}

.pagination-number:hover {
  color: var(--color-text-primary);
  border-color: rgba(42, 42, 42, 0.12);
}

.pagination-number.active {
  color: var(--color-bg-primary);
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .pagination-left {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }

  .pagination-numbers {
    margin: 0 0.5rem;
  }

  .pagination-number {
    min-width: 36px;
    height: 36px;
    padding: 0 0.5rem;
  }

  .pagination-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
