<template>
  <li class="task-item" :class="{ 'completed': task.completed }">
    <div class="task-content">
      <div class="checkbox-container">
        <label class="modern-checkbox" :class="{ 'toggling': isToggling }">
          <input 
            type="checkbox" 
            :checked="task.completed" 
            @change="handleToggle"
            class="task-checkbox"
            :disabled="isToggling"
          />
          <span class="checkmark"></span>
        </label>
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
            placeholder="Edit task title..."
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            @blur="saveEdit"
            ref="editInput"
            class="edit-input"
          />
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
import { ref, nextTick, computed } from 'vue'

const props = defineProps<{
  task: { id: number; title: string; completed: boolean }
}>()

const emit = defineEmits(["delete", "toggle", "update"])

const isEditing = ref(false)
const editTitle = ref("")
const editInput = ref<HTMLInputElement>()
const isToggling = ref(false)

// Memoize the task to prevent unnecessary re-renders
const task = computed(() => props.task)

const startEdit = () => {
  editTitle.value = task.value.title
  isEditing.value = true
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

const saveEdit = async () => {
  if (editTitle.value.trim() && editTitle.value !== task.value.title) {
    const { useTaskStore } = await import('../stores/taskStore')
    const taskStore = useTaskStore()
    const result = await taskStore.updateTask({ id: task.value.id, title: editTitle.value.trim() })
    if (result === null) {
      return
    }
  }
  isEditing.value = false
}

const cancelEdit = () => {
  editTitle.value = task.value.title
  isEditing.value = false
}

const handleToggle = async () => {
  if (isToggling.value) return
  isToggling.value = true
  try {
    const result = await emit('toggle', task.value)
    if (result === null) {
      // If toggle failed, revert the checkbox state
    }
  } catch (error) {
    console.error('Error toggling task:', error)
  } finally {
    isToggling.value = false
  }
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

.modern-checkbox {
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
}

.task-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 22px;
  width: 22px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-checkbox:hover .checkmark {
  border-color: #667eea;
  transform: scale(1.05);
}

.modern-checkbox.toggling .checkmark {
  opacity: 0.7;
  pointer-events: none;
}

.modern-checkbox.toggling .checkmark:after {
  animation: checkmark-pulse 1s infinite;
}

@keyframes checkmark-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.task-checkbox:checked ~ .checkmark {
  background-color: #667eea;
  border-color: #667eea;
  animation: checkmark-pop 0.2s ease;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-checkbox:checked ~ .checkmark:after {
  display: block;
  animation: checkmark-draw 0.2s ease;
}

@keyframes checkmark-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes checkmark-draw {
  0% {
    opacity: 0;
    transform: rotate(45deg) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
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
