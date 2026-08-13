const style = getComputedStyle(document.documentElement);
const css = (v) => style.getPropertyValue(v).trim();

export const getChartTheme = () => ({
  axisColor: css('--text-muted') || '#6F5245',
  tooltipBg: css('--bg-card') || '#EDD6D3',
  tooltipBorder: css('--border') || '#DBADA7',
  textPrimary: css('--text-primary') || '#3E2723',
  textSecondary: css('--text-secondary') || '#5D4037',
  accent: css('--accent') || '#A43323',
  accentSoft: css('--accent-soft') || '#E4C2BD',
  rose: css('--rose') || '#A33215',
  emerald: css('--emerald') || '#395922',
  ochre: css('--ochre') || '#714214',
});

export const COLORS = ['#A43323', '#395922', '#714214', '#A33215', '#8C6A5C', '#96613A'];
