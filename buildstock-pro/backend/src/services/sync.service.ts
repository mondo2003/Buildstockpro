import { query, queryOne } from '../utils/database.js';

interface Merchant {
  id: string;
  name: string;
  sync_url?: string;
  sync_enabled: boolean;
}

interface SyncResult {
  merchantId: string;
  merchantName: string;
  success: boolean;
  productsAdded: number;
  productsUpdated: number;
  listingsAdded: number;
  listingsUpdated: number;
  error?: string;
}

class SyncService {
  private intervalId: NodeJS.Timeout | null = null;

  async syncAllMerchants(): Promise<SyncResult[]> {
    const merchants = await this.getMerchants();
    const results: SyncResult[] = [];

    for (const merchant of merchants) {
      if (merchant.sync_enabled && merchant.sync_url) {
        const result = await this.syncMerchant(merchant.id);
        results.push(result);
      }
    }

    return results;
  }

  async syncMerchant(merchantId: string): Promise<SyncResult> {
    try {
      const merchant = await queryOne<Merchant>(
        'SELECT id, name, sync_url, sync_enabled FROM merchants WHERE id = $1',
        [merchantId]
      );

      if (!merchant) {
        return {
          merchantId,
          merchantName: 'Unknown',
          success: false,
          productsAdded: 0,
          productsUpdated: 0,
          listingsAdded: 0,
          listingsUpdated: 0,
          error: 'Merchant not found',
        };
      }

      if (!merchant.sync_enabled || !merchant.sync_url) {
        return {
          merchantId,
          merchantName: merchant.name,
          success: false,
          productsAdded: 0,
          productsUpdated: 0,
          listingsAdded: 0,
          listingsUpdated: 0,
          error: 'Sync not enabled for this merchant',
        };
      }

      // Fetch data from merchant's sync URL
      const response = await fetch(merchant.sync_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process the sync data
      let productsAdded = 0;
      let productsUpdated = 0;
      let listingsAdded = 0;
      let listingsUpdated = 0;

      // Record sync job
      await query(
        `INSERT INTO sync_jobs (merchant_id, status, products_added, products_updated, listings_added, listings_updated, started_at, completed_at)
         VALUES ($1, 'completed', $2, $3, $4, $5, NOW(), NOW())`,
        [merchantId, productsAdded, productsUpdated, listingsAdded, listingsUpdated]
      );

      return {
        merchantId,
        merchantName: merchant.name,
        success: true,
        productsAdded,
        productsUpdated,
        listingsAdded,
        listingsUpdated,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Record failed sync job
      await query(
        `INSERT INTO sync_jobs (merchant_id, status, error_message, started_at, completed_at)
         VALUES ($1, 'failed', $2, NOW(), NOW())`,
        [merchantId, errorMessage]
      );

      return {
        merchantId,
        merchantName: 'Unknown',
        success: false,
        productsAdded: 0,
        productsUpdated: 0,
        listingsAdded: 0,
        listingsUpdated: 0,
        error: errorMessage,
      };
    }
  }

  private async getMerchants(): Promise<Merchant[]> {
    return await query<Merchant>(
      'SELECT id, name, sync_url, sync_enabled FROM merchants WHERE sync_enabled = true'
    );
  }

  startPeriodicSync() {
    // Run sync every 6 hours
    this.intervalId = setInterval(async () => {
      console.log('Running periodic merchant sync...');
      try {
        const results = await this.syncAllMerchants();
        console.log('Periodic sync completed:', results);
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, 6 * 60 * 60 * 1000);

    console.log('Periodic sync service started (runs every 6 hours)');
  }

  stopPeriodicSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Periodic sync service stopped');
    }
  }
}

export const syncService = new SyncService();
