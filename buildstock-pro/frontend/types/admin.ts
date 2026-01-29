// Admin Types for BuildStock Pro

export interface AdminMetrics {
  totalUsers: number;
  totalProducts: number;
  totalMerchants: number;
  totalOrders: number;
  revenue: number;
  activeUsers: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  apiResponseTime: number;
  databaseStatus: 'connected' | 'disconnected' | 'slow';
  cacheStatus: 'connected' | 'disconnected';
  lastCheck: string;
}

export interface Activity {
  id: string;
  type: 'user' | 'order' | 'product' | 'merchant' | 'system';
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: string;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface UserGrowthChartData {
  date: string;
  users: number;
  newSignups: number;
}

export interface ProductPerformanceChartData {
  productName: string;
  views: number;
  sales: number;
  revenue: number;
}

export interface MerchantPerformanceChartData {
  merchantName: string;
  products: number;
  orders: number;
  revenue: number;
  rating: number;
}

// Mock Data for Development
export const mockAdminMetrics: AdminMetrics = {
  totalUsers: 12453,
  totalProducts: 8534,
  totalMerchants: 423,
  totalOrders: 45678,
  revenue: 1245678.90,
  activeUsers: 2341,
  pendingOrders: 156,
  completedOrders: 45522,
};

export const mockSystemHealth: SystemHealth = {
  status: 'healthy',
  uptime: 99.9,
  cpu: 45.2,
  memory: 62.8,
  disk: 71.3,
  apiResponseTime: 120,
  databaseStatus: 'connected',
  cacheStatus: 'connected',
  lastCheck: new Date().toISOString(),
};

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'user',
    action: 'user_registered',
    description: 'New user registration',
    userId: 'user-123',
    userName: 'John Doe',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: '2',
    type: 'order',
    action: 'order_placed',
    description: 'New order placed',
    userId: 'user-456',
    userName: 'Jane Smith',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    metadata: { orderId: 'order-789', value: 299.99 },
  },
  {
    id: '3',
    type: 'product',
    action: 'product_added',
    description: 'New product added by merchant',
    userId: 'merchant-123',
    userName: 'Tech Store',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    metadata: { productId: 'product-456', productName: 'Wireless Headphones' },
  },
  {
    id: '4',
    type: 'system',
    action: 'backup_completed',
    description: 'Database backup completed successfully',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: '5',
    type: 'merchant',
    action: 'merchant_approved',
    description: 'New merchant application approved',
    userId: 'merchant-789',
    userName: 'Fashion Hub',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
  },
];

export const mockRevenueChartData: RevenueChartData[] = [
  { date: '2026-01-23', revenue: 12500, orders: 234 },
  { date: '2026-01-24', revenue: 15200, orders: 289 },
  { date: '2026-01-25', revenue: 18100, orders: 312 },
  { date: '2026-01-26', revenue: 16800, orders: 298 },
  { date: '2026-01-27', revenue: 21300, orders: 356 },
  { date: '2026-01-28', revenue: 24700, orders: 412 },
  { date: '2026-01-29', revenue: 22100, orders: 387 },
];

export const mockUserGrowthChartData: UserGrowthChartData[] = [
  { date: '2026-01-23', users: 11800, newSignups: 145 },
  { date: '2026-01-24', users: 11950, newSignups: 150 },
  { date: '2026-01-25', users: 12100, newSignups: 150 },
  { date: '2026-01-26', users: 12280, newSignups: 180 },
  { date: '2026-01-27', users: 12420, newSignups: 140 },
  { date: '2026-01-28', users: 12410, newSignups: 130 },
  { date: '2026-01-29', users: 12453, newSignups: 43 },
];

export const mockProductPerformanceChartData: ProductPerformanceChartData[] = [
  { productName: 'Wireless Headphones', views: 5420, sales: 892, revenue: 89200 },
  { productName: 'Smart Watch', views: 4890, sales: 721, revenue: 144200 },
  { productName: 'USB-C Hub', views: 4230, sales: 1156, revenue: 57800 },
  { productName: 'Laptop Stand', views: 3870, sales: 634, revenue: 31700 },
  { productName: 'Mechanical Keyboard', views: 3650, sales: 489, revenue: 73350 },
];

export const mockMerchantPerformanceChartData: MerchantPerformanceChartData[] = [
  { merchantName: 'Tech Store', products: 234, orders: 1245, revenue: 234500, rating: 4.8 },
  { merchantName: 'Fashion Hub', products: 567, orders: 2341, revenue: 189300, rating: 4.6 },
  { merchantName: 'Home Essentials', products: 189, orders: 876, revenue: 98700, rating: 4.9 },
  { merchantName: 'Sports Pro', products: 345, orders: 1567, revenue: 145600, rating: 4.7 },
  { merchantName: 'Beauty Box', products: 423, orders: 1987, revenue: 167800, rating: 4.5 },
];
