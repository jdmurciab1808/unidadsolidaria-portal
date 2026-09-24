/**
 * @file
 * Calendario mensual de eventos (sin librerías externas).
 * Todo el texto de los eventos se inserta con textContent, nunca como HTML.
 */
(function (Drupal, drupalSettings, once) {
  'use strict';

  var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  var DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MAX_CHIPS = 3;

  function el(tag, clase, texto) {
    var nodo = document.createElement(tag);
    if (clase) { nodo.className = clase; }
    if (texto !== undefined && texto !== null) { nodo.textContent = texto; }
    return nodo;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clave(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  // 'YYYY-MM-DDTHH:mm' (hora local del sitio) -> Date en hora "de pared".
  function leer(s) {
    if (!s) { return null; }
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s);
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null;
  }

  function hora(d) {
    var h = d.getHours(), min = d.getMinutes(), sufijo = h >= 12 ? 'p. m.' : 'a. m.';
    h = h % 12 || 12;
    return h + ':' + pad(min) + ' ' + sufijo;
  }

  function fechaLarga(d) {
    return DIAS_LARGO[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()].toLowerCase() + ' de ' + d.getFullYear();
  }

  function esTodoElDia(ev) {
    return ev.ini.getHours() === 0 && ev.ini.getMinutes() === 0 && !ev.fin;
  }

  function textoHorario(ev) {
    var mismoDia = ev.fin && clave(ev.ini) === clave(ev.fin);
    if (esTodoElDia(ev)) { return fechaLarga(ev.ini); }
    if (!ev.fin) { return fechaLarga(ev.ini) + ', ' + hora(ev.ini); }
    if (mismoDia) { return fechaLarga(ev.ini) + ', ' + hora(ev.ini) + ' a ' + hora(ev.fin); }
    return 'Del ' + fechaLarga(ev.ini) + ' (' + hora(ev.ini) + ') al ' + fechaLarga(ev.fin) + ' (' + hora(ev.fin) + ')';
  }

  function Calendario(raiz, ajustes) {
    var hoy = new Date();
    this.raiz = raiz;
    this.ajustes = ajustes;
    this.mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.eventos = [];
    this.error = false;
    this.cargando = false;
    this.peticion = 0;
    this.dialogo = null;
    this.cargar();
  }

  Calendario.prototype.rango = function () {
    var primero = new Date(this.mes.getFullYear(), this.mes.getMonth(), 1);
    var offset = (primero.getDay() + 6) % 7; // semana empieza en lunes
    var desde = new Date(primero.getFullYear(), primero.getMonth(), 1 - offset);
    var hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 41);
    return { desde: desde, hasta: hasta };
  };

  Calendario.prototype.cargar = function () {
    var self = this, r = this.rango(), id = ++this.peticion;
    this.cargando = true;
    this.error = false;
    this.pintar();
    var url = this.ajustes.urlEventos + '?desde=' + clave(r.desde) + '&hasta=' + clave(r.hasta);
    fetch(url, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
      .then(function (resp) {
        if (!resp.ok) { throw new Error('http ' + resp.status); }
        return resp.json();
      })
      .then(function (datos) {
        if (id !== self.peticion) { return; }
        self.eventos = (datos.eventos || []).map(function (e) {
          e.ini = leer(e.inicio);
          e.fin = leer(e.fin);
          return e;
        }).filter(function (e) { return e.ini; });
        self.cargando = false;
        self.pintar();
      })
      .catch(function () {
        if (id !== self.peticion) { return; }
        self.eventos = [];
        self.error = true;
        self.cargando = false;
        self.pintar();
      });
  };

  Calendario.prototype.porDia = function () {
    var mapa = {};
    this.eventos.forEach(function (ev) {
      var dia = new Date(ev.ini.getFullYear(), ev.ini.getMonth(), ev.ini.getDate());
      var ultimo = ev.fin ? new Date(ev.fin.getFullYear(), ev.fin.getMonth(), ev.fin.getDate()) : dia;
      var limite = 0;
      while (dia <= ultimo && limite++ < 62) {
        var k = clave(dia);
        (mapa[k] = mapa[k] || []).push(ev);
        dia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1);
      }
    });
    return mapa;
  };

  Calendario.prototype.irMes = function (delta) {
    this.mes = new Date(this.mes.getFullYear(), this.mes.getMonth() + delta, 1);
    this.cargar();
  };

  Calendario.prototype.irHoy = function () {
    var h = new Date();
    this.mes = new Date(h.getFullYear(), h.getMonth(), 1);
    this.cargar();
  };

  Calendario.prototype.pintar = function () {
    var self = this;
    var raiz = this.raiz;
    var enfocado = document.activeElement && raiz.contains(document.activeElement) ? document.activeElement.getAttribute('data-foco') : null;
    while (raiz.firstChild) { raiz.removeChild(raiz.firstChild); }

    // Barra superior.
    var barra = el('div', 'us-cal__barra');
    var nav = el('div', 'us-cal__nav');
    var ant = el('button', 'us-cal__btn us-cal__btn--icono', '‹');
    ant.type = 'button';
    ant.setAttribute('aria-label', 'Mes anterior');
    ant.setAttribute('data-foco', 'ant');
    ant.addEventListener('click', function () { self.irMes(-1); });
    var sig = el('button', 'us-cal__btn us-cal__btn--icono', '›');
    sig.type = 'button';
    sig.setAttribute('aria-label', 'Mes siguiente');
    sig.setAttribute('data-foco', 'sig');
    sig.addEventListener('click', function () { self.irMes(1); });
    var btnHoy = el('button', 'us-cal__btn', 'Hoy');
    btnHoy.type = 'button';
    btnHoy.setAttribute('data-foco', 'hoy');
    btnHoy.addEventListener('click', function () { self.irHoy(); });
    nav.appendChild(ant);
    nav.appendChild(sig);
    nav.appendChild(btnHoy);

    var titulo = el('h2', 'us-cal__titulo', MESES[this.mes.getMonth()] + ' ' + this.mes.getFullYear());
    titulo.setAttribute('aria-live', 'polite');
    barra.appendChild(nav);
    barra.appendChild(titulo);

    if (this.ajustes.puedeCrear && this.ajustes.urlCrear) {
      var crear = el('a', 'us-cal__btn us-cal__btn--crear', '+ Crear evento');
      crear.href = this.ajustes.urlCrear;
      barra.appendChild(crear);
    }
    raiz.appendChild(barra);

    if (this.error) {
      var aviso = el('p', 'us-cal__aviso', 'No fue posible cargar los eventos. Intente de nuevo en unos minutos.');
      aviso.setAttribute('role', 'alert');
      raiz.appendChild(aviso);
    }

    // Cuadrícula.
    var mapa = this.porDia();
    var r = this.rango();
    var hoyClave = clave(new Date());
    var grid = el('div', 'us-cal__grid' + (this.cargando ? ' is-cargando' : ''));
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', MESES[this.mes.getMonth()] + ' ' + this.mes.getFullYear());
    DIAS.forEach(function (d) {
      var c = el('div', 'us-cal__dia-nombre', d);
      c.setAttribute('role', 'columnheader');
      grid.appendChild(c);
    });

    for (var i = 0; i < 42; i++) {
      var fecha = new Date(r.desde.getFullYear(), r.desde.getMonth(), r.desde.getDate() + i);
      var k = clave(fecha);
      var delDia = mapa[k] || [];
      var celda = el('div', 'us-cal__celda');
      celda.setAttribute('role', 'gridcell');
      if (fecha.getMonth() !== this.mes.getMonth()) { celda.classList.add('is-otro-mes'); }
      if (k === hoyClave) { celda.classList.add('is-hoy'); }
      if (delDia.length) { celda.classList.add('tiene-eventos'); }

      var num = el('span', 'us-cal__num', String(fecha.getDate()));
      celda.appendChild(num);

      var lista = el('div', 'us-cal__chips');
      delDia.slice(0, MAX_CHIPS).forEach(function (ev) {
        var chip = el('button', 'us-cal__chip');
        chip.type = 'button';
        // La hora solo se muestra el día en que empieza el evento.
        var h = (esTodoElDia(ev) || clave(ev.ini) !== k) ? '' : hora(ev.ini) + ' ';
        chip.appendChild(el('span', 'us-cal__chip-hora', h));
        chip.appendChild(el('span', 'us-cal__chip-titulo', ev.titulo));
        chip.setAttribute('aria-label', ev.titulo + ', ' + textoHorario(ev));
        chip.addEventListener('click', function () { self.abrirEvento(ev, chip); });
        lista.appendChild(chip);
      });
      if (delDia.length > MAX_CHIPS) {
        (function (f, evs) {
          var mas = el('button', 'us-cal__mas', '+' + (evs.length - MAX_CHIPS) + ' más');
          mas.type = 'button';
          mas.addEventListener('click', function () { self.abrirDia(f, evs, mas); });
          lista.appendChild(mas);
        })(fecha, delDia);
      }
      celda.appendChild(lista);

      // Punto indicador para pantallas pequeñas (donde los chips se ocultan).
      if (delDia.length) {
        (function (f, evs) {
          var punto = el('button', 'us-cal__punto');
          punto.type = 'button';
          punto.setAttribute('aria-label', evs.length + (evs.length === 1 ? ' evento' : ' eventos') + ' el ' + fechaLarga(f));
          punto.appendChild(el('span', 'us-cal__punto-n', String(evs.length)));
          punto.addEventListener('click', function () { self.abrirDia(f, evs, punto); });
          celda.appendChild(punto);
        })(fecha, delDia);
      }
      grid.appendChild(celda);
    }
    raiz.appendChild(grid);

    // Lista del mes.
    var delMes = this.eventos.filter(function (ev) {
      var ultimo = ev.fin || ev.ini;
      var ini = new Date(self.mes.getFullYear(), self.mes.getMonth(), 1);
      var fin = new Date(self.mes.getFullYear(), self.mes.getMonth() + 1, 1);
      return ev.ini < fin && ultimo >= ini;
    });
    var seccion = el('div', 'us-cal__lista');
    seccion.appendChild(el('h3', 'us-cal__lista-titulo', 'Eventos de ' + MESES[this.mes.getMonth()].toLowerCase()));
    if (!delMes.length && !this.cargando && !this.error) {
      seccion.appendChild(el('p', 'us-cal__vacio', 'No hay eventos programados para este mes.'));
    }
    var ul = el('ul', 'us-cal__items');
    delMes.forEach(function (ev) {
      var li = el('li', 'us-cal__item');
      var fechaBox = el('div', 'us-cal__item-fecha');
      fechaBox.appendChild(el('span', 'us-cal__item-dia', String(ev.ini.getDate())));
      fechaBox.appendChild(el('span', 'us-cal__item-mes', MESES[ev.ini.getMonth()].slice(0, 3)));
      var cuerpo = el('div', 'us-cal__item-cuerpo');
      var b = el('button', 'us-cal__item-titulo', ev.titulo);
      b.type = 'button';
      b.addEventListener('click', function () { self.abrirEvento(ev, b); });
      cuerpo.appendChild(b);
      cuerpo.appendChild(el('span', 'us-cal__item-meta', textoHorario(ev) + (ev.lugar ? ' · ' + ev.lugar : '')));
      li.appendChild(fechaBox);
      li.appendChild(cuerpo);
      ul.appendChild(li);
    });
    seccion.appendChild(ul);
    raiz.appendChild(seccion);

    if (enfocado) {
      var vuelve = raiz.querySelector('[data-foco="' + enfocado + '"]');
      if (vuelve) { vuelve.focus(); }
    }
  };

  // ---- Ventana de detalle -------------------------------------------------

  Calendario.prototype.abrirDialogo = function (tituloTexto, cuerpo, origen) {
    var self = this;
    this.cerrarDialogo(true);

    var fondo = el('div', 'us-cal__fondo');
    var caja = el('div', 'us-cal__dialogo');
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'true');
    var idTitulo = 'us-cal-dialogo-titulo';
    caja.setAttribute('aria-labelledby', idTitulo);

    var cab = el('div', 'us-cal__dialogo-cab');
    var h = el('h3', 'us-cal__dialogo-titulo', tituloTexto);
    h.id = idTitulo;
    var cerrar = el('button', 'us-cal__cerrar', '×');
    cerrar.type = 'button';
    cerrar.setAttribute('aria-label', 'Cerrar');
    cab.appendChild(h);
    cab.appendChild(cerrar);
    caja.appendChild(cab);
    caja.appendChild(cuerpo);
    fondo.appendChild(caja);
    document.body.appendChild(fondo);
    document.body.classList.add('us-cal-abierto');

    function cerrarYVolver() { self.cerrarDialogo(); }
    cerrar.addEventListener('click', cerrarYVolver);
    fondo.addEventListener('mousedown', function (e) { if (e.target === fondo) { cerrarYVolver(); } });
    this.teclas = function (e) {
      if (e.key === 'Escape') { cerrarYVolver(); return; }
      if (e.key === 'Tab') {
        var foco = caja.querySelectorAll('a[href], button');
        if (!foco.length) { return; }
        var primero = foco[0], ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    };
    document.addEventListener('keydown', this.teclas);
    this.dialogo = { fondo: fondo, origen: origen };
    cerrar.focus();
  };

  Calendario.prototype.cerrarDialogo = function (sinFoco) {
    if (!this.dialogo) { return; }
    document.removeEventListener('keydown', this.teclas);
    if (this.dialogo.fondo.parentNode) { this.dialogo.fondo.parentNode.removeChild(this.dialogo.fondo); }
    document.body.classList.remove('us-cal-abierto');
    var origen = this.dialogo.origen;
    this.dialogo = null;
    if (!sinFoco && origen && document.body.contains(origen)) { origen.focus(); }
  };

  Calendario.prototype.abrirEvento = function (ev, origen) {
    var cuerpo = el('div', 'us-cal__dialogo-cuerpo');
    cuerpo.appendChild(el('p', 'us-cal__dato us-cal__dato--cuando', textoHorario(ev)));
    if (ev.lugar) { cuerpo.appendChild(el('p', 'us-cal__dato us-cal__dato--lugar', ev.lugar)); }
    if (ev.descripcion) { cuerpo.appendChild(el('p', 'us-cal__descripcion', ev.descripcion)); }

    var acciones = el('div', 'us-cal__acciones');
    if (ev.enlace) {
      var mas = el('a', 'us-cal__btn us-cal__btn--principal', 'Más información');
      mas.href = ev.enlace;
      mas.target = '_blank';
      mas.rel = 'noopener noreferrer';
      acciones.appendChild(mas);
    }
    var pagina = el('a', 'us-cal__btn', 'Ver página del evento');
    pagina.href = ev.url;
    acciones.appendChild(pagina);
    if (ev.urlEditar) {
      var editar = el('a', 'us-cal__btn us-cal__btn--admin', 'Editar evento');
      editar.href = ev.urlEditar;
      acciones.appendChild(editar);
    }
    cuerpo.appendChild(acciones);
    this.abrirDialogo(ev.titulo, cuerpo, origen);
  };

  Calendario.prototype.abrirDia = function (fecha, eventos, origen) {
    var self = this;
    var cuerpo = el('div', 'us-cal__dialogo-cuerpo');
    var ul = el('ul', 'us-cal__items');
    eventos.forEach(function (ev) {
      var li = el('li', 'us-cal__item');
      var cuerpoItem = el('div', 'us-cal__item-cuerpo');
      var b = el('button', 'us-cal__item-titulo', ev.titulo);
      b.type = 'button';
      b.addEventListener('click', function () { self.abrirEvento(ev, origen); });
      cuerpoItem.appendChild(b);
      cuerpoItem.appendChild(el('span', 'us-cal__item-meta', esTodoElDia(ev) ? 'Todo el día' : hora(ev.ini) + (ev.lugar ? ' · ' + ev.lugar : '')));
      li.appendChild(cuerpoItem);
      ul.appendChild(li);
    });
    cuerpo.appendChild(ul);
    this.abrirDialogo(fechaLarga(fecha).replace(/^./, function (c) { return c.toUpperCase(); }), cuerpo, origen);
  };

  Drupal.behaviors.usCalendario = {
    attach: function (context) {
      once('us-calendario', '[data-us-cal]', context).forEach(function (raiz) {
        new Calendario(raiz, drupalSettings.usCalendario || {});
      });
    }
  };

})(Drupal, drupalSettings, once);
