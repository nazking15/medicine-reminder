const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const mongoose = require('mongoose');

// Get all medicines for a user
router.get('/:userId', async (req, res) => {
  try {
    const medicines = await Medicine.find({ 
      userId: req.params.userId,
      active: true 
    });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new medicine
router.post('/', async (req, res) => {
  try {
    console.log('Received medicine data:', req.body);
    
    // Validate required fields
    if (!req.body.name || !req.body.dosage || !req.body.frequency || !req.body.userId) {
      console.log('Missing required fields:', {
        name: !!req.body.name,
        dosage: !!req.body.dosage,
        frequency: !!req.body.frequency,
        userId: !!req.body.userId
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate frequency array
    if (!Array.isArray(req.body.frequency)) {
      console.log('Invalid frequency format:', req.body.frequency);
      return res.status(400).json({ message: 'Frequency must be an array' });
    }

    // Validate notification preferences
    if (req.body.notificationPreferences?.email?.enabled && !req.body.notificationPreferences?.email?.address) {
      console.log('Missing email address for enabled notifications');
      return res.status(400).json({ message: 'Email address is required when notifications are enabled' });
    }

    const medicine = new Medicine({
      name: req.body.name,
      dosage: req.body.dosage,
      frequency: req.body.frequency.map(f => ({
        time: f.time,
        taken: false
      })),
      notes: req.body.notes,
      userId: req.body.userId,
      notificationPreferences: {
        email: {
          enabled: req.body.notificationPreferences?.email?.enabled ?? true,
          address: req.body.notificationPreferences?.email?.address,
          reminderTime: req.body.notificationPreferences?.email?.reminderTime || "08:00"
        }
      },
      active: true
    });

    console.log('Created medicine object:', medicine);
    const newMedicine = await medicine.save();
    console.log('Saved medicine:', newMedicine);
    res.status(201).json(newMedicine);
  } catch (error) {
    console.error('Error saving medicine:', error);
    res.status(400).json({ message: error.message });
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