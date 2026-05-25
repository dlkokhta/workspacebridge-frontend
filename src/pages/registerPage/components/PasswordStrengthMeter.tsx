import { PASSWORD_SCORE_LABELS } from "../utils/passwordScore";

interface PasswordStrengthMeterProps {
  score: number;
}

const colorForScore = (score: number, segment: number): string => {
  if (segment > score) return "rgba(15, 25, 18, 0.08)";
  if (score < 2) return "#c25a4a";
  if (score < 3) return "#b5803a";
  return "#5a8a6b";
};

export const PasswordStrengthMeter = ({ score }: PasswordStrengthMeterProps) => (
  <div className="mt-2.5">
    <div className="flex gap-1 mb-1.5">
      {[1, 2, 3, 4].map((segment) => (
        <div
          key={segment}
          className="flex-1 h-[3px] rounded-full"
          style={{ background: colorForScore(score, segment) }}
        />
      ))}
    </div>
    <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
      {PASSWORD_SCORE_LABELS[score]}
    </div>
  </div>
);
