export interface MediaAnalysis {
  title: string;
  type: 'movie' | 'tv_show' | 'unknown';
  year?: string;
  perspectiveLevel: number;
  perspectiveLabel: string;
  summary: string;
  rating: number;
  ratingExplanation: string;
  concerns: Concern[];
  positives: string[];
  sources: Source[];
  disclaimer: string;
}

export interface Concern {
  issue: string;
  severity: 'low' | 'moderate' | 'high';
  details: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface AnalysisRequest {
  title: string;
  level: number;
}

export interface AnalysisResponse {
  status: 'success' | 'error';
  data?: MediaAnalysis;
  error?: string;
}

// Cache key generator
export function getCacheKey(title: string, level: number): string {
  return `tvratings_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${level}`;
}

export function getPerspectiveLabel(level: number): string {
  if (level === 0) return 'Radical Progressive';
  if (level === 1) return 'Very Progressive';
  if (level <= 3) return 'Progressive';
  if (level <= 4) return 'Lean Progressive';
  if (level === 5) return 'Centrist';
  if (level === 6) return 'Lean Traditional';
  if (level <= 8) return 'Traditional';
  if (level === 9) return 'Very Traditional';
  return 'Ultraconservative';
}

export function getPerspectiveDescription(level: number): string {
  if (level === 0) {
    return 'radical progressive, queer-affirming, anti-capitalist, decolonial perspective that centers marginalized voices';
  }
  if (level === 1) {
    return 'very progressive, LGBTQ-affirming, and socially liberal perspective';
  }
  if (level <= 3) {
    return 'progressive perspective with emphasis on diversity and inclusion';
  }
  if (level <= 4) {
    return 'moderately progressive perspective';
  }
  if (level === 5) {
    return 'balanced, mainstream centrist perspective';
  }
  if (level === 6) {
    return 'moderately traditional perspective';
  }
  if (level <= 8) {
    return 'traditional conservative perspective with family values';
  }
  if (level === 9) {
    return 'very traditional Catholic/Christian perspective emphasizing traditional morality';
  }
  return 'ultraconservative, traditionalist Catholic perspective rejecting all modernist degeneracy and defending eternal truths';
}

// Fun taglines for slider positions
export function getPerspectiveTagline(level: number): string {
  if (level === 0) return '"Burn it all down and start fresh"';
  if (level === 1) return '"The future is intersectional"';
  if (level === 2) return '"Representation matters"';
  if (level === 3) return '"Progress, not perfection"';
  if (level === 4) return '"Open-minded, mostly"';
  if (level === 5) return '"Just here for the popcorn"';
  if (level === 6) return '"Call me old-fashioned"';
  if (level === 7) return '"Back when things made sense"';
  if (level === 8) return '"Family values matter"';
  if (level === 9) return '"What would grandma think?"';
  return '"Deus Vult"';
}

// Background color classes for slider positions
export function getPerspectiveColor(level: number): string {
  if (level <= 2) return 'from-purple-900/30 to-pink-900/30';
  if (level <= 4) return 'from-blue-900/30 to-purple-900/30';
  if (level <= 6) return 'from-gray-900/30 to-gray-800/30';
  if (level <= 8) return 'from-red-900/30 to-orange-900/30';
  return 'from-red-950/40 to-yellow-900/30';
}

// Accent colors
export function getPerspectiveAccent(level: number): string {
  if (level <= 2) return 'text-pink-500';
  if (level <= 4) return 'text-purple-400';
  if (level <= 6) return 'text-gray-400';
  if (level <= 8) return 'text-orange-400';
  return 'text-yellow-500';
}
