/**
 * Scheduled Price Scraping Jobs
 * Automatically scrapes prices from multiple retailers at scheduled intervals
 */

import { priceScraper } from '../services/priceScraper';

export class PriceScraperJobs {
  private isRunning = false;
  private lastRun: Date | null = null;
  private stats = {
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    productsScraped: 0,
  };
  private maxRetries = 3;

  /**
   * Scrape all retailers for a specific category
   */
  async scrapeCategory(category: string, limit: number = 20) {
    console.log(`[ScheduledJob] Starting category scrape: ${category}`);
    const startTime = Date.now();

    const retailers = ['screwfix', 'wickes', 'bandq', 'toolstation', 'travisperkins', 'jewson'];
    let totalScraped = 0;
    const errors: string[] = [];

    for (const retailer of retailers) {
      let success = false;
      let attempt = 0;

      // Retry logic for each retailer
      while (!success && attempt < this.maxRetries) {
        attempt++;
        try {
          console.log(`[ScheduledJob] Scraping ${retailer} (attempt ${attempt}/${this.maxRetries})...`);

          const result = await priceScraper.scrapeCategory({
            retailer,
            category,
            limit: Math.ceil(limit / retailers.length),
            useMockData: false, // Try live first, falls back to realistic data
          });

          if (result.success) {
            totalScraped += result.total;
            console.log(`[ScheduledJob] ✅ ${retailer}: ${result.total} products`);
            success = true;
          } else {
            const errorMsg = result.errors.join(', ');
            errors.push(`${retailer}: ${errorMsg}`);
            console.log(`[ScheduledJob] ❌ ${retailer}: ${errorMsg}`);

            // Don't retry on certain errors
            if (errorMsg.includes('Unknown retailer') || errorMsg.includes('not implemented')) {
              console.log(`[ScheduledJob] ⚠️  ${retailer}: Skipping retries (not implemented)`);
              break;
            }

            if (attempt < this.maxRetries) {
              const delay = this.getRetryDelay(attempt);
              console.log(`[ScheduledJob] ⏳ Retrying ${retailer} in ${delay}ms...`);
              await this.delay(delay);
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${retailer}: ${errorMsg}`);
          console.error(`[ScheduledJob] ❌ ${retailer} (attempt ${attempt}): ${errorMsg}`);

          if (attempt < this.maxRetries) {
            const delay = this.getRetryDelay(attempt);
            console.log(`[ScheduledJob] ⏳ Retrying ${retailer} in ${delay}ms...`);
            await this.delay(delay);
          }
        }
      }

      // Rate limiting - wait between retailers (even after retries)
      await this.delay(2000);
    }

    const duration = Date.now() - startTime;
    this.stats.totalRuns++;
    this.stats.productsScraped += totalScraped;

    if (errors.length === 0) {
      this.stats.successfulRuns++;
      console.log(`[ScheduledJob] ✅ Completed: ${totalScraped} products in ${duration}ms`);
    } else {
      this.stats.failedRuns++;
      console.log(`[ScheduledJob] ⚠️  Completed with errors: ${totalScraped} products, ${errors.length} errors`);
    }

    this.lastRun = new Date();

    return {
      success: errors.length === 0,
      totalScraped,
      duration,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 2^attempt * 1000ms, with jitter
    const baseDelay = Math.pow(2, attempt) * 1000;
    const jitter = Math.random() * 1000;
    return Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
  }

  /**
   * Scrape multiple categories
   */
  async scrapeMultipleCategories(categories: string[], limit: number = 20) {
    console.log(`[ScheduledJob] Starting multi-category scrape: ${categories.join(', ')}`);

    const results = [];
    for (const category of categories) {
      const result = await this.scrapeCategory(category, limit);
      results.push({ category, result });
      await this.delay(5000); // Wait 5 seconds between categories
    }

    return results;
  }

  /**
   * Quick price check - only update prices for products already in database
   */
  async quickPriceCheck() {
    console.log(`[ScheduledJob] Quick price check...`);

    const stats = await priceScraper.getStatistics();
    const categories = stats.categories.slice(0, 3); // Check top 3 categories

    return await this.scrapeMultipleCategories(categories, 10);
  }

  /**
   * Full scrape - all categories, all retailers
   */
  async fullScrape() {
    console.log(`[ScheduledJob] Starting FULL scrape...`);

    const categories = [
      'power-tools',
      'hand-tools',
      'gardening',
      'electrical',
      'plumbing',
    ];

    return await this.scrapeMultipleCategories(categories, 30);
  }

  /**
   * Get job statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      lastRun: this.lastRun?.toISOString() || null,
      isRunning: this.isRunning,
      successRate: this.stats.totalRuns > 0
        ? (this.stats.successfulRuns / this.stats.totalRuns * 100).toFixed(1) + '%'
        : 'N/A',
    };
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const priceScraperJobs = new PriceScraperJobs();
