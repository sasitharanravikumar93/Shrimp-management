const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.seasonId) filter.seasonId = req.query.seasonId;
    if (req.query.pondId) filter.pondId = req.query.pondId;
    if (req.query.completed !== undefined) filter.completed = req.query.completed === 'true';
    
    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updateData = req.body;
    if (updateData.completed && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }
    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
