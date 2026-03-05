import { Link } from "react-router-dom";
import "../App.css";
import Table from "../components/table/Table";
import { string } from "../tools/Types";
import { ROUTES } from "../tools/CONSTANTS";
import useSession from "../context/Auth/useSession";

const Inicio = () => {

    const { session } = useSession();

    return (
        <main className="flex flex-col flex-1 justify-center items-center p-4 bg-slate-50">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="54"  height="54"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="mb-6 icon icon-tabler icons-tabler-outline icon-tabler-brand-among-us"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.646 12.774c-1.939 .396 -4.467 .317 -6.234 -.601c-2.454 -1.263 -1.537 -4.66 1.423 -4.982c2.254 -.224 3.814 -.354 5.65 .214c.835 .256 1.93 .569 1.355 3.281c-.191 1.067 -1.07 1.904 -2.194 2.088z" /><path d="M5.84 7.132c.083 -.564 .214 -1.12 .392 -1.661c.456 -.936 1.095 -2.068 3.985 -2.456a22.464 22.464 0 0 1 2.867 .08c1.776 .14 2.643 1.234 3.287 3.368c.339 1.157 .46 2.342 .629 3.537v11l-12.704 -.019c-.552 -2.386 -.262 -5.894 .204 -8.481" /><path d="M17 10c.991 .163 2.105 .383 3.069 .67c.255 .13 .52 .275 .534 .505c.264 3.434 .57 7.448 .278 9.825h-3.881" /></svg>
            <h2 className="text-3xl font-semibold mb-4">
                Bienvenido {session?.user.role } {session?.user?.name}
            </h2>
            <p className="mb-8 text-center">
                Consulta la disponibilidad de los salones o revisa tus reservas
                pendientes.
            </p>
            <div className="flex gap-6 mt-4">
                <Link to={ROUTES.dashboard.rooms} className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg">
                    Salones
                </Link>
                <Link to={ROUTES.dashboard.reservations} className="px-6 py-3 bg-green-500 text-white rounded-lg text-lg">
                    Reservas
                </Link>
            </div>
            
        </main>
    );
};

export default Inicio;
