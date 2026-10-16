/**
 * my-alerts.js - Mis alertas publicadas (22-mis-alertas.png y 23-mis-alertas-detalle.png)
 * Muestra bloques pequeños con estado del reporte y acceso a la revisión o detalle.
 */
import { renderIcon } from '../ui/icons.js';
import { casesService } from '../services/cases.js';
import { formatRelativeTime } from '../utils/format.js';

export function render() {
  return `
    <div class="screen sub-screen" id="my-alerts-root">
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">
          ${renderIcon('arrow')} Perfil
        </button>
        <span>Mis alertas</span>
        <span class="header-spacer"></span>
      </header>

      <div class="sub-scroll" id="alerts-list-container">
        <p class="sub-intro">Las alertas que publicaste. Toca una para ver cómo va.</p>
        <div style="text-align: center; color: var(--muted); padding: 30px;">Cargando tus alertas...</div>
      </div>
    </div>
  `;
}

export function mount(root) {
  const container = root.querySelector('#alerts-list-container');

  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/perfil';
  });

  const loadAlerts = async () => {
    try {
      const myCases = await casesService.listMine();
      const allCases = await casesService.listActive({ radiusKm: 100 });
      // Combinar para mostrar los de demo si no hay creados por el usuario
      const displayCases = myCases.length > 0 ? myCases : allCases;

      let html = `<p class="sub-intro">Las alertas que publicaste. Toca una para ver cómo va.</p>`;

      if (displayCases.length === 0) {
        html += `<p class="sub-intro empty">Aún no has publicado ninguna alerta.</p>`;
      } else {
        html += displayCases
          .map((c) => {
            const isReview = c.status === 'pending_review';
            const isResolved = c.status === 'resolved';
            const isRejected = c.status === 'rejected';
            const tone = isReview ? 'ochre' : isResolved ? 'green' : isRejected ? 'muted' : 'coral';
            const statusLabel = isReview ? 'En revisión' : isResolved ? 'Resuelta' : isRejected ? 'No aprobada' : 'Activa';

            return `
              <button type="button" class="mini-card" data-alert-id="${c._id}" data-status="${c.status}">
                <img class="thumb" src="${c.thumb || c.photo}" alt="${c.name}" />
                <div>
                  <em class="status-chip ${tone}"><i></i>${statusLabel}</em>
                  <b>${c.name}</b>
                  <span>${c.type === 'pet' ? 'Mascota perdida' : 'Persona desaparecida'} · Folio #${c.folio}</span>
                  <small>Publicada ${formatRelativeTime(c.createdAt)}</small>
                </div>
                ${renderIcon('chevron', 17)}
              </button>
            `;
          })
          .join('');
      }

      html += `
        <button type="button" class="button outline" id="btn-create-new-alert" style="margin-top: 14px;">
          ${renderIcon('check')} Crear una nueva alerta
        </button>
      `;

      container.innerHTML = html;

      container.querySelector('#btn-create-new-alert')?.addEventListener('click', () => {
        window.location.hash = '#/crear';
      });

      container.querySelectorAll('[data-alert-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.alertId;
          const st = btn.dataset.status;
          if (st === 'pending_review' || st === 'rejected') {
            window.location.hash = `#/alerta/${id}`;
          } else if (st === 'resolved') {
            window.location.hash = `#/resuelto/${id}`;
          } else {
            window.location.hash = `#/caso/${id}`;
          }
        });
      });
    } catch (err) {
      console.error('Error cargando alertas:', err);
    }
  };

  loadAlerts();
}
