// JGarcia 2024

//import { saveLocalStorage } from "./test.js";

import * as bootstrap from 'bootstrap';
import { loadCalendarData } from './calendar.js';
//import { loadForm } from "./form.js";

document.addEventListener("DOMContentLoaded", function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');
  

  function loadSection(sectionFile) {
    fetch(sectionFile)
      .then(response => response.text())
      .then(data => {
        mainContent.innerHTML = data;

        if (sectionFile.includes('calendario.html')) {
          loadCalendarData();
          const modal = document.getElementById('modalBox');
          const modalBox = new bootstrap.Modal(modal);
          const addEventButton = document.getElementById('addEvent');

          addEventButton.addEventListener('click', function(event) {
            event.preventDefault();
            loadSection('sections/formulario.html');
          });

          modal.addEventListener('shown.bs.modal', function () {
            const passwordField = document.getElementById('formPasswd');
            const errorMsg = document.getElementById('error-msg');
            const btnPasswd = document.getElementById('btnPasswd');

            // Como no tiene implementación de back, se establece una variable desprotegida pero lo suyo sería obtenerla mediante un back
            const editorPasswd = '12345';

            btnPasswd.addEventListener('click', function() {
      
              if (passwordField.value === editorPasswd) {
                errorMsg.style.display = 'none';
                modalBox.hide();
                loadSection('sections/editar.html');
              } else {
                errorMsg.style.display = 'block';
              }
            });
          });
        }

        if (sectionFile.includes('editar.html')) {
          const closeForm = document.getElementById('closeForm');
          closeForm.addEventListener('click', function(event) {
            event.preventDefault();
            loadSection('sections/calendario.html');
          });

        }

        if (sectionFile.includes('formulario.html')) {
          const closeForm = document.getElementById('closeForm');
          closeForm.addEventListener('click', function(event) {
            event.preventDefault();
            loadSection('sections/calendario.html');
          });
          //loadForm();
        }

        if (sectionFile.includes('creditos.html')) {
          //saveLocalStorage()
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
