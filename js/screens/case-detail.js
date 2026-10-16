/**
 * case-detail.js - Detalle completo del caso (12-detalle-caso.png)
 * Mapa con zonas de búsqueda, fotos, distancia, equipo de voluntarios y acciones.
 */
import { renderIcon } from '../ui/icons.js';
import { formatDistance, formatRelativeTime } from '../utils/format.js';
import { haversineDistanceKm } from '../utils/geo.js';
import { casesService } from '../services/cases.js';
import { appState } from '../state.js';
import { initLeafletMap } from '../ui/map.js';
import { showToast } from '../ui/toast.js';

export function render(params) {
  return `
    <div class="screen case-detail desktop-case" id="case-detail-root">
      <div style="text-align: center; padding: 50px 0; color: var(--muted);">Cargando caso...</div>
    </div>
  `;
}

export function mount(root, params) {
  const container = root.querySelector('#case-detail-root');
  const caseId = params?.id || 'case_bruno_01';
  const session = appState.getSession();
  const userLoc = appState.getLocation();

  const loadCase = async () => {
    try {
      const caseItem = await casesService.get(caseId);
      if (!caseItem) {
        container.innerHTML = `
          <div class="padded">
            <button type="button" class="back" onclick="window.location.hash='#/inicio'">
              ${renderIcon('arrow')} Volver
            </button>
            <p style="margin-top: 40px; text-align: center; color: var(--muted);">Caso no encontrado</p>
          </div>
        `;
        return;
      }

      const isOwner = session && session._id === caseItem.ownerId;
      let distKm = 1.2;
      if (caseItem.location?.coordinates && userLoc) {
        const [cLng, cLat] = caseItem.location.coordinates;
        distKm = haversineDistanceKm(userLoc.lat, userLoc.lng, cLat, cLng);
      }

      const distText = formatDistance(distKm);
      const timeAgo = formatRelativeTime(caseItem.createdAt).toUpperCase();

      container.innerHTML = `
        <!-- Mapa detallado con zonas -->
        <div id="detail-map" class="map detailed">
          <div class="river"></div>
          <div class="park park-a"></div>
          <span class="road h h1"></span>
          <span class="road v v1"></span>
          <div class="zone searched">Zona revisada ✓</div>
          <div class="zone pending">Pendiente</div>
        </div>

        <!-- Cabecera flotante -->
        <header class="overlay-header">
          <button type="button" id="btn-detail-back" aria-label="Volver">
            ${renderIcon('arrow')}
          </button>
          <span>Detalle del caso</span>
          <button type="button" id="btn-detail-share" aria-label="Compartir">
            ${renderIcon('share')}
          </button>
        </header>

        <!-- Hoja de información -->
        <section class="detail-sheet">
          <div class="handle"></div>

          <div class="hero-photo">
            <img src="${caseItem.photo || caseItem.thumb}" alt="${caseItem.name}" />
            <span>1 / 1</span>
          </div>

          <div class="case-heading">
            <div>
              <span class="status ${caseItem.status === 'resolved' ? 'resolved' : ''}">
                ${caseItem.status === 'resolved' ? 'RESUELTO' : 'ACTIVO'} · HACE ${timeAgo}
              </span>
              <h1>${caseItem.name}</h1>
              <p>${caseItem.breedOrAge || ''}</p>
            </div>
            <div class="distance">
              ${renderIcon('location')}
              <b>${distText}</b>
              <span>de ti</span>
            </div>
          </div>

          <div class="detail-facts">
            <span>
              <small>Visto por última vez</small>
              <b>${caseItem.lastSeenText || 'Miraflores, Lima'}</b>
            </span>
            <span>
              <small>Cuándo</small>
              <b>${formatRelativeTime(caseItem.lastSeenAt || caseItem.createdAt)}</b>
            </span>
          </div>

          <p class="description">${caseItem.description || ''}</p>

          <button type="button" class="volunteer-banner" id="btn-banner-volunteers">
            <div class="volunteer-faces">
              <span>AM</span><span>JR</span><span>+8</span>
            </div>
            <div>
              <b>${caseItem.volunteersCount || 10} personas buscando ahora</b>
              <small>Únete a la búsqueda en tu zona</small>
            </div>
            ${renderIcon('chevron')}
          </button>

          ${
            isOwner && caseItem.status !== 'resolved'
              ? `
            <div style="margin-top: 14px;">
              <button type="button" class="button outline" id="btn-mark-resolved" style="color: var(--green); border-color: var(--green);">
                ✓ Marcar este caso como resuelto
              </button>
            </div>
          `
              : ''
          }
        </section>

        <!-- Barra inferior de acciones -->
        <footer class="action-bar">
          <button type="button" class="button alert" id="btn-action-sighting">
            ${renderIcon('location')} Enviar avistamiento
          </button>
          <button type="button" class="button primary" id="btn-action-join">
            ${renderIcon('group')} Unirme
          </button>
          <button type="button" class="share-button" id="btn-action-share">
            ${renderIcon('share')}
            <span>Compartir</span>
          </button>
        </footer>
      `;

      // Inicializar Leaflet si es posible
      try {
        if (caseItem.location?.coordinates) {
          const [lng, lat] = caseItem.location.coordinates;
          initLeafletMap('detail-map', { center: [lat, lng], zoom: 15 });
        }
      } catch (e) {
        console.warn('Error inicializando mapa de detalle:', e);
      }

      // Eventos
      container.querySelector('#btn-detail-back')?.addEventListener('click', () => {
        window.location.hash = '#/inicio';
      });

      const handleShare = () => {
        if (navigator.share) {
          navigator.share({
            title: `Alerta: ${caseItem.name} en Siempre Cerca`,
            text: `Ayúdanos a encontrar a ${caseItem.name}. Visto por última vez en ${caseItem.lastSeenText}.`,
            url: window.location.href,
          }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(window.location.href);
          showToast('Enlace copiado al portapapeles', 'info');
        }
      };

      container.querySelector('#btn-detail-share')?.addEventListener('click', handleShare);
      container.querySelector('#btn-action-share')?.addEventListener('click', handleShare);

      container.querySelector('#btn-banner-volunteers')?.addEventListener('click', () => {
        window.location.hash = `#/caso/${caseId}/busqueda`;
      });

      container.querySelector('#btn-action-join')?.addEventListener('click', () => {
        window.location.hash = `#/caso/${caseId}/busqueda`;
      });

      container.querySelector('#btn-action-sighting')?.addEventListener('click', () => {
        window.location.hash = `#/caso/${caseId}/avistamiento`;
      });

      container.querySelector('#btn-mark-resolved')?.addEventListener('click', async () => {
        try {
          await casesService.markResolved(caseId);
          showToast('¡Caso marcado como resuelto!', 'success');
          window.location.hash = `#/resuelto/${caseId}`;
        } catch (err) {
          showToast(err.message || 'Error al resolver', 'error');
        }
      });
    } catch (err) {
      console.error('Error cargando detalle de caso:', err);
    }
  };

  loadCase();
}
