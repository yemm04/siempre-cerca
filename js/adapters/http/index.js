/**
 * index.js - Adaptador HTTP para Avance 2 (API REST + MongoDB Atlas)
 * TODO(avance-2): Implementar llamadas con fetch('/api/...') hacia el backend Node/Express.
 */
import { httpAuthAdapter } from './auth.js';
import { httpCasesAdapter } from './cases.js';
import { httpSightingsAdapter } from './sightings.js';
import { httpSearchesAdapter } from './searches.js';
import { httpNotificationsAdapter } from './notifications.js';
import { httpProfileAdapter } from './profile.js';
import { httpAdminAdapter } from './admin.js';

export const httpAdapter = {
  auth: httpAuthAdapter,
  cases: httpCasesAdapter,
  sightings: httpSightingsAdapter,
  searches: httpSearchesAdapter,
  notifications: httpNotificationsAdapter,
  profile: httpProfileAdapter,
  admin: httpAdminAdapter,
};
