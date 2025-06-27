import api from './authService';
import { OriginLocation, CarrierCredentials, Shipment, TokenResult, CarrierTokenRequest } from '../types';

export const locationService = {
  getLocations: async (): Promise<OriginLocation[]> => {
    const response = await api.get('/user/locations');
    return response.data;
  },

  getLocation: async (id: number): Promise<OriginLocation> => {
    const response = await api.get(`/user/locations/${id}`);
    return response.data;
  },

  createLocation: async (location: Omit<OriginLocation, 'id' | 'user_id' | 'created_at'>): Promise<OriginLocation> => {
    const response = await api.post('/user/locations', location);
    return response.data;
  },

  updateLocation: async (id: number, location: Partial<Omit<OriginLocation, 'id' | 'user_id' | 'created_at'>>): Promise<OriginLocation> => {
    const response = await api.put(`/user/locations/${id}`, location);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`/user/locations/${id}`);
  },
};

export const carrierService = {
  getCarriers: async (): Promise<CarrierCredentials[]> => {
    const response = await api.get('/user/carriers');
    return response.data;
  },

  getCarrier: async (carrierCode: string): Promise<CarrierCredentials> => {
    const response = await api.get(`/user/carriers/${carrierCode}`);
    return response.data;
  },

  createCarrier: async (carrier: Omit<CarrierCredentials, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'client_secret_masked'> & { client_secret: string }): Promise<CarrierCredentials> => {
    const response = await api.post('/user/carriers', carrier);
    return response.data;
  },

  updateCarrier: async (carrierCode: string, carrier: Partial<Omit<CarrierCredentials, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'client_secret_masked'> & { client_secret?: string }>): Promise<CarrierCredentials> => {
    const response = await api.put(`/user/carriers/${carrierCode}`, carrier);
    return response.data;
  },

  deleteCarrier: async (carrierCode: string): Promise<void> => {
    await api.delete(`/user/carriers/${carrierCode}`);
  },

  testTokens: async (): Promise<TokenResult[]> => {
    const response = await api.post('/user/carriers/test-tokens');
    return response.data.results || [];
  },
};

export const tokenService = {
  testSingleToken: async (request: CarrierTokenRequest): Promise<TokenResult> => {
    const response = await api.post('/carriers/test-token', request);
    return response.data.result;
  },

  generateTokens: async (carriers: CarrierTokenRequest[]): Promise<TokenResult[]> => {
    const response = await api.post('/carriers/tokens', { carriers });
    return response.data.results.tokens;
  },
};

export const shipmentService = {
  getShipments: async (): Promise<Shipment[]> => {
    const response = await api.get('/shipments');
    return response.data;
  },

  createShipment: async (shipment: Omit<Shipment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Shipment> => {
    const response = await api.post('/shipments', shipment);
    return response.data;
  },

  getShipment: async (id: number): Promise<Shipment> => {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  },

  updateShipment: async (id: number, shipment: Partial<Omit<Shipment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Shipment> => {
    const response = await api.put(`/shipments/${id}`, shipment);
    return response.data;
  },

  deleteShipment: async (id: number): Promise<void> => {
    await api.delete(`/shipments/${id}`);
  },
};

// Default export with all services
const apiService = {
  // Origin Locations
  getOriginLocations: locationService.getLocations,
  getOriginLocation: locationService.getLocation,
  createOriginLocation: locationService.createLocation,
  updateOriginLocation: locationService.updateLocation,
  deleteOriginLocation: locationService.deleteLocation,

  // Carrier Credentials
  getCarrierCredentials: carrierService.getCarriers,
  getCarrierCredential: carrierService.getCarrier,
  createCarrierCredential: carrierService.createCarrier,
  updateCarrierCredential: carrierService.updateCarrier,
  deleteCarrierCredential: carrierService.deleteCarrier,
  testCarrierTokens: carrierService.testTokens,

  // Token Generation
  testSingleToken: tokenService.testSingleToken,
  generateTokens: tokenService.generateTokens,

  // Shipments
  getShipments: shipmentService.getShipments,
  createShipment: shipmentService.createShipment,
  getShipment: shipmentService.getShipment,
  updateShipment: shipmentService.updateShipment,
  deleteShipment: shipmentService.deleteShipment,
};

export default apiService;
