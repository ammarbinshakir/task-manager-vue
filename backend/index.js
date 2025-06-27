const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory task storage
let tasks = [];

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Add a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const newTask = { id: Date.now(), title, completed: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task (title and/or completion)
app.patch("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const task = tasks.find((t) => t.id == id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Update title if provided
  if (title !== undefined) {
    task.title = title;
  }

  // Update completion status if provided
  if (completed !== undefined) {
    task.completed = completed;
  }

  res.json(task);
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((t) => t.id != id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
