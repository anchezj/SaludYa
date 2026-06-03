window.CitasStore = (() => {
    const API_BASE = '/api/citas';
    const CACHE_KEY = 'saludya:citas-cache';
    const SIGNAL_KEY = 'saludya:citas-updated';
    const CHANNEL_NAME = 'saludya-citas-sync';
    const listeners = new Set();
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

    const getToken = () => localStorage.getItem('token');

    const decodeTokenPayload = (token) => {
        try {
            const payload = token.split('.')[1];
            if (!payload) return null;
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
            return JSON.parse(atob(padded));
        } catch {
            return null;
        }
    };

    const getCurrentUserId = () => {
        const token = getToken();
        if (!token) return null;
        return decodeTokenPayload(token)?.usuario?.id ?? null;
    };

    const readCache = () => {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed?.citas) ? parsed.citas : [];
        } catch {
            return [];
        }
    };

    const writeCache = (citas) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            updatedAt: Date.now(),
            citas
        }));
    };

    const notify = () => {
        const stamp = String(Date.now());
        localStorage.setItem(SIGNAL_KEY, stamp);
        if (channel) {
            channel.postMessage(stamp);
        } else {
            listeners.forEach((listener) => listener());
        }
    };

    const fetchAll = async () => {
        const token = getToken();
        if (!token) {
            return [];
        }

        const response = await fetch(`${API_BASE}/todas`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('No se pudieron cargar las citas.');
        }

        return response.json();
    };

    const refresh = async () => {
        const citas = await fetchAll();
        writeCache(citas);
        notify();
        return citas;
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    window.addEventListener('storage', (event) => {
        if (event.key === SIGNAL_KEY || event.key === CACHE_KEY) {
            listeners.forEach((listener) => listener());
        }
    });

    if (channel) {
        channel.onmessage = () => {
            listeners.forEach((listener) => listener());
        };
    }

    return {
        getToken,
        getCurrentUserId,
        getCached: readCache,
        fetchAll,
        refresh,
        subscribe,
        notify
    };
})();
