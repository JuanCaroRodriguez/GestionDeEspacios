import { Outlet } from "react-router-dom";
import App from "../App";
import { ROUTES } from "../tools/CONSTANTS";
import LoadComponent from "./LoadComponents";
import SessionState from "../context/Auth/SessionState";

// Mapa estático de rutas a módulos
const componentMap = {
  "Login": () => import("../pages/login"),
  "Register": () => import("../pages/register"),
  "Portada": () => import("../pages/Portada"),
  "Dashboard": () => import("../pages/Dashboard"),
  "GestionEspacios": () => import("../pages/GestionEspacios"),
  "GestionUsuarios": () => import("../pages/GestionUsuarios"),
  "GestionAdministradores": () => import("../pages/GestionAdministradores"),
  "Inicio": () => import("../pages/Inicio"),
  "Perfil": () => import("../pages/Perfil"),
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
        path: ROUTES.auth.welcome,
        element: <LoadComponent component="Portada" componentsMap={componentMap} loading={<></>} />,
      },
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
        element: <LoadComponent component="GestionEspacios" componentsMap={componentMap} loading={<></>} />,
      },
      {
        path: "/dashboard/usuarios",
        element: <LoadComponent component="GestionUsuarios" componentsMap={componentMap} loading={<></>} />,
      },
      {
        path: "/dashboard/administradores",
        element: <LoadComponent component="GestionAdministradores" componentsMap={componentMap} loading={<></>} />,
      },
      {
        path: "*",
        element: <>Error 404</>,
      },
    ],
  },
];

export default router;
