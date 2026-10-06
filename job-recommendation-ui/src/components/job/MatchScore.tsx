import type { MatchTier } from '../../types/recommendation';
import { getMatchLabel, getMatchTier, roundScore } from '../../utils/scoring';

type MatchScoreProps = {
  score: number;
  compact?: boolean;
};

const TIER_CLASS: Record<MatchTier, string> = {
  excellent: 'match-excellent',
  strong: 'match-strong',
  good: 'match-good',
  partial: 'match-partial',
};

export function MatchScore({ score, compact = false }: MatchScoreProps) {
  const tier = getMatchTier(score);
  const label = getMatchLabel(score);

  return (
    <div className={`match-score ${TIER_CLASS[tier]} ${compact ? 'match-score-compact' : ''}`.trim()}>
      <span className="match-score-value">{roundScore(score)}%</span>
      <span className="match-score-label">{label}</span>
    </div>
  );
}
