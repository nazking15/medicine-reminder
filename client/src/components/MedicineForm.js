import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { medicineService } from '../services/api';
import { useUser } from '../context/UserContext';

const MedicineForm = ({ open, onClose, medicine, onSuccess }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: [],
    notes: '',
    userId: user.id,
    notificationPreferences: {
      email: {
        enabled: true,
        address: user.email || '',
        reminderTime: "08:00"
      }
    }
  });

  const [numTimes, setNumTimes] = useState(1);
  const [times, setTimes] = useState([dayjs().hour(8).minute(0)]);

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency || [],
        notes: medicine.notes || '',
        userId: medicine.userId,
        notificationPreferences: medicine.notificationPreferences || {
          email: {
            enabled: true,
            address: user.email || '',
            reminderTime: "08:00"
          }
        }
      });
      if (Array.isArray(medicine.frequency)) {
        setNumTimes(medicine.frequency.length);
        setTimes(medicine.frequency.map(f => dayjs(f.time, 'HH:mm')));
      }
    }
  }, [medicine, user.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        email: {
          ...prev.notificationPreferences.email,
          enabled: checked
        }
      }
    }));
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        email: {
          ...prev.notificationPreferences.email,
          address: value
        }
      }
    }));
  };

  const handleReminderTimeChange = (newTime) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        email: {
          ...prev.notificationPreferences.email,
          reminderTime: newTime.format('HH:mm')
        }
      }
    }));
  };

  const handleNumTimesChange = (e) => {
    const newNumTimes = e.target.value;
    setNumTimes(newNumTimes);
    
    if (newNumTimes > times.length) {
      const additionalTimes = Array(newNumTimes - times.length).fill()
        .map((_, index) => {
          const hour = (8 + (index + times.length) * Math.floor(24 / newNumTimes)) % 24;
          return dayjs().hour(hour).minute(0);
        });
      setTimes([...times, ...additionalTimes]);
    } else {
      setTimes(times.slice(0, newNumTimes));
    }
  };

  const handleTimeChange = (newTime, index) => {
    const newTimes = [...times];
    newTimes[index] = newTime;
    setTimes(newTimes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const frequency = times.map(time => ({
        time: time.format('HH:mm'),
        taken: false
      }));

      const submitData = {
        ...formData,
        frequency
      };

      if (medicine) {
        await medicineService.updateMedicine(medicine._id, submitData);
      } else {
        await medicineService.addMedicine(submitData);
      }
      onSuccess();
      onClose();
      setFormData({
        name: '',
        dosage: '',
        frequency: [],
        notes: '',
        userId: user.id,
        notificationPreferences: {
          email: {
            enabled: true,
            address: user.email || '',
            reminderTime: "08:00"
          }
        }
      });
      setNumTimes(1);
      setTimes([dayjs().hour(8).minute(0)]);
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {medicine ? 'Edit Medicine' : 'Add New Medicine'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Medicine Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="dosage"
              label="Dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Times per day</InputLabel>
              <Select
                value={numTimes}
                onChange={handleNumTimesChange}
                label="Times per day"
                required
              >
                {[1, 2, 3, 4].map(num => (
                  <MenuItem key={num} value={num}>
                    {num} {num === 1 ? 'time' : 'times'} per day
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Select medicine times:
                </Typography>
                {times.map((time, index) => (
                  <TimePicker
                    key={index}
                    label={`Dose ${index + 1}`}
                    value={time}
                    onChange={(newTime) => handleTimeChange(newTime, index)}
                  />
                ))}
              </Stack>
            </LocalizationProvider>

            <TextField
              name="notes"
              label="Notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" color="text.secondary">
              Notification Settings
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.notificationPreferences.email.enabled}
                  onChange={handleNotificationChange}
                  name="emailEnabled"
                  color="primary"
                />
              }
              label="Enable Email Notifications"
            />

            {formData.notificationPreferences.email.enabled && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2}>
                  <TextField
                    name="emailAddress"
                    label="Email Address"
                    type="email"
                    value={formData.notificationPreferences.email.address}
                    onChange={handleEmailChange}
                    required
                    fullWidth
                  />
                  <TimePicker
                    label="Daily Reminder Time"
                    value={dayjs(formData.notificationPreferences.email.reminderTime, 'HH:mm')}
                    onChange={handleReminderTimeChange}
                  />
                </Stack>
              </LocalizationProvider>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {medicine ? 'Update' : 'Add'} Medicine
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MedicineForm; 