import { reactive, readonly } from "vue";

const state = reactive({
  tasks: [] as { id: number; title: string; completed: boolean }[],
});

const fetchTasks = async () => {
  const res = await fetch("http://localhost:3001/tasks");
  state.tasks = await res.json();
};

const addTask = async (title: string) => {
  const res = await fetch("http://localhost:3001/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const task = await res.json();
  state.tasks.push(task);
};

const toggleTask = async (id: number) => {
  const res = await fetch(`http://localhost:3001/tasks/${id}`, {
    method: "PATCH",
  });
  const updated = await res.json();
  const idx = state.tasks.findIndex((t) => t.id === id);
  if (idx !== -1) state.tasks[idx] = updated;
};

const deleteTask = async (id: number) => {
  await fetch(`http://localhost:3001/tasks/${id}`, {
    method: "DELETE",
  });
  state.tasks = state.tasks.filter((t) => t.id !== id);
};

fetchTasks();

export function useStore() {
  return {
    tasks: readonly(state.tasks),
    addTask,
    toggleTask,
    deleteTask,
  };
}
