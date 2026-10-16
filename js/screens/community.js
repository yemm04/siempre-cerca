/**
 * community.js - Pantalla de Comunidad (18-comunidad.png y 19-comunidad-abajo.png)
 * Muro de impacto vecinal, búsquedas activas con cuadrantes y reencuentros recientes.
 */
import { renderIcon } from '../ui/icons.js';
import { renderNav, mountNavEvents } from '../ui/nav.js';
import { showToast } from '../ui/toast.js';

export function render() {
  return `
    <div class="screen community-screen">
      <div class="community-scroll">
        <header class="community-head">
          <p class="eyebrow">Miraflores, Lima</p>
          <h1>Tu <em>comunidad</em></h1>
          <p class="subtitle">Vecinos que se mueven juntos cuando alguien lo necesita.</p>
        </header>

        <!-- Tarjeta de impacto del mes -->
        <section class="impact-card">
          <span class="impact-label">Este mes en tu zona</span>
          <div class="impact-main">
            <b>12</b>
            <span>casos resueltos<br>gracias a la comunidad</span>
          </div>
          <div class="impact-row">
            <div>
              <b>128</b>
              <span>voluntarios activos</span>
            </div>
            <div>
              <b>34 min</b>
              <span>a la primera pista</span>
            </div>
          </div>
        </section>

        <!-- Búsquedas activas -->
        <div class="section-head">
          <h2>Búsquedas activas cerca de ti</h2>
          <span class="live"><i></i> EN VIVO</span>
        </div>

        <article class="search-card">
          <div class="search-top">
            <img src="https://images.unsplash.com/photo-1714247084434-49bbc3ebf577?w=200" alt="Bruno" />
            <div>
              <span class="status">MASCOTA · A 1.2 KM</span>
              <h3>Bruno</h3>
              <p>Golden Retriever · Parque Kennedy</p>
            </div>
          </div>
          <div class="progress-line">
            <div><i style="width: 25%;"></i></div>
            <small>1 de 4 cuadrantes revisados · <b>10 personas buscando</b></small>
          </div>
          <div class="card-actions">
            <button type="button" class="button outline" id="btn-see-bruno">Ver caso</button>
            <button type="button" class="button primary" id="btn-join-bruno">Unirme a la búsqueda</button>
          </div>
        </article>

        <article class="search-card">
          <div class="search-top">
            <img src="https://images.unsplash.com/photo-1787095245569-00f583ccd06b?w=200" alt="Carmen" />
            <div>
              <span class="status">PERSONA · A 2.4 KM</span>
              <h3>Carmen R.</h3>
              <p>72 años · Av. Pardo, Miraflores</p>
            </div>
          </div>
          <div class="progress-line">
            <div><i style="width: 50%;"></i></div>
            <small>2 de 4 cuadrantes revisados · <b>6 personas buscando</b></small>
          </div>
          <div class="card-actions">
            <button type="button" class="button outline" id="btn-see-carmen">Ver caso</button>
            <button type="button" class="button primary" id="btn-join-carmen">Unirme a la búsqueda</button>
          </div>
        </article>

        <!-- Reencuentros recientes -->
        <div class="section-head">
          <h2>Reencuentros recientes</h2>
        </div>

        <div class="reunion-strip">
          <button type="button" class="reunion-chip" id="chip-luna">
            <img src="https://images.unsplash.com/photo-1787095245569-00f583ccd06b?w=200" alt="Luna" />
            <b>Luna</b>
            <small>Hace 1 día · 24 personas</small>
            <em>${renderIcon('check', 11)} En casa</em>
          </button>

          <div class="reunion-chip">
            <span class="chip-initial ochre">M</span>
            <b>Michi</b>
            <small>Hace 3 días · 11 personas</small>
            <em>${renderIcon('check', 11)} En casa</em>
          </div>

          <div class="reunion-chip">
            <span class="chip-initial coral">P</span>
            <b>Don Pedro</b>
            <small>Hace 5 días · 31 personas</small>
            <em>${renderIcon('check', 11)} En casa</em>
          </div>
        </div>

        <!-- Cómo ayudar -->
        <div class="section-head">
          <h2>Cómo puedes ayudar</h2>
        </div>

        <div class="profile-group">
          <div class="profile-row static">
            <div class="icon-box coral">${renderIcon('share', 19)}</div>
            <div>
              <b>Comparte las alertas</b>
              <span>Cada difusión multiplica las posibilidades</span>
            </div>
          </div>
          <div class="profile-row static">
            <div class="icon-box green">${renderIcon('location', 19)}</div>
            <div>
              <b>Revisa tu zona</b>
              <span>Camina tu cuadra y marca lo inspeccionado</span>
            </div>
          </div>
          <div class="profile-row static">
            <div class="icon-box ochre">${renderIcon('camera', 19)}</div>
            <div>
              <b>Reporta con foto</b>
              <span>Un avistamiento con imagen se confirma más rápido</span>
            </div>
          </div>
        </div>

        <button type="button" class="button soft" id="btn-invite-neighbors">
          ${renderIcon('share')} Invitar a mis vecinos
        </button>
      </div>

      ${renderNav('community')}
    </div>
  `;
}

export function mount(root) {
  mountNavEvents(root);

  root.querySelector('#btn-see-bruno')?.addEventListener('click', () => {
    window.location.hash = '#/caso/case_bruno_01';
  });

  root.querySelector('#btn-join-bruno')?.addEventListener('click', () => {
    window.location.hash = '#/caso/case_bruno_01/busqueda';
  });

  root.querySelector('#btn-see-carmen')?.addEventListener('click', () => {
    window.location.hash = '#/caso/case_carmen_02';
  });

  root.querySelector('#btn-join-carmen')?.addEventListener('click', () => {
    window.location.hash = '#/caso/case_carmen_02/busqueda';
  });

  root.querySelector('#chip-luna')?.addEventListener('click', () => {
    window.location.hash = '#/resuelto/case_luna_03';
  });

  root.querySelector('#btn-invite-neighbors')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: 'Siempre Cerca - Red Comunitaria de Búsqueda',
        text: 'Únete a nuestra red comunitaria en Miraflores para cuidar a vecinos y mascotas.',
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.origin);
      showToast('Enlace de invitación copiado', 'info');
    }
  });
}
