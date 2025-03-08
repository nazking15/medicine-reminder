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
  frequency: [{
    time: {
      type: String,
      required: true
    },
    taken: {
      type: Boolean,
      default: false
    }
  }],
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
        default: false
      },
      address: {
        type: String,
        required: function() {
          return this.notificationPreferences?.email?.enabled;
        },
        trim: true
      },
      reminderTime: {
        type: String,
        default: "08:00"
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