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
  const medicine = new Medicine({
    name: req.body.name,
    dosage: req.body.dosage,
    frequency: req.body.frequency,
    notes: req.body.notes,
    userId: req.body.userId,
    notificationPreferences: req.body.notificationPreferences
  });

  try {
    const newMedicine = await medicine.save();
    res.status(201).json(newMedicine);
  } catch (error) {
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

    // Update only the fields that are provided
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'userId') { // Prevent updating these fields
        medicine[key] = req.body[key];
      }
    });

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