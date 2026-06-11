const content = document.querySelector('#content');
const pageTitle = document.querySelector('#pageTitle');
const navButtons = document.querySelectorAll('.nav-btn');

const riders = [
  { id: 'r1', name: 'Amit Kumar', phone: '+919876543210', riderCode: 'RD548210', vehicle: 'KA01AB1234', online: true, approval: 'APPROVED' },
  { id: 'r2', name: 'Priya Singh', phone: '+919812345670', riderCode: 'RD548211', vehicle: 'DL02CD7788', online: true, approval: 'APPROVED' },
  { id: 'r3', name: 'Rahul Das', phone: '+919900112233', riderCode: 'RD548212', vehicle: 'MH12AA4422', online: false, approval: 'PENDING' },
  { id: 'r4', name: 'Sana Khan', phone: '+919811223344', riderCode: 'RD548213', vehicle: 'UP16BK9012', online: false, approval: 'PENDING' },
];

let currentView = 'dashboard';

function metric(label, value, note) {
  return `<article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}

function statusBadge(status) {
  const key = String(status).toLowerCase();
  return `<span class="badge ${key}">${status}</span>`;
}

function riderRows(data, actions = false) {
  return `
    <table>
      <tr><th>Rider</th><th>Phone</th><th>Vehicle</th><th>Online</th><th>Approval</th>${actions ? '<th>Action</th>' : ''}</tr>
      ${data.map((rider) => `
        <tr>
          <td><b>${rider.name}</b><small>${rider.riderCode}</small></td>
          <td>${rider.phone}</td>
          <td>${rider.vehicle}</td>
          <td>${statusBadge(rider.online ? 'ONLINE' : 'OFFLINE')}</td>
          <td>${statusBadge(rider.approval)}</td>
          ${actions ? `<td><button class="mini" data-approve="${rider.id}">Approve</button><button class="mini ghost" data-suspend="${rider.id}">Suspend</button></td>` : ''}
        </tr>
      `).join('')}
    </table>
  `;
}

function renderDashboard() {
  const online = riders.filter((rider) => rider.online && rider.approval === 'APPROVED');
  const pending = riders.filter((rider) => rider.approval === 'PENDING');
  const approved = riders.filter((rider) => rider.approval === 'APPROVED');
  content.innerHTML = `
    <section class="metrics">
      ${metric('Online Riders', online.length, 'Visible to dispatch')}
      ${metric('Registered Riders', riders.length, 'Total partner profiles')}
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
  content.innerHTML = `<article class="panel"><h3>Online Riders</h3>${riderRows(riders.filter((rider) => rider.online && rider.approval === 'APPROVED'))}</article>`;
}

function renderRegistered() {
  content.innerHTML = `<article class="panel"><h3>Registered Riders</h3>${riderRows(riders, true)}</article>`;
}

function renderApproval() {
  content.innerHTML = `<article class="panel"><h3>Rider Registration Approval</h3>${riderRows(riders.filter((rider) => rider.approval === 'PENDING'), true)}</article>`;
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

document.addEventListener('click', (event) => {
  const nav = event.target.closest('[data-view]');
  if (nav) {
    currentView = nav.dataset.view;
    render();
    return;
  }
  const approve = event.target.closest('[data-approve]');
  if (approve) {
    const rider = riders.find((item) => item.id === approve.dataset.approve);
    if (rider) rider.approval = 'APPROVED';
    render();
    return;
  }
  const suspend = event.target.closest('[data-suspend]');
  if (suspend) {
    const rider = riders.find((item) => item.id === suspend.dataset.suspend);
    if (rider) {
      rider.approval = 'SUSPENDED';
      rider.online = false;
    }
    render();
    return;
  }
  if (event.target.id === 'refreshBtn') render();
});

render();
