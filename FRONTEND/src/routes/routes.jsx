import { Outlet } from "react-router-dom";
import App from "../App";
import { ROUTES } from "../tools/CONSTANTS";
import LoadComponent from "./LoadComponents";
import SessionState from "../context/Auth/SessionState";
import ReservationState from "../context/Reservation/ReservationState";

// Mapa estático de rutas a módulos
const componentMap = {
  "Login": () => import("../pages/login"),
  "Register": () => import("../pages/register"),
  "Portada": () => import("../pages/Portada"),
  "Inicio": () => import("../pages/Inicio"),
  "HorarioB": () => import("../pages/HorarioB"),
  "HorarioS": () => import("../pages/HorarioS"),
  "ReservaA": () => import("../pages/ReservaA"),
  "ReservaU": () => import("../pages/ReservaU"),
  "Perfil": () => import("../pages/Perfil"),
  "Dispositivos": () => import("../pages/Dispositivos"),
};

const router = [
  {
    path: "/",
    element:
      <SessionState>
        <ReservationState>
          <Outlet />
        </ReservationState>
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
        element:

          <App />,
        children: [
          {
            path: ROUTES.dashboard.home,
            element: <LoadComponent component="Inicio" componentsMap={componentMap} loading={<></>} />,
          },
          {
            path: ROUTES.dashboard.rooms,
            element: <LoadComponent component="HorarioB" componentsMap={componentMap} loading={<></>} />,
          },
          {
            path: ROUTES.dashboard.week+"/:id",
            element: <LoadComponent component="HorarioS" componentsMap={componentMap} loading={<></>} />,
          },
          {
            path: ROUTES.dashboard.reservations,
            element: <LoadComponent component="ReservaU" componentsMap={componentMap} loading={<></>} />,
          },
          {
            path: ROUTES.dashboard.profile,
            element: <LoadComponent component="Perfil" componentsMap={componentMap} loading={<></>}/>,
          },
          {
            path: ROUTES.dashboard.devices,
            element: <LoadComponent component="Dispositivos" componentsMap={componentMap} loading={<></>}/>,
          },
          {
            path: "*",
            element: <>Error 404</>,
          },
        ],
        
        errorElement: <>Error 500</>,
      },
      {
        path: "*",
        element: <>Error 404</>,
      },
    ],
  },
];

export default router;
