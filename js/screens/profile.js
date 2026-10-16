/**
 * profile.js - Pantalla de Perfil de usuario (20-perfil, 21-perfil-abajo y 34-cerrar-sesion)
 * Gestión de actividad, radio de alerta, accesos de seguridad y modal de cierre de sesión.
 */
import { renderIcon } from '../ui/icons.js';
import { renderNav, mountNavEvents } from '../ui/nav.js';
import { initials } from '../utils/format.js';
import { maskPhone, maskEmail } from '../utils/mask.js';
import { profileService } from '../services/profile.js';
import { authService } from '../services/auth.js';
import { appState } from '../state.js';
import { showToast } from '../ui/toast.js';

export function render() {
  const session = appState.getSession();
  const name = session ? session.name : 'María Castillo';
  const username = session ? session.username : 'maria.castillo';
  const phone = session?.phone ? maskPhone(session.phone) : '+51 987 ••• 321';
  const email = session?.email ? maskEmail(session.email) : 'ma••••@gmail.com';
  const userInitials = initials(name);

  return `
    <div class="screen profile-screen">
      <div class="profile-scroll">
        <header class="profile-hero">
          <span class="avatar big">${userInitials}</span>
          <h1>${name}</h1>
          <p>@${username}</p>
          <span class="verified-badge">
            ${renderIcon('shield', 13)} Número verificado · ${phone}
          </span>
        </header>

        <div class="stats profile-stats">
          <div><b>2</b><span>Alertas creadas</span></div>
          <div><b>5</b><span>Avistamientos</span></div>
          <div><b>3</b><span>Búsquedas</span></div>
        </div>

        <!-- Mi actividad -->
        <p class="group-title">Mi actividad</p>
        <div class="profile-group">
          <button type="button" class="profile-row" id="row-my-alerts">
            <div class="icon-box ochre">${renderIcon('clock', 19)}</div>
            <div>
              <b>Mis alertas</b>
              <span>2 publicadas · 1 en revisión</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>

          <button type="button" class="profile-row" id="row-my-searches">
            <div class="icon-box green">${renderIcon('group', 19)}</div>
            <div>
              <b>Búsquedas en las que participo</b>
              <span>1 en curso · 2 finalizadas</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>

          <button type="button" class="profile-row" id="row-my-sightings">
            <div class="icon-box coral">${renderIcon('location', 19)}</div>
            <div>
              <b>Mis avistamientos</b>
              <span>5 avisos enviados · 3 confirmados</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>
        </div>

        <!-- Alertas cerca de ti -->
        <p class="group-title">Alertas cerca de ti</p>
        <div class="profile-group">
          <div class="profile-row static">
            <div class="icon-box green">${renderIcon('location', 19)}</div>
            <div>
              <b>Radio de alertas</b>
              <span>Casos que verás en tu mapa</span>
            </div>
          </div>
          <div class="radius-pick" role="radiogroup" aria-label="Radio de alertas" id="radius-container">
            <button type="button" data-r="1">1 km</button>
            <button type="button" data-r="3">3 km</button>
            <button type="button" class="active" data-r="5">5 km</button>
            <button type="button" data-r="10">10 km</button>
          </div>

          <div class="profile-row static">
            <div class="icon-box coral">${renderIcon('bell', 19)}</div>
            <div>
              <b>Notificaciones</b>
              <span>Alertas urgentes en tiempo real</span>
            </div>
            <span role="switch" aria-checked="true" class="toggle on" id="toggle-notif"><span></span></span>
          </div>

          <div class="profile-row static">
            <div class="icon-box green">${renderIcon('location', 19)}</div>
            <div>
              <b>Usar mi ubicación</b>
              <span>Para mostrarte casos cercanos</span>
            </div>
            <span role="switch" aria-checked="true" class="toggle on" id="toggle-loc"><span></span></span>
          </div>
        </div>

        <!-- Cuenta y seguridad -->
        <p class="group-title">Cuenta y seguridad</p>
        <div class="profile-group">
          <button type="button" class="profile-row" id="row-edit-profile">
            <div class="icon-box green">${renderIcon('user', 19)}</div>
            <div>
              <b>Editar perfil</b>
              <span>Nombre, usuario y foto</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>

          <button type="button" class="profile-row" id="row-phone">
            <div class="icon-box green">${renderIcon('phone', 19)}</div>
            <div>
              <b>Teléfono</b>
              <span>${phone}</span>
            </div>
            <em class="row-badge">Verificado</em>
            ${renderIcon('chevron', 17)}
          </button>

          <button type="button" class="profile-row" id="row-email">
            <div class="icon-box ochre">${renderIcon('mail', 19)}</div>
            <div>
              <b>Correo</b>
              <span>${email}</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>

          <button type="button" class="profile-row" id="row-password">
            <div class="icon-box green">${renderIcon('lock', 19)}</div>
            <div>
              <b>Cambiar contraseña</b>
              <span>Seguridad de acceso</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>
        </div>

        <!-- Ayuda -->
        <p class="group-title">Ayuda</p>
        <div class="profile-group">
          <button type="button" class="profile-row" id="row-help">
            <div class="icon-box green">${renderIcon('help', 19)}</div>
            <div>
              <b>Centro de ayuda</b>
              <span>Preguntas frecuentes y soporte</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>

          <button type="button" class="profile-row" id="row-emergency">
            <div class="icon-box coral">${renderIcon('phone', 19)}</div>
            <div>
              <b>Emergencias</b>
              <span>Llama a la Policía (105) si hay riesgo inmediato</span>
            </div>
            ${renderIcon('chevron', 17)}
          </button>
        </div>

        <!-- Botón para restaurar datos demo -->
        <button type="button" class="reset-demo-btn" id="btn-reset-demo">
          ⟲ Restablecer datos de demostración
        </button>

        <button type="button" class="logout" id="btn-open-logout">
          ${renderIcon('logout', 18)} Cerrar sesión
        </button>

        <p class="app-version">Siempre Cerca · versión 1.0 (Avance 1)</p>
      </div>

      <!-- Scrim de confirmación de cierre de sesión (34-cerrar-sesion.png) -->
      <div class="confirm-scrim" id="logout-scrim" style="display: none;">
        <div class="confirm-sheet" id="logout-sheet">
          <div class="handle"></div>
          <h2>¿Cerrar sesión?</h2>
          <p>Podrás volver a entrar con tu usuario y contraseña cuando quieras.</p>
          <button type="button" class="button alert" id="btn-confirm-logout">Sí, cerrar sesión</button>
          <button type="button" class="button ghost" id="btn-cancel-logout">Cancelar</button>
        </div>
      </div>

      ${renderNav('profile')}
    </div>
  `;
}

export function mount(root) {
  mountNavEvents(root);

  // Navegación a sub-pantallas
  root.querySelector('#row-my-alerts')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/alertas';
  });

  root.querySelector('#row-my-searches')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/busquedas';
  });

  root.querySelector('#row-my-sightings')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/avistamientos';
  });

  root.querySelector('#row-edit-profile')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/editar';
  });

  root.querySelector('#row-phone')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/telefono';
  });

  root.querySelector('#row-email')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/correo/cambiar';
  });

  root.querySelector('#row-password')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/contrasena';
  });

  root.querySelector('#row-help')?.addEventListener('click', () => {
    window.location.hash = '#/ayuda';
  });

  root.querySelector('#row-emergency')?.addEventListener('click', () => {
    showToast('Emergencias en Perú: PNP 105, SAMU 106, Bomberos 116', 'info');
  });

  // Selector de radio de alertas
  root.querySelectorAll('#radius-container button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      root.querySelectorAll('#radius-container button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const r = parseInt(btn.dataset.r, 10);
      await profileService.saveSettings({ radiusKm: r });
      showToast(`Radio de alertas actualizado a ${r} km`, 'info');
    });
  });

  // Toggles de notificaciones y ubicación
  const notifToggle = root.querySelector('#toggle-notif');
  const locToggle = root.querySelector('#toggle-loc');

  notifToggle?.addEventListener('click', async () => {
    const isNowOn = !notifToggle.classList.contains('on');
    notifToggle.classList.toggle('on', isNowOn);
    await profileService.saveSettings({ notifications: isNowOn });
    showToast(`Notificaciones ${isNowOn ? 'activadas' : 'desactivadas'}`, 'info');
  });

  locToggle?.addEventListener('click', async () => {
    const isNowOn = !locToggle.classList.contains('on');
    locToggle.classList.toggle('on', isNowOn);
    await profileService.saveSettings({ location: isNowOn });
    showToast(`Uso de ubicación ${isNowOn ? 'activado' : 'desactivado'}`, 'info');
  });

  // Restablecer datos de demostración
  root.querySelector('#btn-reset-demo')?.addEventListener('click', async () => {
    if (confirm('¿Restablecer todos los datos de demostración al estado original?')) {
      await profileService.resetDemo();
      await appState.init();
      showToast('Datos de demostración restablecidos', 'success');
      window.location.hash = '#/inicio';
    }
  });

  // Modal de confirmación de cierre de sesión
  const scrim = root.querySelector('#logout-scrim');
  const openLogoutBtn = root.querySelector('#btn-open-logout');
  const cancelLogoutBtn = root.querySelector('#btn-cancel-logout');
  const confirmLogoutBtn = root.querySelector('#btn-confirm-logout');

  openLogoutBtn?.addEventListener('click', () => {
    scrim.style.display = 'flex';
  });

  cancelLogoutBtn?.addEventListener('click', () => {
    scrim.style.display = 'none';
  });

  scrim?.addEventListener('click', (e) => {
    if (e.target === scrim) scrim.style.display = 'none';
  });

  confirmLogoutBtn?.addEventListener('click', async () => {
    scrim.style.display = 'none';
    await authService.logout();
    appState.setSession(null);
    showToast('Sesión cerrada correctamente', 'info');
    window.location.hash = '#/';
  });
}
