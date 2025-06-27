import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import { CarrierCredentials, CarrierCode } from '../types';

const carrierInfo = {
  FEDEX: {
    name: 'FedEx',
    color: '#4d148c',
    icon: '📦',
    description: 'FedEx shipping services',
  },
  UPS: {
    name: 'UPS',
    color: '#8b4513',
    icon: '🚚',
    description: 'United Parcel Service',
  },
  USPS: {
    name: 'USPS',
    color: '#003366',
    icon: '📮',
    description: 'United States Postal Service',
  },
};

const Carriers: React.FC = () => {
  const [carriers, setCarriers] = useState<CarrierCredentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<CarrierCredentials | null>(null);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [formData, setFormData] = useState({
    carrier_code: 'FEDEX' as CarrierCode,
    client_id: '',
    client_secret: '',
    account_number: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadCarriers();
  }, []);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCarrierCredentials();
      setCarriers(data);
    } catch (err: any) {
      setError('Failed to load carriers');
      console.error('Carriers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (carrier?: CarrierCredentials) => {
    if (carrier) {
      setEditingCarrier(carrier);
      setFormData({
        carrier_code: carrier.carrier_code,
        client_id: carrier.client_id,
        client_secret: '', // Don't pre-fill for security
        account_number: carrier.account_number,
        description: carrier.description || '',
        is_active: carrier.is_active,
      });
    } else {
      setEditingCarrier(null);
      setFormData({
        carrier_code: 'FEDEX',
        client_id: '',
        client_secret: '',
        account_number: '',
        description: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
    setShowClientSecret(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCarrier(null);
    setError('');
    setSuccess('');
    setShowClientSecret(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCarrier) {
        const updateData: any = {
          client_id: formData.client_id,
          account_number: formData.account_number,
          description: formData.description,
          is_active: formData.is_active,
        };
        
        // Only include client_secret if it's provided
        if (formData.client_secret) {
          updateData.client_secret = formData.client_secret;
        }
        
        await apiService.updateCarrierCredential(editingCarrier.carrier_code, updateData);
        setSuccess('Carrier updated successfully!');
      } else {
        await apiService.createCarrierCredential({
          ...formData,
          client_secret: formData.client_secret,
        });
        setSuccess('Carrier created successfully!');
      }
      await loadCarriers();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save carrier');
    }
  };

  const handleDelete = async (carrierCode: string) => {
    if (window.confirm(`Are you sure you want to delete the ${carrierCode} carrier configuration?`)) {
      try {
        await apiService.deleteCarrierCredential(carrierCode);
        setSuccess('Carrier deleted successfully!');
        await loadCarriers();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete carrier');
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

  const getAvailableCarriers = () => {
    const configuredCodes = carriers.map(c => c.carrier_code);
    return Object.keys(carrierInfo).filter(code => 
      editingCarrier?.carrier_code === code || !configuredCodes.includes(code as CarrierCode)
    ) as CarrierCode[];
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
            Carrier Credentials
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your shipping carrier API credentials
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={getAvailableCarriers().length === 0}
        >
          Add Carrier
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

      {/* Carriers Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
        gap: 3 
      }}>
        {carriers.length === 0 ? (
          <Box sx={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            py: 8
          }}>
            <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Carriers Configured
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first carrier credentials to start shipping
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Carrier
            </Button>
          </Box>
        ) : (
          carriers.map((carrier) => {
            const info = carrierInfo[carrier.carrier_code];
            return (
              <Card key={carrier.id} sx={{ position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        fontSize: 24, 
                        mr: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: `${info.color}20`,
                      }}
                    >
                      {info.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {info.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {info.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {carrier.is_active ? (
                        <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                      ) : (
                        <Error sx={{ color: 'error.main', fontSize: 20 }} />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Client ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {carrier.client_id}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Account Number
                    </Typography>
                    <Typography variant="body2">
                      {carrier.account_number}
                    </Typography>
                  </Box>

                  {carrier.description && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {carrier.description}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={carrier.is_active ? 'Active' : 'Inactive'}
                      color={carrier.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label={carrier.carrier_code}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleOpenDialog(carrier)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(carrier.carrier_code)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            );
          })
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCarrier ? `Edit ${carrierInfo[editingCarrier.carrier_code].name}` : 'Add New Carrier'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth disabled={!!editingCarrier}>
                <InputLabel>Carrier</InputLabel>
                <Select
                  name="carrier_code"
                  value={formData.carrier_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, carrier_code: e.target.value as CarrierCode }))}
                  required
                >
                  {getAvailableCarriers().map((code) => (
                    <MenuItem key={code} value={code}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 8 }}>{carrierInfo[code].icon}</span>
                        {carrierInfo[code].name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                name="client_id"
                label="Client ID"
                value={formData.client_id}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="Your carrier API client ID"
              />

              <TextField
                name="client_secret"
                label={editingCarrier ? "Client Secret (leave empty to keep current)" : "Client Secret"}
                type={showClientSecret ? 'text' : 'password'}
                value={formData.client_secret}
                onChange={handleInputChange}
                required={!editingCarrier}
                fullWidth
                placeholder="Your carrier API client secret"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowClientSecret(!showClientSecret)}
                        edge="end"
                      >
                        {showClientSecret ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="account_number"
                label="Account Number"
                value={formData.account_number}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="Your carrier account number"
              />

              <TextField
                name="description"
                label="Description (Optional)"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                placeholder="Optional description for this carrier configuration"
              />

              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCarrier ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Carriers;
