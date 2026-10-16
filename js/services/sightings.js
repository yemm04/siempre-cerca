/**
 * sightings.js - Servicio de avistamientos de pistas
 * Interfaz para reportar pistas y consultar avistamientos del usuario.
 */
import { api } from './index.js';

export const sightingsService = {
  create: (caseId, data) => api.sightings.create(caseId, data),
  listMine: () => api.sightings.listMine(),
  listForCase: (caseId) => api.sightings.listForCase(caseId),
};
