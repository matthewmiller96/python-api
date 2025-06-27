import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocationOn,
  Business,
  LocalShipping,
  Add,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Shipment } from '../types';

interface DashboardStats {
  totalLocations: number;
  totalCarriers: number;
  totalShipments: number;
  recentShipments: Shipment[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalLocations: 0,
    totalCarriers: 0,
    totalShipments: 0,
    recentShipments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [locationsResponse, carriersResponse] = await Promise.all([
        apiService.getOriginLocations(),
        apiService.getCarrierCredentials(),
      ]);

      setStats({
        totalLocations: locationsResponse.length,
        totalCarriers: carriersResponse.length,
        totalShipments: 0, // We'll implement shipments later
        recentShipments: [],
      });
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onClick 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    onClick: () => void;
  }) => (
    <Card sx={{ cursor: 'pointer' }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon, 
    onClick,
    color = 'primary'
  }: { 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void;
    color?: string;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color: `${color}.main`, mr: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onClick}>
          Get Started
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.full_name || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your shipping operations from your dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4 
      }}>
        <StatCard
          title="Origin Locations"
          value={stats.totalLocations}
          icon={<LocationOn sx={{ fontSize: 40 }} />}
          color="#1976d2"
          onClick={() => navigate('/locations')}
        />
        <StatCard
          title="Carrier Accounts"
          value={stats.totalCarriers}
          icon={<Business sx={{ fontSize: 40 }} />}
          color="#2e7d32"
          onClick={() => navigate('/carriers')}
        />
        <StatCard
          title="Total Shipments"
          value={stats.totalShipments}
          icon={<LocalShipping sx={{ fontSize: 40 }} />}
          color="#ed6c02"
          onClick={() => navigate('/shipments')}
        />
        <StatCard
          title="Active Tokens"
          value={0}
          icon={<TrendingUp sx={{ fontSize: 40 }} />}
          color="#9c27b0"
          onClick={() => navigate('/tokens')}
        />
      </Box>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 3 
      }}>
        <QuickActionCard
          title="Add Location"
          description="Set up a new origin location for your shipments"
          icon={<Add />}
          onClick={() => navigate('/locations')}
          color="primary"
        />
        <QuickActionCard
          title="Configure Carrier"
          description="Add carrier credentials for FedEx, UPS, or USPS"
          icon={<Business />}
          onClick={() => navigate('/carriers')}
          color="success"
        />
        <QuickActionCard
          title="Generate Token"
          description="Create bearer tokens for carrier API access"
          icon={<TrendingUp />}
          onClick={() => navigate('/tokens')}
          color="secondary"
        />
        <QuickActionCard
          title="Create Shipment"
          description="Start a new shipment with your configured carriers"
          icon={<LocalShipping />}
          onClick={() => navigate('/shipments')}
          color="warning"
        />
      </Box>

      {/* Recent Activity */}
      {stats.totalLocations === 0 && stats.totalCarriers === 0 && (
        <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <DashboardIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Get Started with Your Shipping API
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            To begin shipping, you'll need to set up at least one origin location and carrier credentials.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<LocationOn />}
              onClick={() => navigate('/locations')}
            >
              Add Location
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Business />}
              onClick={() => navigate('/carriers')}
            >
              Setup Carriers
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;
