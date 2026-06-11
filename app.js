const screen = document.querySelector("#screen");
const railButtons = document.querySelectorAll(".rail-btn");

const apiBaseUrl = (window.EVSPEARE_CONFIG?.apiBaseUrl || localStorage.getItem("riderApiBaseUrl") || "").replace(/\/$/, "");
const savedToken = localStorage.getItem("riderToken") || "";

const state = {
  current: "splash",
  phone: "",
  signupName: "",
  signupVehicle: "",
  otp: [],
  token: savedToken,
  user: JSON.parse(localStorage.getItem("riderUser") || "null"),
  pendingApproval: localStorage.getItem("pendingApproval") === "true",
  pendingPhone: localStorage.getItem("pendingApprovalPhone") || "",
  profile: null,
  online: false,
  orders: [],
  earnings: { total: 0, transactions: [] },
  loading: false,
  message: "",
  ordersTab: "completed",
};

let ringAudioContext = null;
let ringTimer = null;
let ringingOrderId = null;
let isPollingOrders = false;

const ERROR_MESSAGES = {
  OTP_RATE_LIMITED: "Too many OTP attempts. Please wait and try again.",
  OTP_PROVIDER_NOT_CONFIGURED: "OTP service is not configured yet.",
  OTP_DELIVERY_FAILED: "Could not send OTP. Please try again.",
  OTP_VERIFICATION_FAILED: "Could not verify OTP. Please try again.",
  INVALID_OTP: "OTP is incorrect or expired.",
  RIDER_SIGNUP_REQUIRED: "This number is not registered. Please sign up first.",
  RIDER_APPROVAL_PENDING: "Your rider registration is pending admin approval.",
  RIDER_SUSPENDED: "Your rider account is suspended. Please contact support.",
  RIDER_SIGNUP_FAILED: "Could not submit signup. Please try again.",
  AUTH_REQUIRED: "Please login again.",
  INVALID_TOKEN: "Session expired. Please login again.",
};

const profileCards = [
  { screen: "vehicle", icon: "V", title: "Vehicle", note: "Registration and fitness" },
  { screen: "documents", icon: "D", title: "Documents", note: "KYC and approvals" },
  { screen: "settings", icon: "S", title: "Settings", note: "App preferences" },
  { screen: "support", icon: "H", title: "Support", note: "Help and disputes" },
  { screen: "terms", icon: "T", title: "Terms & Conditions", note: "Platform rules" },
  { screen: "privacy", icon: "P", title: "Privacy Policy", note: "Data collection and rights" },
  { screen: "agreement", icon: "A", title: "User Agreement", note: "Rider engagement" },
  { screen: "payments", icon: "Rs", title: "Payment Policy", note: "Payouts and deductions" },
  { screen: "grievance", icon: "G", title: "Grievance & Compliance", note: "Indian law contacts" },
  { screen: "conduct", icon: "C", title: "Code of Conduct", note: "Safety and service" },
];

const policyContent = {
  terms: {
    title: "Terms & Conditions",
    sections: [
      ["Eligibility", "You must be legally capable of contracting in India, hold a valid mobile number, provide accurate KYC and vehicle details, and maintain approvals required for delivery work."],
      ["Account Use", "Your account is personal to you. Do not share OTPs, login credentials, rider devices, customer data, or assigned orders with another person."],
      ["Orders", "Orders are assigned based on availability, approval status, location, workload, and operational rules. One active order may be assigned at a time."],
      ["Service Standards", "You must pick up, transport, and deliver items carefully, follow app instructions, keep customers informed through approved channels, and complete delivery proof when requested."],
      ["Suspension", "The platform may pause or block access for fraud risk, unsafe conduct, repeated cancellations, false documents, customer harm, payment misuse, or legal compliance reasons."],
      ["Law", "These terms are governed by Indian law. Courts or forums with jurisdiction over the operating city/state may handle disputes, subject to applicable consumer, labour, transport, and technology laws."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["Data Collected", "We may collect name, phone number, vehicle details, KYC documents, profile photo, device information, app activity, support messages, payout details, order activity, and live or background location when required for delivery."],
      ["Purpose", "Data is used for account verification, rider approval, order assignment, route support, fraud prevention, safety, payouts, customer support, tax/accounting records, audits, and legal compliance."],
      ["Consent", "Where consent is required, you may withdraw it through support or settings. Withdrawal may limit services that depend on that data, such as live order assignment or payout processing."],
      ["Sharing", "Data may be shared with warehouses, customers where needed for delivery, payment partners, map/OTP providers, cloud vendors, auditors, law enforcement, and regulators when lawful or necessary."],
      ["Rights", "Subject to applicable law, you may request access, correction, update, erasure, grievance redressal, and nomination for data rights. Some records may be retained for legal, fraud, tax, or dispute purposes."],
      ["Security", "We use reasonable technical and organisational measures, but you must protect your phone, OTP, app session, and documents from unauthorised access."],
    ],
  },
  agreement: {
    title: "User Agreement",
    sections: [
      ["Independent Access", "Rider access is enabled after approval and may depend on location, demand, documents, vehicle status, and compliance checks."],
      ["Duties", "You agree to maintain valid documents, obey traffic rules, avoid restricted items, protect customer privacy, report incidents, and follow pickup and delivery instructions."],
      ["No Misuse", "Do not manipulate GPS, mark false delivery, collect unauthorised cash, substitute goods, create duplicate accounts, harass users, or misuse platform data."],
      ["Equipment", "You are responsible for your vehicle, phone, internet, safety gear, fuel, and lawful operation unless the platform separately provides written support."],
      ["Records", "Order timestamps, GPS, call/support logs, payment records, delivery proof, and audit logs may be used to resolve disputes."],
      ["Termination", "Either side may stop platform use. Existing dues, investigations, customer complaints, document obligations, and legal records may continue after deactivation."],
    ],
  },
  payments: {
    title: "Payment Policy",
    sections: [
      ["Earnings", "Earnings may include base pay, distance pay, surge, tips, incentives, reimbursements, and adjustments shown in the app or backend records."],
      ["Payouts", "Payouts are processed to approved payment details after internal checks. Timelines may vary due to bank holidays, payment partner issues, KYC review, or dispute holds."],
      ["COD", "Cash collected from customers must be deposited or settled as instructed. Unsettled COD may be adjusted against earnings or recovered as permitted by law and contract."],
      ["Deductions", "Deductions may apply for cancellations attributable to rider conduct, missing goods, false delivery, penalties, advances, cash settlement gaps, tax withholding, or legally required recoveries."],
      ["Disputes", "Payment disputes should be raised through support with order ID and evidence. Corrections, if approved, will reflect in a later payout cycle."],
      ["Taxes", "You are responsible for your personal tax compliance unless tax deduction, invoice, or reporting obligations are handled by the platform under applicable law."],
    ],
  },
  grievance: {
    title: "Grievance & Compliance",
    sections: [
      ["Support Channel", "Use Help & Support in the app for operational issues, payment disputes, document review, account status, safety incidents, and data requests."],
      ["Response", "The platform will review requests based on priority, available evidence, legal obligations, and operational records."],
      ["Data Grievance", "Privacy and data requests may include access, correction, update, erasure, consent withdrawal, and complaint escalation where applicable."],
      ["IT Compliance", "For unlawful content, impersonation, cyber incidents, or platform misuse, include screenshots, order IDs, phone number, date, and a clear description."],
      ["Emergency", "For accidents, threats, police matters, medical emergencies, or unsafe deliveries, contact local emergency services first and then notify support."],
      ["Records", "Complaints and resolutions may be retained for audit, legal defence, regulatory, fraud prevention, and service improvement purposes."],
    ],
  },
  conduct: {
    title: "Code of Conduct",
    sections: [
      ["Customer Respect", "Be polite, avoid arguments, do not request personal information unrelated to delivery, and use approved contact channels only."],
      ["Safety", "Follow traffic laws, avoid rash driving, do not deliver under the influence of alcohol or drugs, and do not carry unauthorised passengers for orders."],
      ["Product Care", "Keep packages sealed, dry, and secure. Report damaged, missing, restricted, or suspicious items before completing the order."],
      ["Integrity", "Do not fake location, delivery proof, customer OTP, cash collection, item status, or order completion."],
      ["Privacy", "Do not photograph, store, share, or misuse customer address, phone number, order details, or warehouse information except as needed for delivery."],
      ["Incident Reporting", "Report accidents, theft, customer disputes, police stops, payment issues, and app errors promptly with order ID and evidence."],
    ],
  },
};

function phoneWithCountry() {
  return `+91${state.phone}`;
}

function setMessage(message) {
  state.message = message || "";
  render();
}

function setLoading(loading) {
  state.loading = loading;
  render();
}

async function apiRequest(path, options = {}) {
  if (!apiBaseUrl) throw new Error("Backend API URL is not configured.");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || ERROR_MESSAGES[data.error] || data.error || "Request failed.");
  }
  return data;
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  state.pendingApproval = false;
  state.pendingPhone = "";
  localStorage.setItem("riderToken", token);
  localStorage.setItem("riderUser", JSON.stringify(user || null));
  localStorage.removeItem("pendingApproval");
  localStorage.removeItem("pendingApprovalPhone");
}

function clearSession() {
  state.token = "";
  state.user = null;
  state.profile = null;
  localStorage.removeItem("riderToken");
  localStorage.removeItem("riderUser");
}

function setPendingApproval(phone) {
  state.pendingApproval = true;
  state.pendingPhone = phone || phoneWithCountry();
  state.token = "";
  state.user = null;
  localStorage.setItem("pendingApproval", "true");
  localStorage.setItem("pendingApprovalPhone", state.pendingPhone);
  localStorage.removeItem("riderToken");
  localStorage.removeItem("riderUser");
}

function clearPendingApproval() {
  state.pendingApproval = false;
  state.pendingPhone = "";
  localStorage.removeItem("pendingApproval");
  localStorage.removeItem("pendingApprovalPhone");
}

function activeOrders() {
  return state.orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status));
}

function pendingAssignedOrder() {
  return state.orders.find((order) => order.status === "ASSIGNED") || null;
}

function playRingTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    ringAudioContext ||= new AudioContext();
    if (ringAudioContext.state === "suspended") ringAudioContext.resume();
    const oscillator = ringAudioContext.createOscillator();
    const gain = ringAudioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ringAudioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ringAudioContext.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ringAudioContext.currentTime + 0.45);
    oscillator.connect(gain).connect(ringAudioContext.destination);
    oscillator.start();
    oscillator.stop(ringAudioContext.currentTime + 0.5);
  } catch (_error) {
    // Some browsers block audio until user interaction; the visual popup still works.
  }
}

function stopOrderRing() {
  if (ringTimer) clearInterval(ringTimer);
  ringTimer = null;
  ringingOrderId = null;
}

function updateOrderRing() {
  const order = pendingAssignedOrder();
  if (!order) {
    stopOrderRing();
    return;
  }
  if (ringingOrderId === order.id) return;
  stopOrderRing();
  ringingOrderId = order.id;
  playRingTone();
  ringTimer = setInterval(playRingTone, 1200);
}

async function loadDashboardData() {
  if (!state.token) return;
  try {
    const [profile, earnings, orders] = await Promise.all([
      apiRequest("/profile"),
      apiRequest("/earnings").catch(() => ({ total: 0, transactions: [] })),
      apiRequest("/orders").catch(() => ({ orders: [] })),
    ]);
    state.profile = profile;
    state.online = Boolean(profile.online_status);
    state.earnings = {
      total: Number(earnings.total || 0),
      transactions: earnings.transactions || [],
    };
    state.orders = orders.orders || [];
  } catch (error) {
    if (error.message.includes("login") || error.message.includes("expired")) clearSession();
    state.message = error.message;
  }
}

async function pollDashboardData() {
  if (!state.token || state.pendingApproval || isPollingOrders) return;
  isPollingOrders = true;
  await loadDashboardData();
  render();
  isPollingOrders = false;
}

async function goToDashboard() {
  state.current = "dashboard";
  state.message = "";
  render();
  await loadDashboardData();
  render();
}

function setScreen(name) {
  if (state.pendingApproval && name !== "pendingApproval" && name !== "login") {
    state.current = "pendingApproval";
    render();
    return;
  }
  state.current = name;
  state.message = "";
  railButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.screen === name));
  if (["dashboard", "earnings", "orders", "profile"].includes(name)) {
    goToDashboard().then(() => {
      if (name !== "dashboard") {
        state.current = name;
        render();
      }
    });
    return;
  }
  render();
}

function shell(content, opts = {}) {
  return `<div class="app-screen ${opts.className || ""}">${content}${orderOfferModal()}</div>`;
}

function messageBlock() {
  return state.message ? `<p class="subtle" style="color:#c62828;text-align:center">${state.message}</p>` : "";
}

function topbar(title, right = "", back = "dashboard") {
  return `
    <div class="topbar">
      <button class="back" data-go="${back}" aria-label="Back">Back</button>
      <div class="title">${title}</div>
      ${right || "<span style='width:34px'></span>"}
    </div>
  `;
}

function tabbar(active) {
  const tabs = [
    ["dashboard", "Home"],
    ["earnings", "Earnings"],
    ["orders", "Orders"],
    ["profile", "Profile"],
  ];
  return `<div class="tabbar">${tabs.map(([key, label]) => `
    <button class="${active === key ? "active" : ""}" data-go="${key}"><b>${label[0]}</b>${label}</button>
  `).join("")}</div>`;
}

function orderOfferModal() {
  const order = pendingAssignedOrder();
  if (!order || !state.token || state.pendingApproval) return "";
  return `
    <div class="modal-dim order-offer">
      <div class="modal">
        <div class="modal-head">
          <div>
            <span class="ring-pill">Ringing until action</span>
            <h2>New Order</h2>
            <p class="subtle">${order.public_id || order.id}</p>
          </div>
          <strong>${Number(order.total_payout || 0).toFixed(2)}</strong>
        </div>
        <div class="route-row"><span>A</span><div><b>${order.store_name || "Warehouse"}</b><small>${order.store_address || "Pickup location"}</small></div></div>
        <div class="route-row"><span>B</span><div><b>${order.customer_name || "Customer"}</b><small>${order.customer_address || "Delivery address"}</small></div></div>
        <div class="payout"><span>${order.payment_method || "Payment"}</span><strong>Rs ${Number(order.payment_collect_amount || 0).toFixed(2)}</strong></div>
        <div class="offer-actions">
          <button class="secondary" id="rejectOrder" data-order-id="${order.id}">Reject</button>
          <button class="primary" id="acceptOrder" data-order-id="${order.id}">Accept</button>
        </div>
      </div>
    </div>
  `;
}

function splash() {
  return shell(`
    <img class="splash-logo" src="rider_app/assets/icon.png" alt="evspeare delivery partner">
    <div class="status-copy">
      <h2>evspeare</h2>
      <p>Delivery Partner</p>
    </div>
    <button class="primary" data-go="${state.pendingApproval ? "pendingApproval" : (state.token ? "dashboard" : "login")}">Start Riding</button>
    <div class="dots"><span></span><span></span><span></span></div>
  `, { className: "blue-screen" });
}

function login() {
  return shell(`
    <div style="padding-top:34px">
      <h2>Login</h2>
      <p class="subtle">Enter your registered mobile number to continue</p>
    </div>
    <img class="login-logo" src="rider_app/assets/icon.png" alt="evspeare">
    <label class="field"><b>+91</b><input id="phoneInput" inputmode="numeric" maxlength="10" placeholder="Enter mobile number" value="${state.phone}"></label>
    ${messageBlock()}
    <button class="primary" id="continueLogin">${state.loading ? "Sending..." : "Continue"}</button>
    <p class="bottom-note">New rider? Verify OTP first, then signup will open automatically.</p>
  `);
}

function signup() {
  return shell(`
    ${topbar("", "", "login")}
    <h2>Rider Signup</h2>
    <p class="subtle">Create your delivery partner profile. Admin approval is required before login.</p>
    <label class="field single"><input id="signupName" placeholder="Full name" value="${state.signupName}"></label>
    <label class="field"><b>+91</b><input id="signupPhone" inputmode="numeric" maxlength="10" placeholder="Mobile number" value="${state.phone}"></label>
    <label class="field single"><input id="signupVehicle" placeholder="Vehicle number" value="${state.signupVehicle}"></label>
    ${messageBlock()}
    <button class="primary" id="submitSignup">${state.loading ? "Submitting..." : "Submit for verification"}</button>
    <p class="bottom-note">Already signed up? <span class="tiny-link" data-go="login">Login</span></p>
  `);
}

function pendingApproval() {
  return shell(`
    <div style="padding-top:70px;text-align:center">
      <span class="pill">Pending</span>
      <h2 style="margin-top:18px">Waiting for approval</h2>
      <p class="subtle">Your rider registration is submitted. Admin approval is required before you can use the app.</p>
      <p class="subtle"><b style="color:#075DFF">${state.pendingPhone}</b></p>
      ${messageBlock()}
      <button class="primary" id="checkPendingApproval">${state.loading ? "Checking..." : "Check approval status"}</button>
      <div style="height:10px"></div>
      <button class="secondary" id="changePendingPhone">Use another number</button>
    </div>
  `);
}

function otp() {
  const digits = Array.from({ length: 6 }, (_, index) => state.otp[index] || "");
  return shell(`
    ${topbar("", "", "login")}
    <h2>Verify OTP</h2>
    <p class="subtle">Enter the live OTP sent by Twilio to<br><b style="color:#101828">+91 ${state.phone}</b></p>
    <div class="otp-row">${digits.map((num) => `<div class="otp-box">${num}</div>`).join("")}</div>
    ${messageBlock()}
    <div class="keypad">
      ${[1,2,3,4,5,6,7,8,9,"",0,"Del"].map((n) => `<button class="otp-key">${n}</button>`).join("")}
    </div>
  `);
}

function dashboard() {
  const completed = state.orders.filter((order) => order.status === "DELIVERED").length;
  const currentOrders = activeOrders();
  return shell(`
    <div class="topbar">
      <button class="icon-btn">Menu</button>
      <div class="online"><span class="dot ${state.online ? "" : "off"}"></span>You are <span class="${state.online ? "green" : "red"}">${state.online ? "Online" : "Offline"}</span></div>
      <button class="toggle ${state.online ? "" : "off"}" id="onlineToggle" aria-label="Online toggle"></button>
    </div>
    ${messageBlock()}
    <div class="earn-card">
      <span>Today's Earnings</span>
      <strong>Rs ${Number(state.earnings.total || 0).toFixed(2)}</strong>
      <small>${completed} Orders Completed</small>
    </div>
    <div class="metrics">
      <div class="metric"><strong>${String(completed).padStart(2, "0")}</strong><span>Completed</span></div>
      <div class="metric"><strong>${state.online ? "Live" : "Off"}</strong><span>Status</span></div>
      <div class="metric"><strong>${currentOrders.length}</strong><span>Current</span></div>
    </div>
    <div class="section-title">New Order</div>
    <div class="empty">
      <div><div class="bag-icon">Box</div><strong>${currentOrders[0] ? "Order in progress" : "No new orders"}</strong><span>${currentOrders[0] ? currentOrders[0].status : (state.online ? "Waiting for assignment" : "Go online to receive orders")}</span></div>
    </div>
    ${tabbar("dashboard")}
  `);
}

function emptyWorkflow(title, message, back = "dashboard") {
  return shell(`
    ${topbar(title, "", back)}
    <div class="empty" style="height:260px">
      <div><strong>${message}</strong><span>Only real backend data will be shown here.</span></div>
    </div>
    ${["earnings", "orders", "profile"].includes(state.current) ? tabbar(state.current) : ""}
  `, { className: "scroll" });
}

function earnings() {
  const transactions = state.earnings.transactions || [];
  return shell(`
    ${topbar("Earnings", "", "dashboard")}
    <span class="subtle">Total Earnings</span>
    <div class="money">Rs ${Number(state.earnings.total || 0).toFixed(2)}</div>
    <div class="section-title">Transactions</div>
    ${transactions.length ? `<div class="table">${transactions.map((txn) => `
      <div><span>${txn.order_id || txn.id}</span><b>Rs ${Number(txn.total || 0).toFixed(2)}</b></div>
    `).join("")}</div>` : `<div class="empty"><div><strong>No earnings yet</strong><span>Completed orders will appear here</span></div></div>`}
    ${tabbar("earnings")}
  `, { className: "scroll" });
}

function orders() {
  const currentOrders = activeOrders();
  return shell(`
    ${topbar("My Orders", "", "dashboard")}
    ${currentOrders.length ? `<div class="table">${currentOrders.map((order) => `
      <div><span>${order.public_id || order.id}<br><small>${order.status}</small></span><b>Rs ${Number(order.total_payout || 0).toFixed(2)}</b></div>
    `).join("")}</div>` : `<div class="empty"><div><strong>No current order</strong><span>Only your assigned live order will appear here</span></div></div>`}
    ${tabbar("orders")}
  `, { className: "scroll" });
}

function profile() {
  const name = state.profile?.name || state.user?.name || "Rider Partner";
  const riderCode = state.profile?.rider_code || "Pending";
  const approval = state.profile?.approval_status || "Pending";
  return shell(`
    ${topbar("Profile", "", "dashboard")}
    <div class="profile-head"><div class="avatar"></div><div><b>${name}</b><br><small class="subtle">Rider ID: ${riderCode}</small></div><span class="pill">${approval}</span></div>
    <div class="table compact">
      <div><span>Phone</span><b>${state.profile?.phone || state.user?.phone || "-"}</b></div>
      <div><span>Vehicle</span><b>${state.profile?.vehicle_number || "-"}</b></div>
      <div><span>Status</span><b>${state.online ? "Online" : "Offline"}</b></div>
    </div>
    <div class="profile-card-grid">
      ${profileCards.map((card) => `
        <button class="profile-card" data-go="${card.screen}">
          <span>${card.icon}</span>
          <b>${card.title}</b>
          <small>${card.note}</small>
        </button>
      `).join("")}
    </div>
    <button class="secondary" id="logoutBtn">Logout</button>
    ${tabbar("profile")}
  `, { className: "scroll" });
}

function simpleInfoPage(title, rows) {
  return shell(`
    ${topbar(title, "", "profile")}
    <div class="card info-list">
      ${rows.map(([label, value]) => `
        <div class="info-row"><b>${label}</b><span>${value}</span></div>
      `).join("")}
    </div>
    ${tabbar("profile")}
  `, { className: "scroll" });
}

function settings() {
  return shell(`
    ${topbar("Settings", "", "profile")}
    <div class="card">
      <div class="settings-row"><span>Order alerts</span><button class="toggle small" aria-label="Order alerts"></button></div>
      <div class="settings-row"><span>Location sharing</span><button class="toggle small" aria-label="Location sharing"></button></div>
      <div class="settings-row"><span>Dark mode</span><button class="toggle small off" aria-label="Dark mode"></button></div>
      <div class="settings-row"><span>Hindi language</span><button class="toggle small off" aria-label="Hindi language"></button></div>
    </div>
    ${tabbar("profile")}
  `, { className: "scroll" });
}

function support() {
  return shell(`
    ${topbar("Support", "", "profile")}
    <div class="card info-list">
      <div class="info-row"><b>Payment issue</b><span>Raise with order ID</span></div>
      <div class="info-row"><b>Order issue</b><span>Pickup, damage, address</span></div>
      <div class="info-row"><b>Account issue</b><span>Approval, login, documents</span></div>
      <div class="info-row"><b>Emergency</b><span>Contact local emergency services first</span></div>
    </div>
    <button class="primary" data-go="grievance">Open Grievance Policy</button>
    ${tabbar("profile")}
  `, { className: "scroll" });
}

function policyPage(key) {
  const content = policyContent[key];
  return shell(`
    ${topbar(content.title, "", "profile")}
    <div class="policy-stack">
      ${content.sections.map(([heading, body]) => `
        <article class="policy-card">
          <h3>${heading}</h3>
          <p>${body}</p>
        </article>
      `).join("")}
    </div>
    ${tabbar("profile")}
  `, { className: "scroll" });
}

const views = {
  splash,
  login,
  signup,
  otp,
  pendingApproval,
  dashboard,
  orderPopup: dashboard,
  map: () => emptyWorkflow("Map", "No active route yet"),
  details: () => emptyWorkflow("Order Details", "No assigned order yet"),
  pickup: () => emptyWorkflow("Pickup", "No pickup assigned yet"),
  drop: () => emptyWorkflow("Delivery", "No delivery assigned yet"),
  earnings,
  orders,
  profile,
  vehicle: () => simpleInfoPage("Vehicle", [
    ["Vehicle number", state.profile?.vehicle_number || "-"],
    ["Approval", state.profile?.approval_status || "Pending"],
    ["Fitness", "Required where applicable"],
    ["Insurance", "Required where applicable"],
  ]),
  documents: () => simpleInfoPage("Documents", [
    ["Identity KYC", "Required"],
    ["Driving licence", "Required where applicable"],
    ["Vehicle RC", "Required"],
    ["Bank details", "Required for payouts"],
  ]),
  settings,
  support,
  terms: () => policyPage("terms"),
  privacy: () => policyPage("privacy"),
  agreement: () => policyPage("agreement"),
  payments: () => policyPage("payments"),
  grievance: () => policyPage("grievance"),
  conduct: () => policyPage("conduct"),
};

function render() {
  screen.innerHTML = views[state.current]();
  updateOrderRing();
}

async function handleLoginContinue() {
  if (state.phone.length !== 10) {
    setMessage("Enter a valid 10-digit mobile number.");
    return;
  }
  setLoading(true);
  try {
    const otpResult = await apiRequest("/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone: phoneWithCountry() }),
    });
    if (otpResult.provider === "dev" && !otpResult.devOtp) {
      throw new Error("OTP service is still in dev mode. Set OTP_PROVIDER=twilio on backend.");
    }
    state.otp = [];
    state.current = "otp";
  } catch (error) {
    state.message = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function handleSignup() {
  const valid = state.signupName.trim().length >= 2 && state.phone.length === 10 && state.signupVehicle.trim().length >= 4;
  if (!valid) {
    setMessage("Enter name, 10-digit phone number, and vehicle number.");
    return;
  }
  setLoading(true);
  try {
    await apiRequest("/rider-signup", {
      method: "POST",
      body: JSON.stringify({
        name: state.signupName.trim(),
        phone: phoneWithCountry(),
        vehicleNumber: state.signupVehicle.trim(),
      }),
    });
    setPendingApproval(phoneWithCountry());
    state.current = "pendingApproval";
    state.message = "";
  } catch (error) {
    state.message = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function handleOtpComplete() {
  setLoading(true);
  try {
    const data = await apiRequest("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone: phoneWithCountry(), otp: state.otp.join("") }),
    });
    if (data.requiresSignup) {
      state.current = "signup";
      state.message = "This number is not registered. Please sign up first.";
      render();
      return;
    }
    if (data.pendingApproval) {
      setPendingApproval(data.phone || phoneWithCountry());
      state.current = "pendingApproval";
      state.message = "";
      render();
      return;
    }
    saveSession(data.token, data.user);
    await goToDashboard();
  } catch (error) {
    state.message = error.message;
    state.otp = [];
    render();
  } finally {
    state.loading = false;
  }
}

document.addEventListener("click", async (event) => {
  if (ringAudioContext?.state === "suspended") ringAudioContext.resume().catch(() => {});

  const go = event.target.closest("[data-go]");
  if (go) {
    setScreen(go.dataset.go);
    return;
  }

  const key = event.target.closest(".otp-key");
  if (key) {
    const value = key.textContent.trim();
    if (value === "Del") state.otp.pop();
    if (/^\d$/.test(value) && state.otp.length < 6) state.otp.push(value);
    render();
    if (state.otp.length === 6) await handleOtpComplete();
    return;
  }

  if (event.target.id === "continueLogin") {
    await handleLoginContinue();
    return;
  }

  if (event.target.id === "submitSignup") {
    await handleSignup();
    return;
  }

  if (event.target.id === "onlineToggle") {
    try {
      const nextOnline = !state.online;
      state.online = nextOnline;
      render();
      await apiRequest(nextOnline ? "/online" : "/offline", {
        method: "POST",
        body: nextOnline ? JSON.stringify({ latitude: 0, longitude: 0 }) : undefined,
      });
      await loadDashboardData();
      render();
    } catch (error) {
      state.online = !state.online;
      state.message = error.message;
      render();
    }
    return;
  }

  if (event.target.id === "acceptOrder") {
    try {
      stopOrderRing();
      await apiRequest("/accept-order", {
        method: "POST",
        body: JSON.stringify({ orderId: event.target.dataset.orderId }),
      });
      await loadDashboardData();
      state.current = "dashboard";
      render();
    } catch (error) {
      state.message = error.message;
      render();
    }
    return;
  }

  if (event.target.id === "rejectOrder") {
    try {
      stopOrderRing();
      await apiRequest("/reject-order", {
        method: "POST",
        body: JSON.stringify({ orderId: event.target.dataset.orderId, reason: "Rejected by rider" }),
      });
      await loadDashboardData();
      state.current = "dashboard";
      render();
    } catch (error) {
      state.message = error.message;
      render();
    }
    return;
  }

  if (event.target.id === "logoutBtn") {
    stopOrderRing();
    clearSession();
    setScreen("login");
  }

  if (event.target.id === "changePendingPhone") {
    clearPendingApproval();
    clearSession();
    setScreen("login");
  }

  if (event.target.id === "checkPendingApproval") {
    setLoading(true);
    try {
      const status = await apiRequest("/rider-status", {
        method: "POST",
        body: JSON.stringify({ phone: state.pendingPhone || phoneWithCountry() }),
      });
      if (status.canLogin) {
        clearPendingApproval();
        state.message = "Approved. Please login with OTP.";
        setScreen("login");
      } else {
        state.message = "Still waiting for admin approval.";
        state.current = "pendingApproval";
        render();
      }
    } catch (error) {
      state.message = error.message;
      render();
    } finally {
      state.loading = false;
      render();
    }
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "phoneInput" || event.target.id === "signupPhone") {
    state.phone = event.target.value.replace(/\D/g, "").slice(0, 10);
    event.target.value = state.phone;
  }
  if (event.target.id === "signupName") state.signupName = event.target.value;
  if (event.target.id === "signupVehicle") {
    state.signupVehicle = event.target.value.toUpperCase();
    event.target.value = state.signupVehicle;
  }
});

railButtons.forEach((button) => button.addEventListener("click", () => setScreen(button.dataset.screen)));
if (state.pendingApproval) state.current = "pendingApproval";
render();

setInterval(async () => {
  await pollDashboardData();
}, 5000);
