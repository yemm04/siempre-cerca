/**
 * home.js - Pantalla principal de inicio con mapa y casos cercanos (06-inicio.png)
 * Muestra Leaflet con OpenStreetMap, pines con foto, filtros y panel de casos cercanos.
 */
import { renderIcon } from '../ui/icons.js';
import { renderNav, mountNavEvents } from '../ui/nav.js';
import { initials, formatDistance, formatRelativeTime } from '../utils/format.js';
import { casesService } from '../services/cases.js';
import { appState } from '../state.js';
import { initLeafletMap, addCasePinsToMap } from '../ui/map.js';

export function render() {
  const session = appState.getSession();
  const userName = session ? session.name : 'Usuario';
  const userInitials = initials(userName);

  return `
    <div class="screen home-screen desktop-home">
      <!-- Contenedor del Mapa Leaflet -->
      <div id="home-map" class="map">
        <!-- Respaldo visual en caso de no contar con conexión a tiles OSM -->
        <div class="river"></div>
        <div class="park park-a"></div>
        <div class="park park-b"></div>
        <span class="road h h1"></span>
        <span class="road h h2"></span>
        <span class="road h h3"></span>
        <span class="road v v1"></span>
        <span class="road v v2"></span>
        <div class="map-label l1">PARQUE KENNEDY</div>
        <div class="map-label l2">MIRAFLORES</div>
      </div>

      <!-- Cabecera flotante sobre el mapa -->
      <header class="map-header">
        <div class="top-row">
          <button type="button" class="avatar" id="btn-top-profile" aria-label="Mi perfil">
            ${userInitials}
          </button>
          <div>
            <small>Tu ubicación</small>
            <b>Miraflores, Lima ⌄</b>
          </div>
          <button type="button" class="round" id="btn-top-notif" aria-label="Notificaciones">
            ${renderIcon('bell')}
            <i></i>
          </button>
        </div>

        <div class="search">
          ${renderIcon('search')}
          <input type="text" id="search-input" placeholder="Buscar personas o mascotas..." />
        </div>

        <div class="pills" role="tablist">
          <button type="button" class="active" data-filter="all">Todos</button>
          <button type="button" data-filter="person">Personas</button>
          <button type="button" data-filter="pet">Mascotas</button>
        </div>
      </header>

      <!-- Botón de centrado en mi ubicación -->
      <button type="button" class="locate" id="btn-locate" aria-label="Centrar en mi ubicación">
        ${renderIcon('location')}
      </button>

      <!-- Hoja inferior de casos cerca de ti -->
      <section class="bottom-sheet" id="cases-sheet">
        <div class="handle"></div>
        <div class="sheet-title">
          <div>
            <h2>Casos cerca de ti</h2>
            <p id="cases-count-label">Cargando alertas cercanas...</p>
          </div>
          <button type="button" id="btn-see-all">Ver todos</button>
        </div>
        <div id="cases-list-container">
          <!-- Tarjetas renderizadas dinámicamente -->
        </div>
      </section>

      <!-- Botón flotante para crear alerta -->
      <button type="button" class="button alert" id="btn-floating-create">
        <span class="plus">+</span> Crear alerta
      </button>

      <!-- Barra de navegación inferior -->
      ${renderNav('home')}
    </div>
  `;
}

export function mount(root) {
  mountNavEvents(root);

  const searchInput = root.querySelector('#search-input');
  const filterPills = root.querySelectorAll('.pills button');
  const countLabel = root.querySelector('#cases-count-label');
  const listContainer = root.querySelector('#cases-list-container');
  const locateBtn = root.querySelector('#btn-locate');

  let currentFilter = 'all';
  let searchQuery = '';
  let leafletMap = null;
  let activeMarkers = [];

  const location = appState.getLocation();

  // Inicializar Leaflet centrado en Lima (Miraflores)
  try {
    leafletMap = initLeafletMap('home-map', {
      center: [location.lat, location.lng],
      zoom: 14,
    });
  } catch (e) {
    console.warn('Error inicializando mapa:', e);
  }

  const loadAndRenderCases = async () => {
    try {
      const cases = await casesService.listActive({
        lat: location.lat,
        lng: location.lng,
        radiusKm: 15,
        type: currentFilter,
        q: searchQuery,
      });

      // Actualizar conteo
      const activeCount = cases.filter((c) => c.status === 'active').length;
      if (countLabel) {
        countLabel.textContent = `${activeCount} activos en un radio de 5 km`;
      }

      // Renderizar tarjetas
      if (listContainer) {
        if (cases.length === 0) {
          listContainer.innerHTML = `
            <p style="text-align: center; color: var(--muted); font-size: 12px; padding: 24px 0;">
              No se encontraron alertas en esta zona con los filtros seleccionados.
            </p>
          `;
        } else {
          listContainer.innerHTML = cases
            .map((c) => {
              const distText = c.distanceKm !== null ? `A ${formatDistance(c.distanceKm)} de ti` : 'Cerca de ti';
              const timeText = formatRelativeTime(c.createdAt).toUpperCase();
              return `
                <button type="button" class="case-card" data-case-id="${c._id}">
                  <img src="${c.thumb || c.photo || ''}" alt="${c.name}" />
                  <div>
                    <span class="status ${c.status === 'resolved' ? 'resolved' : ''}">
                      ${c.status === 'resolved' ? 'RESUELTO' : 'ACTIVO'} · ${timeText}
                    </span>
                    <h3>${c.name}</h3>
                    <p>${c.breedOrAge || ''} · ${c.lastSeenText || ''}</p>
                    <b>${renderIcon('location', 14)} ${distText}</b>
                  </div>
                  ${renderIcon('chevron')}
                </button>
              `;
            })
            .join('');

          // Click en tarjeta para ver detalle
          listContainer.querySelectorAll('[data-case-id]').forEach((btn) => {
            btn.addEventListener('click', () => {
              const id = btn.dataset.caseId;
              window.location.hash = `#/caso/${id}`;
            });
          });
        }
      }

      // Actualizar pines en Leaflet
      if (leafletMap) {
        activeMarkers.forEach((m) => m.remove());
        activeMarkers = addCasePinsToMap(leafletMap, cases, (clickedCase) => {
          window.location.hash = `#/caso/${clickedCase._id}`;
        });
      }
    } catch (err) {
      console.error('Error cargando casos:', err);
    }
  };

  // Buscador con debounce
  let debounceTimer = null;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      loadAndRenderCases();
    }, 250);
  });

  // Filtros de categoría
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      loadAndRenderCases();
    });
  });

  // Botón centrar ubicación
  locateBtn?.addEventListener('click', () => {
    if (leafletMap && location) {
      leafletMap.setView([location.lat, location.lng], 15);
    }
  });

  // Accesos del header
  root.querySelector('#btn-top-profile')?.addEventListener('click', () => {
    window.location.hash = '#/perfil';
  });

  root.querySelector('#btn-top-notif')?.addEventListener('click', () => {
    window.location.hash = '#/notificaciones';
  });

  root.querySelector('#btn-floating-create')?.addEventListener('click', () => {
    window.location.hash = '#/crear';
  });

  // Cargar casos iniciales
  loadAndRenderCases();
}
