/**
 * cases.js - Esqueleto del adaptador HTTP de casos y alertas
 * TODO(avance-2): Conectar con GET/POST /api/cases y PATCH /api/cases/:id/status.
 */
export const httpCasesAdapter = {
  async listActive(params) {
    // TODO(avance-2): GET /api/cases?lat=...&lng=...&radiusKm=...
    return [];
  },
  async get(id) {
    // TODO(avance-2): GET /api/cases/:id
    return null;
  },
  async create(data) {
    // TODO(avance-2): POST /api/cases
    return null;
  },
  async listMine() {
    // TODO(avance-2): GET /api/me/cases
    return [];
  },
  async approveDemo(id) {
    // TODO(avance-2): PATCH /api/cases/:id/status { status: 'active' }
    return null;
  },
  async markResolved(id) {
    // TODO(avance-2): PATCH /api/cases/:id/status { status: 'resolved' }
    return null;
  },
};
