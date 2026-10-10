export const CHART_COLORS = [
  '#60a5fa', // blue
  '#f472b6', // pink
  '#34d399', // emerald
  '#fbbf24', // amber
  '#a78bfa', // violet
  '#fb7185', // rose
  '#22d3ee', // cyan
  '#84cc16', // lime
];

export function colorForIndex(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length];
}