const AlertRule = require('../models/AlertRule');

exports.createRule = async (req, res) => {
  try {
    const rule = new AlertRule(req.body);
    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRules = async (req, res) => {
  try {
    const rules = await AlertRule.find();
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await AlertRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.status(200).json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const rule = await AlertRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.status(200).json({ message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
