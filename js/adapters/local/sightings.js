/**
 * sightings.js - Adaptador local para reportes de avistamientos
 * Almacena en sc:sightings y vincula alertas con notificaciones de pistas.
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage } from './storage.js';
import { newId, getSession, requireSession, pushNotification } from './helpers.js';

export const localSightingsAdapter = {
  /**
   * Registra un nuevo avistamiento vinculado a un caso
   */
  async create(caseId, data) {
    const sightings = getFromStorage(CONFIG.STORAGE_KEYS.SIGHTINGS, []);
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const session = requireSession();

    const relatedCase = cases.find((c) => c._id === caseId);

    const newSighting = {
      _id: newId('sigt'),
      caseId,
      name: relatedCase ? relatedCase.name : 'Caso',
      img: relatedCase ? relatedCase.thumb || relatedCase.photo : '',
      reporterId: session._id,
      where: data.where || 'Miraflores, Lima',
      note: data.note || '',
      hasPhoto: Boolean(data.photo),
      photo: data.photo || null,
      status: 'received',
      location: {
        type: 'Point',
        coordinates: [data.lng || -77.0345, data.lat || -12.1185],
      },
      stillThere: data.stillThere || 'yes',
      createdAt: new Date().toISOString(),
    };

    sightings.unshift(newSighting);
    saveToStorage(CONFIG.STORAGE_KEYS.SIGHTINGS, sightings);

    // Notificar al dueño del caso sobre un nuevo avistamiento
    if (relatedCase) {
      pushNotification({
        userId: relatedCase.ownerId,
        type: 'sighting',
        title: `Posible pista sobre ${relatedCase.name}`,
        body: `Un vecino envió un avistamiento cerca de ${newSighting.where}.`,
        caseId: relatedCase._id,
      });
    }

    return newSighting;
  },

  /**
   * Lista los avistamientos reportados por el usuario actual
   */
  async listMine() {
    const sightings = getFromStorage(CONFIG.STORAGE_KEYS.SIGHTINGS, []);
    const session = getSession();
    if (!session) return [];
    return sightings.filter((s) => s.reporterId === session._id);
  },

  /**
   * Lista los avistamientos asociados a un caso específico
   */
  async listForCase(caseId) {
    const sightings = getFromStorage(CONFIG.STORAGE_KEYS.SIGHTINGS, []);
    return sightings.filter((s) => s.caseId === caseId);
  },
};
