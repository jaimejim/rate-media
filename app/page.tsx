'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSlug } from '@/lib/slug';
import { getPerspectiveLabel } from '@/lib/types';

export default function Home() {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const perspectiveLabel = getPerspectiveLabel(level);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title');
      return;
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <h1 className="text-lg font-bold text-green-500 uppercase tracking-wider">TV Ratings</h1>
      </header>

      {/* Main Content - Compact */}
      <main className="flex-1 flex items-start justify-center p-4 pt-6">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Perspective Slider - Compact */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500">Perspective</span>
                <span className="text-sm text-green-500 font-medium">{level} - {perspectiveLabel}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>Progressive</span>
                <span>Traditional</span>
              </div>
            </div>

            {/* Title Input - Compact */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
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
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600 text-[10px]">
            AI-powered analysis from your selected viewpoint
          </p>
        </div>
      </main>
    </div>
  );
}
