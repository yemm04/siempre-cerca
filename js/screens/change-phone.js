/**
 * change-phone.js - Cambiar número (contraseña → número nuevo → código SMS).
 * Toda la lógica está en ui/contact-flow.js (compartida con change-email.js).
 */
import { createContactFlow } from '../ui/contact-flow.js';

export const { render, mount } = createContactFlow('phone');
