/**
 * change-password.js - Cambiar contraseña (31-cambiar-contrasena.png)
 * Tres campos: actual, nueva y repetir. Valida reglas y que sea distinta a la actual.
 */
import { renderIcon } from '../ui/icons.js';
import { authService } from '../services/auth.js';
import { passwordRules } from '../utils/validators.js';
import { showToast } from '../ui/toast.js';

export function render() {
  const eye = (id) => `<button type="button" class="eye" data-eye="${id}" aria-label="Mostrar contraseña">${renderIcon('eye', 18)}</button>`;
  return `
    <div class="screen sub-screen">
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">${renderIcon('arrow')} Perfil</button>
        <span>Cambiar contraseña</span>
        <span class="header-spacer"></span>
      </header>
      <div class="sub-scroll">
        <p class="sub-intro">Tu contraseña debe tener al menos 8 caracteres, con letras y números. No uses una contraseña que ya hayas usado en otros sitios.</p>
        <form class="form-card form-grid" id="pw-form" novalidate>
          <label>Contraseña actual
            <div class="input-icon"><input type="password" id="pw-cur" placeholder="Contraseña actual" autocomplete="current-password" />${eye('pw-cur')}</div>
          </label>
          <p class="form-error" id="pw-error" role="alert" style="display:none">La contraseña actual no es correcta.</p>

          <label>Contraseña nueva
            <div class="input-icon"><input type="password" id="pw-new" placeholder="Contraseña nueva" autocomplete="new-password" />${eye('pw-new')}</div>
          </label>
          <ul class="rules" id="pw-rules">
            <li><i>${renderIcon('check', 10)}</i> Mínimo 8 caracteres</li>
            <li><i>${renderIcon('check', 10)}</i> Al menos una letra</li>
            <li><i>${renderIcon('check', 10)}</i> Al menos un número</li>
          </ul>
          <small class="hint bad" id="pw-same" style="display:none">La nueva contraseña debe ser distinta a la actual.</small>

          <label>Repite la contraseña nueva
            <div class="input-icon"><input type="password" id="pw-again" placeholder="Repite la contraseña nueva" autocomplete="new-password" />${eye('pw-again')}</div>
            <small class="hint bad" id="pw-mismatch" style="display:none">Las contraseñas no coinciden</small>
          </label>

          <button type="submit" class="button primary" id="pw-submit" disabled>Cambiar contraseña</button>
        </form>
      </div>
    </div>`;
}

export function mount(root) {
  const $ = (id) => root.querySelector(id);
  const cur = $('#pw-cur'), next = $('#pw-new'), again = $('#pw-again');
  const submit = $('#pw-submit'), errorEl = $('#pw-error');
  const rulesEl = root.querySelectorAll('#pw-rules li');

  const validate = () => {
    const rules = passwordRules(next.value);
    rules.forEach((r, i) => rulesEl[i].classList.toggle('ok', r.ok));
    const rulesOk = rules.every((r) => r.ok);
    const same = next.value !== '' && next.value === cur.value;
    const mismatch = again.value !== '' && again.value !== next.value;
    $('#pw-same').style.display = same ? 'block' : 'none';
    $('#pw-mismatch').style.display = mismatch ? 'block' : 'none';
    errorEl.style.display = 'none';
    submit.disabled = !(cur.value && rulesOk && !same && again.value === next.value);
  };
  [cur, next, again].forEach((i) => i.addEventListener('input', validate));

  root.querySelectorAll('[data-eye]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = $(`#${btn.dataset.eye}`);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = renderIcon(show ? 'eyeOff' : 'eye', 18);
    });
  });

  $('#btn-back').addEventListener('click', () => { window.location.hash = '#/perfil'; });

  $('#pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;
    try {
      await authService.changePassword(cur.value, next.value);
      showToast('Contraseña actualizada', 'success');
      window.location.hash = '#/perfil';
    } catch (err) {
      errorEl.textContent = err.message || 'No se pudo cambiar la contraseña.';
      errorEl.style.display = 'block';
      submit.disabled = false;
    }
  });
}
