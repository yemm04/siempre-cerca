/**
 * cases.js - Panel de administración · Alertas
 * Lista filtrable de alertas con acciones de moderación y panel de detalle.
 */
import { renderAdminShell, mountAdminShell, refreshPendingBadge } from '../../ui/admin-layout.js';
import { thumb, caseBadge, typeLabel, when, empty, rowBtn, askReason } from '../../ui/admin-kit.js';
import { openCaseDrawer, closeCaseDrawer } from '../../ui/admin-case-drawer.js';
import { showConfirmModal } from '../../ui/modal.js';
import { adminService } from '../../services/admin.js';
import { showToast } from '../../ui/toast.js';
import { escapeHtml } from '../../utils/format.js';

const TABS = [
  ['all', 'Todas'], ['pending_review', 'En revisión'], ['active', 'Activas'], ['resolved', 'Resueltas'], ['rejected', 'No aprobadas'],
];

export function render() {
  return renderAdminShell({
    active: 'cases',
    title: 'Alertas <em>de la comunidad</em>',
    subtitle: 'Revisa, aprueba o rechaza lo que publican los vecinos.',
    body: `
      <div class="toolbar">
        <div class="tabs" id="case-tabs">${TABS.map(([k, l], i) => `<button type="button" data-tab="${k}" class="${i === 0 ? 'active' : ''}">${l}<em></em></button>`).join('')}</div>
        <div class="admin-search"><input id="case-q" type="search" placeholder="Buscar por nombre, folio o reportante…" /></div>
      </div>
      <div class="table-card"><div id="case-table" class="table-wrap"></div></div>`,
  });
}

export function mount(root) {
  mountAdminShell(root);
  const table = root.querySelector('#case-table');
  let status = 'all';
  let q = '';
  let list = [];

  async function load() {
    list = await adminService.listCases({ status, q });
    const everything = await adminService.listCases({});
    root.querySelectorAll('#case-tabs button').forEach((b) => {
      const k = b.dataset.tab;
      b.querySelector('em').textContent = k === 'all' ? everything.length : everything.filter((c) => c.status === k).length;
    });
    table.innerHTML = list.length ? `
      <table class="admin-table">
        <thead><tr><th>Alerta</th><th>Tipo</th><th>Reportante</th><th>Última vez visto</th><th>Estado</th><th>Enviada</th><th></th></tr></thead>
        <tbody>${list.map(row).join('')}</tbody>
      </table>` : empty('No hay alertas con esos filtros.');
  }

  const row = (c) => `
    <tr data-open="${c._id}">
      <td><div class="cell-user">${thumb(c.thumb || c.photo, c.name)}<div><b>${escapeHtml(c.name)}</b><small>${escapeHtml(c.folio)}</small></div></div></td>
      <td>${typeLabel(c.type)}</td>
      <td>${escapeHtml(c.ownerName || '—')}</td>
      <td class="clip">${escapeHtml(c.lastSeenText || '—')}</td>
      <td>${caseBadge(c.status)}</td>
      <td>${when(c.createdAt)}</td>
      <td class="row-actions">
        ${c.status === 'pending_review' ? rowBtn('reject', c._id, 'Rechazar', 'danger') + rowBtn('approve', c._id, 'Aprobar', 'primary') : ''}
        ${c.status === 'active' ? rowBtn('resolve', c._id, 'Resuelta') : ''}
      </td>
    </tr>`;

  async function act(action, id) {
    const c = list.find((x) => x._id === id);
    if (!c) return;
    try {
      if (action === 'approve') {
        await adminService.reviewCase(id, { decision: 'approve' });
        showToast('Alerta aprobada: ya aparece en el mapa', 'success');
      } else if (action === 'reject') {
        const reason = await askReason({
          title: 'Rechazar alerta', message: 'El usuario verá este motivo en su notificación.',
          placeholder: 'Motivo del rechazo…', confirmText: 'Rechazar alerta',
          presets: ['Información incompleta', 'Foto no clara', 'Parece un aviso falso'],
        });
        if (reason === null) return;
        await adminService.reviewCase(id, { decision: 'reject', reason });
        showToast('Alerta rechazada', 'info');
      } else if (action === 'resolve') {
        await adminService.resolveCase(id);
        showToast('Alerta marcada como resuelta', 'success');
      } else if (action === 'delete') {
        showConfirmModal({
          title: '¿Eliminar alerta?', message: `Se borrará "${c.name}" junto con sus avistamientos. No se puede deshacer.`,
          confirmText: 'Sí, eliminar',
          onConfirm: async () => { await adminService.deleteCase(id); showToast('Alerta eliminada', 'info'); await load(); refreshPendingBadge(root); },
        });
        return;
      }
      await load();
      refreshPendingBadge(root);
    } catch (err) {
      showToast(err.message || 'No se pudo completar la acción', 'error');
    }
  }

  table.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn) { e.stopPropagation(); act(btn.dataset.action, btn.dataset.id); return; }
    const tr = e.target.closest('[data-open]');
    const c = tr && list.find((x) => x._id === tr.dataset.open);
    if (c) openCaseDrawer(c, (action, item) => act(action, item._id));
  });

  root.querySelector('#case-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    status = b.dataset.tab;
    root.querySelectorAll('#case-tabs button').forEach((x) => x.classList.toggle('active', x === b));
    load();
  });

  let timer = null;
  root.querySelector('#case-q').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { q = e.target.value; load(); }, 200);
  });

  load().catch((err) => { table.innerHTML = empty(err.message); });
  return closeCaseDrawer;
}
