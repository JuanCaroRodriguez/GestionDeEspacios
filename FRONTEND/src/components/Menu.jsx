import { Link } from 'react-router-dom';
import { CalendarIcon, ClassroomIcon, DeviceIcon, HomeIcon } from '../components/Icons';
import { ROUTES } from '../tools/CONSTANTS';
import useSession from '../context/Auth/useSession';

const Menu = () => {

    const { session } = useSession();

    return (
        <aside className="w-64 bg-gray-800 text-white p-3 h-auto">
            <nav>
                <ul className='text-lg pt-5'>
                    <li>
                        <Link to={ROUTES.dashboard.home} className="flex items-center gap-4 mb-1 p-4 py-3 hover:bg-gray-700 rounded-lg">
                            <HomeIcon fill="white" /><p>Inicio</p>
                        </Link>
                    </li>
                    <li>
                        <Link to={ROUTES.dashboard.rooms} className="flex items-center gap-4 mb-1 p-4 py-3 hover:bg-gray-700 rounded-lg">
                            <ClassroomIcon /><p>Salones</p>
                        </Link>
                    </li>
                    <li>
                        <Link to={ROUTES.dashboard.reservations} className="flex items-center gap-4 mb-1 p-4 py-3 hover:bg-gray-700 rounded-lg">
                            <CalendarIcon /><p>Reservas</p>
                        </Link>
                    </li>
                    {
                        session?.user?.role === 'administrativo' && (
                            <li>
                                <Link to={ROUTES.dashboard.devices} className="flex items-center gap-4 mb-1 p-4 py-3 hover:bg-gray-700 rounded-lg">
                                    <DeviceIcon /><p>Dispositivos IoT</p>
                                </Link>
                            </li>
                        )
                    }

                </ul>
            </nav>
        </aside>
    );
};

export default Menu;