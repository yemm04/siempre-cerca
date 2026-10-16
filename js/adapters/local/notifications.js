/**
 * notifications.js - Adaptador local para centro de notificaciones
 * Almacena en sc:notifications y gestiona estado de lectura.
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage } from './storage.js';
import { getSession } from './helpers.js';

export const localNotificationsAdapter = {
  /**
   * Obtiene la lista de notificaciones del usuario
   */
  async list() {
    const notifications = getFromStorage(CONFIG.STORAGE_KEYS.NOTIFICATIONS, []);
    const session = getSession();
    if (!session) return [];
    // Cada usuario ve solo sus notificaciones
    return notifications.filter((n) => n.userId === session._id);
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllRead() {
    const notifications = getFromStorage(CONFIG.STORAGE_KEYS.NOTIFICATIONS, []);
    const session = getSession();
    const updated = notifications.map((n) =>
      session && n.userId === session._id ? { ...n, read: true } : n
    );
    saveToStorage(CONFIG.STORAGE_KEYS.NOTIFICATIONS, updated);
    return true;
  },

  /**
   * Marca una notificación específica como leída
   */
  async markRead(id) {
    const notifications = getFromStorage(CONFIG.STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifications.findIndex((n) => n._id === id);
    if (index !== -1) {
      notifications[index].read = true;
      saveToStorage(CONFIG.STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
    return true;
  },
};
