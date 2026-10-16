/**
 * router.js - Enrutador SPA de Siempre Cerca
 * Escucha cambios de hash y llama a la pantalla correcta con soporte de rutas dinámicas.
 */
import { appState } from './state.js';
import { CONFIG } from './config.js';
import { renderDesktopSidebar, mountNavEvents } from './ui/nav.js';

/**
 * Definición de rutas. Cada entrada tiene:
 *  - path: cadena con :param para parámetros dinámicos
 *  - screen: ruta relativa al módulo de pantalla
 *  - public: true = accesible sin sesión
 *  - admin: true = solo equipo de moderación (rol moderator o admin)
 */
const ROUTES = [
  // Rutas públicas
  { path: '/',                          screen: './screens/welcome.js',         public: true },
  { path: '/registro',                  screen: './screens/register.js',        public: true },
  { path: '/registro/telefono',         screen: './screens/register-phone.js',  public: true },
  { path: '/registro/codigo',           screen: './screens/register-code.js',   public: true },
  { path: '/login',                     screen: './screens/login.js',           public: true },
  { path: '/recuperar',                 screen: './screens/forgot.js',          public: true },

  // Rutas privadas (requieren sesión)
  { path: '/permisos',                  screen: './screens/permissions.js',     public: false },
  { path: '/inicio',                    screen: './screens/home.js',            public: false },
  { path: '/crear',                     screen: './screens/create-case.js',     public: false },
  { path: '/alerta/:id',                screen: './screens/case-review.js',     public: false },
  { path: '/caso/:id',                  screen: './screens/case-detail.js',     public: false },
  { path: '/caso/:id/avistamiento',     screen: './screens/sighting.js',        public: false },
  { path: '/caso/:id/busqueda',         screen: './screens/volunteers.js',      public: false },
  { path: '/resuelto/:id',              screen: './screens/case-resolved.js',   public: false },
  { path: '/notificaciones',            screen: './screens/notifications.js',   public: false },
  { path: '/comunidad',                 screen: './screens/community.js',       public: false },
  { path: '/perfil',                    screen: './screens/profile.js',         public: false },
  { path: '/perfil/alertas',            screen: './screens/my-alerts.js',       public: false },
  { path: '/perfil/busquedas',          screen: './screens/my-searches.js',     public: false },
  { path: '/perfil/avistamientos',      screen: './screens/my-sightings.js',    public: false },
  { path: '/perfil/editar',             screen: './screens/edit-profile.js',    public: false },
  { path: '/perfil/telefono',           screen: './screens/phone-settings.js',  public: false },
  { path: '/perfil/telefono/cambiar',   screen: './screens/change-phone.js',     public: false },
  { path: '/perfil/correo/cambiar',     screen: './screens/change-email.js',    public: false },
  { path: '/perfil/contrasena',         screen: './screens/change-password.js', public: false },
  // Panel de administración (solo equipo)
  { path: '/admin',                    screen: './screens/admin/dashboard.js',   public: false, admin: true },
  { path: '/admin/alertas',            screen: './screens/admin/cases.js',       public: false, admin: true },
  { path: '/admin/usuarios',           screen: './screens/admin/users.js',       public: false, admin: true },
  { path: '/admin/avistamientos',      screen: './screens/admin/sightings.js',   public: false, admin: true },
  { path: '/admin/ajustes',            screen: './screens/admin/settings.js',    public: false, admin: true },

  { path: '/ayuda',                     screen: './screens/help.js',            public: false },
];

/**
 * Convierte una definición de ruta en un RegExp y extrae los nombres de parámetros.
 * Ejemplo: '/caso/:id' → /^\/caso\/([^/]+)$/ con params ['id']
 */
function buildMatcher(path) {
  const paramNames = [];
  const regexStr = path.replace(/:([a-zA-Z]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  return {
    regex: new RegExp(`^${regexStr}$`),
    paramNames,
  };
}

/** Devuelve el hash limpio sin '#' inicial */
function getHashPath() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  return raw;
}

/** Extrae los parámetros de la URL y los devuelve como objeto */
function matchRoute(path) {
  for (const route of ROUTES) {
    const { regex, paramNames } = buildMatcher(route.path);
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { route, params };
    }
  }
  return null;
}

/** Qué pestaña de la barra lateral se marca como activa según la ruta */
function activeTabFor(path) {
  if (path.startsWith('/comunidad')) return 'community';
  if (path.startsWith('/notificaciones')) return 'notifications';
  if (path.startsWith('/perfil') || path.startsWith('/ayuda')) return 'profile';
  return 'home';
}

/**
 * Las pantallas internas se envuelven con la barra lateral de escritorio.
 * Bajo 1100 px la barra lateral está oculta por CSS y se ve la barra inferior móvil.
 */
function wrapWithLayout(html, path) {
  return `
    <div class="app-layout has-desktop-sidebar">
      ${renderDesktopSidebar(activeTabFor(path))}
      <main class="app-main">${html}</main>
    </div>`;
}

/** Referencia a la función de desmontaje de la pantalla anterior */
let currentUnmount = null;

/**
 * Navega a la pantalla correspondiente al hash actual.
 * Importa el módulo de pantalla de forma dinámica.
 */
export async function navigate() {
  const path = getHashPath();
  const found = matchRoute(path);
  const session = appState.getSession();

  // Ruta no encontrada → bienvenida
  if (!found) {
    window.location.hash = '#/';
    return;
  }

  const { route, params } = found;

  // Ruta privada sin sesión → login
  if (!route.public && !session) {
    window.location.hash = '#/login';
    return;
  }

  // Panel de administración: solo para el equipo
  const isStaff = Boolean(session && CONFIG.STAFF_ROLES.includes(session.role));
  if (route.admin && !isStaff) {
    window.location.hash = '#/inicio';
    return;
  }

  // Rutas públicas de auth redirigen a inicio (o al panel si es del equipo) si ya hay sesión
  if (route.public && session && (path === '/' || path === '/login')) {
    window.location.hash = isStaff ? '#/admin' : '#/inicio';
    return;
  }

  // Desmontar pantalla anterior si tiene función de limpieza
  if (typeof currentUnmount === 'function') {
    try {
      currentUnmount();
    } catch (e) {
      console.warn('Error al desmontar pantalla:', e);
    }
    currentUnmount = null;
  }

  try {
    // Importar el módulo de pantalla dinámicamente
    const screenModule = await import(route.screen);

    const appRoot = document.getElementById('app');
    if (!appRoot) return;

    // Renderizar HTML de la pantalla
    const html = screenModule.render(params);
    const usesLayout = !route.public && !route.admin && path !== '/permisos';
    document.body.classList.toggle('is-admin', Boolean(route.admin));
    appRoot.innerHTML = usesLayout ? wrapWithLayout(html, path) : html;
    if (usesLayout) mountNavEvents(appRoot.querySelector('.desktop-sidebar'));

    // Montar eventos y lógica
    if (typeof screenModule.mount === 'function') {
      const unmount = screenModule.mount(appRoot, params);
      currentUnmount = typeof unmount === 'function' ? unmount : null;
    }

    // Scroll al inicio en cada transición
    window.scrollTo(0, 0);
  } catch (err) {
    console.error(`Error al cargar la pantalla "${route.screen}":`, err);
    document.getElementById('app').innerHTML = `
      <div class="screen padded" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-height:100vh;">
        <p style="font-size:48px">⚠️</p>
        <h2 style="color:var(--terracota)">Error al cargar la pantalla</h2>
        <p style="color:var(--muted);text-align:center">${err.message}</p>
        <button type="button" class="button outline" onclick="window.location.hash='#/'">Volver al inicio</button>
      </div>
    `;
  }
}

/** Inicializa el enrutador escuchando cambios de hash */
export function initRouter() {
  window.addEventListener('hashchange', navigate);
  navigate(); // Navegar a la ruta actual al cargar
}
