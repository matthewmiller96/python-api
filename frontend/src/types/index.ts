export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface OriginLocation {
  id: number;
  user_id: number;
  name: string;
  company_name?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
}

export interface CarrierCredentials {
  id: number;
  user_id: number;
  carrier_code: 'FEDEX' | 'UPS' | 'USPS';
  client_id: string;
  client_secret_masked: string;
  account_number: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: number;
  user_id: number;
  from_location_id?: number;
  carrier: string;
  tracking_number?: string;
  service_type: string;
  weight: number;
  dimensions?: string;
  recipient_name: string;
  recipient_address: string;
  recipient_city: string;
  recipient_state: string;
  recipient_zip: string;
  recipient_country: string;
  status: string;
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface TokenResult {
  carrier: string;
  success: boolean;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_type?: string;
}

export interface CarrierTokenRequest {
  carrier_code: 'FEDEX' | 'UPS' | 'USPS';
  client_id: string;
  client_secret: string;
  account_num?: string;
}

export type CarrierCode = 'FEDEX' | 'UPS' | 'USPS';

export interface ApiError {
  detail: string;
}
