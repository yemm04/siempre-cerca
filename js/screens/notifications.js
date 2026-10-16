/**
 * notifications.js - Pantalla de notificaciones (16-notificaciones.png)
 * Historial de alertas agrupadas por fecha con opción de marcar todas como leídas.
 */
import { renderIcon } from '../ui/icons.js';
import { renderNav, mountNavEvents } from '../ui/nav.js';
import { notificationsService } from '../services/notifications.js';
import { showToast } from '../ui/toast.js';
import { dayGroupOf } from '../utils/format.js';

export function render() {
  return `
    <div class="screen notifications-screen" id="notif-screen-root">
      <div style="text-align: center; padding: 50px 0; color: var(--muted);">Cargando notificaciones...</div>
    </div>
  `;
}

export function mount(root) {
  const container = root.querySelector('#notif-screen-root');

  const loadNotifications = async () => {
    try {
      const list = await notificationsService.list();

      // Separar por grupos de día
      const todayList = list.filter((n) => dayGroupOf(n.createdAt) === 'HOY');
      const yesterdayList = list.filter((n) => dayGroupOf(n.createdAt) !== 'HOY');

      const renderItem = (n) => {
        const isUnread = !n.read;
        const iconBox =
          n.type === 'nearby'
            ? `<div class="notif-icon coral">${renderIcon('location')}</div>`
            : n.type === 'sighting'
            ? `<div class="notif-photo"><img src="https://images.unsplash.com/photo-1714247084434-49bbc3ebf577?w=100" alt="" /></div>`
            : n.type === 'resolved'
            ? `<div class="notif-icon green">${renderIcon('check')}</div>`
            : `<div class="notif-icon ochre">${renderIcon('clock')}</div>`;

        const typeLabel =
          n.type === 'nearby'
            ? 'ALERTA CERCA DE TI'
            : n.type === 'sighting'
            ? 'NUEVO AVISTAMIENTO'
            : n.type === 'resolved'
            ? 'CASO RESUELTO'
            : 'REPORTE EN REVISIÓN';

        return `
          <button type="button" class="notification ${isUnread ? 'unread' : ''} ${n.type === 'resolved' ? 'success' : ''}" data-notif-id="${n._id}" data-case-id="${n.caseId || ''}" data-type="${n.type}">
            ${iconBox}
            <div>
              <span class="notif-type">${typeLabel}</span>
              <b>${n.title}</b>
              <p>${n.body}</p>
              <small>Reciente</small>
            </div>
            ${isUnread ? '<i></i>' : '<span></span>'}
          </button>
        `;
      };

      container.innerHTML = `
        <header class="simple-header">
          <span class="title-left">Notificaciones</span>
          <button type="button" id="btn-mark-all-read">Marcar leídas</button>
        </header>

        <div class="notification-list">
          <p class="day">HOY</p>
          ${todayList.length ? todayList.map(renderItem).join('') : '<p style="color:var(--muted); font-size:11px; padding: 10px;">Sin novedades hoy.</p>'}

          ${
            yesterdayList.length
              ? `
            <p class="day">ANTERIORES</p>
            ${yesterdayList.map(renderItem).join('')}
          `
              : ''
          }
        </div>

        ${renderNav('notifications')}
      `;

      mountNavEvents(container);

      // Evento marcar todas leídas
      container.querySelector('#btn-mark-all-read')?.addEventListener('click', async () => {
        await notificationsService.markAllRead();
        showToast('Todas las notificaciones marcadas como leídas', 'success');
        loadNotifications();
      });

      // Click en cada notificación
      container.querySelectorAll('.notification').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.notifId;
          const caseId = btn.dataset.caseId;
          const type = btn.dataset.type;

          await notificationsService.markRead(id);

          if (type === 'review') {
            window.location.hash = `#/alerta/${caseId || 'case_bruno_01'}`;
          } else if (type === 'resolved') {
            window.location.hash = `#/resuelto/${caseId || 'case_luna_03'}`;
          } else if (caseId) {
            window.location.hash = `#/caso/${caseId}`;
          }
        });
      });
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  };

  loadNotifications();
}
