import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiHome, FiUsers, FiBox, FiActivity, FiLogOut, FiMonitor } from 'react-icons/fi';
import toast from 'react-hot-toast';
import authAPI from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import confirmDialog from '../../utils/confirmDialog';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { clearUser } = useAuthStore();
    const { clearCart } = useCartStore();

    const navItems = [
        { path: '/admin', icon: FiHome, label: 'Dashboard', end: true },
        { path: '/admin/products', icon: FiBox, label: 'Products' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
        { path: '/admin/activity-logs', icon: FiActivity, label: 'Activity Logs' },
    ];

    const logoutMutation = useMutation({
        mutationFn: authAPI.logout,
        onSuccess: () => {
            clearUser();
            clearCart();
            queryClient.clear();
            toast.success('Logged out successfully');
            navigate('/login');
        },
        onError: (error) => {
            console.error('Logout failed:', error);
            // Force local logout even if server fails
            clearUser();
            clearCart();
            queryClient.clear();
            navigate('/login');
        },
    });

    const handleLogout = async () => {
        const confirmed = await confirmDialog('Are you sure you want to logout?', {
            confirmText: 'Logout',
            type: 'warning',
        });

        if (confirmed) {
            logoutMutation.mutate();
        }
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 transition-all duration-300">
            {/* Branding */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <Link to="/admin" className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <FiMonitor className="text-blue-600" />
                    <span>Admin Panel</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 opacity-75" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <FiLogOut className="w-5 h-5 opacity-75" />
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
