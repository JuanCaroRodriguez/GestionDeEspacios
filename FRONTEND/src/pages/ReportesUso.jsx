import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import espaciosService from '@api/services/espacios.service';
import reservasService from '@api/services/reservas.service';
import useSession from '../context/Auth/useSession';
import { toast } from 'sonner';
import { FiBarChart2, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiPieChart, FiTrendingUp, FiUsers, FiHome } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const ReportesUso = () => {
    const { session } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [espacios, setEspacios] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    
    // Filtros
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tipoEspacio, setTipoEspacio] = useState('todos');
    const [estadoReserva, setEstadoReserva] = useState('todos');
    const [selectedBloque, setSelectedBloque] = useState('todos');
    
    // Estadísticas
    const [estadisticas, setEstadisticas] = useState({
        totalEspacios: 0,
        totalReservas: 0,
        ocupacionPromedio: 0,
        espaciosMasUsados: [],
        reservasPorEstado: {},
        reservasPorTipo: {},
        tendenciasMensuales: []
    });

    // Colores para gráficas
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [reservas, espacios, fechaInicio, fechaFin, tipoEspacio, estadoReserva, selectedBloque]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const idEmpresa = session?.user?.id_empresa;
            if (!idEmpresa) {
                setError('No tienes una empresa asignada');
                return;
            }

            // Cargar espacios y reservas en paralelo
            const [espaciosData, reservasData] = await Promise.all([
                espaciosService.getByEmpresa(idEmpresa),
                reservasService.getAllByEmpresa(idEmpresa)
            ]);

            setEspacios(espaciosData);
            setReservas(reservasData);
            
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let reservasFiltradas = [...reservas];

        // Filtrar por fecha
        if (fechaInicio) {
            reservasFiltradas = reservasFiltradas.filter(r => 
                new Date(r.fecha) >= new Date(fechaInicio)
            );
        }
        if (fechaFin) {
            reservasFiltradas = reservasFiltradas.filter(r => 
                new Date(r.fecha) <= new Date(fechaFin)
            );
        }

        // Filtrar por tipo de espacio
        if (tipoEspacio !== 'todos') {
            const espaciosFiltrados = espacios.filter(e => e.tipo === tipoEspacio);
            const espacioIds = espaciosFiltrados.map(e => e.id);
            reservasFiltradas = reservasFiltradas.filter(r => espacioIds.includes(r.espacioId));
        }

        // Filtrar por estado
        if (estadoReserva !== 'todos') {
            reservasFiltradas = reservasFiltradas.filter(r => r.estado === estadoReserva);
        }

        // Filtrar por bloque
        if (selectedBloque !== 'todos') {
            const espaciosFiltrados = espacios.filter(e => e.bloque === selectedBloque);
            const espacioIds = espaciosFiltrados.map(e => e.id);
            reservasFiltradas = reservasFiltradas.filter(r => espacioIds.includes(r.espacioId));
        }

        setFilteredData(reservasFiltradas);
        calcularEstadisticas(reservasFiltradas);
    };

    const calcularEstadisticas = (reservasFiltradas) => {
        // Estadísticas básicas
        const totalReservas = reservasFiltradas.length;
        const totalEspacios = espacios.length;

        // Reservas por estado
        const reservasPorEstado = reservasFiltradas.reduce((acc, reserva) => {
            acc[reserva.estado] = (acc[reserva.estado] || 0) + 1;
            return acc;
        }, {});

        // Reservas por tipo de espacio
        const reservasPorTipo = {};
        reservasFiltradas.forEach(reserva => {
            const espacio = espacios.find(e => e.id === reserva.espacioId);
            if (espacio) {
                const tipo = espacio.tipo;
                reservasPorTipo[tipo] = (reservasPorTipo[tipo] || 0) + 1;
            }
        });

        // Espacios más usados
        const usoPorEspacio = {};
        reservasFiltradas.forEach(reserva => {
            const espacio = espacios.find(e => e.id === reserva.espacioId);
            if (espacio) {
                const nombre = `${espacio.tipo} - ${espacio.salon}`;
                usoPorEspacio[nombre] = (usoPorEspacio[nombre] || 0) + 1;
            }
        });

        const espaciosMasUsados = Object.entries(usoPorEspacio)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }));

        // Tendencias mensuales
        const tendenciasMensuales = {};
        reservasFiltradas.forEach(reserva => {
            const fecha = new Date(reserva.fecha);
            const mes = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
            tendenciasMensuales[mes] = (tendenciasMensuales[mes] || 0) + 1;
        });

        const tendenciasArray = Object.entries(tendenciasMensuales)
            .map(([mes, cantidad]) => ({ mes, cantidad }))
            .sort((a, b) => new Date(a.mes) - new Date(b.mes));

        // Ocupación promedio
        const diasUnicos = new Set(reservasFiltradas.map(r => r.fecha)).size;
        const ocupacionPromedio = diasUnicos > 0 ? (totalReservas / diasUnicos).toFixed(1) : 0;

        setEstadisticas({
            totalEspacios,
            totalReservas,
            ocupacionPromedio,
            espaciosMasUsados,
            reservasPorEstado,
            reservasPorTipo,
            tendenciasMensuales: tendenciasArray
        });
    };

    const limpiarFiltros = () => {
        setFechaInicio('');
        setFechaFin('');
        setTipoEspacio('todos');
        setEstadoReserva('todos');
        setSelectedBloque('todos');
    };

    const exportarDatos = () => {
        const csvContent = [
            ['Fecha', 'Espacio', 'Tipo', 'Estado', 'Usuario', 'Motivo'],
            ...filteredData.map(r => [
                r.fecha,
                espacios.find(e => e.id === r.espacioId)?.salon || 'N/A',
                espacios.find(e => e.id === r.espacioId)?.tipo || 'N/A',
                r.estado,
                r.personaNombre || 'N/A',
                r.motivo || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reportes_uso_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Datos exportados correctamente');
    };

    // Datos para gráficas
    const datosEstado = Object.entries(estadisticas.reservasPorEstado).map(([estado, cantidad]) => ({
        name: estado.charAt(0).toUpperCase() + estado.slice(1),
        value: cantidad
    }));

    const datosTipo = Object.entries(estadisticas.reservasPorTipo).map(([tipo, cantidad]) => ({
        name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        value: cantidad
    }));

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FiTrendingUp className="text-red-600 mr-2" />
                        <span className="text-red-800">{error}</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FiBarChart2 className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Reportes de Uso</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={limpiarFiltros}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Limpiar filtros
                        </button>
                        <button
                            onClick={exportarDatos}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiDownload className="w-4 h-4" />
                            Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiFilter className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de espacio</label>
                            <select
                                value={tipoEspacio}
                                onChange={(e) => setTipoEspacio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todos">Todos</option>
                                {[...new Set(espacios.map(e => e.tipo))].map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={estadoReserva}
                                onChange={(e) => setEstadoReserva(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todos">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Reservada">Reservada</option>
                                <option value="Ejecutada">Ejecutada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bloque</label>
                            <select
                                value={selectedBloque}
                                onChange={(e) => setSelectedBloque(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todos">Todos</option>
                                {[...new Set(espacios.map(e => e.bloque))].map(bloque => (
                                    <option key={bloque} value={bloque}>{bloque}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total de espacios</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEspacios}</p>
                            </div>
                            <FiHome className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total de reservas</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalReservas}</p>
                            </div>
                            <FiCalendar className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ocupación promedio</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.ocupacionPromedio}</p>
                                <p className="text-xs text-gray-500">reservas/día</p>
                            </div>
                            <FiTrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Reservas filtradas</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                            </div>
                            <FiFilter className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Gráfica de reservas por estado */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por Estado</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={datosEstado}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {datosEstado.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfica de reservas por tipo */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por Tipo de Espacio</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datosTipo}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Espacios más usados */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Espacios Más Usados</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas.espaciosMasUsados} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="nombre" type="category" width={200} />
                            <Tooltip />
                            <Bar dataKey="cantidad" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tendencias mensuales */}
                {estadisticas.tendenciasMensuales.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Mensuales</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={estadisticas.tendenciasMensuales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="cantidad" stroke="#8B5CF6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ReportesUso;
