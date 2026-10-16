/**
 * settings.js - Panel de administración · Ajustes
 * Historial de moderación, criterios de revisión y herramientas del modo demostración.
 */
import { renderIcon } from '../../ui/icons.js';
import { renderAdminShell, mountAdminShell } from '../../ui/admin-layout.js';
import { when, empty } from '../../ui/admin-kit.js';
import { showConfirmModal } from '../../ui/modal.js';
import { adminService } from '../../services/admin.js';
import { showToast } from '../../ui/toast.js';
import { appState } from '../../state.js';
import { escapeHtml } from '../../utils/format.js';
import { CONFIG } from '../../config.js';

const LABELS = {
  case_approved: 'Aprobó alerta', case_rejected: 'Rechazó alerta', case_resolved: 'Resolvió alerta', case_deleted: 'Eliminó alerta',
  user_banned: 'Suspendió usuario', user_unbanned: 'Reactivó usuario', sighting_status: 'Actualizó avistamiento',
};

const CRITERIA = [
  'La foto es clara y corresponde a la persona o mascota.',
  'La última ubicación y la descripción son concretas (no “por ahí”).',
  'El contacto es real: una cuenta, un número verificado.',
  'No es un aviso repetido ni una broma (revisa el folio y el nombre).',
  'No se publican datos innecesarios de menores de edad.',
];

export function render() {
  return renderAdminShell({
    active: 'settings',
    title: 'Ajustes <em>y registro</em>',
    subtitle: 'Historial del equipo, criterios de revisión y herramientas de demostración.',
    body: `
      <section class="admin-grid">
        <article class="card span-2">
          <header class="card-head"><h2>Historial de moderación</h2><small>Últimas acciones</small></header>
          <div id="audit-list"></div>
        </article>

        <div class="stack">
          <article class="card">
            <header class="card-head"><h2>Criterios para aprobar</h2></header>
            <ul class="checklist">${CRITERIA.map((c) => `<li>${renderIcon('check', 14)}<span>${c}</span></li>`).join('')}</ul>
          </article>

          <article class="card">
            <header class="card-head"><h2>Sistema</h2></header>
            <dl class="sys">
              <dt>Almacenamiento</dt><dd>${CONFIG.USE_API ? 'API + MongoDB' : 'Local (navegador)'}</dd>
              <dt>Datos de ejemplo</dt><dd>v${CONFIG.SEED_VERSION}</dd>
              <dt>Tu rol</dt><dd>${escapeHtml(appState.getSession()?.role || '')}</dd>
            </dl>
            ${CONFIG.DEMO_MODE ? `<button type="button" class="button outline danger-text" id="btn-reset">Restablecer datos de demostración</button>
            <p class="hint">Borra todo lo creado en este navegador y vuelve a los datos de ejemplo.</p>` : ''}
          </article>
        </div>
      </section>`,
  });
}

export function mount(root) {
  mountAdminShell(root);
  const list = root.querySelector('#audit-list');

  adminService.listAudit(40).then((items) => {
    list.innerHTML = items.length ? `
      <table class="admin-table">
        <thead><tr><th>Cuándo</th><th>Quién</th><th>Acción</th><th>Sobre</th><th>Detalle</th></tr></thead>
        <tbody>${items.map((a) => `
          <tr><td>${when(a.createdAt)}</td><td>${escapeHtml(a.adminName)}</td><td>${LABELS[a.action] || a.action}</td>
          <td class="clip">${escapeHtml(a.targetLabel || '')}</td><td class="clip">${escapeHtml(a.detail || '—')}</td></tr>`).join('')}</tbody>
      </table>` : empty('Todavía no hay acciones registradas. Aprueba o rechaza una alerta para verlas aquí.');
  }).catch((err) => { list.innerHTML = empty(err.message); });

  root.querySelector('#btn-reset')?.addEventListener('click', () => {
    showConfirmModal({
      title: '¿Restablecer datos?',
      message: 'Se borrarán las alertas, usuarios y avisos creados en este navegador. Se cerrará tu sesión.',
      confirmText: 'Sí, restablecer',
      onConfirm: async () => {
        await adminService.resetDemo();
        appState.setSession(null);
        showToast('Datos restablecidos', 'success');
        window.location.hash = '#/login';
      },
    });
  });
}
