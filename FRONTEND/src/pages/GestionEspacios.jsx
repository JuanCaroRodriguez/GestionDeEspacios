import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import espaciosService from '@api/services/espacios.service';

const GestionEspacios = () => {
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        tipo: '',
        capacidad: '',
        ubicacion: ''
    });
    const [editFormData, setEditFormData] = useState({
        id: '',
        nombre: '',
        tipo: '',
        capacidad: '',
        ubicacion: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filterUbicacion, setFilterUbicacion] = useState('');

    // Cargar datos desde la API
    useEffect(() => {
        const fetchEspacios = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await espaciosService.getAll();
                setEspacios(data);
                console.log('Espacios cargados:', data);
            } catch (err) {
                console.error('Error al cargar espacios:', err);
                setError('No se pudieron cargar los espacios. Por favor, intente nuevamente.');
                
            } finally {
                setLoading(false);
            }
        };

        fetchEspacios();
    }, []);

    const handleCreateEspacio = async () => {
        // Validaciones
        if (!formData.id || !formData.nombre || !formData.tipo || !formData.capacidad || !formData.ubicacion) {
            alert('Por favor complete todos los campos');
            return;
        }

        // Verificar si el ID ya existe
        if (espacios.some(espacio => espacio.id === formData.id)) {
            alert('El ID ya está en uso');
            return;
        }

        try {
            // Crear nuevo espacio en la API
            const nuevoEspacio = {
                ...formData,
                capacidad: parseInt(formData.capacidad),
                disponible: true
            };

            const response = await espaciosService.create(nuevoEspacio);
            console.log('Espacio creado:', response);
            
            // Actualizar estado local
            setEspacios([...espacios, response]);
            setShowModal(false);
            setFormData({
                id: '',
                nombre: '',
                tipo: '',
                capacidad: '',
                ubicacion: ''
            });
            
            alert('Espacio creado exitosamente');
        } catch (error) {
            console.error('Error al crear espacio:', error);
            alert('Error al crear el espacio. Por favor, intente nuevamente.');
        }
    };

    const handleToggleDisponibilidad = async (id) => {
        try {
            await espaciosService.toggleDisponibilidad(id);
            // Actualizar estado local
            setEspacios(espacios.map(espacio => 
                espacio.id === id ? { ...espacio, disponible: !espacio.disponible } : espacio
            ));
            console.log('Disponibilidad actualizada para el espacio:', id);
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            alert('Error al cambiar la disponibilidad del espacio');
        }
    };

    const handleDeleteEspacio = async (id) => {
        if (confirm('¿Está seguro de que desea eliminar este espacio?')) {
            try {
                await espaciosService.delete(id);
                // Actualizar estado local
                setEspacios(espacios.filter(espacio => espacio.id !== id));
                console.log('Espacio eliminado:', id);
                alert('Espacio eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar espacio:', error);
                alert('Error al eliminar el espacio');
            }
        }
    };

    const handleEditEspacio = (espacio) => {
        setEditFormData({
            id: espacio.id,
            nombre: espacio.nombre,
            tipo: espacio.tipo,
            capacidad: espacio.capacidad.toString(),
            ubicacion: espacio.ubicacion
        });
        setShowEditModal(true);
    };

    const handleUpdateEspacio = async () => {
        // Validaciones
        if (!editFormData.nombre || !editFormData.tipo || !editFormData.capacidad || !editFormData.ubicacion) {
            alert('Por favor complete todos los campos');
            return;
        }

        try {
            // Actualizar espacio en la API
            const espacioActualizado = {
                ...editFormData,
                capacidad: parseInt(editFormData.capacidad)
            };

            const response = await espaciosService.update(editFormData.id, espacioActualizado);
            console.log('Espacio actualizado:', response);
            
            // Actualizar estado local
            setEspacios(espacios.map(espacio => 
                espacio.id === editFormData.id ? response : espacio
            ));
            setShowEditModal(false);
            setEditFormData({
                id: '',
                nombre: '',
                tipo: '',
                capacidad: '',
                ubicacion: ''
            });
            
            alert('Espacio actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar espacio:', error);
            alert('Error al actualizar el espacio. Por favor, intente nuevamente.');
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Filtrar espacios por ubicación
    const filteredEspacios = espacios.filter(espacio =>
        espacio.ubicacion.toLowerCase().includes(filterUbicacion.toLowerCase())
    );

    // Calcular paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEspacios = filteredEspacios.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEspacios.length / itemsPerPage);

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Resetear a página 1 cuando cambia el filtro
    const handleFilterChange = (e) => {
        setFilterUbicacion(e.target.value);
        setCurrentPage(1);
    };

    return (
        <DashboardLayout title="Gestión de Espacios">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">🏢 Gestión de Espacios</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            🔄 Actualizar
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            ➕ Crear Espacio
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

            {/* Filtro de búsqueda */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por ubicación
                        </label>
                        <input
                            type="text"
                            value={filterUbicacion}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Bloque A, Edificio B..."
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilterUbicacion('');
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Limpiar filtro
                        </button>
                    </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    Mostrando {filteredEspacios.length} de {espacios.length} espacios
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{espacios.length}</div>
                    <div className="text-sm text-gray-600">Total Espacios</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">
                        {espacios.filter(e => e.tipo === 'Laboratorio').length}
                    </div>
                    <div className="text-sm text-gray-600">Laboratorios</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">
                        {espacios.filter(e => e.tipo === 'Aula').length}
                    </div>
                    <div className="text-sm text-gray-600">Aulas</div>
                </div>
            </div>

            {/* Lista de Espacios */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Capacidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                                            <span>Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentEspacios.map((espacio) => (
                                    <tr key={espacio.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {espacio.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {espacio.nombre}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {espacio.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {espacio.capacidad}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {espacio.ubicacion}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditEspacio(espacio)}
                                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEspacio(espacio.id)}
                                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Anterior
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === page
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Crear Espacio */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Espacio</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ID del Espacio
                                </label>
                                <input
                                    type="text"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: lab-sistemas-001"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Espacio
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Laboratorio de Sistemas"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Espacio
                                </label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccionar tipo</option>
                                    <option value="Laboratorio">Laboratorio</option>
                                    <option value="Aula">Aula</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacidad de personas
                                </label>
                                <input
                                    type="number"
                                    name="capacidad"
                                    value={formData.capacidad}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: 30"
                                    min="1"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    name="ubicacion"
                                    value={formData.ubicacion}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Edificio A - Piso 2"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateEspacio}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Crear Espacio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Espacio */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Espacio</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ID del Espacio
                                </label>
                                <input
                                    type="text"
                                    name="id"
                                    value={editFormData.id}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                    readOnly
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Espacio
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={editFormData.nombre}
                                    onChange={handleEditInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Laboratorio de Sistemas"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Espacio
                                </label>
                                <select
                                    name="tipo"
                                    value={editFormData.tipo}
                                    onChange={handleEditInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="Laboratorio">Laboratorio</option>
                                    <option value="Aula">Aula</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacidad de personas
                                </label>
                                <input
                                    type="number"
                                    name="capacidad"
                                    value={editFormData.capacidad}
                                    onChange={handleEditInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: 30"
                                    min="1"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    name="ubicacion"
                                    value={editFormData.ubicacion}
                                    onChange={handleEditInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Edificio A - Piso 2"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateEspacio}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Actualizar Espacio
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </DashboardLayout>
    );
};

export default GestionEspacios;
