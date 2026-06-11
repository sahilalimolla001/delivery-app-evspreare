const content = document.querySelector('#content');
const pageTitle = document.querySelector('#pageTitle');
const navButtons = document.querySelectorAll('.nav-btn');

let currentView = 'dashboard';
let riders = [];
let records = [];
let dashboard = null;
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
    records = [];
    dashboard = null;
    if (currentView === 'online') riders = await loadRiders('online');
    else if (currentView === 'approval') riders = await loadRiders('pending');
    else if (currentView === 'registered') riders = await loadRiders();
    else if (currentView === 'orders') records = (await apiRequest('/api/admin/orders')).orders || [];
    else if (currentView === 'earnings') records = (await apiRequest('/api/admin/earnings')).earnings || [];
    else if (currentView === 'documents') records = (await apiRequest('/api/admin/documents')).documents || [];
    else if (currentView === 'support') records = (await apiRequest('/api/admin/support')).tickets || [];
    else {
      dashboard = await apiRequest('/api/admin/dashboard');
      riders = await loadRiders();
    }
  } catch (error) {
    riders = [];
    records = [];
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

function money(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function tableRows(headers, rows) {
  if (!rows.length) return emptyState('No records found yet.');
  return `
    <table>
      <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
      ${rows.join('')}
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
      ${metric('Revenue', money(dashboard?.revenue), 'Delivered order payout')}
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

function renderOrders() {
  content.innerHTML = `${errorPanel()}<article class="panel"><h3>Orders</h3>${tableRows(
    ['Order', 'Store', 'Customer', 'Rider', 'Status', 'Payout'],
    records.map((order) => `
      <tr>
        <td><b>${order.public_id || order.id}</b><small>${order.created_at || '-'}</small></td>
        <td>${order.store_name || '-'}</td>
        <td>${order.customer_name || '-'}</td>
        <td>${order.rider_name || '-'}<small>${order.rider_phone || ''}</small></td>
        <td>${statusBadge(order.status)}</td>
        <td>${money(order.total_payout)}</td>
      </tr>
    `),
  )}</article>`;
}

function renderEarnings() {
  content.innerHTML = `${errorPanel()}<article class="panel"><h3>Earnings</h3>${tableRows(
    ['Rider', 'Order', 'Base', 'Distance', 'Bonus', 'Tips', 'Total'],
    records.map((earning) => `
      <tr>
        <td><b>${earning.rider_name || '-'}</b><small>${earning.rider_phone || ''}</small></td>
        <td>${earning.order_public_id || '-'}</td>
        <td>${money(earning.base_pay)}</td>
        <td>${money(earning.distance_pay)}</td>
        <td>${money(earning.bonus)}</td>
        <td>${money(earning.tips)}</td>
        <td><b>${money(earning.total)}</b></td>
      </tr>
    `),
  )}</article>`;
}

function renderDocuments() {
  content.innerHTML = `${errorPanel()}<article class="panel"><h3>Documents</h3>${tableRows(
    ['Rider', 'Type', 'Status', 'File', 'Action'],
    records.map((doc) => `
      <tr>
        <td><b>${doc.rider_name || '-'}</b><small>${doc.rider_phone || ''}</small></td>
        <td>${doc.type || '-'}</td>
        <td>${statusBadge(doc.status)}</td>
        <td>${doc.file_url ? `<a href="${doc.file_url}" target="_blank" rel="noreferrer">Open</a>` : '-'}</td>
        <td><button class="mini" data-doc-approve="${doc.id}">Approve</button><button class="mini ghost" data-doc-reject="${doc.id}">Reject</button></td>
      </tr>
    `),
  )}</article>`;
}

function renderSupport() {
  content.innerHTML = `${errorPanel()}<article class="panel"><h3>Support Tickets</h3>${tableRows(
    ['Rider', 'Title', 'Priority', 'Status', 'Action'],
    records.map((ticket) => `
      <tr>
        <td><b>${ticket.rider_name || '-'}</b><small>${ticket.rider_phone || ''}</small></td>
        <td><b>${ticket.title || '-'}</b><small>${ticket.description || ''}</small></td>
        <td>${ticket.priority || '-'}</td>
        <td>${statusBadge(ticket.status)}</td>
        <td><button class="mini" data-ticket-resolve="${ticket.id}">Resolve</button></td>
      </tr>
    `),
  )}</article>`;
}

function render() {
  const titles = {
    dashboard: 'Operations Dashboard',
    online: 'Online Riders',
    registered: 'Registered Riders',
    approval: 'Rider Registration Approval',
    orders: 'Orders',
    earnings: 'Earnings',
    documents: 'Documents',
    support: 'Support',
  };
  pageTitle.textContent = titles[currentView];
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === currentView));
  if (currentView === 'online') renderOnline();
  else if (currentView === 'registered') renderRegistered();
  else if (currentView === 'approval') renderApproval();
  else if (currentView === 'orders') renderOrders();
  else if (currentView === 'earnings') renderEarnings();
  else if (currentView === 'documents') renderDocuments();
  else if (currentView === 'support') renderSupport();
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
  const docApprove = event.target.closest('[data-doc-approve]');
  if (docApprove) {
    try {
      await apiRequest(`/api/admin/documents/${docApprove.dataset.docApprove}/approve`, { method: 'POST' });
      await refreshData();
    } catch (error) {
      errorMessage = error.message;
      render();
    }
    return;
  }
  const docReject = event.target.closest('[data-doc-reject]');
  if (docReject) {
    try {
      await apiRequest(`/api/admin/documents/${docReject.dataset.docReject}/reject`, { method: 'POST' });
      await refreshData();
    } catch (error) {
      errorMessage = error.message;
      render();
    }
    return;
  }
  const ticketResolve = event.target.closest('[data-ticket-resolve]');
  if (ticketResolve) {
    try {
      await apiRequest(`/api/admin/support/${ticketResolve.dataset.ticketResolve}/resolve`, { method: 'POST' });
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
