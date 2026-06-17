import { Navigate } from 'react-router-dom';
import useSession from '../context/Auth/useSession';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { session, loading_auth } = useSession();

    if (loading_auth || session === undefined) return null;

    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    const userTipo = session?.user?.tipo;

    if (allowedRoles && !allowedRoles.includes(userTipo)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
