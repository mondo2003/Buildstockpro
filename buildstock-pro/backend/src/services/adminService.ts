import { count, supabase } from '../utils/database';

export interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalMerchants: number;
  activeListings: number;
  totalListings: number;
  activeSessions: number;
  recentSyncs: number;
  failedSyncs: number;
}

export interface SystemHealth {
  apiServer: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  responseTime: number;
  uptime: string;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const [
      userCount,
      productCount,
      merchantCount,
      { count: activeListingsCount },
      { count: totalListingsCount },
    ] = await Promise.all([
      count('users'),
      count('products'),
      count('merchants'),
      supabase
        .from('product_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('stock_status', 'in_stock'),
      supabase
        .from('product_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
    ]);

    // Count sync jobs in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ count: completedSyncs }, { count: failedSyncs }] = await Promise.all([
      supabase
        .from('sync_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', yesterday),
      supabase
        .from('sync_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('created_at', yesterday),
    ]);

    return {
      totalUsers: userCount || 0,
      totalProducts: productCount || 0,
      totalMerchants: merchantCount || 0,
      activeListings: activeListingsCount || 0,
      totalListings: totalListingsCount || 0,
      activeSessions: 0, // Would need session tracking implementation
      recentSyncs: completedSyncs || 0,
      failedSyncs: failedSyncs || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const startTime = Date.now();

  let dbConnected = false;

  try {
    // Test database connection
    const { error } = await supabase.from('users').select('id').limit(1);
    dbConnected = !error;
  } catch {
    dbConnected = false;
  }

  const responseTime = Date.now() - startTime;
  const uptime = process.uptime();

  return {
    apiServer: 'healthy',
    database: dbConnected ? 'connected' : 'disconnected',
    responseTime,
    uptime: formatUptime(uptime),
    memoryUsage: process.memoryUsage(),
  };
}

export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      type: a.activity_type,
      description: `${a.activity_type} - ${a.resource_type || 'system'}`,
      timestamp: a.created_at,
      userId: a.user_id,
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function getMerchantSyncStatus() {
  try {
    const { data, error } = await supabase
      .from('merchants')
      .select(`
        id,
        name,
        slug,
        sync_status,
        last_sync_at,
        sync_jobs(count)
      `)
      .order('name');

    if (error) {
      throw error;
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      syncStatus: m.sync_status,
      lastSync: m.last_sync_at,
      totalSyncs: m.sync_jobs?.[0]?.count || 0,
    }));
  } catch (error) {
    console.error('Error fetching merchant sync status:', error);
    return [];
  }
}

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
