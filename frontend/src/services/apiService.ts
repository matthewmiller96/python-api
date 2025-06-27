import api from './authService';
import { OriginLocation, CarrierCredentials, Shipment, TokenResult, CarrierTokenRequest } from '../types';

// Generic CRUD service factory
const createCrudService = <T>(basePath: string) => ({
  getAll: async (): Promise<T[]> => {
    const response = await api.get(basePath);
    return response.data;
  },

  getOne: async (id: string | number): Promise<T> => {
    const response = await api.get(`${basePath}/${id}`);
    return response.data;
  },

  create: async (data: Partial<T>): Promise<T> => {
    const response = await api.post(basePath, data);
    return response.data;
  },

  update: async (id: string | number, data: Partial<T>): Promise<T> => {
    const response = await api.put(`${basePath}/${id}`, data);
    return response.data;
  },

  delete: async (id: string | number): Promise<void> => {
    await api.delete(`${basePath}/${id}`);
  },
});

// Specific services
export const locationService = createCrudService<OriginLocation>('/user/locations');
export const shipmentService = createCrudService<Shipment>('/shipments');

export const carrierService = {
  ...createCrudService<CarrierCredentials>('/user/carriers'),
  // Override getOne to use carrier code
  getOne: async (carrierCode: string): Promise<CarrierCredentials> => {
    const response = await api.get(`/user/carriers/${carrierCode}`);
    return response.data;
  },
  // Override update to use carrier code
  update: async (carrierCode: string, carrier: Partial<CarrierCredentials>): Promise<CarrierCredentials> => {
    const response = await api.put(`/user/carriers/${carrierCode}`, carrier);
    return response.data;
  },
  // Override delete to use carrier code
  delete: async (carrierCode: string): Promise<void> => {
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

// Default export with all services
const apiService = {
  // Origin Locations
  getOriginLocations: locationService.getAll,
  getOriginLocation: locationService.getOne,
  createOriginLocation: locationService.create,
  updateOriginLocation: locationService.update,
  deleteOriginLocation: locationService.delete,

  // Carrier Credentials
  getCarrierCredentials: carrierService.getAll,
  getCarrierCredential: carrierService.getOne,
  createCarrierCredential: carrierService.create,
  updateCarrierCredential: carrierService.update,
  deleteCarrierCredential: carrierService.delete,
  testCarrierTokens: carrierService.testTokens,

  // Token Generation
  testSingleToken: tokenService.testSingleToken,
  generateTokens: tokenService.generateTokens,

  // Shipments
  getShipments: shipmentService.getAll,
  createShipment: shipmentService.create,
  getShipment: shipmentService.getOne,
  updateShipment: shipmentService.update,
  deleteShipment: shipmentService.delete,
};

export default apiService;
