/**
 * notifications.js - Servicio de notificaciones comunitarias
 * Interfaz para listar y marcar notificaciones leídas.
 */
import { api } from './index.js';

export const notificationsService = {
  list: () => api.notifications.list(),
  markAllRead: () => api.notifications.markAllRead(),
  markRead: (id) => api.notifications.markRead(id),
};
