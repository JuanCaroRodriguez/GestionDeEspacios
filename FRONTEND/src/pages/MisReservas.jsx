import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import useSession from '../context/Auth/useSession';
import reservasService from '../api/services/reservas.service';
import { toast } from 'sonner';
import { FiAlertTriangle, FiX, FiCalendar, FiClock, FiMapPin, FiLogOut , FiInbox, FiSearch } from 'react-icons/fi';

const MisReservas = () => {
  const { session } = useSession();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [reservaIdToCancel, setReservaIdToCancel] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    cargarMisReservas();
  }, [session]);

  const cargarMisReservas = async () => {
    if (!session?.user?.id) {
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const reservasData = await reservasService.getByPersona(session.user.id);
      setReservas(reservasData.reverse());
    } catch (error) {
      console.error('Error al cargar mis reservas:', error);
      setError('Error al cargar las reservas');
      toast.error('Error al cargar tus reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = (reservaId) => {
    setReservaIdToCancel(reservaId);
    setModalCancelarOpen(true);
  };

  const confirmarCancelarReserva = async () => {
    if (!reservaIdToCancel) return;
    if (!motivoCancelacion.trim()) return;
    try {
      setCancelando(true);
      await reservasService.updateEstado(reservaIdToCancel, 'Cancelada', motivoCancelacion.trim());
      toast.success('Reserva cancelada exitosamente');
      cargarMisReservas();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setCancelando(false);
      setModalCancelarOpen(false);
      setReservaIdToCancel(null);
      setMotivoCancelacion('');
    }
  };

  const cerrarModalCancelar = () => {
    if (cancelando) return;
    setModalCancelarOpen(false);
    setReservaIdToCancel(null);
    setMotivoCancelacion('');
  };

  const estadoConfig = {
    'Reservada': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
    'Pendiente': { bg: '#fef9c3', color: '#ca8a04', border: '#fde047' },
    'Cancelada': { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
    'Ejecutada': { bg: '#e0e7ff', color: '#4338ca', border: '#a5b4fc' },
  };

  const getEstadoBadge = (estado) => {
    const cfg = estadoConfig[estado] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    return (
      <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
        {estado}
      </span>
    );
  };

  const getTipoBadge = (tipo) => {
    const cfg = tipo === 'permanente'
      ? { bg: '#f3e8ff', color: '#7c3aed', border: '#d8b4fe' }
      : { bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' };
    return (
      <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'capitalize', letterSpacing: '0.03em', backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
        {tipo}
      </span>
    );
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    // Convertir formato 24h a 12h AM/PM para mostrar
    const [hours, minutes] = hora.split(':');
    const hour = parseInt(hours);
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes}`;
  };

  const cambiarFiltro = (valor) => { setFiltroEstado(valor); setCurrentPage(1); };
  const cambiarBusqueda = (valor) => { setSearchQuery(valor); setCurrentPage(1); };
  const toggleSearch = () => { setSearchOpen(o => { if (o) { setSearchQuery(''); setCurrentPage(1); } return !o; }); };

  const reservasFiltradas = reservas.filter(reserva => {
    const pasaEstado = filtroEstado === 'todos' || reserva.estado === filtroEstado;
    const q = searchQuery.toLowerCase().trim();
    const pasaBusqueda = !q || reserva.espacioNombre?.toLowerCase().includes(q) || reserva.motivo?.toLowerCase().includes(q);
    return pasaEstado && pasaBusqueda;
  });

  const totalPages = Math.max(1, Math.ceil(reservasFiltradas.length / ITEMS_PER_PAGE));
  const reservasPaginadas = reservasFiltradas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <DashboardLayout title="Mis Reservas">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus reservas...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mis Reservas">
        <div className="flex items-center justify-center h-full">
          <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={cargarMisReservas} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: 'Total', count: reservas.length, color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', filter: 'todos' },
    { label: 'Ejecutadas', count: reservas.filter(r => r.estado === 'Ejecutada').length, color: '#4338ca', bg: '#fee2e2', border: 'a5b4fc', filter: 'Ejecutada' },
    { label: 'Reservadas', count: reservas.filter(r => r.estado === 'Reservada').length, color: '#16a34a', bg: '#dcfce7', border: '#86efac', filter: 'Reservada' },
    { label: 'Pendientes', count: reservas.filter(r => r.estado === 'Pendiente').length, color: '#ca8a04', bg: '#fef9c3', border: '#fde047', filter: 'Pendiente' },
    { label: 'Canceladas', count: reservas.filter(r => r.estado === 'Cancelada').length, color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', filter: 'Cancelada' },
  ];

  const filtroTabs = [
    { value: 'todos', label: 'Todos' },
    { value: 'Ejecutada', label: 'Ejecutadas' },
    { value: 'Reservada', label: 'Reservadas' },
    { value: 'Pendiente', label: 'Pendientes' },
    { value: 'Cancelada', label: 'Canceladas' },
  ];

  return (
    <DashboardLayout title="Mis Reservas">
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
        <style>{`
          @keyframes mrFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
          @keyframes mrFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
          @keyframes mrShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
        `}</style>

        {/* Page Header Banner */}
        <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'mrFloat1 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'mrFloat2 10s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'mrShimmer 5s ease-in-out infinite' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Mis Reservas </h1>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Visualiza y gestiona todas tus reservas activas e historial</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("session");
                window.location.href = "/auth";
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FiLogOut style={{ width: '16px', height: '16px' }} />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {statCards.map((s, i) => (
            <div
              key={i}
              onClick={() => cambiarFiltro(s.filter)}
              style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${filtroEstado === s.filter ? s.border : '#f1f5f9'}`, cursor: 'pointer', transition: 'box-shadow 0.15s', outline: filtroEstado === s.filter ? `2px solid ${s.border}` : 'none' }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.25rem' }}>{s.label}</div>
              <div style={{ marginTop: '0.5rem', height: '3px', borderRadius: '9999px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${reservas.length ? Math.round((s.count / reservas.length) * 100) : 0}%`, backgroundColor: s.color, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs + Search + Pagination — same row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: searchOpen ? '0.5rem' : '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {filtroTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => cambiarFiltro(tab.value)}
                style={{ padding: '0.35rem 0.875rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', background: filtroEstado === tab.value ? '#1d4ed8' : 'white', color: filtroEstado === tab.value ? 'white' : '#64748b', borderColor: filtroEstado === tab.value ? '#1d4ed8' : '#e2e8f0' }}
              >
                {tab.label}
              </button>
            ))}
            {/* Search toggle button */}
            <button
              onClick={toggleSearch}
              title="Buscar reserva"
              style={{ width: '2rem', height: '2rem', borderRadius: '9999px', border: '1.5px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: searchOpen ? '#1d4ed8' : 'white', color: searchOpen ? 'white' : '#64748b', borderColor: searchOpen ? '#1d4ed8' : '#e2e8f0', flexShrink: 0 }}
            >
              <FiSearch size={13} />
            </button>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#475569', cursor: currentPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700', transition: 'all 0.15s' }}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', border: '1.5px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.15s', background: currentPage === page ? '#1d4ed8' : 'white', color: currentPage === page ? 'white' : '#64748b', borderColor: currentPage === page ? '#1d4ed8' : '#e2e8f0' }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#475569', cursor: currentPage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700', transition: 'all 0.15s' }}
              >›</button>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.25rem', whiteSpace: 'nowrap' }}>
                {reservasFiltradas.length} resultado{reservasFiltradas.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <FiSearch size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              autoFocus
              type="text"
              placeholder="Buscar por espacio o motivo..."
              value={searchQuery}
              onChange={e => cambiarBusqueda(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 2.5rem 0.6rem 2.25rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', background: 'white', outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'border-color 0.15s' }}
              onFocus={e => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
            />
            {searchQuery && (
              <button
                onClick={() => cambiarBusqueda('')}
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        )}

        {/* Cards or Empty */}
        {reservasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <FiInbox size={22} color="#94a3b8" />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '700', color: '#374151' }}>
              {filtroEstado === 'todos' ? 'No tienes reservas aún' : `Sin reservas "${filtroEstado}"`}
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#94a3b8' }}>
              {filtroEstado === 'todos' ? '¡Reserva un espacio para comenzar!' : 'Prueba con otro filtro.'}
            </p>
            {filtroEstado === 'todos' && (
              <button
                onClick={() => window.location.href = '/dashboard/consulta-espacios'}
                style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', border: 'none', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Consultar disponibilidad
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {reservasPaginadas.map((reserva) => {
              const cfg = estadoConfig[reserva.estado] || { color: '#6b7280', border: '#d1d5db' };
              const canCancel = reserva.estado === 'Reservada' || reserva.estado === 'Pendiente';
              return (
                <div
                  key={reserva.id}
                  style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', borderLeft: `4px solid ${cfg.color}`, overflow: 'hidden' }}
                >
                  <div style={{ padding: '1.125rem' }}>
                    {/* Space + Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                        <FiMapPin size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.925rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reserva.espacioNombre}</span>
                      </div>
                      {getEstadoBadge(reserva.estado)}
                    </div>

                    {/* Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <FiCalendar size={12} color="#94a3b8" />
                      <span style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'capitalize' }}>{formatearFecha(reserva.fecha)}</span>
                    </div>

                    {/* Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                      <FiClock size={12} color="#94a3b8" />
                      <span style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace' }}>
                        {formatearHora(reserva.horaInicio)} – {formatearHora(reserva.horaFin)}
                      </span>
                    </div>

                    {/* Type + Motive */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: (canCancel || (reserva.estado === 'Cancelada' && reserva.motivo_cancelacion)) ? '0.625rem' : 0, gap: '0.5rem' }}>
                      {getTipoBadge(reserva.tipo)}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={reserva.motivo}>
                        {reserva.motivo}
                      </span>
                    </div>

                    {/* Motivo cancelación */}
                    {reserva.estado === 'Cancelada' && reserva.motivo_cancelacion && (
                      <div style={{ marginBottom: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                        <FiAlertTriangle size={12} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.125rem' }}>Motivo cancelación</span>
                          <span style={{ fontSize: '0.75rem', color: '#b91c1c', lineHeight: '1.3' }}>{reserva.motivo_cancelacion}</span>
                        </div>
                      </div>
                    )}

                    {/* Cancel Button */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelarReserva(reserva.id)}
                        style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #fca5a5', borderRadius: '0.5rem', background: 'transparent', color: '#dc2626', fontSize: '0.775rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Cancelar reserva
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de confirmación para cancelar reserva */}
        {modalCancelarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <FiAlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancelar reserva</h3>
                </div>
                <button onClick={cerrarModalCancelar} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={cancelando}>
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Indica el motivo por el cual deseas cancelar esta reserva.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de cancelación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivoCancelacion}
                  onChange={e => setMotivoCancelacion(e.target.value)}
                  disabled={cancelando}
                  rows={4}
                  placeholder="Ej: Ya no necesito el espacio para esa fecha..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:opacity-50"
                />
                {!motivoCancelacion.trim() && (
                  <p className="mt-1 text-xs text-gray-400">Este campo es obligatorio para continuar.</p>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button onClick={cerrarModalCancelar} disabled={cancelando} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Volver
                </button>
                <button onClick={confirmarCancelarReserva} disabled={cancelando || !motivoCancelacion.trim()} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {cancelando ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Cancelando...</>
                  ) : 'Sí, cancelar reserva'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MisReservas;
