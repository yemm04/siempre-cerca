/**
 * register.js - Registro Paso 1: Tu cuenta (02-registro-1-cuenta.png)
 * Validación en tiempo real de nombre, usuario, correo, contraseña y confirmación.
 */
import { renderIcon } from '../ui/icons.js';
import { isEmail, isUsername, passwordRules } from '../utils/validators.js';
import { appState } from '../state.js';

export function render() {
  const draft = appState.getRegistrationDraft();

  return `
    <div class="screen padded auth register">
      <button type="button" class="back" id="btn-back">
        ${renderIcon('arrow')} Volver
      </button>

      <div class="step-dots three" aria-label="Paso 1 de 3">
        <span class="done"></span>
        <span></span>
        <span></span>
      </div>

      <section class="title-block">
        <p class="eyebrow">Paso 1 de 3 · Tu cuenta</p>
        <h1>Crea tu <em>usuario</em></h1>
        <p>Elige cómo quieres que te vea la comunidad.</p>
      </section>

      <div class="form-card form-grid">
        <label>Nombre completo
          <input type="text" id="reg-name" value="${draft.name || ''}" placeholder="María Castillo" autocomplete="name" />
        </label>

        <label>Nombre de usuario
          <div class="input-icon">
            <span class="at">@</span>
            <input type="text" id="reg-username" value="${draft.username || ''}" placeholder="maria.castillo" autocomplete="username" autocapitalize="none" />
          </div>
          <small class="hint" id="username-hint">4 a 20 caracteres: letras minúsculas, números, punto o guion bajo</small>
        </label>

        <label>Correo electrónico
          <input type="email" id="reg-email" value="${draft.email || ''}" placeholder="tu@correo.com" autocomplete="email" autocapitalize="none" />
          <small class="hint" id="email-hint">Lo usaremos para recuperar tu cuenta y avisarte de cambios de seguridad.</small>
        </label>

        <label>Contraseña
          <div class="input-icon">
            <input type="password" id="reg-password" value="${draft.password || ''}" placeholder="Crea una contraseña" autocomplete="new-password" />
            <button type="button" class="eye" id="toggle-pw" aria-label="Mostrar contraseña">
              ${renderIcon('eye', 18)}
            </button>
          </div>
        </label>

        <ul class="rules" id="password-rules-list">
          <li data-rule="0"><i>${renderIcon('check', 10)}</i> Mínimo 8 caracteres</li>
          <li data-rule="1"><i>${renderIcon('check', 10)}</i> Al menos una letra</li>
          <li data-rule="2"><i>${renderIcon('check', 10)}</i> Al menos un número</li>
        </ul>

        <label>Confirmar contraseña
          <input type="password" id="reg-confirm" value="${draft.password || ''}" placeholder="Repite tu contraseña" autocomplete="new-password" />
          <small class="hint bad" id="confirm-hint" style="display: none;">Las contraseñas no coinciden</small>
        </label>

        <label class="checkbox" id="terms-label">
          <input type="checkbox" id="reg-terms" />
          <span>${renderIcon('check', 14)}</span>
          Acepto los Términos y la Política de privacidad.
        </label>

        <button type="button" class="button primary" id="btn-continue" disabled>
          Continuar <span>→</span>
        </button>
      </div>

      <p class="switch-link">¿Ya tienes una cuenta? <button type="button" id="link-login">Inicia sesión</button></p>
    </div>
  `;
}

export function mount(root) {
  const nameInput = root.querySelector('#reg-name');
  const userInput = root.querySelector('#reg-username');
  const emailInput = root.querySelector('#reg-email');
  const pwInput = root.querySelector('#reg-password');
  const confirmInput = root.querySelector('#reg-confirm');
  const termsInput = root.querySelector('#reg-terms');
  const termsLabel = root.querySelector('#terms-label');
  const toggleBtn = root.querySelector('#toggle-pw');
  const continueBtn = root.querySelector('#btn-continue');

  const userHint = root.querySelector('#username-hint');
  const emailHint = root.querySelector('#email-hint');
  const confirmHint = root.querySelector('#confirm-hint');
  const rulesList = root.querySelectorAll('#password-rules-list li');

  let showPassword = false;

  toggleBtn?.addEventListener('click', () => {
    showPassword = !showPassword;
    pwInput.type = showPassword ? 'text' : 'password';
    confirmInput.type = showPassword ? 'text' : 'password';
    toggleBtn.innerHTML = renderIcon(showPassword ? 'eyeOff' : 'eye', 18);
  });

  const validate = () => {
    const nameVal = nameInput.value.trim();
    const userVal = userInput.value.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    userInput.value = userVal;
    const emailVal = emailInput.value.trim();
    const pwVal = pwInput.value;
    const confirmVal = confirmInput.value;
    const termsVal = termsInput.checked;

    // Usuario
    const userOk = isUsername(userVal);
    if (!userVal) {
      userHint.className = 'hint';
      userHint.textContent = '4 a 20 caracteres: letras minúsculas, números, punto o guion bajo';
    } else if (userOk) {
      userHint.className = 'hint';
      userHint.textContent = '✓ Nombre de usuario disponible';
    } else {
      userHint.className = 'hint bad';
      userHint.textContent = '4 a 20 caracteres: letras minúsculas, números, punto o guion bajo';
    }

    // Correo
    const emailOk = isEmail(emailVal);
    if (!emailVal) {
      emailHint.className = 'hint';
      emailHint.textContent = 'Lo usaremos para recuperar tu cuenta y avisarte de cambios de seguridad.';
    } else if (emailOk) {
      emailHint.className = 'hint';
      emailHint.textContent = '✓ Correo válido';
    } else {
      emailHint.className = 'hint bad';
      emailHint.textContent = 'Escribe un correo válido';
    }

    // Reglas de contraseña
    const rules = passwordRules(pwVal);
    rules.forEach((r, idx) => {
      if (r.ok) {
        rulesList[idx]?.classList.add('ok');
      } else {
        rulesList[idx]?.classList.remove('ok');
      }
    });
    const pwOk = rules.every((r) => r.ok);

    // Confirmación
    const match = confirmVal.length > 0 && confirmVal === pwVal;
    if (confirmVal && !match) {
      confirmHint.style.display = 'block';
    } else {
      confirmHint.style.display = 'none';
    }

    // Checkbox términos
    if (termsVal) {
      termsLabel.classList.add('on');
    } else {
      termsLabel.classList.remove('on');
    }

    const isValid = nameVal.length >= 2 && userOk && emailOk && pwOk && match && termsVal;
    continueBtn.disabled = !isValid;
  };

  [nameInput, userInput, emailInput, pwInput, confirmInput].forEach((el) => {
    el?.addEventListener('input', validate);
  });
  termsInput?.addEventListener('change', validate);

  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  root.querySelector('#link-login')?.addEventListener('click', () => {
    window.location.hash = '#/login';
  });

  continueBtn?.addEventListener('click', () => {
    appState.setRegistrationDraft({
      name: nameInput.value.trim(),
      username: userInput.value.trim().toLowerCase(),
      email: emailInput.value.trim().toLowerCase(),
      password: pwInput.value,
    });
    window.location.hash = '#/registro/telefono';
  });

  // Ejecutar validación inicial
  validate();
}
