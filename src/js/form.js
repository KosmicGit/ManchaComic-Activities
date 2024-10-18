import Toastify from 'toastify-js';
import * as bootstrap from "bootstrap";
import {loadSection} from "./ajax.js";

export function loadForm() {
    const inputTitle = document.getElementById('inputTitle');
    const inputDate = document.getElementById('inputDate');
    const inputTime = document.getElementById('inputTime');
    const inputLocation = document.getElementById('inputLocation');
    const inputRoom = document.getElementById('inputRoom');
    const inputActivityType = document.getElementById('inputActivityType');
    const inputOrganizer = document.getElementById('inputOrganizer');
    const inputImage = document.getElementById('inputImage');

    const closeForm = document.getElementById('closeForm');

    const formBox = document.getElementById('formBox');

    closeForm.addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    })

    inputTitle.value = '';
    inputDate.value = 'Elige un Día';
    inputTime.value = 'Elige una Hora';
    inputActivityType.value = 'Elige un tipo de actividad'
    inputLocation.value = 'Elige un lugar';
    inputRoom.value = 'Elige una sala';

    const locationRooms = {
        "jardines": { name: "Jardines del Prado", rooms: 5 },
        "casino": { name: "Antiguo Casino", rooms: 10 },
        "cueva": { name: "Cueva", rooms: 2 }
    };

    const scheduleByDay = {
        '2025-10-03': { start: 17, end: 22 },
        '2025-10-04': { start: 10, end: 22 },
        '2025-10-05': { start: 10, end: 22 }
    };

    let eventsData = JSON.parse(localStorage.getItem('eventsData')) || {};

    inputTime.disabled = true;
    inputActivityType.disabled = true;
    inputLocation.disabled = true;
    inputRoom.disabled = true;
    inputOrganizer.disabled = true;

    function showNotification(message) {
        Toastify({
            text: message,
            duration: 4000,
            close: true,
            gravity: "bottom",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#b11f6e",
            },
        }).showToast();
    }

    function getAvailableHours(date) {
        const availableHours = [];
        const daySchedule = scheduleByDay[date];

        for (let hour = daySchedule.start; hour <= daySchedule.end; hour++) {
            availableHours.push(`${hour}:00`);
        }

        return availableHours;
    }

    function getAvailableLocations(date, time) {
        const activitiesAtTime = eventsData[date]?.activities.filter(activity => activity.time.split('-')[0] === time) || [];

        const availableLocations = Object.keys(locationRooms).filter(location => {
            const occupiedRooms = activitiesAtTime.filter(activity => activity.location.venue === locationRooms[location].name).length;
            return occupiedRooms < locationRooms[location].rooms;
        });

        return availableLocations;
    }

    function getAvailableRooms(date, time, location) {
        const activitiesAtTime = eventsData[date]?.activities.filter(activity => activity.time.split('-')[0] === time && activity.location.venue === locationRooms[location].name) || [];
        const occupiedRooms = activitiesAtTime.map(activity => activity.location.room);
        const availableRooms = [];

        for (let i = 1; i <= locationRooms[location].rooms; i++) {
            if (!occupiedRooms.includes(`Sala ${i}`)) {
                availableRooms.push(`Sala ${i}`);
            }
        }

        return availableRooms;
    }

    inputDate.addEventListener('change', function () {
        if (inputDate.value) {
            inputTime.disabled = false;
            inputTime.innerHTML = '<option selected>Elige una Hora</option>';
            getAvailableHours(inputDate.value).forEach(hour => {
                inputTime.innerHTML += `<option value="${hour}">${hour}</option>`;
            });
        }
    });

    inputTime.addEventListener('change', function () {
        if (inputDate.value && inputTime.value) {
            inputActivityType.disabled = false;
        }
    });

    inputActivityType.addEventListener('change', function () {
        if (inputActivityType.value === 'juegos') {
            inputLocation.innerHTML = `<option value="jardines">${locationRooms['jardines'].name}</option>`;
            inputLocation.value = 'jardines';
            inputLocation.disabled = true;

            const availableRooms = getAvailableRooms(inputDate.value, inputTime.value, inputLocation.value);

            inputRoom.disabled = false;
            inputRoom.innerHTML = '<option selected>Elige una sala</option>';

            let counter = 0;
            availableRooms.forEach(room => {
                counter = 1;
                inputRoom.innerHTML += `<option value="${room.toLowerCase().replace(' ', '')}">${room}</option>`;
            });

            if (counter === 0) {
                inputRoom.disabled = true;
                inputRoom.innerHTML = '<option selected>Ocupado</option>'
                showNotification("No hay salas disponibles en esta ubicación")
            }
        } else {
            const availableLocations = getAvailableLocations(inputDate.value, inputTime.value);

            inputLocation.disabled = false;
            inputLocation.innerHTML = '<option selected>Elige un lugar</option>';
            availableLocations.forEach(location => {
                if (location !== 'jardines') {
                    inputLocation.innerHTML += `<option value="${location}">${locationRooms[location].name}</option>`;
                }
            });
        }
    });

    inputLocation.addEventListener('change', function () {

        if (inputDate.value && inputTime.value && inputLocation.value) {
            const availableRooms = getAvailableRooms(inputDate.value, inputTime.value, inputLocation.value);

            inputRoom.disabled = false;
            inputRoom.innerHTML = '<option selected>Elige una sala</option>';

            let counter = 0;
            availableRooms.forEach(room => {
                counter = 1;
                inputRoom.innerHTML += `<option value="${room.toLowerCase().replace(' ', '')}">${room}</option>`;
            });

            if (counter === 0) {
                inputRoom.disabled = true;
                inputRoom.innerHTML = '<option selected>Ocupado</option>'
                showNotification("No hay salas disponibles en esta ubicación");
            }
        }
    });

    inputRoom.addEventListener('change', function () {
        inputOrganizer.disabled = false;
    })

    let image = "";
    inputImage.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                image = e.target.result;
            }

            reader.readAsDataURL(file);
        }
    });

    document.getElementById('addEvent').addEventListener('click', function () {
        const title = inputTitle.value;
        const date = inputDate.value;
        const time = inputTime.value;
        const activityType = inputActivityType.value;
        const location = inputLocation.value;
        const room = inputRoom.value;
        const organizer = inputOrganizer.value;

        [inputTitle, inputDate, inputTime, inputActivityType, inputLocation, inputRoom, inputOrganizer].forEach(input => {
            input.classList.remove('is-invalid');
        });

        let isValid = true;

        if (!title) {
            inputTitle.classList.add('is-invalid');
            isValid = false;
        }
        if (!date || date === 'Elige un Día') {
            inputDate.classList.add('is-invalid');
            isValid = false;
        }
        if (!time || time === 'Elige una Hora') {
            inputTime.classList.add('is-invalid');
            isValid = false;
        }
        if (!activityType || activityType === 'Elige un tipo de actividad') {
            inputActivityType.classList.add('is-invalid');
            isValid = false;
        }
        if (!location || location === 'Elige un lugar') {
            inputLocation.classList.add('is-invalid');
            isValid = false;
        }
        if (!room || room === 'Elige una sala' || room === 'Ocupado') {
            inputRoom.classList.add('is-invalid');
            isValid = false;
        }
        if (!organizer || organizer === '') {
            inputOrganizer.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            if (room === 'Ocupado') {
                showNotification("No hay salas disponibles en esta ubicación");
            } else {
                showNotification("Por favor, rellene todos los campos obligatorios");
            }
            return;
        }

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
        else if (activityType === 'taller') type = 'Taller';
        else if (activityType === 'juegos') type = 'Juegos de Mesa';
        else if (activityType === 'wargames') type = 'Wargames';
        else if (activityType === 'rol') type = 'Rol/Escape Room';

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

        showNotification("Evento añadido con éxito");

        formBox.classList.remove('show');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

        loadSection('sections/editar.html');
    });
}
