import { ref, watch } from 'vue'

const STORAGE_KEY = 'pl_sidebar_collapsed'

function load(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const collapsed = ref<boolean>(load())

watch(collapsed, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, val ? '1' : '0')
  } catch {
    /* ignore */
  }
})

export function useSidebarCollapsed() {
  const toggle = () => {
    collapsed.value = !collapsed.value
  }
  return { collapsed, toggle }
}
