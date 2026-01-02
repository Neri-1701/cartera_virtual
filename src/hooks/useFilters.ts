import { useMemo, useState } from 'react';
import type { Filters, Movement } from '../types/movement';

const applyDateFilter = (movement: Movement, filters: Filters): boolean => {
  if (filters.from && movement.date < filters.from) return false;
  if (filters.to && movement.date > filters.to) return false;
  return true;
};

export const useFilters = (initial: Filters = {}) => {
  const [filters, setFilters] = useState<Filters>(initial);

  const updateFilters = (next: Filters) => setFilters(next);
  const clearFilters = () => setFilters({});

  const filterMovements = useMemo(
    () =>
      function run(movements: Movement[]) {
        return movements.filter((movement) => {
          const categoryMatches = !filters.category || movement.category === filters.category;
          const dateMatches = applyDateFilter(movement, filters);
          return categoryMatches && dateMatches;
        });
      },
    [filters]
  );

  return { filters, updateFilters, clearFilters, filterMovements };
};
