/**
 * mask.js - Enmascaramiento y privacidad de datos sensibles
 * Oculta correos y números telefónicos según docs/DISENO.md y LOCALIZACION_PERU.md.
 */

/**
 * Enmascara correo electrónico: ma••••@gmail.com
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [user, domain] = parts;
  const visible = user.slice(0, 2);
  return `${visible}••••@${domain}`;
}

/**
 * Enmascara número de celular peruano: +51 987 ••• 321
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const d = phone.replace(/\D/g, '');
  if (d.length < 6) return phone;
  return `+51 ${d.slice(0, 3)} ••• ${d.slice(6)}`;
}

/**
 * Formatea número telefónico con espacios: 987 654 321
 */
export function formatPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const d = phone.replace(/\D/g, '').slice(0, 9);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
}
