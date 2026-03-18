const Sale = require('../models/Sale');
const Harvest = require('../models/Harvest');
const mongoose = require('mongoose');

exports.createSale = async (req, res) => {
  try {
    const { harvestId, date, buyerName, quantitySold, pricePerKg, notes } = req.body;
    
    if (!harvestId || !date || !buyerName || quantitySold === undefined || pricePerKg === undefined) {
      return res.status(400).json({ message: 'Missing required sale fields' });
    }

    const harvest = await Harvest.findById(harvestId);
    if (!harvest) return res.status(404).json({ message: 'Harvest not found' });

    const totalRevenue = quantitySold * pricePerKg;

    const sale = new Sale({
      harvestId,
      date,
      buyerName,
      quantitySold,
      pricePerKg,
      totalRevenue,
      notes
    });

    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sale', error: error.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate({
        path: 'harvestId',
        populate: { path: 'pondId seasonId', select: 'name' }
      })
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales', error: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate({
        path: 'harvestId',
        populate: { path: 'pondId seasonId', select: 'name' }
      });
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sale', error: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sale', error: error.message });
  }
};
