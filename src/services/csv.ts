import type { Movement, MovementType } from '../types/movement';

const CSV_HEADERS = ['concept', 'category', 'amount', 'type', 'date', 'notes'] as const;

const parseLine = (line: string): string[] => {
  // Basic CSV parser handling commas inside quotes.
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
};

export const csvService = {
  export(movements: Movement[]): string {
    const header = CSV_HEADERS.join(',');
    const rows = movements.map((movement) =>
      CSV_HEADERS.map((key) => {
        const value = movement[key];
        const safeValue = value === undefined ? '' : String(value);
        return safeValue.includes(',') ? `"${safeValue}"` : safeValue;
      }).join(',')
    );

    return [header, ...rows].join('\n');
  },

  import(text: string): Movement[] {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    const [header, ...rows] = lines;
    if (header.toLowerCase().replace(/\s+/g, '') !== CSV_HEADERS.join('')) {
      throw new Error('El CSV no tiene las columnas esperadas. Usa el template exportado.');
    }

    return rows.map((row, index) => {
      const cells = parseLine(row);
      if (cells.length < CSV_HEADERS.length) {
        throw new Error(`Fila ${index + 2} incompleta en el CSV.`);
      }

      const [concept, category, amountStr, typeRaw, date, notes] = cells;
      const amount = Number.parseFloat(amountStr);
      const type = typeRaw.toUpperCase() as MovementType;

      if (Number.isNaN(amount)) {
        throw new Error(`Monto inválido en la fila ${index + 2}.`);
      }

      if (!['INCOME', 'EXPENSE'].includes(type)) {
        throw new Error(`Tipo inválido en la fila ${index + 2}. Usa INCOME o EXPENSE.`);
      }

      return {
        id: crypto.randomUUID(),
        concept,
        category,
        amount,
        type,
        date,
        notes,
        createdAt: Date.now(),
        updatedAt: Date.now()
      } as Movement;
    });
  }
};
