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
  emerald: css('--emerald') || '#6B8F3F',
  ochre: css('--ochre') || '#CC7722',
});

export const COLORS = ['#A43323', '#6B8F3F', '#CC7722', '#A33215', '#8C6A5C', '#96613A'];
