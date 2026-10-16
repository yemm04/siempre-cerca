/**
 * permissions.js - Pantalla de permisos de ubicación y alertas (05-permisos.png)
 * Solicita geolocalización y notificaciones con conmutadores interactivos.
 */
import { renderIcon } from '../ui/icons.js';
import { getCurrentUserPosition } from '../utils/geo.js';
import { appState } from '../state.js';

export function render() {
  return `
    <div class="screen permission-bg">
      <div class="permission-card">
        <div class="permission-art">
          <span class="radar r1"></span>
          <span class="radar r2"></span>
          <div class="pin-heart">
            ${renderIcon('location', 34)}
          </div>
        </div>

        <p class="eyebrow">Mantengámonos cerca</p>
        <h1>Ayúdanos a ayudarte</h1>
        <p class="subtitle">Activa estos permisos para recibir alertas importantes de tu zona.</p>

        <div class="permission-item">
          <div class="icon-box green">${renderIcon('location')}</div>
          <div>
            <b>Ubicación</b>
            <span>Te mostraremos casos y alertas cerca de ti.</span>
          </div>
          <div class="toggle on" id="toggle-loc" role="switch" aria-checked="true" tabindex="0">
            <span></span>
          </div>
        </div>

        <div class="permission-item">
          <div class="icon-box coral">${renderIcon('bell')}</div>
          <div>
            <b>Notificaciones</b>
            <span>Recibe novedades urgentes en tiempo real.</span>
          </div>
          <div class="toggle on" id="toggle-notif" role="switch" aria-checked="true" tabindex="0">
            <span></span>
          </div>
        </div>

        <button type="button" class="button primary" id="btn-allow">Permitir y continuar</button>
        <button type="button" class="button ghost" id="btn-skip">Ahora no</button>
        <small>Puedes cambiar esta configuración cuando quieras.</small>
      </div>
    </div>
  `;
}

export function mount(root) {
  const toggleLoc = root.querySelector('#toggle-loc');
  const toggleNotif = root.querySelector('#toggle-notif');
  let locEnabled = true;
  let notifEnabled = true;

  toggleLoc?.addEventListener('click', () => {
    locEnabled = !locEnabled;
    toggleLoc.classList.toggle('on', locEnabled);
    toggleLoc.setAttribute('aria-checked', String(locEnabled));
  });

  toggleNotif?.addEventListener('click', () => {
    notifEnabled = !notifEnabled;
    toggleNotif.classList.toggle('on', notifEnabled);
    toggleNotif.setAttribute('aria-checked', String(notifEnabled));
  });

  const finish = async () => {
    if (locEnabled) {
      const pos = await getCurrentUserPosition();
      appState.setLocation(pos);
    }
    window.location.hash = '#/inicio';
  };

  root.querySelector('#btn-allow')?.addEventListener('click', finish);
  root.querySelector('#btn-skip')?.addEventListener('click', () => {
    window.location.hash = '#/inicio';
  });
}
