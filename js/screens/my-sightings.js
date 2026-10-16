/**
 * my-sightings.js - Mis avistamientos reportados (25-mis-avistamientos.png)
 * Lista de avisos con acordeón desplegable y estado de validación de cada pista.
 */
import { sightingStatusInfo, formatWhen } from '../utils/format.js';
import { renderIcon } from '../ui/icons.js';
import { sightingsService } from '../services/sightings.js';

export function render() {
  return `
    <div class="screen sub-screen" id="my-sightings-root">
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">
          ${renderIcon('arrow')} Perfil
        </button>
        <span>Mis avistamientos</span>
        <span class="header-spacer"></span>
      </header>

      <div class="sub-scroll">
        <div class="info-note flat">
          ${renderIcon('location')}
          <span>
            <b>¿Qué es un avistamiento?</b>
            Es el aviso que envías cuando crees haber visto a una persona o mascota reportada. Aquí ves qué pasó con cada uno.
          </span>
        </div>

        <div class="sighting-list" id="sightings-list-box">
          <!-- Renderizado dinámico -->
        </div>
      </div>
    </div>
  `;
}

export function mount(root) {
  const container = root.querySelector('#sightings-list-box');
  let openId = null;

  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/perfil';
  });

  const loadSightings = async () => {
    try {
      const list = await sightingsService.listMine();

      const renderList = () => {
        container.innerHTML = list
          .map((s) => {
            const isOpen = openId === s._id;
            const info = sightingStatusInfo(s.status);
            return `
              <article class="sighting-card ${isOpen ? 'open' : ''}">
                <button type="button" class="sighting-head" data-id="${s._id}" aria-expanded="${isOpen}">
                  <img class="thumb" src="${s.img || 'https://images.unsplash.com/photo-1714247084434-49bbc3ebf577?w=100'}" alt="${s.name}" />
                  <div>
                    <em class="status-chip ${info.tone}"><i></i>${info.text}</em>
                    <b>Viste a ${s.name}</b>
                    <span>${s.where}</span>
                    <small>${formatWhen(s.createdAt)}</small>
                  </div>
                  ${renderIcon('chevron', 17)}
                </button>

                ${
                  isOpen
                    ? `
                  <div class="sighting-body">
                    <p>“${s.note}”</p>
                    ${
                      s.hasPhoto
                        ? `<small class="photo-tag">${renderIcon('camera', 13)} Adjuntaste una foto</small>`
                        : ''
                    }
                    <button type="button" class="button soft btn-see-sighting-case" data-case-id="${s.caseId}">
                      Ver el caso de ${s.name}
                    </button>
                  </div>
                `
                    : ''
                }
              </article>
            `;
          })
          .join('');

        container.querySelectorAll('.sighting-head').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            openId = openId === id ? null : id;
            renderList();
          });
        });

        container.querySelectorAll('.btn-see-sighting-case').forEach((btn) => {
          btn.addEventListener('click', () => {
            const cId = btn.dataset.caseId;
            if (cId === 'case_luna_03') {
              window.location.hash = `#/resuelto/${cId}`;
            } else {
              window.location.hash = `#/caso/${cId}`;
            }
          });
        });
      };

      if (list.length > 0) {
        openId = list[0]._id;
      }
      renderList();
    } catch (err) {
      console.error('Error cargando avistamientos:', err);
    }
  };

  loadSightings();
}
