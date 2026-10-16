/**
 * help.js - Centro de ayuda (32-centro-de-ayuda.png / 33-centro-de-ayuda-abierta.png)
 * Búsqueda, categorías, preguntas desplegables y contactos de emergencia en Perú.
 */
import { renderIcon } from '../ui/icons.js';
import { escapeHtml } from '../utils/format.js';
import { showToast } from '../ui/toast.js';
import { FAQS, FAQ_CATEGORIES } from '../data/faqs.js';

const row = (icon, tone, title, sub, id) => `
  <button type="button" class="profile-row" ${id ? `id="${id}"` : ''}>
    <div class="icon-box ${tone}">${renderIcon(icon, 19)}</div>
    <div><b>${title}</b><span>${sub}</span></div>
    ${renderIcon('chevron', 17)}
  </button>`;

export function render() {
  return `
    <div class="screen sub-screen">
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">${renderIcon('arrow')} Perfil</button>
        <span>Centro de ayuda</span>
        <span class="header-spacer"></span>
      </header>
      <div class="sub-scroll">
        <div class="search help-search">
          ${renderIcon('search')}
          <input type="text" id="help-q" placeholder="¿En qué podemos ayudarte?" />
        </div>
        <div class="pills help-pills" id="help-cats">
          ${FAQ_CATEGORIES.map((c, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}
        </div>
        <div class="faq-list" id="faq-list"></div>

        <p class="group-title">¿Necesitas más ayuda?</p>
        <div class="profile-group">
          ${row('mail', 'green', 'Escribir a soporte', 'ayuda@siemprecerca.app · respondemos en 24 h', 'help-mail')}
          ${row('flag', 'coral', 'Reportar un aviso falso o mal uso', 'Ayúdanos a mantener segura la comunidad', 'help-report')}
          ${row('phone', 'coral', 'Emergencias: 105', 'Si hay riesgo inmediato, llama primero a la Policía (105). Bomberos 116 · SAMU 106', 'help-sos')}
        </div>
      </div>
    </div>`;
}

export function mount(root) {
  const list = root.querySelector('#faq-list');
  const input = root.querySelector('#help-q');
  let cat = 'Todo';
  let open = null;

  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const items = FAQS.map((f, i) => ({ ...f, i }))
      .filter((f) => (cat === 'Todo' || f.cat === cat) && (!q || (f.q + f.a).toLowerCase().includes(q)));
    if (!items.length) {
      list.innerHTML = '<p class="sub-intro empty">No encontramos resultados. Prueba con otras palabras o escríbenos.</p>';
      return;
    }
    list.innerHTML = items.map((f) => `
      <article class="faq ${open === f.i ? 'open' : ''}">
        <button type="button" data-i="${f.i}" aria-expanded="${open === f.i}">
          <span>${escapeHtml(f.q)}</span>${renderIcon('chevron', 17)}
        </button>
        <p>${escapeHtml(f.a)}</p>
      </article>`).join('');
  };

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-i]');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    open = open === i ? null : i;
    draw();
  });

  input.addEventListener('input', () => { open = null; draw(); });

  root.querySelector('#help-cats').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cat]');
    if (!btn) return;
    cat = btn.dataset.cat;
    open = null;
    root.querySelectorAll('#help-cats button').forEach((b) => b.classList.toggle('active', b === btn));
    draw();
  });

  root.querySelector('#btn-back').addEventListener('click', () => { window.location.hash = '#/perfil'; });
  root.querySelector('#help-mail').addEventListener('click', () => showToast('Escríbenos a ayuda@siemprecerca.app', 'info'));
  root.querySelector('#help-report').addEventListener('click', () => showToast('El formulario de reportes estará en el Avance 2', 'info'));
  root.querySelector('#help-sos').addEventListener('click', () => showToast('Policía 105 · Bomberos 116 · SAMU 106', 'info'));

  draw();
}
