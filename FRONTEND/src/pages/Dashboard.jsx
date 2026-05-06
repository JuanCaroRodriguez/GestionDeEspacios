import { useState } from 'react';
import Sidebar from '@components/Dashboard/Sidebar';
import useSession from '@context/Auth/useSession';

const Dashboard = () => {
    const { session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);

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

        switch (session.user.tipo) {
            case 'superadmin':
                return (
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            Panel de Super Administrador
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <h2 className="text-xl font-semibold mb-4">🏫 Espacios disponibles</h2>
                                <p className="text-gray-600">Consulta espacios y horarios</p>
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

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-y-0 left-0 z-50 md:relative md:z-auto">
                    <Sidebar user={session?.user} />
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
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

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
