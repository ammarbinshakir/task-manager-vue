import * as yup from "yup";
import { useTaskStore } from "../stores/taskStore";

// Task title validation schema
export const taskTitleSchema = yup.object({
  title: yup
    .string()
    .required("Task title is required")
    .min(2, "Task title must be at least 2 characters")
    .max(100, "Task title cannot exceed 100 characters")
    .test(
      "unique-title",
      "A task with this title already exists",
      async function (value) {
        if (!value) return true; // Let required validation handle empty values

        const taskStore = useTaskStore();
        const normalizedTitle = value.trim().toLowerCase();

        // Check if title already exists (excluding current task if editing)
        const context = this.options.context;
        const excludeId = context?.excludeId;

        const isDuplicate = taskStore.tasks.some(
          (task) =>
            task.title.toLowerCase() === normalizedTitle &&
            task.id !== excludeId
        );

        return !isDuplicate;
      }
    ),
});

// Filter validation schema
export const filterSchema = yup.object({
  filter: yup.string().max(50, "Filter text cannot exceed 50 characters"),
});

// Form validation schema
export const taskFormSchema = yup.object({
  title: taskTitleSchema.fields.title,
});

// Async validation function for task titles
export const validateTaskTitleAsync = async (
  title: string,
  excludeId?: number
): Promise<boolean> => {
  try {
    await taskTitleSchema.validateAt(
      "title",
      { title },
      { context: { excludeId } }
    );
    return true;
  } catch (error) {
    return false;
  }
};

// Validation rules for Vee-Validate
export const taskTitleRules = {
  required: (value: string) => !!value || "Task title is required",
  minLength: (value: string) =>
    value.length >= 2 || "Task title must be at least 2 characters",
  maxLength: (value: string) =>
    value.length <= 100 || "Task title cannot exceed 100 characters",
  unique: async (value: string) => {
    if (!value) return true;
    const taskStore = useTaskStore();
    const normalizedTitle = value.trim().toLowerCase();
    const isDuplicate = taskStore.tasks.some(
      (task) => task.title.toLowerCase() === normalizedTitle
    );
    return !isDuplicate || "A task with this title already exists";
  },
};

export const filterRules = {
  maxLength: (value: string) =>
    !value || value.length <= 50 || "Filter text cannot exceed 50 characters",
};
