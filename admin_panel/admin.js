const content = document.querySelector('#content');
const pageTitle = document.querySelector('#pageTitle');
const navButtons = document.querySelectorAll('.nav-btn');

let currentView = 'dashboard';
let riders = [];
let errorMessage = '';

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadRiders(status) {
  const query = status ? `?status=${status}` : '';
  const data = await apiRequest(`/api/admin/riders${query}`);
  return data.riders || [];
}

async function refreshData() {
  errorMessage = '';
  try {
    if (currentView === 'online') riders = await loadRiders('online');
    else if (currentView === 'approval') riders = await loadRiders('pending');
    else riders = await loadRiders();
  } catch (error) {
    riders = [];
    errorMessage = error.message;
  }
  render();
}

function metric(label, value, note) {
  return `<article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}

function statusBadge(status) {
  const key = String(status || '').toLowerCase();
  return `<span class="badge ${key}">${status || 'UNKNOWN'}</span>`;
}

function isOnline(rider) {
  if (typeof rider.online_status === 'boolean') return rider.online_status;
  if (typeof rider.online === 'boolean') return rider.online;
  return false;
}

function emptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

function errorPanel() {
  return errorMessage ? `<p class="error">${errorMessage}</p>` : '';
}

function riderRows(data, actions = false) {
  if (!data.length) return emptyState('No riders found yet.');
  return `
    <table>
      <tr><th>Rider</th><th>Phone</th><th>Vehicle</th><th>Online</th><th>Approval</th>${actions ? '<th>Action</th>' : ''}</tr>
      ${data.map((rider) => `
        <tr>
          <td><b>${rider.name || 'Unnamed Rider'}</b><small>${rider.rider_code || rider.riderCode || '-'}</small></td>
          <td>${rider.phone || '-'}</td>
          <td>${rider.vehicle_number || rider.vehicle || '-'}</td>
          <td>${statusBadge(isOnline(rider) ? 'ONLINE' : 'OFFLINE')}</td>
          <td>${statusBadge(rider.approval_status || rider.approval)}</td>
          ${actions ? `<td><button class="mini" data-approve="${rider.id}">Approve</button><button class="mini ghost" data-suspend="${rider.id}">Suspend</button></td>` : ''}
        </tr>
      `).join('')}
    </table>
  `;
}

function renderDashboard() {
  const online = riders.filter((rider) => isOnline(rider) && rider.approval_status === 'APPROVED');
  const pending = riders.filter((rider) => rider.approval_status === 'PENDING');
  const approved = riders.filter((rider) => rider.approval_status === 'APPROVED');
  content.innerHTML = `
    ${errorPanel()}
    <section class="metrics">
      ${metric('Online Riders', online.length, 'Visible to dispatch')}
      ${metric('Registered Riders', riders.length, 'From backend database')}
      ${metric('Pending Approval', pending.length, 'Need admin review')}
      ${metric('Approved Riders', approved.length, 'Can login and go online')}
    </section>
    <section class="grid">
      <article class="panel"><h3>Online Riders</h3>${riderRows(online)}</article>
      <article class="panel"><h3>Approval Queue</h3>${riderRows(pending, true)}</article>
    </section>
  `;
}

function renderOnline() {
  content.innerHTML = `${errorPanel()}<article class="panel"><h3>Online Riders</h3>${riderRows(riders)}</article>`;
}

function renderRegistered() {
  content.innerHTML = `${errorPanel()}<article class="panel"><h3>Registered Riders</h3>${riderRows(riders, true)}</article>`;
}

function renderApproval() {
  content.innerHTML = `${errorPanel()}<article class="panel"><h3>Rider Registration Approval</h3>${riderRows(riders, true)}</article>`;
}

function render() {
  const titles = {
    dashboard: 'Operations Dashboard',
    online: 'Online Riders',
    registered: 'Registered Riders',
    approval: 'Rider Registration Approval',
  };
  pageTitle.textContent = titles[currentView];
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === currentView));
  if (currentView === 'online') renderOnline();
  else if (currentView === 'registered') renderRegistered();
  else if (currentView === 'approval') renderApproval();
  else renderDashboard();
}

document.addEventListener('click', async (event) => {
  const nav = event.target.closest('[data-view]');
  if (nav) {
    currentView = nav.dataset.view;
    await refreshData();
    return;
  }
  const approve = event.target.closest('[data-approve]');
  if (approve) {
    try {
      await apiRequest(`/api/admin/riders/${approve.dataset.approve}/approve`, { method: 'POST' });
      await refreshData();
    } catch (error) {
      errorMessage = error.message;
      render();
    }
    return;
  }
  const suspend = event.target.closest('[data-suspend]');
  if (suspend) {
    try {
      await apiRequest(`/api/admin/riders/${suspend.dataset.suspend}/suspend`, { method: 'POST' });
      await refreshData();
    } catch (error) {
      errorMessage = error.message;
      render();
    }
    return;
  }
  if (event.target.id === 'refreshBtn') await refreshData();
});

refreshData();
