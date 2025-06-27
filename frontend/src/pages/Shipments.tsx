import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  LocalShipping,
  Add,
  Assignment,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import { Shipment } from '../types';

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getShipments();
      setShipments(data);
    } catch (err: any) {
      setError('Failed to load shipments');
      console.error('Shipments error:', err);
    } finally {
      setLoading(false);
    }
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
            Shipments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your shipments and track deliveries
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          disabled
        >
          Create Shipment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Coming Soon Card */}
      <Card sx={{ textAlign: 'center', py: 8 }}>
        <CardContent>
          <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Shipment Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            The shipment creation and management features are coming soon! 
            For now, you can set up your origin locations, configure carrier credentials, 
            and generate bearer tokens for API access.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip 
              icon={<Assignment />}
              label="Create shipping labels"
              variant="outlined"
            />
            <Chip 
              icon={<LocalShipping />}
              label="Track packages"
              variant="outlined"
            />
            <Chip 
              icon={<Add />}
              label="Batch processing"
              variant="outlined"
            />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" href="/locations">
              Setup Locations
            </Button>
            <Button variant="outlined" href="/carriers">
              Configure Carriers
            </Button>
            <Button variant="outlined" href="/tokens">
              Generate Tokens
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Shipments;
