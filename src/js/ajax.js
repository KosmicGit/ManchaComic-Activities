// JGarcia 2024

//import { saveLocalStorage } from "./test.js";

import * as bootstrap from 'bootstrap';
import { loadCalendarData } from './calendar.js';
import { loadForm } from "./form.js";
import {loadEdit} from "./edit.js";
import modal from "bootstrap/js/src/modal.js";

let loadSection;

document.addEventListener("DOMContentLoaded", function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  loadSection = function (sectionFile) {
    fetch(sectionFile)
      .then(response => response.text())
      .then(data => {
        mainContent.innerHTML = data;

        if (sectionFile.includes('calendario.html')) {
          loadCalendarData();
          const modal = document.getElementById('modalBox');
          const modalBox = new bootstrap.Modal(modal);

          modal.addEventListener('shown.bs.modal', function () {
            const passwordField = document.getElementById('formPasswd');
            const errorMsg = document.getElementById('error-msg');
            const btnPasswd = document.getElementById('btnPasswd');

            // Como no tiene implementación de back, se establece una variable desprotegida pero lo suyo sería obtenerla mediante una api
            const editorPasswd = '12345';

            btnPasswd.addEventListener('click', function() {
      
              if (passwordField.value === editorPasswd) {
                modalBox.hide();
                errorMsg.style.display = 'none';
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.removeAttribute('style');
                document.body.removeAttribute('class');
                document.body.removeAttribute('data-bs-overflow');
                document.body.removeAttribute('data-bs-padding-right');
                loadSection('sections/editar.html');
              } else {
                errorMsg.style.display = 'block';
              }
            });
          });
        }

        if (sectionFile.includes('editar.html')) {
          loadEdit();

          const closeEdit = document.getElementById('closeEdit');
          const showForm = document.getElementById('showForm');

          closeEdit.addEventListener('click', function(event) {
            event.preventDefault();
            loadSection('sections/calendario.html');
          });

          showForm.addEventListener('click', function(event) {
            loadForm();
          });
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

export { loadSection };
