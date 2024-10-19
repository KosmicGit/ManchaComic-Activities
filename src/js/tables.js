import * as bootstrap from 'bootstrap';
import { showNotification } from "./main.js";

export function loadTables() {
    const eventsData = JSON.parse(localStorage.getItem('eventsData') || '{}');

    const dates = ['2025-10-03', '2025-10-04', '2025-10-05'];
    const times = {
        '2025-10-03': { start: 17, end: 22 },
        '2025-10-04': { start: 10, end: 22 },
        '2025-10-05': { start: 10, end: 22 }
    };

    function loadEvents(venue) {
        let tablesHtml = '';

        dates.forEach(date => {
            const dayEvents = (eventsData[date]?.activities.filter(event => event.location.venue === venue)) || [];

            tablesHtml += `<h5>${date === '2025-10-03' ? 'Viernes' : date === '2025-10-04' ? 'Sábado' : 'Domingo'} (${date}) - Horario: ${times[date].start}:00 - ${times[date].end}:00</h5>`;

            tablesHtml += `<table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Tipo</th>
                                <th>Título</th>
                                <th>Ubicación</th>
                                <th>Organizador</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;

            for (let hour = times[date].start; hour < times[date].end; hour++) {
                const timeSlot = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
                const eventInSlot = dayEvents.find(event => event.time.startsWith(`${String(hour).padStart(2, '0')}:00`));
                if (eventInSlot) {
                    tablesHtml += `<tr draggable="true" id="event-${date}-${eventInSlot.title.replace(/\s+/g, '-')}" data-date="${date}" data-title="${eventInSlot.title}">
                                <td>${eventInSlot.time}</td>
                                <td>${eventInSlot.type}</td>
                                <td>${eventInSlot.title}</td>
                                <td>${eventInSlot.location.room}</td>
                                <td>${eventInSlot.organizer}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm delete-btn" data-date="${date}" data-title="${eventInSlot.title}" data-venue="${venue}"><i class="bi bi-trash-fill"></i> Eliminar</button>
                                </td>
                            </tr>`;
                } else {
                    tablesHtml += `<tr class="drop-zone" data-date="${date}" data-hour="${timeSlot}">
                                <td>${timeSlot}</td>
                                <td colspan="5" class="text-center">Libre</td>
                            </tr>`;
                }
            }

            tablesHtml += `</tbody>
                    </table>`;
        });

        document.getElementById('eventTables').innerHTML = tablesHtml;

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const date = this.getAttribute('data-date');
                const title = this.getAttribute('data-title');
                const venue = this.getAttribute('data-venue');
                deleteEvent(date, title, venue);
            });
        });

        addDragAndDrop();
    }

    function deleteEvent(date, title, venue) {
        if (!eventsData[date]) return;

        eventsData[date].activities = eventsData[date].activities.filter(event => event.title !== title);

        if (eventsData[date].activities.length === 0) {
            delete eventsData[date];
        }

        localStorage.setItem('eventsData', JSON.stringify(eventsData));

        loadEvents(venue);
    }

    function addDragAndDrop() {
        const draggables = document.querySelectorAll('tr[draggable="true"]');
        const dropZones = document.querySelectorAll('.drop-zone');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });

        dropZones.forEach(dropZone => {
            dropZone.addEventListener('dragover', e => {
                e.preventDefault();
            });

            dropZone.addEventListener('drop', e => {
                const draggedEvent = document.querySelector('.dragging');
                if (draggedEvent) {
                    const newDate = dropZone.getAttribute('data-date');
                    const newHour = dropZone.getAttribute('data-hour');
                    const oldDate = draggedEvent.getAttribute('data-date');
                    const title = draggedEvent.getAttribute('data-title');

                    if (checkIfSlotIsFree(newDate, newHour)) {
                        moveEvent(oldDate, newDate, title, newHour);
                    } else {
                        showNotification("El horario ya está ocupado");
                    }
                }
            });
        });
    }

    function checkIfSlotIsFree(date, timeSlot, venue) {
        const events = eventsData[date]?.activities || [];
        return !events.some(event => event.time === timeSlot && event.location.venue === venue);
    }

    function moveEvent(oldDate, newDate, title, newHour) {
        const eventToMove = eventsData[oldDate].activities.find(event => event.title === title);
        if (eventToMove) {
            eventsData[oldDate].activities = eventsData[oldDate].activities.filter(event => event.title !== title);

            if (eventsData[oldDate].activities.length === 0) {
                delete eventsData[oldDate];
            }

            const movedEvent = { ...eventToMove, time: newHour };

            const dayName = getDayName(newDate);
            if (!eventsData[newDate]) {
                eventsData[newDate] = { day: dayName, activities: [] };
            }
            eventsData[newDate].activities.push(movedEvent);

            localStorage.setItem('eventsData', JSON.stringify(eventsData));

            const currentVenue = document.getElementById('modalVenue').innerText;
            loadEvents(currentVenue);
        }
    }

    function getDayName(date) {
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayIndex = new Date(date).getDay();
        return dayNames[dayIndex];
    }

    document.getElementById('showJardines').addEventListener('click', () => {
        document.getElementById('modalVenue').innerText = 'Jardines del Prado';
        loadEvents('Jardines del Prado');
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
    });

    document.getElementById('showCasino').addEventListener('click', () => {
        document.getElementById('modalVenue').innerText = 'Antiguo Casino';
        loadEvents('Antiguo Casino');
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
    });

    document.getElementById('showCueva').addEventListener('click', () => {
        document.getElementById('modalVenue').innerText = 'Cueva';
        loadEvents('Cueva');
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
    });

}