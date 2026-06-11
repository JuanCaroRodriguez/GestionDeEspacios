import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import espaciosService from '@api/services/espacios.service';
import bloquesService from '@api/services/bloques.service';
import useSession from '../context/Auth/useSession';
import { toast } from 'sonner';
import { FiArrowLeft, FiCalendar, FiX, FiMap, FiMapPin, FiTag, FiUsers } from 'react-icons/fi';

const ConsultaDisponibilidad = () => {
    const { session } = useSession();
    const [espacios, setEspacios] = useState([]);
    const [bloques, setBloques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null); // { bloque, espacios }
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showUnavailableModal, setShowUnavailableModal] = useState(false);
    const [unavailableSpace, setUnavailableSpace] = useState(null);

    // Franjas horarias
    const timeSlots = [
        '7:00 - 7:50',
        '7:50 - 8:40', 
        '8:40 - 9:30',
        '9:30 - 10:20',
        '10:20 - 11:10',
        '11:10 - 12:00',
        '12:00 - 12:50',
        '1:00 - 1:50',
        '1:50 - 2:40',
        '2:40 - 3:30',
        '3:30 - 4:20',
        '4:20 - 5:10',
        '5:10 - 6:00',
        '6:00 - 6:50',
        '6:50 - 7:40',
        '7:40 - 8:30',
        '8:30 - 9:20',
        '9:20 - 10:00'
    ];

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Obtener fechas de la semana actual (lunes a sábado)
    const getWeekDates = (weekStart) => {
        const d = new Date(weekStart);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea 1
        const monday = new Date(d.setDate(diff));
        const weekDates = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    };

    const weekDates = getWeekDates(currentWeek);

    const prevWeek = () => {
        const prev = new Date(currentWeek);
        prev.setDate(prev.getDate() - 7);
        setCurrentWeek(prev);
    };

    const nextWeek = () => {
        const next = new Date(currentWeek);
        next.setDate(next.getDate() + 7);
        setCurrentWeek(next);
    };

    const isCurrentWeek = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentWeekStart = new Date(currentWeek);
        currentWeekStart.setHours(0, 0, 0, 0);
        // Normalizar ambos al lunes de su semana
        const todayWeekStart = getWeekDates(today)[0];
        const selectedWeekStart = getWeekDates(currentWeekStart)[0];
        todayWeekStart.setHours(0, 0, 0, 0);
        selectedWeekStart.setHours(0, 0, 0, 0);
        return todayWeekStart.getTime() === selectedWeekStart.getTime();
    };

    const formatWeekRange = () => {
        const start = weekDates[0];
        const end = weekDates[5];
        return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
    };

    // Función helper para obtener el nombre del bloque por ID
    const getNombreBloque = (bloqueId) => {
        const bloque = bloques.find(b => b.id === bloqueId);
        return bloque ? bloque.nombre : bloqueId;
    };

    // Cargar todos los espacios y bloques
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Obtener id_empresa del usuario logueado
                const idEmpresa = session?.user?.id_empresa;
                if (!idEmpresa) {
                    setError('No se encontró la empresa del usuario');
                    return;
                }
                
                // Cargar espacios y bloques en paralelo
                const [espaciosData, bloquesData] = await Promise.all([
                    espaciosService.getByEmpresa(idEmpresa),
                    bloquesService.getByIdEmpresa(idEmpresa)
                ]);
                
                setEspacios(espaciosData);
                setBloques(bloquesData);
                console.log('Espacios cargados:', espaciosData);
                console.log('Bloques cargados:', bloquesData);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    // Agrupar espacios por bloque
    const groupedEspacios = espacios.reduce((acc, espacio) => {
        const nombreBloque = getNombreBloque(espacio.bloque);
        if (!acc[nombreBloque]) {
            acc[nombreBloque] = [];
        }
        acc[nombreBloque].push(espacio);
        return acc;
    }, {});

    // Renderizar plano 2D general de todos los bloques
    const renderMain2D = () => {
        if (selectedBlock) {
            // Vista de salones de un bloque
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FiMapPin className="w-5 h-5" />
                            Espacios de {selectedBlock.bloque}
                        </h2>
                        <button
                            onClick={() => setSelectedBlock(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" />
                            Volver a plano general
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            {selectedBlock.espacios.map(espacio => (
                                <div
                                    key={espacio.id}
                                    onClick={() => selectSpace(espacio)}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                                        espacio.disponible
                                            ? 'border-green-400 bg-green-50 hover:bg-green-100'
                                            : 'border-red-400 bg-red-50 hover:bg-red-100'
                                    }`}
                                >
                                    <div className="flex flex-col justify-between h-full">
                                        <div>
                                            <div className="font-semibold text-sm text-gray-800">
                                                {espacio.nombre}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                <FiTag className="w-3 h-3 mr-1" />
                                                {espacio.tipo}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                <FiMapPin className="w-3 h-3 mr-1" />
                                                Salón {espacio.salon}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                <FiUsers className="w-3 h-3 mr-1" />
                                                Capacidad: {espacio.capacidad}
                                            </div>
                                        </div>
                                        <div className="text-center mt-3">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                espacio.disponible
                                                    ? 'bg-green-200 text-green-800'
                                                    : 'bg-red-200 text-red-800'
                                            }`}>
                                                {espacio.disponible ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Vista general de bloques con formas arquitectónicas
        const blocks = Object.keys(groupedEspacios).sort(); // Ordenar alfabéticamente
        
        // Layout dinámico adaptable
        const svgWidth = 350;
        const svgHeight = 320;
        const margin = 20;
        const streetWidth = 15;
        const minCellWidth = 80;
        const minCellHeight = 60;
        
        // Calcular columnas y filas óptimas
        const totalBlocks = blocks.length;
        let gridCols = Math.ceil(Math.sqrt(totalBlocks));
        let gridRows = Math.ceil(totalBlocks / gridCols);
        
        // Ajustar para mejor distribución
        while (gridCols > 1 && (gridCols - 1) * gridRows >= totalBlocks) {
            gridCols--;
            gridRows = Math.ceil(totalBlocks / gridCols);
        }
        
        // Calcular tamaño de celdas y espaciado
        const availableWidth = svgWidth - 2 * margin;
        const availableHeight = svgHeight - 2 * margin;
        const totalStreetWidthH = (gridRows - 1) * streetWidth;
        const totalStreetWidthV = (gridCols - 1) * streetWidth;
        
        const cellWidth = Math.max(minCellWidth, Math.floor((availableWidth - totalStreetWidthV) / gridCols));
        const cellHeight = Math.max(minCellHeight, Math.floor((availableHeight - totalStreetWidthH) / gridRows));
        
        // Generar posiciones automáticamente
        const blockLayouts = {};
        blocks.forEach((bloque, index) => {
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            blockLayouts[bloque] = {
                x: margin + col * (cellWidth + streetWidth),
                y: margin + row * (cellHeight + streetWidth),
                width: cellWidth,
                height: cellHeight,
                shape: 'rect'
            };
        });

        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiMap className="w-5 h-5" />
                    Plano General de Bloques
                </h2>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="relative bg-gray-50 rounded-lg" style={{ width: '100%', height: '400px' }}>
                        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="border border-gray-300 rounded">
                            {/* Calles dinámicas entre cuadrículas */}
                            {Array.from({ length: gridRows - 1 }).map((_, rowIndex) => (
                                <rect
                                    key={`street-h-${rowIndex}`}
                                    x={0}
                                    y={margin + (rowIndex + 1) * cellHeight + rowIndex * streetWidth}
                                    width={svgWidth}
                                    height={streetWidth}
                                    fill="#d1d5db"
                                />
                            ))}
                            {Array.from({ length: gridCols - 1 }).map((_, colIndex) => (
                                <rect
                                    key={`street-v-${colIndex}`}
                                    x={margin + (colIndex + 1) * cellWidth + colIndex * streetWidth}
                                    y={0}
                                    width={streetWidth}
                                    height={svgHeight}
                                    fill="#d1d5db"
                                />
                            ))}
                            
                            {/* Renderizar bloques en cuadrícula */}
                            {blocks.map(bloque => {
                                const layout = blockLayouts[bloque];
                                const espacios = groupedEspacios[bloque];
                                const activos = espacios.filter(e => e.disponible).length;
                                
                                return (
                                    <g key={bloque}>
                                        <rect
                                            x={layout.x}
                                            y={layout.y}
                                            width={layout.width}
                                            height={layout.height}
                                            fill="#dbeafe"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            className="cursor-pointer hover:fill-blue-200 transition-colors"
                                            onClick={() => setSelectedBlock({ bloque, espacios })}
                                            rx="4"
                                        />
                                        <text
                                            x={layout.x + layout.width/2}
                                            y={layout.y + layout.height/2 - 8}
                                            textAnchor="middle"
                                            className="text-sm font-bold fill-gray-800 pointer-events-none"
                                        >
                                            {bloque}
                                        </text>
                                        <text
                                            x={layout.x + layout.width/2}
                                            y={layout.y + layout.height/2 + 8}
                                            textAnchor="middle"
                                            className="text-xs fill-gray-600 pointer-events-none"
                                        >
                                            {espacios.length} salones
                                        </text>
                                        <text
                                            x={layout.x + layout.width/2}
                                            y={layout.y + layout.height/2 + 20}
                                            textAnchor="middle"
                                            className="text-xs fill-green-600 pointer-events-none"
                                        >
                                            {activos} activos
                                        </text>
                                    </g>
                                );
                            })}
                            
                                                    </svg>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded mr-2"></div>
                            <span className="text-gray-700">Bloque (clic para ver salones)</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    // Seleccionar espacio para ver horario
    const selectSpace = (space) => {
        // Verificar si el espacio está disponible
        if (!space.disponible) {
            setUnavailableSpace(space);
            setShowUnavailableModal(true);
            return;
        }
        
        setSelectedSpace(space);
        setShowSchedule(true);
    };

    // Volver a la lista de espacios
    const backToSpaces = () => {
        setShowSchedule(false);
        setSelectedSpace(null);
    };


    if (showSchedule && selectedSpace) {
        return (
            <DashboardLayout title="Horario del Espacio">
                <div className="p-6">
                    <div className="mb-6">
                        <button
                            onClick={backToSpaces}
                            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" />
                            Volver a espacios
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                            <FiCalendar className="w-5 h-5 mr-2" /> Horario - {selectedSpace.nombre}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {getNombreBloque(selectedSpace.bloque)} - Salón {selectedSpace.salon} | Capacidad: {selectedSpace.capacidad} personas
                        </p>
                    </div>

                    {/* Navegación de semanas */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={prevWeek}
                                disabled={isCurrentWeek()}
                                className={`px-4 py-2 rounded transition-colors text-sm flex items-center justify-center ${
                                    isCurrentWeek()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-500 text-white hover:bg-gray-600'
                                }`}
                            >
                                <FiArrowLeft className="w-4 h-4 mr-2" />
                            Semana anterior
                            </button>
                            <div className="text-sm font-medium text-gray-700 flex items-center justify-center">
                                <FiCalendar className="w-4 h-4 mr-2" />
                            Semana: {formatWeekRange()}
                            </div>
                            <button
                                onClick={nextWeek}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center justify-center"
                            >
                                Siguiente semana
                                <FiArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </button>
                        </div>
                    </div>

                    {/* Grid de horario */}
                    <div className="bg-white rounded-lg shadow overflow-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                        Franja Horaria
                                    </th>
                                    {days.map((day, index) => (
                                        <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                            <div>{day}</div>
                                            <div className="text-xs text-gray-400">
                                                {weekDates[index].getDate()} {weekDates[index].toLocaleString('default', { month: 'short' })}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {timeSlots.map((slot, slotIndex) => (
                                    <tr key={slotIndex} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border">
                                            {slot}
                                        </td>
                                        {days.map((day, dayIndex) => (
                                            <td key={`${dayIndex}-${slotIndex}`} className="px-2 py-2 text-center border">
                                                <div className="w-full h-8 bg-green-100 rounded hover:bg-green-200 cursor-pointer transition-colors flex items-center justify-center">
                                                    <span className="text-xs text-green-800">Disponible</span>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Leyenda:</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                                <span className="text-gray-700">Disponible</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                                <span className="text-gray-700">Ocupado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Consulta de Disponibilidad">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiCalendar className="w-6 h-6" />
                    Consulta de Disponibilidad
                </h1>

                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error de carga</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                        <span className="text-gray-600">Cargando espacios...</span>
                    </div>
                )}

                {/* Plano 2D general */}
                {!loading && !error && (
                    renderMain2D()
                )}

            {/* Modal de Espacio No Disponible */}
            {showUnavailableModal && unavailableSpace && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full transform transition-all">
                        <div className="text-center">
                            {/* Icono de no disponible */}
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Espacio No Disponible
                            </h3>
                            
                            
                            
                            <p className="text-gray-600 mb-6">
                                Este espacio no se encuentra disponible para consultas o reservas en este momento. 
                                Por favor, contacte al administrador del sistema para más información.
                            </p>
                            
                            <button
                                onClick={() => setShowUnavailableModal(false)}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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

export default ConsultaDisponibilidad;
