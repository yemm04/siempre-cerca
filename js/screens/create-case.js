/**
 * create-case.js - Crear alerta en 4 pasos (07-crear-1-tipo a 10-crear-4-contacto)
 * Soporta carga real de fotos con canvas, selección de punto en mapa y validaciones.
 */
import { renderIcon } from '../ui/icons.js';
import { resizeImage, createThumbnail } from '../utils/image.js';
import { getCurrentUserPosition } from '../utils/geo.js';
import { casesService } from '../services/cases.js';
import { appState } from '../state.js';
import { initLeafletMap } from '../ui/map.js';
import { showToast } from '../ui/toast.js';

export function render() {
  return `
    <div class="screen create-screen" id="create-flow-root">
      <!-- Contenido renderizado según el paso (1-4) -->
    </div>
  `;
}

export function mount(root) {
  const container = root.querySelector('#create-flow-root');
  const session = appState.getSession();

  let step = 1;
  let caseType = 'pet';
  let photoData = '';
  let thumbData = '';
  let name = '';
  let breedOrAge = '';
  let description = '';
  let locationCoords = { ...appState.getLocation() };
  let referenceAddress = 'Parque Kennedy, Miraflores, Lima';
  let date = new Date().toISOString().slice(0, 10);
  let time = '17:30';
  let contactPhone = session?.phone ? `+51 ${session.phone}` : '+51 987 654 321';
  let relation = 'owner';
  let termsAccepted = true;

  let leafletMap = null;

  const renderCurrentStep = () => {
    let content = `
      <header class="simple-header">
        <button type="button" class="back" id="btn-back">
          ${renderIcon('arrow')} Volver
        </button>
        <span>Crear alerta</span>
        <button type="button" id="btn-close" aria-label="Cerrar">
          ${renderIcon('close')}
        </button>
      </header>

      <div class="step-dots" aria-label="Paso ${step} de 4">
        <span class="${step >= 1 ? 'done' : ''}"></span>
        <span class="${step >= 2 ? 'done' : ''}"></span>
        <span class="${step >= 3 ? 'done' : ''}"></span>
        <span class="${step >= 4 ? 'done' : ''}"></span>
      </div>

      <div class="create-content">
    `;

    if (step === 1) {
      content += `
        <p class="eyebrow">Paso 1 de 4</p>
        <h1>¿A quién estamos buscando?</h1>
        <p class="subtitle">Selecciona una categoría para comenzar el reporte.</p>

        <div class="category-grid">
          <button type="button" class="${caseType === 'person' ? 'selected' : ''}" data-type="person">
            <span class="category-icon person">◉</span>
            <b>Persona<br>desaparecida</b>
            <small>Familiares, amigos o conocidos</small>
            <i>${renderIcon('check', 15)}</i>
          </button>
          <button type="button" class="${caseType === 'pet' ? 'selected' : ''}" data-type="pet">
            <span class="category-icon pet">♧</span>
            <b>Mascota<br>perdida</b>
            <small>Perros, gatos u otros animales</small>
            <i>${renderIcon('check', 15)}</i>
          </button>
        </div>

        <div class="info-note">
          ${renderIcon('shield')}
          <span><b>Todos los reportes son revisados</b>Validamos cada alerta antes de publicarla para proteger a la comunidad.</span>
        </div>
      `;
    } else if (step === 2) {
      const isPet = caseType === 'pet';
      content += `
        <p class="eyebrow">Paso 2 de 4</p>
        <h1>Cuéntanos sobre ${isPet ? 'tu mascota' : 'la persona'}</h1>
        <p class="subtitle">Estos detalles ayudarán a reconocerle rápidamente.</p>

        <input type="file" id="file-photo-input" accept="image/*" style="display: none;" />
        <div class="upload-box" id="btn-upload-box">
          ${
            photoData
              ? `<img src="${photoData}" style="width: 100%; height: 180px; object-fit: cover;" alt="Foto subida" />`
              : `
              <div>${renderIcon('camera', 28)}</div>
              <b>Agrega una foto clara</b>
              <span>De frente y con buena iluminación</span>
              <small>Subir foto</small>
            `
          }
        </div>

        <div class="field-row">
          <label>Nombre
            <input type="text" id="inp-name" value="${name}" placeholder="${isPet ? 'Bruno' : 'Nombre completo'}" required />
          </label>
          <label>${isPet ? 'Raza' : 'Edad'}
            <input type="text" id="inp-breed-age" value="${breedOrAge}" placeholder="${isPet ? 'Golden Retriever' : 'Ej. 72 años'}" />
          </label>
        </div>

        <label>Señas particulares
          <textarea id="inp-desc" placeholder="${isPet ? 'Color, vestimenta, collar, temperamento...' : 'Vestimenta, estatura, rasgos distintivos...'}">${description}</textarea>
        </label>
      `;
    } else if (step === 3) {
      content += `
        <p class="eyebrow">Paso 3 de 4</p>
        <h1>Última ubicación conocida</h1>
        <p class="subtitle">Mueve el mapa para colocar el pin en el punto más preciso.</p>

        <div class="location-map" id="create-map-box">
          <div id="create-map" style="width: 100%; height: 100%;"></div>
          <div class="big-pin">${renderIcon('location')}</div>
          <button type="button" id="btn-use-myloc">${renderIcon('location', 17)} Usar mi ubicación</button>
        </div>

        <label>Dirección o referencia
          <input type="text" id="inp-ref" value="${referenceAddress}" placeholder="Av. Larco / Parque Kennedy, Miraflores" />
        </label>

        <div class="field-row">
          <label>Fecha
            <input type="date" id="inp-date" value="${date}" />
          </label>
          <label>Hora
            <input type="time" id="inp-time" value="${time}" />
          </label>
        </div>
      `;
    } else if (step === 4) {
      content += `
        <p class="eyebrow">Paso 4 de 4</p>
        <h1>Contacto y validación</h1>
        <p class="subtitle">Últimos datos antes de enviar tu alerta a revisión.</p>

        <label>Teléfono de contacto
          <input type="tel" id="inp-phone" value="${contactPhone}" placeholder="+51 987 654 321" />
        </label>

        <label>Relación con el caso
          <select id="inp-relation">
            <option value="owner" ${relation === 'owner' ? 'selected' : ''}>Soy familiar o responsable directo</option>
            <option value="friend" ${relation === 'friend' ? 'selected' : ''}>Amigo o conocido</option>
            <option value="witness" ${relation === 'witness' ? 'selected' : ''}>Testigo presencial</option>
          </select>
        </label>

        <div class="police-note">
          <div>${renderIcon('shield')}</div>
          <span>
            <b>Importante</b>
            Siempre Cerca no sustituye una denuncia oficial. En caso de una persona desaparecida, contacta también a las autoridades al <strong>105</strong>.
          </span>
        </div>

        <label class="checkbox ${termsAccepted ? 'on' : ''}" id="case-terms-label">
          <input type="checkbox" id="inp-terms" ${termsAccepted ? 'checked' : ''} />
          <span>${renderIcon('check', 14)}</span>
          Confirmo que la información es verdadera y autorizo su publicación.
        </label>
      `;
    }

    content += `
      </div>

      <footer class="create-footer">
        <button type="button" class="button ${step === 4 ? 'alert' : 'primary'}" id="btn-flow-next">
          ${step === 4 ? 'Enviar alerta a revisión' : 'Continuar'} <span>→</span>
        </button>
      </footer>
    `;

    container.innerHTML = content;
    bindStepListeners();
  };

  const bindStepListeners = () => {
    container.querySelector('#btn-back')?.addEventListener('click', () => {
      if (step > 1) {
        step--;
        renderCurrentStep();
      } else {
        window.location.hash = '#/inicio';
      }
    });

    container.querySelector('#btn-close')?.addEventListener('click', () => {
      window.location.hash = '#/inicio';
    });

    const nextBtn = container.querySelector('#btn-flow-next');

    if (step === 1) {
      container.querySelectorAll('[data-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
          caseType = btn.dataset.type;
          renderCurrentStep();
        });
      });

      nextBtn?.addEventListener('click', () => {
        step = 2;
        renderCurrentStep();
      });
    } else if (step === 2) {
      const fileInput = container.querySelector('#file-photo-input');
      const uploadBox = container.querySelector('#btn-upload-box');
      const nameInp = container.querySelector('#inp-name');
      const breedInp = container.querySelector('#inp-breed-age');
      const descInp = container.querySelector('#inp-desc');

      uploadBox?.addEventListener('click', () => fileInput?.click());

      fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            photoData = await resizeImage(file, 800, 0.6);
            thumbData = await createThumbnail(file, 200, 0.6);
            renderCurrentStep();
            showToast('Foto cargada y optimizada', 'success');
          } catch (err) {
            showToast('Error procesando imagen', 'error');
          }
        }
      });

      nameInp?.addEventListener('input', (e) => (name = e.target.value));
      breedInp?.addEventListener('input', (e) => (breedOrAge = e.target.value));
      descInp?.addEventListener('input', (e) => (description = e.target.value));

      nextBtn?.addEventListener('click', () => {
        if (!name.trim()) {
          showToast('Por favor ingresa un nombre para la alerta', 'error');
          return;
        }
        step = 3;
        renderCurrentStep();
      });
    } else if (step === 3) {
      const refInp = container.querySelector('#inp-ref');
      const dateInp = container.querySelector('#inp-date');
      const timeInp = container.querySelector('#inp-time');
      const useLocBtn = container.querySelector('#btn-use-myloc');

      refInp?.addEventListener('input', (e) => (referenceAddress = e.target.value));
      dateInp?.addEventListener('input', (e) => (date = e.target.value));
      timeInp?.addEventListener('input', (e) => (time = e.target.value));

      // Inicializar mapa selector
      try {
        leafletMap = initLeafletMap('create-map', {
          center: [locationCoords.lat, locationCoords.lng],
          zoom: 15,
        });

        if (leafletMap) {
          leafletMap.on('move', () => {
            const c = leafletMap.getCenter();
            locationCoords = { lat: c.lat, lng: c.lng };
          });
        }
      } catch (err) {
        console.warn('Error cargando mapa en paso 3:', err);
      }

      useLocBtn?.addEventListener('click', async () => {
        const pos = await getCurrentUserPosition();
        locationCoords = pos;
        if (leafletMap) leafletMap.setView([pos.lat, pos.lng], 16);
        showToast('Ubicación actualizada', 'info');
      });

      nextBtn?.addEventListener('click', () => {
        step = 4;
        renderCurrentStep();
      });
    } else if (step === 4) {
      const phoneInp = container.querySelector('#inp-phone');
      const relInp = container.querySelector('#inp-relation');
      const termsInp = container.querySelector('#inp-terms');
      const termsLabel = container.querySelector('#case-terms-label');

      phoneInp?.addEventListener('input', (e) => (contactPhone = e.target.value));
      relInp?.addEventListener('change', (e) => (relation = e.target.value));
      termsInp?.addEventListener('change', (e) => {
        termsAccepted = e.target.checked;
        termsLabel.classList.toggle('on', termsAccepted);
        nextBtn.disabled = !termsAccepted;
      });

      nextBtn?.addEventListener('click', async () => {
        if (!termsAccepted) return;
        try {
          nextBtn.disabled = true;
          const newCase = await casesService.create({
            type: caseType,
            name: name.trim() || 'Sin nombre',
            breedOrAge: breedOrAge.trim(),
            description: description.trim(),
            photo: photoData || (caseType === 'pet' ? 'https://images.unsplash.com/photo-1714247084434-49bbc3ebf577?w=700' : 'https://images.unsplash.com/photo-1787095245569-00f583ccd06b?w=700'),
            thumb: thumbData || photoData,
            lat: locationCoords.lat,
            lng: locationCoords.lng,
            lastSeenText: referenceAddress.trim(),
            lastSeenAt: `${date}T${time}:00`,
            contactPhone: contactPhone.trim(),
            relation,
          });
          showToast('Alerta enviada a revisión', 'success');
          window.location.hash = `#/alerta/${newCase._id}`;
        } catch (err) {
          nextBtn.disabled = false;
          showToast(err.message || 'Error al enviar alerta', 'error');
        }
      });
    }
  };

  renderCurrentStep();
}
