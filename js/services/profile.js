/**
 * profile.js - Servicio de perfil y preferencias del usuario
 * Interfaz para actualizar datos, radio de alerta y restablecer datos de prueba.
 */
import { api } from './index.js';

export const profileService = {
  update: (data) => api.profile.update(data),
  getSettings: () => api.profile.getSettings(),
  saveSettings: (settings) => api.profile.saveSettings(settings),
  resetDemo: () => api.profile.resetDemo(),
};
