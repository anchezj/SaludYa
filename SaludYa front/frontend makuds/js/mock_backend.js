(function () {
    const PREFIX = 'saludya:mock:';
    const USERS_KEY = `${PREFIX}users`;
    const SESSIONS_KEY = `${PREFIX}sessions`;
    const CITES_KEY = `${PREFIX}citas`;
    const RECOVERY_KEY = `${PREFIX}recovery`;

    const nowIso = () => new Date().toISOString();
    const addDays = (days, hour = 9, minute = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        date.setHours(hour, minute, 0, 0);
        return date.toISOString();
    };
    const safeParse = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    };
    const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const uid = () => `u_${Math.random().toString(36).slice(2, 10)}`;
    const cid = () => `c_${Math.random().toString(36).slice(2, 10)}`;

    const seed = () => {
        if (!localStorage.getItem(USERS_KEY)) {
            save(USERS_KEY, [
                {
                    id: 1,
                    nombre: 'Mariana López',
                    email: 'paciente@saludya.com',
                    password: '123456',
                    rol: 'paciente',
                    numero_contacto: '3001234567',
                    edad: 29,
                    fecha_nacimiento: '1997-04-12',
                    direccion: 'Calle 12 # 34-56'
                },
                {
                    id: 2,
                    nombre: 'Dr. Andrés Torres',
                    email: 'doctor@saludya.com',
                    password: '123456',
                    rol: 'especialista',
                    numero_contacto: '3019876543',
                    edad: 41,
                    fecha_nacimiento: '1985-09-08',
                    direccion: 'Avenida 8 # 45-22'
                }
            ]);
        }

        if (!localStorage.getItem(CITES_KEY)) {
            save(CITES_KEY, [
                { id_cita: 1, id_usuario: 1, paciente: 'Mariana López', especialidad: 'Medicina General', motivo: 'Control general', fecha_hora: addDays(1, 9, 0), estado: 'programada' },
                { id_cita: 2, id_usuario: 1, paciente: 'Mariana López', especialidad: 'Dermatología', motivo: 'Revisión de piel', fecha_hora: addDays(3, 11, 30), estado: 'reprogramada' },
                { id_cita: 3, id_usuario: 1, paciente: 'Mariana López', especialidad: 'Pediatría', motivo: 'Consulta', fecha_hora: addDays(-4, 14, 0), estado: 'completada' },
                { id_cita: 4, id_usuario: 2, paciente: 'Paciente Demo', especialidad: 'Cardiología', motivo: 'Chequeo', fecha_hora: addDays(2, 10, 0), estado: 'programada' }
            ]);
        }
    };

    const getUsers = () => safeParse(USERS_KEY, []);
    const setUsers = (users) => save(USERS_KEY, users);
    const getCitas = () => safeParse(CITES_KEY, []);
    const setCitas = (citas) => save(CITES_KEY, citas);

    const getSession = () => safeParse(SESSIONS_KEY, {});
    const setSession = (session) => save(SESSIONS_KEY, session);
    const getRecovery = () => safeParse(RECOVERY_KEY, {});
    const setRecovery = (recovery) => save(RECOVERY_KEY, recovery);

    const tokenFor = (user) => `mock.${btoa(JSON.stringify({ usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } }))}.token`;

    const getUserFromToken = (token) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload)).usuario;
        } catch {
            return null;
        }
    };

    const api = {
        login({ email, password }) {
            const user = getUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
            if (!user) throw new Error('Credenciales inválidas');
            const token = tokenFor(user);
            setSession({ token, userId: user.id, updatedAt: nowIso() });
            return { token, usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } };
        },
        register({ nombre, email, password, rol }) {
            const users = getUsers();
            if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
                throw new Error('El correo ya está registrado');
            }
            const user = { id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1, nombre, email, password, rol: rol || 'paciente', numero_contacto: '', edad: null, fecha_nacimiento: '', direccion: '' };
            users.push(user);
            setUsers(users);
            return { ok: true };
        },
        forgotPassword({ email }) {
            const user = getUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
            if (!user) throw new Error('No encontramos una cuenta con ese correo');
            const token = `recovery-${Math.random().toString(36).slice(2, 8)}`;
            setRecovery({ ...getRecovery(), [token]: user.email });
            return { ok: true, token };
        },
        resetPassword({ token, newPassword }) {
            const recovery = getRecovery();
            const email = recovery[token];
            if (!email) throw new Error('Token de recuperación inválido');
            const users = getUsers();
            const user = users.find((u) => u.email === email);
            if (!user) throw new Error('Usuario no encontrado');
            user.password = newPassword;
            delete recovery[token];
            setRecovery(recovery);
            setUsers(users);
            return { ok: true };
        },
        getProfile() {
            const session = getSession();
            const user = getUsers().find((u) => u.id === session.userId);
            if (!user) throw new Error('Sesión no encontrada');
            return { ...user };
        },
        updateProfile(payload) {
            const session = getSession();
            const users = getUsers();
            const user = users.find((u) => u.id === session.userId);
            if (!user) throw new Error('Sesión no encontrada');
            Object.assign(user, payload);
            setUsers(users);
            return { ...user };
        },
        getCitas() {
            return getCitas();
        },
        createCita({ motivo, fecha_hora }) {
            const session = getSession();
            const users = getUsers();
            const user = users.find((u) => u.id === session.userId);
            if (!user) throw new Error('Sesión no encontrada');
            const citas = getCitas();
            const cita = { id_cita: cid(), id_usuario: user.id, paciente: user.nombre, especialidad: motivo, motivo, fecha_hora, estado: 'programada' };
            citas.push(cita);
            setCitas(citas);
            return cita;
        },
        updateCitaEstado(id, nuevoEstado) {
            const citas = getCitas();
            const cita = citas.find((c) => String(c.id_cita) === String(id));
            if (!cita) throw new Error('Cita no encontrada');
            cita.estado = nuevoEstado;
            setCitas(citas);
            return cita;
        }
    };

    seed();
    const originalFetch = window.fetch?.bind(window);
    window.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url || '';
        const method = String(init.method || 'GET').toUpperCase();
        const body = init.body ? JSON.parse(init.body) : {};

        const ok = (data) => new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

        const fail = (message, status = 400) => new Response(JSON.stringify({ message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });

        try {
            if (url.includes('/api/auth/login') && method === 'POST') return ok(api.login(body));
            if (url.includes('/api/auth/register') && method === 'POST') return ok(api.register(body));
            if (url.includes('/api/auth/forgot-password') && method === 'POST') return ok(api.forgotPassword(body));
            if (url.includes('/api/auth/reset-password') && method === 'POST') return ok(api.resetPassword(body));
            if (url.includes('/api/auth/profile') && method === 'GET') return ok(api.getProfile());
            if (url.includes('/api/auth/profile') && method === 'PUT') return ok(api.updateProfile(body));
            if (url.includes('/api/citas/todas') && method === 'GET') return ok(api.getCitas());
            if (url.includes('/api/citas/crear') && method === 'POST') return ok(api.createCita(body));
            if (url.includes('/api/citas/estado/') && method === 'PUT') {
                const id = url.split('/').pop();
                return ok(api.updateCitaEstado(id, body.nuevoEstado));
            }
        } catch (error) {
            return fail(error.message || 'Error local', 400);
        }

        return originalFetch ? originalFetch(input, init) : fail('Fetch no soportado', 501);
    };

    window.MockBackend = { api, getUserFromToken, tokenFor };
})();
