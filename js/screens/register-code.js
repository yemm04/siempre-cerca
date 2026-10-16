/**
 * register-code.js - Registro Paso 3: Código de verificación (04-registro-3-codigo.png)
 * 6 casillas OTP, temporizador de reenvío y creación final de cuenta con hash de contraseña.
 */
import { renderIcon } from '../ui/icons.js';
import { maskPhone } from '../utils/mask.js';
import { authService } from '../services/auth.js';
import { appState } from '../state.js';
import { showToast } from '../ui/toast.js';

export function render() {
  const draft = appState.getRegistrationDraft();
  const masked = maskPhone(draft.phone || '987654321');

  return `
    <div class="screen padded auth">
      <button type="button" class="back" id="btn-back">
        ${renderIcon('arrow')} Volver
      </button>

      <div class="step-dots three" aria-label="Paso 3 de 3">
        <span class="done"></span>
        <span class="done"></span>
        <span class="done"></span>
      </div>

      <section class="title-block">
        <p class="eyebrow">Paso 3 de 3 · Código</p>
        <h1>Ingresa el código</h1>
        <p>Enviamos un código de 6 dígitos al <b>${masked}</b></p>
      </section>

      <div class="otp-row" id="otp-container">
        <input type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" aria-label="Dígito 1" />
        <input type="text" maxlength="1" inputmode="numeric" aria-label="Dígito 2" />
        <input type="text" maxlength="1" inputmode="numeric" aria-label="Dígito 3" />
        <input type="text" maxlength="1" inputmode="numeric" aria-label="Dígito 4" />
        <input type="text" maxlength="1" inputmode="numeric" aria-label="Dígito 5" />
        <input type="text" maxlength="1" inputmode="numeric" aria-label="Dígito 6" />
      </div>

      <p class="timer" id="timer-text">
        ${renderIcon('clock', 17)}
        <span>Puedes solicitar otro código en <b>00:38</b></span>
      </p>

      <div id="otp-error" class="form-error" style="display: none; margin-bottom: 16px;"></div>

      <button type="button" class="button primary" id="btn-verify" disabled>
        Verificar y crear cuenta
      </button>
      <button type="button" class="button ghost" id="btn-resend" disabled>
        ¿No llegó? Reenviar código
      </button>

      <p class="demo-hint">Prototipo: escribe cualquier código de 6 dígitos.</p>
    </div>
  `;
}

export function mount(root) {
  const inputs = Array.from(root.querySelectorAll('#otp-container input'));
  const verifyBtn = root.querySelector('#btn-verify');
  const resendBtn = root.querySelector('#btn-resend');
  const timerText = root.querySelector('#timer-text span');
  const errorEl = root.querySelector('#otp-error');

  let seconds = 38;
  let timerInterval = null;

  const startTimer = () => {
    seconds = 38;
    resendBtn.disabled = true;
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        timerText.innerHTML = `Puedes solicitar otro código en <b>00:${String(seconds).padStart(2, '0')}</b>`;
      } else {
        clearInterval(timerInterval);
        timerText.textContent = 'Ya puedes solicitar otro código';
        resendBtn.disabled = false;
      }
    }, 1000);
  };

  startTimer();

  // Enfocar primera casilla
  inputs[0]?.focus();

  const getCode = () => inputs.map((i) => i.value).join('');

  inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      if (val.length > 1) {
        // Manejo de pegado rápido
        const chars = val.slice(0, 6).split('');
        chars.forEach((c, i) => {
          if (inputs[i]) inputs[i].value = c;
        });
        inputs[Math.min(chars.length, 5)].focus();
      } else {
        input.value = val;
        if (val && idx < 5) {
          inputs[idx + 1].focus();
        }
      }
      verifyBtn.disabled = getCode().length !== 6;
      if (errorEl) errorEl.style.display = 'none';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });

  root.querySelector('#btn-back')?.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    window.location.hash = '#/registro/telefono';
  });

  resendBtn?.addEventListener('click', () => {
    inputs.forEach((i) => (i.value = ''));
    verifyBtn.disabled = true;
    inputs[0]?.focus();
    startTimer();
    showToast('Código reenviado por SMS', 'info');
  });

  verifyBtn?.addEventListener('click', async () => {
    const draft = appState.getRegistrationDraft();
    try {
      verifyBtn.disabled = true;
      const user = await authService.register(draft);
      appState.setSession(user);
      appState.clearRegistrationDraft();
      if (timerInterval) clearInterval(timerInterval);
      showToast('¡Cuenta creada exitosamente!', 'success');
      window.location.hash = '#/permisos';
    } catch (err) {
      verifyBtn.disabled = false;
      if (errorEl) {
        errorEl.textContent = err.message || 'Error al verificar el código';
        errorEl.style.display = 'block';
      }
    }
  });
}
