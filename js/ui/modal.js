/**
 * modal.js - Componente de confirmación y modales
 * Diálogo modal para confirmación de cierre de sesión y acciones críticas.
 */
export function showConfirmModal({
  title = '¿Confirmar?',
  message = '¿Estás seguro de continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'alert',
  onConfirm,
  onCancel,
}) {
  const scrim = document.createElement('div');
  scrim.className = 'confirm-scrim';
  scrim.setAttribute('role', 'dialog');
  scrim.setAttribute('aria-modal', 'true');

  scrim.innerHTML = `
    <div class="confirm-sheet" onclick="event.stopPropagation()">
      <div class="handle"></div>
      <h2>${title}</h2>
      <p>${message}</p>
      <button type="button" class="button ${confirmVariant}" id="modal-confirm-btn">${confirmText}</button>
      <button type="button" class="button ghost" id="modal-cancel-btn">${cancelText}</button>
    </div>
  `;

  const close = () => {
    scrim.remove();
  };

  scrim.addEventListener('click', () => {
    close();
    if (typeof onCancel === 'function') onCancel();
  });

  scrim.querySelector('#modal-cancel-btn').addEventListener('click', () => {
    close();
    if (typeof onCancel === 'function') onCancel();
  });

  scrim.querySelector('#modal-confirm-btn').addEventListener('click', () => {
    close();
    if (typeof onConfirm === 'function') onConfirm();
  });

  document.body.appendChild(scrim);
}
