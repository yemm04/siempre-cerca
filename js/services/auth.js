/**
 * auth.js - Servicio de autenticación y gestión de cuentas
 * Interfaz utilizada por las pantallas para registro, login y contraseñas.
 */
import { api } from './index.js';

export const authService = {
  currentUser: () => api.auth.currentUser(),
  register: (draft) => api.auth.register(draft),
  login: (identifier, password) => api.auth.login(identifier, password),
  logout: () => api.auth.logout(),
  requestPasswordReset: (identifier) => api.auth.requestPasswordReset(identifier),
  resetPassword: (identifier, newPassword) => api.auth.resetPassword(identifier, newPassword),
  checkPassword: (password) => api.auth.checkPassword(password),
  changePassword: (cur, next) => api.auth.changePassword(cur, next),
  changeEmail: (curPw, newEmail) => api.auth.changeEmail(curPw, newEmail),
  changePhone: (curPw, newPhone) => api.auth.changePhone(curPw, newPhone),
  verifyCode: (code) => api.auth.verifyCode(code),
};
