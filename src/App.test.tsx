import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const fillForm = async () => {
  const user = userEvent.setup();
  const concept = screen.getByLabelText(/concepto/i);
  const amount = screen.getByLabelText(/monto/i);
  const date = screen.getByLabelText(/fecha/i);
  const category = screen.getByLabelText(/categoría/i);

  await user.clear(concept);
  await user.type(concept, 'Test ingreso');
  await user.clear(amount);
  await user.type(amount, '500');
  await user.clear(date);
  await user.type(date, '2024-02-01');
  await user.selectOptions(category, ['Ingresos']);

  const submit = screen.getByRole('button', { name: /agregar/i });
  await user.click(submit);
};

describe('App', () => {
  it('allows creating a new movement and shows it in the table', async () => {
    localStorage.clear();
    render(<App />);

    await fillForm();

    const table = screen.getByRole('table');
    const row = within(table).getByText(/Test ingreso/);
    expect(row).toBeInTheDocument();
  });
});
