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
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  EmailOff as EmailOffIcon,
} from '@mui/icons-material';
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

  const formatTimes = (frequency) => {
    if (!Array.isArray(frequency)) return 'No times set';
    return frequency
      .map(f => {
        const time = f.time;
        const taken = f.taken ? '✓' : '○';
        return `${time} ${taken}`;
      })
      .join('  ');
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
          <ListItem
            key={medicine._id}
            divider
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText
              primary={
                <Typography variant="h6" component="div">
                  {medicine.name}
                </Typography>
              }
              secondary={
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.primary">
                    Dosage: {medicine.dosage}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2" component="span">
                      {formatTimes(medicine.frequency)}
                    </Typography>
                  </Box>

                  {medicine.notes && (
                    <Typography variant="body2" color="text.secondary">
                      Notes: {medicine.notes}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={`${medicine.frequency?.length || 0} times daily`}>
                      <Chip
                        icon={<ScheduleIcon />}
                        label={`${medicine.frequency?.length || 0}x daily`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Tooltip>
                    
                    <Tooltip title={medicine.notificationPreferences?.email?.enabled ? 
                      `Email notifications enabled (${medicine.notificationPreferences.email.address})` : 
                      'Email notifications disabled'}>
                      <Chip
                        icon={medicine.notificationPreferences?.email?.enabled ? <EmailIcon /> : <EmailOffIcon />}
                        label={medicine.notificationPreferences?.email?.enabled ? 'Email On' : 'Email Off'}
                        size="small"
                        color={medicine.notificationPreferences?.email?.enabled ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Tooltip>
                  </Box>
                </Stack>
              }
            />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                onClick={() => onEdit(medicine)} 
                sx={{ mr: 1 }}
                color="primary"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                edge="end" 
                onClick={() => handleDelete(medicine._id)}
                color="error"
              >
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