/**
 * profile.js - Esqueleto del adaptador HTTP de perfil
 * TODO(avance-2): Conectar con PATCH /api/me y GET/PATCH /api/me/settings.
 */
export const httpProfileAdapter = {
  async update(data) {
    // TODO(avance-2): PATCH /api/me
    return null;
  },
  async getSettings() {
    // TODO(avance-2): GET /api/me/settings
    return { radiusKm: 5, notifications: true, location: true };
  },
  async saveSettings(settings) {
    // TODO(avance-2): PATCH /api/me/settings
    return settings;
  },
  async resetDemo() {
    // No aplica en producción con backend real
    return true;
  },
};
