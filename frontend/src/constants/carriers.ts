export const CARRIER_INFO = {
  FEDEX: {
    name: 'FedEx',
    color: '#4d148c',
    description: 'FedEx shipping services',
  },
  UPS: {
    name: 'UPS',
    color: '#8b4513',
    description: 'United Parcel Service',
  },
  USPS: {
    name: 'USPS',
    color: '#003366',
    description: 'United States Postal Service',
  },
} as const;

export type CarrierCode = keyof typeof CARRIER_INFO;

export const CARRIER_CODES = Object.keys(CARRIER_INFO) as CarrierCode[];
