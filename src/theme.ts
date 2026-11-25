// Pulse Wellness Club — "Giz" (chalk) direction.
// Light chalk ground, black ink, gold used sparingly for the one thing that matters on a screen.
// Dark "ink" cards hold the most important block on a screen (next class, revenue).
export const C = {
  bg: '#EEEBE5',        // chalk
  surface: '#FFFFFF',   // cards
  surface2: '#F6F4F0',  // inset rows, inputs
  ink: '#151412',       // primary text and dark cards
  inkSoft: '#24221E',   // chips on dark cards
  onInk: '#F4F1EB',     // text on dark cards
  onInkMuted: '#C9C3B8',
  gold: '#E4C98E',      // accent on dark surfaces
  goldDeep: '#B08A3E',  // accent on light surfaces (rings, bars)
  goldText: '#7E5F22',  // gold text on light (4.5:1 on chalk)
  goldTint: '#F7EEDB',  // payment / highlight cards
  text: '#151412',
  secondary: '#6B665E',
  muted: '#77726A',
  border: '#E4DFD6',
  hairline: '#ECE8E1',
  success: '#2F7D54',
  successTint: '#E3F1E8',
  warning: '#9A6A0E',
  warningTint: '#F8EBCF',
  danger: '#B3402E',
  dangerTint: '#F8E1DC',
  overlay: 'rgba(21,20,18,0.45)',
};

// control 22 (pill), card 22, sheet 28
export const R = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const F = {
  display: 'Archivo_700Bold',
  displayMedium: 'Archivo_500Medium',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
};

export const num = { fontVariant: ['tabular-nums' as const] };

export const BRAND = {
  name: 'Pulse Wellness Club',
  short: 'PULSE',
  tagline: 'Excellence in Motion',
  city: 'Beja',
};
