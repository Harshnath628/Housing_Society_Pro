const style = getComputedStyle(document.documentElement);
const css = (v) => style.getPropertyValue(v).trim();

export const getChartTheme = () => ({
  axisColor: css('--text-muted') || 'rgba(58,39,13,0.5)',
  tooltipBg: css('--bg-card') || 'rgba(255,255,255,0.82)',
  tooltipBorder: css('--border') || 'rgba(182,130,53,0.15)',
  textPrimary: css('--text-primary') || '#3a270d',
  textSecondary: css('--text-secondary') || 'rgba(58,39,13,0.7)',
  accent: css('--accent') || '#a3402d',
  accentSoft: css('--accent-soft') || 'rgba(163,64,45,0.10)',
  rose: css('--rose') || '#a3402d',
  emerald: css('--emerald') || '#4a7a4a',
  ochre: css('--ochre') || '#b68235',
  gold: css('--gold') || '#b68235',
});

export const COLORS = ['#9b3420', '#2d7a3a', '#c48a1a', '#c44b2a', '#8a5028', '#5c3012'];
