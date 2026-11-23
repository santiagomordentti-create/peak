/* PEAK. — Selector de ciudad + WhatsApp (JS vanilla, sin dependencias).
 *
 * Todos los links de WhatsApp del sitio llevan:
 *   data-wa="origen"          (producto | hero | nav | flotante | encargue | cta)
 *   data-msg="mensaje"        (texto a precargar; "Entrega o retiro en: ___ 📍" se completa con la ciudad)
 *   data-producto="nombre"    (solo en las cards)
 * y pasan por abrirWhatsApp(), que SIEMPRE abre el selector. Al elegir, se abre WhatsApp con el número
 * de esa ciudad y el mensaje de ESE botón. La última ciudad elegida se recuerda solo para marcarla
 * ("Última vez") y darle el foco inicial.
 *
 * Links directos sin selector (footer): data-wa-directo="tandil" | "caba".
 */
(function () {
  'use strict';

  // ── Configuración: único lugar con los números de WhatsApp ──
  var CONTACTOS = {
    tandil: { nombre: 'Tandil', numero: '5491126320965', sub: 'Entrega o retiro en Tandil' },
    caba: { nombre: 'CABA / Bs As', numero: '5492494574546', sub: 'Entrega o retiro en Capital y alrededores' },
  };
  var CLAVE = 'peak_ciudad';
  var PLACEHOLDER = /Entrega o retiro en: ___ 📍/g;

  // ── Última ciudad elegida (localStorage con try/catch: en modo privado o con storage bloqueado, no se marca ninguna) ──
  function leerCiudad() { try { var c = localStorage.getItem(CLAVE); return CONTACTOS[c] ? c : null; } catch (e) { return null; } }
  function guardarCiudad(c) { try { localStorage.setItem(CLAVE, c); } catch (e) {} }
  var ciudad = leerCiudad();
  var oyentes = [];
  function avisar() { oyentes.forEach(function (fn) { try { fn(ciudad); } catch (e) {} }); }

  // ── Analytics (Vercel Web Analytics) ──
  function track(nombre, data) { try { if (typeof window.va === 'function') window.va('event', { name: nombre, data: data }); } catch (e) {} }

  // ── URLs ──
  function mensajePara(c, msg) { return String(msg || '').replace(PLACEHOLDER, 'Entrega o retiro en: ' + CONTACTOS[c].nombre + ' 📍'); }
  function waUrl(c, msg) { return 'https://wa.me/' + CONTACTOS[c].numero + '?text=' + encodeURIComponent(mensajePara(c, msg)); }

  // Única función por la que pasan todos los botones de WhatsApp: siempre abre el selector
  // y guarda qué mensaje mandar cuando se elija la ciudad.
  function abrirWhatsApp(opts, opener) {
    abrirSelector(opener, opts);
  }

  // ── Selector (modal en desktop, bottom sheet en mobile: lo decide el CSS con @media) ──
  var raiz, dialogo, lista, pendiente = null, opener = null;

  function crearSelector() {
    raiz = document.createElement('div');
    raiz.className = 'pk-city';
    raiz.hidden = true;
    raiz.innerHTML =
      '<div class="pk-city__overlay" data-cerrar aria-hidden="true"></div>' +
      '<div class="pk-city__dialog" role="dialog" aria-modal="true" aria-labelledby="ciudad-title" aria-describedby="ciudad-desc">' +
        '<div class="pk-city__handle" aria-hidden="true"></div>' +
        '<div class="pk-city__head">' +
          '<h2 id="ciudad-title" class="pk-city__title">¿DESDE DÓNDE PEDÍS?</h2>' +
          '<p id="ciudad-desc" class="pk-city__desc">Te conectamos con el Peak de tu ciudad.</p>' +
        '</div>' +
        '<div class="pk-city__list"></div>' +
        '<button type="button" class="pk-city__cancel" data-cerrar>Cancelar</button>' +
      '</div>';
    dialogo = raiz.querySelector('.pk-city__dialog');
    lista = raiz.querySelector('.pk-city__list');
    Object.keys(CONTACTOS).forEach(function (c) {
      var k = CONTACTOS[c];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pk-city__opt';
      b.setAttribute('data-ciudad', c);
      b.innerHTML =
        '<span class="pk-city__pin" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6BFF3B" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg></span>' +
        '<span class="pk-city__txt"><span class="pk-city__name"></span><span class="pk-city__sub"></span><span class="pk-city__ultima">Última vez</span></span>';
      b.querySelector('.pk-city__name').textContent = k.nombre;
      b.querySelector('.pk-city__sub').textContent = k.sub;
      lista.appendChild(b);
    });
    raiz.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-ciudad]');
      if (opt) { elegir(opt.getAttribute('data-ciudad')); return; }
      if (e.target.closest('[data-cerrar]')) cerrarSelector();
    });
    document.body.appendChild(raiz);
  }

  function pintarOpciones() {
    [].forEach.call(lista.querySelectorAll('[data-ciudad]'), function (b) {
      var c = b.getAttribute('data-ciudad'), ultima = c === ciudad;
      b.classList.toggle('is-ultima', ultima);
      b.setAttribute('aria-label', CONTACTOS[c].nombre + '. ' + CONTACTOS[c].sub + (ultima ? '. Elegida la última vez' : ''));
    });
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cerrarSelector(); return; }
    if (/^(Tab|Arrow)/.test(e.key)) dialogo.setAttribute('data-teclado', '');
    if (e.key !== 'Tab') return;
    var f = [].slice.call(dialogo.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])'));
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!dialogo.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function abrirSelector(origen, opts) {
    if (!raiz) crearSelector();
    opener = origen || document.activeElement;
    pendiente = opts || null;
    pintarOpciones();
    if (!raiz.hidden) return;
    dialogo.removeAttribute('data-teclado');
    raiz.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    // Foco inicial en la última ciudad elegida (se confirma con un toque o con Enter); si no hay, en la primera.
    var b = (ciudad && lista.querySelector('[data-ciudad="' + ciudad + '"]')) || lista.querySelector('button');
    if (b) b.focus({ preventScroll: true });
  }

  function cerrarSelector() {
    if (!raiz || raiz.hidden) return;
    pendiente = null;
    raiz.hidden = true;
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    var o = opener; opener = null;
    if (o && o.isConnected && typeof o.focus === 'function') o.focus({ preventScroll: true });
  }

  function elegir(c) {
    var p = pendiente;
    ciudad = c;
    guardarCiudad(c);
    track('elegir_ciudad', { ciudad: c });
    cerrarSelector();
    avisar();
    if (p) {
      track('click_whatsapp', { ciudad: c, origen: p.origen, producto: p.producto || null });
      window.open(waUrl(c, p.msg), '_blank', 'noopener');
    }
  }

  // ── Delegación de clicks (fase de captura, antes que React) ──
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button > 0 || !e.target.closest) return;
    var t = e.target;

    var directo = t.closest('a[data-wa-directo]');
    if (directo) {
      track('click_whatsapp', { ciudad: directo.getAttribute('data-wa-directo'), origen: 'footer', producto: null });
      return; // navega normal, al número fijo
    }

    var a = t.closest('a[data-wa]');
    if (!a) return;
    e.preventDefault(); // WhatsApp se abre recién al elegir la ciudad en el selector
    abrirWhatsApp({ origen: a.getAttribute('data-wa'), producto: a.getAttribute('data-producto'), msg: a.getAttribute('data-msg') }, a);
  }, true);

  // ── API para la landing ──
  window.PeakCiudad = {
    CONTACTOS: CONTACTOS,
    get: function () { return ciudad; },
    nombre: function () { return ciudad ? CONTACTOS[ciudad].nombre : null; },
    waUrl: function (msg) { return ciudad ? waUrl(ciudad, msg) : '#elegir-ciudad'; },
    waDirecto: function (c, msg) { return waUrl(c, msg); },
    abrirWhatsApp: abrirWhatsApp,
    abrirSelector: abrirSelector,
    onChange: function (fn) { oyentes.push(fn); return function () { oyentes = oyentes.filter(function (x) { return x !== fn; }); }; },
  };
})();
