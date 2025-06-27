<template>
  <li class="task-item" :class="{ 'completed': task.completed }">
    <div class="task-content">
      <div class="checkbox-container">
        <input 
          type="checkbox" 
          :checked="task.completed" 
          @change="$emit('toggle', task)"
          class="task-checkbox"
        />
      </div>
      
      <!-- Display mode -->
      <div 
        v-if="!isEditing" 
        @dblclick="startEdit"
        class="task-title"
      >
        {{ task.title }}
      </div>
      
      <!-- Edit mode -->
      <div v-else class="edit-mode">
        <div class="edit-input-wrapper">
          <input 
            v-model="editTitle" 
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            @blur="saveEdit"
            ref="editInput"
            class="edit-input"
            :class="{ 'error': hasValidationError }"
            type="text"
          />
          <div v-if="hasValidationError" class="edit-error-indicator">⚠️</div>
        </div>
        <div class="edit-buttons">
          <button @click="saveEdit" class="save-btn" title="Save">
            <span>✓</span>
          </button>
          <button @click="cancelEdit" class="cancel-btn" title="Cancel">
            <span>✗</span>
          </button>
        </div>
      </div>
    </div>
    
    <button @click="$emit('delete', task.id)" class="delete-btn" title="Delete task">
      🗑️
    </button>
  </li>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  task: { id: number; title: string; completed: boolean }
}>()

const emit = defineEmits(["delete", "toggle", "update"])

const isEditing = ref(false)
const editTitle = ref("")
const editInput = ref<HTMLInputElement>()
const hasValidationError = ref(false)

const startEdit = () => {
  editTitle.value = props.task.title
  isEditing.value = true
  hasValidationError.value = false
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

const saveEdit = () => {
  if (editTitle.value.trim() && editTitle.value !== props.task.title) {
    const result = emit('update', { id: props.task.id, title: editTitle.value.trim() })
    // If the update fails due to validation, show error state
    if (result === null) {
      hasValidationError.value = true
      return
    }
  }
  isEditing.value = false
  hasValidationError.value = false
}

const cancelEdit = () => {
  editTitle.value = props.task.title
  isEditing.value = false
  hasValidationError.value = false
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  gap: 12px;
}

.task-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.task-item.completed {
  background: #f1f3f4;
  border-color: #d1d5db;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #6b7280;
}

.task-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
  min-width: 0;
}

.checkbox-container {
  flex-shrink: 0;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  accent-color: #667eea;
}

.task-checkbox:checked {
  border-color: #667eea;
  background-color: #667eea;
}

.task-title {
  flex: 1;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  word-break: break-word;
  line-height: 1.4;
}

.task-title:hover {
  background-color: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.edit-mode {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.edit-input-wrapper {
  flex: 1;
  position: relative;
}

.edit-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #374151;
  transition: all 0.2s ease;
}

.edit-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.edit-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.edit-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.edit-error-indicator {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  color: #ef4444;
  font-size: 14px;
}

.edit-buttons {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.save-btn, .cancel-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.save-btn {
  background-color: #10b981;
  color: white;
}

.save-btn:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.cancel-btn {
  background-color: #ef4444;
  color: white;
}

.cancel-btn:hover {
  background-color: #dc2626;
  transform: scale(1.05);
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.6;
  flex-shrink: 0;
}

.delete-btn:hover {
  opacity: 1;
  background-color: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .task-item {
    padding: 12px 16px;
  }
  
  .edit-mode {
    flex-direction: column;
    align-items: stretch;
  }
  
  .edit-buttons {
    justify-content: center;
  }
}
</style>
