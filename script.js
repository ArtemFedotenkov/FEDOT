const SITE_CONFIG = {
  youtubeChannelId: "UCAPMkkZzlYhVX4Rn5hRCW9g",
  maxVideos: 6,
  links: {
    youtube: "https://www.youtube.com/channel/UCAPMkkZzlYhVX4Rn5hRCW9g",
    twitch: "https://www.twitch.tv/fedottheone",
    tiktok: "https://www.tiktok.com/@fedottheone",
    discord: "https://discord.gg/TyDUksgrkA",
    telegram: "https://t.me/FedotChannel",
    destream: "https://destream.net/live/FEDOT/donate",
  },
};

const platforms = [
  ["YouTube", "Прохождения, стримы и архивы эфиров", "simple-youtube", "youtube"],
  ["Twitch", "Запасная площадка для эфиров", "simple-twitch", "twitch"],
  ["TikTok", "Короткие моменты и нарезки", "simple-tiktok", "tiktok"],
  ["Discord", "Комьюнити и совместные игры", "simple-discord", "discord"],
  ["Telegram", "Новости канала и быстрые анонсы", "simple-telegram", "telegram"],
  ["Destream", "Поддержать канал донатом", "support", "destream"],
];

document.querySelectorAll("[data-link]").forEach((item) => {
  const key = item.dataset.link;
  item.href = SITE_CONFIG.links[key] || "#";
});

renderPlatforms();
loadVideos();

function renderPlatforms() {
  const grid = document.querySelector("#platform-grid");
  grid.innerHTML = platforms
    .map(([name, description, icon, key]) => {
      const url = SITE_CONFIG.links[key] || "#";
      return `
        <a class="platform-card" href="${url}" target="_blank" rel="noreferrer">
          <span class="platform-icon platform-icon-${icon}" aria-hidden="true">
            <span class="platform-symbol"></span>
          </span>
          <span class="platform-copy">
            <strong>${name}</strong>
            <span>${description}</span>
          </span>
          <span class="arrow" aria-hidden="true">›</span>
        </a>
      `;
    })
    .join("");
}

async function loadVideos() {
  const channelId = SITE_CONFIG.youtubeChannelId.trim();
  const isConfigured = channelId && !channelId.includes("REPLACE");

  if (!isConfigured) {
    hideVideosSection();
    return;
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("RSS request failed");

    const xmlText = await response.text();
    const videos = parseYouTubeFeed(xmlText)
      .filter((video) => !video.isShort)
      .slice(0, SITE_CONFIG.maxVideos);
    if (!videos.length) throw new Error("RSS feed is empty");

    renderVideos(videos);
    showVideosSection();
  } catch (error) {
    hideVideosSection();
  }
}

function showVideosSection() {
  document.querySelector("#videos").hidden = false;
  document.querySelector("#videos-nav-link").hidden = false;
}

function hideVideosSection() {
  document.querySelector("#videos").hidden = true;
  document.querySelector("#videos-nav-link").hidden = true;
  document.querySelector("#video-grid").innerHTML = "";
}

function parseYouTubeFeed(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return Array.from(doc.querySelectorAll("entry")).map((entry) => {
    const videoId = entry.querySelector("videoId")?.textContent || "";
    const title = entry.querySelector("title")?.textContent || "Видео на YouTube";
    const url = entry.querySelector("link")?.getAttribute("href") || `https://www.youtube.com/watch?v=${videoId}`;
    const published = entry.querySelector("published")?.textContent || "";
    const isShort = url.includes("youtube.com/shorts/");
    const thumbnail = videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : "assets/hero-gaming.png";

    return { title, url, published, thumbnail, isShort };
  });
}

function renderVideos(videos) {
  const grid = document.querySelector("#video-grid");
  grid.innerHTML = videos
    .map((video) => {
      const date = video.published ? formatDate(video.published) : "Настрой RSS в script.js";
      return `
        <a class="video-card" href="${video.url}" target="_blank" rel="noreferrer">
          <img class="video-thumb" src="${video.thumbnail}" alt="">
          <span class="video-body">
            <span class="video-title">${video.title}</span>
            <span class="video-date">${date}</span>
          </span>
        </a>
      `;
    })
    .join("");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
