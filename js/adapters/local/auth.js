/**
 * auth.js - Adaptador local de autenticación
 * Guarda usuarios en sc:users y sesión en sc:session con hashing de contraseñas.
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage, removeFromStorage } from './storage.js';
import { hashPassword } from '../../utils/crypto.js';
import { MESSAGES } from '../../utils/messages.js';

export const localAuthAdapter = {
  /**
   * Obtiene la sesión actual persistida
   */
  async currentUser() {
    return getFromStorage(CONFIG.STORAGE_KEYS.SESSION, null);
  },

  /**
   * Registra un nuevo usuario tras verificar el código SMS
   */
  async register({ name, username, email, password, phone }) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanUser = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Validar duplicidad de teléfono (un teléfono = una cuenta)
    const phoneExists = users.some((u) => u.phone === cleanPhone);
    if (phoneExists) {
      throw new Error(MESSAGES.AUTH.PHONE_ALREADY_USED);
    }

    // Validar duplicidad de correo o usuario
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(MESSAGES.AUTH.EMAIL_ALREADY_USED);
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      throw new Error(MESSAGES.AUTH.USERNAME_ALREADY_USED);
    }

    // TEMPORAL: en el servidor se usará bcrypt
    const passwordHash = await hashPassword(password);

    const newUser = {
      _id: `usr_${Date.now()}`,
      name: name.trim(),
      username: cleanUser,
      email: cleanEmail,
      passwordHash,
      phone: cleanPhone,
      phoneVerified: true,
      role: 'user',
      status: 'active',
      settings: {
        radiusKm: CONFIG.DEFAULT_RADIUS_KM,
        notifications: true,
        location: true,
      },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveToStorage(CONFIG.STORAGE_KEYS.USERS, users);

    // Guardar sesión sin passwordHash
    const session = {
      _id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    };
    saveToStorage(CONFIG.STORAGE_KEYS.SESSION, session);

    return session;
  },

  /**
   * Inicio de sesión con correo o usuario y contraseña
   */
  async login(identifier, password) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    const hashed = await hashPassword(password);

    const user = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!user || user.passwordHash !== hashed) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
    // Se avisa de la suspensión solo después de acertar la contraseña
    if (user.status === 'banned') {
      throw new Error(MESSAGES.AUTH.ACCOUNT_BANNED);
    }

    const session = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    saveToStorage(CONFIG.STORAGE_KEYS.SESSION, session);
    return session;
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    removeFromStorage(CONFIG.STORAGE_KEYS.SESSION);
    return true;
  },

  /**
   * Solicitar recuperación de contraseña (simulado)
   */
  async requestPasswordReset(identifier) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );
    if (!user) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }
    return {
      userId: user._id,
      email: user.email,
      phone: user.phone,
    };
  },

  /**
   * Restablecer contraseña con código simulado
   */
  async resetPassword(identifier, newPassword) {
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    const userIndex = users.findIndex(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );
    if (userIndex === -1) {
      throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);
    }

    const hashed = await hashPassword(newPassword);
    users[userIndex].passwordHash = hashed;
    saveToStorage(CONFIG.STORAGE_KEYS.USERS, users);
    return true;
  },

  /**
   * Verifica la contraseña actual del usuario en sesión
   */
  async checkPassword(currentPassword) {
    const session = await this.currentUser();
    if (!session) return false;
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u._id === session._id);
    if (!user) return false;
    const hashed = await hashPassword(currentPassword);
    return user.passwordHash === hashed;
  },

  /**
   * Cambiar contraseña con validación de la actual
   */
  async changePassword(currentPassword, newPassword) {
    const session = await this.currentUser();
    if (!session) throw new Error('No hay sesión activa');
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u._id === session._id);
    if (userIndex === -1) throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);

    const hashedCurrent = await hashPassword(currentPassword);
    if (users[userIndex].passwordHash !== hashedCurrent) {
      throw new Error(MESSAGES.AUTH.CURRENT_PASSWORD_WRONG);
    }

    const hashedNew = await hashPassword(newPassword);
    if (hashedNew === hashedCurrent) throw new Error(MESSAGES.AUTH.SAME_PASSWORD);
    users[userIndex].passwordHash = hashedNew;
    saveToStorage(CONFIG.STORAGE_KEYS.USERS, users);
    return true;
  },

  /**
   * Cambiar correo electrónico
   */
  async changeEmail(currentPassword, newEmail) {
    const isOk = await this.checkPassword(currentPassword);
    if (!isOk) throw new Error(MESSAGES.AUTH.CURRENT_PASSWORD_WRONG);

    const session = await this.currentUser();
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u._id === session._id);
    if (userIndex === -1) throw new Error(MESSAGES.AUTH.USER_NOT_FOUND);

    const cleanEmail = newEmail.trim().toLowerCase();
    if (users[userIndex].email.toLowerCase() === cleanEmail) throw new Error(MESSAGES.AUTH.SAME_EMAIL);
    if (users.some((u) => u._id !== session._id && u.email.toLowerCase() === cleanEmail)) {
      throw new Error(MESSAGES.AUTH.EMAIL_ALREADY_USED);
    }

    users[userIndex].email = cleanEmail;
    saveToStorage(CONFIG.STORAGE_KEYS.USERS, users);

    session.email = users[userIndex].email;
    saveToStorage(CONFIG.STORAGE_KEYS.SESSION, session);
    return session;
  },

  /**
   * Cambiar número de teléfono
   */
  async changePhone(currentPassword, newPhone) {
    const isOk = await this.checkPassword(currentPassword);
    if (!isOk) throw new Error(MESSAGES.AUTH.CURRENT_PASSWORD_WRONG);

    const cleanPhone = newPhone.replace(/\D/g, '');
    const session = await this.currentUser();
    const users = getFromStorage(CONFIG.STORAGE_KEYS.USERS, []);

    // Comprobar que no esté ocupado
    if (users.some((u) => u._id !== session._id && u.phone === cleanPhone)) {
      throw new Error(MESSAGES.AUTH.PHONE_ALREADY_USED);
    }

    const userIndex = users.findIndex((u) => u._id === session._id);
    if (users[userIndex].phone === cleanPhone) throw new Error(MESSAGES.AUTH.SAME_PHONE);
    users[userIndex].phone = cleanPhone;
    saveToStorage(CONFIG.STORAGE_KEYS.USERS, users);

    session.phone = cleanPhone;
    saveToStorage(CONFIG.STORAGE_KEYS.SESSION, session);
    return session;
  },

  /**
   * Verificación de código de 6 dígitos simulada
   */
  async verifyCode(code) {
    // TEMPORAL: en el avance local cualquier código de 6 dígitos es válido
    return typeof code === 'string' && code.replace(/\D/g, '').length === 6;
  },
};
