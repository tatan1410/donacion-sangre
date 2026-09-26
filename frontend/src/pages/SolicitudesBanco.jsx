import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyTag from '../components/ui/UrgencyTag';
import { useAuth } from '../context/AuthContext';
import { bancoService, solicitudService } from '../services/api';

const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const URGENCIAS = ['ALTA', 'MEDIA', 'BAJA'];
const ESTADOS = ['ACTIVA', 'COMPLETADA', 'CANCELADA', 'VENCIDA'];

export default function SolicitudesBanco() {
  const { user } = useAuth();

  const [banco, setBanco] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('ACTIVA');

  // Modal crear/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [form, setForm] = useState({
    tipoSangre: 'O+',
    unidadesNecesarias: '',
    urgencia: 'ALTA',
    motivo: '',
    pacienteReferencia: '',
    fechaLimite: '',
    radioBusquedaKm: 50,
  });

  // ── Cargar banco y solicitudes ────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const resBancos = await bancoService.listarActivos();
        const miBanco = resBancos.data.find(b => b.admin?.id === user?.id);
        if (!miBanco) { setLoading(false); return; }
        setBanco(miBanco);
        const resSol = await solicitudService.listarPorBanco(miBanco.id);
        setSolicitudes(resSol.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) cargar();
  }, [user]);

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  const recargarSolicitudes = async () => {
    const resSol = await solicitudService.listarPorBanco(banco.id);
    setSolicitudes(resSol.data);
  };

  // ── Abrir modal crear ─────────────────────────────────────────────────────
  const abrirCrear = () => {
    setModoEdicion(false);
    setSolicitudSeleccionada(null);
    setForm({
      tipoSangre: 'O+',
      unidadesNecesarias: '',
      urgencia: 'ALTA',
      motivo: '',
      pacienteReferencia: '',
      fechaLimite: '',
      radioBusquedaKm: 50,
    });
    setModalAbierto(true);
  };

  // ── Abrir modal editar ────────────────────────────────────────────────────
  const abrirEditar = (s) => {
    setModoEdicion(true);
    setSolicitudSeleccionada(s);
    setForm({
      tipoSangre: s.tipoSangre,
      unidadesNecesarias: s.unidadesNecesarias,
      urgencia: s.urgencia,
      motivo: s.motivo || '',
      pacienteReferencia: s.pacienteReferencia || '',
      fechaLimite: s.fechaLimite || '',
      radioBusquedaKm: s.radioBusquedaKm || 50,
    });
    setModalAbierto(true);
  };
  // Fecha de hoy en hora local (no UTC)
  const hoyLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().split('T')[0];
  const fechaInvalida = form.fechaLimite && form.fechaLimite < hoyLocal;
  // ── Guardar ───────────────────────────────────────────────────────────────
  const guardar = async () => {
    if (!form.unidadesNecesarias) return;
    if (fechaInvalida) {
      mostrarMensaje('La fecha límite no puede ser anterior a hoy', 'error');
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        bancoId: banco.id,
        tipoSangre: form.tipoSangre,
        unidadesNecesarias: Number(form.unidadesNecesarias),
        urgencia: form.urgencia,
        motivo: form.motivo || null,
        pacienteReferencia: form.pacienteReferencia || null,
        fechaLimite: form.fechaLimite || null,
        radioBusquedaKm: Number(form.radioBusquedaKm),
      };

      if (modoEdicion) {
        await solicitudService.actualizar(solicitudSeleccionada.id, payload);
        mostrarMensaje('Solicitud actualizada correctamente');
      } else {
        await solicitudService.crear(payload);
        mostrarMensaje('Solicitud creada correctamente');
      }

      await recargarSolicitudes();
      setModalAbierto(false);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.errores ? Object.values(data.errores).join(' · ') : data?.mensaje || 'Error al guardar';
      mostrarMensaje(msg, 'error');
    } finally {
      setGuardando(false);
    }
  };

  // ── Cambiar estado ────────────────────────────────────────────────────────
  const cambiarEstado = async (id, estado) => {
    try {
      await solicitudService.cambiarEstado(id, estado);
      await recargarSolicitudes();
      mostrarMensaje(`Solicitud marcada como ${estado.toLowerCase()}`);
    } catch (err) {
      mostrarMensaje('Error al cambiar estado', 'error');
    }
  };

  // ── Filtrar ───────────────────────────────────────────────────────────────
  const solicitudesFiltradas = solicitudes.filter(s =>
    filtroEstado === 'TODAS' ? true : s.estado === filtroEstado
  );

  const colorBorde = { ALTA: 'border-l-[#ff4d6d]', MEDIA: 'border-l-[#f59e0b]', BAJA: 'border-l-[#43e97b]' };
  const colorEstado = {
    ACTIVA: 'bg-[rgba(67,233,123,0.1)] text-[#43e97b] border-[#43e97b]/30',
    COMPLETADA: 'bg-[rgba(59,130,246,0.1)] text-[#60a5fa] border-[#60a5fa]/30',
    CANCELADA: 'bg-[rgba(107,114,128,0.1)] text-[#9ca3af] border-[#9ca3af]/30',
    VENCIDA: 'bg-[rgba(220,38,38,0.1)] text-[#dc2626] border-[#dc2626]/30',
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-[#1e1e2e] rounded-2xl animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* Mensaje flash */}
      {mensaje && (
    <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-bold shadow-lg ${mensaje.tipo === 'error' ? 'bg-[#dc2626] text-white' : 'bg-[#43e97b] text-[#08080f]'
          }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#dc2626] text-xs font-bold uppercase tracking-wider mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {banco?.nombre}
          </p>
          <h1 className="text-4xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
            📋 Solicitudes
          </h1>
          <p className="text-[#52526a] mt-1">
            {solicitudes.filter(s => s.estado === 'ACTIVA').length} activas · {solicitudes.length} total
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          + Nueva solicitud
        </button>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['TODAS', ...ESTADOS].map(e => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filtroEstado === e
              ? 'bg-[#dc2626] border-[#dc2626] text-white'
              : 'bg-transparent border-[#1e1e2e] text-[#52526a] hover:border-[#dc2626]/50'
              }`}
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {e}
            {e !== 'TODAS' && (
              <span className="ml-1.5 opacity-60">
                {solicitudes.filter(s => s.estado === e).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {solicitudesFiltradas.length === 0 ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-[#e8e8f0] font-bold text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            No hay solicitudes {filtroEstado !== 'TODAS' ? filtroEstado.toLowerCase() + 's' : ''}
          </p>
          <p className="text-[#52526a] text-sm mb-6">
            Crea una solicitud cuando necesites sangre urgente
          </p>
          <button
            onClick={abrirCrear}
            className="px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            + Nueva solicitud
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {solicitudesFiltradas.map(s => (
            <div
              key={s.id}
              className={`bg-[#111118] border border-[#1e1e2e] border-l-4 ${colorBorde[s.urgencia]} rounded-2xl p-5`}
            >
              <div className="flex items-start justify-between gap-4">

                {/* Info principal */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <BloodTypeBadge tipo={s.tipoSangre} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <UrgencyTag nivel={s.urgencia.toLowerCase()} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colorEstado[s.estado]}`}>
                        {s.estado}
                      </span>
                    </div>
                    {s.motivo && (
                      <p className="text-sm text-[#52526a] truncate">💬 {s.motivo}</p>
                    )}
                    {s.fechaLimite && (
                      <p className="text-xs text-[#52526a] mt-1">
                        Límite: {new Date(s.fechaLimite).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Unidades */}
                <div className="text-center shrink-0">
                  <p className="text-3xl font-extrabold text-[#dc2626]"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {s.unidadesFaltantes}
                  </p>
                  <p className="text-xs text-[#52526a]">
                    de {s.unidadesNecesarias} uds
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 shrink-0">
                  {s.estado === 'ACTIVA' && (
                    <>
                      <button
                        onClick={() => abrirEditar(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#08080f] border border-[#1e1e2e] text-[#e8e8f0] hover:border-[#dc2626]/50 transition-all"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => cambiarEstado(s.id, 'COMPLETADA')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[rgba(67,233,123,0.1)] border border-[#43e97b]/30 text-[#43e97b] hover:bg-[rgba(67,233,123,0.2)] transition-all"
                      >
                        ✅ Completar
                      </button>
                      <button
                        onClick={() => cambiarEstado(s.id, 'CANCELADA')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:border-[#dc2626]/50 transition-all"
                      >
                        ✕ Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal crear/editar ──────────────────────────────────────────────── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {modoEdicion ? 'Editar solicitud' : 'Nueva solicitud de sangre'}
            </h3>

            <div className="space-y-4">

              {/* Tipo de sangre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Tipo de sangre requerido
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIPOS_SANGRE.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, tipoSangre: t })}
                      className={`py-2 rounded-lg text-sm font-bold transition-all border-2 ${form.tipoSangre === t
                        ? 'bg-gradient-to-br from-[#dc2626] to-[#991b1b] text-white border-[#dc2626]'
                        : 'bg-[#08080f] text-[#e8e8f0] border-[#1e1e2e] hover:border-[#dc2626]/50'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgencia */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Nivel de urgencia
                </label>
                <div className="flex gap-2">
                  {URGENCIAS.map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setForm({ ...form, urgencia: u })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${form.urgencia === u
                        ? u === 'ALTA' ? 'bg-[#ff4d6d] border-[#ff4d6d] text-white'
                          : u === 'MEDIA' ? 'bg-[#f59e0b] border-[#f59e0b] text-white'
                            : 'bg-[#43e97b] border-[#43e97b] text-[#08080f]'
                        : 'bg-[#08080f] border-[#1e1e2e] text-[#52526a] hover:border-[#dc2626]/50'
                        }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unidades */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Unidades necesarias
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.unidadesNecesarias}
                  onChange={e => setForm({ ...form, unidadesNecesarias: e.target.value })}
                  placeholder="Ej: 5"
                  className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Motivo (opcional)
                </label>
                <textarea
                  value={form.motivo}
                  onChange={e => setForm({ ...form, motivo: e.target.value })}
                  placeholder="Ej: Paciente en cirugía de emergencia"
                  rows={2}
                  maxLength={500}
                  className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] resize-none"
                />
                <p className={`text-[0.7rem] mt-1 text-right ${form.motivo.length >= 450 ? 'text-[#f59e0b]' : 'text-[#52526a]'}`}>
                  {form.motivo.length}/500
                </p>
              </div>

              {/* Paciente referencia */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Referencia paciente (opcional)
                </label>
                <input
                  type="text"
                  value={form.pacienteReferencia}
                  onChange={e => setForm({ ...form, pacienteReferencia: e.target.value })}
                  placeholder="Anónimo"
                  maxLength={100}
                  className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                />
                <p className={`text-[0.7rem] mt-1 text-right ${form.pacienteReferencia.length >= 90 ? 'text-[#f59e0b]' : 'text-[#52526a]'}`}>
                  {form.pacienteReferencia.length}/100
                </p>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Fecha límite (opcional)
                </label>
                <input
                  type="date"
                  value={form.fechaLimite}
                  onChange={e => setForm({ ...form, fechaLimite: e.target.value })}
                  min={hoyLocal}
                  className={`w-full px-4 py-2.5 bg-[#08080f] border rounded-xl text-[#e8e8f0] text-sm outline-none ${fechaInvalida ? 'border-[#ff4d6d] focus:border-[#ff4d6d]' : 'border-[#1e1e2e] focus:border-[#dc2626]'}`}
                />
                {fechaInvalida && (
                  <p className="text-[0.7rem] mt-1.5 text-[#ff4d6d]">
                    ✗ La fecha no puede ser anterior a hoy
                  </p>
                )}
              </div>

              {/* Radio búsqueda */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Radio de búsqueda de donantes: <span className="text-[#e8e8f0]">{form.radioBusquedaKm} km</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={form.radioBusquedaKm}
                  onChange={e => setForm({ ...form, radioBusquedaKm: Number(e.target.value) })}
                  className="w-full accent-[#dc2626]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#e8e8f0] bg-[#1e1e2e] hover:bg-[#2a2a3e] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando || !form.unidadesNecesarias}
                className="flex-1 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] disabled:opacity-50 transition-all"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Crear solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}