document.addEventListener('DOMContentLoaded', () => {
    const customSelect = document.querySelector('.custom-select');
    const selectDropdown = document.querySelector('.select-dropdown');
    const selectOptions = document.querySelectorAll('.select-option');

    if (customSelect && selectDropdown) {
        customSelect.addEventListener('click', () => {
            selectDropdown.classList.toggle('active');
        });

        selectOptions.forEach((option) => {
            option.addEventListener('click', () => {
                customSelect.textContent = option.textContent;
                selectDropdown.classList.remove('active');
                generarTurnosDisponibles();
            });
        });

        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target) && !selectDropdown.contains(e.target)) {
                selectDropdown.classList.remove('active');
            }
        });
    }

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = new Date();

    const calendarDays = document.getElementById('calendar-days');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const displayDay = document.getElementById('display-day');
    const displayMonthYear = document.getElementById('display-month-year');

    const normalize = (value) => String(value || '').trim().toLowerCase();
    const getSelectedSpecialty = () => {
        if (!customSelect) return 'General';
        const value = customSelect.textContent.trim();
        return value && value !== 'Especialidad' ? value : 'General';
    };

    function renderCalendar() {
        if (!calendarDays) return;
        calendarDays.innerHTML = '';

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        if (calendarMonthYear) {
            calendarMonthYear.innerHTML = `${monthNames[currentMonth]} de ${currentYear} <i class="ti ti-caret-down" style="font-size: 12px; margin-left: 4px;"></i>`;
        }

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarDays.appendChild(emptyDiv);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = day;

            const currentDayDate = new Date(currentYear, currentMonth, day);
            currentDayDate.setHours(0, 0, 0, 0);

            if (currentDayDate < today) {
                dayDiv.classList.add('disabled');
                dayDiv.style.opacity = '0.3';
                dayDiv.style.cursor = 'not-allowed';
                dayDiv.style.backgroundColor = '#f8f9fa';
            } else {
                if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                    dayDiv.classList.add('today');
                }

                if (day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()) {
                    dayDiv.classList.add('selected');
                }

                dayDiv.addEventListener('click', () => {
                    selectedDate = new Date(currentYear, currentMonth, day);
                    updateDisplay();
                    renderCalendar();
                });
            }

            calendarDays.appendChild(dayDiv);
        }
    }

    function updateDisplay() {
        if (displayDay) {
            displayDay.textContent = selectedDate.getDate();
        }
        if (displayMonthYear) {
            displayMonthYear.innerHTML = `${monthNames[selectedDate.getMonth()]}<br>${selectedDate.getFullYear()}`;
        }
        generarTurnosDisponibles();
    }

    if (prevMonthBtn && nextMonthBtn && calendarDays && calendarMonthYear) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
            generarTurnosDisponibles();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
            generarTurnosDisponibles();
        });

        updateDisplay();
        renderCalendar();
    }

    async function generarTurnosDisponibles() {
        const tbodyCitas = document.getElementById('citas-tbody');
        if (!tbodyCitas) return;

        tbodyCitas.innerHTML = '';

        const especialidadSeleccionada = getSelectedSpecialty();
        const fechaPantalla = `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`;
        const fechaClave = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

        let citasOcupadas = [];
        if (window.CitasStore) {
            try {
                citasOcupadas = await CitasStore.fetchAll();
            } catch (error) {
                console.error('No se pudieron cargar las citas ocupadas:', error);
            }
        }

        const slotOcupado = (horaBD) => {
            return citasOcupadas.some((cita) => {
                const citaFecha = new Date(cita.fecha_hora);
                if (Number.isNaN(citaFecha.getTime())) return false;

                const citaFechaClave = `${citaFecha.getFullYear()}-${String(citaFecha.getMonth() + 1).padStart(2, '0')}-${String(citaFecha.getDate()).padStart(2, '0')}`;
                const citaHoraClave = `${String(citaFecha.getHours()).padStart(2, '0')}:${String(citaFecha.getMinutes()).padStart(2, '0')}:00`;
                const citaEspecialidad = normalize(cita.especialidad || cita.motivo);
                const estado = normalize(cita.estado);

                if (estado === 'cancelada') return false;
                return citaFechaClave === fechaClave && citaHoraClave === horaBD && citaEspecialidad === normalize(especialidadSeleccionada);
            });
        };

        let disponibles = 0;

        for (let hora = 8; hora <= 17; hora++) {
            ['00', '30'].forEach((minuto) => {
                if (hora === 17 && minuto === '30') return;

                const ampm = hora >= 12 ? 'PM' : 'AM';
                const horaFormateada = hora > 12 ? hora - 12 : hora;
                const horaVisual = `${String(horaFormateada).padStart(2, '0')}:${minuto} ${ampm}`;
                const horaBD = `${String(hora).padStart(2, '0')}:${minuto}:00`;

                if (slotOcupado(horaBD)) {
                    return;
                }

                disponibles++;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Dr. Asignado</td>
                    <td>${fechaPantalla}<br><small>${horaVisual}</small></td>
                    <td>Consultorio Principal</td>
                    <td>${especialidadSeleccionada}</td>
                    <td class="action-cell">
                        <button class="btn-seleccionar" data-hora="${horaBD}">Seleccionar</button>
                    </td>
                `;
                tbodyCitas.appendChild(tr);
            });
        }

        if (disponibles === 0) {
            tbodyCitas.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:20px;">
                        No hay horarios disponibles para esta especialidad en la fecha seleccionada.
                    </td>
                </tr>
            `;
            return;
        }

        asignarEventosSeleccionar();
    }

    function asignarEventosSeleccionar() {
        const botonesSeleccionar = document.querySelectorAll('.btn-seleccionar');

        botonesSeleccionar.forEach((boton) => {
            boton.addEventListener('click', async (e) => {
                const fila = e.target.closest('tr');
                const especialidad = fila?.cells?.[3]?.innerText || getSelectedSpecialty();
                const horaBD = boton.getAttribute('data-hora');

                const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const dia = String(selectedDate.getDate()).padStart(2, '0');
                const anio = selectedDate.getFullYear();
                const fechaSeleccionadaFormateada = `${anio}-${mes}-${dia} ${horaBD}`;

                const citaData = {
                    motivo: especialidad,
                    fecha_hora: fechaSeleccionadaFormateada
                };

                const token = localStorage.getItem('token');
                if (!token) {
                    AlertSystem.error('Error', 'Debes iniciar sesión para agendar una cita.');
                    window.location.href = '../../login.html';
                    return;
                }

                try {
                    boton.textContent = 'Procesando...';
                    boton.disabled = true;

                    const response = await fetch('/api/citas/crear', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(citaData)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        AlertSystem.success(
                            '¡Cita Confirmada!',
                            `Tu cita de ${especialidad} ha sido agendada para el ${fechaSeleccionadaFormateada} con éxito.`,
                            () => { window.location.href = 'citas.html'; }
                        );
                    } else {
                        AlertSystem.error('Error', data.message);
                        boton.textContent = 'Seleccionar';
                        boton.disabled = false;
                    }
                } catch (error) {
                    AlertSystem.error('Error', 'Hubo un problema de conexión con el servidor.');
                    boton.textContent = 'Seleccionar';
                    boton.disabled = false;
                }
            });
        });
    }
});
