export function loadCalendarData() {

  const eventsData = JSON.parse(localStorage.getItem('eventsData'));

  if (!eventsData) {
    console.error('No hay datos en localStorage');
    return;
  }

  const container = document.getElementById('calendar-container');
  const getActivityColor = (type) => {
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
  };

  for (const [date, dayInfo] of Object.entries(eventsData)) {
    const dayContainer = document.createElement('div');
    dayContainer.classList.add('col-12', 'mb-4');

    const dayHeading = document.createElement('h3');
    dayHeading.textContent = `${dayInfo.day}`;
    dayHeading.classList.add('mb-3');
    dayContainer.appendChild(dayHeading);

    const activityRow = document.createElement('div');
    activityRow.classList.add('row', 'g-3');

    dayInfo.activities.forEach(activity => {
      const cardCol = document.createElement('div');
      cardCol.classList.add('col-md-4', 'col-sm-6');

      const card = document.createElement('div');
      const cardColors = getActivityColor(activity.type);
      card.classList.add('card', 'mb-3', ...cardColors);
      card.style.maxWidth = '300px';
      card.style.margin = '0 auto';

      if (activity.image) {
        const cardImage = document.createElement('img');
        cardImage.src = activity.image;
        cardImage.classList.add('card-img-top');
        cardImage.style.objectFit = 'cover';
        cardImage.style.height = '150px';
        card.appendChild(cardImage);
      }

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const cardTitle = document.createElement('h5');
      cardTitle.classList.add('card-title');
      cardTitle.textContent = activity.title;

      const cardText = document.createElement('p');
      cardText.classList.add('card-text');
      cardText.innerHTML = `
              <strong>Hora:</strong> ${activity.time}<br>
              <strong>Tipo:</strong> ${activity.type}<br>
              <strong>Ubicación:</strong> ${activity.location.room} - ${activity.location.venue}<br>
              <strong>Organizador:</strong> ${activity.organizer}
      `;

      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardText);
      card.appendChild(cardBody);
      cardCol.appendChild(card);
      activityRow.appendChild(cardCol);
    });

    dayContainer.appendChild(activityRow);
    container.appendChild(dayContainer);
  }
}
