/**
 * searches.js - Esqueleto del adaptador HTTP de búsquedas
 * TODO(avance-2): Conectar con POST /api/cases/:id/join y GET /api/me/participations.
 */
export const httpSearchesAdapter = {
  async join(caseId, zone) {
    // TODO(avance-2): POST /api/cases/:id/join
    return null;
  },
  async myParticipations() {
    // TODO(avance-2): GET /api/me/participations
    return [];
  },
  async markZoneInspected(caseId, zone) {
    // TODO(avance-2): PATCH /api/cases/:id/quadrants
    return null;
  },
  async volunteers(caseId) {
    // TODO(avance-2): GET /api/cases/:id/volunteers
    return [];
  },
};
