'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MediaAnalysis, getPerspectiveLabel } from '@/lib/types';
import { decodeSlug } from '@/lib/slug';
import ResultCard from '@/app/components/ResultCard';
import Link from 'next/link';

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<MediaAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const slug = params.slug as string;
  const level = parseInt(searchParams.get('level') || '5');

  useEffect(() => {
    // Try to get analysis from sessionStorage first
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAnalysis(data);
        setLoading(false);
        // Clear storage after reading
        sessionStorage.removeItem('analysisResult');
        return;
      } catch {
        // Continue to fetch if parse fails
      }
    }

    // If no stored result, we need to re-fetch
    // This happens when user directly navigates to a report URL
    const fetchAnalysis = async () => {
      const title = decodeSlug(slug);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, level }),
        });

        const result = await response.json();
        if (result.status === 'success') {
          setAnalysis(result.data);
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
  }, [slug, level]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <header className="border-b border-gray-800 p-4">
          <div className="max-w-2xl mx-auto">
            <Link href="/" className="text-xl font-bold text-green-500 uppercase tracking-wider hover:text-green-400">
              RATE MEDIA
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400 uppercase tracking-wider text-sm">Analyzing from {getPerspectiveLabel(level)} perspective...</p>
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
            <Link href="/" className="text-xl font-bold text-green-500 uppercase tracking-wider hover:text-green-400">
              RATE MEDIA
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
              <p className="text-gray-400 mb-4">{error}</p>
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
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-green-500 uppercase tracking-wider hover:text-green-400">
            RATE MEDIA
          </Link>
          <span className="text-gray-600 text-xs uppercase">
            Report
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto py-4">
          <ResultCard analysis={analysis} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 text-center text-gray-600 text-xs">
        Powered by Claude AI
      </footer>
    </div>
  );
}
