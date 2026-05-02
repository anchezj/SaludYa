document.addEventListener('DOMContentLoaded', () => {
    // Custom Select Logic
    const customSelect = document.querySelector('.custom-select');
    const selectDropdown = document.querySelector('.select-dropdown');
    const selectOptions = document.querySelectorAll('.select-option');

    if (customSelect && selectDropdown) {
        customSelect.addEventListener('click', () => {
            selectDropdown.classList.toggle('active');
        });

        selectOptions.forEach(option => {
            option.addEventListener('click', () => {
                customSelect.textContent = option.textContent;
                selectDropdown.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target) && !selectDropdown.contains(e.target)) {
                selectDropdown.classList.remove('active');
            }
        });
    }

    // Calendar Logic
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = new Date(); // Initially select today

    const calendarDays = document.getElementById('calendar-days');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    const displayDay = document.getElementById('display-day');
    const displayMonthYear = document.getElementById('display-month-year');

    function renderCalendar() {
        calendarDays.innerHTML = '';

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        calendarMonthYear.innerHTML = `${monthNames[currentMonth]} de ${currentYear} <i class="ti ti-caret-down" style="font-size: 12px; margin-left: 4px;"></i>`;

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarDays.appendChild(emptyDiv);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;

            // Check if it's today
            const today = new Date();
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            // Check if it's the selected date
            if (i === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()) {
                dayDiv.classList.add('selected');
            }

            dayDiv.addEventListener('click', () => {
                selectedDate = new Date(currentYear, currentMonth, i);
                updateDisplay();
                renderCalendar(); // Re-render to update selected class
            });

            calendarDays.appendChild(dayDiv);
        }
    }

    function updateDisplay() {
        displayDay.textContent = selectedDate.getDate();
        displayMonthYear.innerHTML = `${monthNames[selectedDate.getMonth()]}<br>${selectedDate.getFullYear()}`;
    }

    if (calendarDays && calendarMonthYear && prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });

        // Initial render
        updateDisplay();
        renderCalendar();
    }
});
