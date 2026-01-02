export const formatCurrency = (value: number): string =>
  value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  });

// Parse an ISO date string (YYYY-MM-DD) as local date (avoid timezone shifting)
export const parseISODateToLocal = (value: string): Date => {
  const parts = value.split('-').map((v) => Number(v));
  // Handle cases where value is already a Date-like string
  if (parts.length < 3 || parts.some(Number.isNaN)) {
    return new Date(value);
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
};

export const formatDate = (value: string): string => {
  const d = parseISODateToLocal(value);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};
