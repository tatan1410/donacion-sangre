import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { bancoService, usuarioService } from '../services/api';

const FORM_VACIO = {
  nombre: '',
  nit: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  telefono: '',
  correo: '',
  latitud: '',
  longitud: '',
  horarioApertura: '',
  horarioCierre: '',
  activo: true,
  adminId: '',
};

const ADMIN_VACIO = {
  nombre: '',
  apellido: '',
  correo: '',
  celular: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  contrasena: '',
  ciudad: '',
  departamento: '',
};

// ─── Validaciones del formulario de banco ──────────────────────────────
const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/;

const validarBanco = (f) => {
  const e = {};
  const nombre = f.nombre.trim();
  if (!nombre) e.nombre = 'Obligatorio';
  else if (nombre.length < 3) e.nombre = 'Mínimo 3 caracteres';

  if (!f.nit) e.nit = 'Obligatorio';
  else if (!/^\d{9}(-\d)?$/.test(f.nit)) e.nit = '9 dígitos + dígito de verificación opcional (900123456-7)';

  const ciudad = f.ciudad.trim();
  if (!ciudad) e.ciudad = 'Obligatorio';
  else if (ciudad.length < 3 || !SOLO_LETRAS.test(ciudad)) e.ciudad = 'Solo letras, mínimo 3';

  const depto = f.departamento.trim();
  if (!depto) e.departamento = 'Obligatorio';
  else if (depto.length < 4 || !SOLO_LETRAS.test(depto)) e.departamento = 'Solo letras, mínimo 4';

  const dir = f.direccion.trim();
  if (!dir) e.direccion = 'Obligatorio';
  else if (dir.length < 8 || !/[A-Za-z]/.test(dir) || !/\d/.test(dir)) e.direccion = 'Dirección completa (ej: Calle 50 # 45-20)';

  if (f.telefono && !/^(3\d{9}|60\d{8})$/.test(f.telefono))
    e.telefono = 'Celular (3XXXXXXXXX) o fijo (60XXXXXXXX), 10 dígitos';

  if (f.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.correo)) e.correo = 'Correo inválido';

  const lat = parseFloat(f.latitud);
  if (f.latitud === '') e.latitud = 'Obligatorio';
  else if (isNaN(lat) || lat < -4.3 || lat > 13.5) e.latitud = 'Fuera de Colombia (-4.3 a 13.5)';

  const lon = parseFloat(f.longitud);
  if (f.longitud === '') e.longitud = 'Obligatorio';
  else if (isNaN(lon) || lon < -82 || lon > -66.8) e.longitud = 'Fuera de Colombia (-82 a -66.8)';

  if (f.horarioApertura && f.horarioCierre && f.horarioCierre <= f.horarioApertura)
    e.horarioCierre = 'Debe ser después de la apertura';

  if (!f.adminId) e.adminId = 'Selecciona un administrador';
  return e;
};

// ─── Validaciones del formulario de admin de banco ─────────────────────
const DOCUMENTO = {
  CC: { regex: /^\d{5,10}$/,          max: 10, msg: 'Cédula: solo números, entre 5 y 10 dígitos' },
  CE: { regex: /^\d{6,10}$/,          max: 10, msg: 'Cédula de extranjería: solo números, entre 6 y 10 dígitos' },
  PA: { regex: /^[A-Z0-9]{6,12}$/,    max: 12, msg: 'Pasaporte: letras y números, entre 6 y 12 caracteres' },
};

const checksContrasena = (c) => ({
  largo: c.length >= 8,
  mayuscula: /[A-Z]/.test(c),
  numero: /\d/.test(c),
  especial: /[!@#$%^&*(),.?":{}|<>]/.test(c),
});

const validarAdmin = (f) => {
  const e = {};
  const nombre = f.nombre.trim();
  if (!nombre) e.nombre = 'Obligatorio';
  else if (nombre.length < 2 || !SOLO_LETRAS.test(nombre)) e.nombre = 'Solo letras, mínimo 2';

  const apellido = f.apellido.trim();
  if (!apellido) e.apellido = 'Obligatorio';
  else if (apellido.length < 2 || !SOLO_LETRAS.test(apellido)) e.apellido = 'Solo letras, mínimo 2';

  if (!f.correo) e.correo = 'Obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.correo)) e.correo = 'Correo inválido';

  const doc = DOCUMENTO[f.tipoDocumento];
  if (!f.numeroDocumento) e.numeroDocumento = 'Obligatorio';
  else if (doc && !doc.regex.test(f.numeroDocumento)) e.numeroDocumento = doc.msg;

  if (!f.celular) e.celular = 'Obligatorio';
  else if (!/^3\d{9}$/.test(f.celular)) e.celular = '10 dígitos y empieza por 3';

  const checks = checksContrasena(f.contrasena);
  if (!f.contrasena) e.contrasena = 'Obligatoria';
  else if (!Object.values(checks).every(Boolean)) e.contrasena = 'No cumple todos los requisitos';
  

  const ciudad = f.ciudad.trim();
  if (!ciudad) e.ciudad = 'Obligatorio';
  else if (ciudad.length < 3 || !SOLO_LETRAS.test(ciudad)) e.ciudad = 'Solo letras, mínimo 3';

  const depto = f.departamento.trim();
  if (!depto) e.departamento = 'Obligatorio';
  else if (depto.length < 4 || !SOLO_LETRAS.test(depto)) e.departamento = 'Solo letras, mínimo 4';
  return e;
};

export default function GestionBancos() {
  const [bancos, setBancos] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  const [modalAdmin, setModalAdmin] = useState(false);
  const [formAdmin, setFormAdmin] = useState(ADMIN_VACIO);
  const [guardandoAdmin, setGuardandoAdmin] = useState(false);
  const [errorAdmin, setErrorAdmin] = useState('');
  const [intentoAdmin, setIntentoAdmin] = useState(false);

  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // ── Cargar datos ────────────────────────────────────────────────────
  const cargarBancos = async () => {
    try {
      const res = await bancoService.listarTodos();
      setBancos(res.data);
    } catch (err) {
      console.error('Error cargando bancos:', err);
    }
  };

  const cargarAdmins = async () => {
    try {
      const res = await usuarioService.listarPorRol('ADMIN_BANCO');
      setAdmins(res.data);
    } catch (err) {
      console.error('Error cargando admins:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([cargarBancos(), cargarAdmins()]);
      setLoading(false);
    };
    init();
  }, []);

  // ── Modal Banco ─────────────────────────────────────────────────────
  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setModoEdicion(false);
    setEditandoId(null);
    setErrorForm('');
    setIntentoGuardar(false);
    setModalAbierto(true);
  };

  const abrirEditar = (banco) => {
    setForm({
      nombre: banco.nombre || '',
      nit: banco.nit || '',
      direccion: banco.direccion || '',
      ciudad: banco.ciudad || '',
      departamento: banco.departamento || '',
      telefono: banco.telefono || '',
      correo: banco.correo || '',
      latitud: banco.latitud ?? '',
      longitud: banco.longitud ?? '',
      horarioApertura: banco.horarioApertura || '',
      horarioCierre: banco.horarioCierre || '',
      activo: banco.activo ?? true,
      adminId: banco.admin?.id || '',
    });
    setModoEdicion(true);
    setEditandoId(banco.id);
    setErrorForm('');
    setIntentoGuardar(false);
    setModalAbierto(true);
  };

  const erroresBanco = validarBanco(form);
  // Muestra el error de un campo si ya tiene algo escrito o si intentaron guardar
  const errBanco = (campo) =>
    (intentoGuardar || String(form[campo] ?? '') !== '') ? erroresBanco[campo] : undefined;

  const guardar = async () => {
    setErrorForm('');
    setIntentoGuardar(true);

    if (Object.keys(erroresBanco).length > 0) {
      setErrorForm('Revisa los campos marcados en rojo');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        ...form,
        nombre: form.nombre.trim(),
        ciudad: form.ciudad.trim(),
        departamento: form.departamento.trim(),
        direccion: form.direccion.trim(),
        telefono: form.telefono || null,
        correo: form.correo || null,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
        adminId: Number(form.adminId),
        horarioApertura: form.horarioApertura || null,
        horarioCierre: form.horarioCierre || null,
      };

      if (modoEdicion) {
        await bancoService.actualizar(editandoId, payload);
      } else {
        await bancoService.crear(payload);
      }

      await cargarBancos();
      setModalAbierto(false);
    } catch (err) {
      console.error('Error guardando banco:', err);
      const msg = err.response?.data?.mensaje ||
                  err.response?.data?.error ||
                  err.response?.data?.errores?.[Object.keys(err.response?.data?.errores || {})[0]] ||
                  'Error al guardar el banco';
      setErrorForm(msg);
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async (id, nombre) => {
    if (!confirm(`¿Desactivar el banco "${nombre}"?`)) return;
    try {
      await bancoService.desactivar(id);
      await cargarBancos();
    } catch (err) {
      console.error('Error desactivando:', err);
      alert('No se pudo desactivar el banco');
    }
  };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE el banco "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await bancoService.eliminar(id);
      await cargarBancos();
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('No se pudo eliminar el banco. Puede tener inventario o solicitudes asociadas.');
    }
  };

  // ── Modal Crear Admin ───────────────────────────────────────────────
  const abrirModalAdmin = () => {
    setFormAdmin(ADMIN_VACIO);
    setErrorAdmin('');
    setIntentoAdmin(false);
    setModalAdmin(true);
  };

  const erroresAdmin = validarAdmin(formAdmin);
  const errAdmin = (campo) =>
    (intentoAdmin || String(formAdmin[campo] ?? '') !== '') ? erroresAdmin[campo] : undefined;
  const checksPass = checksContrasena(formAdmin.contrasena);

  const guardarAdmin = async () => {
    setErrorAdmin('');
    setIntentoAdmin(true);

    if (Object.keys(erroresAdmin).length > 0) {
      setErrorAdmin('Revisa los campos marcados en rojo');
      return;
    }

    setGuardandoAdmin(true);
    try {
      const res = await usuarioService.crearAdminBanco({
        ...formAdmin,
        nombre: formAdmin.nombre.trim(),
        apellido: formAdmin.apellido.trim(),
        ciudad: formAdmin.ciudad.trim(),
        departamento: formAdmin.departamento.trim(),
      });
      await cargarAdmins();
      // Auto-seleccionar el admin recién creado en el form de banco
      setForm(f => ({ ...f, adminId: res.data.id }));
      setModalAdmin(false);
    } catch (err) {
      console.error('Error creando admin:', err);
      const msg = err.response?.data?.mensaje ||
                  err.response?.data?.error ||
                  err.response?.data?.errores?.[Object.keys(err.response?.data?.errores || {})[0]] ||
                  'Error al crear el administrador';
      setErrorAdmin(msg);
    } finally {
      setGuardandoAdmin(false);
    }
  };

  // ── Filtrado ────────────────────────────────────────────────────────
  const bancosFiltrados = bancos.filter(b => {
    if (filtroEstado === 'ACTIVOS' && !b.activo) return false;
    if (filtroEstado === 'INACTIVOS' && b.activo) return false;
    if (filtroCiudad && !b.ciudad?.toLowerCase().includes(filtroCiudad.toLowerCase())) return false;
    return true;
  });

  // ── Render ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-[#1e1e2e] rounded-2xl animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[#dc2626] text-xs font-bold uppercase tracking-wider mb-1"
             style={{ fontFamily: "'Syne', sans-serif" }}>
            Maestra · Super Admin
          </p>
          <h1 className="text-4xl font-extrabold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            Gestión de Bancos
          </h1>
          <p className="text-[#52526a]">
            {bancos.length} banco{bancos.length !== 1 ? 's' : ''} · {bancos.filter(b => b.activo).length} activo{bancos.filter(b => b.activo).length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="px-5 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          + NUEVO BANCO
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={filtroCiudad}
          onChange={(e) => setFiltroCiudad(e.target.value)}
          placeholder="🔎 Filtrar por ciudad..."
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] placeholder:text-[#2a2a3e]"
        />
        <div className="flex gap-2">
          {['TODOS', 'ACTIVOS', 'INACTIVOS'].map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                filtroEstado === e
                  ? 'bg-[#dc2626] text-white'
                  : 'bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:text-[#e8e8f0]'
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de bancos */}
      {bancosFiltrados.length === 0 ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🏦</p>
          <p className="text-[#e8e8f0] font-bold text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            No hay bancos que coincidan
          </p>
          <p className="text-[#52526a] text-sm">
            {bancos.length === 0 ? 'Crea el primer banco con el botón de arriba.' : 'Ajusta los filtros o crea uno nuevo.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#08080f] border-b border-[#1e1e2e]">
                <tr>
                  {['Banco', 'Ubicación', 'Admin asignado', 'Contacto', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[#52526a]"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bancosFiltrados.map(b => (
                  <tr key={b.id} className="border-b border-[#1e1e2e] hover:bg-[#08080f]/50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#e8e8f0]">{b.nombre}</p>
                      <p className="text-xs text-[#52526a]">NIT {b.nit}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[#e8e8f0]">{b.ciudad}</p>
                      <p className="text-xs text-[#52526a]">{b.departamento}</p>
                    </td>
                    <td className="px-4 py-4">
                      {b.admin ? (
                        <>
                          <p className="text-[#e8e8f0]">{b.admin.nombre} {b.admin.apellido}</p>
                          <p className="text-xs text-[#52526a]">{b.admin.correo}</p>
                        </>
                      ) : (
                        <span className="text-xs text-[#52526a] italic">Sin admin</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-[#52526a]">📞 {b.telefono || '—'}</p>
                      <p className="text-xs text-[#52526a]">✉️ {b.correo || '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      {b.activo ? (
                        <span className="text-xs font-bold text-[#43e97b] bg-[rgba(67,233,123,0.1)] border border-[#43e97b]/30 px-2 py-1 rounded-full">
                          ● ACTIVO
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#52526a] bg-[#08080f] border border-[#1e1e2e] px-2 py-1 rounded-full">
                          ○ INACTIVO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirEditar(b)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#08080f] border border-[#1e1e2e] text-[#e8e8f0] hover:border-[#dc2626]/50 transition-all"
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        {b.activo && (
                          <button
                            onClick={() => desactivar(b.id, b.nombre)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[rgba(245,158,11,0.08)] border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[rgba(245,158,11,0.15)] transition-all"
                            title="Desactivar (soft delete)"
                          >
                            ⏸ Desactivar
                          </button>
                        )}
                        <button
                          onClick={() => eliminar(b.id, b.nombre)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[rgba(255,77,109,0.08)] border border-[#ff4d6d]/30 text-[#ff4d6d] hover:bg-[rgba(255,77,109,0.15)] transition-all"
                          title="Eliminar permanentemente"
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREAR / EDITAR BANCO                                    */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#1e1e2e] flex items-center justify-between sticky top-0 bg-[#111118] z-10">
              <h2 className="text-2xl font-extrabold text-[#e8e8f0]"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                {modoEdicion ? '✏️ Editar banco' : '🏦 Nuevo banco de sangre'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-[#52526a] hover:text-[#e8e8f0] text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorForm && (
                <div className="px-4 py-3 rounded-lg text-sm bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.25)] text-[#ff4d6d]">
                  ⚠️ {errorForm}
                </div>
              )}

              {/* Grid 2 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Nombre *" value={form.nombre} maxLength={150}
                       placeholder="Banco de Sangre Hospital San Vicente"
                       error={errBanco('nombre')}
                       onChange={v => setForm({...form, nombre: v})} />
                <Campo label="NIT *" value={form.nit} maxLength={11}
                       placeholder="900123456-7" inputMode="numeric"
                       error={errBanco('nit')}
                       onChange={v => setForm({...form, nit: v.replace(/[^\d-]/g, '')})} />
                <Campo label="Ciudad *" value={form.ciudad} maxLength={100}
                       placeholder="Medellín"
                       error={errBanco('ciudad')}
                       onChange={v => setForm({...form, ciudad: v})} />
                <Campo label="Departamento *" value={form.departamento} maxLength={100}
                       placeholder="Antioquia"
                       error={errBanco('departamento')}
                       onChange={v => setForm({...form, departamento: v})} />
              </div>

              <Campo label="Dirección *" value={form.direccion} maxLength={255}
                     placeholder="Calle 64 # 51D-154"
                     error={errBanco('direccion')}
                     onChange={v => setForm({...form, direccion: v})} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Teléfono" type="tel" value={form.telefono} maxLength={10}
                       placeholder="6044441333" inputMode="numeric"
                       error={errBanco('telefono')}
                       onChange={v => setForm({...form, telefono: v.replace(/\D/g, '').slice(0, 10)})} />
                <Campo label="Correo" type="email" value={form.correo} maxLength={150}
                       placeholder="contacto@banco.org"
                       error={errBanco('correo')}
                       onChange={v => setForm({...form, correo: v.trim()})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Latitud *" type="number" step="0.000001"
                       value={form.latitud}
                       placeholder="6.244203"
                       error={errBanco('latitud')}
                       onChange={v => setForm({...form, latitud: v})} />
                <Campo label="Longitud *" type="number" step="0.000001"
                       value={form.longitud}
                       placeholder="-75.581211"
                       error={errBanco('longitud')}
                       onChange={v => setForm({...form, longitud: v})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Hora apertura" type="time"
                       value={form.horarioApertura}
                       onChange={v => setForm({...form, horarioApertura: v})} />
                <Campo label="Hora cierre" type="time"
                       value={form.horarioCierre}
                       error={errBanco('horarioCierre')}
                       onChange={v => setForm({...form, horarioCierre: v})} />
              </div>

              {/* Selector de admin */}
              <div>
                <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                       style={{ fontFamily: "'Syne', sans-serif" }}>
                  Administrador del banco *
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.adminId}
                    onChange={(e) => setForm({...form, adminId: e.target.value})}
                    className={`flex-1 px-3 py-2.5 bg-[#08080f] border rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] ${errBanco('adminId') ? 'border-[#ff4d6d]' : 'border-[#1e1e2e]'}`}
                  >
                    <option value="">— Selecciona un admin —</option>
                    {admins.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} {a.apellido} · {a.correo}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={abrirModalAdmin}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[rgba(67,233,123,0.08)] border border-[#43e97b]/30 text-[#43e97b] hover:bg-[rgba(67,233,123,0.15)] transition-all whitespace-nowrap"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    + NUEVO ADMIN
                  </button>
                </div>
                <p className="text-[0.7rem] text-[#52526a] mt-1">
                  {admins.length} admin{admins.length !== 1 ? 's' : ''} de banco disponible{admins.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Toggle activo */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({...form, activo: e.target.checked})}
                  className="w-4 h-4 cursor-pointer accent-[#dc2626]"
                />
                <span className="text-sm text-[#e8e8f0]">Banco activo</span>
              </label>
            </div>

            <div className="p-6 border-t border-[#1e1e2e] flex justify-end gap-3 sticky bottom-0 bg-[#111118]">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:text-[#e8e8f0] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="px-5 py-2.5 rounded-lg text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/30 hover:shadow-xl transition-all disabled:opacity-40"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {guardando ? 'Guardando...' : modoEdicion ? 'ACTUALIZAR' : 'CREAR BANCO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODAL: CREAR ADMIN DE BANCO                                    */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {modalAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl max-w-xl w-full my-8">
            <div className="p-6 border-b border-[#1e1e2e] flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#e8e8f0]"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                👤 Nuevo administrador de banco
              </h2>
              <button
                onClick={() => setModalAdmin(false)}
                className="text-[#52526a] hover:text-[#e8e8f0] text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorAdmin && (
                <div className="px-4 py-3 rounded-lg text-sm bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.25)] text-[#ff4d6d]">
                  ⚠️ {errorAdmin}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Nombre *" value={formAdmin.nombre} maxLength={60}
                       placeholder="Laura"
                       error={errAdmin('nombre')}
                       onChange={v => setFormAdmin({...formAdmin, nombre: v})} />
                <Campo label="Apellido *" value={formAdmin.apellido} maxLength={60}
                       placeholder="Gómez"
                       error={errAdmin('apellido')}
                       onChange={v => setFormAdmin({...formAdmin, apellido: v})} />
              </div>

              <Campo label="Correo *" type="email" value={formAdmin.correo} maxLength={150}
                     placeholder="admin@banco.org"
                     error={errAdmin('correo')}
                     onChange={v => setFormAdmin({...formAdmin, correo: v.trim()})} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                         style={{ fontFamily: "'Syne', sans-serif" }}>
                    Tipo doc *
                  </label>
                  <select
                    value={formAdmin.tipoDocumento}
                    onChange={(e) => setFormAdmin({...formAdmin, tipoDocumento: e.target.value, numeroDocumento: ''})}
                    className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                  >
                    <option value="CC">CC · Cédula</option>
                    <option value="CE">CE · Extranjería</option>
                    <option value="PA">PA · Pasaporte</option>
                  </select>
                </div>
                <Campo label="Número doc *" value={formAdmin.numeroDocumento}
                       maxLength={DOCUMENTO[formAdmin.tipoDocumento].max}
                       inputMode={formAdmin.tipoDocumento === 'PA' ? 'text' : 'numeric'}
                       placeholder={formAdmin.tipoDocumento === 'PA' ? 'AB123456' : '1036123456'}
                       error={errAdmin('numeroDocumento')}
                       onChange={v => setFormAdmin({...formAdmin, numeroDocumento:
                         formAdmin.tipoDocumento === 'PA'
                           ? v.toUpperCase().replace(/[^A-Z0-9]/g, '')
                           : v.replace(/\D/g, '')})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Celular *" type="tel" value={formAdmin.celular} maxLength={10}
                       placeholder="3001234567" inputMode="numeric"
                       error={errAdmin('celular')}
                       onChange={v => setFormAdmin({...formAdmin, celular: v.replace(/\D/g, '').slice(0, 10)})} />
                <div>
                  <Campo label="Contraseña *" type="password" value={formAdmin.contrasena} maxLength={64}
                         error={errAdmin('contrasena')}
                         onChange={v => setFormAdmin({...formAdmin, contrasena: v})} />
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
                    {[
                      { ok: checksPass.largo, label: 'Mín. 8 caracteres' },
                      { ok: checksPass.mayuscula, label: 'Una mayúscula' },
                      { ok: checksPass.numero, label: 'Un número' },
                      { ok: checksPass.especial, label: 'Un especial (!@#$)' },
                    ].map(c => (
                      <p key={c.label} className={`text-[0.68rem] transition-colors ${c.ok ? 'text-[#43e97b]' : 'text-[#ff4d6d]'}`}>
                        {c.ok ? '✓' : '✗'} {c.label}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo label="Ciudad *" value={formAdmin.ciudad} maxLength={100}
                       placeholder="Medellín"
                       error={errAdmin('ciudad')}
                       onChange={v => setFormAdmin({...formAdmin, ciudad: v})} />
                <Campo label="Departamento *" value={formAdmin.departamento} maxLength={100}
                       placeholder="Antioquia"
                       error={errAdmin('departamento')}
                       onChange={v => setFormAdmin({...formAdmin, departamento: v})} />
              </div>
            </div>

            <div className="p-6 border-t border-[#1e1e2e] flex justify-end gap-3">
              <button
                onClick={() => setModalAdmin(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:text-[#e8e8f0] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={guardarAdmin}
                disabled={guardandoAdmin}
                className="px-5 py-2.5 rounded-lg text-sm font-extrabold text-white bg-gradient-to-r from-[#43e97b] to-[#22c55e] shadow-lg hover:shadow-xl transition-all disabled:opacity-40"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {guardandoAdmin ? 'Creando...' : 'CREAR ADMIN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ─── Componente Campo reutilizable ─────────────────────────────────────
function Campo({ label, value, onChange, type = 'text', step, placeholder, error, maxLength, inputMode }) {
  const largo = String(value ?? '').length;
  const cercaDelLimite = maxLength && largo >= maxLength * 0.9;

  return (
    <div>
      <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
             style={{ fontFamily: "'Syne', sans-serif" }}>
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 bg-[#08080f] border rounded-lg text-[#e8e8f0] text-sm outline-none placeholder:text-[#2a2a3e] ${error ? 'border-[#ff4d6d] focus:border-[#ff4d6d]' : 'border-[#1e1e2e] focus:border-[#dc2626]'}`}
      />
      <div className="flex justify-between gap-2 mt-1">
        <p className="text-[0.7rem] text-[#ff4d6d]">{error ? `✗ ${error}` : ''}</p>
        {maxLength && largo > 0 && (
          <p className={`text-[0.7rem] shrink-0 ${cercaDelLimite ? 'text-[#f59e0b]' : 'text-[#52526a]'}`}>
            {largo}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}