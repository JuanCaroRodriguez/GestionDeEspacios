import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import administradoresService from '@api/services/administradores.service';
import usuariosService from '@api/services/usuarios.service';

const GestionAdministradores = () => {
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editAdminId, setEditAdminId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        contraseña: ''
    });
    const [filtros, setFiltros] = useState({
        busqueda: ''
    });

    // Cargar datos desde la API
    useEffect(() => {
        const fetchAdministradores = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await administradoresService.getAll();
                setAdministradores(data);
                console.log('Administradores cargados:', data);
            } catch (err) {
                console.error('Error al cargar administradores:', err);
                setError('No se pudieron cargar los administradores. Por favor, intente nuevamente.');
                // Datos de fallback para desarrollo
                setAdministradores([
                    {
                        id: 'administrador-001',
                        nombre: 'Administrador de Sistemas',
                        email: 'administrador@gestion.com',
                        tipo: 'administrador',
                        estado: 'activo',
                        permisos: ['evaluar_reservas_laboratorios'],
                        fechaRegistro: '2024-01-10',
                        ultimaSesion: '2024-05-06 09:00'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchAdministradores();
    }, []);

    const handleEditAdministrador = (administrador) => {
        setEditMode(true);
        setEditAdminId(administrador.id);
        setFormData({
            nombre: administrador.nombre,
            email: administrador.email,
            contraseña: ''
        });
        setShowModal(true);
    };

    const handleCreateAdministrador = async () => {
        // Validaciones
        if (!formData.nombre || !formData.email || !formData.contraseña) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Por favor ingrese un email válido');
            return;
        }

        // Validar contraseña (mínimo 6 caracteres)
        if (formData.contraseña.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Verificar si el email ya existe (excluir el actual en modo edición)
        const emailExists = administradores.some(admin => 
            admin.email === formData.email && (!editMode || admin.id !== editAdminId)
        );
        if (emailExists) {
            alert('El email ya está registrado');
            return;
        }

        try {
            if (editMode) {
                // Modo edición
                const updateData = {
                    nombre: formData.nombre,
                    email: formData.email
                };

                // Agregar contraseña solo si se proporcionó
                if (formData.contraseña) {
                    updateData.contraseña = formData.contraseña;
                }

                const response = await administradoresService.update(editAdminId, updateData);
                console.log('Administrador actualizado:', response);
                
                // Actualizar estado local
                setAdministradores(administradores.map(admin => 
                    admin.id === editAdminId ? { ...admin, ...response } : admin
                ));
                
                alert('Administrador actualizado exitosamente');
            } else {
                // Modo creación
                // Generar ID automático
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 1000);
                const idGenerado = `administrador-${timestamp}-${random}`;

                // Crear nuevo administrador - usando el endpoint de SuperAdmin
                const nuevoAdministrador = {
                    id: idGenerado,
                    nombre: formData.nombre,
                    email: formData.email,
                    contraseña: formData.contraseña,
                    tipo: 'administrador',
                    permisos: ['evaluar_reservas_laboratorios'],
                    estado: 'activo'
                };

                const response = await administradoresService.create(nuevoAdministrador);
                console.log('Administrador creado:', response);
                
                // Actualizar estado local
                setAdministradores([...administradores, response]);
                
                alert('Administrador creado exitosamente');
            }

            // Cerrar modal y resetear formulario
            setShowModal(false);
            setEditMode(false);
            setEditAdminId(null);
            setFormData({
                nombre: '',
                email: '',
                contraseña: ''
            });
        } catch (error) {
            console.error('Error al guardar administrador:', error);
            alert('Error al guardar el administrador. Por favor, intente nuevamente.');
        }
    };

    const handleToggleEstado = async (id) => {
        try {
            // Cambiar estado del administrador
            const administrador = administradores.find(admin => admin.id === id);
            if (!administrador) {
                alert('Administrador no encontrado');
                return;
            }

            const nuevoEstado = administrador.estado === 'activo' ? 'inactivo' : 'activo';
            
            // Llamar al endpoint de SuperAdmin para cambiar estado
            await usuariosService.toggleEstado(id); // Reutilizar el mismo endpoint
            console.log('Estado actualizado para el administrador:', id);
            
            // Actualizar estado local
            setAdministradores(administradores.map(admin => 
                admin.id === id ? { ...admin, estado: nuevoEstado } : admin
            ));
        } catch (error) {
            console.error('Error al cambiar estado del administrador:', error);
            alert('Error al cambiar el estado del administrador');
        }
    };

    const handleDeleteAdministrador = async (id) => {
        if (confirm('¿Está seguro de que desea eliminar este administrador? Esta acción no se puede deshacer.')) {
            try {
                await usuariosService.delete(id); // Reutilizar el mismo endpoint
                // Actualizar estado local
                setAdministradores(administradores.filter(admin => admin.id !== id));
                console.log('Administrador eliminado:', id);
                alert('Administrador eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar administrador:', error);
                alert('Error al eliminar el administrador');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros({
            ...filtros,
            [name]: value
        });
    };

    // Filtrar administradores según los filtros aplicados
    const administradoresFiltrados = administradores.filter(administrador => {
        const busquedaMatch = !filtros.busqueda || 
            administrador.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            administrador.email.toLowerCase().includes(filtros.busqueda.toLowerCase());
        
        return busquedaMatch;
    });

    const getEstadoIcon = (estado) => {
        switch(estado) {
            case 'activo': return '✅';
            case 'inactivo': return '🔴';
            case 'suspendido': return '⚠️';
            default: return '❓';
        }
    };

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'activo': return 'bg-green-100 text-green-800';
            case 'inactivo': return 'bg-red-100 text-red-800';
            case 'suspendido': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout title="Gestión de Administradores">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">👨‍💼 Gestión de Administradores</h1>
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
                            ➕ Crear Administrador
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

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-2xl font-bold text-blue-600">{administradores.length}</div>
                        <div className="text-sm text-gray-600">Total Administradores</div>
                    </div>
                    
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                name="busqueda"
                                value={filtros.busqueda}
                                onChange={handleFiltroChange}
                                placeholder="Buscar por nombre o email..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de Administradores */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Administrador
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                                                <span>Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    administradoresFiltrados.map((administrador) => (
                                        <tr key={administrador.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {administrador.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">👨‍💼</span>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{administrador.nombre}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {administrador.email}
                                            </td> 
                                            <td className="px-6 py-4 whitespAace-nowrap text-sm text-gray-900">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditAdministrador(administrador)}
                                                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdministrador(administrador.id)}
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
                </div>

                {/* Modal Crear Administrador */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
    {editMode ? 'Editar Administrador' : 'Crear Nuevo Administrador'}
</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Administrador Principal"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: admin@gestion.com"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="contraseña"
                                        value={formData.contraseña}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Mínimo 6 caracteres"
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
                                    onClick={handleCreateAdministrador}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Crear Administrador
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GestionAdministradores;
