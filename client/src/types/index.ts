/**
 * Core Application Types
 * Type definitions for the aquaculture management application
 */

// Base Entity Type
export interface BaseEntity {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

// User Types
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  lastLogin?: string;
}

// Season Types
export interface Season extends BaseEntity {
  name: string;
  status: 'Active' | 'Completed' | 'Planned';
  startDate: string;
  endDate?: string;
  description?: string;
}

// Pond Types
export interface WaterQuality {
  pH: number;
  temperature: number;
  dissolvedOxygen: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
}

export interface PondLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface Pond extends BaseEntity {
  name: string;
  size: number; // in square meters
  capacity: number; // maximum fish capacity
  status: 'Active' | 'Maintenance' | 'Inactive';
  seasonId: Season | string;
  location?: PondLocation;
  waterQuality?: WaterQuality;
  waterQualityScore?: number;
  growthRate?: number;
  feedEfficiency?: number;
  feedConsumption?: number;
  stockingDensity?: number;
  healthScore?: number;
  description?: string;
}

// Expense Types
export interface Expense extends BaseEntity {
  description: string;
  amount: number;
  date: string;
  mainCategory: 'Culture' | 'Farm' | 'Operational';
  subCategory: string;
  seasonId?: Season | string;
  pondId?: Pond | string;
  receipt?: string;
  notes?: string;
  approvedBy?: User | string;
  isApproved?: boolean;
}

// Feed Types
export interface FeedInput extends BaseEntity {
  pondId: Pond | string;
  seasonId: Season | string;
  feedType: string;
  quantity: number; // in kg
  date: string;
  cost?: number;
  supplier?: string;
  notes?: string;
  recordedBy?: User | string;
}

// Water Quality Types
export interface WaterQualityInput extends BaseEntity {
  pondId: Pond | string;
  seasonId: Season | string;
  date: string;
  time?: string;
  pH: number;
  temperature: number;
  dissolvedOxygen: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  turbidity?: number;
  alkalinity?: number;
  hardness?: number;
  notes?: string;
  recordedBy?: User | string;
}

// Growth and Harvest Types
export interface GrowthSample extends BaseEntity {
  pondId: Pond | string;
  seasonId: Season | string;
  date: string;
  sampleSize: number;
  averageWeight: number; // in grams
  averageLength?: number; // in cm
  mortality?: number;
  notes?: string;
  recordedBy?: User | string;
}

export interface HarvestRecord extends BaseEntity {
  pondId: Pond | string;
  seasonId: Season | string;
  date: string;
  quantity: number; // in kg
  averageWeight: number; // in grams
  marketPrice?: number;
  buyer?: string;
  notes?: string;
  recordedBy?: User | string;
}

// Inventory Types
export interface InventoryItem extends BaseEntity {
  name: string;
  category: 'Feed' | 'Equipment' | 'Chemical' | 'Medication' | 'Other';
  currentStock: number;
  unit: string;
  minimumStock: number;
  maxStock?: number;
  unitCost: number;
  supplier?: string;
  lastRestocked?: string;
  expiryDate?: string;
  location?: string;
  description?: string;
}

export interface InventoryAdjustment extends BaseEntity {
  itemId: InventoryItem | string;
  adjustmentType: 'increase' | 'decrease' | 'correction';
  quantity: number;
  reason: string;
  date: string;
  cost?: number;
  recordedBy?: User | string;
}

// Employee and Salary Types
export interface Employee extends BaseEntity {
  name: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  isActive: boolean;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

export interface SalaryRecord extends BaseEntity {
  employeeId: Employee | string;
  month: string; // YYYY-MM format
  baseSalary: number;
  allowances?: number;
  deductions?: number;
  overtime?: number;
  netSalary: number;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
}

// Form Types
export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'date' | 'select' | 'textarea';
  validation?: FormFieldValidation;
  options?: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  defaultValue?: any;
  disabled?: boolean;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  centered?: boolean;
  text?: string;
}

export interface ErrorProps extends BaseComponentProps {
  error?: Error | ApiError | string;
  onRetry?: () => void;
  showDetails?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void | Promise<void>;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
  fields: FormField[];
}

// Chart and Analytics Types
export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
  [key: string]: any;
}

export interface ChartProps extends BaseComponentProps {
  data: ChartDataPoint[];
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export interface KPIData {
  title: string;
  value: number | string;
  change?: number;
  changeText?: string;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral' | 'auto';
}

// State Management Types
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface ListState<T = any> extends AsyncState<T[]> {
  filters: FilterParams;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
  selected: string[];
}

// Context Types
export interface SeasonContextType {
  seasons: Season[];
  selectedSeason: Season | null;
  loading: boolean;
  error: string | null;
  selectSeason: (season: Season) => void;
  refetch: () => Promise<void>;
}

export interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

// Hook Return Types
export interface UseApiDataReturn<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T | null>;
  clearCache: () => void;
}

export interface UseApiMutationReturn<T = any> {
  mutate: (...args: any[]) => Promise<{ data: T | null; error: string | null }>;
  loading: boolean;
  error: string | null;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ID = string;

export type Timestamp = string;

export type Currency = number;

// Environment Types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  REACT_APP_API_BASE_URL: string;
  REACT_APP_VERSION?: string;
  REACT_APP_BUILD_DATE?: string;
}

// Event Types
export interface CustomEventMap {
  'season-changed': { season: Season };
  'expense-created': { expense: Expense };
  'pond-updated': { pond: Pond };
  'user-login': { user: User };
  'user-logout': {};
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  apiCallDuration: number;
  cacheHitRate: number;
  componentMountTime?: number;
  bundleSize?: number;
}

// Error Handling Types
export interface ErrorContext {
  componentStack: string;
  errorBoundary: string;
  userId?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

// TypeScript Migration Helper Types
export type ComponentType<P = {}> = React.ComponentType<P>;
export type FC<P = {}> = React.FC<P>;
export type ReactElement = React.ReactElement;
export type ReactNode = React.ReactNode;
export type CSSProperties = React.CSSProperties;

// Testing Types
export interface TestProps {
  'data-testid'?: string;
  'aria-label'?: string;
}

// Form Validation Enhanced Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Cache Types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  key: string;
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  totalSize: number;
  keyCount: number;
  hitRate: number;
}

// Common type aliases for convenience
export type { User as UserType, Season as SeasonType, Pond as PondType, Expense as ExpenseType };
