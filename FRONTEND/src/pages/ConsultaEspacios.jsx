import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import espaciosService from '@api/services/espacios.service';

const ConsultaEspacios = () => {
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('Laboratorio');
    const [expandedLocations, setExpandedLocations] = useState({});
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);

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

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // Cargar espacios según el tipo seleccionado
    useEffect(() => {
        const fetchEspacios = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await espaciosService.getByTipo(selectedType);
                setEspacios(data);
                console.log(`Espacios de tipo ${selectedType} cargados:`, data);
            } catch (err) {
                console.error('Error al cargar espacios:', err);
                setError('No se pudieron cargar los espacios. Por favor, intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchEspacios();
    }, [selectedType]);

    // Agrupar espacios por ubicación
    const groupedEspacios = espacios.reduce((acc, espacio) => {
        if (!acc[espacio.ubicacion]) {
            acc[espacio.ubicacion] = [];
        }
        acc[espacio.ubicacion].push(espacio);
        return acc;
    }, {});

    // Toggle expansión de ubicación
    const toggleLocation = (location) => {
        setExpandedLocations(prev => ({
            ...prev,
            [location]: !prev[location]
        }));
    };

    // Seleccionar espacio para ver horario
    const selectSpace = (space) => {
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
                            ← Volver a espacios
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            📅 Horario - {selectedSpace.nombre}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            📍 {selectedSpace.ubicacion} | 👥 Capacidad: {selectedSpace.capacidad} personas
                        </p>
                    </div>

                    {/* Grid de horario */}
                    <div className="bg-white rounded-lg shadow overflow-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                        Franja Horaria
                                    </th>
                                    {days.map(day => (
                                        <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                            {day}
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
        <DashboardLayout title="Consulta de Espacios">
            <div className="p-6">
                {/* Selector de tipo de espacio */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">🏢 Consulta de Espacios</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setSelectedType('Laboratorio')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                selectedType === 'Laboratorio'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🔬 Laboratorios
                        </button>
                        <button
                            onClick={() => setSelectedType('Aula')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                selectedType === 'Aula'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            📚 Aulas
                        </button>
                    </div>
                </div>

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

                {/* Lista de espacios agrupados por ubicación */}
                {!loading && !error && (
                    <div className="space-y-4">
                        {Object.keys(groupedEspacios).length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <div className="text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-lg font-medium">No se encontraron {selectedType.toLowerCase()}s</p>
                                    <p className="text-sm mt-1">No hay espacios disponibles de este tipo en este momento.</p>
                                </div>
                            </div>
                        ) : (
                            Object.entries(groupedEspacios).map(([ubicacion, espaciosList]) => (
                                <div key={ubicacion} className="bg-white rounded-lg shadow overflow-hidden">
                                    <button
                                        onClick={() => toggleLocation(ubicacion)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <svg 
                                                className={`w-5 h-5 mr-3 text-gray-500 transform transition-transform ${
                                                    expandedLocations[ubicacion] ? 'rotate-90' : ''
                                                }`} 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-900">📍 {ubicacion}</h3>
                                        </div>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {espaciosList.length} {espaciosList.length === 1 ? 'espacio' : 'espacios'}
                                        </span>
                                    </button>
                                    
                                    {expandedLocations[ubicacion] && (
                                        <div className="border-t border-gray-200">
                                            {espaciosList.map(espacio => (
                                                <div
                                                    key={espacio.id}
                                                    onClick={() => selectSpace(espacio)}
                                                    className="px-6 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{espacio.nombre}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                ID: {espacio.id} | Capacidad: {espacio.capacidad} personas
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-3 py-1 text-xs rounded-full ${
                                                                espacio.disponible 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {espacio.disponible ? 'Disponible' : 'No disponible'}
                                                            </span>
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ConsultaEspacios;
