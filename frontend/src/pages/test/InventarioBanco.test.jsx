import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InventarioBanco from '../InventarioBanco';
import { useAuth } from '../../context/AuthContext';
import { bancoService, inventarioService } from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../services/api', () => ({
  bancoService: {
    listarActivos: vi.fn(),
  },
  inventarioService: {
    listarPorBanco: vi.fn(),
  },
}));

describe('InventarioBanco', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 12, nombre: 'Admin' } });
    bancoService.listarActivos.mockResolvedValue({
      data: [{ id: 7, nombre: 'Banco Norte', admin: { id: 12 } }],
    });
    inventarioService.listarPorBanco.mockResolvedValue({
      data: [{ id: 1, tipoSangre: 'O+', unidadesDisponibles: 4, unidadesMinimas: 5, bajoStock: true }],
    });
  });

  test('renderiza InventarioBanco y muestra el titular del inventario', async () => {
    render(<InventarioBanco />);

    await waitFor(() => {
      expect(screen.getByText(/Inventario/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Stock bajo en/i)).toBeInTheDocument();
  });
});
