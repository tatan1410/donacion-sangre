import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MapaBancos from '../MapaBancos';
import { useAuth } from '../../context/AuthContext';
import { bancoService, inventarioService } from '../../services/api';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  Circle: () => <div data-testid="circle" />,
  useMap: () => ({ setView: vi.fn() }),
}));

vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
    divIcon: vi.fn(() => ({})),
  },
  icon: vi.fn(() => ({})),
  divIcon: vi.fn(() => ({})),
}));

vi.mock('../../services/api', () => ({
  bancoService: {
    buscarEnRadio: vi.fn(),
  },
  inventarioService: {
    listarPorBanco: vi.fn(),
  },
}));

describe('MapaBancos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 10, nombre: 'Ana' } });

    Object.defineProperty(window.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success) => success({ coords: { latitude: 6.24, longitude: -75.58 } }),
      },
      configurable: true,
    });

    bancoService.buscarEnRadio.mockResolvedValue({
      data: [{ id: 1, nombre: 'Banco Central', latitud: 6.24, longitud: -75.58, distanciaKm: 2.5, ciudad: 'Medellín', horarioApertura: '08:00', horarioCierre: '18:00' }],
    });
    inventarioService.listarPorBanco.mockResolvedValue({ data: [{ id: 1, tipoSangre: 'O+', unidadesDisponibles: 8, bajoStock: false }] });
  });

  test('renderiza MapaBancos correctamente', async () => {
    render(<MapaBancos />);

    await waitFor(() => {
      expect(screen.getByText(/Mapa de bancos/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Banco Central/i).length).toBeGreaterThan(0);
  });
});
