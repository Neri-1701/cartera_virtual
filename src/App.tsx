import { useMemo, useState } from 'react';
import FiltersBar from './components/FiltersBar';
import ImportExport from './components/ImportExport';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';
import { useFilters } from './hooks/useFilters';
import { useTransactions, type MovementInput } from './hooks/useTransactions';
import type { Movement } from './types/movement';
import { formatCurrency } from './utils/format';

const DEFAULT_CATEGORIES = ['Ingresos', 'Hogar', 'Transporte', 'Entretenimiento', 'Familia', 'Salud', 'Otros'];

const getMonthLabel = (date: string): string =>
  new Date(date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

const buildMonthlySummary = (movements: Movement[]) => {
  const grouped = movements.reduce<Record<string, { income: number; expense: number }>>((acc, movement) => {
    const monthKey = movement.date.slice(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0 };
    }

    if (movement.type === 'INCOME') {
      acc[monthKey].income += movement.amount;
    } else {
      acc[monthKey].expense += movement.amount;
    }

    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 6)
    .map(([monthKey, values]) => ({
      month: getMonthLabel(`${monthKey}-01`),
      income: values.income,
      expense: values.expense
    }));
};

function App() {
  const { movements, addMovement, updateMovement, deleteMovement, replaceAll, stats } = useTransactions();
  const { filters, updateFilters, clearFilters, filterMovements } = useFilters();
  const [editing, setEditing] = useState<Movement | null>(null);

  const categories = useMemo(() => {
    const dynamic = new Set([...DEFAULT_CATEGORIES, ...movements.map((item) => item.category)]);
    return Array.from(dynamic);
  }, [movements]);

  const filteredMovements = useMemo(() => filterMovements(movements), [filterMovements, movements]);
  const monthly = useMemo(() => buildMonthlySummary(filteredMovements), [filteredMovements]);

  const handleSubmit = (movement: MovementInput, id?: string) => {
    if (id) {
      updateMovement(id, movement);
      setEditing(null);
    } else {
      addMovement(movement);
    }
  };

  const handleImport = (items: Movement[]) => {
    const merged = [...movements, ...items];
    replaceAll(merged);
  };

  const totalFilteredIncome = filteredMovements
    .filter((item) => item.type === 'INCOME')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalFilteredExpense = filteredMovements
    .filter((item) => item.type === 'EXPENSE')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-paper text-gray-800">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-gray-400">Cartera Virtual</p>
            <h1 className="text-2xl font-bold">Visor personal 60-90 días</h1>
            <p className="text-sm text-gray-500">Basado en el HTML proporcionado, ahora listo para evolucionar.</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Saldo general</p>
            <p className={`text-lg font-semibold ${stats.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(stats.balance)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-white border-l-4 border-primary rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-2">Filosofía de control</h2>
          <p className="text-sm text-gray-600">
            Se conserva la lógica de visión futura del HTML original, pero ahora con React, persistencia en localStorage y
            utilidades para CSV. Captura ingresos/egresos, filtra por fechas y categorías, y obtén un resumen mensual con saldo.
          </p>
        </section>

        <FiltersBar categories={categories} filters={filters} onChange={updateFilters} onClear={clearFilters} />

        <SummaryCards
          income={totalFilteredIncome}
          expense={totalFilteredExpense}
          balance={totalFilteredIncome - totalFilteredExpense}
          monthly={monthly}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <TransactionTable
              movements={filteredMovements}
              onEdit={(movement) => setEditing(movement)}
              onDelete={deleteMovement}
            />
            <ImportExport movements={movements} onImport={handleImport} />
          </div>

          <div>
            <TransactionForm
              categories={categories}
              editing={editing}
              onSubmit={handleSubmit}
              onCancelEdit={() => setEditing(null)}
            />

            <div className="mt-4 bg-white border border-gray-100 rounded-lg shadow-sm p-4 text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800">Tips de uso</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>El saldo y el resumen mensual respetan los filtros aplicados.</li>
                <li>Importa CSV con columnas: concept, category, amount, type, date, notes.</li>
                <li>Los datos viven en tu navegador. Puedes limpiar storage manualmente desde las herramientas del navegador.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
