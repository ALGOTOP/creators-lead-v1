// Generates a cold outreach email draft for a lead. No AI call needed --
// this is a plain template, so it costs nothing and never fails.
//
// Structure follows Pehchaan Media's actual outreach approach: open with a
// specific observation about the channel's thumbnails, state the offer
// plainly, close with a low-commitment call to action. Plain language,
// short sentences, no dashes, subject line references the channel's own
// recent video.

function buildOutreachEmail(lead) {
  const recentVideoTitle = lead.recentVideoTitles?.[0] || null;
  const weakness = lead.thumbnailNotes || "your recent thumbnails could use a stronger visual pull";

  const subject = recentVideoTitle
    ? `Quick note on your "${truncate(recentVideoTitle, 60)}" thumbnail`
    : `Quick note on your channel's thumbnails`;

  const body = `Hey ${lead.title || "there"},

I came across your channel and noticed something: ${lowercaseFirst(weakness)}

I run Pehchaan Media. We design YouTube thumbnails full time for creators in your kind of niche. The offer is simple: unlimited thumbnails for $750/month, unlimited revisions, no long contract.

If it's useful, I can put together a free redesigned mockup of one of your recent thumbnails so you can see the difference before committing to anything.

Let me know if you'd want that.

Mehmood
Pehchaan Media`;

  return { subject, body };
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}

function lowercaseFirst(str) {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

module.exports = { buildOutreachEmail };
