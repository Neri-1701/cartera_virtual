import React from 'react';
const { useState, useMemo } = React;
import FiltersBar from './components/FiltersBar';
import ImportExport from './components/ImportExport';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';
import { useFilters } from './hooks/useFilters';
import { useTransactions, type MovementInput } from './hooks/useTransactions';
import type { Movement } from './types/movement';
import { formatCurrency, parseISODateToLocal } from './utils/format';

import { useProjection } from './hooks/useProjection';
import FlowChart from './components/FlowChart';
import MsiChart from './components/MsiChart';
import { addMonths } from './utils/finance';

const DEFAULT_CATEGORIES = ['Ingresos', 'Hogar', 'Transporte', 'Entretenimiento', 'Familia', 'Salud', 'Otros'];

const getMonthLabel = (date: string): string =>
  parseISODateToLocal(date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

const buildMonthlySummary = (movements: Movement[]) => {
  const grouped = movements.reduce<Record<string, { income: number; expense: number }>>((acc, movement) => {
    const d = parseISODateToLocal(movement.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM local

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

  // Only count immediate/debit expenses for totals and balance; credits affect projections only
  const totalFilteredExpense = filteredMovements
    .filter((item) => item.type === 'EXPENSE' && ((item as any).paymentMethod ?? 'DEBIT') === 'DEBIT')
    .reduce((sum, item) => sum + item.amount, 0);

  const { projection, getMonthKPIs } = useProjection();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Build next 6 months labels and datasets
  const today = new Date();
  const flowLabels = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 6; i++) {
      arr.push(addMonths(today, i).toLocaleDateString('es-MX', { month: 'short' }));
    }
    return arr;
  }, [today]);

  const { totalSpent, totalMSI, available, savings } = getMonthKPIs(selectedMonth);

  const flowDatasets = useMemo(() => {
    const debitData: number[] = [];
    const creditData: number[] = [];
    const msiData: number[] = [];

    for (let i = 0; i < 6; i++) {
      const d = addMonths(today, i);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mMovs = projection.filter((p) => p.impactMonthStr === mStr);
      debitData.push(mMovs.filter((p) => p.category === 'Flujo Directo').reduce((s, p) => s + p.amount, 0));
      creditData.push(mMovs.filter((p) => p.category === 'Crédito Directo').reduce((s, p) => s + p.amount, 0));
      msiData.push(mMovs.filter((p) => p.category === 'MSI').reduce((s, p) => s + p.amount, 0));
    }

    return { debitData, creditData, msiData };
  }, [projection, today]);

  const msiLabels = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 12; i++) arr.push(addMonths(today, i).toLocaleDateString('es-MX', { month: 'narrow' }));
    return arr;
  }, [today]);

  const msiData = useMemo(() => {
    const data: number[] = [];
    for (let i = 0; i < 12; i++) {
      const d = addMonths(today, i);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      data.push(projection.filter((p) => p.category === 'MSI' && p.impactMonthStr === mStr).reduce((s, p) => s + p.amount, 0));
    }
    return data;
  }, [projection, today]);

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

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Tablero de Control</h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const d = addMonths(new Date(), i);
                const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return (
                  <option key={val} value={val}>
                    {d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Presupuesto Disponible</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(available)}</h3>
              <p className="text-xs mt-2">de $25,000 meta</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Gasto Impactado</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalSpent)}</h3>
              <p className="text-xs text-gray-500 mt-2">Débito + TC Directo + Cuota MSI</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Carga MSI (Bola de Nieve)</p>
              <h3 className="text-2xl font-bold text-orange-500 mt-1">{formatCurrency(totalMSI)}</h3>
              <p className="text-xs text-gray-500 mt-2">{((totalMSI / 30000) * 100).toFixed(1)}% de tu ingreso</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Flujo Neto (Ahorro)</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(savings)}</h3>
              <p className="text-xs text-gray-500 mt-2">Ingreso Real ($30k) - Gastos</p>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🌊 Proyección de Flujo (Próximos 6 Meses)</h3>
              <FlowChart labels={flowLabels} debitData={flowDatasets.debitData} creditData={flowDatasets.creditData} msiData={flowDatasets.msiData} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">❄️ Bola de Nieve MSI</h3>
              <MsiChart labels={msiLabels} dataPoints={msiData} />
            </div>
          </section>
        </section>

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
