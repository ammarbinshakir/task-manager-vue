<template>
  <div class="task-manager">
    <header class="header">
      <h1>📝 Task Manager</h1>
      <p class="subtitle">Organize your tasks efficiently</p>
    </header>

    <main class="main-content">
      <!-- Error Display -->
      <div v-if="taskStore.error" class="error-message">
        <span>⚠️ {{ taskStore.error }}</span>
        <button @click="taskStore.fetchTasks" class="retry-btn">Retry</button>
      </div>

      <div class="input-section">
        <form @submit.prevent="handleAddTask" class="add-task-form">
          <div class="add-task-container">
            <div class="input-wrapper">
              <input
                v-model="newTask"
                placeholder="What needs to be done?"
                class="add-task-input"
                :disabled="taskStore.isLoading"
                @keyup.enter="handleAddTask"
              />
            </div>
            <button 
              type="submit" 
              class="add-task-btn" 
              :disabled="!isFormValid || taskStore.isLoading"
            >
              ➕ Add Task
            </button>
          </div>
        </form>
        
        <div class="filter-container">
          <input
            v-model="taskStore.filterText"
            placeholder="🔍 Filter tasks..."
            class="filter-input"
            @input="(e: Event) => taskStore.setFilterText((e.target as HTMLInputElement).value)"
            :disabled="taskStore.isLoading"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="taskStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>

      <div v-else class="tasks-section">
        <div v-if="taskStore.filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p v-if="taskStore.filterText">{{ `No tasks match "${taskStore.filterText}"` }}</p>
          <p v-else>No tasks yet. Add your first task above!</p>
        </div>
        
        <ul v-else class="tasks-list">
          <TaskItem
            v-for="task in taskStore.filteredTasks"
            :key="task.id"
            :task="task"
            @delete="taskStore.deleteTask"
            @toggle="taskStore.toggleTask"
            @update="taskStore.updateTask"
          />
        </ul>

        <!-- Task Statistics -->
        <div v-if="taskStore.tasks.length > 0" class="task-stats">
          <span>{{ taskStore.pendingTasksCount }} pending</span>
          <span>{{ taskStore.completedTasksCount }} completed</span>
          <button v-if="taskStore.completedTasksCount > 0" @click="taskStore.clearCompleted" class="clear-completed-btn">
            Clear completed
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useForm } from 'vee-validate'
import TaskItem from '../components/TaskItem.vue'
import ValidatedInput from '../components/ValidatedInput.vue'
import { useTaskStore } from '../stores/taskStore'
import { taskTitleRules, filterRules } from '../utils/validationSchemas'

// Use the Pinia task store
const taskStore = useTaskStore()

// Form validation
const { handleSubmit, errors, meta } = useForm({
  validationSchema: {
    taskTitle: taskTitleRules,
    filterText: filterRules
  }
})

// Local state for new task input
const newTask = ref("")

// Computed form validity - simplified logic
const isFormValid = computed(() => {
  const trimmedValue = newTask.value.trim()
  return trimmedValue.length >= 2 && 
         trimmedValue.length <= 100
})

// Handle adding a new task with validation
const handleAddTask = async () => {
  console.log('handleAddTask called with:', newTask.value)
  if (!newTask.value.trim()) {
    console.log('Task is empty, returning')
    return
  }
  
  console.log('Calling taskStore.addTask with:', newTask.value)
  const result = await taskStore.addTask(newTask.value)
  console.log('addTask result:', result)
  
  if (result) {
    newTask.value = "" // Clear input only on success
    console.log('Task added successfully, input cleared')
  } else {
    console.log('Failed to add task')
  }
}

// Initialize tasks on component mount
onMounted(taskStore.fetchTasks)
</script>

<style scoped>
/* Global reset to ensure gradient background covers entire page */
:global(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:global(body) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.task-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.main-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background: #b91c1c;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.input-section {
  margin-bottom: 30px;
}

.add-task-container {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.add-task-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #374151 !important;
}

.add-task-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  color: #374151 !important;
}

.add-task-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #6b7280 !important;
}

.add-task-input::placeholder {
  color: #9ca3af !important;
}

.add-task-form {
  width: 100%;
}

.add-task-btn {
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  height: fit-content;
  align-self: flex-start;
  margin-top: 0;
}

.add-task-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.add-task-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.filter-container {
  position: relative;
}

.filter-input {
  width: 100%;
  padding: 14px 20px 14px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8f9fa;
  /* background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'); */
  /* background-repeat: no-repeat; */
  /* background-position: 20px center; */
  /* background-size: 20px; */
  transition: all 0.3s ease;
  box-sizing: border-box;
  color: #374151 !important;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  /* background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23667eea" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'); */
  /* background-repeat: no-repeat;
  background-position: 20px center; */
  /* background-size: 20px; */
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  color: #374151 !important;
}

.filter-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #6b7280 !important;
}

.filter-input::placeholder {
  color: #9ca3af !important;
}

@media (max-width: 768px) {
  .task-manager {
    padding: 15px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .add-task-container {
    flex-direction: column;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .task-stats {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}

.tasks-section {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;
}

.tasks-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
}

.clear-completed-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.clear-completed-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.validation-errors {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.validation-error {
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.validation-error:last-child {
  margin-bottom: 0;
}
</style>
