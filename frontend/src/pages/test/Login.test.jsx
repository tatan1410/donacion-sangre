import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../Login';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
    api.post.mockResolvedValue({
      data: {
        token: 'token-123',
        usuario: { rol: 'DONANTE', nombre: 'Ana' },
      },
    });
  });

  test('renderiza Login correctamente', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INGRESAR/i })).toBeInTheDocument();
  });

  test('permite escribir credenciales y enviar el formulario', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/tucorreo@ejemplo.com/i), {
      target: { value: 'ana@correo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Clave123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /INGRESAR/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        correo: 'ana@correo.com',
        contrasena: 'Clave123!',
      });
    });
  });
});
