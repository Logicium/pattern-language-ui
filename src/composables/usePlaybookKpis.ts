import { ref } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'

export function usePlaybookKpis(playbook: any, showToast: any, toastMessage: any) {
  const playbooksStore = usePlaybooksStore()

  const editingKpiId = ref<string | null>(null)
  const editingKpi = ref({ target: '', currentProgress: '' })

  const formatKpiCategory = (category: string) => {
    switch (category) {
      case 'participation': return 'Participation'
      case 'diversity-collaboration': return 'Diversity & Collaboration'
      case 'pattern-specific': return 'Pattern-Specific'
      default: return category
    }
  }

  const startEditingKpi = (kpi: any) => {
    editingKpiId.value = kpi.id
    editingKpi.value = {
      target: kpi.target || '',
      currentProgress: kpi.currentProgress || ''
    }
  }

  const cancelKpiEdit = () => {
    editingKpiId.value = null
    editingKpi.value = { target: '', currentProgress: '' }
  }

  const saveKpiEdit = () => {
    if (!playbook.value || !editingKpiId.value) return
    const updatedKpis = playbook.value.kpis?.map((kpi: any) =>
      kpi.id === editingKpiId.value
        ? {
            ...kpi,
            target: editingKpi.value.target.trim(),
            currentProgress: editingKpi.value.currentProgress.trim()
          }
        : kpi
    )
    playbooksStore.updatePlaybook(playbook.value.id, { kpis: updatedKpis })
    toastMessage.value = 'KPI updated successfully'
    showToast.value = true
    cancelKpiEdit()
  }

  const calculateKpiProgress = (kpi: any): number => {
    if (!kpi.target || !kpi.currentProgress) return 0
    const target = kpi.target.toString()
    const current = kpi.currentProgress.toString()

    if (current.includes('/')) {
      const [numerator, denominator] = current.split('/').map((s: string) => parseFloat(s.trim()))
      if (denominator && denominator > 0) {
        return Math.min(100, Math.round((numerator / denominator) * 100))
      }
    }

    const targetNum = parseFloat(target.replace(/[^\d.]/g, ''))
    const currentNum = parseFloat(current.replace(/[^\d.]/g, ''))
    if (!isNaN(targetNum) && !isNaN(currentNum) && targetNum > 0) {
      return Math.min(100, Math.round((currentNum / targetNum) * 100))
    }
    return 0
  }

  return {
    editingKpiId,
    editingKpi,
    formatKpiCategory,
    startEditingKpi,
    cancelKpiEdit,
    saveKpiEdit,
    calculateKpiProgress,
  }
}
