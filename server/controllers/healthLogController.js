const HealthLog = require('../models/HealthLog');

exports.createHealthLog = async (req, res) => {
  try {
    const healthLog = new HealthLog(req.body);
    await healthLog.save();
    res.status(201).json(healthLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHealthLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.seasonId) filter.seasonId = req.query.seasonId;
    if (req.query.pondId) filter.pondId = req.query.pondId;
    
    const logs = await HealthLog.find(filter).populate('pondId', 'name').sort({ date: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHealthLog = async (req, res) => {
  try {
    const log = await HealthLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.status(200).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteHealthLog = async (req, res) => {
  try {
    const log = await HealthLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.status(200).json({ message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
