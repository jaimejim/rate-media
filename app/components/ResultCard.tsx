'use client';

import { MediaAnalysis } from '@/lib/types';
import ScoreDisplay from './ScoreDisplay';
import Link from 'next/link';

interface ResultCardProps {
  analysis: MediaAnalysis;
}

function getQuip(perspectiveLevel: number, rating: number): { text: string; color: string } {
  const isConservative = perspectiveLevel >= 7;
  const isProgressive = perspectiveLevel <= 3;
  const isLowRating = rating <= 4;
  const isHighRating = rating >= 7;

  // Conservative perspective (7-10)
  if (isConservative) {
    if (isLowRating) {
      const quips = [
        "Woke garbage",
        "Hard pass",
        "Not for traditional families",
        "Hollywood agenda alert",
        "Skip this one",
        "Morally bankrupt"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-red-500" };
    }
    if (isHighRating) {
      const quips = [
        "Family approved",
        "Wholesome content",
        "Safe for movie night",
        "Traditional values intact",
        "A breath of fresh air",
        "Finally, something decent"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-green-500" };
    }
    return { text: "Proceed with caution", color: "text-yellow-500" };
  }

  // Progressive perspective (0-3)
  if (isProgressive) {
    if (isLowRating) {
      const quips = [
        "Problematic content",
        "Outdated and harmful",
        "Representation? What representation?",
        "Do better, Hollywood",
        "Yikes, not this",
        "Stuck in the past"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-red-500" };
    }
    if (isHighRating) {
      const quips = [
        "Representation done right",
        "Inclusive excellence",
        "This is the way",
        "Progress in action",
        "Finally, real diversity",
        "A win for everyone"
      ];
      return { text: quips[Math.floor(Math.random() * quips.length)], color: "text-green-500" };
    }
    return { text: "Room for improvement", color: "text-yellow-500" };
  }

  // Balanced perspective (4-6)
  if (isLowRating) {
    return { text: "Not great, not terrible", color: "text-yellow-500" };
  }
  if (isHighRating) {
    return { text: "Solid entertainment", color: "text-green-500" };
  }
  return { text: "Average fare", color: "text-gray-400" };
}

export default function ResultCard({ analysis }: ResultCardProps) {
  const quip = getQuip(analysis.perspectiveLevel, analysis.rating);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
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
        <div className="flex flex-wrap gap-2 mt-2">
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
      <div className="p-3 border-b border-gray-800 bg-yellow-900/20">
        <p className="text-yellow-600 text-[10px]">
          <strong>Disclaimer:</strong> {analysis.disclaimer}
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded uppercase tracking-wider text-xs"
        >
          Share
        </button>
        <Link
          href="/"
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded uppercase tracking-wider text-xs text-center"
        >
          New
        </Link>
      </div>
    </div>
  );
}
