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

export function getPerspectiveLabel(level: number): string {
  if (level <= 2) {
    return 'Progressive/Liberal';
  } else if (level <= 4) {
    return 'Moderately Progressive';
  } else if (level <= 6) {
    return 'Balanced/Neutral';
  } else if (level <= 8) {
    return 'Moderately Conservative';
  } else {
    return 'Traditional/Conservative';
  }
}

export function getPerspectiveDescription(level: number): string {
  if (level <= 2) {
    return 'progressive, LGBTQ-affirming, and socially liberal perspective';
  } else if (level <= 4) {
    return 'moderately progressive perspective with emphasis on inclusivity';
  } else if (level <= 6) {
    return 'balanced, mainstream perspective';
  } else if (level <= 8) {
    return 'moderately conservative perspective with traditional family values';
  } else {
    return 'traditional Catholic/Christian conservative perspective emphasizing traditional morality and family values';
  }
}
