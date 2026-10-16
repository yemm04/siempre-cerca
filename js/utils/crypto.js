/**
 * crypto.js - Hashing de contraseñas en el cliente con Web Crypto
 * TEMPORAL: En el servidor se usará bcrypt con salting en el Avance 2.
 */

// TEMPORAL: en el servidor se usará bcrypt
// TODO(avance-2): El backend manejará el hashing con bcrypt; el frontend enviará la clave segura por HTTPS
export async function hashPassword(plainTextPassword) {
  if (!plainTextPassword) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainTextPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
