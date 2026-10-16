/**
 * forgot.js - Recuperar contraseña (36-recuperar-1.png y 37-recuperar-2-canal.png)
 * Flujo completo en pasos: identificación -> canal -> código -> nueva clave -> confirmación.
 */
import { renderIcon } from '../ui/icons.js';
import { maskEmail, maskPhone } from '../utils/mask.js';
import { passwordRules } from '../utils/validators.js';
import { authService } from '../services/auth.js';
import { showToast } from '../ui/toast.js';

export function render() {
  return `
    <div class="screen padded auth" id="forgot-screen-container">
      <!-- Contenido dinámico según el paso -->
    </div>
  `;
}

export function mount(root) {
  const container = root.querySelector('#forgot-screen-container');
  let step = 1;
  let identifier = '';
  let userInfo = null;
  let channel = 'email';
  let codeDigits = Array(6).fill('');
  let newPassword = '';
  let confirmPassword = '';
  let showPw = false;

  const renderStep = () => {
    if (step === 5) {
      container.className = 'screen padded auth done-screen';
      container.innerHTML = `
        <div class="done-art">${renderIcon('check', 38)}</div>
        <p class="eyebrow">Listo</p>
        <h1>Contraseña <em>actualizada</em></h1>
        <p class="subtitle">
          Por seguridad también te avisamos por ${channel === 'email' ? 'correo' : 'SMS'} que se cambió la contraseña.
          Si no fuiste tú, contáctanos de inmediato.
        </p>
        <button type="button" class="button primary" id="btn-done-login">Iniciar sesión</button>
      `;
      container.querySelector('#btn-done-login')?.addEventListener('click', () => {
        window.location.hash = '#/login';
      });
      return;
    }

    container.className = 'screen padded auth';
    const emailMasked = userInfo ? maskEmail(userInfo.email) : 'ma••••@gmail.com';
    const phoneMasked = userInfo ? maskPhone(userInfo.phone) : '+51 987 ••• 321';

    let html = `
      <button type="button" class="back" id="btn-back">
        ${renderIcon('arrow')} Volver
      </button>

      <div class="step-dots" aria-label="Paso ${step} de 4">
        <span class="${step >= 1 ? 'done' : ''}"></span>
        <span class="${step >= 2 ? 'done' : ''}"></span>
        <span class="${step >= 3 ? 'done' : ''}"></span>
        <span class="${step >= 4 ? 'done' : ''}"></span>
      </div>
    `;

    if (step === 1) {
      html += `
        <section class="title-block">
          <p class="eyebrow">Recuperar acceso</p>
          <h1>¿Olvidaste tu <em>contraseña</em>?</h1>
          <p>No pasa nada. Dinos tu usuario o el correo con el que te registraste.</p>
        </section>

        <div class="form-card form-grid">
          <label>Usuario o correo electrónico
            <input type="text" id="forgot-id" value="${identifier}" placeholder="@usuario o tu@correo.com" autocomplete="username" autocapitalize="none" />
          </label>
          <p class="form-error" id="forgot-error" role="alert" style="display: none;"></p>
          <button type="button" class="button primary" id="btn-step1" ${!identifier ? 'disabled' : ''}>Continuar</button>
        </div>
      `;
    } else if (step === 2) {
      html += `
        <section class="title-block">
          <p class="eyebrow">Verifica que eres tú</p>
          <h1>¿Dónde enviamos el <em>código</em>?</h1>
          <p>Elige un medio. Ambos están vinculados a tu cuenta.</p>
        </section>

        <div class="channel-list" role="radiogroup">
          <button type="button" role="radio" aria-checked="${channel === 'email'}" class="channel-card ${channel === 'email' ? 'selected' : ''}" data-channel="email">
            <div class="icon-box green">${renderIcon('mail')}</div>
            <div><b>Correo electrónico</b><span>${emailMasked}</span></div>
            <i>${renderIcon('check', 13)}</i>
          </button>
          <button type="button" role="radio" aria-checked="${channel === 'sms'}" class="channel-card ${channel === 'sms' ? 'selected' : ''}" data-channel="sms">
            <div class="icon-box coral">${renderIcon('phone')}</div>
            <div><b>SMS</b><span>${phoneMasked}</span></div>
            <i>${renderIcon('check', 13)}</i>
          </button>
        </div>

        <div class="info-note flat">
          ${renderIcon('shield')}
          <span><b>¿Cambiaste de número?</b>Usa el correo: es el medio que no depende de tu línea telefónica.</span>
        </div>

        <button type="button" class="button primary" id="btn-send-code">Enviar código</button>
        <p class="switch-link">¿Ya no tienes acceso a ninguno? <button type="button" id="btn-go-help">Contacta a soporte</button></p>
      `;
    } else if (step === 3) {
      const target = channel === 'email' ? emailMasked : phoneMasked;
      html += `
        <section class="title-block">
          <p class="eyebrow">Revisa tu ${channel === 'email' ? 'correo' : 'mensaje'}</p>
          <h1>Ingresa el código</h1>
          <p>Enviamos un código de 6 dígitos a <b>${target}</b></p>
        </section>

        <div class="otp-row" id="otp-container">
          ${[0, 1, 2, 3, 4, 5]
            .map(
              (i) =>
                `<input type="text" maxlength="1" inputmode="numeric" value="${codeDigits[i] || ''}" aria-label="Dígito ${i + 1}" />`
            )
            .join('')}
        </div>

        <p class="timer">${renderIcon('clock', 17)} <span>Código enviado</span></p>

        <button type="button" class="button primary" id="btn-verify-otp" ${codeDigits.every(Boolean) ? '' : 'disabled'}>Verificar</button>
        <button type="button" class="button ghost" id="btn-resend-otp">Reenviar código</button>
        <p class="demo-hint">Prototipo: escribe cualquier código de 6 dígitos.</p>
      `;
    } else if (step === 4) {
      html += `
        <section class="title-block">
          <p class="eyebrow">Último paso</p>
          <h1>Crea una nueva <em>contraseña</em></h1>
          <p>Elige una que no hayas usado antes.</p>
        </section>

        <div class="form-card form-grid">
          <label>Nueva contraseña
            <div class="input-icon">
              <input type="${showPw ? 'text' : 'password'}" id="new-pw" value="${newPassword}" placeholder="Nueva contraseña" autocomplete="new-password" />
              <button type="button" class="eye" id="toggle-pw">${renderIcon(showPw ? 'eyeOff' : 'eye', 18)}</button>
            </div>
          </label>

          <ul class="rules" id="new-pw-rules">
            <li data-r="0"><i>${renderIcon('check', 10)}</i> Mínimo 8 caracteres</li>
            <li data-r="1"><i>${renderIcon('check', 10)}</i> Al menos una letra</li>
            <li data-r="2"><i>${renderIcon('check', 10)}</i> Al menos un número</li>
          </ul>

          <label>Confirmar contraseña
            <input type="${showPw ? 'text' : 'password'}" id="confirm-pw" value="${confirmPassword}" placeholder="Repite tu contraseña" autocomplete="new-password" />
            <small class="hint bad" id="mismatch-hint" style="display: none;">Las contraseñas no coinciden</small>
          </label>

          <p class="form-error" id="pw-error" style="display: none;"></p>
          <button type="button" class="button primary" id="btn-save-pw" disabled>Guardar contraseña</button>
        </div>
      `;
    }

    container.innerHTML = html;
    bindStepEvents();
  };

  const bindStepEvents = () => {
    container.querySelector('#btn-back')?.addEventListener('click', () => {
      if (step > 1) {
        step--;
        renderStep();
      } else {
        window.location.hash = '#/login';
      }
    });

    if (step === 1) {
      const idInput = container.querySelector('#forgot-id');
      const step1Btn = container.querySelector('#btn-step1');
      const errEl = container.querySelector('#forgot-error');

      idInput?.addEventListener('input', () => {
        identifier = idInput.value.trim();
        step1Btn.disabled = !identifier;
        if (errEl) errEl.style.display = 'none';
      });

      step1Btn?.addEventListener('click', async () => {
        try {
          userInfo = await authService.requestPasswordReset(identifier);
          step = 2;
          renderStep();
        } catch (err) {
          if (errEl) {
            errEl.textContent = err.message || 'No encontramos una cuenta con esos datos.';
            errEl.style.display = 'block';
          }
        }
      });
    } else if (step === 2) {
      container.querySelectorAll('[data-channel]').forEach((btn) => {
        btn.addEventListener('click', () => {
          channel = btn.dataset.channel;
          renderStep();
        });
      });

      container.querySelector('#btn-send-code')?.addEventListener('click', () => {
        step = 3;
        renderStep();
        showToast(`Código enviado por ${channel === 'email' ? 'correo' : 'SMS'}`, 'info');
      });

      container.querySelector('#btn-go-help')?.addEventListener('click', () => {
        window.location.hash = '#/ayuda';
      });
    } else if (step === 3) {
      const inputs = Array.from(container.querySelectorAll('#otp-container input'));
      const verifyBtn = container.querySelector('#btn-verify-otp');

      inputs.forEach((inp, idx) => {
        inp.addEventListener('input', (e) => {
          const val = e.target.value.replace(/\D/g, '');
          codeDigits[idx] = val.slice(0, 1);
          inp.value = codeDigits[idx];
          if (val && idx < 5) inputs[idx + 1].focus();
          verifyBtn.disabled = !codeDigits.every(Boolean);
        });
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
        });
      });

      verifyBtn?.addEventListener('click', () => {
        step = 4;
        renderStep();
      });

      container.querySelector('#btn-resend-otp')?.addEventListener('click', () => {
        codeDigits = Array(6).fill('');
        renderStep();
        showToast('Código reenviado', 'info');
      });
    } else if (step === 4) {
      const newInp = container.querySelector('#new-pw');
      const confInp = container.querySelector('#confirm-pw');
      const toggleBtn = container.querySelector('#toggle-pw');
      const saveBtn = container.querySelector('#btn-save-pw');
      const mismatch = container.querySelector('#mismatch-hint');
      const rulesEls = container.querySelectorAll('#new-pw-rules li');

      toggleBtn?.addEventListener('click', () => {
        showPw = !showPw;
        newInp.type = showPw ? 'text' : 'password';
        confInp.type = showPw ? 'text' : 'password';
        toggleBtn.innerHTML = renderIcon(showPw ? 'eyeOff' : 'eye', 18);
      });

      const validatePw = () => {
        newPassword = newInp.value;
        confirmPassword = confInp.value;
        const rules = passwordRules(newPassword);
        rules.forEach((r, i) => {
          if (r.ok) rulesEls[i]?.classList.add('ok');
          else rulesEls[i]?.classList.remove('ok');
        });
        const allOk = rules.every((r) => r.ok);
        const match = confirmPassword.length > 0 && confirmPassword === newPassword;
        mismatch.style.display = confirmPassword && !match ? 'block' : 'none';
        saveBtn.disabled = !allOk || !match;
      };

      newInp?.addEventListener('input', validatePw);
      confInp?.addEventListener('input', validatePw);

      saveBtn?.addEventListener('click', async () => {
        try {
          await authService.resetPassword(identifier, newPassword);
          step = 5;
          renderStep();
        } catch (err) {
          const errEl = container.querySelector('#pw-error');
          if (errEl) {
            errEl.textContent = err.message;
            errEl.style.display = 'block';
          }
        }
      });
    }
  };

  renderStep();
}
