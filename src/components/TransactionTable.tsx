import type { Movement } from '../types/movement';
import { formatCurrency, formatDate } from '../utils/format';

interface Props {
  movements: Movement[];
  onEdit: (movement: Movement) => void;
  onDelete: (id: string) => void;
}

export const TransactionTable = ({ movements, onEdit, onDelete }: Props) => {
  const sorted = [...movements].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <p className="text-xs uppercase text-gray-400">Movimientos</p>
          <h3 className="text-lg font-semibold text-gray-800">Historial</h3>
        </div>
        <span className="text-xs text-gray-500">{sorted.length} registros</span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Concepto</th>
              <th className="text-left px-4 py-2">Categoría</th>
              <th className="text-right px-4 py-2">Monto</th>
              <th className="text-center px-4 py-2">Tipo</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={6}>
                  Usa el formulario para capturar tu primer movimiento.
                </td>
              </tr>
            ) : (
              sorted.map((movement) => (
                <tr key={movement.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{formatDate(movement.date)}</td>
                  <td className="px-4 py-2 text-gray-800">{movement.concept}</td>
                  <td className="px-4 py-2 text-gray-600">{movement.category}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(movement.amount)}</td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        movement.type === 'INCOME'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {movement.type === 'INCOME' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      type="button"
                      className="text-blue-700 hover:underline"
                      onClick={() => onEdit(movement)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-red-700 hover:underline"
                      onClick={() => onDelete(movement.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
