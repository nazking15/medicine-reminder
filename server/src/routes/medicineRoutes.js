const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const mongoose = require('mongoose');

// Get all medicines for a user
router.get('/:userId', async (req, res) => {
  try {
    console.log('Fetching medicines for user:', req.params.userId);
    
    if (!req.params.userId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'User ID is required'
      });
    }

    // For test user, return empty array if no medicines exist
    if (req.params.userId === 'testuser123') {
      const medicines = await Medicine.find({ 
        userId: req.params.userId,
        active: true 
      });
      return res.json(medicines);
    }

    const medicines = await Medicine.find({ 
      userId: req.params.userId,
      active: true 
    });

    console.log(`Found ${medicines.length} medicines for user ${req.params.userId}`);
    res.json(medicines);
  } catch (error) {
    console.error('Error in GET /medicines/:userId:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch medicines',
      details: error.message
    });
  }
});

// Add a new medicine
router.post('/', async (req, res) => {
  try {
    console.log('Adding new medicine - Request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    const requiredFields = ['name', 'dosage', 'frequency', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate frequency array
    if (!Array.isArray(req.body.frequency)) {
      console.log('Invalid frequency format:', req.body.frequency);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Frequency must be an array of objects with time property'
      });
    }

    // Create medicine object with validated data
    const medicineData = {
      name: req.body.name.trim(),
      dosage: req.body.dosage.trim(),
      frequency: req.body.frequency.map(f => ({
        time: f.time,
        taken: false
      })),
      userId: req.body.userId,
      notes: req.body.notes ? req.body.notes.trim() : '',
      notificationPreferences: {
        email: {
          enabled: true,
          address: req.body.email || `${req.body.userId}@example.com`,
          reminderTime: req.body.reminderTime || "08:00"
        }
      }
    };

    console.log('Creating medicine with data:', JSON.stringify(medicineData, null, 2));

    const medicine = new Medicine(medicineData);
    const newMedicine = await medicine.save();
    
    console.log('Medicine added successfully:', JSON.stringify(newMedicine, null, 2));
    res.status(201).json(newMedicine);
  } catch (error) {
    console.error('Error adding medicine:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid data provided',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to save medicine',
        details: error.message
      });
    }

    // Handle other errors
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to add medicine',
      details: error.message
    });
  }
});

// Update a medicine
router.patch('/:id', async (req, res) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid medicine ID format' });
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Validate frequency array if provided
    if (req.body.frequency) {
      if (!Array.isArray(req.body.frequency)) {
        return res.status(400).json({ message: 'Frequency must be an array' });
      }
      medicine.frequency = req.body.frequency.map(f => ({
        time: f.time,
        taken: f.taken || false
      }));
    }

    // Update notification preferences if provided
    if (req.body.notificationPreferences) {
      if (req.body.notificationPreferences.email?.enabled && !req.body.notificationPreferences.email?.address) {
        return res.status(400).json({ message: 'Email address is required when notifications are enabled' });
      }
      medicine.notificationPreferences = {
        email: {
          enabled: req.body.notificationPreferences.email?.enabled ?? medicine.notificationPreferences.email.enabled,
          address: req.body.notificationPreferences.email?.address || medicine.notificationPreferences.email.address,
          reminderTime: req.body.notificationPreferences.email?.reminderTime || medicine.notificationPreferences.email.reminderTime
        }
      };
    }

    // Update other fields
    if (req.body.name) medicine.name = req.body.name;
    if (req.body.dosage) medicine.dosage = req.body.dosage;
    if (req.body.notes !== undefined) medicine.notes = req.body.notes;

    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a medicine (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid medicine ID format' });
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    medicine.active = false;
    await medicine.save();
    res.json({ message: 'Medicine deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 