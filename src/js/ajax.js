// JGarcia 2024

document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const mainContent = document.getElementById('main-content');
  
    function loadSection(sectionFile) {
      fetch(sectionFile)
        .then(response => response.text())
        .then(data => {
          mainContent.innerHTML = data;
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
  