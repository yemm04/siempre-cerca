/**
 * volunteers.js - Equipo de búsqueda comunitaria y cuadrantes (15-equipo-de-busqueda.png)
 * Asignación de zonas, lista de voluntarios activos e inspección comunitaria.
 */
import { renderIcon } from '../ui/icons.js';
import { renderNav, mountNavEvents } from '../ui/nav.js';
import { searchesService } from '../services/searches.js';
import { casesService } from '../services/cases.js';
import { showToast } from '../ui/toast.js';

export function render(params) {
  return `
    <div class="screen volunteers-screen" id="volunteers-root">
      <div style="text-align: center; padding: 50px 0; color: var(--muted);">Cargando equipo...</div>
    </div>
  `;
}

export function mount(root, params) {
  const container = root.querySelector('#volunteers-root');
  const caseId = params?.id || 'case_bruno_01';

  let inspected = false;

  const loadData = async () => {
    try {
      const caseItem = await casesService.get(caseId);
      const caseName = caseItem ? caseItem.name : 'Caso';
      const volunteerList = await searchesService.volunteers(caseId);
      const myParts = await searchesService.myParticipations();
      const myPart = myParts.find((p) => p.caseId === caseId);

      if (myPart) {
        inspected = myPart.inspected;
      }

      container.innerHTML = `
        <header class="simple-header">
          <button type="button" class="back" id="btn-back">
            ${renderIcon('arrow')} Volver
          </button>
          <span>Equipo de búsqueda</span>
          <button type="button" id="btn-menu" aria-label="Opciones">
            ${renderIcon('menu')}
          </button>
        </header>

        <!-- Mapa de cuadrantes -->
        <div class="volunteer-map">
          <div class="river"></div>
          <div class="park park-a"></div>
          <span class="road h h1"></span>
          <span class="road v v2"></span>
          <div class="quadrant q1">A1 ✓</div>
          <div class="quadrant q2" style="${inspected ? 'border-color: var(--green); color: var(--green); background: rgba(88,129,87,.2);' : ''}">
            A2 ${inspected ? '✓' : ''}
          </div>
          <div class="quadrant q3">B1</div>
        </div>

        <!-- Panel de búsqueda comunitaria -->
        <section class="volunteer-panel">
          <div class="sheet-title">
            <div>
              <p class="eyebrow">Búsqueda de ${caseName}</p>
              <h2>${volunteerList.length} voluntarios activos</h2>
            </div>
            <span class="live"><i></i> EN VIVO</span>
          </div>

          <div class="assignment">
            <div class="icon-box green">${renderIcon('location')}</div>
            <div>
              <small>Tu zona asignada</small>
              <b>Cuadrante A2 · Parque Kennedy</b>
            </div>
            <button type="button" id="btn-change-zone">Cambiar</button>
          </div>

          <h3>Personas en tu zona</h3>
          <div class="volunteer-list">
            ${volunteerList
              .map(
                (v) => `
              <div>
                <span class="vol-avatar ${v.color || 'sage'}">${v.initials}</span>
                <div>
                  <b>${v.name}</b>
                  <small>${v.area} · Activo ahora</small>
                </div>
                <button type="button" class="btn-msg" aria-label="Enviar mensaje a ${v.name}">
                  ${renderIcon('message')}
                </button>
              </div>
            `
              )
              .join('')}
          </div>

          <button
            type="button"
            class="button ${inspected ? 'soft' : 'primary'}"
            id="btn-inspect-zone"
          >
            ${renderIcon('check')}
            <span>${inspected ? 'Zona marcada como inspeccionada' : 'Marcar zona inspeccionada'}</span>
          </button>
        </section>

        ${renderNav('community')}
      `;

      mountNavEvents(container);

      container.querySelector('#btn-back')?.addEventListener('click', () => {
        window.location.hash = `#/caso/${caseId}`;
      });

      container.querySelector('#btn-inspect-zone')?.addEventListener('click', async () => {
        try {
          const res = await searchesService.markZoneInspected(caseId, 'A2');
          inspected = res.inspected;
          showToast(
            inspected ? '¡Zona A2 marcada como inspeccionada!' : 'Zona desmarcada',
            'success'
          );
          loadData();
        } catch (err) {
          showToast(err.message || 'Error al actualizar zona', 'error');
        }
      });

      container.querySelector('#btn-change-zone')?.addEventListener('click', () => {
        showToast('Cuadrante A2 confirmado como tu sector prioritario', 'info');
      });

      container.querySelectorAll('.btn-msg').forEach((btn) => {
        btn.addEventListener('click', () => {
          showToast('Coordinación en canal de búsqueda', 'info');
        });
      });
    } catch (err) {
      console.error('Error cargando voluntarios:', err);
    }
  };

  loadData();
}
