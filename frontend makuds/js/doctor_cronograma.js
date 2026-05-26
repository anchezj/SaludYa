document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const reportBtn = document.querySelector('.schedule-report-btn');

    if (!calendarEl || typeof FullCalendar === 'undefined') {
        return;
    }

    const coloresEstado = {
        programada: { bg: '#28a745', border: '#28a745' },
        'en curso': { bg: '#007bff', border: '#007bff' },
        reprogramada: { bg: '#ffc107', border: '#e0a800' },
        cancelada: { bg: '#dc3545', border: '#dc3545' },
        asistio: { bg: '#28a745', border: '#28a745' }
    };

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        slotMinTime: '08:00:00',
        slotMaxTime: '17:00:00',
        businessHours: {
            start: '08:00',
            end: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5]
        },
        locale: 'es',
        fixedWeekCount: true,
        firstDay: 1,
        navLinks: false,
        selectable: false,
        editable: false,
        dayMaxEvents: true,
        height: 'auto',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            today: 'today',
            month: 'month',
            week: 'week',
            day: 'day',
            list: 'list'
        },
        events: [],
        eventDisplay: 'block',
        eventContent: (arg) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'fc-event-content';

            const title = document.createElement('div');
            title.className = 'fc-event-title';
            title.textContent = arg.event.title;

            wrapper.appendChild(title);
            return { domNodes: [wrapper] };
        }
    });

    calendar.render();

    const cargarCitas = async () => {
        try {
            const citas = await CitasStore.fetchAll();
            const eventosCalendario = citas.map((cita) => {
                const colores = coloresEstado[String(cita.estado || '').toLowerCase()] || { bg: '#6c757d', border: '#6c757d' };
                const tituloEspecialidad = cita.especialidad || cita.motivo || 'Sin especialidad';
                const tituloPaciente = cita.paciente ? ` - ${cita.paciente}` : '';

                return {
                    id: cita.id_cita,
                    title: `${tituloEspecialidad}${tituloPaciente} - ${String(cita.estado || 'programada').toUpperCase()}`,
                    start: cita.fecha_hora,
                    end: new Date(new Date(cita.fecha_hora).getTime() + 30 * 60 * 1000).toISOString(),
                    allDay: false,
                    backgroundColor: colores.bg,
                    borderColor: colores.border,
                    textColor: String(cita.estado || '').toLowerCase() === 'cancelada' ? '#000' : '#fff'
                };
            });

            calendar.removeAllEvents();
            calendar.addEventSource(eventosCalendario);
        } catch (error) {
            console.error('Error al cargar las citas:', error);
        }
    };

    if (reportBtn) {
        reportBtn.addEventListener('click', async () => {
            try {
                // 1. Traer data
                const citas = await CitasStore.fetchAll();

                // 2. Construir CSV (Cabeceras + Filas)
                const cabeceras = ['ID', 'Paciente', 'Especialidad', 'Fecha y Hora', 'Estado'];
                const filas = citas.map(cita => {
                    return `${cita.id_cita || ''},"${cita.paciente || ''}","${cita.especialidad || cita.motivo || ''}","${cita.fecha_hora || ''}","${cita.estado || ''}"`;
                });
                const contenidoCSV = [cabeceras.join(','), ...filas].join('\n');

                // 3. Crear archivo Blob
                const blob = new Blob(['\ufeff' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);

                // 4. Descargar
                const link = document.createElement('a');
                link.href = url;
                link.download = 'cronograma_citas.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

            } catch (error) {
                console.error('Error al generar el reporte:', error);
            }
        });
    }




    cargarCitas();
    CitasStore.subscribe(cargarCitas);
    window.addEventListener('focus', cargarCitas);
});
