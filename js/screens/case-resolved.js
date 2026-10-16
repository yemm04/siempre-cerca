/**
 * case-resolved.js - Pantalla de celebración de caso resuelto (17-caso-resuelto.png)
 * Presenta el reencuentro exitoso con estadísticas de búsqueda comunitaria.
 */
import { renderIcon } from '../ui/icons.js';
import { casesService } from '../services/cases.js';
import { showToast } from '../ui/toast.js';

export function render(params) {
  return `
    <div class="screen resolved-screen" id="resolved-root">
      <div style="text-align: center; padding: 60px 0; color: var(--muted);">Cargando celebración...</div>
    </div>
  `;
}

export function mount(root, params) {
  const container = root.querySelector('#resolved-root');
  const caseId = params?.id || 'case_luna_03';

  const loadCase = async () => {
    try {
      const caseItem = await casesService.get(caseId);
      const name = caseItem ? caseItem.name : 'Luna';
      const photo = caseItem?.photo || caseItem?.thumb || 'https://images.unsplash.com/photo-1787095245569-00f583ccd06b?w=700';

      container.innerHTML = `
        <div class="success-hero">
          <button type="button" id="btn-close-resolved" aria-label="Cerrar">
            ${renderIcon('close')}
          </button>
          <div class="celebrate">
            <span>✦</span><span>✦</span>
            <div>${renderIcon('check', 40)}</div>
          </div>
          <p class="eyebrow">Caso resuelto</p>
          <h1>¡${name} está<br>de vuelta en casa!</h1>
          <p>La comunidad volvió a hacerlo posible.</p>
        </div>

        <div class="resolved-body">
          <div class="reunion-card">
            <img src="${photo}" alt="Reencuentro de ${name}" />
            <div>
              <span>REUNIDOS</span>
              <b>Encontrada sana y salva</b>
              <small>24 de mayo · 8:12 pm</small>
            </div>
          </div>

          <div class="stats">
            <div>
              <b>2h 18m</b>
              <span>Tiempo de búsqueda</span>
            </div>
            <div>
              <b>24</b>
              <span>Personas ayudaron</span>
            </div>
            <div>
              <b>3.4 km²</b>
              <span>Zona cubierta</span>
            </div>
          </div>

          <blockquote>
            “Cada persona que compartió, buscó o reportó una pista fue parte del reencuentro.”
          </blockquote>

          <div class="thank-you">
            <div class="logo compact">
              <div class="logo-mark">
                <span class="leaf one"></span>
                <span class="leaf two"></span>
                <span class="leaf three"></span>
              </div>
            </div>
            <div>
              <b>Gracias por estar cerca</b>
              <p>Juntos hacemos que nuestra comunidad sea un lugar más seguro.</p>
            </div>
          </div>

          <button type="button" class="button primary" id="btn-share-news">
            ${renderIcon('share')} Compartir esta buena noticia
          </button>
          <button type="button" class="button ghost" id="btn-go-home">
            Volver al inicio
          </button>
        </div>
      `;

      container.querySelector('#btn-close-resolved')?.addEventListener('click', () => {
        window.location.hash = '#/inicio';
      });

      container.querySelector('#btn-go-home')?.addEventListener('click', () => {
        window.location.hash = '#/inicio';
      });

      container.querySelector('#btn-share-news')?.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: `¡${name} está en casa!`,
            text: `¡Gran noticia en Siempre Cerca! ${name} fue encontrada sana y salva gracias a los vecinos.`,
            url: window.location.href,
          }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(window.location.href);
          showToast('Noticia copiada al portapapeles', 'info');
        }
      });
    } catch (err) {
      console.error('Error cargando caso resuelto:', err);
    }
  };

  loadCase();
}
