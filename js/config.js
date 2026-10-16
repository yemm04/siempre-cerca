/**
 * config.js - Configuración central de Siempre Cerca
 * Constantes de geolocalización de Lima (Perú), límites y claves de almacenamiento.
 */
export const CONFIG = {
  // En Avance 1 es false (localStorage). En Avance 2 se cambiará a true (API REST + MongoDB).
  // TODO(avance-2): Cambiar USE_API a true al integrar con el servidor Express
  USE_API: false,

  API_BASE_URL: '/api',

  // Versión de los datos de ejemplo: al subirla, se agregan los datos nuevos sin borrar los tuyos
  SEED_VERSION: '2',

  // Roles que pueden entrar al panel de administración
  STAFF_ROLES: ['moderator', 'admin'],

  // En el Avance 1 la pantalla de revisión muestra un botón para simular la aprobación
  // TEMPORAL: en el Avance 2 la aprobación solo la hace el equipo desde el panel admin
  DEMO_MODE: true,

  // Coordenadas iniciales: Miraflores, Lima, Perú
  LIMA_CENTER: {
    lat: -12.1197,
    lng: -77.0372,
  },

  // Límites geográficos del Perú para restringir el mapa Leaflet
  PERU_BOUNDS: [
    [-18.5, -81.5], // Suroeste
    [0.0, -68.5],   // Noreste
  ],

  DEFAULT_ZOOM: 14,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,

  // Claves obligatorias en localStorage (prefijo sc:)
  STORAGE_KEYS: {
    USERS: 'sc:users',
    CASES: 'sc:cases',
    SIGHTINGS: 'sc:sightings',
    PARTICIPATIONS: 'sc:participations',
    NOTIFICATIONS: 'sc:notifications',
    AUDIT: 'sc:audit',
    SESSION: 'sc:session',
    SEEDED: 'sc:seeded',
  },

  // Centrales de emergencia oficiales de Perú
  EMERGENCIES: {
    POLICE: '105',
    FIREFIGHTERS: '116',
    SAMU: '106',
  },

  DEFAULT_RADIUS_KM: 5,
};
