/**
 * format.js - Formato de fechas, distancias, texto e iniciales
 * Adaptado a la localización de Lima, Perú (es-PE) y prevención XSS.
 */

/**
 * Escapa caracteres HTML para evitar inyección XSS
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extrae hasta 2 iniciales en mayúsculas a partir de un nombre
 */
export function initials(name) {
  if (!name || typeof name !== 'string') return 'U';
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'U'
  );
}

/**
 * Formatea una fecha ISO a dd/MM/yyyy en español (Perú)
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima',
  });
}

/**
 * Formatea hora en formato 12 horas (ej. 5:30 pm)
 */
export function formatTime(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-PE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Lima',
  });
}

/**
 * Formato relativo amigable (ej. "Hace 45 min", "Ayer, 8:12 pm")
 */
export function formatRelativeTime(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffHours < 48) return `Ayer, ${formatTime(isoDate)}`;
  return formatDate(isoDate);
}

/**
 * Formato de distancia en km o m
 */
export function formatDistance(km) {
  if (km === undefined || km === null || isNaN(km)) return '';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Devuelve 'HOY', 'AYER' o 'ANTES' según la fecha (zona horaria de Lima).
 * Se calcula al mostrar: la base de datos solo guarda createdAt.
 */
export function dayGroupOf(isoDate) {
  const fmt = (d) => d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return 'ANTES';
  const today = fmt(new Date());
  if (fmt(d) === today) return 'HOY';
  if (fmt(d) === fmt(new Date(Date.now() - 86400000))) return 'AYER';
  return 'ANTES';
}

/** Texto y color del estado de un avistamiento (la base solo guarda el código) */
export function sightingStatusInfo(status) {
  const map = {
    received: { text: 'Recibido', tone: 'ochre' },
    confirmed: { text: 'Confirmado', tone: 'green' },
    helped: { text: 'Ayudó a encontrarla', tone: 'green' },
  };
  return map[status] || map.received;
}

/** Fecha y hora legibles: "Hoy, 6:10 pm", "Ayer, 7:40 pm" o "24/05/2026, 7:40 pm" */
export function formatWhen(isoDate) {
  const group = dayGroupOf(isoDate);
  const time = formatTime(isoDate);
  if (group === 'HOY') return `Hoy, ${time}`;
  if (group === 'AYER') return `Ayer, ${time}`;
  return `${formatDate(isoDate)}, ${time}`;
}
