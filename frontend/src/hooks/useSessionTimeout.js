import { useEffect, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const INACTIVITY_MINUTES = 1;
const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;

export default function useSessionTimeout() {
    const inactivityTimerRef = useRef(null);
    const expiryTimerRef = useRef(null);
    const navigate = useNavigate();

    // logout helper
    const doLogout = useCallback(async (silent = false) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post('/user/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => {});
            }
        } finally {
            const role = localStorage.getItem('userRole');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('customerId');
            if (!silent) alert('You have been logged out due to inactivity');
            // 👇 redirect based on role
            if (role === 'Admin' || role === 'Collector') {
                navigate('/user/login');
            } else {
                navigate('/customer/login'); // fallback
            }
        }
    }, [navigate]);

    // ---------------- Inactivity Timer ----------------
    const clearInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    }, []);

    const resetInactivityTimer = useCallback(() => {
        clearInactivityTimer();
        inactivityTimerRef.current = setTimeout(() => {
            doLogout(); // logout after inactivity
        }, INACTIVITY_MS);
    }, [clearInactivityTimer, doLogout]);

    // ---------------- Expiry Timer ----------------
    const clearExpiryTimer = useCallback(() => {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    }, []);

    const checkTokenExpiry = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const { exp } = jwtDecode(token);
            if (!exp) return;
            const expMs = exp * 1000;
            if (Date.now() >= expMs) {
                doLogout(true); // already expired
            } else {
                const timeLeft = expMs - Date.now();
                clearExpiryTimer();
                expiryTimerRef.current = setTimeout(() => doLogout(true), timeLeft);
            }
        } catch {
            doLogout(true);
        }
    }, [doLogout, clearExpiryTimer]);

    // ---------------- Effect ----------------
    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach((ev) => window.addEventListener(ev, resetInactivityTimer));

        resetInactivityTimer();  // start inactivity timer
        checkTokenExpiry();      // start expiry timer

        const intervalId = setInterval(checkTokenExpiry, 60 * 1000); // re-check every minute

        return () => {
            clearInactivityTimer();
            clearExpiryTimer();
            events.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer));
            clearInterval(intervalId);
        };
    }, [resetInactivityTimer, checkTokenExpiry, clearInactivityTimer, clearExpiryTimer]);
}
