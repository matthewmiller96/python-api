import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  Business,
  Phone,
  Home,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import { OriginLocation } from '../types';

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<OriginLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OriginLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    phone: '',
    is_default: false,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOriginLocations();
      setLocations(data);
    } catch (err: any) {
      setError('Failed to load locations');
      console.error('Locations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (location?: OriginLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        company_name: location.company_name || '',
        address_line1: location.address_line1,
        address_line2: location.address_line2 || '',
        city: location.city,
        state: location.state,
        zip_code: location.zip_code,
        country: location.country,
        phone: location.phone || '',
        is_default: location.is_default,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        company_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'US',
        phone: '',
        is_default: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLocation(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await apiService.updateOriginLocation(editingLocation.id, formData);
        setSuccess('Location updated successfully!');
      } else {
        await apiService.createOriginLocation(formData);
        setSuccess('Location created successfully!');
      }
      await loadLocations();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save location');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await apiService.deleteOriginLocation(id);
        setSuccess('Location deleted successfully!');
        await loadLocations();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete location');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Origin Locations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your shipping origin locations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Location
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Locations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Default</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <LocationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No locations found. Add your first location to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Home sx={{ mr: 1, color: 'text.secondary' }} />
                      {location.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {location.company_name && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ mr: 1, color: 'text.secondary' }} />
                        {location.company_name}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {location.address_line1}
                      {location.address_line2 && <br />}
                      {location.address_line2}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location.city}, {location.state} {location.zip_code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {location.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        {location.phone}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {location.is_default && (
                      <Chip label="Default" color="primary" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenDialog(location)}
                      size="small"
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(location.id)}
                      size="small"
                      color="error"
                      disabled={location.is_default}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                name="name"
                label="Location Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="e.g., Main Warehouse, Store #1"
              />
              <TextField
                name="company_name"
                label="Company Name (Optional)"
                value={formData.company_name}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                name="address_line1"
                label="Address Line 1"
                value={formData.address_line1}
                onChange={handleInputChange}
                required
                fullWidth
              />
              <TextField
                name="address_line2"
                label="Address Line 2 (Optional)"
                value={formData.address_line2}
                onChange={handleInputChange}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="city"
                  label="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  fullWidth
                />
                <TextField
                  name="state"
                  label="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  sx={{ minWidth: 120 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="zip_code"
                  label="ZIP Code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  required
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  name="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  sx={{ minWidth: 120 }}
                />
              </Box>
              <TextField
                name="phone"
                label="Phone (Optional)"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                  />
                }
                label="Set as default location"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingLocation ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Locations;
