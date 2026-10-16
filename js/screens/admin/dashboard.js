/**
 * dashboard.js - Panel de administración · Resumen
 * Números clave, cola de revisión, gráficos, mapa de alertas activas y actividad reciente.
 */
import { renderIcon } from '../../ui/icons.js';
import { renderAdminShell, mountAdminShell, refreshPendingBadge } from '../../ui/admin-layout.js';
import { thumb, empty, rowBtn, typeLabel, askReason } from '../../ui/admin-kit.js';
import { initLeafletMap, addCasePinsToMap } from '../../ui/map.js';
import { adminService } from '../../services/admin.js';
import { showToast } from '../../ui/toast.js';
import { escapeHtml, formatRelativeTime } from '../../utils/format.js';

const ACTIONS = {
  case_approved: 'aprobó la alerta', case_rejected: 'rechazó la alerta', case_resolved: 'marcó como resuelta',
  case_deleted: 'eliminó la alerta', user_banned: 'suspendió a', user_unbanned: 'reactivó a', sighting_status: 'actualizó el avistamiento de',
};

const kpi = (icon, tone, value, label, note) => `
  <article class="kpi ${tone}">
    <span class="kpi-icon">${renderIcon(icon, 22)}</span>
    <div><b>${value}</b><span>${label}</span><small>${note}</small></div>
  </article>`;

function barChart(days) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const names = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  return `<div class="bars">${days.map((d) => `
    <div class="bar-col" title="${d.count} alerta(s)">
      <em>${d.count}</em>
      <span style="height:${Math.max(6, (d.count / max) * 100)}%"></span>
      <small>${names[new Date(`${d.date}T12:00:00`).getDay()]}</small>
    </div>`).join('')}</div>`;
}

export function render() {
  return renderAdminShell({
    active: 'dashboard',
    title: 'Panel de <em>moderación</em>',
    subtitle: 'Todo lo que pasa en la comunidad, de un vistazo.',
    body: '<div class="admin-loading">Cargando resumen…</div>',
  });
}

export function mount(root) {
  mountAdminShell(root);
  const body = root.querySelector('#admin-body');
  let map = null;

  async function load() {
    const [stats, pending, active, audit] = await Promise.all([
      adminService.stats(),
      adminService.listCases({ status: 'pending_review' }),
      adminService.listCases({ status: 'active' }),
      adminService.listAudit(6),
    ]);
    const total = stats.byType.person + stats.byType.pet || 1;
    const personPct = Math.round((stats.byType.person / total) * 100);

    body.innerHTML = `
      <section class="kpi-grid">
        ${kpi('clock', 'ochre', stats.cases.pending_review, 'Por revisar', stats.cases.pending_review ? 'Esperan tu aprobación' : 'Todo al día')}
        ${kpi('flag', 'green', stats.cases.active, 'Alertas activas', 'Visibles en el mapa')}
        ${kpi('check', 'blue', stats.cases.resolved, 'Casos resueltos', `${stats.resolutionRate}% de tasa de resolución`)}
        ${kpi('group', 'sage', stats.users.total, 'Usuarios', `${stats.users.banned} suspendido(s)`)}
        ${kpi('location', 'coral', stats.sightings.total, 'Avistamientos', `${stats.sightings.received} por revisar`)}
      </section>

      <section class="admin-grid">
        <article class="card span-2">
          <header class="card-head"><h2>Cola de revisión</h2><a href="#/admin/alertas">Ver todas</a></header>
          <div id="queue">${pending.length ? pending.slice(0, 4).map(queueRow).join('') : empty('No hay alertas pendientes. ¡Buen trabajo!')}</div>
        </article>

        <div class="stack">
        <article class="card">
          <header class="card-head"><h2>Alertas por día</h2><small>Últimos 7 días</small></header>
          ${barChart(stats.last7)}
        </article>

        <article class="card">
          <header class="card-head"><h2>Personas y mascotas</h2></header>
          <div class="donut-wrap">
            <div class="donut" style="--p:${personPct}"><b>${stats.cases.total}</b><small>alertas</small></div>
            <ul class="legend">
              <li><i class="c1"></i>Personas <b>${stats.byType.person}</b></li>
              <li><i class="c2"></i>Mascotas <b>${stats.byType.pet}</b></li>
            </ul>
          </div>
        </article>
        </div>

        <article class="card span-2">
          <header class="card-head"><h2>Mapa de alertas activas</h2><small>${active.length} en Lima</small></header>
          <div id="admin-map" class="admin-map"></div>
        </article>

        <article class="card">
          <header class="card-head"><h2>Actividad reciente</h2><a href="#/admin/ajustes">Historial</a></header>
          <ul class="activity">${audit.length ? audit.map(activityRow).join('') : '<li class="muted">Todavía no hay acciones registradas.</li>'}</ul>
        </article>
      </section>`;

    if (map) { map.remove(); map = null; }
    map = initLeafletMap('admin-map');
    if (map) addCasePinsToMap(map, active, (c) => { window.location.hash = '#/admin/alertas'; });
    else root.querySelector('#admin-map').innerHTML = '<div class="admin-empty">El mapa necesita conexión a internet para cargar.</div>';
  }

  const queueRow = (c) => `
    <div class="queue-row">
      ${thumb(c.thumb || c.photo, c.name)}
      <div class="grow"><b>${escapeHtml(c.name)}</b><small>${typeLabel(c.type)} · ${escapeHtml(c.lastSeenText || '')} · ${formatRelativeTime(c.createdAt)}</small></div>
      <div class="row-actions">${rowBtn('reject', c._id, 'Rechazar', 'danger')}${rowBtn('approve', c._id, 'Aprobar', 'primary')}</div>
    </div>`;

  const activityRow = (a) => `
    <li><span class="dot"></span><div><b>${escapeHtml(a.adminName)}</b> ${ACTIONS[a.action] || a.action} <em>${escapeHtml(a.targetLabel || '')}</em><small>${formatRelativeTime(a.createdAt)}</small></div></li>`;

  body.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    try {
      if (btn.dataset.action === 'approve') {
        await adminService.reviewCase(id, { decision: 'approve' });
        showToast('Alerta aprobada: ya aparece en el mapa', 'success');
      } else {
        const reason = await askReason({
          title: 'Rechazar alerta', message: 'El usuario verá este motivo en su notificación.',
          placeholder: 'Motivo del rechazo…', confirmText: 'Rechazar alerta',
          presets: ['Información incompleta', 'Foto no clara', 'Parece un aviso falso'],
        });
        if (reason === null) return;
        await adminService.reviewCase(id, { decision: 'reject', reason });
        showToast('Alerta rechazada', 'info');
      }
      await load();
      refreshPendingBadge(root);
    } catch (err) {
      showToast(err.message || 'No se pudo completar la acción', 'error');
    }
  });

  load().catch((err) => { body.innerHTML = empty(err.message || 'No se pudo cargar el resumen.'); });
  return () => { if (map) map.remove(); };
}
