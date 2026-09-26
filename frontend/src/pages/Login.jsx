import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validador de correo en vivo
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo || !contrasena) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!correoValido) {
      setError('El correo no tiene un formato válido');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/login', { correo, contrasena });
      const { token, usuario } = response.data;
      login(usuario, token);

      if (usuario.rol === 'DONANTE') navigate('/home-donante');
      else if (usuario.rol === 'ADMIN_BANCO') navigate('/home-banco');
      else if (usuario.rol === 'SUPER_ADMIN') navigate('/super-admin');   // ← NUEVA
      else navigate('/');
    } catch (err) {
      const mensajeError =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'Credenciales incorrectas';
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Importar fuentes */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex items-center justify-center p-4 bg-[#08080f] overflow-hidden relative"
        style={{
          backgroundImage: `
               radial-gradient(ellipse at 20% 20%, rgba(220, 38, 38, 0.18) 0, transparent 55%),
               radial-gradient(ellipse at 80% 80%, rgba(255, 90, 110, 0.12) 0, transparent 55%)
             `,
          fontFamily: "'DM Sans', sans-serif"
        }}>

        {/* Container principal */}
        <div className="relative w-full max-w-[860px] h-auto md:h-[540px] bg-[#111118] border border-[#1e1e2e] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col md:flex-row">

          {/* ═══════════════════════════════════════════ */}
          {/* PANEL IZQUIERDO - Formulario             */}
          {/* ═══════════════════════════════════════════ */}
          <div className="w-full md:w-1/2 p-9 md:p-11 flex flex-col justify-center">

            <h2 className="text-2xl font-extrabold text-[#e8e8f0] tracking-tight mb-1.5"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Iniciar Sesión
            </h2>
            <p className="text-sm text-[#52526a] mb-5">
              Bienvenido de vuelta a DonaVida
            </p>

            {/* Alert de error */}
            {error && (
              <div className="w-full px-3.5 py-2.5 rounded-lg text-sm mb-3.5 flex items-center gap-2 bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.25)] text-[#ff4d6d] animate-shake">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">

              {/* Campo Correo con validación en vivo */}
              <div className="w-full mb-3">
                <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  Correo
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52526a] pointer-events-none"
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    disabled={loading}
                    className={`w-full pl-10 pr-3 py-2.5 bg-[#08080f] border rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:ring-2 transition-all placeholder:text-[#2a2a3e] ${correo.length > 0 && !correoValido
                        ? 'border-[#ff4d6d] focus:border-[#ff4d6d] focus:ring-[#ff4d6d]/20'
                        : correo.length > 0 && correoValido
                          ? 'border-[#43e97b] focus:border-[#43e97b] focus:ring-[#43e97b]/20'
                          : 'border-[#1e1e2e] focus:border-[#dc2626] focus:ring-[#dc2626]/20'
                      }`}
                  />
                </div>
                {correo.length > 0 && !correoValido && (
                  <p className="text-[0.7rem] mt-1.5 text-[#ff4d6d]">
                    ✗ Ingresa un correo válido (ejemplo@dominio.com)
                  </p>
                )}
                {correo.length > 0 && correoValido && (
                  <p className="text-[0.7rem] mt-1.5 text-[#43e97b]">
                    ✓ Correo válido
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="w-full mb-3">
                <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  Contraseña
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52526a] pointer-events-none"
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all placeholder:text-[#2a2a3e]"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52526a] hover:text-[#e8e8f0] transition-colors"
                  >
                    {mostrarPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Recordarme + Olvidé contraseña */}
              <div className="flex justify-between items-center w-full mb-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    className="w-3.5 h-3.5 cursor-pointer accent-[#dc2626]"
                  />
                  <span className="text-[0.8rem] text-[#52526a]">Recordarme</span>
                </label>
                {/* Pendiente: habilitar cuando exista la función de recuperar contraseña
                <a href="#" className="text-[0.78rem] text-[#dc2626] hover:opacity-70 transition-opacity no-underline">
                  ¿Olvidaste tu contraseña?
                </a>
                */}
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading || (correo.length > 0 && !correoValido)}
                className="w-full py-3 rounded-[10px] text-sm font-extrabold tracking-[0.5px] cursor-pointer text-white transition-all bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:shadow-[#dc2626]/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando...
                  </>
                ) : (
                  'INGRESAR'
                )}
              </button>
            </form>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* PANEL DERECHO - Hero                       */}
          {/* ═══════════════════════════════════════════ */}
          <div className="w-full md:w-1/2 relative flex flex-col items-center justify-center p-12 text-center text-white overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)'
            }}>

            {/* Grid decorativo de fondo */}
            <div className="absolute inset-0 opacity-100"
              style={{
                backgroundImage: `
                     linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                   `,
                backgroundSize: '30px 30px'
              }}>
            </div>

            {/* Círculos decorativos */}
            <div className="absolute w-[200px] h-[200px] -top-[60px] -right-[60px] bg-white/5 rounded-full"></div>
            <div className="absolute w-[140px] h-[140px] -bottom-[40px] -left-[40px] bg-white/5 rounded-full"></div>

            {/* Contenido */}
            <div className="relative z-10">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mb-4">
                <span className="text-xs font-semibold tracking-wider">🩸 DONAVIDA</span>
              </div>

              <h3 className="text-2xl font-extrabold mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                ¿Primera vez aquí?
              </h3>

              <p className="text-sm text-white/75 leading-relaxed mb-7 max-w-[280px]">
                Únete a la comunidad de donantes y ayuda a salvar vidas con cada donación.
              </p>

              <a
                href="/registro"
                className="inline-block bg-transparent border-2 border-white/80 text-white px-8 py-2.5 rounded-3xl text-[0.82rem] font-bold tracking-[0.8px] cursor-pointer transition-all hover:bg-white/15 hover:border-white no-underline"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                CREAR CUENTA
              </a>

              {/* Stats inferiores */}
              <div className="grid grid-cols-3 gap-3 mt-10 max-w-[280px] mx-auto">
                <div>
                  <div className="text-2xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>3</div>
                  <div className="text-[0.65rem] text-white/60 mt-0.5">vidas/donación</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>1.7%</div>
                  <div className="text-[0.65rem] text-white/60 mt-0.5">donantes Col</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>7/10</div>
                  <div className="text-[0.65rem] text-white/60 mt-0.5">necesitarán</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animación shake */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
      </div>
    </>
  );
}