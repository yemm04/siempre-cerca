/**
 * phone-settings.js - Ajustes de teléfono de seguridad (30-telefono.png)
 * Muestra el número verificado, razones de seguridad y acceso para cambiarlo.
 */
import { renderIcon } from '../ui/icons.js';
import { maskPhone, maskEmail } from '../utils/mask.js';
import { appState } from '../state.js';

export function render() {
  const session = appState.getSession();
  const phone = session?.phone ? maskPhone(session.phone) : '+51 987 ••• 321';
  const email = session?.email ? maskEmail(session.email) : 'ma••••@gmail.com';

  return `
    <div class="screen sub-screen">
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">
          ${renderIcon('arrow')} Perfil
        </button>
        <span>Teléfono</span>
        <span class="header-spacer"></span>
      </header>

      <div class="sub-scroll">
        <div class="phone-card">
          <div class="icon-box green">${renderIcon('phone')}</div>
          <div>
            <small>Número vinculado</small>
            <b>${phone}</b>
          </div>
          <em class="row-badge green">Verificado</em>
        </div>

        <p class="group-title">¿Para qué usamos tu número?</p>
        <ul class="why-list card">
          <li>
            ${renderIcon('user', 17)}
            <span><b>Una cuenta por número</b>Es lo que identifica a cada persona de la comunidad.</span>
          </li>
          <li>
            ${renderIcon('shield', 17)}
            <span><b>Seguridad de la comunidad</b>Si una cuenta publica avisos falsos, hace spam o usa mal la app, bloqueamos el número y no puede volver a registrarse.</span>
          </li>
          <li>
            ${renderIcon('lock', 17)}
            <span><b>Es privado</b>Nunca se muestra a otras personas. Solo lo ve el equipo de moderación si es necesario.</span>
          </li>
        </ul>

        <div class="phone-card slim">
          <div class="icon-box ochre">${renderIcon('mail')}</div>
          <div>
            <small>Correo de seguridad</small>
            <b>${email}</b>
          </div>
        </div>

        <button type="button" class="button outline" id="btn-change-number">
          Cambiar número
        </button>

        <p class="sub-note">
          Para proteger tu cuenta te pediremos tu contraseña y verificaremos el nuevo número por SMS. Solo puedes cambiarlo una vez cada 30 días.
        </p>
      </div>
    </div>
  `;
}

export function mount(root) {
  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/perfil';
  });

  root.querySelector('#btn-change-number')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/telefono/cambiar';
  });
}
