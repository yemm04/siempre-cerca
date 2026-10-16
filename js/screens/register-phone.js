/**
 * register-phone.js - Registro Paso 2: Tu número (03-registro-2-telefono.png)
 * Validación de teléfono celular peruano (+51, 9 dígitos empezando por 9).
 */
import { renderIcon } from '../ui/icons.js';
import { formatPhone } from '../utils/mask.js';
import { isPhonePeru } from '../utils/validators.js';
import { appState } from '../state.js';

export function render() {
  const draft = appState.getRegistrationDraft();
  const rawPhone = draft.phone ? draft.phone.replace(/\D/g, '') : '';
  const formatted = formatPhone(rawPhone);

  return `
    <div class="screen padded auth">
      <button type="button" class="back" id="btn-back">
        ${renderIcon('arrow')} Volver
      </button>

      <div class="step-dots three" aria-label="Paso 2 de 3">
        <span class="done"></span>
        <span class="done"></span>
        <span></span>
      </div>

      <section class="title-block">
        <p class="eyebrow">Paso 2 de 3 · Tu número</p>
        <h1>Verifica tu <em>número</em></h1>
        <p>Te enviaremos un código por SMS para confirmar que el número es tuyo.</p>
      </section>

      <div class="form-card">
        <label for="reg-phone">Número de teléfono</label>
        <div class="phone-row">
          <button class="country" type="button" tabindex="-1">🇵🇪 <span>+51</span> ⌄</button>
          <input
            id="reg-phone"
            placeholder="987 654 321"
            inputmode="tel"
            autocomplete="tel-national"
            value="${formatted}"
          />
        </div>
        <small class="hint bad" id="phone-error" style="display: none; margin-bottom: 12px;"></small>
        <button type="button" class="button primary" id="btn-send-code" disabled>
          Enviar código
        </button>
      </div>

      <ul class="why-list">
        <li>
          ${renderIcon('user', 17)}
          <span><b>Una cuenta por número</b>Evita cuentas duplicadas.</span>
        </li>
        <li>
          ${renderIcon('shield', 17)}
          <span><b>Protege a la comunidad</b>Si alguien publica avisos falsos o hace spam, su número se bloquea y no podrá volver a registrarse.</span>
        </li>
        <li>
          ${renderIcon('lock', 17)}
          <span><b>Es privado</b>Nunca lo mostramos a otras personas.</span>
        </li>
      </ul>
    </div>
  `;
}

export function mount(root) {
  const phoneInput = root.querySelector('#reg-phone');
  const sendBtn = root.querySelector('#btn-send-code');
  const errorEl = root.querySelector('#phone-error');

  const validate = () => {
    const raw = phoneInput.value.replace(/\D/g, '').slice(0, 9);
    phoneInput.value = formatPhone(raw);
    const valid = isPhonePeru(raw);
    sendBtn.disabled = !valid;
    if (errorEl) errorEl.style.display = 'none';
  };

  phoneInput?.addEventListener('input', validate);

  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/registro';
  });

  sendBtn?.addEventListener('click', () => {
    const raw = phoneInput.value.replace(/\D/g, '');
    appState.setRegistrationDraft({ phone: raw });
    window.location.hash = '#/registro/codigo';
  });

  validate();
}
