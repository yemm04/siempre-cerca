/**
 * sightings.js - Panel de administración · Avistamientos
 * Pistas que envían los vecinos. El equipo puede marcarlas como confirmadas o útiles.
 */
import { renderAdminShell, mountAdminShell } from '../../ui/admin-layout.js';
import { thumb, when, empty } from '../../ui/admin-kit.js';
import { adminService } from '../../services/admin.js';
import { showToast } from '../../ui/toast.js';
import { escapeHtml } from '../../utils/format.js';

const TABS = [['all', 'Todos'], ['received', 'Recibidos'], ['confirmed', 'Confirmados'], ['helped', 'Ayudaron']];

export function render() {
  return renderAdminShell({
    active: 'sightings',
    title: 'Avistamientos <em>de los vecinos</em>',
    subtitle: 'Pistas enviadas para ayudar a encontrar a quienes buscamos.',
    body: `
      <div class="toolbar">
        <div class="tabs" id="sig-tabs">${TABS.map(([k, l], i) => `<button type="button" data-tab="${k}" class="${i === 0 ? 'active' : ''}">${l}</button>`).join('')}</div>
        <div class="admin-search"><input id="sig-q" type="search" placeholder="Buscar por caso, lugar o nota…" /></div>
      </div>
      <div class="table-card"><div id="sig-table" class="table-wrap"></div></div>`,
  });
}

export function mount(root) {
  mountAdminShell(root);
  const table = root.querySelector('#sig-table');
  let status = 'all';
  let q = '';

  async function load() {
    const list = await adminService.listSightings({ status, q });
    table.innerHTML = list.length ? `
      <table class="admin-table">
        <thead><tr><th>Caso</th><th>Enviado por</th><th>Lugar</th><th>Nota</th><th>Cuándo</th><th>Estado</th></tr></thead>
        <tbody>${list.map((s) => `
          <tr>
            <td><div class="cell-user">${thumb(s.img, s.name)}<div><b>${escapeHtml(s.name)}</b><small>${s.hasPhoto ? 'Con foto' : 'Sin foto'}</small></div></div></td>
            <td>${escapeHtml(s.reporterName)}</td>
            <td class="clip">${escapeHtml(s.where)}</td>
            <td class="clip wide">${escapeHtml(s.note || '—')}</td>
            <td>${when(s.createdAt)}</td>
            <td>
              <select class="state-select" data-id="${s._id}" aria-label="Estado del avistamiento">
                ${[['received', 'Recibido'], ['confirmed', 'Confirmado'], ['helped', 'Ayudó a encontrarla']]
                  .map(([v, l]) => `<option value="${v}" ${s.status === v ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </td>
          </tr>`).join('')}</tbody>
      </table>` : empty('No hay avistamientos con esos filtros.');
  }

  table.addEventListener('change', async (e) => {
    const sel = e.target.closest('.state-select');
    if (!sel) return;
    try {
      await adminService.setSightingStatus(sel.dataset.id, sel.value);
      showToast('Estado actualizado', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo actualizar', 'error');
    }
  });

  root.querySelector('#sig-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    status = b.dataset.tab;
    root.querySelectorAll('#sig-tabs button').forEach((x) => x.classList.toggle('active', x === b));
    load();
  });

  let timer = null;
  root.querySelector('#sig-q').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { q = e.target.value; load(); }, 200);
  });

  load().catch((err) => { table.innerHTML = empty(err.message); });
}
