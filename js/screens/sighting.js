/**
 * sighting.js - Registrar y enviar avistamiento (13-avistamiento y 14-avistamiento-enviado)
 * Captura ubicación GPS, nota, foto opcional con canvas y confirmación inmediata.
 */
import { renderIcon } from '../ui/icons.js';
import { resizeImage } from '../utils/image.js';
import { sightingsService } from '../services/sightings.js';
import { casesService } from '../services/cases.js';
import { showToast } from '../ui/toast.js';

export function render(params) {
  return `
    <div class="screen sighting-screen" id="sighting-root">
      <div style="text-align: center; padding: 50px 0; color: #fff;">Cargando...</div>
    </div>
  `;
}

export function mount(root, params) {
  const container = root.querySelector('#sighting-root');
  const caseId = params?.id || 'case_bruno_01';

  let sent = false;
  let photoData = null;
  let stillThere = 'yes';
  let note = '';
  let address = 'Av. Larco 120, Miraflores';

  const renderView = async () => {
    container.innerHTML = `
      <div class="sighting-map">
        <div class="you-pin"><span></span></div>
      </div>

      <section class="modal-sheet">
        <div class="handle"></div>

        <div class="modal-head">
          <div>
            <p class="eyebrow">Reporte rápido</p>
            <h1>${sent ? '¡Reporte enviado!' : 'Registrar avistamiento'}</h1>
          </div>
          <button type="button" id="btn-close-modal" aria-label="Cerrar">
            ${renderIcon('close')}
          </button>
        </div>

        ${
          sent
            ? `
          <div class="sent-state">
            <div>${renderIcon('check', 36)}</div>
            <p>Gracias por ayudar. Avisamos al responsable y a los voluntarios cercanos.</p>
            <button type="button" class="button primary" id="btn-back-case">Volver al caso</button>
          </div>
        `
            : `
          <div class="gps-tag">
            ${renderIcon('location')}
            <div>
              <b>Ubicación detectada</b>
              <span>${address}</span>
            </div>
            <button type="button" id="btn-edit-gps">Editar</button>
          </div>

          <input type="file" id="file-sighting-photo" accept="image/*" style="display: none;" />
          <button type="button" class="photo-attach" id="btn-attach-photo">
            <div>${renderIcon('camera', 27)}</div>
            <span>
              <b>${photoData ? '✓ Foto adjuntada' : 'Agregar foto'}</b>
              <small>${photoData ? 'Toca para cambiar la imagen' : 'Ayuda a confirmar el avistamiento'}</small>
            </span>
            ${renderIcon('chevron')}
          </button>

          <label>¿Dónde lo viste y cómo se veía?
            <textarea id="inp-sighting-note" placeholder="Ej. Lo vi corriendo hacia la esquina, llevaba su collar azul...">${note}</textarea>
          </label>

          <div class="urgency">
            <span>¿Sigue en el lugar?</span>
            <button type="button" class="${stillThere === 'yes' ? 'active' : ''}" id="btn-still-yes">Sí, aún está</button>
            <button type="button" class="${stillThere === 'unsure' ? 'active' : ''}" id="btn-still-unsure">No estoy seguro</button>
          </div>

          <button type="button" class="button alert" id="btn-send-sighting">
            Enviar reporte <span>→</span>
          </button>
        `
        }
      </section>
    `;

    container.querySelector('#btn-close-modal')?.addEventListener('click', () => {
      window.location.hash = `#/caso/${caseId}`;
    });

    if (sent) {
      container.querySelector('#btn-back-case')?.addEventListener('click', () => {
        window.location.hash = `#/caso/${caseId}`;
      });
      return;
    }

    const noteInp = container.querySelector('#inp-sighting-note');
    noteInp?.addEventListener('input', (e) => (note = e.target.value));

    const fileInput = container.querySelector('#file-sighting-photo');
    container.querySelector('#btn-attach-photo')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          photoData = await resizeImage(file, 800, 0.6);
          renderView();
          showToast('Foto agregada al reporte', 'success');
        } catch (err) {
          showToast('Error procesando imagen', 'error');
        }
      }
    });

    container.querySelector('#btn-still-yes')?.addEventListener('click', () => {
      stillThere = 'yes';
      renderView();
    });

    container.querySelector('#btn-still-unsure')?.addEventListener('click', () => {
      stillThere = 'unsure';
      renderView();
    });

    container.querySelector('#btn-edit-gps')?.addEventListener('click', () => {
      const nueva = prompt('Ingresa la dirección o referencia:', address);
      if (nueva) {
        address = nueva.trim();
        renderView();
      }
    });

    const sendBtn = container.querySelector('#btn-send-sighting');
    sendBtn?.addEventListener('click', async () => {
      if (!note.trim()) {
        showToast('Por favor describe lo que viste', 'error');
        return;
      }
      try {
        sendBtn.disabled = true;
        await sightingsService.create(caseId, {
          where: address,
          note: note.trim(),
          photo: photoData,
          stillThere,
        });
        sent = true;
        renderView();
        showToast('¡Avistamiento registrado!', 'success');
      } catch (err) {
        sendBtn.disabled = false;
        showToast(err.message || 'Error al enviar reporte', 'error');
      }
    });
  };

  renderView();
}
