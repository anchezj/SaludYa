window.CitasStore = (() => {
    const CACHE_KEY = 'saludya:citas-cache';
    const SIGNAL_KEY = 'saludya:citas-updated';
    const listeners = new Set();

    const getToken = () => localStorage.getItem('token');

    const decodeTokenPayload = (token) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return null;
        }
    };

    const getCurrentUserId = () => decodeTokenPayload(getToken() || '')?.usuario?.id ?? null;

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
        localStorage.setItem(CACHE_KEY, JSON.stringify({ updatedAt: Date.now(), citas }));
    };

    const notify = () => {
        localStorage.setItem(SIGNAL_KEY, String(Date.now()));
        listeners.forEach((listener) => listener());
    };

    const fetchAll = async () => {
        const citas = window.MockBackend?.api.getCitas() || [];
        writeCache(citas);
        return citas;
    };

    const refresh = async () => {
        const citas = await fetchAll();
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
