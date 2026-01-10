<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Invite to Playbook</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <!-- User Info -->
        <div v-if="user" class="user-info">
          <div 
            class="user-avatar" 
            :style="{ backgroundImage: user.profileImage ? `url(${user.profileImage})` : 'none' }"
          >
            {{ !user.profileImage ? getInitials(user.name) : '' }}
          </div>
          <div class="user-details">
            <h3>{{ user.name }}</h3>
            <p v-if="user.location">{{ user.location }}, {{ user.state }}</p>
          </div>
        </div>

        <!-- Select Playbook -->
        <div class="form-group">
          <label>Select Playbook</label>
          <select v-model="selectedPlaybookId" :disabled="loading">
            <option :value="null">Choose a playbook...</option>
            <option 
              v-for="playbook in myPlaybooks" 
              :key="playbook.id"
              :value="playbook.id"
            >
              {{ playbook.patternTitle }}
            </option>
          </select>
        </div>

        <!-- Optional Message -->
        <div class="form-group">
          <label>Message (optional)</label>
          <textarea 
            v-model="message"
            placeholder="Add a personal message to your invitation..."
            rows="4"
            :disabled="loading"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="success-message">
          Invitation sent successfully!
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')" :disabled="loading">
          Cancel
        </button>
        <button 
          class="btn-primary" 
          @click="sendInvitation"
          :disabled="!selectedPlaybookId || loading"
        >
          {{ loading ? 'Sending...' : 'Send Invitation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { playbooksApi } from '../services/api'

interface Props {
  show: boolean
  user: {
    id: number
    name: string
    profileImage?: string
    location?: string
    state?: string
  } | null
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'invited'])

const myPlaybooks = ref<any[]>([])
const selectedPlaybookId = ref<number | null>(null)
const message = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const loadMyPlaybooks = async () => {
  try {
    const playbooks = await playbooksApi.getAll()
    myPlaybooks.value = playbooks
  } catch (err) {
    console.error('Failed to load playbooks:', err)
  }
}

const sendInvitation = async () => {
  if (!props.user || !selectedPlaybookId.value) return

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await playbooksApi.invite(
      selectedPlaybookId.value,
      props.user.id,
      message.value.trim() || undefined
    )
    
    success.value = true
    
    // Close modal after short delay
    setTimeout(() => {
      emit('invited')
      emit('close')
    }, 1500)
  } catch (err: any) {
    console.error('Failed to send invitation:', err)
    error.value = err.message || 'Failed to send invitation. They may already be a member or have a pending invitation.'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  selectedPlaybookId.value = null
  message.value = ''
  error.value = ''
  success.value = false
}

watch(() => props.show, (show) => {
  if (show) {
    resetForm()
    loadMyPlaybooks()
  }
})

onMounted(() => {
  if (props.show) {
    loadMyPlaybooks()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  color: #2c2c2c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  font-weight: 300;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #2c2c2c;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  margin-bottom: 24px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  background: #e8b4a0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 20px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.user-details h3 {
  font-size: 18px;
  font-weight: 400;
  margin: 0 0 4px 0;
  color: #2c2c2c;
}

.user-details p {
  font-size: 14px;
  font-weight: 300;
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 8px;
  color: #2c2c2c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  font-family: inherit;
  font-size: 15px;
  font-weight: 300;
  background: white;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e8b4a0;
}

.form-group textarea {
  resize: vertical;
}

.error-message {
  padding: 12px;
  background: #fee;
  color: #c33;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 16px;
}

.success-message {
  padding: 12px;
  background: #efe;
  color: #3c3;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 16px;
}

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 12px 32px;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary {
  background: #2c2c2c;
  color: white;
}

.btn-secondary {
  background: white;
  color: #2c2c2c;
  border: 1px solid #ddd;
}

.btn-primary:hover,
.btn-secondary:hover {
  opacity: 0.8;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
