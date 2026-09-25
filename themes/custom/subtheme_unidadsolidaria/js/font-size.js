/**
 * @file
 * Aumentar / reducir el tamaño de la letra de todo el sitio (accesibilidad).
 *
 * Cada elemento con texto se escala a partir de SU propio tamaño original, de
 * modo que se conserva la jerarquía (títulos > párrafos > enlaces). El nivel
 * elegido se recuerda entre páginas. Los botones son #font-up-text y
 * #font-down-text (bloque "Iconos Accesibilidad").
 */
(function (Drupal, once) {
  'use strict';

  var CLAVE = 'us_fuente_escala';
  var MIN = 0.8;
  var MAX = 1.5;
  var PASO = 0.1;
  // Zonas que no se escalan: barra de administración, los propios botones y
  // los widgets de terceros (chat y traductor), que traen su propio diseño.
  var EXCLUIR = '#toolbar-administration, .toolbar-tray, .block-gov-accessibility, .contextual, ' +
    '.mylivechat_inline, [class*="mylivechat"], .skiptranslate, #goog-gt-tt, .goog-te-gadget';
  var OMITIR = /^(SCRIPT|STYLE|NOSCRIPT|SVG|TEMPLATE|BR|IMG|IFRAME|VIDEO|CANVAS|PATH)$/;
  var CONTROLES = /^(INPUT|TEXTAREA|SELECT|BUTTON)$/;

  var escala = 1;

  function leer() {
    try {
      var v = parseFloat(window.localStorage.getItem(CLAVE));
      return isFinite(v) ? Math.min(MAX, Math.max(MIN, v)) : 1;
    }
    catch (e) {
      return 1;
    }
  }

  function guardar() {
    try {
      window.localStorage.setItem(CLAVE, String(escala));
    }
    catch (e) {}
  }

  function tieneTextoPropio(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.nodeValue.trim() !== '') {
        return true;
      }
    }
    return false;
  }

  /**
   * Elementos que muestran texto dentro de la raíz.
   */
  function candidatos(raiz) {
    var lista = [];
    var todos = raiz.querySelectorAll('*');
    for (var i = 0; i < todos.length; i++) {
      var el = todos[i];
      if (OMITIR.test(el.tagName.toUpperCase()) || el.closest(EXCLUIR)) {
        continue;
      }
      if (CONTROLES.test(el.tagName) || tieneTextoPropio(el)) {
        lista.push(el);
      }
    }
    return lista;
  }

  /**
   * Aplica la escala actual a la raíz (lectura de tamaños primero y
   * escritura después, para no forzar recálculos de diseño repetidos).
   */
  function aplicar(raiz) {
    var lista = candidatos(raiz);
    var i;
    var el;

    // 1) Lectura: se guarda el tamaño original la primera vez.
    for (i = 0; i < lista.length; i++) {
      el = lista[i];
      if (el.dataset.usFs0 === undefined) {
        el.dataset.usFs0 = parseFloat(window.getComputedStyle(el).fontSize);
        el.dataset.usFsInline = el.style.getPropertyValue('font-size');
        el.dataset.usFsPrio = el.style.getPropertyPriority('font-size');
      }
    }

    // 2) Escritura.
    for (i = 0; i < lista.length; i++) {
      el = lista[i];
      var base = parseFloat(el.dataset.usFs0);
      if (!isFinite(base)) {
        continue;
      }
      if (Math.abs(escala - 1) < 0.001) {
        // Sin escala: se devuelve lo que el elemento tenía originalmente.
        if (el.dataset.usFsInline) {
          el.style.setProperty('font-size', el.dataset.usFsInline, el.dataset.usFsPrio);
        }
        else {
          el.style.removeProperty('font-size');
        }
      }
      else {
        el.style.setProperty('font-size', (base * escala).toFixed(2) + 'px', 'important');
      }
    }
  }

  function cambiar(delta) {
    var nueva = Math.round((escala + delta) * 100) / 100;
    nueva = Math.min(MAX, Math.max(MIN, nueva));
    if (nueva === escala) {
      return;
    }
    escala = nueva;
    guardar();
    aplicar(document.body);
  }

  function activarBoton(el, delta) {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', function () {
      cambiar(delta);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cambiar(delta);
      }
    });
  }

  Drupal.behaviors.usFontSize = {
    attach: function (context) {
      // Los botones se enlazan una sola vez, aunque el comportamiento se
      // ejecute de nuevo (por ejemplo, tras una petición Ajax).
      once('us-fuente-mas', '#font-up-text', context).forEach(function (el) {
        activarBoton(el, PASO);
      });
      once('us-fuente-menos', '#font-down-text', context).forEach(function (el) {
        activarBoton(el, -PASO);
      });

      // Al cargar la página se restaura el nivel elegido; el contenido que
      // llega después por Ajax se ajusta al nivel actual.
      if (context === document) {
        escala = leer();
        if (escala !== 1) {
          aplicar(document.body);
        }
      }
      else if (context && context.querySelectorAll && escala !== 1) {
        aplicar(context);
      }
    }
  };

})(Drupal, once);
