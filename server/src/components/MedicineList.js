import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { medicineService } from '../services/api';
import { useUser } from '../context/UserContext';

const MedicineList = ({ onEdit }) => {
  const [medicines, setMedicines] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await medicineService.getAllMedicines(user.id);
        setMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };

    fetchMedicines();
  }, [user.id]);

  const handleDelete = async (id) => {
    try {
      await medicineService.deleteMedicine(id);
      setMedicines(medicines.filter(medicine => medicine._id !== id));
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  if (medicines.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No medicines added yet. Start by adding your first medicine!
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2}>
      <List>
        {medicines.map((medicine) => (
          <ListItem key={medicine._id} divider>
            <ListItemText
              primary={medicine.name}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    Dosage: {medicine.dosage}
                  </Typography>
                  <br />
                  <Chip
                    label={`${medicine.frequency} times daily`}
                    size="small"
                    sx={{ mr: 1, mt: 1 }}
                  />
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => onEdit(medicine)} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(medicine._id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default MedicineList; 