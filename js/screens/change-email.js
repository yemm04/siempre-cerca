/**
 * change-email.js - Cambiar correo (27-29: contraseña → correo nuevo → código).
 * Toda la lógica está en ui/contact-flow.js (compartida con change-phone.js).
 */
import { createContactFlow } from '../ui/contact-flow.js';

export const { render, mount } = createContactFlow('email');
