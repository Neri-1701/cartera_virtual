import { useRef, useState } from 'react';
import { csvService } from '../services/csv';
import type { Movement } from '../types/movement';

interface Props {
  movements: Movement[];
  onImport: (items: Movement[]) => void;
}

export const ImportExport = ({ movements, onImport }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleExport = () => {
    setError('');
    const csv = csvService.export(movements);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cartera_virtual.csv';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('CSV exportado.');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      setMessage('');
      const text = await file.text();
      const imported = csvService.import(text);
      onImport(imported);
      setMessage(`Se importaron ${imported.length} filas.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo importar el archivo.');
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <section className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-gray-400">Intercambio</p>
          <h3 className="text-lg font-semibold text-gray-800">Importar / Exportar CSV</h3>
        </div>
        <button
          type="button"
          className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={handleExport}
        >
          Exportar CSV
        </button>
      </header>

      <div className="flex items-center gap-3">
        <label
          htmlFor="csv-input"
          className="bg-gray-100 border border-dashed border-gray-300 px-4 py-2 rounded cursor-pointer hover:border-primary"
        >
          Seleccionar CSV
        </label>
        <input
          id="csv-input"
          ref={inputRef}
          type="file"
          accept="text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-500">Formato: concept,category,amount,type,date,notes</p>
      </div>

      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
};

export default ImportExport;
