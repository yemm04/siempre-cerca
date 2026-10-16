/**
 * searches.js - Servicio de voluntariado y búsqueda en equipo
 * Interfaz para unirse a cuadrantes y marcar zonas inspeccionadas.
 */
import { api } from './index.js';

export const searchesService = {
  join: (caseId, zone) => api.searches.join(caseId, zone),
  myParticipations: () => api.searches.myParticipations(),
  markZoneInspected: (caseId, zone) => api.searches.markZoneInspected(caseId, zone),
  volunteers: (caseId) => api.searches.volunteers(caseId),
};
