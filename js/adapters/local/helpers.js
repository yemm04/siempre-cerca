/**
 * helpers.js - Utilidades compartidas SOLO por los adaptadores locales (Avance 1).
 * Todo lo que hay aquí lo hará el servidor en el Avance 2, por eso no sale de esta carpeta.
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage } from './storage.js';

// TEMPORAL: en MongoDB el _id lo genera la base de datos (ObjectId); el cliente nunca lo envía.
let counter = 0;
export function newId(prefix) {
  counter += 1;
  return `${prefix}_${Date.now()}${counter}`;
}

/** Devuelve la sesión guardada o null */
export function getSession() {
  return getFromStorage(CONFIG.STORAGE_KEYS.SESSION, null);
}

/** Devuelve la sesión o lanza error si el usuario no inició sesión */
export function requireSession() {
  const session = getSession();
  if (!session) throw new Error('Debes iniciar sesión para continuar');
  return session;
}

/**
 * Crea una notificación para un usuario.
 * TEMPORAL: en el Avance 2 el servidor crea las notificaciones por su cuenta
 * cuando ocurre el evento; el frontend no tendrá que llamar a esto.
 */
export function pushNotification({ userId, type, title, body, caseId }) {
  const notifications = getFromStorage(CONFIG.STORAGE_KEYS.NOTIFICATIONS, []);
  notifications.unshift({
    _id: newId('notif'),
    userId,
    type,
    title,
    body,
    caseId,
    read: false,
    createdAt: new Date().toISOString(),
  });
  saveToStorage(CONFIG.STORAGE_KEYS.NOTIFICATIONS, notifications);
}

/**
 * Devuelve la sesión solo si es del equipo (moderador/admin).
 * TEMPORAL: en el Avance 2 el servidor revisa el rol en cada petición /api/admin/*.
 */
export function requireStaff() {
  const session = requireSession();
  if (!CONFIG.STAFF_ROLES.includes(session.role)) {
    throw new Error('No tienes permisos para esta acción.');
  }
  return session;
}

/**
 * Registra una acción del equipo en el historial de moderación.
 * TEMPORAL: en el Avance 2 el servidor guarda el historial en la colección "audit".
 */
export function logAudit({ action, targetType, targetId, targetLabel, detail = '' }) {
  const staff = getSession();
  const log = getFromStorage(CONFIG.STORAGE_KEYS.AUDIT, []);
  log.unshift({
    _id: newId('audit'),
    adminId: staff?._id,
    adminName: staff?.name || 'Equipo',
    action,
    targetType,
    targetId,
    targetLabel,
    detail,
    createdAt: new Date().toISOString(),
  });
  saveToStorage(CONFIG.STORAGE_KEYS.AUDIT, log.slice(0, 200));
}
