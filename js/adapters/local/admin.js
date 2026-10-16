/**
 * admin.js - Adaptador local del panel de administración (Avance 1)
 * Moderación de alertas, usuarios y avistamientos sobre localStorage.
 * TODO(avance-2): cada método pasa a un endpoint /api/admin/* protegido por rol.
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage, resetDemoData } from './storage.js';
import { requireStaff, logAudit, pushNotification } from './helpers.js';

const K = CONFIG.STORAGE_KEYS;
const matches = (q, ...fields) => {
  const text = q.trim().toLowerCase();
  return !text || fields.some((f) => String(f ?? '').toLowerCase().includes(text));
};
const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

/** Quita datos privados antes de mostrar un usuario */
function publicUser(u, cases, sightings) {
  const { passwordHash, ...rest } = u;
  return {
    ...rest,
    casesCount: cases.filter((c) => c.ownerId === u._id).length,
    sightingsCount: sightings.filter((s) => s.reporterId === u._id).length,
  };
}

export const localAdminAdapter = {
  /** Números del panel de resumen */
  async stats() {
    requireStaff();
    const users = getFromStorage(K.USERS, []);
    const cases = getFromStorage(K.CASES, []);
    const sightings = getFromStorage(K.SIGHTINGS, []);
    const count = (list, fn) => list.filter(fn).length;
    const byStatus = {
      active: count(cases, (c) => c.status === 'active'),
      pending_review: count(cases, (c) => c.status === 'pending_review'),
      resolved: count(cases, (c) => c.status === 'resolved'),
      rejected: count(cases, (c) => c.status === 'rejected'),
    };

    // Alertas creadas en los últimos 7 días
    const last7 = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 86400000);
      const key = dayKey(d.toISOString());
      last7.push({ date: key, count: count(cases, (c) => dayKey(c.createdAt) === key) });
    }

    const decided = byStatus.active + byStatus.resolved;
    return {
      users: { total: users.length, banned: count(users, (u) => u.status === 'banned') },
      cases: { total: cases.length, ...byStatus },
      byType: {
        person: count(cases, (c) => c.type === 'person'),
        pet: count(cases, (c) => c.type === 'pet'),
      },
      sightings: { total: sightings.length, received: count(sightings, (s) => s.status === 'received') },
      resolutionRate: decided ? Math.round((byStatus.resolved / decided) * 100) : 0,
      last7,
    };
  },

  /** Alertas con filtros; las pendientes salen primero */
  async listCases({ status = 'all', q = '' } = {}) {
    requireStaff();
    const order = { pending_review: 0, active: 1, resolved: 2, rejected: 3 };
    return getFromStorage(K.CASES, [])
      .filter((c) => (status === 'all' || c.status === status) && matches(q, c.name, c.folio, c.ownerName, c.lastSeenText))
      .sort((a, b) => (order[a.status] - order[b.status]) || (new Date(b.createdAt) - new Date(a.createdAt)));
  },

  /** decision: 'approve' | 'reject' */
  async reviewCase(id, { decision, reason = '' }) {
    requireStaff();
    const cases = getFromStorage(K.CASES, []);
    const item = cases.find((c) => c._id === id);
    if (!item) throw new Error('Caso no encontrado');
    const now = new Date().toISOString();

    if (decision === 'approve') {
      item.status = 'active';
      item.approvedAt = now;
      delete item.rejectionReason;
      pushNotification({
        userId: item.ownerId, type: 'nearby', caseId: item._id,
        title: `¡Tu alerta de ${item.name} fue aprobada!`,
        body: `Tu alerta ${item.folio} ya es visible en el mapa para la comunidad.`,
      });
    } else {
      item.status = 'rejected';
      item.rejectionReason = reason || 'No cumple con las normas de la comunidad.';
      pushNotification({
        userId: item.ownerId, type: 'review', caseId: item._id,
        title: `Tu alerta de ${item.name} no fue aprobada`,
        body: item.rejectionReason,
      });
    }
    item.updatedAt = now;
    saveToStorage(K.CASES, cases);
    logAudit({
      action: decision === 'approve' ? 'case_approved' : 'case_rejected',
      targetType: 'case', targetId: item._id, targetLabel: `${item.name} (${item.folio})`,
      detail: decision === 'approve' ? '' : item.rejectionReason,
    });
    return item;
  },

  async resolveCase(id) {
    requireStaff();
    const cases = getFromStorage(K.CASES, []);
    const item = cases.find((c) => c._id === id);
    if (!item) throw new Error('Caso no encontrado');
    item.status = 'resolved';
    item.resolvedAt = new Date().toISOString();
    item.updatedAt = item.resolvedAt;
    saveToStorage(K.CASES, cases);
    logAudit({ action: 'case_resolved', targetType: 'case', targetId: id, targetLabel: `${item.name} (${item.folio})` });
    return item;
  },

  /** Borra la alerta y lo que depende de ella (avistamientos y participaciones) */
  async deleteCase(id) {
    requireStaff();
    const cases = getFromStorage(K.CASES, []);
    const item = cases.find((c) => c._id === id);
    if (!item) throw new Error('Caso no encontrado');
    saveToStorage(K.CASES, cases.filter((c) => c._id !== id));
    saveToStorage(K.SIGHTINGS, getFromStorage(K.SIGHTINGS, []).filter((s) => s.caseId !== id));
    saveToStorage(K.PARTICIPATIONS, getFromStorage(K.PARTICIPATIONS, []).filter((p) => p.caseId !== id));
    logAudit({ action: 'case_deleted', targetType: 'case', targetId: id, targetLabel: `${item.name} (${item.folio})` });
    return true;
  },

  async listUsers({ status = 'all', q = '' } = {}) {
    requireStaff();
    const cases = getFromStorage(K.CASES, []);
    const sightings = getFromStorage(K.SIGHTINGS, []);
    return getFromStorage(K.USERS, [])
      .filter((u) => (status === 'all' || u.status === status) && matches(q, u.name, u.username, u.email, u.phone))
      .map((u) => publicUser(u, cases, sightings))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /** Suspender (banned) o reactivar (active). Al suspender se retiran sus alertas abiertas. */
  async setUserStatus(id, status, reason = '') {
    const staff = requireStaff();
    const users = getFromStorage(K.USERS, []);
    const user = users.find((u) => u._id === id);
    if (!user) throw new Error('Usuario no encontrado');
    if (user._id === staff._id) throw new Error('No puedes suspender tu propia cuenta.');
    if (CONFIG.STAFF_ROLES.includes(user.role)) throw new Error('No se puede suspender a otro miembro del equipo.');

    user.status = status;
    if (status === 'banned') {
      user.banReason = reason || 'Incumplimiento de las normas de la comunidad.';
      user.bannedAt = new Date().toISOString();
      const cases = getFromStorage(K.CASES, []);
      cases.forEach((c) => {
        if (c.ownerId === id && (c.status === 'active' || c.status === 'pending_review')) {
          c.status = 'rejected';
          c.rejectionReason = 'Cuenta suspendida.';
          c.updatedAt = new Date().toISOString();
        }
      });
      saveToStorage(K.CASES, cases);
    } else {
      delete user.banReason;
      delete user.bannedAt;
    }
    saveToStorage(K.USERS, users);
    logAudit({
      action: status === 'banned' ? 'user_banned' : 'user_unbanned',
      targetType: 'user', targetId: id, targetLabel: `@${user.username}`, detail: status === 'banned' ? user.banReason : '',
    });
    return publicUser(user, getFromStorage(K.CASES, []), getFromStorage(K.SIGHTINGS, []));
  },

  async listSightings({ status = 'all', q = '' } = {}) {
    requireStaff();
    const users = getFromStorage(K.USERS, []);
    return getFromStorage(K.SIGHTINGS, [])
      .filter((s) => (status === 'all' || s.status === status) && matches(q, s.name, s.where, s.note))
      .map((s) => ({ ...s, reporterName: users.find((u) => u._id === s.reporterId)?.name || 'Usuario' }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /** status: 'received' | 'confirmed' | 'helped' */
  async setSightingStatus(id, status) {
    requireStaff();
    const sightings = getFromStorage(K.SIGHTINGS, []);
    const item = sightings.find((s) => s._id === id);
    if (!item) throw new Error('Avistamiento no encontrado');
    item.status = status;
    saveToStorage(K.SIGHTINGS, sightings);
    logAudit({ action: 'sighting_status', targetType: 'sighting', targetId: id, targetLabel: item.name, detail: status });
    return item;
  },

  async listAudit(limit = 12) {
    requireStaff();
    return getFromStorage(K.AUDIT, []).slice(0, limit);
  },

  /** TEMPORAL: solo existe en modo demostración */
  async resetDemo() {
    requireStaff();
    resetDemoData();
    return true;
  },
};
