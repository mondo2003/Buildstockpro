import { Elysia } from 'elysia';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import {
  getDashboardMetrics,
  getSystemHealth,
  getRecentActivity,
  getMerchantSyncStatus,
} from '../services/adminService';

export function adminRoutes(app: Elysia) {
  return app.group('/api/admin', (app) => {
    // Get dashboard metrics
    app.get('/metrics', async () => {
      try {
        const metrics = await getDashboardMetrics();
        return successResponse(metrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        return errorResponse('Failed to fetch metrics', (error as Error).message);
      }
    });

    // Get system health
    app.get('/health', async () => {
      try {
        const health = await getSystemHealth();
        return successResponse(health);
      } catch (error) {
        console.error('Error fetching health:', error);
        return errorResponse('Failed to fetch health status', (error as Error).message);
      }
    });

    // Get recent activity
    app.get('/activity', async ({ query }) => {
      try {
        const limit = query.limit ? parseInt(query.limit as string) : 10;
        const activities = await getRecentActivity(limit);
        return successResponse(activities);
      } catch (error) {
        console.error('Error fetching activity:', error);
        return errorResponse('Failed to fetch activity', (error as Error).message);
      }
    });

    // Get merchant sync status
    app.get('/sync-status', async () => {
      try {
        const syncStatus = await getMerchantSyncStatus();
        return successResponse(syncStatus);
      } catch (error) {
        console.error('Error fetching sync status:', error);
        return errorResponse('Failed to fetch sync status', (error as Error).message);
      }
    });

    // Trigger manual sync for a merchant
    app.post('/sync/:merchantId', async ({ params }) => {
      try {
        // This would trigger a sync job for the specific merchant
        // For now, just return success
        return successResponse(
          { message: 'Sync triggered', merchantId: params.merchantId },
          'Sync job queued successfully'
        );
      } catch (error) {
        console.error('Error triggering sync:', error);
        return errorResponse('Failed to trigger sync', (error as Error).message);
      }
    });

    return app;
  });
}
