/**
 * map.js - Componente de mapa interactivo con Leaflet y OpenStreetMap
 * Centrado en Lima y restringido a Perú según docs/LOCALIZACION_PERU.md.
 */
import { CONFIG } from '../config.js';

export function createCasePinHtml(photoUrl, isResolved = false) {
  const kind = isResolved ? 'resolved' : '';
  const img = photoUrl || 'https://images.unsplash.com/photo-1714247084434-49bbc3ebf577?w=100';
  return `
    <div class="case-pin ${kind}" style="position: relative; width: 48px; height: 48px; cursor: pointer;">
      <img src="${img}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 2px solid #fff; transform: rotate(45deg);" />
      <span></span>
    </div>
  `;
}

/**
 * Inicializa un mapa Leaflet en un elemento contenedor
 */
export function initLeafletMap(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Si Leaflet (L) no está disponible en window (ej. sin internet), devolver null
  if (typeof window.L === 'undefined') {
    console.warn('Leaflet no está cargado. Se utilizará mapa esquemático de respaldo.');
    return null;
  }

  const center = options.center || [CONFIG.LIMA_CENTER.lat, CONFIG.LIMA_CENTER.lng];
  const zoom = options.zoom || CONFIG.DEFAULT_ZOOM;

  const map = window.L.map(containerId, {
    center,
    zoom,
    minZoom: CONFIG.MIN_ZOOM,
    maxZoom: CONFIG.MAX_ZOOM,
    maxBounds: CONFIG.PERU_BOUNDS,
    zoomControl: false,
    attributionControl: true,
  });

  // Capa oficial de OpenStreetMap con atribución obligatoria
  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

/**
 * Añade pines de casos al mapa con divIcon
 */
export function addCasePinsToMap(map, cases, onPinClick) {
  if (!map || typeof window.L === 'undefined') return [];

  const markers = [];
  cases.forEach((c) => {
    if (!c.location || !c.location.coordinates) return;
    const [lng, lat] = c.location.coordinates;
    const isResolved = c.status === 'resolved';

    const customIcon = window.L.divIcon({
      html: createCasePinHtml(c.thumb || c.photo, isResolved),
      className: 'custom-leaflet-pin',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });

    const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);

    if (typeof onPinClick === 'function') {
      marker.on('click', () => onPinClick(c));
    }
    markers.push(marker);
  });

  return markers;
}

/**
 * Inicializa un selector de ubicación interactivo para la creación de alertas
 */
export function initLocationPickerMap(containerId, initialCoords, onChange) {
  const map = initLeafletMap(containerId, {
    center: [initialCoords.lat, initialCoords.lng],
    zoom: 15,
  });
  if (!map) return null;

  // Actualizar coordenadas al mover el mapa
  map.on('move', () => {
    const center = map.getCenter();
    if (typeof onChange === 'function') {
      onChange({ lat: center.lat, lng: center.lng });
    }
  });

  return map;
}
