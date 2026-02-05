import { neon } from '@neondatabase/serverless';
import { MediaAnalysis } from './types';

// Get database connection
function getDb() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    console.warn('No DATABASE_URL or POSTGRES_URL configured');
    return null;
  }
  return neon(databaseUrl);
}

// Initialize the database table (called on first request)
let tableInitialized = false;

async function initTable() {
  if (tableInitialized) return;

  const sql = getDb();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        level INTEGER NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(title, level)
      )
    `;
    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_analyses_title_level ON analyses(title, level)
    `;
    tableInitialized = true;
    console.log('Database table initialized');
  } catch (error) {
    console.error('Failed to initialize table:', error);
  }
}

// Normalize title for consistent storage
function normalizeTitle(title: string): string {
  return title.toLowerCase().trim();
}

// Get cached analysis from database
export async function getCachedAnalysis(title: string, level: number): Promise<MediaAnalysis | null> {
  const sql = getDb();
  if (!sql) {
    console.log('Database not configured, skipping cache lookup');
    return null;
  }

  await initTable();

  try {
    const normalizedTitle = normalizeTitle(title);
    const result = await sql`
      SELECT data FROM analyses
      WHERE title = ${normalizedTitle} AND level = ${level}
      LIMIT 1
    `;

    if (result.length > 0) {
      console.log(`Cache hit (Postgres): ${normalizedTitle} at level ${level}`);
      return result[0].data as MediaAnalysis;
    }

    console.log(`Cache miss: ${normalizedTitle} at level ${level}`);
    return null;
  } catch (error) {
    console.error('Database get error:', error);
    return null;
  }
}

// Store analysis in database (upsert - insert or update)
export async function setCachedAnalysis(title: string, level: number, analysis: MediaAnalysis): Promise<void> {
  const sql = getDb();
  if (!sql) {
    console.log('Database not configured, skipping cache store');
    return;
  }

  await initTable();

  try {
    const normalizedTitle = normalizeTitle(title);
    await sql`
      INSERT INTO analyses (title, level, data, updated_at)
      VALUES (${normalizedTitle}, ${level}, ${JSON.stringify(analysis)}, CURRENT_TIMESTAMP)
      ON CONFLICT (title, level)
      DO UPDATE SET data = ${JSON.stringify(analysis)}, updated_at = CURRENT_TIMESTAMP
    `;
    console.log(`Cached in Postgres: ${normalizedTitle} at level ${level}`);
  } catch (error) {
    console.error('Database set error:', error);
  }
}

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}
