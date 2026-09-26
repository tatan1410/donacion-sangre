import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Reportes from '../Reportes';

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe('Reportes', () => {
  test('renderiza Reportes y cambia de tipo al hacer click', () => {
    render(<Reportes />);

    expect(screen.getByText(/Centro de Reportes/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reporte de Inventario/i }));

    expect(screen.getByText(/Reporte de Inventario/i)).toBeInTheDocument();
  });
});
