'use client';

import { useState } from 'react';
import { MediaAnalysis } from '@/lib/types';
import ScoreDisplay from './ScoreDisplay';

interface ResultCardProps {
  analysis: MediaAnalysis;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function ResultCard({ analysis, onRegenerate, isRegenerating }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('Copy this link:', url);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">{analysis.title}</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded uppercase">
            {analysis.type === 'tv_show' ? 'TV Show' : analysis.type === 'movie' ? 'Movie' : 'Media'}
          </span>
          {analysis.year && (
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
              {analysis.year}
            </span>
          )}
          <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded">
            {analysis.perspectiveLabel} ({analysis.perspectiveLevel}/10)
          </span>
          {/* Action Icons */}
          <div className="ml-auto flex items-center gap-1">
            {/* Regenerate Icon */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="p-1.5 text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                title="Regenerate analysis"
              >
                <svg
                  className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            {/* Share Icon */}
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
              title="Share"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rating - moved up */}
      <div className="p-4 border-b border-gray-800">
        <ScoreDisplay
          score={analysis.rating}
          label="Rating"
          subtitle={analysis.ratingExplanation}
          size="large"
        />
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Summary</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Concerns - Table Format */}
      {analysis.concerns && analysis.concerns.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Concerns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase text-gray-500 font-medium w-20">Level</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase text-gray-500 font-medium w-32">Issue</th>
                  <th className="text-left py-2 text-[10px] uppercase text-gray-500 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {analysis.concerns.map((concern, index) => (
                  <tr key={index} className="border-b border-gray-800/50 last:border-0">
                    <td className="py-2 pr-3 align-top">
                      <span className={`severity-${concern.severity} text-[10px] px-1.5 py-0.5 rounded uppercase font-bold`}>
                        {concern.severity}
                      </span>
                    </td>
                    <td className="py-2 pr-3 align-top text-white font-medium">{concern.issue}</td>
                    <td className="py-2 align-top text-gray-400">{concern.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Positives */}
      {analysis.positives && analysis.positives.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Positives</h3>
          <ul className="space-y-1">
            {analysis.positives.map((positive, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-500">+</span>
                <span className="text-gray-300">{positive}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div className="p-4">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Sources</h3>
          <ul className="space-y-1">
            {analysis.sources.map((source, index) => (
              <li key={index}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
