<template>
  <div class="full-playbook-page">
    <div v-if="playbook">
      <!-- Hero -->
      <PlaybookHero :playbook="playbook" />

      <!-- Tab Navigation -->
      <div class="playbook-tabs-bar">
        <div class="container">
          <nav class="playbook-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="playbook-tab text-xs"
              :class="{ 'tab-active': activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Content -->
      <section class="section playbook-content">
        <div class="container">
          <div class="content-layout">

            <!-- TAB: Playbook (Main) -->
            <template v-if="activeTab === 'playbook'">
              <!-- Overview -->
              <PlaybookOverview
                :playbook="playbook"
                :members="members"
                :user-role="userRole"
                :is-user-member="isUserMember"
                :is-generating="isGenerating"
                :loading="loading"
                @open-pattern="openPatternModal"
                @open-challenge="openChallengeModal"
              />

              <!-- Summary -->
              <PlaybookSummary :playbook="playbook" />

              <!-- KPIs -->
              <PlaybookKpis
                :playbook="playbook"
                :is-user-member="isUserMember"
                :editing-kpi-id="editingKpiId"
                :editing-kpi="editingKpi"
                :format-kpi-category="formatKpiCategory"
                :calculate-kpi-progress="calculateKpiProgress"
                @start-edit="startEditingKpi"
                @save-edit="saveKpiEdit"
                @cancel-edit="cancelKpiEdit"
                @update:editing-kpi="editingKpi = $event"
              />

              <!-- Tasks -->
              <PlaybookTasks
                :playbook="playbook"
                :is-user-member="isUserMember"
                :is-adding-task="isAddingTask"
                :new-task="newTask"
                :editing-task-id="editingTaskId"
                :editing-task="editingTask"
                :expanded-task-notes="expandedTaskNotes"
                :task-notes="taskNotes"
                :completed-tasks-count="completedTasksCount"
                :sections="sections"
                :ungrouped-tasks="ungroupedTasks"
                :get-tasks-for-section="getTasksForSection"
                :is-adding-section="isAddingSection"
                :new-section-title="newSectionTitle"
                :editing-section-id="editingSectionId"
                :editing-section-title="editingSectionTitle"
                @start-adding-task="startAddingTask"
                @update:new-task="newTask = $event"
                @save-new-task="saveNewTask"
                @cancel-adding-task="cancelAddingTask"
                @toggle-task="toggleTask"
                @view-task="onViewTask"
                @start-edit-task="startEditingTask"
                @toggle-notes="toggleTaskNotes"
                @save-task-edit="saveTaskEdit"
                @cancel-task-edit="cancelTaskEdit"
                @delete-task="confirmDeleteTask"
                @update-notes="onUpdateNotes"
                @update:editing-task="editingTask = $event"
                @start-adding-section="startAddingSection"
                @cancel-adding-section="cancelAddingSection"
                @save-new-section="saveNewSection"
                @update:new-section-title="newSectionTitle = $event"
                @start-editing-section="startEditingSection"
                @cancel-section-edit="cancelSectionEdit"
                @save-section-edit="saveSectionEdit"
                @update:editing-section-title="editingSectionTitle = $event"
                @delete-section="confirmDeleteSection"
                @sections-reorder="onSectionsReorder"
                @tasks-reorder="onTasksReorder"
              />

              <!-- Notes & Learnings -->
              <PlaybookNotes
                :playbook="playbook"
                :is-user-member="isUserMember"
                :is-editing-notes="isEditingNotes"
                :editable-notes="editableNotes"
                @start-editing-notes="startEditingNotes"
                @update:editable-notes="editableNotes = $event"
                @save-notes="saveNotes"
                @cancel-editing-notes="cancelEditingNotes"
              />

              <!-- Resources -->
              <PlaybookResources
                :playbook="playbook"
                :is-user-member="isUserMember"
                :is-editing-resources="isEditingResources"
                @start-editing-resources="startEditingResources"
                @cancel-editing-resources="cancelEditingResources"
                @confirm-delete-resource="confirmDeleteResource"
              />
            </template>

            <!-- TAB: Calendar -->
            <template v-if="activeTab === 'calendar'">
              <PlaybookCalendarTab
                :playbook="playbook"
                :is-user-member="isUserMember"
              />
            </template>

            <!-- TAB: Collaboration -->
            <template v-if="activeTab === 'collaboration'">
              <PlaybookCollaborationTab
                :playbook="playbook"
                :members="members"
                :user-role="userRole"
                :is-user-member="isUserMember"
                :is-generating="isGenerating"
                :loading="loading"
                @invite-member="showInviteMemberModal = true"
                @remove-member="removeMember"
                @toggle-publish="togglePublishState"
                @mark-complete="markComplete"
                @generate-story="generateSuccessStory"
                @toggle-pause="togglePause"
                @show-delete="showDeleteModal = true"
                @request-join="requestToJoin"
              />
            </template>

            <!-- TAB: Discussion -->
            <template v-if="activeTab === 'discussion'">
              <PlaybookDiscussionTab
                :playbook="playbook"
                :members="members"
                :is-user-member="isUserMember"
              />
            </template>

            <!-- TAB: Activity -->
            <template v-if="activeTab === 'activity'">
              <PlaybookActivityTab :playbook="playbook" />
            </template>

            <!-- Navigation -->
            <div class="content-nav">
              <router-link to="/dashboard/playbooks" class="nav-link text-xs">
                ← All Playbooks
              </router-link>
              <router-link to="/dashboard/stories" class="nav-link text-xs">
                Success Stories →
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Not Found State -->
    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Playbook not found</p>
      <router-link to="/dashboard/playbooks" class="btn" style="margin-top: 2rem;">
        Back to Playbooks
      </router-link>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete Playbook"
      message="Are you sure you want to delete this playbook? This action cannot be undone and all associated data will be lost."
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDelete"
    />

    <!-- Delete Task Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteTaskModal"
      title="Delete Task"
      message="Are you sure you want to delete this task? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDeleteTask(refreshPlaybook)"
    />

    <!-- Delete Resource Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteResourceModal"
      title="Delete Resource"
      message="Are you sure you want to remove this resource from the playbook?"
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDeleteResource"
    />

    <!-- Delete Section Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteSectionModal"
      title="Delete Section"
      message="Are you sure you want to delete this section? Tasks in this section will be moved to ungrouped."
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDeleteSection"
    />

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      @update:show="showToast = $event"
    />

    <!-- Full Task Page Modal -->
    <FullTaskPage
      v-model="showTaskDetailsModal"
      :playbook="playbook"
      :task="selectedTask"
      :members="members"
      :userRole="userRole"
      @refresh="refreshPlaybook"
    />

    <!-- Invite Member Slide-In Modal -->
    <InviteMemberPanel
      v-model="showInviteMemberModal"
      :search-query="searchQuery"
      :filtered-available-users="filteredAvailableUsers"
      :invited-user-ids="invitedUserIds"
      :loading="loading"
      @update:search-query="searchQuery = $event"
      @invite-user="inviteUser"
    />

    <!-- Pattern Slide-In Modal -->
    <SlideInModal v-model="showPatternModal">
      <div v-if="selectedPattern" class="pattern-modal-content">
        <button class="close-button" @click="showPatternModal = false" title="Close">
          ← Back
        </button>
        <FullPatternPage :patternData="selectedPattern" :isModal="true" />
      </div>
    </SlideInModal>

    <!-- Challenge Slide-In Modal -->
    <SlideInModal v-model="showChallengeModal">
      <div v-if="selectedChallenge" class="challenge-modal-content">
        <button class="close-button" @click="showChallengeModal = false" title="Close">
          ← Back
        </button>
        <FullChallengePage :challengeData="selectedChallenge" :isModal="true" />
      </div>
    </SlideInModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ConfirmModal, Toast } from '@/components'
import FullTaskPage from '@/components/FullTaskPage.vue'
import SlideInModal from '@/components/SlideInModal.vue'
import FullPatternPage from '@/views/FullPatternPage.vue'
import FullChallengePage from '@/views/FullChallengePage.vue'
import PlaybookHero from '@/components/playbook/PlaybookHero.vue'
import PlaybookOverview from '@/components/playbook/PlaybookOverview.vue'
import PlaybookSummary from '@/components/playbook/PlaybookSummary.vue'
import PlaybookKpis from '@/components/playbook/PlaybookKpis.vue'
import PlaybookTasks from '@/components/playbook/PlaybookTasks.vue'
import PlaybookNotes from '@/components/playbook/PlaybookNotes.vue'
import PlaybookResources from '@/components/playbook/PlaybookResources.vue'
import InviteMemberPanel from '@/components/playbook/InviteMemberPanel.vue'
import PlaybookCollaborationTab from '@/components/playbook/PlaybookCollaborationTab.vue'
import PlaybookDiscussionTab from '@/components/playbook/PlaybookDiscussionTab.vue'
import PlaybookActivityTab from '@/components/playbook/PlaybookActivityTab.vue'
import PlaybookCalendarTab from '@/components/playbook/PlaybookCalendarTab.vue'

import { usePlaybookData } from '@/composables/usePlaybookData'
import { usePlaybookTasks } from '@/composables/usePlaybookTasks'
import { usePlaybookKpis } from '@/composables/usePlaybookKpis'
import { usePlaybookCollaboration } from '@/composables/usePlaybookCollaboration'
import { usePlaybookNotes } from '@/composables/usePlaybookNotes'
import type { Task } from '@/types/collaboration'

// Tabs
const activeTab = ref<'playbook' | 'calendar' | 'collaboration' | 'discussion' | 'activity'>('playbook')
const tabs = [
  { id: 'playbook' as const, label: 'Playbook' },
  { id: 'calendar' as const, label: 'Calendar' },
  { id: 'collaboration' as const, label: 'Team' },
  { id: 'discussion' as const, label: 'Discussion' },
  { id: 'activity' as const, label: 'Activity' },
]

// Core playbook data
const {
  loading,
  playbook,
  members,
  userRole,
  isUserMember,
  completedTasksCount,
  showToast,
  toastMessage,
  isGenerating,
  showPatternModal,
  showChallengeModal,
  selectedPattern,
  selectedChallenge,
  openPatternModal,
  openChallengeModal,
  markComplete,
  togglePause,
  generateSuccessStory,
  handleDelete,
  refreshPlaybook,
} = usePlaybookData()

// Tasks
const {
  isAddingTask,
  editingTaskId,
  newTask,
  editingTask,
  showDeleteTaskModal,
  expandedTaskNotes,
  taskNotes,
  sections,
  ungroupedTasks,
  getTasksForSection,
  isAddingSection,
  newSectionTitle,
  editingSectionId,
  editingSectionTitle,
  startAddingTask,
  cancelAddingTask,
  saveNewTask,
  startEditingTask,
  cancelTaskEdit,
  saveTaskEdit,
  confirmDeleteTask,
  handleDeleteTask,
  toggleTask,
  toggleTaskNotes,
  saveTaskNotes,
  startAddingSection,
  cancelAddingSection,
  saveNewSection,
  startEditingSection,
  cancelSectionEdit,
  saveSectionEdit,
  confirmDeleteSection,
  handleDeleteSection,
  showDeleteSectionModal,
  onSectionsReorder,
  onTasksReorder,
} = usePlaybookTasks(playbook, showToast, toastMessage)

// KPIs
const {
  editingKpiId,
  editingKpi,
  formatKpiCategory,
  startEditingKpi,
  cancelKpiEdit,
  saveKpiEdit,
  calculateKpiProgress,
} = usePlaybookKpis(playbook, showToast, toastMessage)

// Collaboration
const {
  showInviteMemberModal,
  searchQuery,
  invitedUserIds,
  filteredAvailableUsers,
  inviteUser,
  togglePublishState,
  requestToJoin,
  removeMember,
} = usePlaybookCollaboration(playbook, members, loading, showToast, toastMessage, refreshPlaybook)

// Notes & Resources
const {
  isEditingNotes,
  editableNotes,
  startEditingNotes,
  cancelEditingNotes,
  saveNotes,
  isEditingResources,
  showDeleteResourceModal,
  startEditingResources,
  cancelEditingResources,
  confirmDeleteResource,
  handleDeleteResource,
} = usePlaybookNotes(playbook, showToast, toastMessage)

// Task details modal
const showTaskDetailsModal = ref(false)
const selectedTask = ref<Task | null>(null)
const showDeleteModal = ref(false)

const onViewTask = (task: any) => {
  selectedTask.value = task
  showTaskDetailsModal.value = true
}

const onUpdateNotes = (taskId: string, value: string) => {
  taskNotes.value[taskId] = value
  saveTaskNotes(taskId)
}
</script>

<style scoped>
.full-playbook-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* Tab Navigation */
.playbook-tabs-bar {
  background: var(--color-bg-primary);
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
  position: sticky;
  top: 0;
  z-index: 20;
}

.playbook-tabs {
  display: flex;
  gap: 0;
}

.playbook-tab {
  padding: 1.25rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.playbook-tab:hover {
  color: var(--color-text-secondary);
}

.playbook-tab.tab-active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

.playbook-content {
  background: var(--color-bg-secondary);
  padding: 4rem var(--container-padding);
}

.content-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Navigation */
.content-nav {
  display: flex;
  justify-content: space-between;
  padding: 2rem 3rem;
  background: var(--color-bg-primary);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-base);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-link:hover {
  color: var(--color-text-primary);
}

/* Pattern and Challenge Modal Styles */
.pattern-modal-content,
.challenge-modal-content {
  padding: 0;
  min-height: 100vh;
}

.pattern-modal-content .close-button,
.challenge-modal-content .close-button {
  position: absolute;
  top: 2rem;
  left: 3rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e0e0e0;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  z-index: 10;
}

.pattern-modal-content .close-button:hover,
.challenge-modal-content .close-button:hover {
  background: white;
  color: var(--color-text-primary);
  border-color: #2c2c2c;
}

@media (max-width: 768px) {
  .content-nav {
    padding: 1.5rem 2rem;
  }

  .playbook-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .playbook-tab {
    padding: 1rem 1.25rem;
  }
}
</style>
