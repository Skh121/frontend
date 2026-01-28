import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { SESSION_IDLE_TIMEOUT } from '../utils/constants';

const useIdleTimeout = (timeoutMs = SESSION_IDLE_TIMEOUT) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const lastActivityRef = useRef(Date.now());
    const lastHeartbeatRef = useRef(Date.now());
    const checkIntervalRef = useRef(null);

    const handleLogout = useCallback(async () => {
        if (user) {
            await logout();
            toast.error('Session expired. Please log in again.');
            navigate('/login', {
                state: {
                    from: location.pathname,
                    message: 'Your session has expired.'
                }
            });
        }
    }, [user, logout, navigate, location.pathname]);

    useEffect(() => {
        if (!user) {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            return;
        }

        lastActivityRef.current = Date.now();
        lastHeartbeatRef.current = Date.now();

        const verifySessionStatus = async () => {
            const now = Date.now();
            lastHeartbeatRef.current = now;
            try {
                // Dynamically import to avoid circular dependencies or early loading
                const { default: authAPI } = await import('../api/auth.api');
                await authAPI.getCurrentUser();
            } catch (error) {
                // The axios interceptor handles the 401 and redirect.
                // We don't need to do anything here.
            }
        };

        const activityHandler = () => {
            const now = Date.now();
            lastActivityRef.current = now;

            // If user interacts and it's been > 5s since last server check,
            // verify their session immediately.
            if (now - lastHeartbeatRef.current > 5000) {
                verifySessionStatus();
            }
        };

        const checkIdle = async () => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;

            // 1. Check for idle timeout
            if (elapsed >= timeoutMs) {
                handleLogout();
                return;
            }

            // 2. Background Heartbeat (keep checking even if no interaction)
            // Reduced to 15 seconds for faster sync
            const HEARTBEAT_INTERVAL = 15000;
            if (now - lastHeartbeatRef.current > HEARTBEAT_INTERVAL) {
                verifySessionStatus();
            }
        };

        // Events to watch
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, activityHandler));

        // Periodically check (every 5 seconds)
        checkIntervalRef.current = setInterval(checkIdle, 5000);

        return () => {
            events.forEach(event => window.removeEventListener(event, activityHandler));
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
    }, [user, timeoutMs, handleLogout]);

    return null;
};

export default useIdleTimeout;
