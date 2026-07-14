// YouTube Data API v3 client.
//
// Quota notes (this matters -- default daily quota is 10,000 units):
//   search.list        = 100 units per call
//   channels.list       = 1 unit per call (up to 50 ids)
//   playlistItems.list  = 1 unit per call (up to 50 items)
//   videos.list          = 1 unit per call (up to 50 ids)
//
// The only expensive call is search.list, and we make exactly ONE per
// search request, no matter how many channels come back. Every previous
// version of this tool called search.list once PER CHANNEL to get recent
// uploads, which is 100x more expensive than it needs to be. Channel
// uploads are fetched via their "uploads" playlist instead, which is a
// free (1-unit) call. A search that finds 30 channels costs roughly
// 100 + 1 + 30 + a couple of batched videos.list calls -- under 150
// units total, so you can run ~60+ searches a day on the free quota
// instead of 4-5.

const BASE_URL = "https://www.googleapis.com/youtube/v3";

function apiKey() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  return key;
}

async function yt(endpoint, params) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", apiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${endpoint} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}

// ISO 8601 duration ("PT4M13S") -> seconds. Used to tell long-form videos
// apart from Shorts (YouTube Shorts are always <= 60s).
function durationToSeconds(iso) {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

// One search.list call. Finds candidate channels by searching video
// content for the query, which matches actual niche content far better
// than searching type=channel (which only matches channel title/description
// text and misses most relevant channels).
async function findCandidateChannelIds(query, { country, maxCandidates = 40 } = {}) {
  const data = await yt("search", {
    part: "snippet",
    type: "video",
    q: query,
    maxResults: 50,
    order: "relevance",
    regionCode: country || undefined,
    videoDuration: "any",
  });

  const ids = [];
  const seen = new Set();
  for (const item of data.items || []) {
    const channelId = item.snippet?.channelId;
    if (channelId && !seen.has(channelId)) {
      seen.add(channelId);
      ids.push(channelId);
    }
    if (ids.length >= maxCandidates) break;
  }
  return ids;
}

// channels.list in batches of 50 (1 unit per call regardless of batch size).
async function getChannelsBatch(channelIds) {
  const results = [];
  for (let i = 0; i < channelIds.length; i += 50) {
    const batch = channelIds.slice(i, i + 50);
    const data = await yt("channels", {
      part: "snippet,statistics,contentDetails,brandingSettings",
      id: batch.join(","),
      maxResults: 50,
    });
    for (const ch of data.items || []) {
      results.push({
        channelId: ch.id,
        title: ch.snippet?.title || "Unknown",
        description: ch.snippet?.description || "",
        customUrl: ch.snippet?.customUrl || null,
        country: ch.snippet?.country || ch.brandingSettings?.channel?.country || null,
        subscriberCount: Number(ch.statistics?.subscriberCount || 0),
        hiddenSubscriberCount: Boolean(ch.statistics?.hiddenSubscriberCount),
        videoCount: Number(ch.statistics?.videoCount || 0),
        avatarUrl: ch.snippet?.thumbnails?.high?.url || ch.snippet?.thumbnails?.default?.url || null,
        uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads || null,
      });
    }
  }
  return results;
}

// playlistItems.list against the channel's uploads playlist. 1 unit per
// call, regardless of how many items come back (up to 50).
async function getRecentUploadIds(uploadsPlaylistId, maxResults = 25) {
  if (!uploadsPlaylistId) return [];
  try {
    const data = await yt("playlistItems", {
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults,
    });
    return (data.items || [])
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean);
  } catch (err) {
    // A channel with a private/deleted uploads playlist shouldn't kill
    // the whole search -- just treat it as having no recent uploads.
    return [];
  }
}

// videos.list in batches of 50 (1 unit per call). Returns duration,
// publish date, view count and thumbnail per video.
async function getVideosBatch(videoIds) {
  const results = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    if (batch.length === 0) continue;
    const data = await yt("videos", {
      part: "snippet,contentDetails,statistics",
      id: batch.join(","),
      maxResults: 50,
    });
    for (const v of data.items || []) {
      results.push({
        videoId: v.id,
        channelId: v.snippet?.channelId,
        title: v.snippet?.title || "",
        publishedAt: v.snippet?.publishedAt || null,
        thumbnailUrl:
          v.snippet?.thumbnails?.high?.url ||
          v.snippet?.thumbnails?.medium?.url ||
          v.snippet?.thumbnails?.default?.url ||
          null,
        durationSeconds: durationToSeconds(v.contentDetails?.duration),
        viewCount: Number(v.statistics?.viewCount || 0),
      });
    }
  }
  return results;
}

module.exports = {
  findCandidateChannelIds,
  getChannelsBatch,
  getRecentUploadIds,
  getVideosBatch,
  durationToSeconds,
};
