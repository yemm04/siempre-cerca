/**
 * nav.js - Componente de navegación (barra inferior móvil y barra lateral desktop)
 * Genera la barra de 5 pestañas con el botón '+' central y soporte responsivo.
 */
import { renderIcon } from './icons.js';
import { initials, escapeHtml } from '../utils/format.js';
import { appState } from '../state.js';
import { CONFIG } from '../config.js';
import { authService } from '../services/auth.js';
import { showConfirmModal } from './modal.js';
import { showToast } from './toast.js';

/**
 * Renderiza la barra de navegación inferior móvil
 */
export function renderNav(activeTab = 'home') {
  const session = appState.getSession();
  const userName = session ? session.name : 'Usuario';
  const userInitials = initials(userName);

  return `
    <nav class="nav" aria-label="Navegación principal">
      <button type="button" class="${activeTab === 'home' ? 'active' : ''}" data-nav="home" aria-label="Inicio">
        ${renderIcon('home')}
        <span>Inicio</span>
      </button>
      <button type="button" class="${activeTab === 'community' ? 'active' : ''}" data-nav="community" aria-label="Comunidad">
        ${renderIcon('group')}
        <span>Comunidad</span>
      </button>
      <button type="button" class="nav-create" data-nav="create" aria-label="Crear alerta">
        <span>+</span>
      </button>
      <button type="button" class="${activeTab === 'notifications' ? 'active' : ''}" data-nav="notifications" aria-label="Alertas y notificaciones">
        ${renderIcon('bell')}
        <i></i>
        <span>Alertas</span>
      </button>
      <button type="button" class="${activeTab === 'profile' ? 'active' : ''}" data-nav="profile" aria-label="Mi perfil">
        <span class="avatar tiny">${userInitials}</span>
        <span>Perfil</span>
      </button>
    </nav>
  `;
}

/**
 * Renderiza la barra lateral para laptops (>= 1100px)
 */
export function renderDesktopSidebar(activeTab = 'home') {
  const session = appState.getSession();
  const userName = session ? session.name : 'Usuario';
  const userInitials = initials(userName);

  return `
    <aside class="desktop-sidebar" aria-label="Barra lateral">
      <div class="logo">
        <div class="logo-mark">
          <span class="leaf one"></span>
          <span class="leaf two"></span>
          <span class="leaf three"></span>
          <div class="people"><span></span><span></span><span></span></div>
        </div>
        <div class="logo-name">Siempre<br><em>Cerca</em></div>
      </div>

      <nav class="desktop-sidebar-nav">
        <button type="button" class="${activeTab === 'home' ? 'active' : ''}" data-nav="home">
          ${renderIcon('home')} <span>Inicio</span>
        </button>
        <button type="button" class="${activeTab === 'community' ? 'active' : ''}" data-nav="community">
          ${renderIcon('group')} <span>Comunidad</span>
        </button>
        <button type="button" class="${activeTab === 'notifications' ? 'active' : ''}" data-nav="notifications">
          ${renderIcon('bell')} <span>Alertas</span>
        </button>
        <button type="button" class="${activeTab === 'profile' ? 'active' : ''}" data-nav="profile">
          ${renderIcon('user')} <span>Perfil</span>
        </button>
        <button type="button" class="button alert sidebar-create" data-nav="create">
          + Crear alerta
        </button>
      </nav>

      <div class="desktop-sidebar-user-wrap">
        <div class="user-menu" id="sidebar-user-menu" hidden>
          ${CONFIG.STAFF_ROLES.includes(session?.role) ? `<button type="button" id="menu-admin">${renderIcon('shield', 17)} Panel de administración</button>` : ''}
          <button type="button" id="menu-profile">${renderIcon('user', 17)} Ver mi perfil</button>
          <button type="button" id="menu-logout" class="danger">${renderIcon('logout', 17)} Cerrar sesión</button>
        </div>
        <button type="button" class="desktop-sidebar-user" id="sidebar-user" aria-haspopup="true" aria-expanded="false">
          <span class="avatar">${userInitials}</span>
          <div>
            <b>${escapeHtml(userName)}</b>
            <small>@${escapeHtml(session?.username || 'usuario')}</small>
          </div>
          <span class="user-caret">${renderIcon('chevron', 16)}</span>
        </button>
      </div>
    </aside>
  `;
}

/**
 * Asigna los eventos de navegación por hash a los botones del contenedor
 */
export function mountNavEvents(container) {
  if (!container) return;
  mountUserMenu(container);
  const buttons = container.querySelectorAll('[data-nav]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.dataset.nav;
      const routes = {
        home: '#/inicio',
        community: '#/comunidad',
        create: '#/crear',
        notifications: '#/notificaciones',
        profile: '#/perfil',
      };
      if (routes[target]) {
        window.location.hash = routes[target];
      }
    });
  });
}

/**
 * Menú del usuario en la barra lateral: al hacer clic se abre con
 * "Ver mi perfil" y "Cerrar sesión" (pide confirmación).
 */
function mountUserMenu(container) {
  const trigger = container.querySelector('#sidebar-user');
  const menu = container.querySelector('#sidebar-user-menu');
  if (!trigger || !menu || trigger.dataset.bound) return; // evita enlazar dos veces
  trigger.dataset.bound = '1';

  const setOpen = (open) => {
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(menu.hidden);
  });

  // Cerrar al hacer clic fuera (el listener se quita solo si el menú ya no existe)
  const onOutside = (e) => {
    if (!menu.isConnected) { document.removeEventListener('click', onOutside); return; }
    if (!menu.contains(e.target)) setOpen(false);
  };
  document.addEventListener('click', onOutside);

  menu.querySelector('#menu-admin')?.addEventListener('click', () => {
    setOpen(false);
    window.location.hash = '#/admin';
  });

  menu.querySelector('#menu-profile').addEventListener('click', () => {
    setOpen(false);
    window.location.hash = '#/perfil';
  });

  menu.querySelector('#menu-logout').addEventListener('click', () => {
    setOpen(false);
    showConfirmModal({
      title: '¿Cerrar sesión?',
      message: 'Podrás volver a entrar con tu usuario o correo y tu contraseña cuando quieras.',
      confirmText: 'Sí, cerrar sesión',
      onConfirm: async () => {
        await authService.logout();
        appState.setSession(null);
        showToast('Sesión cerrada correctamente', 'info');
        window.location.hash = '#/';
      },
    });
  });
}
