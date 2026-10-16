/**
 * messages.js - Mensajes de validación y errores del sistema
 * Evita textos mágicos y duplicación de mensajes al usuario.
 */
export const MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos. Inténtalo de nuevo.',
    USER_NOT_FOUND: 'No encontramos una cuenta con esos datos.',
    PHONE_ALREADY_USED: 'Este número de teléfono ya está registrado en otra cuenta.',
    EMAIL_ALREADY_USED: 'Este correo electrónico ya está registrado.',
    USERNAME_ALREADY_USED: 'Ese nombre de usuario ya está en uso.',
    PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
    PASSWORD_RULES_FAILED: 'La contraseña no cumple con los requisitos mínimos.',
    CURRENT_PASSWORD_WRONG: 'La contraseña actual no es correcta.',
    SAME_PASSWORD: 'La nueva contraseña debe ser distinta a la actual.',
    SAME_EMAIL: 'Ese ya es tu correo actual.',
    SAME_PHONE: 'Ese ya es tu número actual.',
    CODE_INVALID: 'El código ingresado no es válido.',
    ACCOUNT_BANNED: 'Tu cuenta fue suspendida por incumplir las normas de la comunidad. Escríbenos a ayuda@siemprecerca.app si crees que es un error.',
    TERMS_REQUIRED: 'Debes aceptar los Términos y Política de privacidad.',
  },
  CASES: {
    CREATE_SUCCESS: 'Tu alerta ha sido enviada a revisión.',
    APPROVE_DEMO_SUCCESS: 'Alerta aprobada exitosamente (modo demostración).',
    RESOLVED_SUCCESS: '¡Excelente noticia! El caso ha sido marcado como resuelto.',
    STORAGE_QUOTA: 'El almacenamiento del navegador está lleno. Elimina imágenes antiguas o reinicia los datos de demostración.',
    LOCATION_REQUIRED: 'Por favor selecciona la última ubicación conocida.',
  },
  SIGHTING: {
    SUBMIT_SUCCESS: '¡Gracias por tu reporte! El aviso ha sido enviado al responsable y voluntarios.',
    NOTE_REQUIRED: 'Por favor ingresa una descripción o referencia de lo que viste.',
  },
  PROFILE: {
    SAVE_SUCCESS: 'Tus cambios han sido guardados.',
    RESET_DEMO_SUCCESS: 'Se han restaurado los datos de demostración originales.',
  },
};
