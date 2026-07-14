// ---------- navigation ----------
const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((n) => n.classList.remove("active"));
    pages.forEach((p) => p.classList.remove("active"));
    item.classList.add("active");
    document.getElementById(`page-${item.dataset.page}`).classList.add("active");
    if (item.dataset.page === "leads") loadLeads();
    if (item.dataset.page === "dashboard") loadDashboard();
  });
});

// ---------- toasts ----------
function toast(message, isError = false) {
  const region = document.getElementById("toast-region");
  const el = document.createElement("div");
  el.className = "toast" + (isError ? " error" : "");
  el.textContent = message;
  region.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

// ---------- discover ----------
const searchForm = document.getElementById("search-form");
const searchBtn = document.getElementById("search-btn");
const resultsPanel = document.getElementById("results-panel");
const resultsSummary = document.getElementById("results-summary");
const quotaNote = document.getElementById("quota-note");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    query: document.getElementById("f-query").value.trim(),
    country: document.getElementById("f-country").value.trim().toUpperCase(),
    city: document.getElementById("f-city").value.trim(),
    minSubscribers: Number(document.getElementById("f-min-subs").value) || 0,
    maxSubscribers: document.getElementById("f-max-subs").value
      ? Number(document.getElementById("f-max-subs").value)
      : null,
    resultsWanted: Number(document.getElementById("f-count").value) || 10,
    minLongFormUploads: Number(document.getElementById("f-min-uploads").value) || 0,
    runScoring: document.getElementById("f-score").checked,
  };

  searchBtn.disabled = true;
  searchBtn.innerHTML = `<span class="spinner"></span> Searching...`;
  resultsPanel.style.display = "none";

  try {
    const data = await api.search(payload);
    resultsPanel.style.display = "block";
    resultsSummary.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label"><span class="led on-blue"></span>Candidates found</div>
          <div class="stat-value">${data.candidatesFound}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="led on-amber"></span>Matched filters</div>
          <div class="stat-value">${data.qualified}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="led on-green"></span>New leads created</div>
          <div class="stat-value">${data.created.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label"><span class="led"></span>Already tracked</div>
          <div class="stat-value">${data.alreadyTracked}</div>
        </div>
      </div>
      <div class="lead-list">
        ${data.created.map(renderLeadCard).join("") || `<div class="empty-state">No new leads matched these filters. Try widening subscriber range or lowering the minimum upload count.</div>`}
      </div>
    `;
    quotaNote.textContent = `Estimated YouTube quota used: ~${data.quotaUnitsEstimate} units (of your 10,000/day default)`;
    attachLeadCardHandlers(resultsSummary);
    toast(`Found ${data.qualified} matching channels, created ${data.created.length} new leads.`);
  } catch (err) {
    toast(err.message, true);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Run search";
  }
});

// ---------- leads ----------
function scoreClass(score) {
  if (score == null) return "score-none";
  if (score <= 4) return "score-hot";
  if (score <= 7) return "score-warm";
  return "score-cold";
}

function renderLeadCard(lead) {
  const scoreLabel = lead.thumbnailScore != null ? lead.thumbnailScore : "—";
  const subs = lead.subscriberCount != null ? lead.subscriberCount.toLocaleString() : "?";
  const avatar = lead.avatarUrl || "";
  return `
    <div class="lead-card" data-id="${lead.id}">
      <img class="lead-avatar" src="${avatar}" alt="" onerror="this.style.visibility='hidden'" />
      <div>
        <div class="lead-title"><a href="${lead.channelUrl}" target="_blank" rel="noopener">${escapeHtml(lead.title)}</a></div>
        <div class="lead-meta">${subs} subs · ${lead.longFormUploadsLastMonth} long-form/mo · ${lead.niche || "—"}${lead.country ? " · " + lead.country : ""}</div>
        ${lead.thumbnailNotes ? `<div class="lead-meta">${escapeHtml(lead.thumbnailNotes)}</div>` : ""}
      </div>
      <div class="score-pill ${scoreClass(lead.thumbnailScore)}">${scoreLabel}</div>
      <select class="status-select" data-action="status" data-id="${lead.id}">
        ${["not_contacted", "dm_sent", "replied", "closed"].map((s) =>
          `<option value="${s}" ${lead.status === s ? "selected" : ""}>${s.replace("_", " ")}</option>`
        ).join("")}
      </select>
      <div style="display:flex; gap:6px;">
        <button class="btn-ghost" data-action="score" data-id="${lead.id}">Score</button>
        <button class="btn-ghost" data-action="email" data-id="${lead.id}">Email</button>
        <button class="btn-ghost" data-action="delete" data-id="${lead.id}">Remove</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function attachLeadCardHandlers(container) {
  container.querySelectorAll('[data-action="status"]').forEach((el) => {
    el.addEventListener("change", async () => {
      try {
        await api.updateLead(el.dataset.id, { status: el.value });
        toast("Status updated.");
      } catch (err) {
        toast(err.message, true);
      }
    });
  });

  container.querySelectorAll('[data-action="score"]').forEach((el) => {
    el.addEventListener("click", async () => {
      el.disabled = true;
      el.textContent = "Scoring...";
      try {
        const updated = await api.scoreLead(el.dataset.id);
        const card = container.querySelector(`.lead-card[data-id="${updated.id}"]`);
        if (card) card.outerHTML = renderLeadCard(updated);
        attachLeadCardHandlers(container);
        toast(updated.thumbnailScore != null ? `Scored: ${updated.thumbnailScore}/10` : "Scored.");
      } catch (err) {
        toast(err.message, true);
        el.disabled = false;
        el.textContent = "Score";
      }
    });
  });

  container.querySelectorAll('[data-action="email"]').forEach((el) => {
    el.addEventListener("click", async () => {
      try {
        const { subject, body } = await api.getOutreachEmail(el.dataset.id);
        openOutreachModal(subject, body);
      } catch (err) {
        toast(err.message, true);
      }
    });
  });

  container.querySelectorAll('[data-action="delete"]').forEach((el) => {
    el.addEventListener("click", async () => {
      if (!confirm("Remove this lead?")) return;
      try {
        await api.deleteLead(el.dataset.id);
        el.closest(".lead-card").remove();
        toast("Lead removed.");
      } catch (err) {
        toast(err.message, true);
      }
    });
  });
}

async function loadLeads() {
  const list = document.getElementById("lead-list");
  list.innerHTML = `<div class="empty-state"><span class="spinner"></span></div>`;
  try {
    const leads = await api.listLeads({
      status: document.getElementById("lf-status").value,
      sortBy: document.getElementById("lf-sort").value,
      sortDir: "desc",
    });
    list.innerHTML = leads.map(renderLeadCard).join("") ||
      `<div class="empty-state"><div class="glyph">◇</div>No leads yet. Run a search from the Discover tab.</div>`;
    attachLeadCardHandlers(list);
  } catch (err) {
    list.innerHTML = `<div class="empty-state">Couldn't load leads: ${escapeHtml(err.message)}</div>`;
  }
}

document.getElementById("lf-status").addEventListener("change", loadLeads);
document.getElementById("lf-sort").addEventListener("change", loadLeads);

// ---------- outreach modal ----------
const outreachModal = document.getElementById("outreach-modal");
function openOutreachModal(subject, body) {
  document.getElementById("outreach-subject").textContent = subject;
  document.getElementById("outreach-body").value = body;
  outreachModal.classList.add("open");
}
document.getElementById("outreach-close").addEventListener("click", () => outreachModal.classList.remove("open"));
document.getElementById("outreach-copy").addEventListener("click", () => {
  const textarea = document.getElementById("outreach-body");
  textarea.select();
  document.execCommand("copy");
  toast("Copied to clipboard.");
});

// ---------- dashboard ----------
async function loadDashboard() {
  const statsEl = document.getElementById("dash-stats");
  const nicheEl = document.getElementById("dash-niche");
  try {
    const stats = await api.dashboardStats();
    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-label"><span class="led on-blue"></span>Total leads</div>
        <div class="stat-value">${stats.totalLeads}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span class="led on-red"></span>Hot leads (score ≤4)</div>
        <div class="stat-value">${stats.hotLeads}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span class="led on-amber"></span>Avg thumbnail score</div>
        <div class="stat-value">${stats.avgThumbnailScore ?? "—"}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span class="led"></span>Not yet scored</div>
        <div class="stat-value">${stats.unscored}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span class="led on-green"></span>Closed</div>
        <div class="stat-value">${stats.closed}</div>
      </div>
    `;
    nicheEl.innerHTML = stats.byNiche.length
      ? stats.byNiche.map((n) => `
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-subtle); font-family:var(--mono); font-size:12.5px;">
            <span>${escapeHtml(n.niche)}</span><span>${n.count}</span>
          </div>`).join("")
      : `<div class="empty-state">No leads yet.</div>`;
  } catch (err) {
    statsEl.innerHTML = `<div class="empty-state">Couldn't load dashboard: ${escapeHtml(err.message)}</div>`;
  }
}

// initial load
loadDashboard();
