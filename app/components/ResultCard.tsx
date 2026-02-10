'use client';

import { useState } from 'react';
import { MediaAnalysis } from '@/lib/types';

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
    <div className="card">
      {/* Header */}
      <div className="p-6 border-b border-[#E0E0E0]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-title">{analysis.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-caption text-[#757575]">
              <span>{analysis.type === 'tv_show' ? 'TV Show' : 'Movie'}</span>
              {analysis.year && <span>{analysis.year}</span>}
              <span>{analysis.perspectiveLabel}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="p-2 text-[#757575] hover:text-[#1A1A1A] disabled:opacity-40"
                title="Regenerate"
              >
                <svg
                  className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 text-[#757575] hover:text-[#1A1A1A]"
              title="Share"
            >
              {copied ? (
                <svg className="w-5 h-5 text-[#388E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="p-6 border-b border-[#E0E0E0]">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-micro text-[#757575]">Rating</span>
          <span className="text-display">{analysis.rating}<span className="text-body text-[#757575]">/10</span></span>
        </div>

        {/* Minimal progress bar */}
        <div className="h-1 bg-[#E0E0E0]">
          <div
            className="h-full bg-[#1A1A1A] score-bar"
            style={{ width: `${analysis.rating * 10}%` }}
          />
        </div>

        <p className="mt-4 text-body text-[#757575]">{analysis.ratingExplanation}</p>
      </div>

      {/* Summary */}
      <div className="p-6 border-b border-[#E0E0E0]">
        <h3 className="text-micro text-[#757575] mb-3">Summary</h3>
        <p className="text-body leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Concerns */}
      {analysis.concerns && analysis.concerns.length > 0 && (
        <div className="p-6 border-b border-[#E0E0E0]">
          <h3 className="text-micro text-[#757575] mb-4">Concerns</h3>
          <div className="space-y-4">
            {analysis.concerns.map((concern, index) => (
              <div key={index} className="grid grid-cols-[80px_1fr] gap-4">
                <span className={`text-micro severity-${concern.severity}`}>
                  {concern.severity}
                </span>
                <div>
                  <span className="text-body font-medium">{concern.issue}</span>
                  <p className="text-caption text-[#757575] mt-1">{concern.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positives */}
      {analysis.positives && analysis.positives.length > 0 && (
        <div className="p-6 border-b border-[#E0E0E0]">
          <h3 className="text-micro text-[#757575] mb-4">Positives</h3>
          <ul className="space-y-2">
            {analysis.positives.map((positive, index) => (
              <li key={index} className="text-body flex items-start gap-3">
                <span className="text-[#388E3C] mt-1">+</span>
                <span>{positive}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div className="p-6">
          <h3 className="text-micro text-[#757575] mb-3">Sources</h3>
          <ul className="space-y-1">
            {analysis.sources.map((source, index) => (
              <li key={index}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption text-[#757575] hover:text-[#E65100]"
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
