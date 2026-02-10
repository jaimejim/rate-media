'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSlug } from '@/lib/slug';
import { getPerspectiveLabel, getCacheKey, MediaAnalysis } from '@/lib/types';

export default function Home() {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const router = useRouter();

  const perspectiveLabel = getPerspectiveLabel(level);

  // Load cached slider value on mount
  useEffect(() => {
    const cached = localStorage.getItem('tvratings_level');
    if (cached) {
      setLevel(parseInt(cached));
    }
  }, []);

  // Save slider value when it changes
  useEffect(() => {
    localStorage.setItem('tvratings_level', level.toString());
  }, [level]);

  // Elapsed time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(t => t + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(title.trim(), level);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached) as MediaAnalysis;
        sessionStorage.setItem('analysisResult', cached);
        const slug = createSlug(data.title);
        router.push(`/${slug}?level=${level}`);
        return;
      } catch {
        // Cache invalid, continue to fetch
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), level }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        const cacheKey = getCacheKey(title.trim(), level);
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
        const slug = createSlug(result.data.title);
        router.push(`/${slug}?level=${level}`);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - minimal */}
      <header className="px-6 py-4 border-b border-[#E0E0E0]">
        <h1 className="text-heading">TV Ratings</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Perspective Control */}
            <div>
              <div className="flex justify-between items-baseline mb-4">
                <label className="text-micro text-[#757575]">Perspective</label>
                <span className="text-body font-semibold">
                  {level} / 10
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full"
              />

              <div className="flex justify-between mt-3">
                <span className="text-caption text-[#757575]">Progressive</span>
                <span className="text-caption font-medium">{perspectiveLabel}</span>
                <span className="text-caption text-[#757575]">Traditional</span>
              </div>
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Title Input */}
            <div>
              <label className="text-micro text-[#757575] block mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter movie or TV show"
                className="input"
                disabled={isLoading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="error-box text-caption">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="spinner" />
                  Analyzing {elapsedTime.toFixed(1)}s
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-12 pt-8 border-t border-[#E0E0E0]">
            <a href="/about" className="text-caption text-[#757575] hover:text-[#E65100]">
              About
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
