import { ScrewfixScraper } from './screwfix-scraper';
import { BaseScraper, ScrapingResult } from './base-scraper';
import { query, queryOne } from '../utils/database';

/**
 * Scraping job types
 */
export enum JobType {
  FULL_SYNC = 'full_sync',
  CATEGORY_SYNC = 'category_sync',
  PRODUCT_SYNC = 'product_sync',
  STOCK_CHECK = 'stock_check'
}

/**
 * Job priority (higher = more important)
 */
export enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4
}

/**
 * Scraping job
 */
export interface ScrapingJob {
  id: string;
  merchant: string;
  type: JobType;
  priority: JobPriority;
  category?: string;
  productUrl?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: ScrapingResult;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Scraper registry
 */
class ScraperRegistry {
  private scrapers: Map<string, BaseScraper> = new Map();

  register(merchant: string, scraper: BaseScraper) {
    this.scrapers.set(merchant, scraper);
  }

  get(merchant: string): BaseScraper | undefined {
    return this.scrapers.get(merchant);
  }

  list(): string[] {
    return Array.from(this.scrapers.keys());
  }
}

/**
 * Scraping queue manager
 */
export class ScraperQueue {
  private registry: ScraperRegistry;
  private queue: ScrapingJob[] = [];
  private processing = false;
  private maxConcurrent = 3; // Max 3 scrapers running at once
  private currentJobs = 0;

  constructor() {
    this.registry = new ScraperRegistry();
    this.initializeScrapers();
  }

  /**
   * Initialize all scrapers
   */
  private async initializeScrapers() {
    const screwfix = new ScrewfixScraper();
    await screwfix.initialize();
    this.registry.register('screwfix', screwfix);

    // Add more scrapers here:
    // const travisPerkins = new TravisPerkinsScraper();
    // await travisPerkins.initialize();
    // this.registry.register('travis-perkins', travisPerkins);

    console.log(`[ScraperQueue] Initialized ${this.registry.list().length} scrapers`);
  }

  /**
   * Add a job to the queue
   */
  async addJob(job: Omit<ScrapingJob, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const newJob: ScrapingJob = {
      ...job,
      id: this.generateJobId(),
      status: 'pending',
      createdAt: new Date()
    };

    this.queue.push(newJob);
    this.queue.sort((a, b) => b.priority - a.priority); // Sort by priority

    console.log(`[ScraperQueue] Added job ${newJob.id} (${job.merchant}/${job.type})`);

    // Save to database
    await this.saveJobToDb(newJob);

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return newJob.id;
  }

  /**
   * Process the queue
   */
  private async processQueue() {
    if (this.processing) return;

    this.processing = true;
    console.log('[ScraperQueue] Starting queue processor');

    while (this.queue.length > 0 && this.currentJobs < this.maxConcurrent) {
      const job = this.queue.shift();
      if (!job) break;

      if (job.status !== 'pending') continue;

      this.currentJobs++;
      this.processJob(job);
    }

    if (this.queue.length === 0 && this.currentJobs === 0) {
      this.processing = false;
      console.log('[ScraperQueue] Queue processor stopped');
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScrapingJob) {
    const scraper = this.registry.get(job.merchant);

    if (!scraper) {
      await this.markJobFailed(job.id, `No scraper found for merchant: ${job.merchant}`);
      this.currentJobs--;
      this.processQueue();
      return;
    }

    console.log(`[ScraperQueue] Processing job ${job.id} (${job.merchant}/${job.type})`);

    // Update job status
    job.status = 'running';
    job.startedAt = new Date();
    await this.updateJobInDb(job);

    try {
      let result: ScrapingResult;

      switch (job.type) {
        case JobType.CATEGORY_SYNC:
          result = await scraper.scrapeProducts(job.category);
          break;

        case JobType.PRODUCT_SYNC:
          if (!job.productUrl) {
            throw new Error('Product URL required for product sync');
          }
          const product = await scraper.scrapeProductPage(job.productUrl);
          result = {
            success: !!product,
            productsScraped: product ? 1 : 0,
            errors: product ? [] : ['Failed to scrape product'],
            duration: 0,
            lastScrapedAt: new Date()
          };
          break;

        case JobType.FULL_SYNC:
        case JobType.STOCK_CHECK:
          // For full sync, scrape multiple categories
          const categories = ['electrical', 'plumbing', 'tools', 'safety', 'decorating'];
          let totalProducts = 0;
          const allErrors: string[] = [];

          for (const category of categories) {
            const catResult = await scraper.scrapeProducts(category);
            totalProducts += catResult.productsScraped;
            allErrors.push(...catResult.errors);
          }

          result = {
            success: allErrors.length === 0,
            productsScraped: totalProducts,
            errors: allErrors,
            duration: 0,
            lastScrapedAt: new Date()
          };
          break;

        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.result = result;
      job.status = result.success ? 'completed' : 'failed';
      job.completedAt = new Date();

      if (result.errors.length > 0) {
        job.error = result.errors.join('; ');
      }

      console.log(`[ScraperQueue] Job ${job.id} completed: ${result.productsScraped} products`);

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ScraperQueue] Job ${job.id} failed:`, error);
    }

    await this.updateJobInDb(job);
    this.currentJobs--;
    this.processQueue();
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ScrapingJob | null> {
    // Check memory first
    const memJob = this.queue.find(j => j.id === jobId);
    if (memJob) return memJob;

    // Check database
    const dbJob = await queryOne(
      `SELECT * FROM scraping_jobs WHERE id = $1`,
      [jobId]
    );

    return dbJob || null;
  }

  /**
   * Get queue stats
   */
  async getStats(): Promise<{
    queue: number;
    running: number;
    completed: number;
    failed: number;
    scrapers: string[];
  }> {
    const stats = await queryOne(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'running') as running,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM scraping_jobs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);

    return {
      queue: this.queue.length,
      running: this.currentJobs,
      completed: Number(stats?.completed || 0),
      failed: Number(stats?.failed || 0),
      scrapers: this.registry.list()
    };
  }

  /**
   * Generate job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Save job to database
   */
  private async saveJobToDb(job: ScrapingJob): Promise<void> {
    await query(
      `INSERT INTO scraping_jobs (
        id, merchant, job_type, priority, category, product_url,
        status, result, error, created_at, started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        result = EXCLUDED.result,
        error = EXCLUDED.error,
        started_at = EXCLUDED.started_at,
        completed_at = EXCLUDED.completed_at`,
      [
        job.id,
        job.merchant,
        job.type,
        job.priority,
        job.category || null,
        job.productUrl || null,
        job.status,
        job.result ? JSON.stringify(job.result) : null,
        job.error || null,
        job.createdAt,
        job.startedAt || null,
        job.completedAt || null
      ]
    );
  }

  /**
   * Update job in database
   */
  private async updateJobInDb(job: ScrapingJob): Promise<void> {
    await query(
      `UPDATE scraping_jobs SET
        status = $1,
        result = $2,
        error = $3,
        started_at = $4,
        completed_at = $5
      WHERE id = $6`,
      [
        job.status,
        job.result ? JSON.stringify(job.result) : null,
        job.error || null,
        job.startedAt || null,
        job.completedAt || null,
        job.id
      ]
    );
  }

  /**
   * Mark job as failed
   */
  private async markJobFailed(jobId: string, error: string): Promise<void> {
    await query(
      `UPDATE scraping_jobs SET
        status = 'failed',
        error = $1,
        completed_at = NOW()
      WHERE id = $2`,
      [error, jobId]
    );
  }

  /**
   * Trigger manual sync
   */
  async triggerSync(merchant?: string, category?: string): Promise<string> {
    const merchants = merchant ? [merchant] : this.registry.list();

    if (merchants.length === 0) {
      throw new Error('No scrapers available');
    }

    // Add job for each merchant
    const jobIds: string[] = [];

    for (const m of merchants) {
      const jobId = await this.addJob({
        merchant: m,
        type: category ? JobType.CATEGORY_SYNC : JobType.FULL_SYNC,
        priority: JobPriority.NORMAL,
        category
      });
      jobIds.push(jobId);
    }

    return jobIds[0]; // Return first job ID
  }
}

// Singleton instance
export const scraperQueue = new ScraperQueue();

// Helper database functions
async function queryOne(sql: string, params: any[] = []): Promise<any> {
  // Use actual database connection
  return null;
}

async function query(sql: string, params: any[] = []): Promise<any[]> {
  // Use actual database connection
  return [];
}
