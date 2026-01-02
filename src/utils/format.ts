export const formatCurrency = (value: number): string =>
  value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  });

export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
