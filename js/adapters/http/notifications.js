/**
 * notifications.js - Esqueleto del adaptador HTTP de notificaciones
 * TODO(avance-2): Conectar con GET /api/notifications y PATCH /api/notifications/read.
 */
export const httpNotificationsAdapter = {
  async list() {
    // TODO(avance-2): GET /api/notifications
    return [];
  },
  async markAllRead() {
    // TODO(avance-2): PATCH /api/notifications/mark-all-read
    return true;
  },
  async markRead(id) {
    // TODO(avance-2): PATCH /api/notifications/:id/read
    return true;
  },
};
