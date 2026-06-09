const SCORE_HIGH = 70;
const SCORE_MODERATE = 40;

export interface RiskBadge {
  label: string;
  colorClasses: string;
}

export function getRiskBadge(score: number, riskLabel: string): RiskBadge {
  if (score >= SCORE_HIGH) {
    return { label: riskLabel, colorClasses: "text-[#c0392b]" };
  }
  if (score >= SCORE_MODERATE) {
    return { label: riskLabel, colorClasses: "text-[#b45309]" };
  }
  return { label: riskLabel, colorClasses: "text-[#2d6a4f]" };
}
