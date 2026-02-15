const API_BASE = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async () => {
 
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  let currentUser = null;
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch user");
    currentUser = await response.json();
    localStorage.setItem("user", JSON.stringify(currentUser));
  } catch (error) {
    console.error("Auth Error:", error);
    logout();
    return;
  }

  initUI(currentUser);

  loadTab("overview");
});

function initUI(user) {
  
  const nameEl = document.getElementById("user-name");
  const initialsEl = document.getElementById("user-initials");
  const roleBadgeEl = document.getElementById("user-role-badge");
  const emailEl = document.getElementById("user-email");

  if (nameEl) nameEl.textContent = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Utilisateur";
  if (emailEl) emailEl.textContent = user.email || "—";

  const initials =
    ((user.first_name?.[0] || "") + (user.last_name?.[0] || "")).toUpperCase() || "MP";
  if (initialsEl) initialsEl.textContent = initials;

  if (roleBadgeEl) {
    roleBadgeEl.textContent = (user.role || "ROLE").toUpperCase();
    
    roleBadgeEl.dataset.role = user.role;
  }

  const navFindDoctor = document.getElementById("nav-find-doctor");
  const navMyPatients = document.getElementById("nav-my-patients");
  const navAuditLogs = document.getElementById("nav-audit-logs");

  if (navFindDoctor) navFindDoctor.style.display = user.role === "PATIENT" ? "flex" : "none";
  if (navMyPatients) navMyPatients.style.display = user.role === "DOCTOR" ? "flex" : "none";
  if (navAuditLogs) navAuditLogs.style.display = user.role === "ADMIN" ? "flex" : "none";

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const dateEl = document.getElementById("current-date");
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString("fr-FR", options);

  document.querySelectorAll(".nav-item[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item[data-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadTab(btn.dataset.tab);
    });
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  const refreshBtn = document.getElementById("btn-refresh");
  if (refreshBtn) refreshBtn.addEventListener("click", () => {
    const active = document.querySelector(".nav-item[data-tab].active");
    loadTab(active?.dataset?.tab || "overview");
  });

  const btnQuickBook = document.getElementById("btn-quick-book");
  const btnQuickSlot = document.getElementById("btn-quick-slot");
  if (btnQuickBook) btnQuickBook.style.display = user.role === "PATIENT" ? "inline-flex" : "none";
  if (btnQuickSlot) btnQuickSlot.style.display = user.role === "DOCTOR" ? "inline-flex" : "none";

  if (btnQuickBook) btnQuickBook.addEventListener("click", () => loadTab("find-doctor"));
  if (btnQuickSlot) btnQuickSlot.addEventListener("click", () => toast("Disponibilités: bientôt 😉", "info"));

  setupModals();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function loadTab(tabName) {
  const contentArea = document.getElementById("content-area");
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!contentArea) return;

  contentArea.innerHTML = `<div class="skeleton-grid">
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  </div>`;

  switch (tabName) {
    case "overview":
      if (pageTitle) pageTitle.textContent = "Vue d’ensemble";
      if (pageSubtitle) pageSubtitle.textContent = "Résumé de votre activité et raccourcis";
      loadOverview(user, contentArea);
      break;

    case "appointments":
      if (pageTitle) pageTitle.textContent = "Rendez-vous";
      if (pageSubtitle) pageSubtitle.textContent = "Historique et planning";
      loadAppointments(user, contentArea);
      break;

    case "find-doctor":
      if (pageTitle) pageTitle.textContent = "Trouver un médecin";
      if (pageSubtitle) pageSubtitle.textContent = "Rechercher et prendre rendez-vous";
      loadDoctors(contentArea);
      break;

    case "my-patients":
      if (pageTitle) pageTitle.textContent = "Mes patients";
      if (pageSubtitle) pageSubtitle.textContent = "Patients issus de vos rendez-vous";
      loadPatients(user, contentArea);
      break;

    case "audit-logs":
      if (pageTitle) pageTitle.textContent = "Audit logs";
      if (pageSubtitle) pageSubtitle.textContent = "Historique de sécurité (admin)";
      loadAuditLogs(contentArea);
      break;

    default:
      if (pageTitle) pageTitle.textContent = "Vue d’ensemble";
      loadOverview(user, contentArea);
  }
}

async function loadAuditLogs(container) {
    // If container is not provided (e.g. refresh button), find the content section
    if (!container) {
        // We assume the tab structure is already there
        const tbody = document.getElementById("audit-list");
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="muted">Chargement...</td></tr>';
        }
    } else {
        // Initial render of the section if navigating
         // The HTML is already in index.html, we just need to ensure it's visible
         // But wait, loadTab usually clears contentArea.
         // Let's stick to the pattern: clear contentArea, then clone/show the section?
         // OR, since my previous HTML edit put the section *outside* content-area (display:none),
         // checking dashboard.html again...
         // Ah, I put the section as a sibling to content-area.
         // So loadTab needs to hide content-area and show #audit section?
         // Actually, the existing pattern allows swapping content inside #content-area.
         // Let's adapt:
         
         const auditSection = document.getElementById("audit");
         if(auditSection) {
             // We can clone it or move it. 
             // Simpler: Just build the HTML here like other tabs to be consistent.
             container.innerHTML = `
                <div class="section-header">
                    <h2>Security Audit Logs</h2>
                    <button class="btn btn-secondary" id="refresh-audit-btn">
                        <i data-lucide="refresh-cw"></i> Refresh
                    </button>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Status</th>
                                    <th>IP</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody id="audit-list">
                                <tr><td colspan="6" class="muted">Chargement...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
             `;
             
             document.getElementById("refresh-audit-btn")?.addEventListener("click", () => loadAuditLogs(container));
         }
    }

    try {
        const res = await fetchWithAuth(`${API_BASE}/audit-logs`);
        const logs = await res.json();
        
        const tbody = document.getElementById("audit-list");
        if(!tbody) return;

        if(!logs || logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="muted">Aucun log trouvé.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>${new Date(log.created_at).toLocaleString()}</td>
                <td><strong>${log.action}</strong></td>
                <td>
                    ${log.user_email ? log.user_email : (log.user_id ? log.user_id : '<span class="muted">Guest</span>')}
                </td>
                <td>
                    <span class="role-badge" style="background:${log.status === 'SUCCESS' ? '#dcfce7' : '#fee2e2'}; color:${log.status === 'SUCCESS' ? '#166534' : '#991b1b'}">
                        ${log.status}
                    </span>
                </td>
                <td>${log.ip_address || '—'}</td>
                <td style="font-family:monospace; font-size:0.85em; max-width:200px; overflow:hidden; text-overflow:ellipsis;">
                    ${log.details ? JSON.stringify(log.details) : '—'}
                </td>
            </tr>
        `).join("");
        
        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        const tbody = document.getElementById("audit-list");
        if(tbody) tbody.innerHTML = `<tr><td colspan="6" class="muted">Erreur: ${error.message}</td></tr>`;
    }
}

async function loadOverview(user, container) {
  if (user.role === "DOCTOR") {
    try {
      const res = await fetchWithAuth(`${API_BASE}/appointments/stats`);
      const stats = await res.json();

      container.innerHTML = `
        <div class="stats-container">
          <div class="stat-box">
            <div class="stat-number">${stats.todayAppointments ?? 0}</div>
            <div class="muted">RDV aujourd’hui</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${stats.totalAppointments ?? 0}</div>
            <div class="muted">Total RDV</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${stats.totalPatients ?? 0}</div>
            <div class="muted">Patients uniques</div>
          </div>
        </div>

        <div class="card">
          <h3>Prochains rendez-vous</h3>
          <div id="upcoming-appointments" class="muted">Chargement…</div>
        </div>
      `;

      const appts = await fetchAppointments();
      renderAppointments(appts.slice(0, 5), document.getElementById("upcoming-appointments"), user.role);
    } catch (e) {
      container.innerHTML = `<div class="card"><p class="muted">Erreur: ${e.message}</p></div>`;
    }
  } else {
    container.innerHTML = `
      <div class="card">
        <h3>Vos prochains rendez-vous</h3>
        <div id="upcoming-appointments" class="muted">Chargement…</div>
        <div style="margin-top:12px;">
          <button class="btn btn-primary" id="go-find-doctor">
            <i data-lucide="plus"></i><span>Prendre un rendez-vous</span>
          </button>
        </div>
      </div>
    `;

    try {
      const appts = await fetchAppointments();
      const upcoming = appts.filter((a) => new Date(a.date_time) > new Date());
      renderAppointments(upcoming, document.getElementById("upcoming-appointments"), user.role);
    } catch (e) {
      const el = document.getElementById("upcoming-appointments");
      if (el) el.innerHTML = `<p class="muted">Erreur: ${e.message}</p>`;
    }

    const btn = document.getElementById("go-find-doctor");
    if (btn) btn.addEventListener("click", () => {
      document.querySelector('[data-tab="find-doctor"]')?.click();
    });
  }
  if (window.lucide) window.lucide.createIcons();
}

async function loadAppointments(user, container) {
  try {
    const appts = await fetchAppointments();
    container.innerHTML = `<div class="card"><h3>Rendez-vous</h3><div id="appointments-list"></div></div>`;
    renderAppointments(appts, document.getElementById("appointments-list"), user.role);
    if (window.lucide) window.lucide.createIcons();
  } catch (e) {
    container.innerHTML = `<div class="card"><p class="muted">Erreur: ${e.message}</p></div>`;
  }
}

async function loadDoctors(container) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/doctors`);
    const doctors = await res.json();

    container.innerHTML = `<div class="card"><h3>Médecins</h3><div class="card-grid" id="doctors-grid"></div></div>`;
    const grid = document.getElementById("doctors-grid");

    doctors.forEach((doc) => {
      const card = document.createElement("div");
      card.className = "card doctor-card";
      card.innerHTML = `
        <h3>Dr. ${doc.first_name} ${doc.last_name}</h3>
        <p><strong>Spécialité:</strong> ${doc.speciality || "N/A"}</p>
        <p><strong>Adresse:</strong> ${doc.clinic_address || "N/A"}</p>
        <button class="btn btn-primary" type="button" data-book="${doc.id}" data-name="${doc.first_name} ${doc.last_name}">
          <i data-lucide="calendar-plus"></i><span>Prendre RDV</span>
        </button>
      `;
      grid.appendChild(card);
    });

    container.querySelectorAll("[data-book]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openBookingModal(btn.dataset.book, btn.dataset.name);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  } catch (e) {
    container.innerHTML = `<div class="card"><p class="muted">Erreur: ${e.message}</p></div>`;
  }
}

async function loadPatients(user, container) {
  container.innerHTML = `<div class="card"><h3>Patients récents</h3><div id="patients-list" class="muted">Chargement…</div></div>`;

  try {
    const appts = await fetchAppointments();

    const seen = new Set();
    const uniquePatients = [];

    appts.forEach((a) => {
      const pid = a.patient_id;
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        uniquePatients.push({
          id: pid,
          name: `${a.patient_first_name ?? ""} ${a.patient_last_name ?? ""}`.trim() || "Patient",
        });
      }
    });

    const list = document.getElementById("patients-list");
    if (!list) return;

    if (uniquePatients.length === 0) {
      list.innerHTML = "<p class='muted'>Aucun patient trouvé.</p>";
      return;
    }

    list.innerHTML = `
      <div class="card-grid">
        ${uniquePatients
          .map(
            (p) => `
          <div class="card">
            <h4 style="margin:0 0 8px;">${p.name}</h4>
            <p class="muted" style="margin:0 0 12px;">ID: ${p.id}</p>
            <button class="btn btn-secondary" type="button">Dossier médical (bientôt)</button>
          </div>`
          )
          .join("")}
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="card"><p class="muted">Erreur: ${e.message}</p></div>`;
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    logout();
    throw new Error("Session expirée");
  }

  return res;
}

async function fetchAppointments() {
  const res = await fetchWithAuth(`${API_BASE}/appointments`);
  return await res.json();
}

function renderAppointments(appointments, container, role) {
  if (!container) return;

  if (!appointments || appointments.length === 0) {
    container.innerHTML = "<p class='muted'>Aucun rendez-vous.</p>";
    return;
  }

  const html = appointments
    .map((appt) => {
      const date = new Date(appt.date_time).toLocaleString("fr-FR");
      const statusClass = (appt.status || "").toLowerCase();

      let otherParty = "—";
      if (role === "PATIENT") {
        otherParty = `Dr. ${appt.doctor_first_name ?? ""} ${appt.doctor_last_name ?? ""}`.trim();
      } else if (role === "DOCTOR") {
        otherParty = `${appt.patient_first_name ?? ""} ${appt.patient_last_name ?? ""}`.trim();
      }

      return `
        <div class="appointment-item ${statusClass}">
          <div>
            <strong>${date}</strong><br />
            <span class="muted">avec ${escapeHtml(otherParty || "—")}</span>
            <br /><small class="muted">${escapeHtml(appt.reason || "Aucun motif")}</small>
          </div>
          <div class="role-badge">${escapeHtml(appt.status || "—")}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = html;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupModals() {
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(m.id);
    });
  });

  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const doctorId = document.getElementById("booking-doctor-id")?.value;
      const dateTime = document.getElementById("booking-date")?.value;
      const reason = document.getElementById("booking-reason")?.value;

      try {
        const res = await fetchWithAuth(`${API_BASE}/appointments`, {
          method: "POST",
          body: JSON.stringify({ doctorId, dateTime, reason }),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(result.message || "Erreur lors de la prise de rendez-vous");
        }

        toast("✅ Rendez-vous confirmé !", "success");
        closeModal("booking-modal");
        loadTab("appointments");
      } catch (err) {
        toast("❌ " + err.message, "error");
      }
    });
  }
}

function openBookingModal(doctorId, doctorName) {
  document.getElementById("booking-doctor-id").value = doctorId;
  document.getElementById("booking-doctor-name").value = doctorName;
  document.getElementById("booking-date").value = "";
  document.getElementById("booking-reason").value = "";
  openModal("booking-modal");
}

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = "block";
  m.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = "none";
  m.setAttribute("aria-hidden", "true");
}

function toast(message, type = "success") {
  const area = document.getElementById("toastArea");
  if (!area) return alert(message);

  const el = document.createElement("div");
  el.className = "card";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.gap = "10px";
  el.style.padding = "12px 14px";
  el.style.borderRadius = "14px";
  el.style.border = "1px solid rgba(15,23,42,.10)";
  el.style.boxShadow = "0 10px 30px rgba(2,6,23,.10)";
  el.style.maxWidth = "360px";

  const dot = document.createElement("span");
  dot.style.width = "10px";
  dot.style.height = "10px";
  dot.style.borderRadius = "999px";
  dot.style.background = type === "error" ? "#ef4444" : type === "info" ? "#64748b" : "#22c55e";

  const txt = document.createElement("div");
  txt.textContent = message;

  el.appendChild(dot);
  el.appendChild(txt);
  area.appendChild(el);

  setTimeout(() => el.remove(), 2800);
}

window.openBookingModal = openBookingModal;
