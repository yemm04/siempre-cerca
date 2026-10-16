/**
 * admin.js - Esqueleto del adaptador HTTP del panel de administración
 * TODO(avance-2): todos los endpoints /api/admin/* exigen rol moderator/admin en el servidor.
 */
export const httpAdminAdapter = {
  async stats() { /* TODO(avance-2): GET /api/admin/stats */ return null; },
  async listCases(params) { /* TODO(avance-2): GET /api/admin/cases?status=&q= */ return []; },
  async reviewCase(id, body) { /* TODO(avance-2): PATCH /api/admin/cases/:id/review { decision, reason } */ return null; },
  async resolveCase(id) { /* TODO(avance-2): PATCH /api/admin/cases/:id/resolve */ return null; },
  async deleteCase(id) { /* TODO(avance-2): DELETE /api/admin/cases/:id */ return null; },
  async listUsers(params) { /* TODO(avance-2): GET /api/admin/users?status=&q= */ return []; },
  async setUserStatus(id, status, reason) { /* TODO(avance-2): PATCH /api/admin/users/:id/status */ return null; },
  async listSightings(params) { /* TODO(avance-2): GET /api/admin/sightings */ return []; },
  async setSightingStatus(id, status) { /* TODO(avance-2): PATCH /api/admin/sightings/:id/status */ return null; },
  async listAudit(limit) { /* TODO(avance-2): GET /api/admin/audit?limit= */ return []; },
  async resetDemo() { /* No existe en producción */ return false; },
};
