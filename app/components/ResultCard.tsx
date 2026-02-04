'use client';

import { MediaAnalysis } from '@/lib/types';
import ScoreDisplay from './ScoreDisplay';
import Link from 'next/link';

interface ResultCardProps {
  analysis: MediaAnalysis;
}

export default function ResultCard({ analysis }: ResultCardProps) {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      // Fallback for browsers that don't support clipboard API
      prompt('Copy this link:', url);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">{analysis.title}</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded uppercase">
                {analysis.type === 'tv_show' ? 'TV Show' : analysis.type === 'movie' ? 'Movie' : 'Media'}
              </span>
              {analysis.year && (
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                  {analysis.year}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Perspective Badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-900/30 border border-blue-800 rounded px-3 py-2">
          <span className="text-xs text-blue-400 uppercase tracking-wider">Perspective:</span>
          <span className="text-sm text-white font-medium">{analysis.perspectiveLabel}</span>
          <span className="text-xs text-gray-500">({analysis.perspectiveLevel}/10)</span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Summary</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Rating */}
      <div className="p-6 border-b border-gray-800">
        <ScoreDisplay
          score={analysis.rating}
          label="Overall Rating"
          subtitle={analysis.ratingExplanation}
          size="large"
        />
      </div>

      {/* Concerns */}
      {analysis.concerns && analysis.concerns.length > 0 && (
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Content Concerns</h3>
          <ul className="space-y-3">
            {analysis.concerns.map((concern, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`severity-${concern.severity} text-xs px-2 py-1 rounded uppercase font-bold flex-shrink-0`}>
                  {concern.severity}
                </span>
                <div>
                  <span className="text-white font-medium">{concern.issue}</span>
                  <p className="text-gray-500 text-sm mt-1">{concern.details}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Positives */}
      {analysis.positives && analysis.positives.length > 0 && (
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Positive Aspects</h3>
          <ul className="space-y-2">
            {analysis.positives.map((positive, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-300">{positive}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Sources</h3>
          <ul className="space-y-2">
            {analysis.sources.map((source, index) => (
              <li key={index}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-6 border-b border-gray-800 bg-yellow-900/20">
        <p className="text-yellow-600 text-xs">
          <strong>Disclaimer:</strong> {analysis.disclaimer}
        </p>
      </div>

      {/* Actions */}
      <div className="p-6 flex gap-4">
        <button
          onClick={handleShare}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded uppercase tracking-wider text-sm transition-colors"
        >
          Share Report
        </button>
        <Link
          href="/"
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded uppercase tracking-wider text-sm transition-colors text-center"
        >
          New Analysis
        </Link>
      </div>
    </div>
  );
}
