import { formatCurrency } from '../utils/format';

interface MonthlyRow {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  income: number;
  expense: number;
  balance: number;
  monthly: MonthlyRow[];
}

const SummaryItem = ({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-1">
    <p className="text-xs uppercase text-gray-400">{label}</p>
    <p
      className={`text-2xl font-semibold ${
        tone === 'good' ? 'text-green-700' : tone === 'bad' ? 'text-red-700' : 'text-gray-800'
      }`}
    >
      {value}
    </p>
  </div>
);

export const SummaryCards = ({ income, expense, balance, monthly }: Props) => (
  <section className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryItem label="Saldo total" value={formatCurrency(balance)} tone={balance >= 0 ? 'good' : 'bad'} />
      <SummaryItem label="Ingresos" value={formatCurrency(income)} tone="good" />
      <SummaryItem label="Egresos" value={formatCurrency(expense)} tone="bad" />
    </div>

    <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <p className="text-xs uppercase text-gray-400">Resumen mensual</p>
          <h3 className="text-lg font-semibold text-gray-800">Últimos meses</h3>
        </div>
        <span className="text-xs text-gray-500">Filtro aplicado automáticamente a la lista</span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">Mes</th>
              <th className="text-right px-4 py-2">Ingresos</th>
              <th className="text-right px-4 py-2">Egresos</th>
              <th className="text-right px-4 py-2">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {monthly.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-center text-gray-500" colSpan={4}>
                  Sin datos para mostrar.
                </td>
              </tr>
            ) : (
              monthly.map((item) => {
                const balanceValue = item.income - item.expense;
                return (
                  <tr key={item.month} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-700">{item.month}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.income)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.expense)}</td>
                    <td
                      className={`px-4 py-2 text-right font-medium ${
                        balanceValue >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {formatCurrency(balanceValue)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default SummaryCards;
