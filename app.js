const screen = document.querySelector("#screen");
const railButtons = document.querySelectorAll(".rail-btn");

const state = {
  current: "splash",
  phone: "",
  signupName: "",
  signupVehicle: "",
  registeredNumbers: JSON.parse(localStorage.getItem("registeredRiders") || "[]"),
  approvedNumbers: JSON.parse(localStorage.getItem("approvedRiders") || "[]"),
  otp: [],
  online: false,
  dark: false,
  ordersTab: "completed",
  earningsTab: "daily",
};

function setScreen(name) {
  state.current = name;
  railButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.screen === name));
  render();
}

function shell(content, opts = {}) {
  return `<div class="app-screen ${opts.className || ""}">${content}</div>`;
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
    <button class="primary" data-go="login">Start Riding</button>
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
    <button class="primary" id="continueLogin">Continue</button>
    <p class="bottom-note">New delivery partner? <span class="tiny-link" data-go="signup">Sign up for verification</span></p>
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
    <button class="primary" id="submitSignup">Submit for verification</button>
    <p class="bottom-note">Already signed up? <span class="tiny-link" data-go="login">Login</span></p>
  `);
}

function otp() {
  const digits = state.otp.map((num) => num || "");
  return shell(`
    ${topbar("", "", "login")}
    <h2>Verify OTP</h2>
    <p class="subtle">Enter the live OTP sent by Twilio to<br><b style="color:#101828">+91 ${state.phone}</b></p>
    <div class="otp-row">${digits.map((num) => `<div class="otp-box">${num}</div>`).join("")}</div>
    <p class="subtle" style="text-align:center">Resend OTP in <span id="timer">00:25</span></p>
    <div class="keypad">
      ${[1,2,3,4,5,6,7,8,9,"",0,"Del"].map((n) => `<button class="otp-key">${n}</button>`).join("")}
    </div>
  `);
}

function dashboard() {
  return shell(`
    <div class="topbar">
      <button class="icon-btn">Menu</button>
      <div class="online"><span class="dot ${state.online ? "" : "off"}"></span>You are <span class="${state.online ? "green" : "red"}">${state.online ? "Online" : "Offline"}</span></div>
      <button class="toggle ${state.online ? "" : "off"}" id="onlineToggle" aria-label="Online toggle"></button>
    </div>
    <div class="earn-card">
      <span>Today's Earnings</span>
      <strong>Rs 0.00</strong>
      <small>0 Orders Completed</small>
    </div>
    <div class="metrics">
      <div class="metric"><strong>00</strong><span>Completed</span></div>
      <div class="metric"><strong>${state.online ? "Live" : "Off"}</strong><span>Status</span></div>
      <div class="metric"><strong>Rs 0</strong><span>Incentive</span></div>
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
  return shell(`
    ${topbar("Earnings", "", "dashboard")}
    <span class="subtle">Today's Earnings</span>
    <div class="money">Rs 0.00</div>
    <div class="table">
      <div><span>Order Earnings</span><b>Rs 0.00</b></div>
      <div><span>Incentives</span><b>Rs 0.00</b></div>
      <div><span>Tips</span><b>Rs 0.00</b></div>
      <div><span>Adjustments</span><b>Rs 0.00</b></div>
    </div>
    <div class="section-title">Transactions</div>
    <div class="empty"><div><strong>No earnings yet</strong><span>Completed orders will appear here</span></div></div>
    ${tabbar("earnings")}
  `, { className: "scroll" });
}

function orders() {
  return shell(`
    ${topbar("My Orders", "", "dashboard")}
    <div class="segments" style="grid-template-columns:repeat(2,1fr)">
      <button class="${state.ordersTab === "completed" ? "active" : ""}" data-orders="completed">Completed</button>
      <button class="${state.ordersTab === "cancelled" ? "active" : ""}" data-orders="cancelled">Cancelled</button>
    </div>
    <div class="empty"><div><strong>No orders yet</strong><span>Assigned orders will appear here</span></div></div>
    ${tabbar("orders")}
  `, { className: "scroll" });
}

function profile() {
  return shell(`
    ${topbar("Profile", "", "dashboard")}
    <div class="profile-head"><div class="avatar"></div><div><b>${state.signupName || "Rider Partner"}</b><br><small class="subtle">Rider ID: Pending</small></div><span class="pill">Pending</span></div>
    <div class="empty"><div><strong>No approved profile yet</strong><span>Admin approval is required.</span></div></div>
    ${tabbar("profile")}
  `);
}

const views = {
  splash,
  login,
  signup,
  otp,
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
  document.body.classList.toggle("dark", state.dark);
  screen.innerHTML = views[state.current]();
}

document.addEventListener("click", (event) => {
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
    if (state.otp.length === 6) {
      localStorage.setItem("riderLoggedIn", "true");
      setTimeout(() => setScreen("dashboard"), 250);
    }
    render();
    return;
  }

  const ordersTab = event.target.closest("[data-orders]");
  if (ordersTab) {
    state.ordersTab = ordersTab.dataset.orders;
    render();
    return;
  }

  if (event.target.id === "continueLogin") {
    if (state.phone.length !== 10) {
      const field = document.querySelector(".field");
      field.style.borderColor = "var(--red)";
      field.querySelector("input").placeholder = "Enter a valid 10-digit number";
      return;
    }
    if (!state.registeredNumbers.includes(state.phone)) {
      setScreen("signup");
      return;
    }
    if (!state.approvedNumbers.includes(state.phone)) {
      alert("Your rider registration is pending admin approval.");
      return;
    }
    state.otp = [];
    setScreen("otp");
    return;
  }

  if (event.target.id === "submitSignup") {
    const valid = state.signupName.trim().length >= 2 && state.phone.length === 10 && state.signupVehicle.trim().length >= 4;
    if (valid) {
      if (!state.registeredNumbers.includes(state.phone)) state.registeredNumbers.push(state.phone);
      localStorage.setItem("registeredRiders", JSON.stringify(state.registeredNumbers));
      alert("Registration submitted. Admin approval is required before login.");
      setScreen("login");
    }
    return;
  }

  if (event.target.id === "onlineToggle") {
    state.online = !state.online;
    render();
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
render();
