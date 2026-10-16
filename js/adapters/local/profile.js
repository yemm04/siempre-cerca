/**
 * profile.js - Adaptador local para perfil y ajustes de usuario
 * Actualiza nombre, usuario y preferencias (radio, notificaciones, ubicación).
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage, resetDemoData } from './storage.js';
import { MESSAGES } from '../../utils/messages.js';

export const localProfileAdapter = {
  /**
   * Actualiza el nombre y nombre de usuario del perfil
   */
  async update({ name, username }) {
    const session = getFromStorage(CONFIG.STORAGE_KEYS.SESSION, null);
    if (!session) throw new Error('No hay sesión activa');

    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const cleanUser = username.trim().toLowerCase();

    // Comprobar que el nuevo usuario no esté en uso por otra persona
    const exists = users.some(
      (u) => u._id !== session._id && u.username.toLowerCase() === cleanUser
    );
    if (exists) {
      throw new Error(MESSAGES.AUTH.USERNAME_ALREADY_USED);
    }

    const index = users.findIndex((u) => u._id === session._id);
    if (index !== -1) {
      users[index].name = name.trim();
      users[index].username = cleanUser;
      saveToStorage(CONFIG.STORAGE_KEYS.USERS, users);
    }

    session.name = name.trim();
    session.username = cleanUser;
    saveToStorage(CONFIG.STORAGE_KEYS.SESSION, session);

    return session;
  },

  /**
   * Obtiene la configuración guardada del usuario
   */
  async getSettings() {
    const session = getFromStorage(CONFIG.STORAGE_KEYS.SESSION, null);
    if (!session) {
      return { radiusKm: 5, notifications: true, location: true };
    }
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u._id === session._id);
    return (
      user?.settings || {
        radiusKm: CONFIG.DEFAULT_RADIUS_KM,
        notifications: true,
        location: true,
      }
    );
  },

  /**
   * Guarda ajustes de radio, notificaciones y ubicación
   */
  async saveSettings(settings) {
    const session = getFromStorage(CONFIG.STORAGE_KEYS.SESSION, null);
    if (!session) return settings;

    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u._id === session._id);
    if (index !== -1) {
      users[index].settings = {
        ...users[index].settings,
        ...settings,
      };
      saveToStorage(CONFIG.STORAGE_KEYS.USERS, users);
    }
    return settings;
  },

  /**
   * Restablece los datos de demostración a su estado de fábrica
   */
  async resetDemo() {
    resetDemoData();
    return true;
  },
};
