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
  CardActions,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Token,
  ExpandMore,
  CheckCircle,
  Error,
  Refresh,
  PlayArrow,
  ContentCopy,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import { CarrierCredentials, TokenResult, CarrierTokenRequest } from '../types';

const carrierInfo = {
  FEDEX: { name: 'FedEx', color: '#4d148c', icon: '📦' },
  UPS: { name: 'UPS', color: '#8b4513', icon: '🚚' },
  USPS: { name: 'USPS', color: '#003366', icon: '📮' },
};

const TokenGenerator: React.FC = () => {
  const [carriers, setCarriers] = useState<CarrierCredentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenResults, setTokenResults] = useState<TokenResult[]>([]);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testFormData, setTestFormData] = useState({
    carrier_code: 'FEDEX' as keyof typeof carrierInfo,
    client_id: '',
    client_secret: '',
    account_num: '',
  });
  const [testResult, setTestResult] = useState<TokenResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadCarriers();
  }, []);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCarrierCredentials();
      setCarriers(data.filter(c => c.is_active));
    } catch (err: any) {
      setError('Failed to load carriers');
      console.error('Carriers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTokensForAll = async () => {
    if (carriers.length === 0) {
      setError('No active carriers found. Please configure carriers first.');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      
      // Note: In a real implementation, we'd need the client_secret
      // For now, we'll show this as a limitation
      setError('Token generation requires client secrets. Use the test function with manual credentials.');
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate tokens');
    } finally {
      setGenerating(false);
    }
  };

  const handleTestToken = async () => {
    try {
      setTestLoading(true);
      const result = await apiService.testSingleToken(testFormData as CarrierTokenRequest);
      setTestResult(result);
      if (result.success) {
        setSuccess('Token generated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to test token generation');
      setTestResult({
        carrier: testFormData.carrier_code,
        success: false,
        error: err.response?.data?.detail || 'Test failed',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const formatTokenPreview = (token: string) => {
    if (token.length <= 50) return token;
    return `${token.substring(0, 20)}...${token.substring(token.length - 20)}`;
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
            Token Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate bearer tokens for carrier API access
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={() => setTestDialogOpen(true)}
          >
            Test Token
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={generateTokensForAll}
            disabled={generating || carriers.length === 0}
          >
            {generating ? 'Generating...' : 'Generate All'}
          </Button>
        </Box>
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

      {/* Info Card */}
      <Card sx={{ mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            About Bearer Tokens
          </Typography>
          <Typography variant="body2">
            Bearer tokens are required for authenticating with carrier APIs. These tokens typically expire after 1-3 hours 
            and need to be refreshed regularly. The tokens generated here can be used directly in your shipping API calls.
          </Typography>
        </CardContent>
      </Card>

      {/* Configured Carriers */}
      <Typography variant="h5" component="h2" gutterBottom>
        Configured Carriers ({carriers.length})
      </Typography>

      {carriers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Token sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Active Carriers
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure carrier credentials first to generate tokens
          </Typography>
          <Button variant="contained" href="/carriers">
            Configure Carriers
          </Button>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4
        }}>
          {carriers.map((carrier) => {
            const info = carrierInfo[carrier.carrier_code];
            const hasResult = tokenResults.find(r => r.carrier === carrier.carrier_code);
            
            return (
              <Card key={carrier.id}>
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
                      <Typography variant="h6">{info.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Account: {carrier.account_number}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Client ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {carrier.client_id}
                    </Typography>
                  </Box>

                  {hasResult && (
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        icon={hasResult.success ? <CheckCircle /> : <Error />}
                        label={hasResult.success ? 'Token Generated' : 'Generation Failed'}
                        color={hasResult.success ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" disabled>
                    Generate Token
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Use Test Token for manual generation
                  </Typography>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Token Results */}
      {tokenResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Token Results
          </Typography>
          {tokenResults.map((result, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    icon={result.success ? <CheckCircle /> : <Error />}
                    label={result.success ? 'Success' : 'Failed'}
                    color={result.success ? 'success' : 'error'}
                    size="small"
                  />
                  <Typography>{carrierInfo[result.carrier as keyof typeof carrierInfo]?.name} ({result.carrier})</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {result.success ? (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Access Token
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                          {formatTokenPreview(result.access_token || '')}
                        </Typography>
                        <Button 
                          size="small" 
                          startIcon={<ContentCopy />}
                          onClick={() => copyToClipboard(result.access_token || '')}
                        >
                          Copy
                        </Button>
                      </Box>
                    </Box>
                    {result.expires_in && (
                      <Typography variant="body2" color="text.secondary">
                        Expires in: {result.expires_in} seconds
                      </Typography>
                    )}
                    {result.token_type && (
                      <Typography variant="body2" color="text.secondary">
                        Type: {result.token_type}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="error">
                      Error: {result.error}
                    </Typography>
                    {result.error_type && (
                      <Typography variant="body2" color="text.secondary">
                        Type: {result.error_type}
                      </Typography>
                    )}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Test Token Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Token Generation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Carrier</InputLabel>
              <Select
                value={testFormData.carrier_code}
                onChange={(e) => setTestFormData(prev => ({ ...prev, carrier_code: e.target.value as keyof typeof carrierInfo }))}
              >
                {Object.entries(carrierInfo).map(([code, info]) => (
                  <MenuItem key={code} value={code}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 8 }}>{info.icon}</span>
                      {info.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Client ID"
              value={testFormData.client_id}
              onChange={(e) => setTestFormData(prev => ({ ...prev, client_id: e.target.value }))}
              fullWidth
              required
            />

            <TextField
              label="Client Secret"
              type="password"
              value={testFormData.client_secret}
              onChange={(e) => setTestFormData(prev => ({ ...prev, client_secret: e.target.value }))}
              fullWidth
              required
            />

            <TextField
              label="Account Number (Optional)"
              value={testFormData.account_num}
              onChange={(e) => setTestFormData(prev => ({ ...prev, account_num: e.target.value }))}
              fullWidth
            />

            {testResult && (
              <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                {testResult.success ? (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Token generated successfully!
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {formatTokenPreview(testResult.access_token || '')}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">
                    {testResult.error}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button 
            onClick={handleTestToken} 
            variant="contained"
            disabled={testLoading || !testFormData.client_id || !testFormData.client_secret}
          >
            {testLoading ? 'Testing...' : 'Test Token'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TokenGenerator;
