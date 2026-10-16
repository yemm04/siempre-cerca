/**
 * otp.js - Casillas de código de 6 dígitos y temporizador de reenvío.
 * Lo usan las pantallas de cambio de correo y de teléfono.
 * (El registro tiene su propia versión en screens/register-code.js.)
 */

/** HTML de las 6 casillas */
export function renderOtpRow() {
  const boxes = [1, 2, 3, 4, 5, 6]
    .map((n) => `<input type="text" maxlength="1" inputmode="numeric" autocomplete="one-time-code" aria-label="Dígito ${n}" />`)
    .join('');
  return `<div class="otp-row" data-otp>${boxes}</div>`;
}

/**
 * Activa las casillas: avance automático, borrar y pegar.
 * @param {HTMLElement} root contenedor donde está el [data-otp]
 * @param {(code:string)=>void} onChange se llama con el código actual
 */
export function mountOtp(root, onChange) {
  const inputs = Array.from(root.querySelectorAll('[data-otp] input'));
  const getCode = () => inputs.map((i) => i.value).join('');

  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '');
      if (digits.length > 1) {
        digits.slice(0, 6).split('').forEach((c, i) => { inputs[i].value = c; });
        inputs[Math.min(digits.length, 6) - 1].focus();
      } else {
        input.value = digits;
        if (digits && idx < 5) inputs[idx + 1].focus();
      }
      onChange(getCode());
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) inputs[idx - 1].focus();
    });
  });

  inputs[0]?.focus();
  return {
    getCode,
    clear() { inputs.forEach((i) => { i.value = ''; }); onChange(''); inputs[0]?.focus(); },
  };
}

/**
 * Cuenta regresiva de reenvío (38 s). Devuelve una función para reiniciarla;
 * el temporizador se detiene solo si la pantalla ya no está en el documento.
 */
export function startResendTimer(timerEl, resendBtn, seconds = 38) {
  let left = seconds;
  let id = null;
  const tick = () => {
    if (!timerEl.isConnected) { clearInterval(id); return; }
    left -= 1;
    if (left > 0) {
      timerEl.innerHTML = `Puedes pedir otro código en <b>00:${String(left).padStart(2, '0')}</b>`;
    } else {
      clearInterval(id);
      timerEl.textContent = 'Ya puedes pedir otro código';
      resendBtn.disabled = false;
    }
  };
  const restart = () => {
    clearInterval(id);
    left = seconds;
    resendBtn.disabled = true;
    timerEl.innerHTML = `Puedes pedir otro código en <b>00:${String(left).padStart(2, '0')}</b>`;
    id = setInterval(tick, 1000);
  };
  restart();
  return restart;
}
