import { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import useSession from '../context/Auth/useSession';
import reservasService from '@api/services/reservas.service';
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';

const EvaluarReservas = () => {
    const { session } = useSession();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);

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
            const todasReservas = await reservasService.getAllByEmpresa(session.user.id_empresa);
            setReservas(todasReservas);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            setError('Error al cargar las reservas');
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (reservaId) => {
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

    const handleRechazar = async (reservaId) => {
        try {
            setLoadingAction(reservaId);
            await reservasService.updateEstado(reservaId, 'Cancelada');
            toast.success('Reserva rechazada exitosamente');
            cargarReservas(); // Recargar la lista
        } catch (error) {
            console.error('Error al rechazar reserva:', error);
            toast.error('Error al rechazar la reserva');
        } finally {
            setLoadingAction(null);
        }
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
            <DashboardLayout title="Evaluar Reservas">
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
            <DashboardLayout title="Evaluar Reservas">
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
        <DashboardLayout title="Evaluar Reservas">
            <div className="p-6">
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

                {/* Lista de reservas */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Todas las Reservas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
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
                                {reservas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            No hay reservas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    reservas.map((reserva) => (
                                        <tr key={reserva.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {reserva.espacioNombre || 'Espacio no encontrado'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-900">
                                                        {reserva.personaNombre}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(reserva.fecha).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-900">
                                                        {reserva.horaInicio} - {reserva.horaFin}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(reserva.estado)}`}>
                                                    {getEstadoIcon(reserva.estado)}
                                                    <span className="ml-1">{reserva.estado}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {reserva.motivo || 'Sin motivo'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EvaluarReservas;
