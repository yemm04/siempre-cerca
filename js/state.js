/**
 * state.js - Estado global de la aplicación Siempre Cerca
 * Mantiene la sesión actual, borrador de registro y observadores de cambio.
 */
import { authService } from './services/auth.js';
import { CONFIG } from './config.js';

class State {
  constructor() {
    this.session = null;
    this.registrationDraft = {
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
    };
    this.currentLocation = {
      ...CONFIG.LIMA_CENTER,
      isDefault: true,
    };
    this.listeners = new Set();
  }

  async init() {
    this.session = await authService.currentUser();
    this.notify();
    return this.session;
  }

  getSession() {
    return this.session;
  }

  setSession(user) {
    this.session = user;
    this.notify();
  }

  getRegistrationDraft() {
    return this.registrationDraft;
  }

  setRegistrationDraft(data) {
    this.registrationDraft = { ...this.registrationDraft, ...data };
  }

  clearRegistrationDraft() {
    this.registrationDraft = {
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
    };
  }

  getLocation() {
    return this.currentLocation;
  }

  setLocation(loc) {
    this.currentLocation = loc;
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this);
      } catch (e) {
        console.error('Error en listener de estado:', e);
      }
    });
  }
}

export const appState = new State();
