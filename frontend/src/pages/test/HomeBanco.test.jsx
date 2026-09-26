import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import HomeBanco from '../HomeBanco';
import { useAuth } from '../../context/AuthContext';
import { bancoService, inventarioService, solicitudService, donacionService } from '../../services/api';

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
  solicitudService: {
    listarPorBanco: vi.fn(),
  },
  donacionService: {
    listarPorBanco: vi.fn(),
  },
}));

describe('HomeBanco', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 99, nombre: 'Banco' } });

    bancoService.listarActivos.mockResolvedValue({
      data: [{ id: 7, nombre: 'Banco Medellín', direccion: 'Cra 1', ciudad: 'Medellín', admin: { id: 99 } }],
    });

    inventarioService.listarPorBanco.mockResolvedValue({ data: [] });
    solicitudService.listarPorBanco.mockResolvedValue({ data: [] });
    donacionService.listarPorBanco.mockResolvedValue({ data: [] });
  });

  test('renderiza HomeBanco correctamente', async () => {
    render(<HomeBanco />);

    await waitFor(() => {
      expect(screen.getByText(/Banco Medellín/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Panel de administración/i)).toBeInTheDocument();
  });
});
