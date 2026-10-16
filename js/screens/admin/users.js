/**
 * users.js - Panel de administración · Usuarios
 * Lista de cuentas con búsqueda y la opción de suspender o reactivar.
 * Suspender bloquea el inicio de sesión y el número queda ligado a la cuenta (no puede registrarse otra vez).
 */
import { renderAdminShell, mountAdminShell } from '../../ui/admin-layout.js';
import { badge, when, empty, rowBtn, askReason } from '../../ui/admin-kit.js';
import { adminService } from '../../services/admin.js';
import { showToast } from '../../ui/toast.js';
import { escapeHtml, initials } from '../../utils/format.js';
import { CONFIG } from '../../config.js';

const TABS = [['all', 'Todos'], ['active', 'Activos'], ['banned', 'Suspendidos']];

export function render() {
  return renderAdminShell({
    active: 'users',
    title: 'Usuarios <em>registrados</em>',
    subtitle: 'Una cuenta por número de teléfono: así se frena el spam y los avisos falsos.',
    body: `
      <div class="toolbar">
        <div class="tabs" id="user-tabs">${TABS.map(([k, l], i) => `<button type="button" data-tab="${k}" class="${i === 0 ? 'active' : ''}">${l}<em></em></button>`).join('')}</div>
        <div class="admin-search"><input id="user-q" type="search" placeholder="Buscar por nombre, usuario, correo o teléfono…" /></div>
      </div>
      <div class="table-card"><div id="user-table" class="table-wrap"></div></div>`,
  });
}

export function mount(root) {
  mountAdminShell(root);
  const table = root.querySelector('#user-table');
  let status = 'all';
  let q = '';
  let list = [];

  async function load() {
    list = await adminService.listUsers({ status, q });
    const all = await adminService.listUsers({});
    root.querySelectorAll('#user-tabs button').forEach((b) => {
      const k = b.dataset.tab;
      b.querySelector('em').textContent = k === 'all' ? all.length : all.filter((u) => u.status === k).length;
    });
    table.innerHTML = list.length ? `
      <table class="admin-table">
        <thead><tr><th>Usuario</th><th>Correo</th><th>Teléfono</th><th>Alertas</th><th>Avisos</th><th>Registro</th><th>Estado</th><th></th></tr></thead>
        <tbody>${list.map(row).join('')}</tbody>
      </table>` : empty('No hay usuarios con esos filtros.');
  }

  const row = (u) => {
    const staff = CONFIG.STAFF_ROLES.includes(u.role);
    const state = staff ? badge('Equipo', 'blue') : u.status === 'banned' ? badge('Suspendido', 'coral') : badge('Activo', 'green');
    const action = staff ? '' : u.status === 'banned' ? rowBtn('unban', u._id, 'Reactivar', 'primary') : rowBtn('ban', u._id, 'Suspender', 'danger');
    return `
      <tr>
        <td><div class="cell-user"><span class="avatar sm">${initials(u.name)}</span><div><b>${escapeHtml(u.name)}</b><small>@${escapeHtml(u.username)}</small></div></div></td>
        <td class="clip">${escapeHtml(u.email)}</td>
        <td>+51 ${escapeHtml(u.phone)}</td>
        <td>${u.casesCount}</td>
        <td>${u.sightingsCount}</td>
        <td>${when(u.createdAt)}</td>
        <td>${state}${u.status === 'banned' && u.banReason ? `<small class="reason">${escapeHtml(u.banReason)}</small>` : ''}</td>
        <td class="row-actions">${action}</td>
      </tr>`;
  };

  table.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const u = list.find((x) => x._id === btn.dataset.id);
    try {
      if (btn.dataset.action === 'ban') {
        const reason = await askReason({
          title: `Suspender a @${u.username}`,
          message: 'No podrá iniciar sesión y sus alertas abiertas se retirarán del mapa.',
          placeholder: 'Motivo de la suspensión…', confirmText: 'Suspender cuenta',
          presets: ['Publicó avisos falsos', 'Spam', 'Uso indebido de la app'],
        });
        if (reason === null) return;
        await adminService.setUserStatus(u._id, 'banned', reason);
        showToast('Cuenta suspendida', 'info');
      } else {
        await adminService.setUserStatus(u._id, 'active');
        showToast('Cuenta reactivada', 'success');
      }
      await load();
    } catch (err) {
      showToast(err.message || 'No se pudo completar la acción', 'error');
    }
  });

  root.querySelector('#user-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    status = b.dataset.tab;
    root.querySelectorAll('#user-tabs button').forEach((x) => x.classList.toggle('active', x === b));
    load();
  });

  let timer = null;
  root.querySelector('#user-q').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { q = e.target.value; load(); }, 200);
  });

  load().catch((err) => { table.innerHTML = empty(err.message); });
}
