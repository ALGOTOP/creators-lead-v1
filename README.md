const express = require("express");
const yt = require("../youtube");
const gemini = require("../gemini");
const db = require("../db");
const { mapWithConcurrency } = require("../limit");

const router = express.Router();

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const SHORTS_MAX_SECONDS = 60;

function channelUrlFor(channel) {
  if (channel.customUrl) {
    const handle = channel.customUrl.replace(/^@/, "");
    return `https://youtube.com/@${handle}`;
  }
  return `https://youtube.com/channel/${channel.channelId}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post("/search", async (req, res) => {
  const {
    query,
    country = "",
    city = "",
    minSubscribers = 0,
    maxSubscribers = null,
    resultsWanted = 10,
    minLongFormUploads = 1,
    runScoring = false,
  } = req.body || {};

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }

  const wanted = Math.min(Math.max(Number(resultsWanted) || 10, 1), 50);
  const minSubs = Math.max(Number(minSubscribers) || 0, 0);
  const maxSubs = maxSubscribers != null && maxSubscribers !== "" ? Number(maxSubscribers) : null;
  const minUploads = Math.max(Number(minLongFormUploads) || 0, 0);

  let quotaEstimate = 0;

  try {
    // 1. One search.list call. Search video content (not channel metadata)
    // for much better niche matching, and cast a wide enough net that
    // filtering by subscribers/uploads still leaves enough candidates.
    const searchTerm = city ? `${query} ${city}` : query;
    const candidateIds = await yt.findCandidateChannelIds(searchTerm, {
      country: country || undefined,
      maxCandidates: Math.min(50, wanted * 5),
    });
    quotaEstimate += 100;

    if (candidateIds.length === 0) {
      return res.json({
        candidatesFound: 0,
        qualified: 0,
        alreadyTracked: 0,
        created: [],
        quotaUnitsEstimate: quotaEstimate,
      });
    }

    // 2. One channels.list call (batched), 1 unit.
    const channels = await yt.getChannelsBatch(candidateIds);
    quotaEstimate += Math.ceil(candidateIds.length / 50);

    let subFiltered = channels.filter((ch) => {
      if (ch.hiddenSubscriberCount) return minSubs === 0;
      if (ch.subscriberCount < minSubs) return false;
      if (maxSubs != null && ch.subscriberCount > maxSubs) return false;
      return true;
    });

    if (country) {
      // Soft preference, not a hard filter -- YouTube channel "country"
      // is self-declared and often blank, so don't throw away channels
      // just because the field is empty.
      const declared = subFiltered.filter((ch) => ch.country === country.toUpperCase());
      const unknown = subFiltered.filter((ch) => !ch.country);
      subFiltered = [...declared, ...unknown];
    }

    // 3. One playlistItems.list call per candidate channel, 1 unit each.
    // This replaces the old approach of calling search.list per channel,
    // which cost 100 units per channel instead of 1.
    const withUploads = await mapWithConcurrency(subFiltered, 5, async (ch) => {
      const videoIds = await yt.getRecentUploadIds(ch.uploadsPlaylistId, 25);
      return { ...ch, recentVideoIds: videoIds };
    });
    quotaEstimate += withUploads.filter((c) => c.uploadsPlaylistId).length;

    // 4. Batch every video ID from every channel into as few videos.list
    // calls as possible (50 ids per call, 1 unit per call).
    const allVideoIds = withUploads.flatMap((c) => c.recentVideoIds);
    const videoDetails = await yt.getVideosBatch(allVideoIds);
    quotaEstimate += Math.ceil(allVideoIds.length / 50) || 0;

    const videosByChannel = new Map();
    for (const v of videoDetails) {
      if (!videosByChannel.has(v.channelId)) videosByChannel.set(v.channelId, []);
      videosByChannel.get(v.channelId).push(v);
    }

    const now = Date.now();
    const cityLower = city.toLowerCase();

    const qualified = withUploads
      .map((ch) => {
        const videos = (videosByChannel.get(ch.channelId) || []).sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        const longForm = videos.filter(
          (v) =>
            v.durationSeconds > SHORTS_MAX_SECONDS &&
            v.publishedAt &&
            now - new Date(v.publishedAt).getTime() <= ONE_MONTH_MS
        );
        const avgViews = longForm.length
          ? Math.round(longForm.reduce((sum, v) => sum + v.viewCount, 0) / longForm.length)
          : 0;

        const cityMentioned = Boolean(cityLower && ch.description.toLowerCase().includes(cityLower));

        return {
          channelId: ch.channelId,
          title: ch.title,
          channelUrl: channelUrlFor(ch),
          avatarUrl: ch.avatarUrl,
          subscriberCount: ch.subscriberCount,
          country: ch.country,
          cityRequested: city || null,
          cityMentionedInAbout: cityMentioned,
          longFormUploadsLastMonth: longForm.length,
          avgViewsLongForm: avgViews,
          recentVideoTitles: videos.slice(0, 5).map((v) => v.title),
          recentThumbnailUrls: longForm.slice(0, 5).map((v) => v.thumbnailUrl).filter(Boolean),
          niche: query,
        };
      })
      .filter((ch) => ch.longFormUploadsLastMonth >= minUploads)
      .sort((a, b) => b.subscriberCount - a.subscriberCount)
      .slice(0, wanted);

    const created = [];
    let alreadyTracked = 0;

    for (const candidate of qualified) {
      const existing = db.getLeadByChannelId(candidate.channelId);
      if (existing) {
        alreadyTracked++;
        continue;
      }

      let thumbnailScore = null;
      let thumbnailNotes = null;

      if (runScoring && candidate.recentThumbnailUrls.length > 0) {
        const result = await gemini.scoreThumbnails(candidate.recentThumbnailUrls, candidate.title);
        thumbnailScore = result.score;
        thumbnailNotes = result.notes;
        // stay well under free-tier per-minute rate limits when scoring
        // several leads back to back
        await sleep(1200);
      }

      const lead = db.insertLead({ ...candidate, thumbnailScore, thumbnailNotes });
      created.push(lead);
    }

    res.json({
      candidatesFound: candidateIds.length,
      qualified: qualified.length,
      alreadyTracked,
      created,
      quotaUnitsEstimate: quotaEstimate,
    });
  } catch (err) {
    console.error("Discovery search failed:", err);
    res.status(500).json({ error: err.message || "Discovery search failed" });
  }
});

module.exports = router;
