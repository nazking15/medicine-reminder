import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import MedicineList from '../components/MedicineList';
import MedicineForm from '../components/MedicineForm';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const { user } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [key, setKey] = useState(0); // For forcing re-render of MedicineList

  const handleAddClick = () => {
    setSelectedMedicine(null);
    setIsFormOpen(true);
  };

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setKey(prev => prev + 1);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Medicine Reminder
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1">
              Your Medicines
            </Typography>
            <Box>
              <IconButton onClick={() => setKey(prev => prev + 1)} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
              >
                Add Medicine
              </Button>
            </Box>
          </Box>

          <MedicineList
            key={key}
            onEdit={handleEditMedicine}
          />
        </Paper>

        <MedicineForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          medicine={selectedMedicine}
          onSuccess={handleFormSuccess}
        />
      </Container>
    </Box>
  );
};

export default Dashboard; 