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
} from '@mui/material';
import { medicineService } from '../services/api';
import { useUser } from '../context/UserContext';

const MedicineForm = ({ open, onClose, medicine, onSuccess }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 1,
    notes: '',
    userId: user.id,
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        notes: medicine.notes || '',
        userId: medicine.userId,
      });
    }
  }, [medicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (medicine) {
        await medicineService.updateMedicine(medicine._id, formData);
      } else {
        await medicineService.addMedicine(formData);
      }
      onSuccess();
      onClose();
      setFormData({
        name: '',
        dosage: '',
        frequency: 1,
        notes: '',
        userId: user.id,
      });
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
              <InputLabel>Frequency (times per day)</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Frequency (times per day)"
                required
              >
                {[1, 2, 3, 4].map(num => (
                  <MenuItem key={num} value={num}>
                    {num} {num === 1 ? 'time' : 'times'} per day
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="notes"
              label="Notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
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