document.addEventListener('DOMContentLoaded', async () => {
    const citasTbody = document.getElementById('citas-tbody');
    if (!citasTbody) return;

    const renderCitas = async () => {
        try {
            const citas = await CitasStore.fetchAll();
            const userId = CitasStore.getCurrentUserId();
            const citasDelUsuario = userId ? citas.filter((cita) => cita.id_usuario === userId) : [];

            if (citasDelUsuario.length === 0) {
                citasTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No tienes citas agendadas aún.</td></tr>`;
                return;
            }

            citasTbody.innerHTML = '';

            citasDelUsuario.forEach((cita) => {
                const fechaObj = new Date(cita.fecha_hora);
                const fechaStr = `${String(fechaObj.getDate()).padStart(2, '0')}/${String(fechaObj.getMonth() + 1).padStart(2, '0')}/${fechaObj.getFullYear()}`;
                let horas = fechaObj.getHours();
                const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
                const ampm = horas >= 12 ? 'pm' : 'am';
                horas = horas % 12;
                horas = horas ? horas : 12;
                const horaStr = `${String(horas).padStart(2, '0')}:${minutos}${ampm}`;

                let badgeClass = 'status-pendiente';
                if (cita.estado === 'programada') badgeClass = 'status-confirmada';
                if (cita.estado === 'cancelada') badgeClass = 'status-cancelada';
                if (cita.estado === 'en curso') badgeClass = 'status-confirmada';
                if (cita.estado === 'reprogramada') badgeClass = 'status-pendiente';
                if (cita.estado === 'asistio') badgeClass = 'status-confirmada';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${fechaStr}<br><small>${horaStr}</small></td>
                    <td>${cita.especialidad || cita.motivo || 'Sin especialidad'}</td>
                    <td>Dr. Asignado</td>
                    <td>${cita.motivo || 'Sin motivo'}</td>
                    <td><span class="status-badge ${badgeClass}">${String(cita.estado || 'programada').toUpperCase()}</span></td>
                `;
                citasTbody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            AlertSystem.error('Error', 'Hubo un problema de conexión con el servidor.');
        }
    };

    await renderCitas();
    CitasStore.subscribe(renderCitas);
    window.addEventListener('focus', renderCitas);
});
