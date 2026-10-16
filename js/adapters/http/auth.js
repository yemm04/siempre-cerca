/**
 * auth.js - Esqueleto del adaptador HTTP de autenticación
 * TODO(avance-2): Conectar con endpoints /api/auth/register, /api/auth/login, /api/auth/logout.
 */
export const httpAuthAdapter = {
  async currentUser() {
    // TODO(avance-2): GET /api/me
    return null;
  },
  async register(data) {
    // TODO(avance-2): POST /api/auth/register
    return null;
  },
  async login(identifier, password) {
    // TODO(avance-2): POST /api/auth/login
    return null;
  },
  async logout() {
    // TODO(avance-2): POST /api/auth/logout
    return true;
  },
  async requestPasswordReset(identifier) {
    // TODO(avance-2): POST /api/auth/forgot
    return null;
  },
  async resetPassword(identifier, newPassword) {
    // TODO(avance-2): POST /api/auth/reset
    return true;
  },
  async checkPassword(currentPassword) {
    // TODO(avance-2): POST /api/me/check-password
    return false;
  },
  async changePassword(currentPassword, newPassword) {
    // TODO(avance-2): POST /api/me/password
    return true;
  },
  async changeEmail(currentPassword, newEmail) {
    // TODO(avance-2): POST /api/me/email
    return null;
  },
  async changePhone(currentPassword, newPhone) {
    // TODO(avance-2): POST /api/me/phone
    return null;
  },
  async verifyCode(code) {
    // TODO(avance-2): POST /api/auth/verify-code
    return true;
  },
};
