const SITE_CONFIG = {
  videosJsonUrl: "videos.json",
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
  try {
    const response = await fetch(SITE_CONFIG.videosJsonUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("videos.json request failed");

    const data = await response.json();
    const videos = Array.isArray(data?.videos) ? data.videos.slice(0, SITE_CONFIG.maxVideos) : [];
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
