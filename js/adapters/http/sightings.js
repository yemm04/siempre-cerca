/**
 * sightings.js - Esqueleto del adaptador HTTP de avistamientos
 * TODO(avance-2): Conectar con POST /api/cases/:id/sightings y GET /api/me/sightings.
 */
export const httpSightingsAdapter = {
  async create(caseId, data) {
    // TODO(avance-2): POST /api/cases/:id/sightings
    return null;
  },
  async listMine() {
    // TODO(avance-2): GET /api/me/sightings
    return [];
  },
  async listForCase(caseId) {
    // TODO(avance-2): GET /api/cases/:id/sightings
    return [];
  },
};
