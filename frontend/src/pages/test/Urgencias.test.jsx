import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Urgencias from '../Urgencias';
import { useAuth } from '../../context/AuthContext';
import { solicitudService } from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../services/api', () => ({
  solicitudService: {
    listarActivas: vi.fn(),
  },
}));

describe('Urgencias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { tipoSangre: 'O+' } });
    solicitudService.listarActivas.mockResolvedValue({
      data: [{ id: 1, urgencia: 'ALTA', tipoSangre: 'O+', bancoNombre: 'Banco Central', unidadesFaltantes: 3, fechaLimite: '2026-09-30' }],
    });
  });

  test('renderiza Urgencias correctamente', async () => {
    render(<Urgencias />);

    await waitFor(() => {
      expect(screen.getByText(/Urgencias activas/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /QUIERO AYUDAR/i })).toBeInTheDocument();
  });

  test('cambia el filtro de urgencia al hacer click', async () => {
    render(<Urgencias />);

    await waitFor(() => {
      expect(screen.getByText(/Urgencias activas/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^MEDIA$/i }));
    expect(screen.getByRole('button', { name: /^MEDIA$/i })).toHaveClass('bg-[#dc2626]');
  });
});
