import { useState, useEffect } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import administradoresService from '@api/services/administradores.service';
import { departamentosService } from '@api/services/departamentos.service';
import useSession from '@context/Auth/useSession';
import { FiRefreshCw, FiUserPlus, FiEdit, FiTrash2, FiUsers, FiLogOut } from 'react-icons/fi';

const GestionAdministradores = () => {
    const { session } = useSession();
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editAdminId, setEditAdminId] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [successOperationType, setSuccessOperationType] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        contraseña: '',
        departamento: ''
    });
    const [departamentos, setDepartamentos] = useState([]);
    const [filtros, setFiltros] = useState({
        busqueda: ''
    });

    // Función helper para obtener el nombre del departamento por ID
    const getNombreDepartamento = (departamentoId) => {
        if (!departamentoId) return 'No aplica';
        const departamento = departamentos.find(d => d.id === departamentoId);
        return departamento ? departamento.nombre : departamentoId;
    };

    // Cargar datos desde la API
    useEffect(() => {
        const fetchAdministradores = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Obtener id_empresa del usuario logueado (igual que en GestionEspacios)
                const idEmpresa = session?.user?.id_empresa;
                
                
                // Cargar administradores y departamentos en paralelo
                const [administradoresData, departamentosData] = await Promise.all([
                    administradoresService.getByEmpresa(idEmpresa),
                    departamentosService.getByEmpresa(idEmpresa)
                ]);
                setAdministradores(administradoresData);
                setDepartamentos(departamentosData);
            } catch (err) {
                console.error('Error al cargar administradores:', err);
                setError('No se pudieron cargar los administradores. Por favor, intente nuevamente.');
                
            } finally {
                setLoading(false);
            }
        };

        fetchAdministradores();
    }, [session]);

    const handleEditAdministrador = (administrador) => {
        setEditMode(true);
        setEditAdminId(administrador.id);
        setFormData({
            nombre: administrador.nombre,
            email: administrador.email,
            contraseña: '',
            departamento: administrador.departamento || ''
        });
        setShowModal(true);
    };

    const handleCreateAdministrador = async () => {
        // Validaciones
        if (!formData.nombre || !formData.email || !formData.contraseña || !formData.departamento) {
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
            // Verificar si el email ya existe
            try {
                const administradorExistente = await administradoresService.getByEmail(formData.email);
                if (administradorExistente) {
                    alert('El email ya está registrado en el sistema');
                    return;
                }
            } catch (error) {
                // Si hay error, asumimos que no existe y continuamos
            }

            // Modo creación
            // Obtener id_empresa del usuario logueado
            const idEmpresa = session?.user?.id_empresa;
            if (!idEmpresa) {
                alert('No se puede crear el administrador: no hay información de la empresa');
                return;
            }

            // Generar ID automático
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const idGenerado = `administrador-${timestamp}-${random}`;

            // Crear nuevo administrador
            const nuevoAdministrador = {
                id: idGenerado,
                nombre: formData.nombre,
                email: formData.email,
                contraseña: formData.contraseña,
                tipo: 'administrador',
                permisos: ['evaluar_reservas_laboratorios'],
                estado: 'activo',
                id_empresa: idEmpresa,
                departamento: formData.departamento
            };

            const response = await administradoresService.create(nuevoAdministrador);
            console.log('Administrador creado:', response);
            
            // Actualizar estado local
            setAdministradores([...administradores, response]);
            setShowModal(false);
            setSuccessOperationType('creado');
            setShowSuccessModal(true);
            setFormData({
                nombre: '',
                email: '',
                contraseña: '',
                departamento: ''
            });
        } catch (error) {
            console.error('Error al crear administrador:', error);
            alert('Error al crear el administrador. Por favor, intente nuevamente.');
        }
    };

    const handleUpdateAdministrador = async () => {
        // Validaciones
        if (!formData.nombre || !formData.email || !formData.departamento) {
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
                departamento: formData.departamento
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
            
            setShowModal(false);
            setSuccessOperationType('actualizado');
            setShowSuccessModal(true);
            setEditMode(false);
            setEditAdminId(null);
            setFormData({
                nombre: '',
                email: '',
                contraseña: '',
                departamento: ''
            });
        } catch (error) {
            console.error('Error al actualizar administrador:', error);
            alert('Error al actualizar el administrador. Por favor, intente nuevamente.');
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
            
            // Llamar al endpoint para cambiar estado
            await administradoresService.updateEstado(id, nuevoEstado);
            console.log('Estado actualizado para el administrador:', id, 'nuevo estado:', nuevoEstado);
            
            // Actualizar estado local
            setAdministradores(administradores.map(admin => 
                admin.id === id ? { ...admin, estado: nuevoEstado } : admin
            ));
        } catch (error) {
            console.error('Error al cambiar estado del administrador:', error);
            alert('Error al cambiar el estado del administrador');
        }
    };

    const handleDeleteAdministrador = (id) => {
        setAdminToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteAdministrador = async () => {
        try {
            await administradoresService.delete(adminToDelete); // Reutilizar el mismo endpoint
            // Actualizar estado local
            setAdministradores(administradores.filter(admin => admin.id !== adminToDelete));
            console.log('Administrador eliminado:', adminToDelete);
            
            // Cerrar modal de confirmación y mostrar modal de éxito
            setShowDeleteConfirmModal(false);
            setSuccessOperationType('eliminado');
            setShowSuccessModal(true);
            
            // Resetear el administrador a eliminar
            setAdminToDelete(null);
        } catch (error) {
            console.error('Error al eliminar administrador:', error);
            alert('Error al eliminar el administrador');
            setShowDeleteConfirmModal(false);
            setAdminToDelete(null);
        }
    };

    const cancelDeleteAdministrador = () => {
        setShowDeleteConfirmModal(false);
        setAdminToDelete(null);
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

    // Filtrar administradores según los filtros aplicados
    const administradoresFiltrados = administradores.filter(administrador => {
        const busquedaMatch = !filtros.busqueda || 
            administrador.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
            administrador.email.toLowerCase().includes(filtros.busqueda.toLowerCase());
        
        return busquedaMatch;
    });

    const getEstadoIcon = (estado) => {
        switch(estado) {
            case 'activo': return '';
            case 'inactivo': return '';
            case 'suspendido': return '';
            default: return '';
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
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                <style>{`
                  @keyframes gaFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                  @keyframes gaFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
                  @keyframes gaShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                `}</style>
                <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'gaFloat1 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'gaFloat2 10s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'gaShimmer 5s ease-in-out infinite' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Gestión de Administradores</h1>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Administra las cuentas de administradores del sistema</p>
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
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <FiUsers className="w-6 h-6 mr-2" />
                        Gestión de Administradores
                    </h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <FiRefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <FiUserPlus className="w-4 h-4 mr-2" />
                            Crear Administrador
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
                                placeholder="Buscar"
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
                                        Administrador
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Departamento
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
                                    administradoresFiltrados.map((administrador) => (
                                        <tr key={administrador.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FiUsers className="w-5 h-5 mr-2 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{administrador.nombre}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {administrador.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {getNombreDepartamento(administrador.departamento)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={administrador.estado === 'activo'}
                                                        onChange={() => handleToggleEstado(administrador.id)}
                                                        className="sr-only"
                                                    />
                                                    <div className="relative">
                                                        <div className={`block w-14 h-8 rounded-full ${administrador.estado === 'activo' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${administrador.estado === 'activo' ? 'translate-x-6' : ''}`}></div>
                                                    </div>
                                                    <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(administrador.estado)}`}>
                                                        {administrador.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditAdministrador(administrador)}
                                                        className="flex items-center px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        <FiEdit className="w-3 h-3 mr-1" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdministrador(administrador.id)}
                                                        className="flex items-center px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        <FiTrash2 className="w-3 h-3 mr-1" />
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
                                        required={editMode ? false : true}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Departamento
                                    </label>
                                    <select
                                        name="departamento"
                                        value={formData.departamento}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar departamento</option>
                                        {departamentos.map((departamento) => (
                                            <option key={departamento.id} value={departamento.id}>
                                                {departamento.nombre}
                                            </option>
                                        ))}
                                    </select>
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
                                    onClick={editMode ? handleUpdateAdministrador : handleCreateAdministrador}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {editMode ? (
                                        <>
                                            <FiEdit className="w-4 h-4 mr-2" />
                                            Actualizar Administrador
                                        </>
                                    ) : (
                                        <>
                                            <FiUserPlus className="w-4 h-4 mr-2" />
                                            Crear Administrador
                                        </>
                                    )}
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
                            ¿Eliminar Administrador?
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-center">
                            ¿Está seguro de que desea eliminar este administrador? Esta acción no se puede deshacer.
                        </p>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelDeleteAdministrador}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteAdministrador}
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
                            ¡Administrador {successOperationType === 'creado' ? 'Creado' : successOperationType === 'actualizado' ? 'Actualizado' : 'Eliminado'}!
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-center">
                            El administrador ha sido {successOperationType === 'creado' ? 'creado' : successOperationType === 'actualizado' ? 'actualizado' : 'eliminado'} exitosamente del sistema.
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

export default GestionAdministradores;
