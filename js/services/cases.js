/**
 * cases.js - Servicio de casos y alertas comunitarias
 * Interfaz utilizada por las pantallas para listar, crear y actualizar alertas.
 */
import { api } from './index.js';

export const casesService = {
  listActive: (params) => api.cases.listActive(params),
  get: (id) => api.cases.get(id),
  create: (data) => api.cases.create(data),
  listMine: () => api.cases.listMine(),
  approveDemo: (id) => api.cases.approveDemo(id),
  markResolved: (id) => api.cases.markResolved(id),
};
