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
  return `<div class="app-screen ${opts.className || ""}">${content}</div>`;
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
      <div class="metric"><strong>${state.orders.length}</strong><span>Assigned</span></div>
    </div>
    <div class="section-title">New Order</div>
    <div class="empty">
      <div><div class="bag-icon">Box</div><strong>No new orders</strong><span>${state.online ? "Waiting for assignment" : "Go online to receive orders"}</span></div>
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
  return shell(`
    ${topbar("My Orders", "", "dashboard")}
    ${state.orders.length ? `<div class="table">${state.orders.map((order) => `
      <div><span>${order.public_id || order.id}<br><small>${order.status}</small></span><b>Rs ${Number(order.total_payout || 0).toFixed(2)}</b></div>
    `).join("")}</div>` : `<div class="empty"><div><strong>No orders yet</strong><span>Assigned orders will appear here</span></div></div>`}
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
    <div class="table">
      <div><span>Phone</span><b>${state.profile?.phone || state.user?.phone || "-"}</b></div>
      <div><span>Vehicle</span><b>${state.profile?.vehicle_number || "-"}</b></div>
      <div><span>Status</span><b>${state.online ? "Online" : "Offline"}</b></div>
    </div>
    <button class="secondary" id="logoutBtn">Logout</button>
    ${tabbar("profile")}
  `);
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
  vehicle: () => emptyWorkflow("Vehicle Info", "No approved vehicle record yet", "profile"),
  documents: () => emptyWorkflow("Documents", "No documents uploaded yet", "profile"),
  settings: () => emptyWorkflow("Settings", "No settings configured yet", "profile"),
  support: () => emptyWorkflow("Help & Support", "No support tickets yet", "profile"),
};

function render() {
  screen.innerHTML = views[state.current]();
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

  if (event.target.id === "logoutBtn") {
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
