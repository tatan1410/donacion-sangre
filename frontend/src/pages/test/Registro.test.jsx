import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Registro from '../Registro';
import { useAuth } from '../../context/AuthContext';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  test('renderiza Registro correctamente', () => {
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>
    );

    expect(screen.getByText(/DonaVida/i)).toBeInTheDocument();
    expect(screen.getByText(/Crea tu cuenta/i)).toBeInTheDocument();
  });

  test('permite escribir en el campo de correo', () => {
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>
    );

    const correoInput = screen.getByPlaceholderText('tucorreo@ejemplo.com');
    fireEvent.change(correoInput, { target: { value: 'ana@correo.com' } });

    expect(correoInput).toHaveValue('ana@correo.com');
  });
});
