import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SolicitudesBanco from '../SolicitudesBanco';
import { useAuth } from '../../context/AuthContext';
import { bancoService, solicitudService } from '../../services/api';

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
  solicitudService: {
    listarPorBanco: vi.fn(),
  },
}));

describe('SolicitudesBanco', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 8, nombre: 'Admin' } });
    bancoService.listarActivos.mockResolvedValue({
      data: [{ id: 5, nombre: 'Banco Sur', admin: { id: 8 } }],
    });
    solicitudService.listarPorBanco.mockResolvedValue({
      data: [{ id: 1, tipoSangre: 'A+', urgencia: 'ALTA', estado: 'ACTIVA' }],
    });
  });

  test('renderiza SolicitudesBanco correctamente', async () => {
    render(<SolicitudesBanco />);

    await waitFor(() => {
      expect(screen.getByText(/Solicitudes/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Nueva solicitud/i })).toBeInTheDocument();
  });
});
