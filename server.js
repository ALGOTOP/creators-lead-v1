const express = require("express");
const db = require("../db");
const gemini = require("../gemini");
const { buildOutreachEmail } = require("../outreach");

const router = express.Router();

router.get("/leads", (req, res) => {
  const { status, minScore, maxScore, sortBy = "createdAt", sortDir = "desc" } = req.query;

  let leads = db.listLeads();

  if (status) leads = leads.filter((l) => l.status === status);
  if (minScore != null && minScore !== "") {
    leads = leads.filter((l) => l.thumbnailScore != null && l.thumbnailScore >= Number(minScore));
  }
  if (maxScore != null && maxScore !== "") {
    leads = leads.filter((l) => l.thumbnailScore != null && l.thumbnailScore <= Number(maxScore));
  }

  const allowedSort = ["createdAt", "subscriberCount", "thumbnailScore", "avgViewsLongForm", "longFormUploadsLastMonth"];
  const col = allowedSort.includes(sortBy) ? sortBy : "createdAt";
  const dir = sortDir === "asc" ? 1 : -1;

  leads = [...leads].sort((a, b) => {
    const av = a[col] ?? -Infinity;
    const bv = b[col] ?? -Infinity;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  res.json(leads);
});

router.get("/leads/export/csv", (_req, res) => {
  const leads = db.listLeads();
  const headers = [
    "id", "title", "channelUrl", "subscriberCount", "country", "cityRequested",
    "cityMentionedInAbout", "longFormUploadsLastMonth", "avgViewsLongForm",
    "niche", "thumbnailScore", "thumbnailNotes", "status", "notes", "createdAt",
  ];

  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = leads.map((l) => headers.map((h) => escape(l[h])).join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=creator-leads.csv");
  res.send(csv);
});

router.get("/leads/:id", (req, res) => {
  const lead = db.getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(lead);
});

router.patch("/leads/:id", (req, res) => {
  const allowed = ["status", "notes", "thumbnailScore", "thumbnailNotes"];
  const patch = {};
  for (const key of allowed) {
    if (req.body?.[key] !== undefined) patch[key] = req.body[key];
  }
  const lead = db.updateLead(req.params.id, patch);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(lead);
});

router.delete("/leads/:id", (req, res) => {
  const ok = db.deleteLead(req.params.id);
  if (!ok) return res.status(404).json({ error: "Lead not found" });
  res.status(204).end();
});

router.post("/leads/:id/score", async (req, res) => {
  const lead = db.getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const result = await gemini.scoreThumbnails(lead.recentThumbnailUrls || [], lead.title);
  const updated = db.updateLead(lead.id, {
    thumbnailScore: result.score,
    thumbnailNotes: result.notes,
  });
  res.json(updated);
});

router.get("/leads/:id/outreach-email", (req, res) => {
  const lead = db.getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(buildOutreachEmail(lead));
});

module.exports = router;
