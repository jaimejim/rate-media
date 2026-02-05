'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSlug } from '@/lib/slug';
import {
  getPerspectiveLabel,
  getPerspectiveTagline,
  getPerspectiveColor,
  getPerspectiveAccent,
  getCacheKey,
  MediaAnalysis
} from '@/lib/types';

export default function Home() {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const router = useRouter();

  const perspectiveLabel = getPerspectiveLabel(level);
  const tagline = getPerspectiveTagline(level);
  const bgColor = getPerspectiveColor(level);
  const accentColor = getPerspectiveAccent(level);

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
        router.push(`/report/${slug}?level=${level}`);
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
        // Cache the result
        const cacheKey = getCacheKey(title.trim(), level);
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
        const slug = createSlug(result.data.title);
        router.push(`/report/${slug}?level=${level}`);
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
    <div className={`min-h-screen bg-gradient-to-br ${bgColor} bg-black flex flex-col transition-all duration-500`}>
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <h1 className={`text-lg font-bold uppercase tracking-wider ${accentColor} transition-colors duration-300`}>
          TV Ratings
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center p-4 pt-6">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Perspective Slider */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase tracking-wider text-gray-500">Perspective</span>
                <span className={`text-sm font-bold ${accentColor} transition-colors duration-300`}>
                  {level} — {perspectiveLabel}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full mt-2"
              />

              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>🌈 Progressive</span>
                <span>Traditional ✝️</span>
              </div>

              {/* Tagline */}
              <div className={`mt-3 text-center ${accentColor} text-sm italic transition-colors duration-300`}>
                {tagline}
              </div>
            </div>

            {/* Title Input */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Movie or TV show name"
                className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded p-3 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-colors`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing... {elapsedTime.toFixed(1)}s
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </form>

          {/* Fun disclaimer based on level */}
          <div className="mt-4 text-center text-[10px] text-gray-600">
            {level <= 2 && "We'll check if the straights are okay with this one"}
            {level === 3 && "Looking for that diverse ensemble cast"}
            {level === 4 && "Mild takes only, please"}
            {level === 5 && "Peak enlightened centrism incoming"}
            {level === 6 && "Things were better in the 90s, right?"}
            {level === 7 && "Will Grandma approve?"}
            {level === 8 && "Checking for family movie night suitability"}
            {level === 9 && "Would the Pope watch this?"}
            {level === 10 && "Only content approved by the Council of Trent"}
          </div>
        </div>
      </main>
    </div>
  );
}
