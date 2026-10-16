/**
 * login.js - Pantalla de inicio de sesión (35-login.png)
 * Acceso con correo o usuario y contraseña, con validación de credenciales.
 */
import { renderIcon } from '../ui/icons.js';
import { authService } from '../services/auth.js';
import { appState } from '../state.js';
import { CONFIG } from '../config.js';
import { showToast } from '../ui/toast.js';

export function render() {
  return `
    <div class="screen padded auth">
      <button type="button" class="back" id="btn-back">
        ${renderIcon('arrow')} Volver
      </button>

      <div class="mini-brand">
        <div class="logo compact">
          <div class="logo-mark">
            <span class="leaf one"></span>
            <span class="leaf two"></span>
            <span class="leaf three"></span>
          </div>
        </div>
        <span>Siempre Cerca</span>
      </div>

      <section class="title-block">
        <p class="eyebrow">Qué bueno verte de nuevo</p>
        <h1>Inicia <em>sesión</em></h1>
        <p>Ingresa tu usuario o correo y tu contraseña para volver con tu comunidad.</p>
      </section>

      <form class="form-card form-grid" id="login-form">
        <label>Usuario o correo
          <div class="input-icon">
            <span class="at">@</span>
            <input
              type="text"
              id="login-id"
              placeholder="tu.usuario o correo"
              autocomplete="username"
              autocapitalize="none"
              required
            />
          </div>
        </label>

        <label>Contraseña
          <div class="input-icon">
            <input
              type="password"
              id="login-pw"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              required
            />
            <button type="button" class="eye" id="toggle-pw" aria-label="Mostrar contraseña">
              ${renderIcon('eye', 18)}
            </button>
          </div>
        </label>

        <p class="form-error" id="login-error" role="alert" style="display: none;">
          Usuario o contraseña incorrectos. Inténtalo de nuevo.
        </p>

        <button type="button" class="forgot" id="btn-forgot">¿Olvidaste tu contraseña?</button>

        <button type="submit" class="button primary" id="btn-submit" disabled>
          Iniciar sesión
        </button>
      </form>

      <p class="switch-link">
        ¿Aún no tienes cuenta? <button type="button" id="link-register">Crear cuenta</button>
      </p>
    </div>
  `;
}

export function mount(root) {
  const form = root.querySelector('#login-form');
  const idInput = root.querySelector('#login-id');
  const pwInput = root.querySelector('#login-pw');
  const toggleBtn = root.querySelector('#toggle-pw');
  const submitBtn = root.querySelector('#btn-submit');
  const errorEl = root.querySelector('#login-error');

  let showPassword = false;

  toggleBtn?.addEventListener('click', () => {
    showPassword = !showPassword;
    pwInput.type = showPassword ? 'text' : 'password';
    toggleBtn.innerHTML = renderIcon(showPassword ? 'eyeOff' : 'eye', 18);
  });

  const checkFilled = () => {
    submitBtn.disabled = !idInput.value.trim() || !pwInput.value;
    if (errorEl) errorEl.style.display = 'none';
  };

  idInput?.addEventListener('input', checkFilled);
  pwInput?.addEventListener('input', checkFilled);

  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  root.querySelector('#btn-forgot')?.addEventListener('click', () => {
    window.location.hash = '#/recuperar';
  });

  root.querySelector('#link-register')?.addEventListener('click', () => {
    window.location.hash = '#/registro';
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = idInput.value.trim();
    const password = pwInput.value;

    try {
      submitBtn.disabled = true;
      const session = await authService.login(identifier, password);
      appState.setSession(session);
      showToast('¡Bienvenido de vuelta!', 'success');
      window.location.hash = CONFIG.STAFF_ROLES.includes(session.role) ? '#/admin' : '#/inicio';
    } catch (err) {
      submitBtn.disabled = false;
      if (errorEl) {
        errorEl.textContent = err.message || 'Usuario o contraseña incorrectos.';
        errorEl.style.display = 'block';
      }
    }
  });
}
