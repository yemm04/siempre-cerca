/**
 * contact-flow.js - Flujo de 3 pasos para cambiar correo o teléfono.
 * Paso 1: contraseña actual · Paso 2: dato nuevo · Paso 3: código · Paso 4: listo.
 * Lo usan screens/change-email.js y screens/change-phone.js.
 * TODO(avance-2): el código lo enviará el servidor (correo o SMS real) y lo validará allí.
 */
import { renderIcon } from './icons.js';
import { renderOtpRow, mountOtp, startResendTimer } from './otp.js';
import { showToast } from './toast.js';
import { authService } from '../services/auth.js';
import { appState } from '../state.js';
import { isEmail, isPhonePeru, isOtpCode } from '../utils/validators.js';
import { maskEmail, maskPhone, formatPhone } from '../utils/mask.js';

const KINDS = {
  email: {
    title: 'Cambiar correo',
    header: 'Correo electrónico',
    noun: 'correo',
    back: '#/perfil/editar',
    done: 'Volver a editar perfil',
    step2Title: '¿Cuál es tu nuevo correo?',
    step2Text: 'Enviaremos un código a ese correo para verificarlo.',
    current: (s) => s.email,
    mask: maskEmail,
    notice: (s) => `SMS al ${maskPhone(s.phone)}`,
    apply: (pw, v) => authService.changeEmail(pw, v),
  },
  phone: {
    title: 'Cambiar número',
    header: 'Teléfono',
    noun: 'número',
    back: '#/perfil/telefono',
    done: 'Volver a Teléfono',
    step2Title: '¿Cuál es tu nuevo número?',
    step2Text: 'Te enviaremos un SMS con un código para verificarlo. Tu número actual dejará de estar vinculado.',
    current: (s) => s.phone,
    mask: maskPhone,
    notice: (s) => `correo a ${maskEmail(s.email)}`,
    apply: (pw, v) => authService.changePhone(pw, v),
  },
};

const dots = (n) => `
  <div class="step-dots three" aria-label="Paso ${n} de 3">
    ${[1, 2, 3].map((i) => `<span class="${i <= n ? 'done' : ''}"></span>`).join('')}
  </div>`;

/** Crea { render, mount } para el tipo 'email' o 'phone' */
export function createContactFlow(kind) {
  const cfg = KINDS[kind];

  function render() {
    return `
      <div class="screen sub-screen">
        <header class="simple-header">
          <button type="button" class="back" id="btn-back">${renderIcon('arrow')} Atrás</button>
          <span>${cfg.title}</span>
          <span class="header-spacer"></span>
        </header>
        <div class="sub-scroll" id="flow-body"></div>
      </div>`;
  }

  function mount(root) {
    const body = root.querySelector('#flow-body');
    const session = appState.getSession();
    let step = 1;
    let password = '';
    let value = '';
    let stopTimer = null;

    const goBack = () => {
      if (step === 1 || step === 4) window.location.hash = cfg.back;
      else { step -= 1; draw(); }
    };
    root.querySelector('#btn-back').addEventListener('click', goBack);

    function draw() {
      if (step === 1) drawPassword();
      else if (step === 2) drawNewValue();
      else if (step === 3) drawCode();
      else drawDone();
    }

    function drawPassword() {
      body.innerHTML = `
        ${dots(1)}
        <p class="eyebrow">Paso 1 de 3 · Seguridad</p>
        <h2 class="stage-title">Confirma que eres tú</h2>
        <p class="sub-intro">Ingresa la contraseña de tu cuenta para cambiar tu ${cfg.noun}.</p>
        <div class="form-card form-grid">
          <label>Contraseña actual
            <div class="input-icon">
              <input type="password" id="flow-pw" placeholder="Tu contraseña" autocomplete="current-password" />
              <button type="button" class="eye" id="flow-eye" aria-label="Mostrar contraseña">${renderIcon('eye', 18)}</button>
            </div>
          </label>
          <p class="form-error" id="flow-error" role="alert" style="display:none">La contraseña no es correcta.</p>
          <button type="button" class="button primary" id="flow-next" disabled>Continuar</button>
        </div>`;
      const pw = body.querySelector('#flow-pw');
      const next = body.querySelector('#flow-next');
      const err = body.querySelector('#flow-error');
      pw.value = password;
      next.disabled = !pw.value;
      pw.addEventListener('input', () => { next.disabled = !pw.value; err.style.display = 'none'; });
      body.querySelector('#flow-eye').addEventListener('click', (e) => {
        const show = pw.type === 'password';
        pw.type = show ? 'text' : 'password';
        e.currentTarget.innerHTML = renderIcon(show ? 'eyeOff' : 'eye', 18);
      });
      next.addEventListener('click', async () => {
        next.disabled = true;
        if (await authService.checkPassword(pw.value)) {
          password = pw.value; step = 2; draw();
        } else {
          err.style.display = 'block'; next.disabled = false;
        }
      });
      pw.focus();
    }

    function drawNewValue() {
      const field = kind === 'email'
        ? `<label>Nuevo correo electrónico
             <input type="email" id="flow-value" placeholder="tu@correo.com" autocapitalize="none" autocomplete="email" />
           </label>`
        : `<label for="flow-value">Nuevo número de teléfono</label>
           <div class="phone-row" style="margin:0">
             <button class="country" type="button" tabindex="-1">🇵🇪 <span>+51</span> ⌄</button>
             <input id="flow-value" placeholder="987 654 321" inputmode="tel" autocomplete="tel-national" />
           </div>`;
      body.innerHTML = `
        ${dots(2)}
        <p class="eyebrow">Paso 2 de 3 · ${kind === 'email' ? 'Nuevo correo' : 'Nuevo número'}</p>
        <h2 class="stage-title">${cfg.step2Title}</h2>
        <p class="sub-intro">${cfg.step2Text}</p>
        <div class="form-card form-grid">
          ${field}
          <small class="hint bad" id="flow-hint" style="display:none"></small>
          <button type="button" class="button primary" id="flow-send" disabled>Enviar código</button>
        </div>`;
      const input = body.querySelector('#flow-value');
      const hint = body.querySelector('#flow-hint');
      const send = body.querySelector('#flow-send');
      input.value = kind === 'phone' ? formatPhone(value) : value;

      const check = () => {
        if (kind === 'phone') {
          value = input.value.replace(/\D/g, '').slice(0, 9);
          input.value = formatPhone(value);
        } else {
          value = input.value.trim();
        }
        const valid = kind === 'email' ? isEmail(value) : isPhonePeru(value);
        const same = value !== '' && value.toLowerCase() === String(cfg.current(session)).toLowerCase();
        let msg = '';
        if (same) msg = `Ese ya es tu ${cfg.noun} actual.`;
        else if (value && !valid) msg = kind === 'email' ? 'Escribe un correo válido' : 'Debe tener 9 dígitos y empezar con 9';
        hint.textContent = msg;
        hint.style.display = msg ? 'block' : 'none';
        send.disabled = !valid || same;
      };
      input.addEventListener('input', check);
      send.addEventListener('click', () => { step = 3; draw(); });
      check();
      input.focus();
    }

    function drawCode() {
      body.innerHTML = `
        ${dots(3)}
        <p class="eyebrow">Paso 3 de 3 · Verificación</p>
        <h2 class="stage-title">Ingresa el código</h2>
        <p class="sub-intro">Enviamos un código de 6 dígitos ${kind === 'email' ? 'a' : 'por SMS al'} <b>${cfg.mask(value)}</b>.</p>
        ${renderOtpRow()}
        <p class="timer">${renderIcon('clock', 17)} <span id="flow-timer"></span></p>
        <p class="form-error" id="flow-error" role="alert" style="display:none"></p>
        <button type="button" class="button primary" id="flow-verify" disabled>Verificar y guardar</button>
        <button type="button" class="button ghost" id="flow-resend" disabled>Reenviar código</button>`;
      const verify = body.querySelector('#flow-verify');
      const resend = body.querySelector('#flow-resend');
      const err = body.querySelector('#flow-error');
      const otp = mountOtp(body, (code) => { verify.disabled = !isOtpCode(code); err.style.display = 'none'; });
      stopTimer = startResendTimer(body.querySelector('#flow-timer'), resend);

      resend.addEventListener('click', () => { otp.clear(); stopTimer(); showToast('Código reenviado', 'info'); });
      verify.addEventListener('click', async () => {
        verify.disabled = true;
        try {
          if (!(await authService.verifyCode(otp.getCode()))) throw new Error('El código ingresado no es válido.');
          const updated = await cfg.apply(password, value);
          appState.setSession(updated);
          step = 4; draw();
        } catch (e) {
          err.textContent = e.message || 'No se pudo guardar el cambio.';
          err.style.display = 'block';
          verify.disabled = false;
        }
      });
    }

    function drawDone() {
      const s = appState.getSession();
      body.innerHTML = `
        <div class="done-block">
          <div class="done-art">${renderIcon('check', 36)}</div>
          <h2 class="stage-title">${kind === 'email' ? 'Correo actualizado' : 'Número actualizado'}</h2>
          <p class="sub-intro">Tu cuenta ahora está vinculada a <b>${cfg.mask(value)}</b>. Por seguridad te avisamos por ${cfg.notice(s)}.</p>
          <button type="button" class="button primary" id="flow-done">${cfg.done}</button>
        </div>`;
      body.querySelector('#flow-done').addEventListener('click', () => { window.location.hash = cfg.back; });
    }

    draw();
  }

  return { render, mount };
}
