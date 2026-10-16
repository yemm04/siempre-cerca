/**
 * admin-kit.js - Piezas pequeñas reutilizadas por las pantallas del panel
 * (etiquetas de estado, miniaturas, estados vacíos y ventana con motivo).
 */
import { escapeHtml, formatWhen } from '../utils/format.js';

const CASE_STATUS = {
  pending_review: { text: 'En revisión', tone: 'ochre' },
  active: { text: 'Activa', tone: 'green' },
  resolved: { text: 'Resuelta', tone: 'blue' },
  rejected: { text: 'No aprobada', tone: 'coral' },
};

export const caseStatusLabel = (status) => CASE_STATUS[status] || CASE_STATUS.pending_review;

export const badge = (text, tone = 'muted') => `<span class="badge ${tone}"><i></i>${escapeHtml(text)}</span>`;

export const caseBadge = (status) => {
  const { text, tone } = caseStatusLabel(status);
  return badge(text, tone);
};

export const typeLabel = (type) => (type === 'pet' ? 'Mascota' : 'Persona');

export const thumb = (src, alt = '') =>
  src ? `<img class="thumb" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />` : '<span class="thumb empty"></span>';

export const when = (iso) => (iso ? formatWhen(iso) : '—');

export const empty = (text) => `<div class="admin-empty">${escapeHtml(text)}</div>`;

/** Botón de acción pequeño de una fila */
export const rowBtn = (action, id, label, tone = '') =>
  `<button type="button" class="row-btn ${tone}" data-action="${action}" data-id="${id}">${label}</button>`;

/**
 * Ventana con un cuadro de texto para pedir un motivo (rechazar alerta, suspender usuario).
 * Devuelve el texto escrito o null si se cancela.
 */
export function askReason({ title, message, placeholder, confirmText, presets = [] }) {
  return new Promise((resolve) => {
    const scrim = document.createElement('div');
    scrim.className = 'confirm-scrim';
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    scrim.innerHTML = `
      <div class="confirm-sheet reason-sheet">
        <div class="handle"></div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        ${presets.length ? `<div class="reason-presets">${presets.map((p) => `<button type="button">${escapeHtml(p)}</button>`).join('')}</div>` : ''}
        <textarea id="reason-text" rows="3" placeholder="${escapeHtml(placeholder)}"></textarea>
        <button type="button" class="button alert" id="reason-ok">${escapeHtml(confirmText)}</button>
        <button type="button" class="button ghost" id="reason-cancel">Cancelar</button>
      </div>`;
    const done = (value) => { scrim.remove(); resolve(value); };
    const text = scrim.querySelector('#reason-text');
    scrim.querySelectorAll('.reason-presets button').forEach((b) =>
      b.addEventListener('click', () => { text.value = b.textContent; text.focus(); }));
    scrim.addEventListener('click', (e) => { if (e.target === scrim) done(null); });
    scrim.querySelector('#reason-cancel').addEventListener('click', () => done(null));
    scrim.querySelector('#reason-ok').addEventListener('click', () => done(text.value.trim()));
    document.body.appendChild(scrim);
    text.focus();
  });
}
