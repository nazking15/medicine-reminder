const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: [{
      time: String,
      taken: Boolean
    }],
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  notificationPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      reminderTime: {
        type: String,
        default: "08:00" // Default reminder time
      }
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema); 