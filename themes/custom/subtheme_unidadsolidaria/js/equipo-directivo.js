/**
 * @file
 * Equipo directivo: menú lateral con los cargos.
 *
 * Cada fila de la vista equipo_directivo es un directivo. Se arma un menú con
 * el cargo de cada uno (.title-cargo) y solo se muestra el directivo elegido.
 * Sin JavaScript se ven todos, uno debajo del otro.
 */
(function (Drupal, once) {
  Drupal.behaviors.usEquipoDirectivo = {
    attach: function (context) {
      once('us-equipo-directivo', '.view-id-equipo_directivo > .view-content', context).forEach(function (lista) {
        var filas = Array.prototype.slice.call(lista.querySelectorAll(':scope > .views-row'));
        if (filas.length < 2) {
          return;
        }

        var menu = document.createElement('div');
        menu.className = 'us-equipo__menu';
        menu.setAttribute('role', 'tablist');
        menu.setAttribute('aria-label', Drupal.t('Equipo directivo'));

        var botones = filas.map(function (fila, i) {
          var cargo = fila.querySelector('.title-cargo');
          var boton = document.createElement('button');
          boton.type = 'button';
          boton.className = 'us-equipo__opcion';
          boton.id = 'us-equipo-opcion-' + i;
          boton.setAttribute('role', 'tab');
          boton.setAttribute('aria-controls', 'us-equipo-panel-' + i);
          boton.textContent = cargo ? cargo.textContent.trim() : Drupal.t('Directivo @n', {'@n': i + 1});
          fila.id = 'us-equipo-panel-' + i;
          fila.setAttribute('role', 'tabpanel');
          fila.setAttribute('aria-labelledby', boton.id);
          menu.appendChild(boton);
          return boton;
        });

        function mostrar(elegido, enfocar) {
          botones.forEach(function (boton, i) {
            var activo = i === elegido;
            boton.setAttribute('aria-selected', activo ? 'true' : 'false');
            boton.tabIndex = activo ? 0 : -1;
            boton.classList.toggle('is-active', activo);
            filas[i].hidden = !activo;
          });
          if (enfocar) {
            botones[elegido].focus();
          }
        }

        botones.forEach(function (boton, i) {
          boton.addEventListener('click', function () {
            mostrar(i, false);
            // Si el directivo quedó arriba, fuera de la vista, se sube hasta él.
            var arriba = filas[i].getBoundingClientRect().top;
            if (arriba < 0 || arriba > window.innerHeight) {
              filas[i].scrollIntoView({behavior: 'smooth', block: 'start'});
            }
          });
          // Flechas para moverse entre cargos, como en unas pestañas.
          boton.addEventListener('keydown', function (e) {
            var siguiente = {ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: botones.length - 1}[e.key];
            if (siguiente !== undefined) {
              e.preventDefault();
              mostrar((siguiente + botones.length) % botones.length, true);
            }
          });
        });

        lista.classList.add('us-equipo');
        lista.insertBefore(menu, lista.firstChild);
        mostrar(0, false);
      });
    }
  };
})(Drupal, once);
