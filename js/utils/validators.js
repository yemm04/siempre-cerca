/**
 * validators.js - Validadores compartidos del sistema
 * Centraliza validaciones de usuario, correo, contraseña y teléfonos de Perú.
 */

/**
 * Valida formato de correo electrónico
 */
export function isEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Valida nombre de usuario: 4 a 20 caracteres en minúsculas, números, punto o guion bajo
 */
export function isUsername(username) {
  if (!username || typeof username !== 'string') return false;
  return /^[a-z0-9._]{4,20}$/.test(username.trim());
}

/**
 * Reglas de contraseña: mínimo 8 caracteres, al menos una letra y al menos un número
 */
export function passwordRules(password) {
  const pw = password || '';
  return [
    { ok: pw.length >= 8, label: 'Mínimo 8 caracteres' },
    { ok: /[A-Za-z]/.test(pw), label: 'Al menos una letra' },
    { ok: /\d/.test(pw), label: 'Al menos un número' },
  ];
}

/**
 * Valida si la contraseña cumple todas las reglas mínimas
 */
export function isPasswordValid(password) {
  return passwordRules(password).every((r) => r.ok);
}

/**
 * Valida celular peruano: 9 dígitos numéricos empezando con 9
 */
export function isPhonePeru(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return /^9\d{8}$/.test(digits);
}

/**
 * Valida código de verificación SMS/correo (6 dígitos numéricos)
 */
export function isOtpCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^\d{6}$/.test(code.trim());
}
