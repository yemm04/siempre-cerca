/**
 * cases.js - Adaptador local para gestión de alertas y casos
 * Almacena en sc:cases, calcula distancias reales y privacidad de datos sensibles.
 */
import { CONFIG } from '../../config.js';
import { getFromStorage, saveToStorage } from './storage.js';
import { haversineDistanceKm } from '../../utils/geo.js';
import { newId, getSession, requireSession, pushNotification } from './helpers.js';

export const localCasesAdapter = {
  /**
   * Lista casos activos filtrados por radio, tipo y búsqueda de texto
   */
  async listActive({ lat, lng, radiusKm = 10, type = null, q = '' } = {}) {
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const cleanQ = q.trim().toLowerCase();

    return cases
      .filter((c) => {
        // Solo casos activos o resueltos para el mapa
        if (c.status !== 'active' && c.status !== 'resolved') return false;

        // Filtro por categoría: "person" o "pet"
        if (type && type !== 'all' && c.type !== type) return false;

        // Filtro por término de búsqueda
        if (cleanQ) {
          const matchName = c.name?.toLowerCase().includes(cleanQ);
          const matchDesc = c.description?.toLowerCase().includes(cleanQ);
          const matchBreed = c.breedOrAge?.toLowerCase().includes(cleanQ);
          const matchRef = c.lastSeenText?.toLowerCase().includes(cleanQ);
          if (!matchName && !matchDesc && !matchBreed && !matchRef) return false;
        }

        return true;
      })
      .map((c) => {
        // Calcular distancia si se proporciona la ubicación del usuario
        let distanceKm = null;
        if (lat !== undefined && lng !== undefined && c.location?.coordinates) {
          const [caseLng, caseLat] = c.location.coordinates;
          distanceKm = haversineDistanceKm(lat, lng, caseLat, caseLng);
        }
        return {
          ...c,
          distanceKm,
        };
      })
      .filter((c) => {
        // Filtrar por radio si se calculó distancia
        if (c.distanceKm !== null && radiusKm > 0) {
          return c.distanceKm <= radiusKm;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  },

  /**
   * Obtiene el detalle de un caso por su ID
   */
  async get(id) {
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const session = getSession();
    const item = cases.find((c) => c._id === id);
    if (!item) return null;

    // TODO(avance-2): esta regla de privacidad pasa al servidor (el teléfono nunca debe salir de la API).
    // Privacidad: si el usuario no es el dueño, ocultar teléfono de contacto
    if (!session || session._id !== item.ownerId) {
      const sanitized = { ...item };
      delete sanitized.contactPhone;
      return sanitized;
    }
    return item;
  },

  /**
   * Crea una nueva alerta en estado "pending_review"
   */
  async create(data) {
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const session = requireSession();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const folio = `SC-0${randomNum}`;

    const newCase = {
      _id: newId('case'),
      folio,
      ownerId: session._id,
      ownerName: session.name,
      type: data.type || 'pet',
      name: data.name || 'Sin nombre',
      breedOrAge: data.breedOrAge || '',
      description: data.description || '',
      photo: data.photo || '',
      thumb: data.thumb || data.photo || '',
      // Formato GeoJSON: [longitud, latitud]
      location: {
        type: 'Point',
        coordinates: [data.lng || -77.0297, data.lat || -12.1211],
      },
      lastSeenText: data.lastSeenText || 'Miraflores, Lima',
      lastSeenAt: data.lastSeenAt || new Date().toISOString(),
      contactPhone: data.contactPhone || session.phone,
      relation: data.relation || 'owner',
      status: 'pending_review', // Requiere revisión de moderación
      volunteersCount: 0,
      searchQuadrants: { total: 4, checked: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    cases.unshift(newCase);
    saveToStorage(CONFIG.STORAGE_KEYS.CASES, cases);

    pushNotification({
      userId: newCase.ownerId,
      type: 'review',
      title: 'Tu alerta está en revisión',
      body: `Validaremos el reporte ${newCase.folio} lo antes posible.`,
      caseId: newCase._id,
    });

    return newCase;
  },

  /**
   * Lista las alertas creadas por el usuario en sesión
   */
  async listMine() {
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const session = getSession();
    if (!session) return [];
    return cases.filter((c) => c.ownerId === session._id);
  },

  /**
   * Simula la aprobación del moderador (solo demo)
   * Pasa el caso a estado "active" para mostrarlo en el mapa de Inicio.
   */
  // TEMPORAL: en el avance local se aprueba manualmente para probar
  // TODO(avance-2): La moderación se realizará desde un endpoint en el backend
  async approveDemo(id) {
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const index = cases.findIndex((c) => c._id === id);
    if (index === -1) throw new Error('Caso no encontrado');

    cases[index].status = 'active';
    cases[index].updatedAt = new Date().toISOString();
    saveToStorage(CONFIG.STORAGE_KEYS.CASES, cases);

    pushNotification({
      userId: cases[index].ownerId,
      type: 'nearby',
      title: `¡Tu alerta de ${cases[index].name} ha sido aprobada!`,
      body: `Tu alerta ${cases[index].folio} ya es visible en el mapa para la comunidad.`,
      caseId: cases[index]._id,
    });

    return cases[index];
  },

  /**
   * Marca un caso como resuelto (encontrado)
   */
  async markResolved(id) {
    const cases = getFromStorage(CONFIG.STORAGE_KEYS.CASES, []);
    const index = cases.findIndex((c) => c._id === id);
    if (index === -1) throw new Error('Caso no encontrado');

    cases[index].status = 'resolved';
    cases[index].resolvedAt = new Date().toISOString();
    cases[index].updatedAt = new Date().toISOString();
    saveToStorage(CONFIG.STORAGE_KEYS.CASES, cases);

    pushNotification({
      userId: cases[index].ownerId,
      type: 'resolved',
      title: `¡${cases[index].name} está de vuelta en casa!`,
      body: 'La comunidad volvió a hacerlo posible. Gracias a todos los voluntarios.',
      caseId: cases[index]._id,
    });

    return cases[index];
  },
};
