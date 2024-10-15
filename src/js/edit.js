export function loadForm() {
    document.querySelector('.btn-primary').addEventListener('click', function () {
        const title = document.getElementById('inputTitle').value;
        const date = document.getElementById('inputDate').value;
        const time = document.getElementById('inputTime').value;
        const activityType = document.getElementById('inputActivityType').value;
        const location = document.getElementById('inputLocation').value;
        const room = document.getElementById('inputRoom').value;
        const organizer = document.getElementById('inputOrganizer').value;
        const image = document.getElementById('inputImage').value;

        let eventsData = JSON.parse(localStorage.getItem('eventsData')) || {};

        const getDayName = (date) => {
            const dayName = {
                '2025-10-03': 'Viernes',
                '2025-10-04': 'Sábado',
                '2025-10-05': 'Domingo'
            };

            return dayName[date] || '';
        };

        if (!eventsData[date]) {
            eventsData[date] = {
                "day": getDayName(date),
                "activities": []
            };
        }

        let venue;
        if (location === 'casino') venue = 'Antiguo Casino';
        else if (location === 'jardines') venue = 'Jardines del Prado';
        else if (location === 'cueva') venue = 'Cueva';

        let type;
        if (activityType === 'charla') type = 'Charla';
        else if (location === 'taller') type = 'Taller';
        else if (location === 'juegos') type = 'Juegos de Mesa';
        else if (location === 'wargames') type = 'Wargames';
        else if (location === 'rol') type = 'Rol/Escape Room';

        let roomName;
        if (room === 'sala1') roomName = 'Sala 1';
        else if (room === 'sala2') roomName = 'Sala 2';
        else if (room === 'sala3') roomName = 'Sala 3';
        else if (room === 'sala4') roomName = 'Sala 4';
        else if (room === 'sala5') roomName = 'Sala 5';
        else if (room === 'sala6') roomName = 'Sala 6';
        else if (room === 'sala7') roomName = 'Sala 7';
        else if (room === 'sala8') roomName = 'Sala 8';
        else if (room === 'sala9') roomName = 'Sala 9';
        else if (room === 'sala10') roomName = 'Sala 10';


        const newEvent = {
            "time": `${time}-${parseInt(time) + 1}:00`,
            "type": type,
            "title": title,
            "location": {
                "room": roomName,
                "venue": venue
            },
            "organizer": organizer,
            "image": image
        };

        eventsData[date].activities.push(newEvent);

        localStorage.setItem('eventsData', JSON.stringify(eventsData));

        alert('Evento añadido con éxito');

    });
}
