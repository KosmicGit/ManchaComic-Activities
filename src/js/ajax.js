// JGarcia 2024

import { loadCalendarData } from './calendar.js';

document.addEventListener("DOMContentLoaded", function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');
  

  function loadSection(sectionFile) {
    fetch(sectionFile)
      .then(response => response.text())
      .then(data => {
        mainContent.innerHTML = data;

        // Si cargamos la sección de calendario, ejecuta el script que genera las tarjetas
        if (sectionFile.includes('calendario.html')) {
          loadCalendarData();  // Ejecuta el script que genera las tarjetas
          const addEventButton = document.getElementById('addEvent');
          addEventButton.addEventListener('click', function(event) {
            event.preventDefault();
            loadSection('sections/formulario.html');
          });
        }

        if (sectionFile.includes('formulario.html')) {
          const closeForm = document.getElementById('closeForm');
          closeForm.addEventListener('click', function(event) {
            event.preventDefault();
            loadSection('sections/calendario.html');
          });
        }

      })
      .catch(error => {
        console.error('Error cargando la sección:', error);
        mainContent.innerHTML = '<p>Error al cargar la sección. Intenta de nuevo.</p>';
      });
  }

  function setActiveLink(activeLink) {
    navLinks.forEach(function(link) {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }

  navLinks.forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault();

      const sectionId = this.getAttribute('href').substring(1);

      loadSection(`sections/${sectionId}.html`);
      setActiveLink(this);
    });
  });

  loadSection('sections/inicio.html');
  setActiveLink(document.querySelector('a[href="#inicio"]'));
});
