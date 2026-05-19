import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@tools/CONSTANTS';

const Sidebar = ({ user }) => {
    const location = useLocation();

    const menuItems = {
        superadmin: [
            {
                title: 'Consulta de espacios',
                icon: '🔍',
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Gestión de espacios',
                icon: '🏢',
                path: '/dashboard/espacios',
                description: 'Administrar espacios y laboratorios'
            },
            {
                title: 'Gestión de usuarios',
                icon: '👥',
                path: '/dashboard/usuarios',
                description: 'Administrar usuarios del sistema'
            },
            {
                title: 'Gestión de administradores',
                icon: '👨‍💼',
                path: '/dashboard/administradores',
                description: 'Administrar administradores del sistema'
            }
        ],
        administrador: [
            {
                title: 'Consulta de espacios',
                icon: '🔍',
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Evaluar reservas',
                icon: '📋',
                path: '/dashboard/evaluar-reservas',
                description: 'Evaluar solicitudes de laboratorios'
            }
        ],
        estudiante: [
            {
                title: 'Consulta de espacios',
                icon: '🔍',
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Mis reservas',
                icon: '📅',
                path: '/dashboard/mis-reservas',
                description: 'Ver y gestionar mis reservas'
            }
        ],
        docente: [
            {
                title: 'Consulta de espacios',
                icon: '🔍',
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Mis reservas',
                icon: '📅',
                path: '/dashboard/mis-reservas',
                description: 'Ver y gestionar mis reservas'
            }
        ]
    };

    const items = menuItems[user?.tipo] || [];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="w-64 bg-gray-800 text-white h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                            {user?.nombre?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="font-semibold text-sm">{user?.nombre}</div>
                        <div className="text-xs text-gray-400 capitalize">{user?.tipo}</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`block px-3 py-2 rounded-lg transition-colors ${
                                isActive(item.path)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-lg">{item.icon}</span>
                                <div>
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-xs text-gray-400">{item.description}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Logout */}
                <div className="mt-8 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => {
                            // Aquí irá la lógica de logout
                            localStorage.removeItem('session');
                            window.location.href = ROUTES.auth.welcome;
                        }}
                        className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors flex items-center space-x-3"
                    >
                        <span>🚪</span>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
