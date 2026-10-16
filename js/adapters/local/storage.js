/**
 * storage.js - Abstracción de acceso seguro a localStorage
 * Controla inicialización con datos seed y manejo de QuotaExceededError.
 */
import { CONFIG } from '../../config.js';
import {
  INITIAL_USERS,
  INITIAL_CASES,
  INITIAL_SIGHTINGS,
  INITIAL_PARTICIPATIONS,
  INITIAL_NOTIFICATIONS,
} from '../../data/seed.js';

export function getFromStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error leyendo ${key} de localStorage:`, e);
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      throw new Error(
        'El almacenamiento del navegador está lleno. Elimina imágenes o reinicia los datos de demo.'
      );
    }
    throw e;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removiendo ${key} de localStorage:`, e);
  }
}

/**
 * Inicializa los datos de demostración en localStorage la primera vez que se ejecuta
 */
export function initializeSeedData(force = false) {
  const seeds = [
    [CONFIG.STORAGE_KEYS.USERS, INITIAL_USERS],
    [CONFIG.STORAGE_KEYS.CASES, INITIAL_CASES],
    [CONFIG.STORAGE_KEYS.SIGHTINGS, INITIAL_SIGHTINGS],
    [CONFIG.STORAGE_KEYS.PARTICIPATIONS, INITIAL_PARTICIPATIONS],
    [CONFIG.STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS],
  ];
  const seededVersion = localStorage.getItem(CONFIG.STORAGE_KEYS.SEEDED);

  if (!seededVersion || force) {
    seeds.forEach(([key, data]) => saveToStorage(key, data));
  } else if (seededVersion !== CONFIG.SEED_VERSION) {
    // Versión nueva de los datos de ejemplo: agrega los que faltan (por _id) sin borrar lo que ya hay
    seeds.forEach(([key, data]) => {
      const current = getFromStorage(key, []);
      const ids = new Set(current.map((item) => item._id));
      saveToStorage(key, [...current, ...data.filter((item) => !ids.has(item._id))]);
    });
  }
  localStorage.setItem(CONFIG.STORAGE_KEYS.SEEDED, CONFIG.SEED_VERSION);
}

/**
 * Restablece todos los datos locales borrando las claves sc:* y recargando el seed
 */
export function resetDemoData() {
  Object.values(CONFIG.STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  initializeSeedData(true);
}
