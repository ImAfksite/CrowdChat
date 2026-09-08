const cheerio = require('cheerio');

// In-memory cache for parsed URLs
const previewCache = new Map();

// YouTube ID extractor
function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

async function fetchLinkPreview(targetUrl) {
  if (previewCache.has(targetUrl)) {
    return previewCache.get(targetUrl);
  }

  const ytId = extractYouTubeId(targetUrl);
  if (ytId) {
    const ytData = {
      type: 'youtube',
      url: targetUrl,
      youtubeId: ytId,
      title: 'YouTube Video',
      description: 'Watch video directly inside CrowdChat',
      image: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      siteName: 'YouTube'
    };
    previewCache.set(targetUrl, ytData);
    return ytData;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CrowdChatBot/1.0 (+http://crowdchat.local)' }
    });
    clearTimeout(timeout);

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';
    const siteName = $('meta[property="og:site_name"]').attr('content') || new URL(targetUrl).hostname;

    if (!title && !description) {
      return null;
    }

    const preview = {
      type: 'link',
      url: targetUrl,
      title: title.trim().slice(0, 100),
      description: description.trim().slice(0, 200),
      image,
      siteName
    };

    previewCache.set(targetUrl, preview);
    return preview;
  } catch {
    return null;
  }
}

module.exports = { fetchLinkPreview, extractYouTubeId };
