import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ─── Control del stepper ──────────────────────────
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  // ─── Datos del formulario completo ────────────────
  const [datos, setDatos] = useState({
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    celular: '',
    fechaNacimiento: '',
    genero: '',
    tipoSangre: '',
    pesoKg: '',
    ciudad: '',
    departamento: '',
    latitud: null,
    longitud: null,
  });

  // ─── Estados visuales ──────────────────────────────
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [ubicacionDetectada, setUbicacionDetectada] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  // ─── Validaciones ──────────────────────────────────
  const validarPass = (pass) => ({
    longitud: pass.length >= 8,
    mayuscula: /[A-Z]/.test(pass),
    numero: /[0-9]/.test(pass),
    especial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
  });

  const checks = validarPass(datos.contrasena);
  const passOk = checks.longitud && checks.mayuscula && checks.numero && checks.especial;
  const passMatch = datos.contrasena === datos.confirmarContrasena && datos.confirmarContrasena.length > 0;
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo);
  const fuerzaPass = Object.values(checks).filter(Boolean).length;

  // Fechas mínima y máxima para edad (18 a 65 años)
  const hoy = new Date();
  const fechaMaxima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate())
    .toISOString().split('T')[0];
  const fechaMinima = new Date(hoy.getFullYear() - 65, hoy.getMonth(), hoy.getDate())
    .toISOString().split('T')[0];

  const edadOk = datos.fechaNacimiento >= fechaMinima && datos.fechaNacimiento <= fechaMaxima;
  const pesoOk = parseFloat(datos.pesoKg) >= 50 && parseFloat(datos.pesoKg) <= 200;
  const tieneUbicacion = datos.latitud !== null && datos.longitud !== null;

  // ─── Handler genérico ──────────────────────────────
  const actualizar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor });
    setErrorGeneral('');
  };

  // ─── Detectar ubicación ────────────────────────────
  const detectarUbicacion = () => {
    if (!navigator.geolocation) {
      setErrorGeneral('Tu navegador no soporta geolocalización');
      return;
    }

    setObteniendoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDatos(prev => ({
          ...prev,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        }));
        setUbicacionDetectada(true);
        setObteniendoUbicacion(false);
      },
      (err) => {
        setErrorGeneral('No pudimos obtener tu ubicación. Verifica los permisos del navegador.');
        setObteniendoUbicacion(false);
      }
    );
  };

  // ─── Qué falta en cada paso (se muestra bajo el botón) ─
  const celularValido = /^3\d{9}$/.test(datos.celular);

  const faltantesPaso1 = [
    !correoValido && 'un correo válido',
    !passOk && 'una contraseña que cumpla los 4 requisitos',
    !passMatch && 'confirmar la contraseña',
  ].filter(Boolean);

  const faltantesPaso2 = [
    datos.numeroDocumento.length < 5 && 'número de documento (mínimo 5 dígitos)',
    datos.nombre.trim().length < 2 && 'nombre',
    datos.apellido.trim().length < 2 && 'apellido',
    !celularValido && 'celular válido (10 dígitos, empieza por 3)',
    !edadOk && 'fecha de nacimiento (entre 18 y 65 años)',
    !datos.genero && 'género',
  ].filter(Boolean);

  const faltantesPaso3 = [
    !datos.tipoSangre && 'tipo de sangre',
    !pesoOk && 'peso entre 50 y 200 kg',
    datos.ciudad.trim().length < 2 && 'ciudad',
    datos.departamento.trim().length < 2 && 'departamento',
    !tieneUbicacion && 'detectar tu ubicación',
  ].filter(Boolean);

  const avisoFaltantes = (items) => items.length > 0 && (
    <p className="text-[0.72rem] mt-2 text-[#f59e0b]">
      Para continuar falta: {items.join(', ')}.
    </p>
  );

  // ─── Submit final ──────────────────────────────────
  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    setLoading(true);

    try {
      const payload = {
        ...datos,
        pesoKg: datos.pesoKg ? parseFloat(datos.pesoKg) : null,
      };
      delete payload.confirmarContrasena;

      const response = await api.post('/api/v1/auth/registro', payload);
      const { token, usuario } = response.data;
      login(usuario, token);
      navigate('/home-donante');
    } catch (err) {
      // El backend devuelve "errores" (validación por campo) o "mensaje" (regla de negocio)
      const data = err.response?.data;
      const msg = data?.errores
        ? Object.values(data.errores).join(' · ')
        : data?.mensaje
        || (err.response ? 'Error al crear la cuenta' : 'No se pudo conectar con el servidor. Intenta de nuevo.');
      setErrorGeneral(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex items-center justify-center p-4 bg-[#08080f] relative overflow-y-auto"
        style={{
          backgroundImage: `
               radial-gradient(ellipse at 20% 20%, rgba(220, 38, 38, 0.18) 0, transparent 55%),
               radial-gradient(ellipse at 80% 80%, rgba(255, 90, 110, 0.12) 0, transparent 55%)
             `,
          fontFamily: "'DM Sans', sans-serif"
        }}>

        <div className="w-full max-w-[680px] my-8">

          {/* Header con logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-3xl">🩸</span>
              <h1 className="text-2xl font-extrabold text-[#e8e8f0]"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                DonaVida
              </h1>
            </div>
            <p className="text-sm text-[#52526a]">
              Únete a la comunidad de donantes
            </p>
          </div>

          {/* Card principal */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">

            {/* Stepper visual */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between max-w-[400px] mx-auto">
                {[1, 2, 3].map((paso, idx) => (
                  <div key={paso} className="flex items-center flex-1">
                    <div className={`relative flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all
                      ${paso < pasoActual ? 'bg-gradient-to-br from-[#dc2626] to-[#991b1b] text-white' : ''}
                      ${paso === pasoActual ? 'bg-gradient-to-br from-[#dc2626] to-[#991b1b] text-white ring-4 ring-[#dc2626]/20' : ''}
                      ${paso > pasoActual ? 'bg-[#1e1e2e] text-[#52526a]' : ''}
                    `}
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      {paso < pasoActual ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : paso}
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-[2px] mx-2 transition-all ${paso < pasoActual ? 'bg-[#dc2626]' : 'bg-[#1e1e2e]'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between max-w-[400px] mx-auto mt-2 px-1">
                <span className={`text-[0.7rem] uppercase tracking-wider font-bold transition-colors ${pasoActual >= 1 ? 'text-[#dc2626]' : 'text-[#52526a]'}`}
                  style={{ fontFamily: "'Syne', sans-serif" }}>Cuenta</span>
                <span className={`text-[0.7rem] uppercase tracking-wider font-bold transition-colors ${pasoActual >= 2 ? 'text-[#dc2626]' : 'text-[#52526a]'}`}
                  style={{ fontFamily: "'Syne', sans-serif" }}>Perfil</span>
                <span className={`text-[0.7rem] uppercase tracking-wider font-bold transition-colors ${pasoActual >= 3 ? 'text-[#dc2626]' : 'text-[#52526a]'}`}
                  style={{ fontFamily: "'Syne', sans-serif" }}>Donante</span>
              </div>
            </div>

            {/* Contenido del paso */}
            <div className="p-8 pt-4">

              {errorGeneral && (
                <div className="px-3.5 py-2.5 rounded-lg text-sm mb-4 flex items-center gap-2 bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.25)] text-[#ff4d6d] animate-shake">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errorGeneral}
                </div>
              )}

              {/* PASO 1 - Datos de cuenta */}
              {pasoActual === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#e8e8f0] mb-1"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      Crea tu cuenta
                    </h2>
                    <p className="text-sm text-[#52526a]">
                      Empezamos con lo básico — tu correo y contraseña
                    </p>
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}>Correo electrónico</label>
                    <input
                      type="email"
                      value={datos.correo}
                      onChange={(e) => actualizar('correo', e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className={`w-full px-4 py-2.5 bg-[#08080f] border rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:ring-2 transition-all placeholder:text-[#2a2a3e] ${datos.correo.length > 0 && !correoValido
                        ? 'border-[#ff4d6d] focus:border-[#ff4d6d] focus:ring-[#ff4d6d]/20'
                        : datos.correo.length > 0 && correoValido
                          ? 'border-[#43e97b] focus:border-[#43e97b] focus:ring-[#43e97b]/20'
                          : 'border-[#1e1e2e] focus:border-[#dc2626] focus:ring-[#dc2626]/20'
                        }`}
                    />
                    {datos.correo.length > 0 && !correoValido && (
                      <p className="text-[0.7rem] mt-1.5 text-[#ff4d6d]">
                        ✗ Ingresa un correo válido (ejemplo@dominio.com)
                      </p>
                    )}
                    {datos.correo.length > 0 && correoValido && (
                      <p className="text-[0.7rem] mt-1.5 text-[#43e97b]">
                        ✓ Correo válido
                      </p>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}>Contraseña</label>
                    <div className="relative">
                      <input
                        type={mostrarPass ? 'text' : 'password'}
                        value={datos.contrasena}
                        onChange={(e) => actualizar('contrasena', e.target.value)}
                        placeholder="Crea una contraseña segura"
                        className="w-full px-4 pr-10 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all placeholder:text-[#2a2a3e]"
                      />
                      <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52526a] hover:text-[#e8e8f0]">
                        {mostrarPass ? '🙈' : '👁️'}
                      </button>
                    </div>

                    {datos.contrasena.length > 0 && (
                      <div className="mt-2 animate-fadeIn">
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4].map(n => (
                            <div key={n} className={`flex-1 h-1 rounded transition-all ${n <= fuerzaPass
                              ? fuerzaPass === 1 ? 'bg-[#ff4d6d]'
                                : fuerzaPass === 2 ? 'bg-[#f59e0b]'
                                  : fuerzaPass === 3 ? 'bg-[#43e97b]'
                                    : 'bg-[#43e97b]'
                              : 'bg-[#1e1e2e]'
                              }`}></div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { ok: checks.longitud, label: 'Mínimo 8 caracteres' },
                            { ok: checks.mayuscula, label: 'Una mayúscula' },
                            { ok: checks.numero, label: 'Un número' },
                            { ok: checks.especial, label: 'Un especial (!@#$)' }
                          ].map((check, i) => (
                            <div key={i} className={`flex items-center gap-1.5 text-[0.7rem] transition-colors ${check.ok ? 'text-[#43e97b]' : 'text-[#ff4d6d]'}`}>
                              <span>{check.ok ? '✓' : '✗'}</span>
                              {check.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}>Confirmar contraseña</label>
                    <div className="relative">
                      <input
                        type={mostrarConfirm ? 'text' : 'password'}
                        value={datos.confirmarContrasena}
                        onChange={(e) => actualizar('confirmarContrasena', e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="w-full px-4 pr-10 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all placeholder:text-[#2a2a3e]"
                      />
                      <button type="button" onClick={() => setMostrarConfirm(!mostrarConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52526a] hover:text-[#e8e8f0]">
                        {mostrarConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {datos.confirmarContrasena.length > 0 && (
                      <p className={`text-[0.7rem] mt-1.5 ${passMatch ? 'text-[#43e97b]' : 'text-[#ff4d6d]'}`}>
                        {passMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setPasoActual(2)}
                    disabled={faltantesPaso1.length > 0}
                    className="w-full py-3 rounded-[10px] text-sm font-extrabold tracking-[0.5px] text-white transition-all bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none mt-4"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    CONTINUAR →
                  </button>
                  {avisoFaltantes(faltantesPaso1)}

                  <p className="text-center text-xs text-[#52526a] mt-4">
                    ¿Ya tienes cuenta? <a href="/login" className="text-[#dc2626] font-bold hover:underline">Iniciar sesión</a>
                  </p>
                </div>
              )}

              {/* PASO 2 - Datos personales */}
              {pasoActual === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#e8e8f0] mb-1"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      Cuéntanos sobre ti
                    </h2>
                    <p className="text-sm text-[#52526a]">
                      Datos que necesitamos para identificarte como donante
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Tipo</label>
                      <select
                        value={datos.tipoDocumento}
                        onChange={(e) => actualizar('tipoDocumento', e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                      >
                        <option value="CC">CC</option>
                        <option value="TI">TI</option>
                        <option value="CE">CE</option>
                        <option value="PP">PP</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Número de documento</label>
                      <input
                        type="text"
                        value={datos.numeroDocumento}
                        onChange={(e) => {
                          const valor = e.target.value.replace(/\D/g, '').slice(0, 15);
                          actualizar('numeroDocumento', valor);
                        }}
                        placeholder="1234567890"
                        maxLength={15}
                        inputMode="numeric"
                        className={`w-full px-4 py-2.5 bg-[#08080f] border rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:ring-2 transition-all placeholder:text-[#2a2a3e] ${datos.numeroDocumento.length > 0 && datos.numeroDocumento.length < 5
                          ? 'border-[#ff4d6d] focus:border-[#ff4d6d] focus:ring-[#ff4d6d]/20'
                          : datos.numeroDocumento.length >= 5
                            ? 'border-[#43e97b] focus:border-[#43e97b] focus:ring-[#43e97b]/20'
                            : 'border-[#1e1e2e] focus:border-[#dc2626] focus:ring-[#dc2626]/20'
                          }`}
                      />
                      {datos.numeroDocumento.length > 0 && datos.numeroDocumento.length < 5 && (
                        <p className="text-[0.7rem] mt-1.5 text-[#ff4d6d]">
                          ✗ Mínimo 5 dígitos
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Nombre</label>
                      <input
                        type="text"
                        value={datos.nombre}
                        onChange={(e) => {
                          const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 50);
                          actualizar('nombre', valor);
                        }}
                        placeholder="Carlos"
                        maxLength={50}
                        className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 placeholder:text-[#2a2a3e]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Apellido</label>
                      <input
                        type="text"
                        value={datos.apellido}
                        onChange={(e) => {
                          const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 50);
                          actualizar('apellido', valor);
                        }}
                        placeholder="Díaz"
                        maxLength={50}
                        className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 placeholder:text-[#2a2a3e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}>Celular</label>
                    <input
                      type="tel"
                      value={datos.celular}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '').slice(0, 10);
                        actualizar('celular', valor);
                      }}
                      placeholder="3001234567"
                      maxLength={10}
                      inputMode="numeric"
                      className={`w-full px-4 py-2.5 bg-[#08080f] border rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:ring-2 transition-all placeholder:text-[#2a2a3e] ${datos.celular.length === 0
                        ? 'border-[#1e1e2e] focus:border-[#dc2626] focus:ring-[#dc2626]/20'
                        : celularValido
                          ? 'border-[#43e97b] focus:border-[#43e97b] focus:ring-[#43e97b]/20'
                          : 'border-[#ff4d6d] focus:border-[#ff4d6d] focus:ring-[#ff4d6d]/20'
                        }`}
                    />
                    {datos.celular.length > 0 && !datos.celular.startsWith('3') && (
                      <p className="text-[0.7rem] mt-1.5 text-[#ff4d6d]">
                        ✗ El celular debe empezar por 3
                      </p>
                    )}
                    {datos.celular.startsWith('3') && datos.celular.length < 10 && (
                      <p className="text-[0.7rem] mt-1.5 text-[#ff4d6d]">
                        ✗ Debe tener 10 dígitos ({datos.celular.length}/10)
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Fecha nacimiento</label>
                      <input
                        type="date"
                        value={datos.fechaNacimiento}
                        onChange={(e) => actualizar('fechaNacimiento', e.target.value)}
                        min={fechaMinima}
                        max={fechaMaxima}
                        className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 cursor-pointer
                          [&::-webkit-calendar-picker-indicator]:bg-[#dc2626]
                          [&::-webkit-calendar-picker-indicator]:rounded
                          [&::-webkit-calendar-picker-indicator]:p-1
                          [&::-webkit-calendar-picker-indicator]:cursor-pointer
                          [&::-webkit-calendar-picker-indicator]:invert"
                      />
                      <p className="text-[0.65rem] mt-1 text-[#52526a]">
                        Debes tener entre 18 y 65 años
                      </p>
                    </div>
                    <div>
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Género</label>
                      <select
                        value={datos.genero}
                        onChange={(e) => actualizar('genero', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                      >
                        <option value="">Selecciona...</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setPasoActual(1)}
                      className="px-6 py-3 rounded-[10px] text-sm font-extrabold tracking-[0.5px] text-[#e8e8f0] bg-[#1e1e2e] hover:bg-[#2a2a3e] transition-all"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      ← ATRÁS
                    </button>
                    <button
                      onClick={() => setPasoActual(3)}
                      disabled={faltantesPaso2.length > 0}
                      className="flex-1 py-3 rounded-[10px] text-sm font-extrabold tracking-[0.5px] text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      CONTINUAR →
                    </button>
                  </div>
                  {avisoFaltantes(faltantesPaso2)}
                </div>
              )}

              {/* PASO 3 - Datos de donante */}
              {pasoActual === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#e8e8f0] mb-1"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      Tu perfil de donante
                    </h2>
                    <p className="text-sm text-[#52526a]">
                      Información para hacer matching con bancos cercanos
                    </p>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-2"
                      style={{ fontFamily: "'Syne', sans-serif" }}>Tipo de sangre</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(tipo => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => actualizar('tipoSangre', tipo)}
                          className={`py-2.5 rounded-[9px] text-sm font-bold transition-all border-2 ${datos.tipoSangre === tipo
                            ? 'bg-gradient-to-br from-[#dc2626] to-[#991b1b] text-white border-[#dc2626] shadow-lg shadow-[#dc2626]/30'
                            : 'bg-[#08080f] text-[#e8e8f0] border-[#1e1e2e] hover:border-[#dc2626]/50'
                            }`}
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Peso (kg)</label>
                      <input
                        type="number"
                        value={datos.pesoKg}
                        onChange={(e) => {
                          const valor = e.target.value.slice(0, 3);
                          actualizar('pesoKg', valor);
                        }}
                        placeholder="70"
                        min="50"
                        max="200"
                        className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 placeholder:text-[#2a2a3e]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>Ciudad</label>
                      <input
                        type="text"
                        value={datos.ciudad}
                        onChange={(e) => {
                          const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 50);
                          actualizar('ciudad', valor);
                        }}
                        placeholder="Medellín"
                        maxLength={50}
                        className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 placeholder:text-[#2a2a3e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}>Departamento</label>
                    <input
                      type="text"
                      value={datos.departamento}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 50);
                        actualizar('departamento', valor);
                      }}
                      placeholder="Antioquia"
                      maxLength={50}
                      className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-[9px] text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 placeholder:text-[#2a2a3e]"
                    />
                  </div>

                  <div className={`p-4 rounded-[10px] border-2 transition-all ${ubicacionDetectada
                    ? 'border-[#43e97b] bg-[rgba(67,233,123,0.05)]'
                    : 'border-[#1e1e2e] bg-[#08080f]'
                    }`}>
                    {ubicacionDetectada ? (
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">✅</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#43e97b]">Ubicación detectada</p>
                          <p className="text-xs text-[#52526a] mt-0.5">
                            Se usará para conectarte con bancos cercanos
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={detectarUbicacion}
                        disabled={obteniendoUbicacion}
                        className="w-full flex items-center justify-center gap-3 text-[#e8e8f0] hover:text-[#dc2626] transition-colors disabled:opacity-50"
                      >
                        {obteniendoUbicacion ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm font-bold">Obteniendo ubicación...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl">📍</span>
                            <div className="text-left">
                              <p className="text-sm font-bold">Detectar mi ubicación</p>
                              <p className="text-xs text-[#52526a] mt-0.5">
                                Para encontrar bancos cerca de ti
                              </p>
                            </div>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setPasoActual(2)}
                      className="px-6 py-3 rounded-[10px] text-sm font-extrabold tracking-[0.5px] text-[#e8e8f0] bg-[#1e1e2e] hover:bg-[#2a2a3e] transition-all"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      ← ATRÁS
                    </button>
                    <button
                      onClick={handleRegistro}
                      disabled={faltantesPaso3.length > 0 || loading}
                      className="flex-1 py-3 rounded-[10px] text-sm font-extrabold tracking-[0.5px] text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          CREANDO CUENTA...
                        </>
                      ) : (
                        '🩸 CREAR MI CUENTA'
                      )}
                    </button>
                  </div>
                  {avisoFaltantes(faltantesPaso3)}
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
}