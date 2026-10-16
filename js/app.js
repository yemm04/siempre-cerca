/**
 * app.js - Punto de entrada de Siempre Cerca
 * Inicializa el estado de sesión, los datos seed y arranca el router.
 */
import { appState } from './state.js';
import { initRouter } from './router.js';

/**
 * Arranca la aplicación:
 * 1. Inicializa el estado (carga sesión desde localStorage)
 * 2. Lanza el router para cargar la pantalla del hash actual
 */
async function boot() {
  try {
    // Inicializar estado: carga la sesión guardada (si existe)
    await appState.init();

    // Iniciar el router SPA
    initRouter();
  } catch (err) {
    console.error('Error al iniciar Siempre Cerca:', err);
    const appRoot = document.getElementById('app');
    if (appRoot) {
      appRoot.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;padding:24px;font-family:DM Sans,sans-serif;">
          <p style="font-size:48px">⚠️</p>
          <h1 style="color:#2D6A4F;margin:0">Siempre Cerca</h1>
          <p style="color:#666;text-align:center">Error al iniciar la aplicación. Por favor recarga la página.</p>
          <button onclick="location.reload()" style="padding:12px 24px;background:#2D6A4F;color:#fff;border:none;border-radius:12px;cursor:pointer;font-size:16px">Reintentar</button>
          <p style="color:#999;font-size:12px;text-align:center">
            Asegúrate de abrir el proyecto con un servidor local (Live Server o npx serve),<br>
            no con doble clic en el archivo HTML.
          </p>
          <details style="max-width:400px;color:#999;font-size:11px">
            <summary>Ver error técnico</summary>
            <pre style="white-space:pre-wrap;word-break:break-all">${err.message}</pre>
          </details>
        </div>
      `;
    }
  }
}

boot();
