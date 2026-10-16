/**
 * welcome.js - Pantalla de bienvenida (01-welcome.png)
 * Punto de entrada público con presentación de la red comunitaria y accesos.
 */

export function render() {
  return `
    <div class="screen welcome">
      <div class="welcome-art">
        <span class="blob"></span>
        <span class="sprig sprig-a">✦</span>
        <span class="sprig sprig-b">✦</span>
        <div class="logo">
          <div class="logo-mark">
            <span class="leaf one"></span>
            <span class="leaf two"></span>
            <span class="leaf three"></span>
            <div class="people"><span></span><span></span><span></span></div>
          </div>
          <div class="logo-name">Siempre<br><em>Cerca</em></div>
        </div>
      </div>

      <section class="welcome-copy">
        <p class="eyebrow">Una comunidad que cuida</p>
        <h1>Bienvenido a<br><em>Siempre Cerca</em></h1>
        <p class="subtitle">La red comunitaria que reduce el tiempo de respuesta frente a un extravío.</p>
      </section>

      <div class="stack">
        <button type="button" class="button primary" id="btn-create-account">Crear cuenta</button>
        <button type="button" class="button outline" id="btn-login">Iniciar sesión</button>
      </div>

      <p class="privacy">Al continuar aceptas nuestros Términos y Política de privacidad</p>
    </div>
  `;
}

export function mount(root) {
  root.querySelector('#btn-create-account')?.addEventListener('click', () => {
    window.location.hash = '#/registro';
  });

  root.querySelector('#btn-login')?.addEventListener('click', () => {
    window.location.hash = '#/login';
  });
}
