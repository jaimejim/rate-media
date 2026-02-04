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
      setError('Please enter a movie or TV show title');
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
        // Store result in sessionStorage for the report page
        sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
        // Navigate to report page with slug and level
        const slug = createSlug(result.data.title);
        router.push(`/report/${slug}?level=${level}`);
      } else {
        setError(result.error || 'Analysis failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-green-500 uppercase tracking-wider">
            RATE MEDIA
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Movie & TV Analysis by Perspective
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Perspective Slider */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <label className="block text-sm uppercase tracking-wider text-gray-400 mb-4">
                Select Perspective
              </label>

              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>Progressive</span>
                <span>Balanced</span>
                <span>Traditional</span>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{level}</div>
                <div className="text-sm text-green-500">{perspectiveLabel}</div>
              </div>

              <div className="mt-4 text-xs text-gray-600 text-center">
                {level <= 4 ? (
                  <span>Analysis will focus on inclusivity, diversity, and progressive representation</span>
                ) : level >= 7 ? (
                  <span>Analysis will focus on traditional values, family content, and moral themes</span>
                ) : (
                  <span>Analysis will provide a balanced mainstream perspective</span>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <label className="block text-sm uppercase tracking-wider text-gray-400 mb-4">
                Movie or TV Show Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title (e.g., The Matrix, Breaking Bad)"
                className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg uppercase tracking-wider transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Media'
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 text-center text-gray-600 text-xs">
            <p>
              This tool uses AI to search for and analyze media content from your selected perspective.
            </p>
            <p className="mt-2">
              Results may vary. Always use your own judgment when making viewing decisions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 text-center text-gray-600 text-xs">
        Powered by Claude AI
      </footer>
    </div>
  );
}
