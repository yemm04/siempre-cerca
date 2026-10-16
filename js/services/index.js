/**
 * index.js - Selección central de adaptador de datos
 * Conmuta entre almacenamiento local (Avance 1) y API HTTP (Avance 2) según CONFIG.USE_API.
 */
import { CONFIG } from '../config.js';
import { localAdapter } from '../adapters/local/index.js';
import { httpAdapter } from '../adapters/http/index.js';

// El adaptador se elige en este único punto del sistema
export const api = CONFIG.USE_API ? httpAdapter : localAdapter;

// Inicializar datos seed en modo local
if (!CONFIG.USE_API && typeof api.initialize === 'function') {
  api.initialize();
}
