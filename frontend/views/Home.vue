<template>
  <div class="task-manager">
    <header class="header">
      <h1>📝 Task Manager</h1>
      <p class="subtitle">Organize your tasks efficiently</p>
    </header>

    <main class="main-content">
      <!-- Error Display -->
      <div v-if="error" class="error-message">
        <span>⚠️ {{ error }}</span>
        <button @click="fetchTasks" class="retry-btn">Retry</button>
      </div>

      <!-- Validation Errors Display -->
      <div v-if="hasValidationErrors" class="validation-errors">
        <div v-for="validationError in validationErrors" :key="validationError.field" class="validation-error">
          <span>⚠️ {{ validationError.message }}</span>
        </div>
      </div>

      <div class="input-section">
        <div class="add-task-container">
          <div class="input-wrapper">
            <input 
              v-model="newTask" 
              placeholder="What needs to be done?" 
              @keyup.enter="handleAddTask"
              class="add-task-input"
              :class="{ 'error': hasValidationErrors }"
              :disabled="isLoading"
            />
            <div v-if="hasValidationErrors" class="input-error-indicator">⚠️</div>
          </div>
          <button @click="handleAddTask" class="add-task-btn" :disabled="!newTask.trim() || isLoading">
            ➕ Add Task
          </button>
        </div>
        
        <div class="filter-container">
          <input 
            v-model="filterText" 
            placeholder="🔍 Filter tasks..." 
            @input="(e) => setFilterText((e.target as HTMLInputElement).value)"
            class="filter-input"
            :disabled="isLoading"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>

      <div v-else class="tasks-section">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p v-if="filterText">{{ `No tasks match "${filterText}"` }}</p>
          <p v-else>No tasks yet. Add your first task above!</p>
        </div>
        
        <ul v-else class="tasks-list">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @delete="deleteTask"
            @toggle="toggleTask"
            @update="updateTask"
          />
        </ul>

        <!-- Task Statistics -->
        <div v-if="tasks.length > 0" class="task-stats">
          <span>{{ pendingTasksCount }} pending</span>
          <span>{{ completedTasksCount }} completed</span>
          <button v-if="completedTasksCount > 0" @click="clearCompleted" class="clear-completed-btn">
            Clear completed
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TaskItem from '../components/TaskItem.vue'
import { useTasks } from '../composables/useTasks'

// Use the tasks composable
const {
  tasks,
  filterText,
  isLoading,
  error,
  filteredTasks,
  completedTasksCount,
  pendingTasksCount,
  fetchTasks,
  addTask,
  deleteTask,
  toggleTask,
  updateTask,
  setFilterText,
  clearCompleted,
  hasValidationErrors,
  validationErrors
} = useTasks()

// Local state for new task input
const newTask = ref("")

// Handle adding a new task
const handleAddTask = async () => {
  if (!newTask.value.trim()) return
  
  const result = await addTask(newTask.value)
  if (result) {
    newTask.value = "" // Clear input only on success
  }
}

// Initialize tasks on component mount
onMounted(fetchTasks)
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
}

.add-task-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-task-input.error {
  border-color: #dc2626;
  background: #fef2f2;
}

.add-task-input.error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-error-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #dc2626;
  font-size: 1.2rem;
  pointer-events: none;
}

.add-task-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  padding: 14px 20px 14px 50px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8f9fa;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>');
  background-repeat: no-repeat;
  background-position: 20px center;
  background-size: 20px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23667eea" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>');
  background-repeat: no-repeat;
  background-position: 20px center;
  background-size: 20px;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
</style>
