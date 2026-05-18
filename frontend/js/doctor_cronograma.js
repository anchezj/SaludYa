document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const reportBtn = document.querySelector('.schedule-report-btn');

    if (!calendarEl || typeof FullCalendar === 'undefined') {
        return;
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: '2026-04-01',
        locale: 'en',
        fixedWeekCount: true,
        firstDay: 0,
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
        events: [
            { title: 'All Day Event', start: '2026-04-01', backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
            { title: 'Long Event', start: '2026-04-07', end: '2026-04-09', backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
            { title: 'Repeating Event', start: '2026-04-09T10:00:00', backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
            { title: 'Conference', start: '2026-04-27', backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
            { title: 'Birthday Party', start: '2026-04-29', backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
            { title: 'Click for Google', start: '2026-04-27T10:30:00', backgroundColor: '#4a90e2', borderColor: '#4a90e2' }
        ],
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

    if (reportBtn) {
        reportBtn.addEventListener('click', () => {});
    }
});
