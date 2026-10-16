/**
 * edit-profile.js - Editar perfil y datos de contacto (26-editar-perfil.png)
 * Modificación de nombre y usuario, y accesos para cambiar correo o teléfono.
 */
import { renderIcon } from '../ui/icons.js';
import { initials } from '../utils/format.js';
import { maskEmail, maskPhone } from '../utils/mask.js';
import { isUsername } from '../utils/validators.js';
import { profileService } from '../services/profile.js';
import { appState } from '../state.js';
import { showToast } from '../ui/toast.js';

export function render() {
  const session = appState.getSession();
  const name = session ? session.name : 'María Castillo';
  const username = session ? session.username : 'maria.castillo';
  const email = session ? maskEmail(session.email) : 'ma••••@gmail.com';
  const phone = session ? maskPhone(session.phone) : '+51 987 ••• 321';
  const userInitials = initials(name);

  return `
    <div class="screen sub-screen">
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">
          ${renderIcon('arrow')} Perfil
        </button>
        <span>Editar perfil</span>
        <span class="header-spacer"></span>
      </header>

      <div class="sub-scroll">
        <div class="edit-avatar">
          <span class="avatar big" id="avatar-preview">${userInitials}</span>
          <button type="button" id="btn-change-avatar">Cambiar foto</button>
        </div>

        <div class="form-card form-grid">
          <label>Nombre completo
            <input type="text" id="inp-edit-name" value="${name}" autocomplete="name" />
          </label>

          <label>Nombre de usuario
            <div class="input-icon">
              <span class="at">@</span>
              <input type="text" id="inp-edit-user" value="${username}" autocapitalize="none" />
            </div>
            <small class="hint" id="edit-user-hint">Puedes cambiarlo una vez cada 30 días.</small>
          </label>
        </div>

        <div id="save-success-msg" class="form-info ok" style="display: none;">
          ${renderIcon('check', 14)} Cambios guardados.
        </div>

        <button type="button" class="button primary" id="btn-save-profile" disabled>
          Guardar cambios
        </button>

        <p class="group-title">Datos de contacto</p>
        <div class="profile-group">
          <div class="contact-row">
            <div class="icon-box ochre">${renderIcon('mail', 19)}</div>
            <div>
              <small>Correo electrónico</small>
              <b>${email}</b>
            </div>
            <button type="button" id="btn-change-email">Cambiar</button>
          </div>

          <div class="contact-row">
            <div class="icon-box green">${renderIcon('phone', 19)}</div>
            <div>
              <small>Teléfono</small>
              <b>${phone}</b>
            </div>
            <button type="button" id="btn-change-phone">Cambiar</button>
          </div>
        </div>

        <p class="sub-note">
          Para cambiar tu correo o tu número te pediremos tu contraseña y verificaremos el dato nuevo con un código.
        </p>
      </div>
    </div>
  `;
}

export function mount(root) {
  const nameInp = root.querySelector('#inp-edit-name');
  const userInp = root.querySelector('#inp-edit-user');
  const hintEl = root.querySelector('#edit-user-hint');
  const saveBtn = root.querySelector('#btn-save-profile');
  const successMsg = root.querySelector('#save-success-msg');
  const avatarEl = root.querySelector('#avatar-preview');

  const session = appState.getSession();
  const initialName = session ? session.name : '';
  const initialUser = session ? session.username : '';

  const validate = () => {
    const n = nameInp.value.trim();
    const u = userInp.value.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    userInp.value = u;

    const userOk = isUsername(u);
    if (!userOk && u) {
      hintEl.className = 'hint bad';
      hintEl.textContent = '4 a 20 caracteres: letras minúsculas, números, punto o guion bajo';
    } else {
      hintEl.className = 'hint';
      hintEl.textContent = 'Puedes cambiarlo una vez cada 30 días.';
    }

    const dirty = n !== initialName || u !== initialUser;
    const valid = n.length >= 2 && userOk;
    saveBtn.disabled = !dirty || !valid;
    if (successMsg) successMsg.style.display = 'none';

    if (avatarEl) avatarEl.textContent = initials(n || initialName);
  };

  nameInp?.addEventListener('input', validate);
  userInp?.addEventListener('input', validate);

  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/perfil';
  });

  root.querySelector('#btn-change-email')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/correo/cambiar';
  });

  root.querySelector('#btn-change-phone')?.addEventListener('click', () => {
    window.location.hash = '#/perfil/telefono/cambiar';
  });

  root.querySelector('#btn-change-avatar')?.addEventListener('click', () => {
    showToast('La actualización de foto de perfil estará disponible en el Avance 2', 'info');
  });

  saveBtn?.addEventListener('click', async () => {
    try {
      saveBtn.disabled = true;
      const updated = await profileService.update({
        name: nameInp.value.trim(),
        username: userInp.value.trim().toLowerCase(),
      });
      appState.setSession(updated);
      if (successMsg) successMsg.style.display = 'flex';
      showToast('Perfil actualizado correctamente', 'success');
      setTimeout(() => {
        window.location.hash = '#/perfil';
      }, 1000);
    } catch (err) {
      saveBtn.disabled = false;
      showToast(err.message || 'Error al actualizar perfil', 'error');
    }
  });
}
