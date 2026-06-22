import { writeFile } from "node:fs/promises";

const CHANNEL_ID = "UCAPMkkZzlYhVX4Rn5hRCW9g";
const MAX_VIDEOS = 6;
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const OUTPUT_FILE = "videos.json";

const response = await fetch(FEED_URL, {
  headers: {
    "user-agent": "FEDOT GitHub Pages video updater",
  },
});

if (!response.ok) {
  throw new Error(`YouTube RSS request failed: ${response.status} ${response.statusText}`);
}

const xml = await response.text();
const videos = parseYouTubeFeed(xml)
  .filter((video) => !video.isShort)
  .slice(0, MAX_VIDEOS)
  .map(({ isShort, ...video }) => video);

if (!videos.length) {
  throw new Error("YouTube RSS feed did not contain non-Shorts videos");
}

const payload = {
  channelId: CHANNEL_ID,
  source: FEED_URL,
  updatedAt: new Date().toISOString(),
  videos,
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Saved ${videos.length} videos to ${OUTPUT_FILE}`);

function parseYouTubeFeed(xmlText) {
  return [...xmlText.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => {
    const entry = match[1];
    const videoId = readTag(entry, "yt:videoId");
    const title = decodeXml(readTag(entry, "title") || "Видео на YouTube");
    const link = readLink(entry) || `https://www.youtube.com/watch?v=${videoId}`;
    const published = readTag(entry, "published");
    const updated = readTag(entry, "updated");
    const thumbnail = readAttribute(entry, "media:thumbnail", "url") || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const views = Number(readAttribute(entry, "media:statistics", "views") || 0);
    const description = decodeXml(readTag(entry, "media:description") || "");

    return {
      id: videoId,
      title,
      url: link,
      published,
      updated,
      thumbnail,
      views,
      description,
      isShort: link.includes("youtube.com/shorts/"),
    };
  });
}

function readTag(xmlText, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xmlText.match(new RegExp(`<${escaped}>([\\s\\S]*?)<\\/${escaped}>`));
  return match?.[1]?.trim() || "";
}

function readLink(xmlText) {
  return readAttribute(xmlText, "link", "href");
}

function readAttribute(xmlText, tagName, attributeName) {
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedAttribute = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = xmlText.match(new RegExp(`<${escapedTag}\\b[^>]*>`))?.[0] || "";
  const value = tag.match(new RegExp(`${escapedAttribute}="([^"]*)"`))?.[1] || "";
  return decodeXml(value);
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}
