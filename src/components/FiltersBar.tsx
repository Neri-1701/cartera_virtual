import type { Filters } from '../types/movement';

interface Props {
  categories: string[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

export const FiltersBar = ({ categories, filters, onChange, onClear }: Props) => (
  <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 space-y-3">
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col text-sm text-gray-700">
        Desde
        <input
          type="date"
          className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filters.from ?? ''}
          onChange={(event) => onChange({ ...filters, from: event.target.value || undefined })}
        />
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Hasta
        <input
          type="date"
          className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filters.to ?? ''}
          onChange={(event) => onChange({ ...filters, to: event.target.value || undefined })}
        />
      </label>

      <label className="flex flex-col text-sm text-gray-700">
        Categoría
        <select
          className="mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filters.category ?? ''}
          onChange={(event) => onChange({ ...filters, category: event.target.value || undefined })}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="ml-auto text-sm text-gray-600 underline hover:text-gray-800"
        onClick={onClear}
      >
        Limpiar filtros
      </button>
    </div>
  </div>
);

export default FiltersBar;
