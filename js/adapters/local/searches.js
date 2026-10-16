/**
 * searches.js - Adaptador local para búsquedas en equipo y cuadrantes
 * Almacena en sc:participations y gestiona inspección comunitaria de zonas.
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage } from './storage.js';
import { newId, getSession, requireSession } from './helpers.js';

export const localSearchesAdapter = {
  /**
   * Unirse al equipo de búsqueda de un caso
   */
  async join(caseId, zone = 'A2') {
    const participations = getFromStorage(CONFIG.STORAGE_KEYS.PARTICIPATIONS, []);
    const session = requireSession();

    const existing = participations.find(
      (p) => p.caseId === caseId && p.userId === session._id
    );
    if (existing) return existing;

    const newParticipation = {
      _id: newId('part'),
      caseId,
      userId: session._id,
      userName: session.name,
      zone,
      inspected: false,
      joinedAt: new Date().toISOString(),
    };

    participations.push(newParticipation);
    saveToStorage(CONFIG.STORAGE_KEYS.PARTICIPATIONS, participations);

    // Incrementar conteo de voluntarios en el caso
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const caseIndex = cases.findIndex((c) => c._id === caseId);
    if (caseIndex !== -1) {
      cases[caseIndex].volunteersCount = (cases[caseIndex].volunteersCount || 0) + 1;
      saveToStorage(CONFIG.STORAGE_KEYS.CASES, cases);
    }

    return newParticipation;
  },

  /**
   * Lista las búsquedas en las que participa el usuario en sesión
   */
  async myParticipations() {
    const participations = getFromStorage(CONFIG.STORAGE_KEYS.PARTICIPATIONS, []);
    const session = getSession();
    if (!session) return [];
    return participations.filter((p) => p.userId === session._id);
  },

  /**
   * Alterna o marca una zona como inspeccionada
   */
  async markZoneInspected(caseId, zone) {
    const participations = getFromStorage(CONFIG.STORAGE_KEYS.PARTICIPATIONS, []);
    const session = requireSession();

    let part = participations.find(
      (p) => p.caseId === caseId && p.userId === session._id
    );

    if (!part) {
      // Si no se había unido formalmente, lo unimos
      part = await this.join(caseId, zone || 'A2');
    }

    const index = participations.findIndex((p) => p._id === part._id);
    participations[index].inspected = !participations[index].inspected;
    saveToStorage(CONFIG.STORAGE_KEYS.PARTICIPATIONS, participations);

    return participations[index];
  },

  /**
   * Obtiene la lista de voluntarios activos para un caso
   */
  async volunteers(caseId) {
    const participations = getFromStorage(CONFIG.STORAGE_KEYS.PARTICIPATIONS, []);
    const forCase = participations.filter((p) => p.caseId === caseId);

    // TEMPORAL: voluntarios de ejemplo para que la pantalla no se vea vacía.
    // TODO(avance-2): GET /api/cases/:id/volunteers devuelve solo voluntarios reales.
    return [
      { initials: 'AM', name: 'Ana M.', area: 'Cuadrante A2', color: 'sage' },
      { initials: 'JR', name: 'Jorge R.', area: 'Cuadrante B1', color: 'ochre' },
      { initials: 'LP', name: 'Lucía P.', area: 'Sin asignar', color: 'beige' },
      ...forCase.map((p) => ({
        initials: p.userName ? p.userName.slice(0, 2).toUpperCase() : 'VO',
        name: p.userName || 'Voluntario',
        area: `Cuadrante ${p.zone}`,
        color: 'sage',
      })),
    ];
  },
};
