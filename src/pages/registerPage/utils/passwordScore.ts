export const passwordScore = (pw: string): number => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

export const PASSWORD_SCORE_LABELS = [
  "Too weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
] as const;
