import { useState, useEffect } from 'react';
import Sidebar from '@components/Dashboard/Sidebar';
import useSession from '@context/Auth/useSession';
import CrearEmpresa from '@components/Empresa/CrearEmpresa';
import empresasService from '@api/services/empresas.service';

const Dashboard = () => {
    const { session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [empresa, setEmpresa] = useState(null);
    const [loadingEmpresa, setLoadingEmpresa] = useState(true);

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
                                        window.location.href = '/auth/welcome';
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
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">🏢 Gestión de espacios</h2>
                                <p className="text-gray-600 mb-4">
                                    Administra todos los espacios y laboratorios del sistema.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Crear nuevos espacios</p>
                                    <p>• Modificar espacios existentes</p>
                                    <p>• Eliminar espacios no utilizados</p>
                                    <p>• Ver disponibilidad</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">🏗️ Gestión de bloques</h2>
                                <p className="text-gray-600 mb-4">
                                    Organiza los bloques, pisos y salones de tu empresa.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Crear bloques</p>
                                    <p>• Configurar pisos</p>
                                    <p>• Definir salones por piso</p>
                                    <p>• Ver estructura completa</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">👥 Gestión de usuarios</h2>
                                <p className="text-gray-600 mb-4">
                                    Controla el acceso de usuarios al sistema.
                                </p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <p>• Crear nuevas cuentas</p>
                                    <p>• Modificar datos de usuario</p>
                                    <p>• Suspender usuarios</p>
                                    <p>• Verificar permisos</p>
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
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">📋 Evaluar reservas de laboratorios</h2>
                            <p className="text-gray-600 mb-4">
                                Revisa y aprueba las solicitudes de reserva para espacios exclusivos de sistemas.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Pendientes:</strong> 5 solicitudes esperando aprobación
                                </p>
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
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">📅 Mis reservas</h2>
                                <p className="text-gray-600">Gestiona tus reservas activas</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4">➕ Nueva reserva</h2>
                                <p className="text-gray-600">Crea una nueva reserva</p>
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
            {sidebarOpen && shouldShowSidebar && (
                <div className="fixed inset-y-0 left-0 z-50 md:relative md:z-auto">
                    <Sidebar user={session?.user} empresa={empresa} />
                </div>
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
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                            >
                                <span className="text-xl">☰</span>
                            </button>
                            <h1 className="ml-4 text-xl font-semibold text-gray-900">
                                ClassMatch Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </header>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    <div className={shouldShowSidebar ? "p-6" : "p-0"}>
                        {renderMainContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
