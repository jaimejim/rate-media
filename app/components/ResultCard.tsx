'use client';

import { useState } from 'react';
import { MediaAnalysis } from '@/lib/types';
import ScoreDisplay from './ScoreDisplay';

interface ResultCardProps {
  analysis: MediaAnalysis;
}

function getQuip(perspectiveLevel: number, rating: number): { text: string; color: string } {
  const isLowRating = rating <= 4;
  const isHighRating = rating >= 7;

  // Extreme conservative (10)
  if (perspectiveLevel === 10) {
    if (isLowRating) {
      const quips = [
        "Satanic filth",
        "Abomination unto the Lord",
        "Modernist degeneracy",
        "The devil's entertainment",
        "Burn it with holy fire"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-red-600" };
    }
    if (isHighRating) {
      const quips = [
        "Deus Vult approved",
        "Blessed content",
        "Worthy of a Catholic household",
        "The Lord smiles upon this",
        "Tradition preserved"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-yellow-500" };
    }
    return { text: "Proceed with prayer", color: "text-yellow-600" };
  }

  // Extreme progressive (0)
  if (perspectiveLevel === 0) {
    if (isLowRating) {
      const quips = [
        "Cishet garbage",
        "Colonizer propaganda",
        "Literally violence",
        "Problematic beyond repair",
        "Cancel this immediately"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-red-500" };
    }
    if (isHighRating) {
      const quips = [
        "Yasss queen energy",
        "Revolutionary content",
        "Smashing the patriarchy",
        "Intersectional excellence",
        "Finally, real representation"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-pink-500" };
    }
    return { text: "Could be queerer", color: "text-purple-400" };
  }

  // Conservative (7-9)
  if (perspectiveLevel >= 7) {
    if (isLowRating) {
      const quips = [
        "Woke garbage",
        "Hard pass",
        "Not for families",
        "Hollywood agenda",
        "Skip this one"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-red-500" };
    }
    if (isHighRating) {
      const quips = [
        "Family approved",
        "Wholesome content",
        "Safe for movie night",
        "Values intact",
        "Finally, something decent"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-green-500" };
    }
    return { text: "Proceed with caution", color: "text-yellow-500" };
  }

  // Progressive (1-3)
  if (perspectiveLevel <= 3) {
    if (isLowRating) {
      const quips = [
        "Problematic content",
        "Outdated views",
        "Lacking representation",
        "Do better",
        "Not it, chief"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-red-500" };
    }
    if (isHighRating) {
      const quips = [
        "Rep done right",
        "Inclusive excellence",
        "Progress in action",
        "This is the way",
        "A win for diversity"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-green-500" };
    }
    return { text: "Room to improve", color: "text-yellow-500" };
  }

  // Balanced (4-6)
  if (isLowRating) return { text: "Not great", color: "text-yellow-500" };
  if (isHighRating) return { text: "Solid watch", color: "text-green-500" };
  return { text: "Average", color: "text-gray-400" };
}

export default function ResultCard({ analysis }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const quip = getQuip(analysis.perspectiveLevel, analysis.rating);

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
      {/* Quip Banner */}
      <div className="p-4 border-b border-gray-800 bg-gray-950 text-center">
        <span className={`text-xl font-bold uppercase tracking-wider ${quip.color}`}>
          "{quip.text}"
        </span>
      </div>

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
          {/* Share Icon */}
          <button
            onClick={handleShare}
            className="ml-auto p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
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

      {/* Summary */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Summary</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Rating */}
      <div className="p-4 border-b border-gray-800">
        <ScoreDisplay
          score={analysis.rating}
          label="Rating"
          subtitle={analysis.ratingExplanation}
          size="large"
        />
      </div>

      {/* Concerns */}
      {analysis.concerns && analysis.concerns.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Concerns</h3>
          <ul className="space-y-2">
            {analysis.concerns.map((concern, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className={`severity-${concern.severity} text-[10px] px-1.5 py-0.5 rounded uppercase font-bold flex-shrink-0`}>
                  {concern.severity}
                </span>
                <div className="text-sm">
                  <span className="text-white">{concern.issue}</span>
                  <span className="text-gray-500"> — {concern.details}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Positives */}
      {analysis.positives && analysis.positives.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Positives</h3>
          <ul className="space-y-1">
            {analysis.positives.map((positive, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-300">{positive}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {analysis.sources && analysis.sources.length > 0 && (
        <div className="p-4 border-b border-gray-800">
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

      {/* Disclaimer */}
      <div className="p-3 bg-yellow-900/20">
        <p className="text-yellow-600 text-[10px]">
          <strong>Note:</strong> {analysis.disclaimer}
        </p>
      </div>
    </div>
  );
}
