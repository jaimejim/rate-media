import { Redis } from '@upstash/redis';
import { MediaAnalysis } from './types';

// Initialize Redis client if credentials are available
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory fallback cache (for development or if Redis not configured)
const memoryCache = new Map<string, MediaAnalysis>();

// Generate cache key from title and level
export function getCacheKey(title: string, level: number): string {
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, '-');
  return `analysis:${normalizedTitle}:${level}`;
}

// Get cached analysis
export async function getCachedAnalysis(title: string, level: number): Promise<MediaAnalysis | null> {
  const key = getCacheKey(title, level);

  // Try Redis first
  if (redis) {
    try {
      const cached = await redis.get<MediaAnalysis>(key);
      if (cached) {
        console.log(`Cache hit (Redis): ${key}`);
        return cached;
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }
  }

  // Fallback to memory cache
  const memCached = memoryCache.get(key);
  if (memCached) {
    console.log(`Cache hit (memory): ${key}`);
    return memCached;
  }

  console.log(`Cache miss: ${key}`);
  return null;
}

// Store analysis in cache
export async function setCachedAnalysis(title: string, level: number, analysis: MediaAnalysis): Promise<void> {
  const key = getCacheKey(title, level);

  // Store in Redis with 30-day expiry
  if (redis) {
    try {
      await redis.set(key, analysis, { ex: 60 * 60 * 24 * 30 }); // 30 days
      console.log(`Cached in Redis: ${key}`);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  // Also store in memory cache (helps with warm instances)
  memoryCache.set(key, analysis);
  console.log(`Cached in memory: ${key}`);
}

// Check if Redis is configured
export function isRedisConfigured(): boolean {
  return redis !== null;
}
