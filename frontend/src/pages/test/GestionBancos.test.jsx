import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import GestionBancos from '../GestionBancos';
import { bancoService, usuarioService } from '../../services/api';

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../services/api', () => ({
  bancoService: {
    listarTodos: vi.fn(),
  },
  usuarioService: {
    listarPorRol: vi.fn(),
  },
}));

describe('GestionBancos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bancoService.listarTodos.mockResolvedValue({ data: [{ id: 1, nombre: 'Banco Central', activo: true }] });
    usuarioService.listarPorRol.mockResolvedValue({ data: [{ id: 10, nombre: 'Admin' }] });
  });

  test('renderiza GestionBancos correctamente', async () => {
    render(<GestionBancos />);

    await waitFor(() => {
      expect(screen.getByText(/Gestión de Bancos/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/1 banco/i)).toBeInTheDocument();
  });
});
