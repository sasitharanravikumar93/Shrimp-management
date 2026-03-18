export interface Season {
  _id: string;
  name: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  status: 'Planning' | 'Active' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Pond {
  _id: string;
  name: string;
  size: number;
  capacity: number;
  seasonId: string;
  status: 'Planning' | 'Active' | 'Inactive' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedInput {
  _id: string;
  date: string;
  time: string;
  pondId: string;
  inventoryItemId: string;
  quantity: number;
  seasonId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WaterQualityInput {
  _id: string;
  date: string;
  time: string;
  pondId: string;
  pH: number;
  dissolvedOxygen: number;
  temperature: number;
  salinity: number;
  ammonia?: number;
  nitrite?: number;
  alkalinity?: number;
  seasonId: string;
  chemicalUsed?: string;
  chemicalQuantityUsed?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrowthSampling {
  _id: string;
  date: string;
  pondId: string;
  weightGrams: number;
  seasonId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  _id: string;
  itemName: string;
  itemType: 'Feed' | 'Chemical' | 'Probiotic' | 'Other';
  supplier?: string;
  purchaseDate: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: 'kg' | 'g' | 'litre' | 'ml' | 'bag' | 'bottle';
  costPerUnit: number;
  lowStockThreshold?: number;
  status?: 'In Stock' | 'Out of Stock' | 'Expired';
}

export interface NurseryBatch {
  _id: string;
  batchName: string;
  startDate: string;
  initialCount: number;
  species: string;
  source: string;
  seasonId: string;
  createdAt?: string;
  updatedAt?: string;
}
