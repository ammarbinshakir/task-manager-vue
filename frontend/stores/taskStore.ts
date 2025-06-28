import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";
import { useToastNotifications } from "../composables/useToast";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const useTaskStore = defineStore("tasks", () => {
  const { showSuccess, showError, showInfo } = useToastNotifications();

  // State
  const tasks = shallowRef<Task[]>([]);
  const filterText = ref("");
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const validationErrors = ref<ValidationError[]>([]);

  // Getters (computed)
  const filteredTasks = computed(() => {
    let result = tasks.value;

    // Apply filter if filterText exists
    if (filterText.value) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(filterText.value.toLowerCase())
      );
    }

    // Sort by ID in descending order (latest first)
    return result.sort((a, b) => b.id - a.id);
  });

  const completedTasksCount = computed(() => {
    return tasks.value.filter((task) => task.completed).length;
  });

  const pendingTasksCount = computed(() => {
    return tasks.value.filter((task) => !task.completed).length;
  });

  const hasValidationErrors = computed(() => validationErrors.value.length > 0);

  // Actions
  const validateTaskTitle = (
    title: string,
    excludeId?: number
  ): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check for empty title
    if (!title || !title.trim()) {
      errors.push({
        field: "title",
        message: "Task title cannot be empty",
      });
      return errors;
    }

    // Check for minimum length
    if (title.trim().length < 2) {
      errors.push({
        field: "title",
        message: "Task title must be at least 2 characters long",
      });
    }

    // Check for maximum length
    if (title.trim().length > 100) {
      errors.push({
        field: "title",
        message: "Task title cannot exceed 100 characters",
      });
    }

    // Check for duplicate titles (case-insensitive)
    const normalizedTitle = title.trim().toLowerCase();
    const isDuplicate = tasks.value.some(
      (task) =>
        task.title.toLowerCase() === normalizedTitle && task.id !== excludeId
    );

    if (isDuplicate) {
      errors.push({
        field: "title",
        message: "A task with this title already exists",
      });
    }

    return errors;
  };

  const clearValidationErrors = () => {
    validationErrors.value = [];
  };

  const fetchTasks = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      clearValidationErrors();
      const response = await fetch("http://localhost:3001/tasks");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      tasks.value = data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch tasks";
      error.value = errorMessage;
      console.error("Error fetching tasks:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const addTask = async (title: string) => {
    console.log("Store addTask called with:", title);
    console.log(
      "Current tasks:",
      tasks.value.map((t) => t.title)
    );
    clearValidationErrors();

    // Validate the task title
    const errors = validateTaskTitle(title);
    console.log("Validation errors:", errors);
    if (errors.length > 0) {
      validationErrors.value = errors;
      console.log("Validation failed, returning null");
      // Show toast for validation errors
      const errorMessage = errors.map((err) => err.message).join(", ");
      console.log("About to show error toast with message:", errorMessage);
      showError(errorMessage);
      console.log("Toast should have been shown");
      return null;
    }

    try {
      isLoading.value = true;
      error.value = null;
      console.log("Making API request to add task");
      const response = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          completed: false,
        }),
      });

      console.log("API response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTask = await response.json();
      console.log("New task created:", newTask);
      tasks.value.push(newTask);
      showSuccess("Task added successfully!");
      return newTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add task";
      error.value = errorMessage;
      showError(errorMessage);
      console.error("Error adding task:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      isLoading.value = true;
      error.value = null;
      clearValidationErrors();
      const response = await fetch(`http://localhost:3001/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      tasks.value = tasks.value.filter((t) => t.id !== id);
      showSuccess("Task deleted successfully!");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete task";
      error.value = errorMessage;
      showError(errorMessage);
      console.error("Error deleting task:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      error.value = null;
      clearValidationErrors();
      const response = await fetch(`http://localhost:3001/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      const index = tasks.value.findIndex((t) => t.id === task.id);
      if (index !== -1) {
        // Use Object.assign to update only the changed properties
        Object.assign(tasks.value[index], updatedTask);
      }
      return updatedTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle task";
      error.value = errorMessage;
      showError(errorMessage);
      console.error("Error toggling task:", err);
      return null;
    }
  };

  const updateTask = async (updateData: { id: number; title: string }) => {
    clearValidationErrors();

    // Validate the task title (excluding current task from duplicate check)
    const errors = validateTaskTitle(updateData.title, updateData.id);
    if (errors.length > 0) {
      validationErrors.value = errors;
      // Show toast for validation errors
      const errorMessage = errors.map((err) => err.message).join(", ");
      showError(errorMessage);
      return null;
    }

    try {
      isLoading.value = true;
      error.value = null;
      const response = await fetch(
        `http://localhost:3001/tasks/${updateData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updateData.title.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      const index = tasks.value.findIndex((t) => t.id === updateData.id);
      if (index !== -1) {
        // Use Object.assign to update only the changed properties
        Object.assign(tasks.value[index], updatedTask);
      }
      showSuccess("Task updated successfully!");
      return updatedTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update task";
      error.value = errorMessage;
      showError(errorMessage);
      console.error("Error updating task:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const setFilterText = (text: string) => {
    filterText.value = text;
  };

  const clearFilter = () => {
    filterText.value = "";
  };

  const getTaskById = (id: number) => {
    return tasks.value.find((task) => task.id === id);
  };

  const clearCompleted = async () => {
    const completedTasks = tasks.value.filter((task) => task.completed);
    const deletePromises = completedTasks.map((task) => deleteTask(task.id));

    try {
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Error clearing completed tasks:", err);
    }
  };

  return {
    // State
    tasks,
    filterText,
    isLoading,
    error,
    validationErrors,

    // Getters
    filteredTasks,
    completedTasksCount,
    pendingTasksCount,
    hasValidationErrors,

    // Actions
    fetchTasks,
    addTask,
    deleteTask,
    toggleTask,
    updateTask,
    setFilterText,
    clearFilter,
    getTaskById,
    clearCompleted,
    validateTaskTitle,
    clearValidationErrors,
  };
});
