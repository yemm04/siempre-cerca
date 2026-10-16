/**
 * index.js - Punto de entrada del adaptador local (Avance 1)
 * Agrupa los servicios implementados sobre localStorage.
 */
import { localAuthAdapter } from './auth.js';
import { localCasesAdapter } from './cases.js';
import { localSightingsAdapter } from './sightings.js';
import { localSearchesAdapter } from './searches.js';
import { localNotificationsAdapter } from './notifications.js';
import { localProfileAdapter } from './profile.js';
import { localAdminAdapter } from './admin.js';
import { initializeSeedData, resetDemoData } from './storage.js';

export const localAdapter = {
  auth: localAuthAdapter,
  cases: localCasesAdapter,
  sightings: localSightingsAdapter,
  searches: localSearchesAdapter,
  notifications: localNotificationsAdapter,
  profile: localProfileAdapter,
  admin: localAdminAdapter,
  initialize: initializeSeedData,
  reset: resetDemoData,
};
