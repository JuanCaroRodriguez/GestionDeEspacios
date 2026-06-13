import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import useSession from '../context/Auth/useSession';
import reservasService from '../api/services/reservas.service';
import { toast } from 'sonner';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './MisReservas.css';

const MisReservas = () => {
  const { session } = useSession();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [reservaIdToCancel, setReservaIdToCancel] = useState(null);
  const [cancelando, setCancelando] = useState(false);

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
    try {
      setCancelando(true);
      await reservasService.cancelReserva(reservaIdToCancel);
      toast.success('Reserva cancelada exitosamente');
      cargarMisReservas();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setCancelando(false);
      setModalCancelarOpen(false);
      setReservaIdToCancel(null);
    }
  };

  const cerrarModalCancelar = () => {
    if (cancelando) return;
    setModalCancelarOpen(false);
    setReservaIdToCancel(null);
  };

  const getEstadoBadge = (estado) => {
    const clases = {
      'Reservada': 'badge-reservada',
      'Pendiente': 'badge-pendiente',
      'Cancelada': 'badge-cancelada',
      'Ejecutada': 'badge-ejecutada'
    };
    
    return <span className={`badge ${clases[estado] || 'badge-default'}`}>{estado}</span>;
  };

  const getTipoBadge = (tipo) => {
    const clases = {
      'permanente': 'badge-permanente',
      'ocasional': 'badge-ocasional'
    };
    
    return <span className={`badge ${clases[tipo] || 'badge-default'}`}>{tipo}</span>;
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

  const reservasFiltradas = reservas.filter(reserva => {
    if (filtroEstado === 'todos') return true;
    return reserva.estado === filtroEstado;
  });

  if (loading) {
    return (
      <div className="mis-reservas-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-reservas-container">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={cargarMisReservas} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Mis Reservas">
      <div className="mis-reservas-container">
        <div className="mis-reservas-header-compact">
          <h2>Mis Reservas</h2>
          <p>Visualiza y gestiona todas tus reservas</p>
        </div>

      <div className="mis-reservas-filters">
        <div className="filter-group">
          <label htmlFor="filtro-estado">Filtrar por estado:</label>
          <select 
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos</option>
            <option value="Reservada">Reservadas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Cancelada">Canceladas</option>
            <option value="Ejecutada">Ejecutadas</option>
          </select>
        </div>

        <div className="stats">
          <span className="stat">
            Total: <strong>{reservas.length}</strong>
          </span>
          <span className="stat">
            Activas: <strong>{reservas.filter(r => r.estado === 'Reservada' || r.estado === 'Pendiente').length}</strong>
          </span>
        </div>
      </div>

      {reservasFiltradas.length === 0 ? (
        <div className="no-reservas">
          <h3>No tienes reservas</h3>
          <p>
            {filtroEstado === 'todos' 
              ? 'Aún no has realizado ninguna reserva. ¡Reserva un espacio ahora!'
              : `No tienes reservas con estado "${filtroEstado}".`
            }
          </p>
          {filtroEstado === 'todos' && (
            <button 
              onClick={() => window.location.href = '/consulta-espacios'}
              className="btn-primary"
            >
              Reservar Espacio
            </button>
          )}
        </div>
      ) : (
        <div className="reservas-table-container">
          <table className="reservas-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Espacio</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Motivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.map((reserva) => (
                <tr key={reserva.id} className={`reserva-row reserva-${reserva.estado.toLowerCase()}`}>
                  <td className="fecha-cell">
                    {formatearFecha(reserva.fecha)}
                  </td>
                  <td className="hora-cell">
                    {formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)}
                  </td>
                  <td className="espacio-cell">
                    <div className="espacio-info">
                      <span className="espacio-nombre">{reserva.espacioNombre}</span>
                    </div>
                  </td>
                  <td className="tipo-cell">
                    {getTipoBadge(reserva.tipo)}
                  </td>
                  <td className="estado-cell">
                    {getEstadoBadge(reserva.estado)}
                  </td>
                  <td className="motivo-cell">
                    <span className="motivo-text" title={reserva.motivo}>
                      {reserva.motivo.length > 30 
                        ? `${reserva.motivo.substring(0, 30)}...` 
                        : reserva.motivo
                      }
                    </span>
                  </td>
                  <td className="acciones-cell">
                    <div className="acciones-buttons">
                      {(reserva.estado === 'Reservada' || reserva.estado === 'Pendiente') && (
                        <button
                          onClick={() => handleCancelarReserva(reserva.id)}
                          className="btn-cancelar"
                          title="Cancelar reserva"
                        >
                          Cancelar
                        </button>
                      )}
                     
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación para cancelar reserva */}
      {modalCancelarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FiAlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cancelar reserva</h3>
              </div>
              <button
                onClick={cerrarModalCancelar}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={cancelando}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-gray-600 text-sm leading-relaxed">
                ¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={cerrarModalCancelar}
                disabled={cancelando}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={confirmarCancelarReserva}
                disabled={cancelando}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cancelando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Sí, cancelar reserva'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default MisReservas;
