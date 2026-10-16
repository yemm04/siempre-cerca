/**
 * admin-layout.js - Marco del panel de administración (barra lateral + cabecera)
 * Lo usan todas las pantallas de js/screens/admin/.
 */
import { renderIcon } from './icons.js';
import { escapeHtml, initials } from '../utils/format.js';
import { appState } from '../state.js';
import { authService } from '../services/auth.js';
import { adminService } from '../services/admin.js';
import { showConfirmModal } from './modal.js';
import { showToast } from './toast.js';

const NAV = [
  { key: 'dashboard', label: 'Resumen', icon: 'dashboard', hash: '#/admin' },
  { key: 'cases', label: 'Alertas', icon: 'flag', hash: '#/admin/alertas' },
  { key: 'users', label: 'Usuarios', icon: 'group', hash: '#/admin/usuarios' },
  { key: 'sightings', label: 'Avistamientos', icon: 'location', hash: '#/admin/avistamientos' },
  { key: 'settings', label: 'Ajustes', icon: 'gear', hash: '#/admin/ajustes' },
];

/**
 * @param {{active:string,title:string,subtitle?:string,actions?:string,body:string}} cfg
 */
export function renderAdminShell({ active, title, subtitle = '', actions = '', body }) {
  const me = appState.getSession();
  return `
    <div class="admin-shell">
      <aside class="admin-side" id="admin-side">
        <div class="admin-brand">
          <div class="logo compact admin-logo"><div class="logo-mark"><span class="leaf one"></span><span class="leaf two"></span><span class="leaf three"></span></div></div>
          <div><b>Siempre Cerca</b><small>Panel de moderación</small></div>
        </div>

        <nav class="admin-nav" aria-label="Administración">
          ${NAV.map((n) => `
            <a href="${n.hash}" class="${n.key === active ? 'active' : ''}">
              ${renderIcon(n.icon, 19)} <span>${n.label}</span>
              ${n.key === 'cases' ? '<em class="admin-count" id="nav-pending" hidden></em>' : ''}
            </a>`).join('')}
        </nav>

        <div class="admin-side-foot">
          <a href="#/inicio" class="admin-link">${renderIcon('home', 17)} Ir a la app</a>
          <button type="button" class="admin-link" id="admin-logout">${renderIcon('logout', 17)} Cerrar sesión</button>
          <div class="admin-me">
            <span class="avatar">${initials(me?.name || 'Admin')}</span>
            <div><b>${escapeHtml(me?.name || 'Equipo')}</b><small>${me?.role === 'admin' ? 'Administrador' : 'Moderador'}</small></div>
          </div>
        </div>
      </aside>

      <div class="admin-main">
        <header class="admin-top">
          <button type="button" class="admin-burger" id="admin-burger" aria-label="Menú">${renderIcon('menu', 22)}</button>
          <div class="admin-title">
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
          </div>
          <div class="admin-actions">${actions}</div>
        </header>
        <main class="admin-content" id="admin-body">${body}</main>
      </div>
    </div>`;
}

/** Eventos comunes: menú móvil, cerrar sesión y contador de alertas por revisar */
export function mountAdminShell(root) {
  root.querySelector('#admin-burger')?.addEventListener('click', () => {
    root.querySelector('#admin-side').classList.toggle('open');
  });

  root.querySelector('#admin-logout')?.addEventListener('click', () => {
    showConfirmModal({
      title: '¿Cerrar sesión?',
      message: 'Saldrás del panel de administración.',
      confirmText: 'Sí, cerrar sesión',
      onConfirm: async () => {
        await authService.logout();
        appState.setSession(null);
        showToast('Sesión cerrada correctamente', 'info');
        window.location.hash = '#/';
      },
    });
  });

  refreshPendingBadge(root);
}

/** Muestra cuántas alertas esperan revisión junto a "Alertas" */
export async function refreshPendingBadge(root) {
  const badge = root.querySelector('#nav-pending');
  if (!badge) return;
  try {
    const pending = await adminService.listCases({ status: 'pending_review' });
    badge.textContent = pending.length;
    badge.hidden = pending.length === 0;
  } catch (e) {
    badge.hidden = true;
  }
}
