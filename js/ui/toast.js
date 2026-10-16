/**
 * toast.js - Mensajes flotantes de retroalimentación
 * Notificaciones breves y accesibles para confirmación de acciones.
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText =
      'position: fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; flex-direction: column; gap: 8px; width: min(90%, 360px); pointer-events: none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'error' ? 'var(--coral)' : type === 'success' ? 'var(--green)' : 'var(--ink)';
  toast.style.cssText = `
    background: ${bg};
    color: #fff;
    padding: 12px 18px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    text-align: center;
    transition: opacity 0.3s, transform 0.3s;
    pointer-events: auto;
  `;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
