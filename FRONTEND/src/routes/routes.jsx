import { Outlet } from "react-router-dom";
import App from "../App";
import { ROUTES } from "../tools/CONSTANTS";
import LoadComponent from "./LoadComponents";
import SessionState from "../context/Auth/SessionState";
import ProtectedRoute from "./ProtectedRoute";

// Mapa estático de rutas a módulos
const componentMap = {
  "Login": () => import("../pages/login"),
  "Register": () => import("../pages/register"),
  "Portada": () => import("../pages/Portada"),
  "Dashboard": () => import("../pages/Dashboard"),
  "GestionEspacios": () => import("../pages/GestionEspacios"),
  "ConsultaDisponibilidad": () => import("../pages/ConsultaEspacios"),
  "MisReservas": () => import("../pages/MisReservas"),
  "GestionUsuarios": () => import("../pages/GestionUsuarios"),
  "GestionAdministradores": () => import("../pages/GestionAdministradores"),
  "EvaluarReservas": () => import("../pages/EvaluarReservas"),
  "ReportesUso": () => import("../pages/ReportesUso"),
  "Inicio": () => import("../pages/Inicio"),
  "Perfil": () => import("../pages/Perfil"),
  "Error404": () => import("../pages/Error404"),
};

const router = [
  {
    path: "/",
    element:
      <SessionState>
        <Outlet />
      </SessionState>,
    children: [
      {
        path: ROUTES.auth.login,
        element: <LoadComponent component="Login" componentsMap={componentMap} loading={<></>} />,
      },
      {
        path: ROUTES.auth.register,
        element: <LoadComponent component="Register" componentsMap={componentMap} loading={<></>} />,
      },
      {
        path: ROUTES.dashboard.home,
        element: <LoadComponent component="Dashboard" componentsMap={componentMap} loading={<></>} />,
      },
      {
        path: ROUTES.dashboard.profile,
        element: <LoadComponent component="Perfil" componentsMap={componentMap} loading={<></>}/>,
      },
      {
        path: "/dashboard/espacios",
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <LoadComponent component="GestionEspacios" componentsMap={componentMap} loading={<></>} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/consulta-espacios",
        element: (
          <ProtectedRoute allowedRoles={['superadmin', 'administrador', 'estudiante', 'docente']}>
            <LoadComponent component="ConsultaDisponibilidad" componentsMap={componentMap} loading={<></>} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/mis-reservas",
        element: (
          <ProtectedRoute allowedRoles={['estudiante', 'docente']}>
            <LoadComponent component="MisReservas" componentsMap={componentMap} loading={<></>} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/usuarios",
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <LoadComponent component="GestionUsuarios" componentsMap={componentMap} loading={<></>} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/administradores",
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <LoadComponent component="GestionAdministradores" componentsMap={componentMap} loading={<></>} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/evaluar-reservas",
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <LoadComponent component="EvaluarReservas" componentsMap={componentMap} loading={<></>} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/reportes-uso",
        element: (
          <ProtectedRoute allowedRoles={['superadmin', 'administrador']}>
            <LoadComponent component="ReportesUso" componentsMap={componentMap} loading={<></>} />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.errors.notFound,
        element: <LoadComponent component="Error404" componentsMap={componentMap} loading={<></>} />,
      },
    ],
  },
];

export default router;
