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
renderParticles();
syncParticleLayerHeight();
initParticleLag();

window.addEventListener("resize", syncParticleLayerHeight);

function renderParticles() {
  const layer = document.querySelector(".particle-layer");
  if (!layer) return;

  const particles = [
    [7, 15, 26, 0.18, 42, -22, 34, "normal"],
    [18, 44, 14, 0.2, -28, 36, 28, "reverse"],
    [32, 21, 12, 0.16, 34, 28, 42, "normal"],
    [45, 67, 22, 0.18, -40, -26, 36, "reverse"],
    [58, 13, 16, 0.15, 30, 42, 31, "normal"],
    [73, 38, 28, 0.17, -36, 34, 48, "reverse"],
    [86, 76, 18, 0.18, 22, -44, 39, "normal"],
    [12, 83, 20, 0.14, 38, 24, 45, "reverse"],
    [26, 9, 10, 0.16, -24, 30, 26, "normal"],
    [39, 89, 30, 0.12, 36, -32, 52, "reverse"],
    [64, 56, 13, 0.18, -30, -38, 33, "normal"],
    [91, 24, 24, 0.13, -44, 22, 44, "reverse"],
    [5, 58, 12, 0.17, 28, -28, 29, "normal"],
    [52, 36, 17, 0.15, -22, 40, 37, "reverse"],
    [79, 91, 11, 0.2, 24, -30, 32, "normal"],
    [68, 7, 21, 0.12, -34, 26, 46, "reverse"],
    [16, 27, 18, 0.13, 30, -34, 41, "normal"],
    [34, 53, 9, 0.18, -18, 26, 24, "reverse"],
    [57, 82, 15, 0.14, 28, -22, 35, "normal"],
    [72, 19, 12, 0.16, -26, 30, 30, "reverse"],
    [93, 57, 19, 0.12, -32, -24, 43, "normal"],
    [4, 31, 23, 0.1, 36, 18, 50, "reverse"],
    [43, 6, 14, 0.15, 20, 34, 29, "normal"],
    [61, 43, 10, 0.17, -24, -28, 27, "reverse"],
  ];

  layer.innerHTML = particles
    .map(([x, y, size, opacity, dx, dy, moveDuration, spinDirection], index) => {
      const spinDuration = 8 + (index % 6) * 3;
      return `
        <span
          class="particle"
          style="
            --x: ${x}%;
            --y: ${y}%;
            --size: ${size}px;
            --opacity: ${opacity};
            --dx: ${dx}px;
            --dy: ${dy}px;
            --move-duration: ${moveDuration}s;
            --spin-duration: ${spinDuration}s;
            --spin-direction: ${spinDirection};
          "
        ></span>
      `;
    })
    .join("");
}

function syncParticleLayerHeight() {
  const layer = document.querySelector(".particle-layer");
  if (!layer) return;

  layer.style.display = "none";
  const height = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight,
  );
  layer.style.display = "";
  document.body.style.setProperty("--particle-layer-height", `${height}px`);
}

function initParticleLag() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let current = 0;
  let target = 0;

  const updateTarget = () => {
    target = window.scrollY * 0.16;
  };

  const animate = () => {
    current += (target - current) * 0.08;
    document.body.style.setProperty("--particle-lag", `${current.toFixed(2)}px`);
    requestAnimationFrame(animate);
  };

  updateTarget();
  window.addEventListener("scroll", updateTarget, { passive: true });
  requestAnimationFrame(animate);
}

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
  syncParticleLayerHeight();
}

function hideVideosSection() {
  document.querySelector("#videos").hidden = true;
  document.querySelector("#videos-nav-link").hidden = true;
  document.querySelector("#video-grid").innerHTML = "";
  syncParticleLayerHeight();
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
