const Event = require('../models/Event');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const InventoryItem = require('../models/InventoryItem'); // New import
const InventoryAdjustment = require('../models/InventoryAdjustment'); // New import
const NurseryBatch = require('../models/NurseryBatch'); // New import
const inventoryController = require('./inventoryController'); // New import

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { eventType, date, pondId, seasonId, details } = req.body;

    // Basic validation for all events
    if (!eventType || !date || !pondId || !seasonId || !details) {
      return res.status(400).json({ message: 'Event type, date, pond ID, season ID, and details are required' });
    }

    // Validate Pond and Season existence (now required fields in Event model)
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Type-specific validation and logic
    switch (eventType) {
      case 'PondPreparation':
        const { method, preparationDate } = details;
        if (!method || !preparationDate) {
          return res.status(400).json({ message: 'PondPreparation: method and preparationDate are required in details' });
        }
        break;

      case 'Stocking':
        const { stockingDate, nurseryBatchId, species, initialCount } = details;
        if (!stockingDate || !nurseryBatchId || !species || initialCount === undefined) {
          return res.status(400).json({ message: 'Stocking: stockingDate, nurseryBatchId, species, and initialCount are required in details' });
        }
        // Validate nurseryBatchId
        const nurseryBatch = await NurseryBatch.findById(nurseryBatchId);
        if (!nurseryBatch) {
          return res.status(404).json({ message: 'Stocking: Nursery Batch not found' });
        }
        break;

      case 'ChemicalApplication':
        const { applicationDate, inventoryItemId, quantityApplied } = details;
        if (!applicationDate || !inventoryItemId || quantityApplied === undefined) {
          return res.status(400).json({ message: 'ChemicalApplication: applicationDate, inventoryItemId, and quantityApplied are required in details' });
        }
        // Validate inventoryItemId
        const chemicalItem = await InventoryItem.findById(inventoryItemId);
        if (!chemicalItem || !chemicalItem.isActive) {
          return res.status(404).json({ message: 'ChemicalApplication: Inventory item not found or is inactive' });
        }
        if (chemicalItem.itemType !== 'Chemical' && chemicalItem.itemType !== 'Probiotic') {
          return res.status(400).json({ message: 'ChemicalApplication: Selected inventory item is not a Chemical or Probiotic type' });
        }
        break;

      case 'PartialHarvest':
      case 'FullHarvest':
        const { harvestDate, harvestWeight, averageWeight } = details;
        if (!harvestDate || harvestWeight === undefined || averageWeight === undefined) {
          return res.status(400).json({ message: `${eventType}: harvestDate, harvestWeight, and averageWeight are required in details` });
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid event type' });
    }

    const event = new Event({
      eventType,
      date,
      pondId,
      seasonId,
      details
    });

    await event.save();

    // Handle inventory deduction for ChemicalApplication
    if (eventType === 'ChemicalApplication') {
      await inventoryController.createInventoryAdjustment({
        body: {
          inventoryItemId: details.inventoryItemId,
          adjustmentType: 'Usage',
          quantityChange: -details.quantityApplied, // Deduct quantity
          reason: `Chemical/Probiotic application for pond ${pond.name}`,
          relatedDocument: event._id,
          relatedDocumentModel: 'Event'
        }
      }, { status: () => ({ json: () => {} }) }); // Mock res object for internal call
    }

    // Populate pond and season names in the response
    const populatedEvent = await Event.findById(event._id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name');

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .sort({ date: -1 }); // Sort by date, newest first
    
    // Conditionally populate inventoryItemId for ChemicalApplication events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Get an event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name');
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If it's a ChemicalApplication event, populate inventoryItemId
    if (event.eventType === 'ChemicalApplication' && event.details.inventoryItemId) {
      await event.populate('details.inventoryItemId', 'itemName itemType unit');
    }
    
    res.json(event);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const { eventType, date, pondId, seasonId, details } = req.body;

    // Basic validation for all events
    if (!eventType || !date || !pondId || !seasonId || !details) {
      return res.status(400).json({ message: 'Event type, date, pond ID, season ID, and details are required' });
    }

    // Validate Pond and Season existence
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Type-specific validation and logic (similar to createEvent)
    switch (eventType) {
      case 'PondPreparation':
        const { method, preparationDate } = details;
        if (!method || !preparationDate) {
          return res.status(400).json({ message: 'PondPreparation: method and preparationDate are required in details' });
        }
        break;

      case 'Stocking':
        const { stockingDate, nurseryBatchId, species, initialCount } = details;
        if (!stockingDate || !nurseryBatchId || !species || initialCount === undefined) {
          return res.status(400).json({ message: 'Stocking: stockingDate, nurseryBatchId, species, and initialCount are required in details' });
        }
        const nurseryBatch = await NurseryBatch.findById(nurseryBatchId);
        if (!nurseryBatch) {
          return res.status(404).json({ message: 'Stocking: Nursery Batch not found' });
        }
        break;

      case 'ChemicalApplication':
        const { applicationDate, inventoryItemId, quantityApplied } = details;
        if (!applicationDate || !inventoryItemId || quantityApplied === undefined) {
          return res.status(400).json({ message: 'ChemicalApplication: applicationDate, inventoryItemId, and quantityApplied are required in details' });
        }
        const chemicalItem = await InventoryItem.findById(inventoryItemId);
        if (!chemicalItem || !chemicalItem.isActive) {
          return res.status(404).json({ message: 'ChemicalApplication: Inventory item not found or is inactive' });
        }
        if (chemicalItem.itemType !== 'Chemical' && chemicalItem.itemType !== 'Probiotic') {
          return res.status(400).json({ message: 'ChemicalApplication: Selected inventory item is not a Chemical or Probiotic type' });
        }
        break;

      case 'PartialHarvest':
      case 'FullHarvest':
        const { harvestDate, harvestWeight, averageWeight } = details;
        if (!harvestDate || harvestWeight === undefined || averageWeight === undefined) {
          return res.status(400).json({ message: `${eventType}: harvestDate, harvestWeight, and averageWeight are required in details` });
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid event type' });
    }
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { 
        eventType, 
        date, 
        pondId, 
        seasonId,
        details
      },
      { new: true, runValidators: true }
    )
    .populate('pondId', 'name')
    .populate('seasonId', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Note: For ChemicalApplication updates, reversing old inventory adjustments and applying new ones
    // is complex and requires careful consideration of the original state.
    // For now, we assume manual inventory adjustments will be made for corrections.
    // If the inventoryItemId or quantityApplied changes, the user would need to manually
    // create a correction adjustment in the inventory system.
    
    res.json(event);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id); // Find first to get details for reversal
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id); // Now delete

    // Reverse inventory adjustment for ChemicalApplication
    if (event.eventType === 'ChemicalApplication' && event.details.inventoryItemId && event.details.quantityApplied !== undefined) {
      await inventoryController.createInventoryAdjustment({
        body: {
          inventoryItemId: event.details.inventoryItemId,
          adjustmentType: 'Correction',
          quantityChange: event.details.quantityApplied, // Add back the quantity
          reason: `Reversal of chemical application due to deletion of Event ID: ${event._id}`,
          relatedDocument: event._id,
          relatedDocumentModel: 'Event'
        }
      }, { status: () => ({ json: () => {} }) });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

// Get events by pond ID
exports.getEventsByPondId = async (req, res) => {
  try {
    const { pondId } = req.params;
    
    // Check if pond exists
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }
    
    const events = await Event.find({ pondId })
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .sort({ date: -1 });
      
    // Conditionally populate inventoryItemId for ChemicalApplication events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error fetching events for pond', error: error.message });
  }
};

// Get events by season ID
exports.getEventsBySeasonId = async (req, res) => {
  try {
    const { seasonId } = req.params;
    
    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    
    const events = await Event.find({ seasonId })
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .sort({ date: -1 });
      
    // Conditionally populate inventoryItemId for ChemicalApplication events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching events for season', error: error.message });
  }
};

// Get events by date range
exports.getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required as query parameters' });
    }
    
    const events = await Event.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('pondId', 'name')
    .populate('seasonId', 'name')
    .sort({ date: -1 });
    
    // Conditionally populate inventoryItemId for ChemicalApplication events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events by date range', error: error.message });
  }
};