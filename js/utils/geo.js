/**
 * geo.js - Utilidades geográficas y cálculo de distancias
 * Fórmula de Haversine y geolocalización con el centro de Lima como respaldo.
 */
import { CONFIG } from '../config.js';

/**
 * Calcula la distancia en kilómetros entre dos puntos (lat/lng) con la fórmula de Haversine
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Obtiene la ubicación del usuario mediante la API de Geolocalización del navegador.
 * Si el usuario deniega el permiso o falla, devuelve las coordenadas de Miraflores, Lima.
 */
export async function getCurrentUserPosition() {
  if (!navigator.geolocation) {
    return { ...CONFIG.LIMA_CENTER, isDefault: true };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isDefault: false,
        });
      },
      () => {
        // En caso de error o permiso denegado, usar centro de Lima
        resolve({ ...CONFIG.LIMA_CENTER, isDefault: true });
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  });
}
