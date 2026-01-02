import type React from 'react';
import { useEffect, useState } from 'react';
import type { Movement, MovementType } from '../types/movement';
import type { MovementInput } from '../hooks/useTransactions';

interface Props {
  categories: string[];
  editing?: Movement | null;
  onSubmit: (movement: MovementInput, id?: string) => void;
  onCancelEdit?: () => void;
}

import { DEFAULT_CARDS } from '../utils/finance';

const emptyForm: MovementInput = {
  concept: '',
  category: '',
  amount: 0,
  type: 'EXPENSE',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  // new fields for cards / MSI
  paymentMethod: 'DEBIT',
  cardId: undefined,
  isMSI: false,
  months: 3
};

export const TransactionForm = ({ categories, editing, onSubmit, onCancelEdit }: Props) => {
  const [form, setForm] = useState<MovementInput>(emptyForm);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editing) {
      setForm({
        concept: editing.concept,
        category: editing.category,
        amount: editing.amount,
        type: editing.type,
        date: editing.date,
        notes: editing.notes ?? '',
        paymentMethod: (editing as any).paymentMethod ?? 'DEBIT',
        cardId: (editing as any).cardId ?? undefined,
        isMSI: (editing as any).isMSI ?? false,
        months: (editing as any).months ?? 3
      });
    } else {
      setForm({ ...emptyForm, category: categories[0] ?? '' });
    }
  }, [editing, categories]);

  const handleChange = (key: keyof MovementInput, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === 'amount' || key === 'months' ? Number(value) : value
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.concept.trim()) {
      setError('Agrega un concepto.');
      return;
    }

    if (!form.category) {
      setError('Selecciona una categoría.');
      return;
    }

    if (!form.date) {
      setError('Selecciona una fecha.');
      return;
    }

    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    onSubmit({ ...form, amount }, editing?.id);
    if (!editing) {
      setForm({ ...emptyForm, category: categories[0] ?? '' });
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-gray-400">Captura</p>
          <h2 className="text-xl font-semibold text-gray-800">
            {editing ? 'Editar movimiento' : 'Registrar movimiento'}
          </h2>
        </div>
        {editing ? (
          <button
            type="button"
            className="text-sm text-blue-700 hover:underline"
            onClick={onCancelEdit}
            aria-label="Cancelar edición"
          >
            Cancelar
          </button>
        ) : null}
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm text-gray-700">
            Fecha
            <input
              type="date"
              className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.date}
              onChange={(event) => handleChange('date', event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col text-sm text-gray-700">
            Tipo
            <select
              className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.type}
              onChange={(event) => handleChange('type', event.target.value as MovementType)}
            >
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Egreso</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col text-sm text-gray-700">
          Concepto
          <input
            type="text"
            className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={form.concept}
            onChange={(event) => handleChange('concept', event.target.value)}
            placeholder="Ej. Supermercado, sueldo"
            required
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm text-gray-700">
            Categoría
            <select
              className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.category}
              onChange={(event) => handleChange('category', event.target.value)}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-gray-700">
            Monto (MXN)
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.amount}
              onChange={(event) => handleChange('amount', event.target.value)}
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm text-gray-700">
            Método
            <select
              className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.paymentMethod}
              onChange={(event) => handleChange('paymentMethod', event.target.value)}
            >
              <option value="DEBIT">Débito / Efectivo</option>
              <option value="CREDIT">Tarjeta de Crédito</option>
            </select>
          </label>

          <div className="flex flex-col text-sm text-gray-700">
            <label className="mb-1">Tarjeta (opcional)</label>
            <select
              className={`mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                form.paymentMethod !== 'CREDIT' ? 'opacity-60 pointer-events-none' : ''
              }`}
              value={form.cardId ?? ''}
              onChange={(event) => handleChange('cardId', event.target.value)}
            >
              <option value="">-- Selecciona --</option>
              {DEFAULT_CARDS.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className={`mt-3 p-2 rounded border ${form.paymentMethod === 'CREDIT' ? 'bg-orange-50 border-orange-100' : 'hidden'}`}>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(form.isMSI)}
                  onChange={(e) => handleChange('isMSI', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">¿Es a Meses Sin Intereses (MSI)?</span>
              </label>

              {form.isMSI ? (
                <div className="mt-2">
                  <label className="text-sm">Plazo (meses)</label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-24 rounded border border-gray-300 px-3 py-2"
                    value={form.months as number}
                    onChange={(e) => handleChange('months', Number(e.target.value))}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <label className="flex flex-col text-sm text-gray-700">
          Notas (opcional)
          <textarea
            className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={form.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
            rows={2}
            placeholder="Ej. compra a MSI, referencia de tarjeta"
          />
        </label>

        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            {editing ? 'Actualizar' : 'Agregar'}
          </button>
          {editing && onCancelEdit ? (
            <button
              type="button"
              className="text-sm text-gray-600 hover:underline"
              onClick={onCancelEdit}
            >
              Descartar cambios
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
};

export default TransactionForm;
