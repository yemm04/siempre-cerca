/**
 * admin.js - Servicio del panel de administración
 * Solo lo usan las pantallas de js/screens/admin/. Requiere rol moderator o admin.
 */
import { api } from './index.js';

export const adminService = {
  stats: () => api.admin.stats(),
  listCases: (params) => api.admin.listCases(params),
  reviewCase: (id, body) => api.admin.reviewCase(id, body),
  resolveCase: (id) => api.admin.resolveCase(id),
  deleteCase: (id) => api.admin.deleteCase(id),
  listUsers: (params) => api.admin.listUsers(params),
  setUserStatus: (id, status, reason) => api.admin.setUserStatus(id, status, reason),
  listSightings: (params) => api.admin.listSightings(params),
  setSightingStatus: (id, status) => api.admin.setSightingStatus(id, status),
  listAudit: (limit) => api.admin.listAudit(limit),
  resetDemo: () => api.admin.resetDemo(),
};
