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
  const [isRegenerating, setIsRegenerating] = useState(false);

  const slug = params.slug as string;
  const level = parseInt(searchParams.get('level') || '5');
  const title = decodeSlug(slug);

  // Regenerate analysis
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setElapsedTime(0);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, level, skipCache: true }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setAnalysis(result.data);
        const cacheKey = getCacheKey(title, level);
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
      } else {
        setError(result.error || 'Failed to regenerate analysis');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Elapsed time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((loading && !analysis) || isRegenerating) {
      interval = setInterval(() => {
        setElapsedTime(t => t + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [loading, analysis, isRegenerating]);

  useEffect(() => {
    // Try sessionStorage first (from navigation)
    const sessionStored = sessionStorage.getItem('analysisResult');
    if (sessionStored) {
      try {
        const data = JSON.parse(sessionStored);
        setAnalysis(data);
        setLoading(false);
        sessionStorage.removeItem('analysisResult');
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
      <div className="min-h-screen flex flex-col">
        <header className="px-6 py-4 border-b border-[#E0E0E0]">
          <Link href="/" className="text-heading hover:text-[#E65100]">
            TV Ratings
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-6" />
            <p className="text-body text-[#757575]">
              Analyzing from {getPerspectiveLabel(level)} perspective
            </p>
            <p className="text-caption text-[#9E9E9E] mt-2">{elapsedTime.toFixed(1)}s</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="px-6 py-4 border-b border-[#E0E0E0]">
          <Link href="/" className="text-heading hover:text-[#E65100]">
            TV Ratings
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            <div className="error-box">
              <h2 className="text-body font-semibold mb-2">Error</h2>
              <p className="text-caption">{error}</p>
            </div>
            <Link href="/" className="btn w-full mt-6 text-center">
              Try Again
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-[#E0E0E0]">
        <Link href="/" className="text-heading hover:text-[#E65100]">
          TV Ratings
        </Link>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <ResultCard
            analysis={analysis}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        </div>
      </main>
    </div>
  );
}
