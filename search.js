// Tiny file-backed store. No Postgres, no ORM, nothing to provision.
// The whole "database" is one JSON file on disk. Fine for one internal
// sales tool used by a small team. If this ever needs to survive Replit
// container restarts long-term, point DATA_DIR at a persistent disk --
// the read/write logic doesn't change.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "leads.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ leads: [] }, null, 2));
  }
}

function readAll() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { leads: [] };
  }
}

function writeAll(data) {
  ensureStore();
  // write to a temp file then rename, so a crash mid-write can't corrupt
  // the real file
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function listLeads() {
  return readAll().leads;
}

function getLead(id) {
  return readAll().leads.find((l) => l.id === id) || null;
}

function getLeadByChannelId(channelId) {
  return readAll().leads.find((l) => l.channelId === channelId) || null;
}

function insertLead(lead) {
  const data = readAll();
  const now = new Date().toISOString();
  const record = {
    id: crypto.randomUUID(),
    status: "not_contacted",
    notes: "",
    thumbnailScore: null,
    thumbnailNotes: null,
    createdAt: now,
    updatedAt: now,
    ...lead,
  };
  data.leads.push(record);
  writeAll(data);
  return record;
}

function updateLead(id, patch) {
  const data = readAll();
  const idx = data.leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  data.leads[idx] = {
    ...data.leads[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeAll(data);
  return data.leads[idx];
}

function deleteLead(id) {
  const data = readAll();
  const before = data.leads.length;
  data.leads = data.leads.filter((l) => l.id !== id);
  writeAll(data);
  return data.leads.length < before;
}

module.exports = {
  listLeads,
  getLead,
  getLeadByChannelId,
  insertLead,
  updateLead,
  deleteLead,
};
