'use client';

interface ScoreDisplayProps {
  score: number;
  label: string;
  subtitle?: string;
  size?: 'small' | 'large';
}

export default function ScoreDisplay({ score, label, subtitle, size = 'large' }: ScoreDisplayProps) {
  const getScoreColor = (score: number): string => {
    if (score <= 3) return 'bg-red-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (score: number): string => {
    if (score <= 3) return 'text-red-500';
    if (score <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={size === 'large' ? 'mb-6' : 'mb-4'}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm uppercase tracking-wider text-gray-400">{label}</span>
        <span className={`${size === 'large' ? 'text-3xl' : 'text-xl'} font-bold ${getTextColor(score)}`}>
          {score}/10
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
      )}
      <div className="w-full bg-gray-800 rounded-full h-3">
        <div
          className={`score-bar h-3 rounded-full ${getScoreColor(score)}`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
