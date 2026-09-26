import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import HomeDonante from '../HomeDonante';
import { useAuth } from '../../context/AuthContext';
import { solicitudService, donacionService } from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../services/api', () => ({
  solicitudService: {
    listarPorTipoSangre: vi.fn(),
    buscarPorTipoSangreEnRadio: vi.fn(),
  },
  donacionService: {
    historialUsuario: vi.fn(),
  },
}));

describe('HomeDonante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { id: 1, nombre: 'Ana', tipoSangre: 'O+' },
    });

    Object.defineProperty(window.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success) => success({
          coords: { latitude: 6.2442, longitude: -75.5812 },
        }),
      },
      configurable: true,
    });

    solicitudService.listarPorTipoSangre.mockResolvedValue({ data: [] });
    solicitudService.buscarPorTipoSangreEnRadio.mockResolvedValue({ data: [] });
    donacionService.historialUsuario.mockResolvedValue({ data: [] });
  });

  test('renderiza HomeDonante correctamente', async () => {
    render(<HomeDonante />);

    await waitFor(() => {
      expect(screen.getByText(/Hola, Ana/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Urgencias cerca de ti/i)).toBeInTheDocument();
  });
});
