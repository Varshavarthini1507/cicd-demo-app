const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const tasks = [];

// Health check used by Docker, the pipeline smoke test and rollback logic
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', version: process.env.APP_VERSION || 'dev' });
});

app.get('/api/tasks', (req, res) => res.json(tasks));

app.post('/api/tasks', (req, res) => {
  const { title } = req.body || {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = { id: tasks.length + 1, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'not found' });
  tasks.splice(index, 1);
  res.status(204).end();
});

module.exports = app;
