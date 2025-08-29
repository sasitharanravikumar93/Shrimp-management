const { logger } = require('../utils/logger');
const Event = require('../models/Event');
const Pond = require('../models/Pond');
const Season = require('../models/Season');
const InventoryItem = require('../models/InventoryItem'); // New import
// const InventoryAdjustment = require('../models/InventoryAdjustment'); // New import - unused
const NurseryBatch = require('../models/NurseryBatch'); // New import
const inventoryController = require('./inventoryController'); // New import

// Create a new event
exports.createEvent = async (req, res) => {
  logger.info('Creating a new event', { body: req.body });
  try {
    const { eventType, date, pondId, nurseryBatchId, seasonId, details } = req.body;

    // Basic validation for all events
    if (!eventType || !date || !seasonId || !details) {
      return res.status(400).json({ message: 'Event type, date, season ID, and details are required' });
    }

    // Either pondId or nurseryBatchId is required
    if (!pondId && !nurseryBatchId) {
      return res.status(400).json({ message: 'Either pond ID or nursery batch ID is required' });
    }

    // Validate Season existence
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    let pond = null;
    let nurseryBatch = null;

    // Validate Pond or NurseryBatch existence
    if (pondId) {
      pond = await Pond.findById(pondId);
      if (!pond) {
        return res.status(404).json({ message: 'Pond not found' });
      }
    }

    if (nurseryBatchId) {
      nurseryBatch = await NurseryBatch.findById(nurseryBatchId);
      if (!nurseryBatch) {
        return res.status(404).json({ message: 'Nursery batch not found' });
      }
    }

    // Type-specific validation and logic
    // Declare variables outside switch to avoid lexical declaration issues
    let method, preparationDate, stockingDate, stockNurseryBatchId, species, initialCount,
      applicationDate, inventoryItemId, quantityApplied, harvestDate, harvestWeight, averageWeight,
      preparationMethod, nurseryPrepDate, pH, dissolvedOxygen, temperature, salinity,
      testTime, samplingTime, totalWeight, totalCount,
      feedTime, feedInventoryItemId, quantity;

    switch (eventType) {
      case 'PondPreparation':
        ({ method, preparationDate } = details);
        if (!method || !preparationDate) {
          return res.status(400).json({ message: 'PondPreparation: method and preparationDate are required in details' });
        }
        // This event type is only valid for ponds
        if (!pondId) {
          return res.status(400).json({ message: 'PondPreparation event requires a pond ID' });
        }
        break;

      case 'Stocking': {
        ({ stockingDate, nurseryBatchId: stockNurseryBatchId, species, initialCount } = details);
        if (!stockingDate || !stockNurseryBatchId || !species || initialCount === undefined) {
          return res.status(400).json({ message: 'Stocking: stockingDate, nurseryBatchId, species, and initialCount are required in details' });
        }
        // Validate nurseryBatchId
        const stockNurseryBatch = await NurseryBatch.findById(stockNurseryBatchId);
        if (!stockNurseryBatch) {
          return res.status(404).json({ message: 'Stocking: Nursery Batch not found' });
        }
        // This event type is only valid for ponds
        if (!pondId) {
          return res.status(400).json({ message: 'Stocking event requires a pond ID' });
        }
        break;
      }

      case 'ChemicalApplication': {
        ({ applicationDate, inventoryItemId, quantityApplied } = details);
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
      }

      case 'PartialHarvest':
      case 'FullHarvest':
        ({ harvestDate, harvestWeight, averageWeight } = details);
        if (!harvestDate || harvestWeight === undefined || averageWeight === undefined) {
          return res.status(400).json({ message: `${eventType}: harvestDate, harvestWeight, and averageWeight are required in details` });
        }
        // These event types are only valid for ponds
        if (!pondId) {
          return res.status(400).json({ message: 'Harvest events require a pond ID' });
        }
        break;

      case 'NurseryPreparation':
        ({ preparationMethod, preparationDate: nurseryPrepDate } = details);
        if (!preparationMethod || !nurseryPrepDate) {
          return res.status(400).json({ message: 'NurseryPreparation: preparationMethod and preparationDate are required in details' });
        }
        // This event type is only valid for nursery batches
        if (!nurseryBatchId) {
          return res.status(400).json({ message: 'NurseryPreparation event requires a nursery batch ID' });
        }
        break;

      case 'WaterQualityTesting':
        ({
          pH,
          dissolvedOxygen,
          temperature,
          salinity,
          testTime
        } = details);

        if (pH === undefined || dissolvedOxygen === undefined || temperature === undefined || salinity === undefined) {
          return res.status(400).json({ message: 'WaterQualityTesting: pH, dissolvedOxygen, temperature, and salinity are required in details' });
        }
        if (!testTime) {
          return res.status(400).json({ message: 'WaterQualityTesting: testTime is required in details' });
        }
        break;

      case 'GrowthSampling':
        ({ samplingTime, totalWeight, totalCount } = details);
        if (!samplingTime || totalWeight === undefined || totalCount === undefined) {
          return res.status(400).json({ message: 'GrowthSampling: samplingTime, totalWeight, and totalCount are required in details' });
        }
        break;

      case 'Feeding': {
        ({ feedTime, inventoryItemId: feedInventoryItemId, quantity } = details);
        if (!feedTime || !feedInventoryItemId || quantity === undefined) {
          return res.status(400).json({ message: 'Feeding: feedTime, inventoryItemId, and quantity are required in details' });
        }
        // Validate inventoryItemId
        const feedItem = await InventoryItem.findById(feedInventoryItemId);
        if (!feedItem || !feedItem.isActive) {
          return res.status(404).json({ message: 'Feeding: Feed item not found or is inactive' });
        }
        if (feedItem.itemType !== 'Feed') {
          return res.status(400).json({ message: 'Feeding: Selected inventory item is not a Feed type' });
        }
        break;
      }

      case 'Inspection':
        // Inspection events don't have strict required fields beyond the basics
        // but can include media
        break;

      default:
        return res.status(400).json({ message: 'Invalid event type' });
    }

    const event = new Event({
      eventType,
      date,
      pondId,
      nurseryBatchId,
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
          reason: pondId
            ? `Chemical/Probiotic application for pond ${pond.name}`
            : `Chemical/Probiotic application for nursery batch ${nurseryBatch.batchName}`,
          relatedDocument: event._id,
          relatedDocumentModel: 'Event'
        }
      }, { status: () => ({ json: () => { } }) }); // Mock res object for internal call
    }

    // Handle inventory deduction for Feeding
    if (eventType === 'Feeding') {
      await inventoryController.createInventoryAdjustment({
        body: {
          inventoryItemId: details.inventoryItemId,
          adjustmentType: 'Usage',
          quantityChange: -details.quantity, // Deduct quantity
          reason: pondId
            ? `Feed application for pond ${pond.name}`
            : `Feed application for nursery batch ${nurseryBatch.batchName}`,
          relatedDocument: event._id,
          relatedDocumentModel: 'Event'
        }
      }, { status: () => ({ json: () => { } }) }); // Mock res object for internal call
    }

    // Populate references in the response
    const populatedEvent = await Event.findById(event._id)
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name');

    // If it's a ChemicalApplication event, populate inventoryItemId
    if (event.eventType === 'ChemicalApplication' && event.details.inventoryItemId) {
      await populatedEvent.populate('details.inventoryItemId', 'itemName itemType unit');
    }

    // If it's a Feeding event, populate inventoryItemId
    if (event.eventType === 'Feeding' && event.details.inventoryItemId) {
      await populatedEvent.populate('details.inventoryItemId', 'itemName itemType unit');
    }

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
    logger.error('Error creating event', { error: error.message, stack: error.stack });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  logger.info('Getting all events');
  try {
    const events = await Event.find()
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name')
      .sort({ date: -1 }); // Sort by date, newest first

    // Conditionally populate inventoryItemId for ChemicalApplication and Feeding events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
      if (events[i].eventType === 'Feeding' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
    logger.error('Error fetching events', { error: error.message, stack: error.stack });
  }
};

// Get an event by ID
exports.getEventById = async (req, res) => {
  logger.info(`Getting event by ID: ${req.params.id}`);
  try {
    const event = await Event.findById(req.params.id)
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If it's a ChemicalApplication event, populate inventoryItemId
    if (event.eventType === 'ChemicalApplication' && event.details.inventoryItemId) {
      await event.populate('details.inventoryItemId', 'itemName itemType unit');
    }

    // If it's a Feeding event, populate inventoryItemId
    if (event.eventType === 'Feeding' && event.details.inventoryItemId) {
      await event.populate('details.inventoryItemId', 'itemName itemType unit');
    }

    res.json(event);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    res.status(500).json({ message: 'Error fetching event', error: error.message });
    logger.error(`Error fetching event with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
  logger.info(`Updating event by ID: ${req.params.id}`, { body: req.body });
  try {
    const { eventType, date, pondId, nurseryBatchId, seasonId, details } = req.body;

    // Basic validation for all events
    if (!eventType || !date || !seasonId || !details) {
      return res.status(400).json({ message: 'Event type, date, season ID, and details are required' });
    }

    // Either pondId or nurseryBatchId is required
    if (!pondId && !nurseryBatchId) {
      return res.status(400).json({ message: 'Either pond ID or nursery batch ID is required' });
    }

    // Validate Season existence
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    let pond = null;
    let nurseryBatch = null;

    // Validate Pond or NurseryBatch existence
    if (pondId) {
      pond = await Pond.findById(pondId);
      if (!pond) {
        return res.status(404).json({ message: 'Pond not found' });
      }
    }

    if (nurseryBatchId) {
      nurseryBatch = await NurseryBatch.findById(nurseryBatchId);
      if (!nurseryBatch) {
        return res.status(404).json({ message: 'Nursery batch not found' });
      }
    }

    // Type-specific validation and logic (similar to createEvent)
    switch (eventType) {
      case 'PondPreparation': {
        const { method, preparationDate } = details;
        if (!method || !preparationDate) {
          return res.status(400).json({ message: 'PondPreparation: method and preparationDate are required in details' });
        }
        // This event type is only valid for ponds
        if (!pondId) {
          return res.status(400).json({ message: 'PondPreparation event requires a pond ID' });
        }
        break;
      }

      case 'Stocking': {
        const { stockingDate, nurseryBatchId: stockNurseryBatchId, species, initialCount } = details;
        if (!stockingDate || !stockNurseryBatchId || !species || initialCount === undefined) {
          return res.status(400).json({ message: 'Stocking: stockingDate, nurseryBatchId, species, and initialCount are required in details' });
        }
        // Validate nurseryBatchId
        const stockNurseryBatch = await NurseryBatch.findById(stockNurseryBatchId);
        if (!stockNurseryBatch) {
          return res.status(404).json({ message: 'Stocking: Nursery Batch not found' });
        }
        // This event type is only valid for ponds
        if (!pondId) {
          return res.status(400).json({ message: 'Stocking event requires a pond ID' });
        }
        break;
      }

      case 'ChemicalApplication': {
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
      }

      case 'PartialHarvest':
      case 'FullHarvest': {
        const { harvestDate, harvestWeight, averageWeight } = details;
        if (!harvestDate || harvestWeight === undefined || averageWeight === undefined) {
          return res.status(400).json({ message: `${eventType}: harvestDate, harvestWeight, and averageWeight are required in details` });
        }
        // These event types are only valid for ponds
        if (!pondId) {
          return res.status(400).json({ message: 'Harvest events require a pond ID' });
        }
        break;
      }

      case 'NurseryPreparation': {
        const { preparationMethod, preparationDate: nurseryPrepDate } = details;
        if (!preparationMethod || !nurseryPrepDate) {
          return res.status(400).json({ message: 'NurseryPreparation: preparationMethod and preparationDate are required in details' });
        }
        // This event type is only valid for nursery batches
        if (!nurseryBatchId) {
          return res.status(400).json({ message: 'NurseryPreparation event requires a nursery batch ID' });
        }
        break;
      }

      case 'WaterQualityTesting': {
        const {
          pH,
          dissolvedOxygen,
          temperature,
          salinity,
          testTime
        } = details;

        if (pH === undefined || dissolvedOxygen === undefined || temperature === undefined || salinity === undefined) {
          return res.status(400).json({ message: 'WaterQualityTesting: pH, dissolvedOxygen, temperature, and salinity are required in details' });
        }
        if (!testTime) {
          return res.status(400).json({ message: 'WaterQualityTesting: testTime is required in details' });
        }
        break;
      }

      case 'GrowthSampling': {
        const { samplingTime, totalWeight, totalCount } = details;
        if (!samplingTime || totalWeight === undefined || totalCount === undefined) {
          return res.status(400).json({ message: 'GrowthSampling: samplingTime, totalWeight, and totalCount are required in details' });
        }
        break;
      }

      case 'Feeding': {
        const { feedTime, inventoryItemId: feedInventoryItemId, quantity } = details;
        if (!feedTime || !feedInventoryItemId || quantity === undefined) {
          return res.status(400).json({ message: 'Feeding: feedTime, inventoryItemId, and quantity are required in details' });
        }
        // Validate inventoryItemId
        const feedItem = await InventoryItem.findById(feedInventoryItemId);
        if (!feedItem || !feedItem.isActive) {
          return res.status(404).json({ message: 'Feeding: Feed item not found or is inactive' });
        }
        if (feedItem.itemType !== 'Feed') {
          return res.status(400).json({ message: 'Feeding: Selected inventory item is not a Feed type' });
        }
        break;
      }

      case 'Inspection':
        // Inspection events don't have strict required fields beyond the basics
        // but can include media
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
        nurseryBatchId,
        seasonId,
        details
      },
      { new: true, runValidators: true }
    )
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If it's a ChemicalApplication event, populate inventoryItemId
    if (event.eventType === 'ChemicalApplication' && event.details.inventoryItemId) {
      await event.populate('details.inventoryItemId', 'itemName itemType unit');
    }

    // If it's a Feeding event, populate inventoryItemId
    if (event.eventType === 'Feeding' && event.details.inventoryItemId) {
      await event.populate('details.inventoryItemId', 'itemName itemType unit');
    }

    // Note: For ChemicalApplication and Feeding updates, reversing old inventory adjustments and applying new ones
    // is complex and requires careful consideration of the original state.
    // For now, we assume manual inventory adjustments will be made for corrections.
    // If the inventoryItemId or quantity changes, the user would need to manually
    // create a correction adjustment in the inventory system.

    res.json(event);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    res.status(500).json({ message: 'Error updating event', error: error.message });
    logger.error(`Error updating event with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  logger.info(`Deleting event by ID: ${req.params.id}`);
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
      }, { status: () => ({ json: () => { } }) });
    }

    // Reverse inventory adjustment for Feeding
    if (event.eventType === 'Feeding' && event.details.inventoryItemId && event.details.quantity !== undefined) {
      await inventoryController.createInventoryAdjustment({
        body: {
          inventoryItemId: event.details.inventoryItemId,
          adjustmentType: 'Correction',
          quantityChange: event.details.quantity, // Add back the quantity
          reason: `Reversal of feeding due to deletion of Event ID: ${event._id}`,
          relatedDocument: event._id,
          relatedDocumentModel: 'Event'
        }
      }, { status: () => ({ json: () => { } }) });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    res.status(500).json({ message: 'Error deleting event', error: error.message });
    logger.error(`Error deleting event with ID: ${req.params.id}`, { error: error.message, stack: error.stack });
  }
};

// Get events by pond ID
exports.getEventsByPondId = async (req, res) => {
  logger.info(`Getting events for pond ID: ${req.params.pondId}`);
  try {
    const { pondId } = req.params;

    // Check if pond exists
    const pond = await Pond.findById(pondId);
    if (!pond) {
      return res.status(404).json({ message: 'Pond not found' });
    }

    const events = await Event.find({ pondId })
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name')
      .sort({ date: -1 });

    // Conditionally populate inventoryItemId for ChemicalApplication and Feeding events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
      if (events[i].eventType === 'Feeding' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid pond ID' });
    }
    res.status(500).json({ message: 'Error fetching events for pond', error: error.message });
    logger.error(`Error fetching events for pond ID: ${req.params.pondId}`, { error: error.message, stack: error.stack });
  }
};

// Get events by season ID
exports.getEventsBySeasonId = async (req, res) => {
  logger.info(`Getting events for season ID: ${req.params.seasonId}`);
  try {
    const { seasonId } = req.params;

    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    const events = await Event.find({ seasonId })
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name')
      .sort({ date: -1 });

    // Conditionally populate inventoryItemId for ChemicalApplication and Feeding events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
      if (events[i].eventType === 'Feeding' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid season ID' });
    }
    res.status(500).json({ message: 'Error fetching events for season', error: error.message });
    logger.error(`Error fetching events for season ID: ${req.params.seasonId}`, { error: error.message, stack: error.stack });
  }
};

// Get events by nursery batch ID
exports.getEventsByNurseryBatchId = async (req, res) => {
  logger.info(`Getting events for nursery batch ID: ${req.params.nurseryBatchId}`);
  try {
    const { nurseryBatchId } = req.params;

    // Check if nursery batch exists
    const nurseryBatch = await NurseryBatch.findById(nurseryBatchId);
    if (!nurseryBatch) {
      return res.status(404).json({ message: 'Nursery batch not found' });
    }

    const events = await Event.find({ nurseryBatchId })
      .populate('pondId', 'name')
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name')
      .sort({ date: -1 });

    // Conditionally populate inventoryItemId for ChemicalApplication and Feeding events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
      if (events[i].eventType === 'Feeding' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid nursery batch ID' });
    }
    res.status(500).json({ message: 'Error fetching events for nursery batch', error: error.message });
    logger.error(`Error fetching events for nursery batch ID: ${req.params.nurseryBatchId}`, { error: error.message, stack: error.stack });
  }
};

// Get events by date range
exports.getEventsByDateRange = async (req, res) => {
  logger.info('Getting events by date range', { query: req.query });
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
      .populate('nurseryBatchId', 'batchName')
      .populate('seasonId', 'name')
      .sort({ date: -1 });

    // Conditionally populate inventoryItemId for ChemicalApplication and Feeding events
    for (let i = 0; i < events.length; i++) {
      if (events[i].eventType === 'ChemicalApplication' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
      if (events[i].eventType === 'Feeding' && events[i].details.inventoryItemId) {
        await events[i].populate('details.inventoryItemId', 'itemName itemType unit');
      }
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events by date range', error: error.message });
    logger.error('Error fetching events by date range', { error: error.message, stack: error.stack });
  }
};