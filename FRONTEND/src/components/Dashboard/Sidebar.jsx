import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@tools/CONSTANTS';
import { FiSearch, FiHome, FiUsers, FiUserPlus, FiCalendar, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ user, empresa, collapsed = false }) => {
    const location = useLocation();
    
    const menuItems = {
        superadmin: [
            {
                title: 'Consulta de disponibilidad',
                icon: <FiSearch className="w-5 h-5" />,
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Gestión de espacios',
                icon: <FiHome className="w-5 h-5" />,
                path: '/dashboard/espacios',
                description: 'Administrar espacios y laboratorios'
            },
            {
                title: 'Gestión de usuarios',
                icon: <FiUsers className="w-5 h-5" />,
                path: '/dashboard/usuarios',
                description: 'Administrar usuarios del sistema'
            },
            {
                title: 'Gestión de administradores',
                icon: <FiUserPlus className="w-5 h-5" />,
                path: '/dashboard/administradores',
                description: 'Administrar administradores del sistema'
            }
        ],
        administrador: [
            {
                title: 'Consulta de disponibilidad',
                icon: <FiSearch className="w-5 h-5" />,
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Evaluar reservas',
                icon: <FiCalendar className="w-5 h-5" />,
                path: '/dashboard/evaluar-reservas',
                description: 'Gestión de reservas de los espacios'
            }
        ],
        estudiante: [
            {
                title: 'Consulta de disponibilidad',
                icon: <FiSearch className="w-5 h-5" />,
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Mis reservas',
                icon: <FiCalendar className="w-5 h-5" />,
                path: '/dashboard/mis-reservas',
                description: 'Ver y gestionar mis reservas'
            }
        ],
        docente: [
            {
                title: 'Consulta de disponibilidad',
                icon: <FiSearch className="w-5 h-5" />,
                path: '/dashboard/consulta-espacios',
                description: 'Consultar horarios y disponibilidad'
            },
            {
                title: 'Mis reservas',
                icon: <FiCalendar className="w-5 h-5" />,
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
        <div className={`bg-gray-800 text-white h-full transition-all duration-300 ease-in-out ${
            collapsed ? 'w-16' : 'w-64'
        }`}>
            {/* Header */}
            <div className={`p-4 border-b border-gray-700 transition-all duration-300 ${
                collapsed ? 'flex justify-center' : ''
            }`}>
                <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                            {user?.nombre?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm truncate">{user?.nombre}</div>
                            <div className="text-xs text-gray-400 capitalize">{user?.tipo}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`p-4 transition-all duration-300 ${
                collapsed ? 'px-2' : ''
            }`}>
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`block px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                                isActive(item.path)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            } ${collapsed ? 'flex justify-center' : ''}`}
                            title={collapsed ? item.title : ''}
                        >
                            <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                                <span className="text-lg flex-shrink-0">{item.icon}</span>
                                {!collapsed && (
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm">{item.title}</div>
                                        <div className="text-xs text-gray-400">{item.description}</div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Tooltip para modo colapsado */}
                            {collapsed && (
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-xs text-gray-400">{item.description}</div>
                                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Logout */}
                <div className="mt-8 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => {
                            // Aquí irá la lógica de logout
                            localStorage.removeItem('session');
                            window.location.href = ROUTES.auth.home;
                        }}
                        className={`w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors group relative ${
                            collapsed ? 'flex justify-center' : 'flex items-center space-x-3'
                        }`}
                        title={collapsed ? 'Cerrar sesión' : ''}
                    >
                        <FiLogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>Cerrar sesión</span>}
                        
                        {/* Tooltip para logout en modo colapsado */}
                        {collapsed && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                Cerrar sesión
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        )}
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
