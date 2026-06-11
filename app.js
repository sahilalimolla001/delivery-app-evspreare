const screen = document.querySelector("#screen");
const railButtons = document.querySelectorAll(".rail-btn");

const state = {
  current: "splash",
  phone: "",
  signupName: "",
  signupVehicle: "",
  registeredNumbers: ["9876543210"],
  otp: ["2", "4", "6", "8", "1", "3"],
  orderAccepted: false,
  dark: false,
  ordersTab: "completed",
  earningsTab: "daily",
};

const order = {
  id: "#DN1254876",
  store: "Daily Needs Store",
  customer: "Rohit Sharma",
  pickup: "45, 5th Main Rd, HSR Layout, Bengaluru, Karnataka 560102",
  drop: "12, 2nd Cross Rd, HSR Layout, Bengaluru, Karnataka 560102",
  payout: "₹46.50",
};

const icons = {
  home: "⌂",
  earn: "▤",
  orders: "▣",
  profile: "♙",
  call: "☎",
  chat: "◉",
  doc: "▧",
  help: "?",
  bike: "◒",
  bank: "₹",
  star: "★",
  info: "i",
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
      <button class="back" data-go="${back}" aria-label="Back">‹</button>
      <div class="title">${title}</div>
      ${right || "<span style='width:34px'></span>"}
    </div>
  `;
}

function tabbar(active) {
  const tabs = [
    ["dashboard", icons.home, "Home"],
    ["earnings", icons.earn, "Earnings"],
    ["orders", icons.orders, "Orders"],
    ["profile", icons.profile, "Profile"],
  ];
  return `<div class="tabbar">${tabs.map(([key, icon, label]) => `
    <button class="${active === key ? "active" : ""}" data-go="${key}"><b>${icon}</b>${label}</button>
  `).join("")}</div>`;
}

function splash() {
  return shell(`
    <img class="splash-logo" src="rider_app/assets/icon.png" alt="evspeare delivery partner">
    <div class="status-copy">
      <h2>evspeare</h2>
      <p>Delivery Partner</p>
    </div>
    <button class="primary" data-go="${localStorage.getItem("riderLoggedIn") ? "dashboard" : "login"}">Start Riding</button>
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
    <div class="signup-spacer"></div>
    <button class="secondary social-login" data-go="dashboard">Login with Google</button>
    <div style="height:10px"></div>
    <button class="secondary" data-go="dashboard">●&nbsp; Login with Apple</button>
    <p class="bottom-note">New delivery partner? <span class="tiny-link" data-go="signup">Sign up for verification</span></p>
  `);
}

function signup() {
  return shell(`
    ${topbar("", "", "login")}
    <h2>Rider Signup</h2>
    <p class="subtle">Create your delivery partner profile. Your account will remain pending until verification is approved.</p>
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
    <p class="subtle">We've sent a 6 digit code to<br><b style="color:#101828">+91 ${state.phone || "98765 43210"}</b> <span class="tiny-link" data-go="login">Change</span></p>
    <div class="dev-otp"><span>Development OTP</span><b>246813</b></div>
    <div class="otp-row">${digits.map((num) => `<div class="otp-box">${num}</div>`).join("")}</div>
    <p class="subtle" style="text-align:center">Resend OTP in <span id="timer">00:25</span></p>
    <div class="keypad">
      ${[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((n) => `<button class="otp-key">${n}</button>`).join("")}
    </div>
  `);
}

function dashboard(withModal = false) {
  return shell(`
    <div class="topbar">
      <button class="icon-btn">☰</button>
      <div class="online"><span class="dot"></span>You are <span class="green">Online</span></div>
      <button class="toggle" id="onlineToggle" aria-label="Online toggle"></button>
    </div>
    <div class="earn-card">
      <span>Today's Earnings</span>
      <strong>₹1,245.80</strong>
      <small>6 Orders Completed</small>
    </div>
    <div class="metrics">
      <div class="metric"><strong>06</strong><span>Completed</span></div>
      <div class="metric"><strong>01:45</strong><span>Hours Online</span></div>
      <div class="metric"><strong>₹180</strong><span>Incentive</span></div>
    </div>
    <div class="section-title">New Order</div>
    <div class="empty">
      <div><div class="bag-icon">▣</div><strong>No new orders</strong><span>You will get new orders here</span></div>
    </div>
    <button class="soft-btn" style="margin-top:16px;width:100%" data-go="orderPopup">Simulate New Order</button>
    ${tabbar("dashboard")}
    ${withModal ? newOrderModal() : ""}
  `);
}

function newOrderModal() {
  return `
    <div class="modal-dim">
      <div class="modal">
        <div class="modal-head">
          <div><h2>New Order!</h2><p class="subtle">You have a new delivery</p></div>
          <div class="bag-icon">▣</div>
        </div>
        <div class="route-row"><span class="blue">●</span><div><span class="subtle">Pickup From</span><b>${order.store}</b><small class="subtle">0.8 km away</small></div></div>
        <div class="route-row"><span class="blue">●</span><div><span class="subtle">Deliver To</span><b>${order.customer}</b><small class="subtle">2.6 km away</small></div></div>
        <div class="payout"><div><span class="subtle">Order Payout</span><strong>${order.payout}</strong></div><span class="surge">⚡ Surge</span></div>
        <p class="subtle" style="text-align:center">Accept in <b>00:12</b></p>
        <button class="primary" data-accept>Accept Order</button>
        <div style="height:10px"></div>
        <button class="secondary" data-go="dashboard">Reject Order</button>
      </div>
    </div>
  `;
}

function mapScreen() {
  return shell(`
    <div class="map-canvas"></div>
    <div class="route-line"></div>
    <div class="pin a" data-label="A"></div><div class="pin b" data-label="B"></div>
    <div class="float-card turn"><b>↱ 1.2 km</b><br><span>Turn right towards 5th Main Rd</span></div>
    <div class="route-actions"><button>⌖</button><button>↗</button><button>◎</button></div>
    <div class="float-card map-bottom">
      <div class="route-row"><span class="blue">●</span><div><span class="subtle">Pickup</span><b>${order.store}</b><small class="subtle">0.8 km - 3 min</small></div></div>
      <div class="route-row"><span class="blue">●</span><div><span class="subtle">Drop</span><b>${order.customer}</b><small class="subtle">2.6 km - 8 min</small></div></div>
      <button class="primary" data-go="details">End Navigation</button>
    </div>
  `, { className: "map-screen" });
}

function details() {
  return shell(`
    ${topbar("Order Details", "", "dashboard")}
    <div class="scroll">
      <div class="info-list">
        <div class="info-row"><div><span class="subtle">Order ID</span><b>${order.id}</b></div><span class="pill">Pick Up</span></div>
        <div class="info-row"><div><span class="subtle">Pickup From</span><b>${order.store}</b><small class="subtle">${order.pickup}</small></div><button class="phone-btn">${icons.call}</button></div>
        <div class="info-row"><div><span class="subtle">Deliver To</span><b>${order.customer}</b><small class="subtle">${order.drop}</small></div><button class="phone-btn">${icons.call}</button></div>
      </div>
      <div class="section-title">Order Items <span class="subtle" style="float:right">5 items</span></div>
      <div class="items"><div class="item">🍎</div><div class="item">🥛</div><div class="item">🍞</div><div class="item">🍌</div><div class="item">+1</div></div>
      <div class="card"><b>Order Note</b><p class="subtle">Please ring the bell. Don't call.</p></div>
    </div>
    <div class="fixed-bottom"><button class="primary swipe" data-go="pickup"><span>››</span>Order Picked Up</button></div>
  `);
}

function pickup() {
  return shell(`
    ${topbar("Go to Store", "", "details")}
    <div class="navigate-row"><div class="avatar"></div><div><b>${order.store}</b><small class="subtle">0.8 km away</small></div><button class="mini-primary" data-go="map">Navigate</button></div>
    <div class="section-title">Store Details</div>
    <div class="card">
      <div class="info-row"><div><b>${order.store}</b><small class="subtle">${order.pickup}</small></div><button class="phone-btn">${icons.call}</button></div>
      <button class="soft-btn" style="width:100%;margin-top:12px">${icons.call} Call Store</button>
    </div>
    <div class="card" style="margin-top:14px"><b>Instructions</b><p class="subtle">Go to the store and pick up the order.</p></div>
    <div class="fixed-bottom"><button class="primary swipe" data-go="drop"><span>››</span>Order Picked Up</button></div>
  `);
}

function drop() {
  return shell(`
    ${topbar("Go to Customer", "", "pickup")}
    <div class="navigate-row"><div class="avatar"></div><div><b>${order.customer}</b><small class="subtle">2.6 km away</small></div><button class="mini-primary" data-go="map">Navigate</button></div>
    <div class="section-title">Customer Details</div>
    <div class="card">
      <div class="info-row"><div><b>${order.customer}</b><small class="subtle">${order.drop}</small></div><button class="phone-btn">${icons.call}</button></div>
      <button class="soft-btn" style="width:49%;margin-top:12px">${icons.call} Call</button>
      <button class="soft-btn" style="width:49%;margin-top:12px">${icons.chat} Chat</button>
    </div>
    <div class="card" style="margin-top:14px"><b>Delivery Instructions</b><p class="subtle">Please ring the bell. Don't call.</p></div>
    <div class="fixed-bottom"><button class="primary swipe" data-go="dashboard"><span>✓</span>Order Delivered</button></div>
  `);
}

function earnings() {
  return shell(`
    ${topbar("Earnings", "<button class='icon-btn'>▦</button>", "dashboard")}
    <div class="segments">${["daily","weekly","monthly"].map((tab) => `<button class="${state.earningsTab === tab ? "active" : ""}" data-earnings="${tab}">${tab[0].toUpperCase() + tab.slice(1)}</button>`).join("")}</div>
    <span class="subtle">Today's Earnings</span>
    <div class="money">₹1,245.80</div>
    <div class="table">
      <div><span>Order Earnings</span><b>₹965.80</b></div>
      <div><span>Incentives</span><b>₹180.00</b></div>
      <div><span>Tips</span><b>₹100.00</b></div>
      <div><span>Adjustments</span><b>₹0.00</b></div>
    </div>
    <div class="section-title">Transactions</div>
    ${["#DN1254876","#DN1254875","#DN1254874"].map((id, i) => `<div class="card order-card"><div><b>${id}</b><br><small class="subtle">0${i + 5}:4${i} AM</small></div><div><span class="verified">Delivered</span><br><b>₹${["46.50","38.40","42.30"][i]}</b></div></div>`).join("")}
    ${tabbar("earnings")}
  `, { className: "scroll" });
}

function orders() {
  const data = state.ordersTab === "completed"
    ? [["#DN1254876", "Delivered", "₹46.50", "green"], ["#DN1254875", "Delivered", "₹38.40", "green"], ["#DN1254874", "Delivered", "₹42.30", "green"]]
    : [["#DN1254869", "Cancelled", "₹0.00", "red"], ["#DN1254864", "Cancelled", "₹0.00", "red"]];
  return shell(`
    ${topbar("My Orders", "<button class='icon-btn'>▦</button>", "dashboard")}
    <div class="segments" style="grid-template-columns:repeat(2,1fr)"><button class="${state.ordersTab === "completed" ? "active" : ""}" data-orders="completed">Completed</button><button class="${state.ordersTab === "cancelled" ? "active" : ""}" data-orders="cancelled">Cancelled</button></div>
    ${data.map(([id, status, pay, color]) => `<div class="card order-card"><div><b>${id}</b><br><small class="subtle">Today, 09:15 AM</small></div><div><span class="${color}">${status}</span><br><b>${pay}</b></div></div>`).join("")}
    ${tabbar("orders")}
  `, { className: "scroll" });
}

function profile() {
  return shell(`
    ${topbar("Profile", "", "dashboard")}
    <div class="profile-head"><div class="avatar"></div><div><b>Amit Kumar <span class="star">★ 4.8</span></b><br><small class="subtle">Rider ID: RID12548</small></div><span class="pill">Verified</span></div>
    <div class="menu">
      <button><span>${icons.profile}</span><b>Personal Info</b><span class="chev">›</span></button>
      <button data-go="vehicle"><span>${icons.bike}</span><b>Vehicle Info</b><span>Bike ›</span></button>
      <button data-go="documents"><span>${icons.doc}</span><b>Documents</b><span class="chev">›</span></button>
      <button><span>${icons.bank}</span><b>Bank Details</b><span class="chev">›</span></button>
      <button><span>${icons.star}</span><b>Ratings</b><span>4.8 ›</span></button>
      <button data-go="settings"><span>⚙</span><b>Settings</b><span class="chev">›</span></button>
      <button data-go="support"><span>${icons.help}</span><b>Help & Support</b><span class="chev">›</span></button>
    </div>
    ${tabbar("profile")}
  `);
}

function vehicle() {
  return shell(`
    ${topbar("Vehicle Info", "", "profile")}
    <div class="menu">
      ${[["Vehicle Type","Bike"],["Vehicle Number","KA 01 AB 1234"],["Brand","Hero Passion Pro"],["Model","2021"],["Color","Black"]].map(([a,b]) => `<div class="menu-row"><span></span><b>${a}</b><span>${b} ›</span></div>`).join("")}
    </div>
    <div class="fixed-bottom"><button class="soft-btn" style="width:100%">✎ Edit Vehicle Info</button></div>
  `);
}

function documents() {
  return shell(`
    ${topbar("Documents", "", "profile")}
    <div class="menu">
      ${[["Aadhar Card","Verified"],["Driving License","Verified"],["Vehicle RC","Verified"],["Insurance","Valid till 10/05/2026"],["Pollution Certificate","Valid till 10/01/2026"]].map(([a,b]) => `<button><span>${icons.doc}</span><b>${a}</b><span class="verified">${b} ›</span></button>`).join("")}
    </div>
    <div class="fixed-bottom"><button class="soft-btn" style="width:100%">Upload New Document</button></div>
  `);
}

function settings() {
  return shell(`
    ${topbar("Settings", "", "profile")}
    <div class="settings-row"><span>Online / Offline Auto</span><button class="toggle small"></button></div>
    <div class="settings-row"><span>Order Notification</span><button class="toggle small"></button></div>
    <div class="settings-row"><span>Sound</span><button class="toggle small"></button></div>
    <div class="settings-row"><span>Language</span><span>English ›</span></div>
    <div class="settings-row"><span>Dark Mode</span><button class="toggle small ${state.dark ? "" : "off"}" id="darkToggle"></button></div>
    <div class="settings-row"><span>Privacy Policy</span><span>›</span></div>
    <div class="settings-row"><span>Terms & Conditions</span><span>›</span></div>
    <button class="settings-row danger" id="logout" style="background:transparent;width:100%;text-align:left;margin-top:20px">↪ Log Out</button>
  `);
}

function support() {
  return shell(`
    ${topbar("Help & Support", "", "profile")}
    <p class="subtle" style="margin-top:-6px">How can we help you?</p>
    <div class="menu">
      <button><span>${icons.help}</span><b>Help Center</b><span class="chev">›</span></button>
      <button><span>!</span><b>Report an issue</b><span class="chev">›</span></button>
      <button><span>${icons.call}</span><b>Call Support</b><span class="subtle">+91 98765 43210 ›</span></button>
      <button><span>${icons.chat}</span><b>Chat Support</b><span class="verified">We are online ›</span></button>
      <button><span>${icons.star}</span><b>Rate the App</b><span class="chev">›</span></button>
      <button><span>${icons.info}</span><b>About App</b><span class="subtle">Version 1.0.0 ›</span></button>
    </div>
  `);
}

const views = {
  splash,
  login,
  signup,
  otp,
  dashboard: () => dashboard(false),
  orderPopup: () => dashboard(true),
  map: mapScreen,
  details,
  pickup,
  drop,
  earnings,
  orders,
  profile,
  vehicle,
  documents,
  settings,
  support,
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
  if (event.target.closest("[data-accept]")) {
    state.orderAccepted = true;
    setScreen("details");
    return;
  }
  const key = event.target.closest(".otp-key");
  if (key) {
    const value = key.textContent.trim();
    if (value === "⌫") state.otp.pop();
    if (/^\d$/.test(value) && state.otp.length < 6) state.otp.push(value);
    if (state.otp.length === 6) {
      localStorage.setItem("riderLoggedIn", "true");
      setTimeout(() => setScreen("dashboard"), 250);
    }
    render();
    return;
  }
  const earnings = event.target.closest("[data-earnings]");
  if (earnings) {
    state.earningsTab = earnings.dataset.earnings;
    render();
    return;
  }
  const orders = event.target.closest("[data-orders]");
  if (orders) {
    state.ordersTab = orders.dataset.orders;
    render();
    return;
  }
  if (event.target.id === "darkToggle") {
    state.dark = !state.dark;
    render();
    return;
  }
  if (event.target.id === "logout") {
    localStorage.removeItem("riderLoggedIn");
    setScreen("login");
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "phoneInput") {
    state.phone = event.target.value.replace(/\D/g, "").slice(0, 10);
    event.target.value = state.phone;
  }
  if (event.target.id === "signupPhone") {
    state.phone = event.target.value.replace(/\D/g, "").slice(0, 10);
    event.target.value = state.phone;
  }
  if (event.target.id === "signupName") state.signupName = event.target.value;
  if (event.target.id === "signupVehicle") {
    state.signupVehicle = event.target.value.toUpperCase();
    event.target.value = state.signupVehicle;
  }
});

document.addEventListener("click", (event) => {
  if (event.target.id === "continueLogin") {
    const valid = state.phone.length === 10;
    if (valid) {
      if (!state.registeredNumbers.includes(state.phone)) {
        setScreen("signup");
        return;
      }
      state.otp = [];
      setScreen("otp");
    } else {
      const field = document.querySelector(".field");
      field.style.borderColor = "var(--red)";
      field.querySelector("input").placeholder = "Enter a valid 10-digit number";
    }
  }
  if (event.target.id === "submitSignup") {
    const valid = state.signupName.trim().length >= 2 && state.phone.length === 10 && state.signupVehicle.trim().length >= 4;
    if (valid) {
      if (!state.registeredNumbers.includes(state.phone)) state.registeredNumbers.push(state.phone);
      state.otp = [];
      setScreen("otp");
    }
  }
});

railButtons.forEach((button) => button.addEventListener("click", () => setScreen(button.dataset.screen)));
render();
