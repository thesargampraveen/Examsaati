// ExamSaathi — "Indigo & Fresh" theme tokens
export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',
  accent: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',

  bg: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  secondary: { fontSize: 13, color: colors.textSecondary },
  muted: { fontSize: 12, color: colors.textMuted },
};

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export const EXAMS = [
  'JEE Main',
  'JEE Advanced',
  'NEET',
  'UPSC',
  'SSC CGL',
  'GATE',
  'Railway (RRB)',
  'Banking (IBPS)',
  'State PSC',
  'Other',
];

export const CATEGORY_META = {
  route: { label: 'Route', icon: '🛣️' },
  entry_gate: { label: 'Entry Gate', icon: '🚪' },
  food: { label: 'Food', icon: '🍛' },
  stay: { label: 'Stay', icon: '🏨' },
  carry: { label: 'Carry', icon: '🎒' },
  other: { label: 'Other', icon: '💡' },
};
