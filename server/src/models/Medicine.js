const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    minlength: [1, 'Medicine name cannot be empty']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    minlength: [1, 'Dosage cannot be empty']
  },
  frequency: {
    type: [{
      time: {
        type: String,
        required: [true, 'Time is required for each frequency'],
        validate: {
          validator: function(v) {
            // Basic time format validation (HH:mm)
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: props => `${props.value} is not a valid time format! Use HH:mm format.`
        }
      },
      taken: {
        type: Boolean,
        default: false
      }
    }],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one frequency time must be specified'
    }
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true
  },
  notificationPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      address: {
        type: String,
        required: function() {
          return this.notificationPreferences?.email?.enabled;
        },
        trim: true,
        validate: {
          validator: function(v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: props => `${props.value} is not a valid email address!`
        }
      },
      reminderTime: {
        type: String,
        default: "08:00",
        validate: {
          validator: function(v) {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: props => `${props.value} is not a valid time format! Use HH:mm format.`
        }
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

// Add index for better query performance
medicineSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model('Medicine', medicineSchema); 