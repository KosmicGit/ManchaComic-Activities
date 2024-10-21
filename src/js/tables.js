import * as bootstrap from 'bootstrap';
import { showNotification } from "./main.js";

export function loadTables() {
    const eventsData = JSON.parse(localStorage.getItem('eventsData') || '{}');

    const venueRooms = {
        'Cueva': ['Sala 1', 'Sala 2'],
        'Antiguo Casino': ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Sala 6', 'Sala 7', 'Sala 8', 'Sala 9', 'Sala 10'],
        'Jardines del Prado': ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5']
    };

    const dates = ['2025-10-03', '2025-10-04', '2025-10-05'];
    const times = {
        '2025-10-03': { start: 17, end: 23 },
        '2025-10-04': { start: 10, end: 23 },
        '2025-10-05': { start: 10, end: 23 }
    };

    function getActivityColor(type) {
        switch (type) {
            case 'Charla':
                return ['bg-primary', 'text-white'];
            case 'Taller':
                return ['bg-success', 'text-white'];
            case 'Juegos de Mesa':
                return ['bg-warning', 'text-dark'];
            case 'Wargames':
                return ['bg-danger', 'text-white'];
            case 'Rol/Escape Room':
                return ['bg-info', 'text-white'];
            default:
                return ['bg-light', 'text-dark'];
        }
    }

    function loadEvents(venue) {
        const rooms = venueRooms[venue] || [];
        let tablesHtml = '';

        dates.forEach(date => {
            const dayEvents = (eventsData[date]?.activities.filter(event => event.location.venue === venue)) || [];

            tablesHtml += `<h5>${date === '2025-10-03' ? 'Viernes' : date === '2025-10-04' ? 'Sábado' : 'Domingo'} (${date}) - Horario: ${times[date].start}:00 - ${times[date].end}:00</h5>`;

            tablesHtml += `
                <div class="table-responsive">
                    <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            ${rooms.map(room => `<th>${room}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
            `;

            for (let hour = times[date].start; hour < times[date].end; hour++) {
                const timeSlot = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;

                tablesHtml += `<tr>
                                <td>${timeSlot}</td>`;

                rooms.forEach(room => {
                    const eventInSlot = dayEvents.find(event => event.time.startsWith(`${String(hour).padStart(2, '0')}:00`) && event.location.room === room);

                    if (eventInSlot) {
                        const [bgClass, textClass] = getActivityColor(eventInSlot.type);
                        tablesHtml += `<td class="drop-zone" data-room="${room}" data-hour="${timeSlot}" data-date="${date}">
                                        <div draggable="true" class="card ${bgClass} ${textClass} event-item" id="event-${date}-${eventInSlot.title.replace(/\s+/g, '-')}" data-date="${date}" data-title="${eventInSlot.title}" data-type="${eventInSlot.type}">
                                            <div class="card-body p-2">
                                                ${eventInSlot.title}
                                            </div>
                                        </div>
                                    </td>`;
                    } else {
                        tablesHtml += `<td class="drop-zone" data-room="${room}" data-hour="${timeSlot}" data-date="${date}">
                                        <div class="empty-slot">Libre</div>
                                    </td>`;
                    }
                });

                tablesHtml += `</tr>`;
            }

            tablesHtml += `</tbody>
                    </table>
                </div>`;
        });

        document.getElementById('eventTables').innerHTML = tablesHtml;

        // Agrega funcionalidad de arrastrar y soltar
        addDragAndDrop();

        // Abre el modal de detalles de actividad al hacer clic en un evento
        document.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', function () {
                const date = this.getAttribute('data-date');
                const title = this.getAttribute('data-title');
                const type = this.getAttribute('data-type');
                showEventDetails(date, title, venue, type);
            });
        });
    }

    function addDragAndDrop() {
        const draggables = document.querySelectorAll('.event-item');
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
                    const newRoom = dropZone.getAttribute('data-room');
                    const oldDate = draggedEvent.getAttribute('data-date');
                    const title = draggedEvent.getAttribute('data-title');

                    if (checkIfSlotIsFree(newDate, newHour, newRoom)) {
                        moveEvent(oldDate, newDate, title, newHour, newRoom);
                    } else {
                        showNotification("Esta Sala ya está ocupado");
                    }
                }
            });
        });
    }

    function checkIfSlotIsFree(date, timeSlot, room) {
        const events = eventsData[date]?.activities || [];
        return !events.some(event => event.time === timeSlot && event.location.room === room);
    }

    function moveEvent(oldDate, newDate, title, newHour, newRoom) {
        const eventToMove = eventsData[oldDate].activities.find(event => event.title === title);
        if (eventToMove) {
            eventsData[oldDate].activities = eventsData[oldDate].activities.filter(event => event.title !== title);
            if (eventsData[oldDate].activities.length === 0) {
                delete eventsData[oldDate];
            }

            const movedEvent = { ...eventToMove, time: newHour, location: { ...eventToMove.location, room: newRoom } };

            if (!eventsData[newDate]) {
                eventsData[newDate] = { activities: [] };
            }
            eventsData[newDate].activities.push(movedEvent);

            localStorage.setItem('eventsData', JSON.stringify(eventsData));

            const currentVenue = document.getElementById('modalVenue').innerText;
            loadEvents(currentVenue);
        }
    }

    function showEventDetails(date, title, venue, type) {
        const event = eventsData[date]?.activities.find(event => event.title === title);
        if (event) {
            const [bgClass, textClass] = getActivityColor(type);
            const modalBody = `
                <div class="card ${bgClass} ${textClass}">
                    <div class="card-img">
                        
                    </div>
                    <div class="card-body">
                        <h5>${event.title}</h5>
                        <p><strong>Hora:</strong> ${event.time}</p>
                        <p><strong>Ubicación:</strong> ${event.location.room}, ${venue}</p>
                        <p><strong>Organizador:</strong> ${event.organizer}</p>
                        <button class="btn btn-danger" id="deleteEventBtn">Eliminar</button>
                    </div>
                </div>
            `;
            const modalElement = document.getElementById('eventDetailsModalBody');
            modalElement.innerHTML = modalBody;

            const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
            modal.show();

            document.getElementById('deleteEventBtn').addEventListener('click', () => {
                deleteEvent(date, title, venue);
                modal.hide();
            });
        }
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
