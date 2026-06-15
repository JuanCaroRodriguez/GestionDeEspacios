import { useState, useEffect } from "react";
import Sidebar from "@components/Dashboard/Sidebar";
import useSession from "@context/Auth/useSession";
import CrearEmpresa from "@components/Empresa/CrearEmpresa";
import empresasService from "@api/services/empresas.service";
import reservasService from "@api/services/reservas.service";
import {
  FiCalendar,
  FiTrello,
  FiSearch,
  FiHome,
  FiUsers,
  FiUserPlus,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import { CgSandClock } from "react-icons/cg";
import { MdWavingHand } from "react-icons/md";

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
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [sidebarOpen]);

  // Verificar si el superadmin tiene empresa
  useEffect(() => {
    const verificarEmpresa = async () => {
      // Leer sesión directamente del localStorage para tener datos actualizados
      const localSession = JSON.parse(localStorage.getItem("session"));

      if (localSession?.user?.tipo === "superadmin") {
        try {
          if (!localSession.user.id_empresa) {
            setEmpresa(null);
          } else {
            const empresaData = await empresasService.getById(
              localSession.user.id_empresa,
            );
            setEmpresa(empresaData);
          }
        } catch (error) {
          console.error("Error al verificar empresa:", error);
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
    if (!session?.user?.id_empresa || session?.user?.tipo !== "administrador") {
      return;
    }

    try {
      setLoadingReservas(true);
      const todasReservas = await reservasService.getAllByEmpresa(
        session.user.id_empresa,
      );

      // Contar reservas en estado "Pendiente"
      const pendientes = todasReservas.filter(
        (reserva) => reserva.estado === "Pendiente",
      ).length;
      setReservasPendientes(pendientes);
    } catch (error) {
      console.error("Error al cargar reservas pendientes:", error);
      setReservasPendientes(0);
    } finally {
      setLoadingReservas(false);
    }
  };

  // Cargar reservas pendientes cuando el usuario es administrador
  useEffect(() => {
    if (session?.user?.tipo === "administrador" && session?.user?.id_empresa) {
      cargarReservasPendientes();
    }
  }, [session]);

  const handleEmpresaCreada = (empresaCreada) => {
    setEmpresa(empresaCreada);
    // Aquí podríamos actualizar el usuario en el contexto para incluir id_empresa
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const renderWelcomeBanner = () => {
    const roleLabels = { superadmin: "Super Administrador", administrador: "Administrador", estudiante: "Estudiante", docente: "Docente" };
    return (
      <div style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)", padding: "2rem", position: "relative", overflow: "hidden", color: "white" }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(96,165,250,0.12)", animation: "dbFloat1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "30%", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(147,197,253,0.09)", animation: "dbFloat2 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "20%", left: "55%", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "dbShimmer 5s ease-in-out infinite" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.2rem" }}>{getGreeting()},</p>
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "0.25rem" }}>{session?.user?.nombre} <MdWavingHand style={{ width: '20px', height: '20px' }} /></h2>
            <div style={{ marginTop: "0.625rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: "9999px", padding: "0.2rem 0.7rem", fontSize: "0.775rem", fontWeight: "500" }}>
                {roleLabels[session?.user?.tipo] || session?.user?.tipo}
              </span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.775rem" }}>
                {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
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
    );
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
    if (session.user.tipo === "superadmin") {
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
                    localStorage.removeItem("session");
                    window.location.href = "/auth";
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cerrar sesión
                </button>
              </div>

              {/* Formulario de creación de empresa */}
              <CrearEmpresa
                onEmpresaCreada={handleEmpresaCreada}
                fullscreen={true}
              />
            </div>
          </div>
        );
      }
    }

    const cardDefs = {
      superadmin: [
        { title: "Consulta de disponibilidad", desc: "Consulta disponibilidad y reserva de espacios.", Icon: FiSearch, accent: "#2563eb", bg: "#dbeafe", path: "/dashboard/consulta-espacios", features: ["Ver disponibilidad por fecha", "Consultar por tipo de espacio", "Verificar horarios disponibles", "Planificar reservas"], cta: "Consultar espacios" },
        { title: "Gestión de espacios", desc: "Administra todos los espacios y laboratorios del sistema.", Icon: FiHome, accent: "#16a34a", bg: "#dcfce7", path: "/dashboard/espacios", features: ["Crear nuevos espacios", "Modificar espacios existentes", "Eliminar espacios no utilizados"], cta: "Gestionar espacios" },
        { title: "Gestión de usuarios", desc: "Controla el acceso de usuarios al sistema.", Icon: FiUsers, accent: "#7c3aed", bg: "#ede9fe", path: "/dashboard/usuarios", features: ["Crear nuevas cuentas", "Modificar datos de usuario", "Suspender usuarios"], cta: "Gestionar usuarios" },
        { title: "Gestión de administradores", desc: "Administra las cuentas de administradores del sistema.", Icon: FiUserPlus, accent: "#ea580c", bg: "#ffedd5", path: "/dashboard/administradores", features: ["Crear cuentas de administrador", "Suspender administradores"], cta: "Gestionar administradores" },
        { title: "Reportes de uso", desc: "Estadísticas y análisis de uso de los espacios.", Icon: FiBarChart2, accent: "#0f766e", bg: "#ccfbf1", path: "/dashboard/reportes-uso", features: ["Análisis de ocupación", "Estadísticas por tipo", "Tendencias mensuales", "Espacios más utilizados"], cta: "Ver reportes" },
      ],
      administrador: [
        { title: "Consulta de disponibilidad", desc: "Consulta disponibilidad y reserva de espacios.", Icon: FiSearch, accent: "#2563eb", bg: "#dbeafe", path: "/dashboard/consulta-espacios", features: ["Ver disponibilidad por fecha", "Consultar por tipo de espacio", "Verificar horarios disponibles", "Planificar reservas"], cta: "Consultar espacios" },
        { title: "Revisión de reservas", desc: "Gestión y aprobación de reservas de espacios.", Icon: FiCalendar, accent: "#ca8a04", bg: "#fef9c3", path: "/dashboard/evaluar-reservas", features: [], cta: "Revisar reservas", badge: loadingReservas ? "Cargando..." : reservasPendientes > 0 ? `${reservasPendientes} solicitudes pendientes` : null },
        { title: "Reportes de uso", desc: "Estadísticas y análisis de uso de los espacios.", Icon: FiBarChart2, accent: "#0f766e", bg: "#ccfbf1", path: "/dashboard/reportes-uso", features: ["Análisis de ocupación", "Estadísticas por tipo", "Tendencias mensuales", "Espacios más utilizados"], cta: "Ver reportes" },
      ],
      estudiante: [
        { title: "Consulta de disponibilidad", desc: "Consulta la disponibilidad de espacios y realiza reservas.", Icon: FiSearch, accent: "#2563eb", bg: "#dbeafe", path: "/dashboard/consulta-espacios", features: ["Ver disponibilidad por fecha", "Consultar horarios disponibles", "Reservar espacios"], cta: "Consultar disponibilidad" },
        { title: "Mis reservas", desc: "Gestiona tus reservas activas y visualiza tu historial.", Icon: FiCalendar, accent: "#7c3aed", bg: "#ede9fe", path: "/dashboard/mis-reservas", features: ["Ver reservas activas", "Cancelar reservas", "Historial de reservas"], cta: "Ver mis reservas" },
      ],
      docente: [
        { title: "Consulta de disponibilidad", desc: "Consulta la disponibilidad de espacios y realiza reservas.", Icon: FiSearch, accent: "#2563eb", bg: "#dbeafe", path: "/dashboard/consulta-espacios", features: ["Ver disponibilidad por fecha", "Consultar horarios disponibles", "Reservar espacios"], cta: "Consultar disponibilidad" },
        { title: "Mis reservas", desc: "Gestiona tus reservas activas y visualiza tu historial.", Icon: FiCalendar, accent: "#7c3aed", bg: "#ede9fe", path: "/dashboard/mis-reservas", features: ["Ver reservas activas", "Cancelar reservas", "Historial de reservas"], cta: "Ver mis reservas" },
      ],
    };

    const cards = cardDefs[session.user.tipo] || [];

    return (
      <div style={{ padding: "1.5rem", backgroundColor: "#f1f5f9", minHeight: "100%" }}>
        <p style={{ margin: "0 0 1rem 0", fontSize: "0.7rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Accesos rápidos
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {cards.map((card, i) => {
            const CardIcon = card.Icon;
            return (
              <div
                key={i}
                style={{ background: "white", borderRadius: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", border: "1px solid #f1f5f9" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                onClick={() => (window.location.href = card.path)}
              >
                <div style={{ height: "3px", background: `linear-gradient(90deg, ${card.accent}, ${card.accent}99)` }} />
                <div style={{ padding: "1.25rem" }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: card.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem" }}>
                    <CardIcon size={16} color={card.accent} />
                  </div>
                  <h3 style={{ margin: "0 0 0.35rem 0", fontSize: "0.975rem", fontWeight: "700", color: "#0f172a" }}>{card.title}</h3>
                  <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8rem", color: "#64748b", lineHeight: "1.5" }}>{card.desc}</p>
                  {card.badge && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", backgroundColor: "#fef9c3", color: "#854d0e", fontSize: "0.725rem", fontWeight: "600", padding: "0.2rem 0.6rem", borderRadius: "9999px", marginBottom: "0.75rem" }}>
                      <CgSandClock  size={20} color="#746905ff" /> {card.badge}
                    </div>
                  )}
                  {card.features && card.features.length > 0 && (
                    <ul style={{ margin: "0 0 0.875rem 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                      {card.features.map((f, j) => (
                        <li key={j} style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ color: card.accent, fontSize: "0.55rem" }}>●</span> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div style={{ fontSize: "0.8rem", fontWeight: "600", color: card.accent }}>{card.cta} →</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Para superadmin sin empresa, no mostrar sidebar
  const shouldShowSidebar = !(
    session?.user?.tipo === "superadmin" &&
    !empresa &&
    !loadingEmpresa
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {shouldShowSidebar && (
        <div
          className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out transform ${
            sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
          } md:relative md:translate-x-0 md:transition-all md:duration-300 md:ease-in-out ${
            sidebarOpen ? "md:w-64" : "md:w-16"
          }`}
        >
          <Sidebar
            user={session?.user}
            empresa={empresa}
            collapsed={!sidebarOpen}
          />

          {/* Toggle tab - pestaña que sobresale del sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Contraer barra lateral (Ctrl+B)" : "Expandir barra lateral (Ctrl+B)"}
            style={{
              position: "absolute",
              top: "50%",
              left: "100%",
              transform: "translateY(-50%)",
              backgroundColor: "#1f2937",
              color: "white",
              border: "none",
              borderRadius: "0 6px 6px 0",
              padding: "10px 4px",
              cursor: "pointer",
              zIndex: 51,
              boxShadow: "3px 0 8px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#374151"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1f2937"}
          >
            {sidebarOpen
              ? <FiChevronLeft size={14} />
              : <FiChevronRight size={14} />
            }
          </button>
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
        {/* {shouldShowSidebar && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
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
                  <span className="text-sm text-gray-700">
                    {session?.user?.nombre}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    ({session?.user?.tipo})
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </header>
        )} */}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto relative">
          <style>{`
            @keyframes dbFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
            @keyframes dbFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
            @keyframes dbShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
          `}</style>
          {shouldShowSidebar && renderWelcomeBanner()}
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
