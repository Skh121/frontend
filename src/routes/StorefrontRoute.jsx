import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const StorefrontRoute = ({ children }) => {
    const { user } = useAuthStore();

    // If user is admin, they should stay in dashboard
    if (user?.role?.toLowerCase() === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default StorefrontRoute;
