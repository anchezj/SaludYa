document.addEventListener('DOMContentLoaded', async () => {
    const token = CitasStore.getToken();
    if (!token) {
        window.location.href = '../../login.html';
        return;
    }

    const container = document.getElementById('citas-body');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('estado-modal');
    const modalClose = document.getElementById('modal-cerrar');
    const modalButtons = document.querySelectorAll('.modal-btn');

    if (!container) return;

    let estadoPendiente = null;

    const showAlert = (type, title, msg) => {
        AlertSystem[type](title, msg);
    };

    const normalizarEstado = (estado) => String(estado || 'programada').trim().toLowerCase();

    const renderCita = (cita) => {
        const fecha = new Date(cita.fecha_hora);
        const horaStr = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
        const fechaStr = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
        const estado = normalizarEstado(cita.estado);

        const tr = document.createElement('tr');
        tr.className = 'cita';
        tr.dataset.id = cita.id_cita;
        tr.dataset.estado = estado;

        const tdFecha = document.createElement('td');
        tdFecha.innerHTML = `${fechaStr}<br><small>${horaStr}</small>`;

        const tdEspecialidad = document.createElement('td');
        tdEspecialidad.textContent = cita.especialidad || cita.motivo || 'Sin especialidad';

        const tdPaciente = document.createElement('td');
        tdPaciente.textContent = cita.paciente || 'Sin nombre';

        const tdMotivo = document.createElement('td');
        tdMotivo.textContent = cita.motivo || 'Sin motivo';

        const tdEstado = document.createElement('td');
        tdEstado.innerHTML = `<span class="estado ${estado.replace(/\s+/g, '')}">${estado.toUpperCase()}</span>`;

        const tdAcciones = document.createElement('td');
        const btnCambiar = document.createElement('button');
        btnCambiar.textContent = 'Cambiar';
        btnCambiar.className = 'cambiar-estado';
        btnCambiar.onclick = () => openModal(cita.id_cita, estado);
        tdAcciones.appendChild(btnCambiar);

        tr.append(tdFecha, tdEspecialidad, tdPaciente, tdMotivo, tdEstado, tdAcciones);
        return tr;
    };

    const aplicarFiltro = () => {
        const activo = document.querySelector('.filter-btn.active')?.dataset.status || 'todas';
        document.querySelectorAll('tr.cita').forEach((el) => {
            const estado = el.dataset.estado || '';
            el.style.display = (activo === 'todas' || estado === activo) ? '' : 'none';
        });
    };

    const cargarCitas = async () => {
        try {
            const citas = await CitasStore.fetchAll();
            container.innerHTML = '';
            citas.forEach((cita) => {
                container.appendChild(renderCita(cita));
            });
            aplicarFiltro();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Error', error.message || 'No se pudieron cargar las citas.');
        }
    };

    const cerrarModal = () => {
        if (modal) {
            modal.style.display = 'none';
        }
        estadoPendiente = null;
    };

    const openModal = (id, estadoActual) => {
        estadoPendiente = id;
        if (modal) {
            modal.dataset.estadoActual = estadoActual;
            modal.style.display = 'flex';
            modal.style.zIndex = '20000';
            modal.style.pointerEvents = 'auto';
        }
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            const res = await fetch(`/api/citas/estado/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nuevoEstado })
            });

            if (!res.ok) {
                throw new Error('No se pudo actualizar');
            }

            showAlert('success', 'Actualizado', `Cita ${nuevoEstado}`);
            await CitasStore.refresh();
            await cargarCitas();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Error', error.message);
        }
    };

    filterButtons.forEach((btn) => {
        btn.onclick = () => {
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            aplicarFiltro();
        };
    });

    modalButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (!estadoPendiente) return;
            const citaId = estadoPendiente;
            const nuevoEstado = btn.dataset.estado;
            cerrarModal();
            await cambiarEstado(citaId, nuevoEstado);
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', cerrarModal);
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                cerrarModal();
            }
        });
    }

    window.openModal = openModal;

    await cargarCitas();
    CitasStore.subscribe(cargarCitas);
    window.addEventListener('focus', cargarCitas);
});
