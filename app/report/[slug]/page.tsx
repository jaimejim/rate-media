'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MediaAnalysis, getPerspectiveLabel, getCacheKey } from '@/lib/types';
import { decodeSlug } from '@/lib/slug';
import ResultCard from '@/app/components/ResultCard';
import Link from 'next/link';

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<MediaAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const slug = params.slug as string;
  const level = parseInt(searchParams.get('level') || '5');
  const title = decodeSlug(slug);

  // Elapsed time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && !analysis) {
      interval = setInterval(() => {
        setElapsedTime(t => t + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [loading, analysis]);

  useEffect(() => {
    // Try sessionStorage first (from navigation)
    const sessionStored = sessionStorage.getItem('analysisResult');
    if (sessionStored) {
      try {
        const data = JSON.parse(sessionStored);
        setAnalysis(data);
        setLoading(false);
        sessionStorage.removeItem('analysisResult');
        // Also cache in localStorage for sharing
        const cacheKey = getCacheKey(data.title, level);
        localStorage.setItem(cacheKey, sessionStored);
        return;
      } catch {
        // Continue
      }
    }

    // Try localStorage cache (for shared links)
    const cacheKey = getCacheKey(title, level);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setAnalysis(data);
        setLoading(false);
        return;
      } catch {
        // Continue to fetch
      }
    }

    // Fetch fresh data
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, level }),
        });

        const result = await response.json();
        if (result.status === 'success') {
          setAnalysis(result.data);
          // Cache result
          const cacheKey = getCacheKey(title, level);
          localStorage.setItem(cacheKey, JSON.stringify(result.data));
        } else {
          setError(result.error || 'Failed to load analysis');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [slug, level, title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <header className="border-b border-gray-800 p-4">
          <div className="max-w-2xl mx-auto">
            <Link href="/" className="text-lg font-bold text-green-500 uppercase tracking-wider hover:text-green-400">
              TV Ratings
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400 uppercase tracking-wider text-sm">
              Analyzing from {getPerspectiveLabel(level)} perspective...
            </p>
            <p className="text-gray-600 text-xs mt-2">{elapsedTime.toFixed(1)}s</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <header className="border-b border-gray-800 p-4">
          <div className="max-w-2xl mx-auto">
            <Link href="/" className="text-lg font-bold text-green-500 uppercase tracking-wider hover:text-green-400">
              TV Ratings
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <Link
                href="/"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded uppercase tracking-wider text-sm"
              >
                Try Again
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-green-500 uppercase tracking-wider hover:text-green-400">
            TV Ratings
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto py-2">
          <ResultCard analysis={analysis} />
        </div>
      </main>
    </div>
  );
}
