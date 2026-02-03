import { query } from '../utils/database.js';
import { priceScraperJobs } from './price-scraper-job.js';

class JobScheduler {
  private cronJobs: Map<string, NodeJS.Timeout> = new Map();
  private jobStats: Map<string, { lastRun: Date | null; successCount: number; errorCount: number; lastError?: string }> = new Map();

  async start() {
    console.log('🕐 Starting job scheduler...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Price scraping jobs
    // Quick price check every 30 minutes
    this.scheduleJob('quick-price-check', '*/30 * * * *', async () => {
      console.log('🔄 [Quick Price Check] Starting...');
      const startTime = Date.now();
      try {
        await priceScraperJobs.quickPriceCheck();
        const duration = Date.now() - startTime;
        console.log(`✅ [Quick Price Check] Completed in ${duration}ms`);
        this.recordSuccess('quick-price-check');
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [Quick Price Check] Failed after ${duration}ms:`, errorMsg);
        this.recordError('quick-price-check', errorMsg);
      }
    });

    // Full scrape every 6 hours
    this.scheduleJob('full-price-scrape', '0 */6 * * *', async () => {
      console.log('🔄 [Full Price Scrape] Starting...');
      const startTime = Date.now();
      try {
        await priceScraperJobs.fullScrape();
        const duration = Date.now() - startTime;
        console.log(`✅ [Full Price Scrape] Completed in ${duration}ms`);
        this.recordSuccess('full-price-scrape');
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [Full Price Scrape] Failed after ${duration}ms:`, errorMsg);
        this.recordError('full-price-scrape', errorMsg);
      }
    });

    // Start price history update job (runs daily)
    this.scheduleJob('update-price-history', '0 0 * * *', async () => {
      console.log('🔄 [Price History Update] Starting...');
      const startTime = Date.now();
      try {
        await this.updatePriceHistory();
        const duration = Date.now() - startTime;
        console.log(`✅ [Price History Update] Completed in ${duration}ms`);
        this.recordSuccess('update-price-history');
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [Price History Update] Failed after ${duration}ms:`, errorMsg);
        this.recordError('update-price-history', errorMsg);
      }
    });

    // Start stock alerts check (runs every hour)
    this.scheduleJob('check-stock-alerts', '0 * * * *', async () => {
      console.log('🔄 [Stock Alerts Check] Starting...');
      const startTime = Date.now();
      try {
        await this.checkStockAlerts();
        const duration = Date.now() - startTime;
        console.log(`✅ [Stock Alerts Check] Completed in ${duration}ms`);
        this.recordSuccess('check-stock-alerts');
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [Stock Alerts Check] Failed after ${duration}ms:`, errorMsg);
        this.recordError('check-stock-alerts', errorMsg);
      }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Job scheduler started successfully');
    console.log('');
    console.log('Scheduled Jobs:');
    console.log('  • Quick Price Check:  Every 30 minutes');
    console.log('  • Full Price Scrape:  Every 6 hours');
    console.log('  • Price History:      Daily at midnight');
    console.log('  • Stock Alerts:       Every hour');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  private scheduleJob(name: string, cronExpression: string, handler: () => Promise<void>) {
    // Initialize stats for this job
    if (!this.jobStats.has(name)) {
      this.jobStats.set(name, {
        lastRun: null,
        successCount: 0,
        errorCount: 0,
      });
    }

    // Simple implementation using setTimeout
    // For production, consider using a proper cron library
    const interval = this.cronToInterval(cronExpression);
    const timeoutId = setTimeout(async () => {
      await handler();
      // Schedule next run
      this.scheduleJob(name, cronExpression, handler);
    }, interval);

    this.cronJobs.set(name, timeoutId);
    const intervalMinutes = Math.floor(interval / 60000);
    console.log(`  ✓ Scheduled: ${name} (every ${intervalMinutes} minutes)`);
  }

  private cronToInterval(cronExpression: string): number {
    // Simple parser for common cron expressions
    // For production, use a proper cron library like 'node-cron'
    if (cronExpression === '0 0 * * *') {
      // Daily at midnight
      return 24 * 60 * 60 * 1000;
    } else if (cronExpression === '0 * * * *') {
      // Every hour
      return 60 * 60 * 1000;
    } else if (cronExpression === '*/30 * * * *') {
      // Every 30 minutes
      return 30 * 60 * 1000;
    } else if (cronExpression === '0 */6 * * *') {
      // Every 6 hours
      return 6 * 60 * 60 * 1000;
    }
    // Default to 1 hour
    return 60 * 60 * 1000;
  }

  private recordSuccess(jobName: string) {
    const stats = this.jobStats.get(jobName);
    if (stats) {
      stats.lastRun = new Date();
      stats.successCount++;
    }
  }

  private recordError(jobName: string, error: string) {
    const stats = this.jobStats.get(jobName);
    if (stats) {
      stats.lastRun = new Date();
      stats.errorCount++;
      stats.lastError = error;
    }
  }

  private async updatePriceHistory() {
    // Update price history for all products
    await query(`
      INSERT INTO price_history (product_id, listing_id, price, recorded_at)
      SELECT p.id, l.id, l.price, NOW()
      FROM products p
      JOIN listings l ON l.product_id = p.id
      WHERE l.updated_at > NOW() - INTERVAL '1 day'
    `);
  }

  private async checkStockAlerts() {
    // Check for low stock and create alerts
    const lowStockProducts = await query(`
      SELECT p.id, p.name, l.merchant_id, l.stock_level, l.stock_quantity
      FROM products p
      JOIN listings l ON l.product_id = p.id
      WHERE l.stock_level = 'low-stock' OR l.stock_quantity < 10
    `);

    for (const product of lowStockProducts) {
      // Create or update stock alert
      await query(`
        INSERT INTO stock_alerts (product_id, merchant_id, alert_type, message, created_at)
        VALUES ($1, $2, 'low_stock', $3, NOW())
        ON CONFLICT (product_id, merchant_id, resolved_at)
        DO UPDATE SET message = $3, created_at = NOW()
      `, [product.id, product.merchant_id, `Low stock: ${product.name} has only ${product.stock_quantity} units left`]);
    }
  }

  getJobStatistics() {
    const stats: Record<string, any> = {};
    for (const [name, data] of this.jobStats.entries()) {
      stats[name] = {
        lastRun: data.lastRun?.toISOString() || 'Never',
        successCount: data.successCount,
        errorCount: data.errorCount,
        lastError: data.lastError || null,
      };
    }
    return stats;
  }

  stop() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛑 Stopping job scheduler...');
    for (const [name, timeoutId] of this.cronJobs) {
      clearTimeout(timeoutId);
      console.log(`  ✓ Stopped: ${name}`);
    }
    this.cronJobs.clear();
    console.log('✅ Job scheduler stopped');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

export const jobScheduler = new JobScheduler();
