import { query } from '../utils/database.js';

class JobScheduler {
  private cronJobs: Map<string, NodeJS.Timeout> = new Map();

  async start() {
    console.log('Starting job scheduler...');

    // Start price history update job (runs daily)
    this.scheduleJob('update-price-history', '0 0 * * *', async () => {
      console.log('Running price history update job...');
      try {
        await this.updatePriceHistory();
        console.log('Price history update completed');
      } catch (error) {
        console.error('Price history update failed:', error);
      }
    });

    // Start stock alerts check (runs every hour)
    this.scheduleJob('check-stock-alerts', '0 * * * *', async () => {
      console.log('Running stock alerts check...');
      try {
        await this.checkStockAlerts();
        console.log('Stock alerts check completed');
      } catch (error) {
        console.error('Stock alerts check failed:', error);
      }
    });

    console.log('Job scheduler started successfully');
  }

  private scheduleJob(name: string, cronExpression: string, handler: () => Promise<void>) {
    // Simple implementation using setInterval
    // For production, consider using a proper cron library
    const interval = this.cronToInterval(cronExpression);
    const timeoutId = setTimeout(async () => {
      await handler();
      // Schedule next run
      this.scheduleJob(name, cronExpression, handler);
    }, interval);

    this.cronJobs.set(name, timeoutId);
    console.log(`Scheduled job: ${name} (interval: ${interval}ms)`);
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
    }
    // Default to 1 hour
    return 60 * 60 * 1000;
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

  stop() {
    for (const [name, timeoutId] of this.cronJobs) {
      clearTimeout(timeoutId);
      console.log(`Stopped job: ${name}`);
    }
    this.cronJobs.clear();
    console.log('Job scheduler stopped');
  }
}

export const jobScheduler = new JobScheduler();
