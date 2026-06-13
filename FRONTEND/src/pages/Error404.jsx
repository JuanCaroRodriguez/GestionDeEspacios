import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { ROUTES } from '../tools/CONSTANTS';
import { MdManageAccounts } from 'react-icons/md';

const Error404 = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icono y Número 404 */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4">
                        <FiAlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-6xl font-bold text-white mb-2">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4">
                        Página No Encontrada
                    </h2>
                </div>

                {/* Mensaje de Error */}
                <div className="mb-8">
                    <p className="text-gray-400 mb-4">
                        ¡Oops! La página que estás buscando no existe o ha sido movida.
                    </p>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-3">
                    {/* Botón Principal - Ir al Inicio */}
                    <Link
                        to={ROUTES.dashboard.home}
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        <FiHome className="w-5 h-5 mr-2" />
                        Ir al Dashboard
                    </Link>

                    {/* Botón Secundario - Volver Atrás */}
                    <button
                        onClick={() => window.history.back()}
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                        <FiArrowLeft className="w-5 h-5 mr-2" />
                        Volver Atrás
                    </button>
                </div>

                {/* Información Adicional */}
                <div className="mt-12 pt-8 border-t border-gray-700">
                    <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Sistema Online</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MdManageAccounts className="w-6 h-6" />
                            <span>Gestión de Espacios</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-gray-600 text-xs">
                    <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
                </div>
            </div>

            {/* Efectos de Fondo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Error404;
