import { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import useSession from '../context/Auth/useSession';
import reservasService from '@api/services/reservas.service';
import espaciosService from '@api/services/espacios.service';
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiAlertCircle, FiAlertTriangle, FiFilter, FiRefreshCw, FiSearch, FiChevronDown, FiChevronUp, FiLogOut } from 'react-icons/fi';
import { toast } from 'sonner';

const EvaluarReservas = () => {
    const { session } = useSession();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtros
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split('T')[0]; });
    const [filtroFechaFin, setFiltroFechaFin] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 0).toISOString().split('T')[0]; });
    const [filtroEspacio, setFiltroEspacio] = useState('');
    const [filtroPersona, setFiltroPersona] = useState('');
    const [filtrosVisibles, setFiltrosVisibles] = useState(true);
    const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
    const [reservaIdToCancel, setReservaIdToCancel] = useState(null);
    const [cancelando, setCancelando] = useState(false);
    const [motivoCancelar, setMotivoCancelar] = useState('');
    const [conflictoModal, setConflictoModal] = useState(null);
    const [modalRechazarOpen, setModalRechazarOpen] = useState(false);
    const [reservaIdToRechazar, setReservaIdToRechazar] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [rechazando, setRechazando] = useState(false);

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        if (!session?.user?.id_empresa) {
            setError('No tienes una empresa asignada');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Cargar reservas y espacios en paralelo
            const [todasReservas, espaciosData] = await Promise.all([
                reservasService.getAllByEmpresa(session.user.id_empresa),
                espaciosService.getByEmpresa(session.user.id_empresa)
            ]);
            
            // Filtrar reservas según el rol del usuario
            let reservasFiltradas = todasReservas;
            const userTipo = session?.user?.tipo;
            
            if (userTipo === 'administrador') {
                // Administrador: laboratorios solo de su departamento
                const adminDepartamento = session?.user?.departamento;
                
                reservasFiltradas = todasReservas.filter(reserva => {
                    // Buscar el espacio de esta reserva
                    const espacio = espaciosData.find(e => e.id === reserva.espacioId);
                    if (!espacio) {
                        return false;
                    }
                    
                    // Si es laboratorio, debe ser del mismo departamento del administrador
                    if (espacio.tipo.toLowerCase() === 'laboratorio') {
                        return espacio.departamento === adminDepartamento;
                    }
                    
                    // Otros tipos de espacios son visibles para todos los administradores
                    return true;
                });
            }
            
            setReservas(reservasFiltradas.reverse());
            setCurrentPage(1);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            setError('Error al cargar las reservas');
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (reservaId) => {
        const reservaAprobar = reservas.find(r => r.id === reservaId);
        if (reservaAprobar) {
            const conflicto = reservas.find(r => {
                if (r.id === reservaId) return false;
                if (r.estado !== 'Reservada') return false;
                if (r.espacioId !== reservaAprobar.espacioId) return false;

                const fecha1 = new Date(reservaAprobar.fecha);
                const fecha2 = new Date(r.fecha);
                let mismoDia = false;
                if (r.tipo === 'permanente' || reservaAprobar.tipo === 'permanente') {
                    mismoDia = fecha1.getUTCDay() === fecha2.getUTCDay();
                } else {
                    mismoDia = reservasService.esMismaFecha(fecha1, fecha2);
                }
                if (!mismoDia) return false;

                const ini1 = reservasService.horaAMinutos(reservaAprobar.horaInicio);
                const fin1 = reservasService.horaAMinutos(reservaAprobar.horaFin);
                const ini2 = reservasService.horaAMinutos(r.horaInicio);
                const fin2 = reservasService.horaAMinutos(r.horaFin);
                return ini1 < fin2 && fin1 > ini2;
            });

            if (conflicto) {
                setConflictoModal({ reservaConflicto: conflicto, reservaAprobar });
                return;
            }
        }

        try {
            setLoadingAction(reservaId);
            await reservasService.updateEstado(reservaId, 'Reservada');
            toast.success('Reserva aprobada exitosamente');
            cargarReservas(); // Recargar la lista
        } catch (error) {
            console.error('Error al aprobar reserva:', error);
            toast.error('Error al aprobar la reserva');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleRechazar = (reservaId) => {
        setReservaIdToRechazar(reservaId);
        setMotivoRechazo('');
        setModalRechazarOpen(true);
    };

    const confirmarRechazar = async () => {
        if (!reservaIdToRechazar) return;
        if (!motivoRechazo.trim()) return;
        try {
            setRechazando(true);
            setLoadingAction(reservaIdToRechazar);
            await reservasService.updateEstado(reservaIdToRechazar, 'Cancelada', motivoRechazo.trim());
            toast.success('Reserva rechazada exitosamente');
            cargarReservas();
        } catch (error) {
            console.error('Error al rechazar reserva:', error);
            toast.error('Error al rechazar la reserva');
        } finally {
            setRechazando(false);
            setLoadingAction(null);
            setModalRechazarOpen(false);
            setReservaIdToRechazar(null);
            setMotivoRechazo('');
        }
    };

    const cerrarModalRechazar = () => {
        if (rechazando) return;
        setModalRechazarOpen(false);
        setReservaIdToRechazar(null);
        setMotivoRechazo('');
    };

    const handleCancelar = (reservaId) => {
        setReservaIdToCancel(reservaId);
        setMotivoCancelar('');
        setModalCancelarOpen(true);
    };

    const confirmarCancelar = async () => {
        if (!reservaIdToCancel) return;
        if (!motivoCancelar.trim()) return;
        try {
            setCancelando(true);
            setLoadingAction(reservaIdToCancel);
            await reservasService.updateEstado(reservaIdToCancel, 'Cancelada', motivoCancelar.trim());
            toast.success('Reserva cancelada exitosamente');
            cargarReservas();
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            toast.error('Error al cancelar la reserva');
        } finally {
            setCancelando(false);
            setLoadingAction(null);
            setModalCancelarOpen(false);
            setReservaIdToCancel(null);
            setMotivoCancelar('');
        }
    };

    const cerrarModalCancelar = () => {
        if (cancelando) return;
        setModalCancelarOpen(false);
        setReservaIdToCancel(null);
        setMotivoCancelar('');
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Reservada':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Cancelada':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Ejecutada':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getReservasFiltradas = () => {
        return reservas.filter(reserva => {
            // Filtro por estado
            if (filtroEstado && reserva.estado !== filtroEstado) return false;

            // Filtro por tipo
            if (filtroTipo && reserva.tipo !== filtroTipo) return false;

            // Filtro por fecha inicio
            if (filtroFechaInicio) {
                const fechaReserva = new Date(reserva.fecha);
                const fechaInicio = new Date(filtroFechaInicio);
                if (fechaReserva < fechaInicio) return false;
            }

            // Filtro por fecha fin
            if (filtroFechaFin) {
                const fechaReserva = new Date(reserva.fecha);
                const fechaFin = new Date(filtroFechaFin);
                if (fechaReserva > fechaFin) return false;
            }

            // Filtro por espacio
            if (filtroEspacio && !reserva.espacioNombre?.toLowerCase().includes(filtroEspacio.toLowerCase())) return false;

            // Filtro por persona
            if (filtroPersona && !reserva.personaNombre?.toLowerCase().includes(filtroPersona.toLowerCase())) return false;

            return true;
        });
    };

    const limpiarFiltros = () => {
        setFiltroEstado('');
        setFiltroTipo('');
        setFiltroFechaInicio('');
        setFiltroFechaFin('');
        setFiltroEspacio('');
        setFiltroPersona('');
        setCurrentPage(1);
    };

    const reservasFiltradas = getReservasFiltradas();

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return <FiAlertCircle className="w-4 h-4" />;
            case 'Reservada':
                return <FiCalendar className="w-4 h-4" />;
            case 'Cancelada':
                return <FiX className="w-4 h-4" />;
            case 'Ejecutada':
                return <FiCheck className="w-4 h-4" />;
            default:
                return <FiAlertCircle className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Revisión de reservas">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando reservas...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Revisión de reservas">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                        <button
                            onClick={cargarReservas}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Revisión de reservas">
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                <style>{`
                  @keyframes erFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                  @keyframes erFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
                  @keyframes erShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                `}</style>
                <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'erFloat1 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'erFloat2 10s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'erShimmer 5s ease-in-out infinite' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Revisión de Reservas</h1>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Gestiona y aprueba las solicitudes de reserva de espacios</p>
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
                            <span className="hidden sm:inline">Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            <div className="p-3 sm:p-6">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <FiCalendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-xl font-bold">{reservas.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FiCheck className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Ejecutadas</p>
                                <p className="text-xl font-bold">
                                    {reservas.filter(r => r.estado === 'Ejecutada').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <FiCalendar className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Aprobadas</p>
                                <p className="text-xl font-bold">
                                    {reservas.filter(r => r.estado === 'Reservada').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Pendientes</p>
                                <p className="text-xl font-bold">
                                    {reservas.filter(r => r.estado === 'Pendiente').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="bg-red-100 p-3 rounded-full">
                                <FiX className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Rechazadas</p>
                                <p className="text-xl font-bold">
                                    {reservas.filter(r => r.estado === 'Cancelada').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FiFilter className="w-5 h-5" /> Filtros
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={limpiarFiltros}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    <FiRefreshCw className="w-4 h-4 mr-1" /> Limpiar
                                </button>
                                <button
                                    onClick={() => setFiltrosVisibles(prev => !prev)}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    {filtrosVisibles ? (
                                        <><FiChevronUp className="w-4 h-4 mr-1" /> Contraer</>
                                    ) : (
                                        <><FiChevronDown className="w-4 h-4 mr-1" /> Expandir</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    {filtrosVisibles && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Reservada">Reservada</option>
                                <option value="Ejecutada">Ejecutada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                value={filtroTipo}
                                onChange={(e) => { setFiltroTipo(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="permanente">Permanente</option>
                                <option value="ocasional">Ocasional</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                            <input
                                type="date"
                                value={filtroFechaInicio}
                                onChange={(e) => { setFiltroFechaInicio(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                            <input
                                type="date"
                                value={filtroFechaFin}
                                onChange={(e) => { setFiltroFechaFin(e.target.value); setCurrentPage(1); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Espacio</label>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar espacio..."
                                    value={filtroEspacio}
                                    onChange={(e) => { setFiltroEspacio(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar persona..."
                                    value={filtroPersona}
                                    onChange={(e) => { setFiltroPersona(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                {/* Lista de reservas */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Todas las Reservas</h2>
                        <span className="text-sm text-gray-500">{reservasFiltradas.length} resultado(s)</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Espacio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Persona
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Motivo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            No hay reservas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    reservasFiltradas
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((reserva) => (
                                        <tr key={reserva.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {reserva.espacioNombre || 'Espacio no encontrado'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-900">
                                                        {reserva.personaNombre}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(reserva.fecha).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-900">
                                                        {reserva.horaInicio} - {reserva.horaFin}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(reserva.estado)}`}>
                                                    {getEstadoIcon(reserva.estado)}
                                                    <span className="ml-1">{reserva.estado}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs">
                                                    <span className="truncate block">{reserva.motivo || 'Sin motivo'}</span>
                                                    {reserva.estado === 'Cancelada' && reserva.motivo_cancelacion && (
                                                        <span className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                                                            <FiAlertCircle className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate" title={reserva.motivo_cancelacion}>{reserva.motivo_cancelacion}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {reserva.estado === 'Pendiente' ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAprobar(reserva.id)}
                                                            disabled={loadingAction === reserva.id}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                        >
                                                            {loadingAction === reserva.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                            ) : (
                                                                <FiCheck className="w-3 h-3 mr-1" />
                                                            )}
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            onClick={() => handleRechazar(reserva.id)}
                                                            disabled={loadingAction === reserva.id}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                                        >
                                                            {loadingAction === reserva.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                            ) : (
                                                                <FiX className="w-3 h-3 mr-1" />
                                                            )}
                                                            Rechazar
                                                        </button>
                                                    </div>
                                                ) : reserva.estado === 'Reservada' ? (
                                                    <button
                                                        onClick={() => handleCancelar(reserva.id)}
                                                        disabled={loadingAction === reserva.id || cancelando}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                                    >
                                                        {loadingAction === reserva.id ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                        ) : (
                                                            <FiX className="w-3 h-3 mr-1" />
                                                        )}
                                                        Cancelar
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-gray-500">
                                                        No requiere acción
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Controles de paginación */}
                    {reservasFiltradas.length > itemsPerPage && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, reservasFiltradas.length)}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, reservasFiltradas.length)}</span> de <span className="font-medium">{reservasFiltradas.length}</span> resultados
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                {Array.from({ length: Math.ceil(reservasFiltradas.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 border rounded text-sm font-medium ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reservasFiltradas.length / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(reservasFiltradas.length / itemsPerPage)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Indica el motivo por el cual se cancela esta reserva.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo de cancelación <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={motivoCancelar}
                                onChange={e => setMotivoCancelar(e.target.value)}
                                disabled={cancelando}
                                rows={4}
                                placeholder="Ej: El espacio requiere mantenimiento urgente..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:opacity-50"
                            />
                            {!motivoCancelar.trim() && (
                                <p className="mt-1 text-xs text-gray-400">Este campo es obligatorio para continuar.</p>
                            )}
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
                                onClick={confirmarCancelar}
                                disabled={cancelando || !motivoCancelar.trim()}
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

            {/* Modal motivo de rechazo */}
            {modalRechazarOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <FiX className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Rechazar reserva</h3>
                            </div>
                            <button onClick={cerrarModalRechazar} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={rechazando}>
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Indica el motivo por el cual se rechaza esta reserva. Este mensaje será visible para el solicitante.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo de cancelación <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={motivoRechazo}
                                onChange={e => setMotivoRechazo(e.target.value)}
                                disabled={rechazando}
                                rows={4}
                                placeholder="Ej: El espacio no está disponible para ese horario por mantenimiento..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:opacity-50"
                            />
                            {!motivoRechazo.trim() && (
                                <p className="mt-1 text-xs text-gray-400">Este campo es obligatorio para continuar.</p>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={cerrarModalRechazar}
                                disabled={rechazando}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Volver
                            </button>
                            <button
                                onClick={confirmarRechazar}
                                disabled={rechazando || !motivoRechazo.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {rechazando ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Rechazando...</>
                                ) : 'Confirmar rechazo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal espacio ocupado */}
            {conflictoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <FiAlertTriangle className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Espacio ocupado</h3>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                Este espacio ya tiene una reserva vigente para ese horario:
                            </p>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 space-y-1">
                                <div><span className="font-medium">Fecha:</span> {conflictoModal.reservaConflicto.fecha}</div>
                                <div><span className="font-medium">Horario:</span> {conflictoModal.reservaConflicto.horaInicio} – {conflictoModal.reservaConflicto.horaFin}</div>
                                <div><span className="font-medium">Reservado por:</span> {conflictoModal.reservaConflicto.personaNombre || 'N/A'}</div>
                            </div>
                            <p className="text-gray-500 text-xs mt-3">No se puede aprobar esta reserva mientras el espacio esté ocupado en ese horario.</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setConflictoModal(null)}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </DashboardLayout>
    );
};

export default EvaluarReservas;
