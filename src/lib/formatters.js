export function formatCompactNumber(value) {
  const number = Number(value || 0);
  const abs = Math.abs(number);
  const format = (divisor, suffix) => {
    const compact = number / divisor;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}${suffix}`;
  };

  if (abs >= 1_000_000_000) return format(1_000_000_000, 'B');
  if (abs >= 1_000_000) return format(1_000_000, 'M');
  if (abs >= 1_000) return format(1_000, 'K');
  return new Intl.NumberFormat('es-CO').format(number);
}

export function formatCompactCOP(value) {
  return `$${formatCompactNumber(value)}`;
}

export function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
