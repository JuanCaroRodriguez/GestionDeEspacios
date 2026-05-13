import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import usuariosService from '@api/services/usuarios.service';
import administradoresService from '@api/services/administradores.service';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        tipo: 'estudiante',
        contraseña: ''
    });
    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: '',
        estado: ''
    });

    // Cargar datos desde la API
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Cargar usuarios y administradores en paralelo
                const [usuariosData, administradoresData] = await Promise.all([
                    usuariosService.getAll(),
                    administradoresService.getAll()
                ]);
                
                setUsuarios(usuariosData);
                setAdministradores(administradoresData);
                console.log('Usuarios cargados:', usuariosData);
                console.log('Administradores cargados:', administradoresData);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
                setError('No se pudieron cargar los usuarios. Por favor, intente nuevamente.');
                // Datos de fallback para desarrollo
                setUsuarios([
                    {
                        id: 'estudiante-001',
                        nombre: 'Juan Estudiante',
                        email: 'juan.estudiante@gestion.com',
                        tipo: 'estudiante',
                        activo: true,
                        fechaRegistro: '2024-01-15',
                        ultimaSesion: '2024-05-06 14:30'
                    }
                ]);
                setAdministradores([
                    {
                        id: 'administrador-001',
                        nombre: 'Administrador de Sistemas',
                        email: 'administrador@gestion.com',
                        tipo: 'administrador',
                        activo: true,
                        fechaRegistro: '2024-01-10',
                        ultimaSesion: '2024-05-06 09:00'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    const handleCreateUsuario = async () => {
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

        // Verificar si el email ya existe (local y API)
        if (usuarios.some(usuario => usuario.email === formData.email)) {
            alert('El email ya está registrado');
            return;
        }

        try {
            // Verificar en el backend también
            const usuarioExistente = await usuariosService.getByEmail(formData.email);
            if (usuarioExistente) {
                alert('El email ya está registrado en el sistema');
                return;
            }
        } catch (error) {
            // Si hay error, asumimos que no existe y continuamos
        }

        try {
            // Generar ID automático
            const generarId = (tipo) => {
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 1000);
                return `${tipo}-${timestamp}-${random}`;
            };

            // Crear nuevo usuario en la API
            const nuevoUsuario = {
                id: generarId(formData.tipo),
                nombre: formData.nombre,
                email: formData.email,
                tipo: formData.tipo,
                contraseña: formData.contraseña,
                activo: true,
                fechaRegistro: new Date().toISOString().split('T')[0],
                ultimaSesion: null
            };

            const response = await usuariosService.create(nuevoUsuario);
            console.log('Usuario creado:', response);
            
            // Actualizar estado local
            setUsuarios([...usuarios, response]);
            setShowModal(false);
            setFormData({
                nombre: '',
                email: '',
                tipo: 'estudiante',
                contraseña: ''
            });
            
            alert('Usuario creado exitosamente');
        } catch (error) {
            console.error('Error al crear usuario:', error);
            if (error.response?.status === 400 && error.response?.data?.error?.includes('email')) {
                alert('El email ya está registrado en el sistema');
            } else {
                alert('Error al crear el usuario. Por favor, intente nuevamente.');
            }
        }
    };

    const handleToggleEstado = (id) => {
        setUsuarios(usuarios.map(usuario => 
            usuario.id === id ? { ...usuario, activo: !usuario.activo } : usuario
        ));
    };

    const handleEditUsuario = (usuario) => {
        setEditMode(true);
        setEditUserId(usuario.id);
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            tipo: usuario.tipo,
            contraseña: ''
        });
        setShowModal(true);
    };

    const handleUpdateUsuario = async () => {
        // Validaciones
        if (!formData.nombre || !formData.email) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Por favor ingrese un email válido');
            return;
        }

        // Validar contraseña si se proporciona
        if (formData.contraseña && formData.contraseña.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const updateData = {
                nombre: formData.nombre,
                email: formData.email,
                tipo: formData.tipo
            };

            // Agregar contraseña solo si se proporcionó
            if (formData.contraseña) {
                updateData.contraseña = formData.contraseña;
            }

            const response = await usuariosService.update(editUserId, updateData);
            console.log('Usuario actualizado:', response);
            
            // Actualizar estado local
            setUsuarios(usuarios.map(usuario => 
                usuario.id === editUserId ? { ...usuario, ...response } : usuario
            ));
            
            setShowModal(false);
            setEditMode(false);
            setEditUserId(null);
            setFormData({
                nombre: '',
                email: '',
                tipo: 'estudiante',
                contraseña: ''
            });
            
            alert('Usuario actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            if (error.response?.status === 400 && error.response?.data?.error?.includes('email')) {
                alert('El email ya está registrado en el sistema');
            } else {
                alert('Error al actualizar el usuario. Por favor, intente nuevamente.');
            }
        }
    };

    const handleDeleteUsuario = async (id) => {
        if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
            try {
                await usuariosService.delete(id);
                // Actualizar estado local
                setUsuarios(usuarios.filter(usuario => usuario.id !== id));
                console.log('Usuario eliminado:', id);
                alert('Usuario eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                alert('Error al eliminar el usuario');
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

    // Filtrar usuarios según los filtros aplicados
    const usuariosFiltrados = usuarios.filter(usuario => {
        const busquedaMatch = !filtros.busqueda || 
            usuario.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            usuario.email.toLowerCase().includes(filtros.busqueda.toLowerCase());
        
        const tipoMatch = !filtros.tipo || usuario.tipo === filtros.tipo;
        
        const estadoMatch = !filtros.estado || 
            (filtros.estado === 'activo' && usuario.activo) ||
            (filtros.estado === 'inactivo' && !usuario.activo);
        
        return busquedaMatch && tipoMatch && estadoMatch;
    });

    const getTipoIcon = (tipo) => {
        switch(tipo) {
            case 'estudiante': return '🎓';
            case 'docente': return '👩‍🏫';
            case 'administrador': return '👨‍💼';
            case 'superadmin': return '🔧';
            default: return '👤';
        }
    };

    return (
        <DashboardLayout title="Gestión de Usuarios">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        ➕ Crear Usuario
                    </button>
                </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{usuarios.length}</div>
                    <div className="text-sm text-gray-600">Total Usuarios</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">
                        {usuarios.filter(u => u.tipo === 'estudiante').length}
                    </div>
                    <div className="text-sm text-gray-600">Estudiantes</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">
                        {usuarios.filter(u => u.tipo === 'docente').length}
                    </div>
                    <div className="text-sm text-gray-600">Docentes</div>
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
                    <select 
                        name="tipo"
                        value={filtros.tipo}
                        onChange={handleFiltroChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="estudiante">Estudiantes</option>
                        <option value="docente">Docentes</option>
                    </select>
                </div>
            </div>

            {/* Lista de Usuarios */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
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
                                usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {usuario.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{getTipoIcon(usuario.tipo)}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {usuario.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                usuario.tipo === 'estudiante' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {usuario.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditUsuario(usuario)}
                                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUsuario(usuario.id)}
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

            {/* Modal Crear Usuario */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
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
                                    placeholder="Ej: Juan Pérez"
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
                                    placeholder="Ej: usuario@gestion.com"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Usuario
                                </label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="estudiante">Estudiante</option>
                                    <option value="docente">Docente</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña {!editMode && '(Requerido)'}
                                    {editMode && formData.contraseña && (
                                        <span className="text-xs text-green-600 ml-2">
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="password"
                                    name="contraseña"
                                    value={formData.contraseña}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={editMode ? 'Dejar en blanco para mantener actual' : 'Mínimo 6 caracteres'}
                                    required={!editMode}
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
                                onClick={editMode ? handleUpdateUsuario : handleCreateUsuario}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {editMode ? 'Actualizar Usuario' : 'Crear Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </DashboardLayout>
    );
};

export default GestionUsuarios;
