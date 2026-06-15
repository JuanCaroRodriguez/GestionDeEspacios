import { useLocation } from "react-router-dom";
import { ROUTES } from "@tools/CONSTANTS";
import {
  FiSearch,
  FiHome,
  FiUsers,
  FiUserPlus,
  FiCalendar,
  FiLogOut,
  FiBarChart2,
} from "react-icons/fi";
import Logo from "../../assets/LogoIsoft.png";

const Sidebar = ({ user, empresa, collapsed = false }) => {
  const location = useLocation();

  const menuItems = {
    superadmin: [
      {
        title: "Consulta de disponibilidad",
        icon: <FiSearch className="w-5 h-5" />,
        path: "/dashboard/consulta-espacios",
        description: "Consulta de disponibilidad y reserva de espacios",
      },
      {
        title: "Gestión de espacios",
        icon: <FiHome className="w-5 h-5" />,
        path: "/dashboard/espacios",
        description: "Administrar espacios y laboratorios",
      },
      {
        title: "Gestión de usuarios",
        icon: <FiUsers className="w-5 h-5" />,
        path: "/dashboard/usuarios",
        description: "Administrar usuarios del sistema",
      },
      {
        title: "Gestión de administradores",
        icon: <FiUserPlus className="w-5 h-5" />,
        path: "/dashboard/administradores",
        description: "Administrar administradores del sistema",
      },
      {
        title: "Reportes de uso",
        icon: <FiBarChart2 className="w-5 h-5" />,
        path: "/dashboard/reportes-uso",
        description: "Estadísticas y análisis de uso de los espacios",
      },
    ],
    administrador: [
      {
        title: "Consulta de disponibilidad",
        icon: <FiSearch className="w-5 h-5" />,
        path: "/dashboard/consulta-espacios",
        description: "Consulta de disponibilidad y reserva de espacios",
      },
      {
        title: "Revisión de reservas",
        icon: <FiCalendar className="w-5 h-5" />,
        path: "/dashboard/evaluar-reservas",
        description: "Gestión de reservas de los espacios",
      },
      {
        title: "Reportes de uso",
        icon: <FiBarChart2 className="w-5 h-5" />,
        path: "/dashboard/reportes-uso",
        description: "Estadísticas y análisis de uso de los espacios",
      },
    ],
    estudiante: [
      {
        title: "Consulta de disponibilidad",
        icon: <FiSearch className="w-5 h-5" />,
        path: "/dashboard/consulta-espacios",
        description: "Consulta de disponibilidad y reserva de espacios",
      },
      {
        title: "Mis reservas",
        icon: <FiCalendar className="w-5 h-5" />,
        path: "/dashboard/mis-reservas",
        description: "Ver y gestionar mis reservas",
      },
    ],
    docente: [
      {
        title: "Consulta de disponibilidad",
        icon: <FiSearch className="w-5 h-5" />,
        path: "/dashboard/consulta-espacios",
        description: "Consulta de disponibilidad y reserva de espacios",
      },
      {
        title: "Mis reservas",
        icon: <FiCalendar className="w-5 h-5" />,
        path: "/dashboard/mis-reservas",
        description: "Ver y gestionar mis reservas",
      },
    ],
  };

  const items = menuItems[user?.tipo] || [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-gray-800 text-white h-full transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header - Logo y Nombre del Aplicativo */}
      <div
        className={`p-4 border-b border-gray-700 transition-all duration-300 ${
          collapsed ? "flex justify-center" : ""
        }`}
      >
        <button
          onClick={() => window.location.href = ROUTES.dashboard.home}
          className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"} hover:opacity-80 transition-opacity cursor-pointer no-underline w-full text-left`}
        >
          <img
            src={Logo}
            alt="Logo ClassMatch"
            className={`flex-shrink-0 ${collapsed ? "w-8 h-8" : "w-10 h-10"}`}
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="font-bold text-lg text-white no-underline">
                Class<span className="text-blue-400">Match</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`p-4 transition-all duration-300 ${collapsed ? "px-2" : ""}`}
      >
        <div className="space-y-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => window.location.href = item.path}
              className={`block px-3 py-2 rounded-lg transition-all duration-200 group relative w-full text-left ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              } ${collapsed ? "flex justify-center" : ""}`}
              title={collapsed ? item.title : ""}
            >
              <div
                className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400">
                      {item.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Tooltip para modo colapsado */}
              {collapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-400">
                    {item.description}
                  </div>
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Logout */}
        
      </nav>
    </div>
  );
};

export default Sidebar;
