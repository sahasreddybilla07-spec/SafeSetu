// Shared operational status vocabulary for the Control Room.
// Deliberately NOT numeric scores/rankings — five plain-language levels
// with a consistent colour + emoji so officers can read urgency at a glance.
export const STATUS_EMOJI = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MODERATE: '🟡',
  STABLE: '🟢',
  ATTENTION_REQUIRED: '🔵',
  NEUTRAL: '⚪',
};

export function emojiFor(level) {
  return STATUS_EMOJI[level] ?? STATUS_EMOJI.NEUTRAL;
}

// Maps a domain-specific status word to one of the five canonical levels.
export function levelFor(word) {
  const value = String(word ?? '').toUpperCase();

  if (['CRITICAL'].includes(value)) return 'CRITICAL';
  if (['HIGH', 'NEAR CAPACITY', 'NEARING CAPACITY', 'LOW', 'STRAINED'].includes(value)) return 'HIGH';
  if (['MODERATE'].includes(value)) return 'MODERATE';
  if (['STABLE', 'ACTIVE', 'SUFFICIENT', 'ADEQUATE', 'SURPLUS'].includes(value)) return 'STABLE';
  if (['PENDING', 'PENDING APPROVAL', 'PENDING REVIEW', 'ATTENTION_REQUIRED', 'ATTENTION REQUIRED'].includes(value)) {
    return 'ATTENTION_REQUIRED';
  }
  if (['REJECTED', 'INACTIVE'].includes(value)) return 'NEUTRAL';

  return 'MODERATE';
}

export function statusText(word) {
  return `${emojiFor(levelFor(word))} ${word}`;
}

// Risk-level words (LOW/MODERATE/HIGH/CRITICAL) use their own mapping since
// "LOW" means the opposite thing here to a supply status of "LOW".
export function riskLevelFor(word) {
  const value = String(word ?? '').toUpperCase();
  if (value === 'CRITICAL') return 'CRITICAL';
  if (value === 'HIGH') return 'HIGH';
  if (value === 'MODERATE') return 'MODERATE';
  return 'STABLE';
}
