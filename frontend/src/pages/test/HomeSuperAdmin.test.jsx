import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import HomeSuperAdmin from '../HomeSuperAdmin';
import { useAuth } from '../../context/AuthContext';
import { bancoService, solicitudService, inventarioService } from '../../services/api';

const mockNavigate = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../services/api', () => ({
  bancoService: {
    listarTodos: vi.fn(),
    listarActivos: vi.fn(),
  },
  solicitudService: {
    listarActivas: vi.fn(),
  },
  inventarioService: {
    listarTodoBajoStock: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomeSuperAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { nombre: 'Admin' } });
    bancoService.listarTodos.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });
    bancoService.listarActivos.mockResolvedValue({ data: [{ id: 1 }] });
    solicitudService.listarActivas.mockResolvedValue({ data: [{ id: 1 }] });
    inventarioService.listarTodoBajoStock.mockResolvedValue({ data: [] });
  });

  test('renderiza HomeSuperAdmin correctamente', async () => {
    render(<HomeSuperAdmin />);

    await waitFor(() => {
      expect(screen.getByText(/Panel Super Administrador/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Accesos rápidos/i)).toBeInTheDocument();
  });

  test('navega al hacer click sobre un acceso rápido', async () => {
    render(<HomeSuperAdmin />);

    await waitFor(() => {
      expect(screen.getByText(/Gestión de Bancos/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Gestión de Bancos/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/super-admin/bancos');
  });
});
