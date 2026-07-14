<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Creator Leads — Pehchaan Media</title>
<link rel="stylesheet" href="/css/style.css" />
</head>
<body>

<div class="app-shell">
  <nav class="sidebar">
    <div class="brand">
      <div class="brand-mark"></div>
      <div class="brand-text">Creator Leads<small>Pehchaan Media</small></div>
    </div>

    <div class="nav-item active" data-page="discover">
      <span class="nav-dot"></span> Discover
    </div>
    <div class="nav-item" data-page="leads">
      <span class="nav-dot"></span> Leads
    </div>
    <div class="nav-item" data-page="dashboard">
      <span class="nav-dot"></span> Dashboard
    </div>

    <div class="sidebar-footer">v1.0 · local data file</div>
  </nav>

  <main>

    <!-- DISCOVER -->
    <section class="page active" id="page-discover">
      <h1>Discover</h1>
      <p class="page-subtitle">Search YouTube for creators who'd benefit from a thumbnail redesign.</p>

      <div class="panel">
        <div class="panel-title">Search parameters</div>
        <form id="search-form">
          <div class="form-grid">
            <div class="field">
              <label for="f-query">Niche / keyword</label>
              <input type="text" id="f-query" placeholder="e.g. personal finance" required />
            </div>
            <div class="field">
              <label for="f-country">Country (optional)</label>
              <input type="text" id="f-country" placeholder="e.g. US, PK, GB" maxlength="2" />
            </div>
            <div class="field">
              <label for="f-city">City (optional, best-effort)</label>
              <input type="text" id="f-city" placeholder="e.g. Karachi" />
            </div>
            <div class="field">
              <label for="f-min-subs">Min subscribers</label>
              <input type="number" id="f-min-subs" value="10000" min="0" />
            </div>
            <div class="field">
              <label for="f-max-subs">Max subscribers</label>
              <input type="number" id="f-max-subs" placeholder="no limit" min="0" />
            </div>
            <div class="field">
              <label for="f-count">Creators wanted</label>
              <input type="number" id="f-count" value="10" min="1" max="50" />
            </div>
            <div class="field">
              <label for="f-min-uploads">Min long-form uploads (last 30 days)</label>
              <input type="number" id="f-min-uploads" value="1" min="0" />
            </div>
          </div>

          <div class="checkbox-row">
            <input type="checkbox" id="f-score" />
            <label for="f-score">Score thumbnails with AI as they're found (uses your Gemini free tier quota)</label>
          </div>

          <button type="submit" class="btn" id="search-btn">Run search</button>
          <div class="quota-note" id="quota-note"></div>
        </form>
      </div>

      <div class="panel" id="results-panel" style="display:none;">
        <div class="panel-title">Results</div>
        <div id="results-summary"></div>
      </div>
    </section>

    <!-- LEADS -->
    <section class="page" id="page-leads">
      <h1>Leads</h1>
      <p class="page-subtitle">Everything you've discovered, in one pipeline.</p>

      <div class="panel">
        <div class="panel-title">Filter</div>
        <div class="form-grid" style="margin-bottom:0;">
          <div class="field">
            <label for="lf-status">Status</label>
            <select id="lf-status">
              <option value="">All</option>
              <option value="not_contacted">Not contacted</option>
              <option value="dm_sent">DM sent</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div class="field">
            <label for="lf-sort">Sort by</label>
            <select id="lf-sort">
              <option value="createdAt">Newest</option>
              <option value="subscriberCount">Subscribers</option>
              <option value="thumbnailScore">Thumbnail score</option>
              <option value="avgViewsLongForm">Avg views</option>
            </select>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">
          Pipeline
          <a href="/api/leads/export/csv" class="btn-ghost" style="margin-left:auto; text-decoration:none;">Export CSV</a>
        </div>
        <div class="lead-list" id="lead-list"></div>
      </div>
    </section>

    <!-- DASHBOARD -->
    <section class="page" id="page-dashboard">
      <h1>Dashboard</h1>
      <p class="page-subtitle">Where the pipeline stands right now.</p>

      <div class="panel">
        <div class="panel-title">Overview</div>
        <div class="stat-grid" id="dash-stats"></div>
      </div>

      <div class="panel">
        <div class="panel-title">By niche</div>
        <div id="dash-niche"></div>
      </div>
    </section>

  </main>
</div>

<div class="toast-region" id="toast-region"></div>

<div class="modal-backdrop" id="outreach-modal">
  <div class="modal">
    <h3 id="outreach-subject">Subject</h3>
    <textarea id="outreach-body" readonly></textarea>
    <div class="modal-actions">
      <button class="btn-ghost" id="outreach-copy">Copy</button>
      <button class="btn-ghost" id="outreach-close">Close</button>
    </div>
  </div>
</div>

<script src="/js/api.js"></script>
<script src="/js/app.js"></script>
</body>
</html>
