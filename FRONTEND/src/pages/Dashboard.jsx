import { useState, useEffect } from 'react';
import Sidebar from '@components/Dashboard/Sidebar';
import useSession from '@context/Auth/useSession';
import CrearEmpresa from '@components/Empresa/CrearEmpresa';
import empresasService from '@api/services/empresas.service';
import reservasService from '@api/services/reservas.service';
import { FiCalendar ,FiTrello, FiSearch, FiHome, FiUsers, FiUserPlus, FiBarChart2 } from 'react-icons/fi';
import { IoIosAddCircleOutline } from "react-icons/io";


const Dashboard = () => {
    const { session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [empresa, setEmpresa] = useState(null);
    const [loadingEmpresa, setLoadingEmpresa] = useState(true);
    const [reservasPendientes, setReservasPendientes] = useState(0);
    const [loadingReservas, setLoadingReservas] = useState(false);

    // Atajo de teclado para toggle sidebar (Ctrl+B o Cmd+B)
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Ctrl+B o Cmd+B
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                setSidebarOpen(!sidebarOpen);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [sidebarOpen]);

    // Verificar si el superadmin tiene empresa
    useEffect(() => {
        const verificarEmpresa = async () => {
            // Leer sesión directamente del localStorage para tener datos actualizados
            const localSession = JSON.parse(localStorage.getItem('session'));
            
            if (localSession?.user?.tipo === 'superadmin') {
                try {
                    if (!localSession.user.id_empresa) {
                        setEmpresa(null);
                    } else {
                        const empresaData = await empresasService.getById(localSession.user.id_empresa);
                        setEmpresa(empresaData);
                    }
                } catch (error) {
                    console.error('Error al verificar empresa:', error);
                    setEmpresa(null);
                } finally {
                    setLoadingEmpresa(false);
                }
            } else {
                setLoadingEmpresa(false);
            }
        };

        verificarEmpresa();
    }, [session]);

    // Cargar reservas pendientes para administradores
    const cargarReservasPendientes = async () => {
        if (!session?.user?.id_empresa || session?.user?.tipo !== 'administrador') {
            return;
        }

        try {
            setLoadingReservas(true);
            const todasReservas = await reservasService.getAllByEmpresa(session.user.id_empresa);
            
            // Contar reservas en estado "Pendiente"
            const pendientes = todasReservas.filter(reserva => reserva.estado === 'Pendiente').length;
            setReservasPendientes(pendientes);
        } catch (error) {
            console.error('Error al cargar reservas pendientes:', error);
            setReservasPendientes(0);
        } finally {
            setLoadingReservas(false);
        }
    };

    // Cargar reservas pendientes cuando el usuario es administrador
    useEffect(() => {
        if (session?.user?.tipo === 'administrador' && session?.user?.id_empresa) {
            cargarReservasPendientes();
        }
    }, [session]);

    const handleEmpresaCreada = (empresaCreada) => {
        setEmpresa(empresaCreada);
        // Aquí podríamos actualizar el usuario en el contexto para incluir id_empresa
    };

    // Contenido dinámico según el tipo de usuario
    const renderMainContent = () => {
        if (!session?.user) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando...</p>
                    </div>
                </div>
            );
        }

        // Para superadmin, verificar si tiene empresa
        if (session.user.tipo === 'superadmin') {
            // Si está cargando la verificación de empresa
            if (loadingEmpresa) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Verificando configuración...</p>
                        </div>
                    </div>
                );
            }

            // Si no tiene empresa, mostrar SOLO el formulario de creación
            if (!empresa) {
                return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-4xl">
                            {/* Botón de cerrar sesión */}
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('session');
                                        window.location.href = '/auth';
                                    }}
                                    className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                            
                            {/* Formulario de creación de empresa */}
                            <CrearEmpresa onEmpresaCreada={handleEmpresaCreada} fullscreen={true} />
                        </div>
                    </div>
                );
            }
        }

        switch (session.user.tipo) {
            case 'superadmin':
                return (
                    <div className="p-8">
                        
                        
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            Panel de Super Administrador
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/consulta-espacios'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex">
                                    <FiSearch className="w-6 h-6" />
                                     Consulta de disponibilidad</h2>
                                <p className="text-gray-600 mb-4">
                                    Consultar horarios y disponibilidad de espacios
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Ver disponibilidad por fecha</p>
                                    <p>• Consultar por tipo de espacio</p>
                                    <p>• Verificar horarios disponibles</p>
                                    <p>• Planificar reservas</p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Consultar espacios →
                                </div>
                            </div>
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/espacios'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FiHome className="w-6 h-6" /> Gestión de espacios
                            </h2>
                                <p className="text-gray-600 mb-4">
                                    Administra todos los espacios y laboratorios del sistema.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Crear nuevos espacios</p>
                                    <p>• Modificar espacios existentes</p>
                                    <p>• Eliminar espacios no utilizados</p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Gestionar espacios →
                                </div>
                            </div>
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/usuarios'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FiUsers className="w-6 h-6" /> Gestión de usuarios
                            </h2>
                                <p className="text-gray-600 mb-4">
                                    Controla el acceso de usuarios al sistema.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Crear nuevas cuentas</p>
                                    <p>• Modificar datos de usuario</p>
                                    <p>• Suspender usuarios</p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Gestionar usuarios →
                                </div>
                            </div>
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/administradores'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FiUserPlus className="w-6 h-6" /> Gestión de administradores
                            </h2>
                                <p className="text-gray-600 mb-4">
                                    Administra las cuentas de administradores del sistema.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Crear cuentas de administrador</p>
                                    <p>• Suspender administradores</p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Gestionar administradores →
                                </div>
                            </div>
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/reportes-uso'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FiBarChart2 className="w-6 h-6" /> Reportes de uso
                            </h2>
                                <p className="text-gray-600 mb-4">
                                    Estadísticas y análisis de uso de los espacios de espacios.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Análisis de ocupación</p>
                                    <p>• Estadísticas por tipo</p>
                                    <p>• Tendencias mensuales</p>
                                    <p>• Espacios más utilizados</p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Ver reportes →
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'administrador':
                return (
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            Panel de Administrador
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/consulta-espacios'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex">
                                    <FiSearch className="w-6 h-6" />
                                     Consulta de disponibilidad</h2>
                                <p className="text-gray-600 mb-4">
                                    Consultar horarios y disponibilidad de espacios
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Ver disponibilidad por fecha</p>
                                    <p>• Consultar por tipo de espacio</p>
                                    <p>• Verificar horarios disponibles</p>
                                    <p>• Planificar reservas</p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Consultar espacios →
                                </div>
                            </div>
                             <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/evaluar-reservas'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex">
                                    <FiCalendar  className="w-6 h-6" />
                                     Revisión de reservas</h2>
                                <p className="text-gray-600 mb-4">
                                    Gestión de reservas de los espacios
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Pendientes:</strong> {loadingReservas ? 'Cargando...' : `${reservasPendientes} solicitudes esperando aprobación`}
                                    </p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Revisión de reservas →
                                </div>
                            </div>
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/reportes-uso'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FiBarChart2 className="w-6 h-6" /> Reportes de uso
                            </h2>
                                <p className="text-gray-600 mb-4">
                                    Estadísticas y análisis de uso de los espacios de espacios.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Análisis de ocupación</p>
                                    <p>• Estadísticas por tipo</p>
                                    <p>• Tendencias mensuales</p>
                                    <p>• Espacios más utilizados</p>
                                </div>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Ver reportes →
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'estudiante':
            case 'docente':
                return (
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            Panel de {session.user.tipo === 'docente' ? 'Docente' : 'Estudiante'}
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/consulta-espacios'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FiSearch className="w-5 h-5" /> Consulta disponibilidad
                                </h2>
                                <p className="text-gray-600">Consulta la disponibilidad de espacios</p>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Consultar disponibilidad →
                                </div>
                            </div>
                            <div 
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => window.location.href = '/dashboard/mis-reservas'}
                            >
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FiCalendar className="w-5 h-5" /> Mis reservas
                                </h2>
                                <p className="text-gray-600">Gestiona tus reservas activas</p>
                                <div className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
                                    Ver mis reservas →
                                </div>
                            </div>
                            
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            Panel Principal
                        </h1>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-600">
                                Bienvenido al sistema de gestión de espacios.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    // Para superadmin sin empresa, no mostrar sidebar
    const shouldShowSidebar = !(session?.user?.tipo === 'superadmin' && !empresa && !loadingEmpresa);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {shouldShowSidebar && (
                <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out transform ${
                    sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
                } md:relative md:translate-x-0 md:transition-all md:duration-300 md:ease-in-out ${
                    sidebarOpen ? 'md:w-64' : 'md:w-16'
                }`}>
                    <Sidebar user={session?.user} empresa={empresa} collapsed={!sidebarOpen} />
                </div>
            )}

            {/* Overlay for mobile */}
            {sidebarOpen && shouldShowSidebar && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar - solo mostrar si no es superadmin sin empresa */}
                {shouldShowSidebar && (
                    <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="group relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                <svg 
                                    className={`w-6 h-6 transition-all duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                                
                                {/* Tooltip */}
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                    <div>{sidebarOpen ? 'Contraer barra lateral' : 'Expandir barra lateral'}</div>
                                    <div className="text-xs text-gray-400">Ctrl+B</div>
                                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            </button>
                            <h1 className="ml-4 text-xl font-semibold text-gray-900">
                                ClassMatch Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {session?.user?.nombre?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-700">{session?.user?.nombre}</span>
                                <span className="text-xs text-gray-500 capitalize">({session?.user?.tipo})</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </header>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto relative">
                    <div className={shouldShowSidebar ? "p-6" : "p-0"}>
                        {renderMainContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
