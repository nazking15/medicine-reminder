import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, AccountCircle } from '@mui/icons-material';
import MedicineList from '../components/MedicineList';
import MedicineForm from '../components/MedicineForm';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const { user, logout } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [key, setKey] = useState(0); // For forcing re-render of MedicineList
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

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
    setIsFormOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Medicine Reminder
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Medicine
            </Button>
            <IconButton
              size="large"
              onClick={handleMenuClick}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.email}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
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