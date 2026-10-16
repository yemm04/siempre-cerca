/**
 * faqs.js - Preguntas frecuentes del Centro de ayuda.
 * Son textos fijos de la app (no van a la base de datos).
 */
export const FAQ_CATEGORIES = ['Todo', 'Primeros pasos', 'Alertas', 'Búsquedas', 'Cuenta y seguridad'];

export const FAQS = [
  { cat: 'Primeros pasos', q: '¿Cómo funciona Siempre Cerca?', a: 'Cuando alguien reporta una persona o mascota perdida, avisamos a la comunidad cercana. Los vecinos comparten pistas, se reparten zonas de búsqueda y ayudan a reducir el tiempo de respuesta.' },
  { cat: 'Alertas', q: '¿Cómo creo una alerta?', a: 'Toca el botón + de la barra de navegación, elige si buscas a una persona o mascota y completa los 4 pasos. Nuestro equipo la revisa antes de publicarla.' },
  { cat: 'Alertas', q: '¿Cuánto tarda la revisión de mi alerta?', a: 'Normalmente entre 15 y 30 minutos. Puedes ver el estado en Perfil › Mis alertas y te avisamos por notificación cuando se publique.' },
  { cat: 'Alertas', q: '¿Qué hago si encontré a quien buscaba?', a: 'Abre tu alerta y márcala como resuelta. Avisaremos a las personas que estaban ayudando para que dejen de buscar.' },
  { cat: 'Búsquedas', q: '¿Qué es un avistamiento?', a: 'Es el aviso que envías cuando crees haber visto a la persona o mascota de una alerta. Puedes adjuntar una foto y la ubicación; el responsable del caso lo recibe al instante.' },
  { cat: 'Búsquedas', q: '¿Cómo me uno a una búsqueda?', a: 'Entra al caso y toca “Unirme”. Se te asigna un cuadrante; al revisarlo, márcalo como inspeccionado para que otros no repitan la zona.' },
  { cat: 'Cuenta y seguridad', q: '¿Por qué piden mi número de teléfono?', a: 'Cada cuenta está ligada a un número verificado. Así evitamos cuentas falsas y podemos bloquear a quienes publiquen avisos falsos o hagan spam. Tu número nunca se muestra a otras personas.' },
  { cat: 'Cuenta y seguridad', q: 'Cambié de número, ¿qué hago?', a: 'Ve a Perfil › Teléfono › Cambiar número. Te pedimos tu contraseña y verificamos el nuevo número con un código por SMS.' },
  { cat: 'Cuenta y seguridad', q: 'Olvidé mi contraseña', a: 'En “Iniciar sesión” toca “¿Olvidaste tu contraseña?” y sigue los pasos para crear una nueva.' },
];
