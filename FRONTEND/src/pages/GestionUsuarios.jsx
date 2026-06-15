import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import usuariosService from '@api/services/usuarios.service';
import administradoresService from '@api/services/administradores.service';
import useSession from '@context/Auth/useSession';
import { FiUsers, FiUser, FiTool, FiPlus, FiTrash2, FiEdit2, FiLogOut } from 'react-icons/fi';

const GestionUsuarios = () => {
    const { session } = useSession();
    const [usuarios, setUsuarios] = useState([]);
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);
    const [successOperationType, setSuccessOperationType] = useState('');
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
                
                // Obtener id_empresa del usuario logueado (igual que en GestionEspacios)
                const idEmpresa = session?.user?.id_empresa;
                
                
                // Usar getByEmpresa() para filtrar por empresa
                const usuariosPromise = usuariosService.getByEmpresa(idEmpresa);
                const administradoresPromise = administradoresService.getByEmpresa(idEmpresa);
                
                const [usuariosData, administradoresData] = await Promise.all([
                    usuariosPromise,
                    administradoresPromise
                ]);
                
                setUsuarios(usuariosData);
                setAdministradores(administradoresData);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
                setError('No se pudieron cargar los usuarios. Por favor, intente nuevamente.');
                // Datos de fallback para desarrollo
                
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, [session]);

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

        // Verificar si el email ya existe (local)
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
            // Obtener id_empresa del usuario logueado
            const idEmpresa = session?.user?.id_empresa;
            if (!idEmpresa) {
                alert('No se puede crear el usuario: no hay información de la empresa');
                return;
            }

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
                estado: 'activo',
                id_empresa: idEmpresa,
                fechaRegistro: new Date().toISOString().split('T')[0],
                ultimaSesion: null
            };

            const response = await usuariosService.create(nuevoUsuario);
            console.log('Usuario creado:', response);
            
            // Actualizar estado local
            setUsuarios([...usuarios, response]);
            setShowModal(false);
            setSuccessOperationType('creado');
            setShowSuccessModal(true);
            setFormData({
                nombre: '',
                email: '',
                tipo: 'estudiante',
                contraseña: ''
            });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            if (error.response?.status === 400 && error.response?.data?.error?.includes('email')) {
                alert('El email ya está registrado en el sistema');
            } else {
                alert('Error al crear el usuario. Por favor, intente nuevamente.');
            }
        }
    };

    const handleToggleEstado = async (id) => {
        try {
            const usuario = usuarios.find(u => u.id === id);
            if (!usuario) return;

            const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
            
            // Llamar al backend para actualizar el estado
            const response = await usuariosService.updateEstado(id, nuevoEstado);
            
            // Actualizar estado local
            setUsuarios(usuarios.map(u => 
                u.id === id ? { ...u, estado: nuevoEstado } : u
            ));
            
            console.log('Estado actualizado:', response);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error al actualizar el estado del usuario');
        }
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
            setSuccessOperationType('actualizado');
            setShowSuccessModal(true);
            setEditMode(false);
            setEditUserId(null);
            setFormData({
                nombre: '',
                email: '',
                tipo: 'estudiante',
                contraseña: ''
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            if (error.response?.status === 400 && error.response?.data?.error?.includes('email')) {
                alert('El email ya está registrado en el sistema');
            } else {
                alert('Error al actualizar el usuario. Por favor, intente nuevamente.');
            }
        }
    };

    const handleDeleteUsuario = (id) => {
        setUsuarioToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteUsuario = async () => {
        try {
            await usuariosService.delete(usuarioToDelete);
            // Actualizar estado local
            setUsuarios(usuarios.filter(usuario => usuario.id !== usuarioToDelete));
            console.log('Usuario eliminado:', usuarioToDelete);
            
            // Cerrar modal de confirmación y mostrar modal de éxito
            setShowDeleteConfirmModal(false);
            setSuccessOperationType('eliminado');
            setShowSuccessModal(true);
            
            // Resetear el usuario a eliminar
            setUsuarioToDelete(null);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar el usuario');
            setShowDeleteConfirmModal(false);
            setUsuarioToDelete(null);
        }
    };

    const cancelDeleteUsuario = () => {
        setShowDeleteConfirmModal(false);
        setUsuarioToDelete(null);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setSuccessOperationType('');
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
            case 'estudiante': return <FiUser className="w-4 h-4" />;
            case 'docente': return <FiUser className="w-4 h-4" />;
            case 'administrador': return <FiUsers className="w-4 h-4" />;
            case 'superadmin': return <FiTool className="w-4 h-4" />;
            default: return <FiUser className="w-4 h-4" />;
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
        <DashboardLayout title="Gestión de Usuarios">
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                <style>{`
                  @keyframes guFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                  @keyframes guFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
                  @keyframes guShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                `}</style>
                <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'guFloat1 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'guFloat2 10s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'guShimmer 5s ease-in-out infinite' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Gestión de Usuarios</h1>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Controla el acceso y cuentas de usuario del sistema</p>
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
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FiUsers className="w-6 h-6" />
                        Gestión de Usuarios
                    </h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Crear Usuario
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
                            placeholder="Buscar "
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
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                                            <span>Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-gray-50">
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={usuario.estado === 'activo'}
                                                    onChange={() => handleToggleEstado(usuario.id)}
                                                    className="sr-only"
                                                />
                                                <div className="relative">
                                                    <div className={`block w-14 h-8 rounded-full ${usuario.estado === 'activo' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${usuario.estado === 'activo' ? 'translate-x-6' : ''}`}></div>
                                                </div>
                                                <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(usuario.estado)}`}>
                                                    {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </label>
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

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <FiTrash2 className="w-6 h-6 text-red-600" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                            ¿Eliminar Usuario?
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-center">
                            ¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.
                        </p>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelDeleteUsuario}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteUsuario}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Éxito */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                            ¡Usuario {successOperationType === 'creado' ? 'Creado' : successOperationType === 'actualizado' ? 'Actualizado' : 'Eliminado'}!
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-center">
                            El usuario ha sido {successOperationType === 'creado' ? 'creado' : successOperationType === 'actualizado' ? 'actualizado' : 'eliminado'} exitosamente del sistema.
                        </p>
                        
                        <button
                            onClick={closeSuccessModal}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            </div>
            </div>
        </DashboardLayout>
    );
};

export default GestionUsuarios;
