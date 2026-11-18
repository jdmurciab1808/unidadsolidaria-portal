/**
 * @file
 * Buscador del glosario: filtra los términos mientras se escribe.
 */

(function (Drupal, once) {
  'use strict';

  // Minúsculas y sin tildes, para que "credito" encuentre "Crédito".
  function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  Drupal.behaviors.usGlosario = {
    attach: function (context) {
      once('us-glo', '[data-us-glo]', context).forEach(function (raiz) {
        var buscador = raiz.querySelector('[data-us-glo-buscador]');
        var input = raiz.querySelector('[data-us-glo-input]');
        if (!buscador || !input) {
          return;
        }
        buscador.hidden = false;

        var estado = raiz.querySelector('[data-us-glo-estado]');
        var vacio = raiz.querySelector('[data-us-glo-vacio]');
        var grupos = Array.prototype.slice.call(raiz.querySelectorAll('[data-us-glo-grupo]'));
        var terminos = Array.prototype.slice.call(raiz.querySelectorAll('[data-us-glo-termino]'));
        terminos.forEach(function (el) {
          el.usGloTexto = normalizar(el.textContent);
        });

        function filtrar() {
          var q = normalizar(input.value.trim());
          var visibles = 0;

          terminos.forEach(function (el) {
            var ok = !q || el.usGloTexto.indexOf(q) !== -1;
            el.hidden = !ok;
            if (ok) {
              visibles++;
            }
          });

          grupos.forEach(function (grupo) {
            grupo.hidden = !grupo.querySelector('[data-us-glo-termino]:not([hidden])');
          });

          vacio.hidden = visibles > 0;
          estado.textContent = q ? Drupal.formatPlural(visibles, '1 término encontrado', '@count términos encontrados') : '';
        }

        input.addEventListener('input', filtrar);
      });
    }
  };
})(Drupal, once);
