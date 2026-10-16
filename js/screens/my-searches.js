/**
 * my-searches.js - Búsquedas en las que participo (24-mis-busquedas.png)
 * Historial de cuadrantes asignados divididos en búsquedas activas y finalizadas.
 */
import { renderIcon } from '../ui/icons.js';
import { searchesService } from '../services/searches.js';

export function render() {
  return `
    <div class="screen sub-screen">
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">
          ${renderIcon('arrow')} Perfil
        </button>
        <span>Mis búsquedas</span>
        <span class="header-spacer"></span>
      </header>

      <div class="sub-scroll">
        <p class="sub-intro">Búsquedas de otras personas a las que te uniste como voluntario.</p>

        <p class="group-title">En curso</p>
        <button type="button" class="mini-card" id="card-search-bruno">
          <img class="thumb" src="https://images.unsplash.com/photo-1714247084434-49bbc3ebf577?w=120" alt="Bruno" />
          <div>
            <em class="status-chip coral"><i></i>En curso</em>
            <b>Búsqueda de Bruno</b>
            <span>Tu zona: Cuadrante A2 · Parque Kennedy</span>
            <small>10 voluntarios · tú llevas 45 min activo</small>
          </div>
          ${renderIcon('chevron', 17)}
        </button>

        <p class="group-title">Finalizadas</p>
        <button type="button" class="mini-card" id="card-search-luna">
          <img class="thumb" src="https://images.unsplash.com/photo-1787095245569-00f583ccd06b?w=120" alt="Luna" />
          <div>
            <em class="status-chip green"><i></i>Encontrada</em>
            <b>Búsqueda de Luna</b>
            <span>Cuadrante B1 · revisaste 1 zona</span>
            <small>24 de mayo · 2 h 18 min de búsqueda</small>
          </div>
          ${renderIcon('chevron', 17)}
        </button>

        <div class="mini-card static">
          <span class="thumb chip-initial coral">R</span>
          <div>
            <em class="status-chip green"><i></i>Encontrado</em>
            <b>Búsqueda de Rocky</b>
            <span>Cuadrante C3 · revisaste 2 zonas</span>
            <small>12 de abril · 1 h 05 min de búsqueda</small>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function mount(root) {
  root.querySelector('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/perfil';
  });

  root.querySelector('#card-search-bruno')?.addEventListener('click', () => {
    window.location.hash = '#/caso/case_bruno_01/busqueda';
  });

  root.querySelector('#card-search-luna')?.addEventListener('click', () => {
    window.location.hash = '#/resuelto/case_luna_03';
  });
}
