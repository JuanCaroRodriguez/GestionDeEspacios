import { Navigate, useLocation } from 'react-router-dom';
import useSession from '@context/Auth/useSession';
import empresasService from '@api/services/empresas.service';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, requireEmpresa = false }) => {
    const { session } = useSession();
    const location = useLocation();
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verificarEmpresa = async () => {
            // Leer sesión directamente del localStorage para tener datos actualizados
            const localSession = JSON.parse(localStorage.getItem('session'));
            
            console.log('ProtectedRoute - Verificando empresa:', {
                requireEmpresa,
                contextSession: session,
                localSession: localSession,
                userTipo: localSession?.user?.tipo,
                id_empresa: localSession?.user?.id_empresa
            });
            
            // Solo verificar si se requiere empresa y es superadmin
            if (requireEmpresa && localSession?.user?.tipo === 'superadmin') {
                // Usar directamente el id_empresa de la sesión local
                if (localSession.user.id_empresa) {
                    console.log('ProtectedRoute - Empresa encontrada:', localSession.user.id_empresa);
                    setEmpresa({ id: localSession.user.id_empresa });
                } else {
                    console.log('ProtectedRoute - Sin empresa para superadmin');
                    setEmpresa(null);
                }
            }
            setLoading(false);
        };

        if (session?.user) {
            verificarEmpresa();
        } else {
            setLoading(false);
        }
    }, [session, requireEmpresa]);

    // Si está cargando, mostrar spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    // Si no hay sesión, redirigir al login
    if (!session?.user) {
        return <Navigate to="/auth/welcome" state={{ from: location }} replace />;
    }

    // Leer sesión actual del localStorage para la decisión
    const currentSession = JSON.parse(localStorage.getItem('session'));
    
    // Si se requiere empresa y es superadmin sin empresa, redirigir al dashboard
    console.log('ProtectedRoute - Decisión de bloqueo:', {
        requireEmpresa,
        userTipo: currentSession?.user?.tipo,
        empresa: empresa,
        bloquear: requireEmpresa && currentSession?.user?.tipo === 'superadmin' && !empresa
    });
    
    if (requireEmpresa && currentSession?.user?.tipo === 'superadmin' && !empresa) {
        console.log('ProtectedRoute - Bloqueando acceso');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
                        <p className="text-gray-600 mb-6">
                            Para acceder a esta sección, primero debes configurar tu empresa.
                        </p>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Configurar Empresa
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Si todo está correcto, mostrar el componente
    return children;
};

export default ProtectedRoute;
