const MAPBOX_TOKEN =
  "pk.eyJ1Ijoic3VzYW4wMDAwMDA3IiwiYSI6ImNtaGJ0bWcwcjEyNDkyaXNoNXowMDd0eXcifQ.Bp7miSYXMTi2W9RchOIhXA";
mapboxgl.accessToken = MAPBOX_TOKEN;

const app = document.getElementById("app");
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/standard-satellite",
  center: [78.9629, 20.5937],
  zoom: 1.6,
  projection: "globe",
});

const card = document.getElementById("weatherCard");
const splitBtn = document.getElementById("splitBtn");
const closeBtn = document.getElementById("closeBtn");

const mTemp = document.getElementById("mTemp");
const mWind = document.getElementById("mWind");
const mHum = document.getElementById("mHum");
const mCond = document.getElementById("mCond");
const cardTitle = document.getElementById("cardTitle");
const cardCoords = document.getElementById("cardCoords");
const animFrame = document.getElementById("weatherAnim");
const dayLabel = document.getElementById("dayLabel");
const infoContent = document.getElementById("infoContent");

/* 🔍 Search elements */
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchContainer = document.getElementById("searchContainer");

/* 👋 Optional intro message (if somehow exists on this page) */
const introHero = document.getElementById("introHero");

// ✅ HARD KILL intro box on globe page (just in case it leaks here)
if (introHero) {
  introHero.style.opacity = "0";
  introHero.style.pointerEvents = "none";
  introHero.style.display = "none";
}

/* ✅ Extra: JS-level scroll lock for this page */
document.documentElement.style.overflow = "hidden";
document.body.style.overflow = "hidden";

let currentOffset = 0;
let weatherData = null;
let searchTimeout = null;
let currentSearchFeatures = [];

/* Reapply temp after iframe loads */
animFrame.onload = () => {
  animFrame.contentWindow?.postMessage({ type: "reapplyTemp" }, "*");
};

/* MAP LOCK / UNLOCK */
function lockGlobe() {
  map.dragPan.disable();
  map.scrollZoom.disable();
  map.doubleClickZoom.disable();
  map.touchZoomRotate.disable();
}

function unlockGlobe() {
  map.dragPan.enable();
  map.scrollZoom.enable();
  map.doubleClickZoom.enable();
  map.touchZoomRotate.enable();
}

// start interactive
unlockGlobe();

/* UI BUTTONS */
closeBtn.onclick = () => {
  card.classList.remove("visible");
  app.classList.remove("split");
  unlockGlobe();
};

splitBtn.onclick = () => {
  app.classList.toggle("split");
  if (app.classList.contains("split")) {
    unlockGlobe();
  } else {
    if (card.classList.contains("visible")) lockGlobe();
    else unlockGlobe();
  }
};

/* WEATHER API */
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&past_days=1&forecast_days=2&timezone=auto`;
  const res = await fetch(url);
  return res.json();
}

/* 🔠 Helper: mapbox feature -> "City, Country" */
function formatFeatureName(feature) {
  if (!feature) return "";

  let place = null;
  let country = null;

  // If the feature itself is a place, use it
  if (feature.place_type && feature.place_type.includes("place")) {
    place = feature.text;
  }

  // Look into context for place / country
  if (Array.isArray(feature.context)) {
    for (const c of feature.context) {
      if (!place && c.id && c.id.startsWith("place.")) {
        place = c.text;
      }
      if (c.id && c.id.startsWith("country.")) {
        country = c.text;
      }
    }
  }

  const placeName = feature.place_name || feature.text || "";

  // Fallbacks
  if (!place && placeName) {
    place = placeName.split(",")[0].trim();
  }
  if (!country && placeName) {
    const parts = placeName.split(",");
    country = parts[parts.length - 1].trim();
  }

  // Clean/extract short version of place if it has hyphen etc.
  if (place && place.includes("-")) {
    // "Kodai - Pallangi Road" → "Kodai"
    place = place.split("-")[0].trim();
  }

  if (place && country) return `${place}, ${country}`;
  return place || country || placeName;
}

/* GEOCODING NAME (for clicks) */
async function getLocationName(lat, lon) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?limit=1&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    const feature = data.features && data.features[0];
    if (!feature) return `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
    const niceName = formatFeatureName(feature);
    return niceName || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
  } catch (e) {
    console.error("Reverse geocode failed:", e);
    return `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
  }
}

/* WEATHER CODE → TEXT */
function codeToText(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm + hail",
    99: "Severe storm",
  };
  return map[code] || "Unknown";
}

function codeToCategory(code) {
  if ([3].includes(code)) return "foggy";
  if ([45, 48].includes(code)) return "foggy";
  if ([2].includes(code)) return "sunny";
  if ([0, 1].includes(code)) return "sunny";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "storm";
  return "sunny";
}

function categoryFromSummary(summary) {
  if (!summary) return "sunny";
  const temp = Number(summary.t);
  const code = Number(summary.code);
  if (!isNaN(temp) && temp < 5) return "snowy";
  return codeToCategory(code);
}

/* SUMMARIZE DAY */
function summarizeDay(data, offset) {
  const h = data.hourly;
  if (!h) return null;

  const times = h.time.map((t) => new Date(t));
  const now = new Date();
  const tgt = new Date(now);
  tgt.setDate(now.getDate() + offset);
  const tgtDate = tgt.toISOString().split("T")[0];

  const idx = times
    .map((t, i) => (t.toISOString().startsWith(tgtDate) ? i : -1))
    .filter((i) => i >= 0);

  if (!idx.length) return null;

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const t = avg(idx.map((i) => h.temperature_2m[i]));
  const hum = avg(idx.map((i) => h.relative_humidity_2m[i]));
  const wind = avg(idx.map((i) => h.wind_speed_10m[i]));

  const codeCount = {};
  idx.forEach((i) => {
    const c = h.weathercode[i];
    codeCount[c] = (codeCount[c] || 0) + 1;
  });

  const code = Number(
    Object.entries(codeCount).sort((a, b) => b[1] - a[1])[0][0]
  );

  return {
    t: t.toFixed(1),
    hum: Math.round(hum),
    wind: wind.toFixed(1),
    cond: codeToText(code),
    code,
  };
}

/* IFRAME & CARD UPDATE */
function smoothSwapIframe(newSrc) {
  if (!animFrame.style.opacity) animFrame.style.opacity = "1";
  gsap.to(animFrame, {
    opacity: 0,
    duration: 0.35,
    ease: "power2.inOut",
    onComplete: () => {
      animFrame.src = newSrc;
      gsap.to(animFrame, { opacity: 1, duration: 0.45, ease: "power2.out" });
    },
  });
}

function updateCard(offset, direction = 1) {
  if (!weatherData) return;
  const d = summarizeDay(weatherData, offset);
  if (!d) return;

  const tl = gsap.timeline();
  gsap.set(infoContent, { y: 0 });

  tl.to(infoContent, {
    y: direction * -30,
    opacity: 0,
    duration: 0.35,
    ease: "power2.inOut",
    onComplete: () => {
      mTemp.textContent = `${d.t} °C`;
      mWind.textContent = `${d.wind} m/s`;
      mHum.textContent = `${d.hum} %`;
      mCond.textContent = d.cond;
      dayLabel.textContent =
        offset === -1 ? "Yesterday" : offset === 0 ? "Today" : "Tomorrow";
    },
  }).fromTo(
    infoContent,
    { y: direction * 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
  );

  const category = categoryFromSummary(d);
  const targetSrc = `weather_cards/${category}.html`;
  if (!animFrame.src || !animFrame.src.endsWith(targetSrc)) {
    smoothSwapIframe(targetSrc);
  }

  animFrame.contentWindow?.postMessage(
    { type: "setTemp", temp: Number(d.t) },
    "*"
  );
}

/* Click inside globe circle only */
function isPointOnGlobe(point) {
  const rect = map.getContainer().getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = point.x - cx;
  const dy = point.y - cy;
  const r = Math.min(rect.width, rect.height) / 2;
  return dx * dx + dy * dy <= r * r;
}

/* Drag detection */
let dragStartPoint = null;
let dragMoved = false;

map.on("mousedown", (e) => {
  dragStartPoint = e.point;
  dragMoved = false;
});

map.on("mousemove", (e) => {
  if (!dragStartPoint) return;
  const dx = e.point.x - dragStartPoint.x;
  const dy = e.point.y - dragStartPoint.y;
  if (dx * dx + dy * dy > 9) dragMoved = true;
});

map.on("mouseup", () => {
  dragStartPoint = null;
});

/* Core: open weather card */
async function showWeatherFor(lat, lng, nameHint = null) {
  card.classList.add("visible");
  if (app.classList.contains("split")) unlockGlobe();
  else lockGlobe();

  cardTitle.textContent = "Loading...";
  cardCoords.textContent = "";
  mTemp.textContent = mWind.textContent = mHum.textContent = mCond.textContent =
    "--";

  try {
    const [data, resolvedNameRaw] = await Promise.all([
      fetchWeather(lat, lng),
      nameHint ? Promise.resolve(nameHint) : getLocationName(lat, lng),
    ]);

    weatherData = data;
    currentOffset = 0;
    updateCard(0);

    const resolvedName =
      resolvedNameRaw || `Lat ${lat.toFixed(2)}, Lon ${lng.toFixed(2)}`;
    cardTitle.textContent = resolvedName;
    cardCoords.textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lng.toFixed(2)}`;
  } catch (err) {
    console.error(err);
    const fallback =
      nameHint || `Lat ${lat.toFixed(2)}, Lon ${lng.toFixed(2)}`;
    cardTitle.textContent = fallback;
    cardCoords.textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lng.toFixed(2)}`;
  }
}

/* MAP CLICK -> weather */
map.on("click", (e) => {
  if (dragMoved) {
    dragMoved = false;
    return;
  }
  if (!isPointOnGlobe(e.point)) return;

  const { lat, lng } = e.lngLat;
  if (card.classList.contains("visible") && !app.classList.contains("split"))
    return;
  showWeatherFor(lat, lng);
});

/* Scroll change day – and STOP page scroll while over card */
card.addEventListener(
  "wheel",
  (e) => {
    if (!weatherData) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY < 0 && currentOffset > -1) {
      currentOffset--;
      updateCard(currentOffset, -1);
    } else if (e.deltaY > 0 && currentOffset < 1) {
      currentOffset++;
      updateCard(currentOffset, 1);
    }
  },
  { passive: false }
);

/* 💡 Global wheel lock:
   if user scrolls anywhere on this page, block it.
   (Globe is full-screen, so no page scroll needed.) */
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

/* 🔍 SEARCH */

/* stop search clicks bubbling into map */
searchContainer.addEventListener("mousedown", (e) => e.stopPropagation());
searchContainer.addEventListener("click", (e) => e.stopPropagation());

function clearSearchResults() {
  searchResults.innerHTML = "";
  searchResults.classList.remove("visible");
  currentSearchFeatures = [];
}

async function performSearch(query) {
  if (!query.trim()) {
    clearSearchResults();
    return;
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?autocomplete=true&limit=5&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    const features = data.features || [];
    currentSearchFeatures = features;

    if (!features.length) {
      searchResults.innerHTML =
        '<div class="search-item empty">No results</div>';
      searchResults.classList.add("visible");
      return;
    }

    searchResults.innerHTML = features
      .map((f, i) => {
        const label = formatFeatureName(f);
        return `<div class="search-item" data-idx="${i}">${label}</div>`;
      })
      .join("");
    searchResults.classList.add("visible");
  } catch (err) {
    console.error("Search failed:", err);
  }
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value;
  clearTimeout(searchTimeout);
  if (!q.trim()) {
    clearSearchResults();
    return;
  }
  searchTimeout = setTimeout(() => performSearch(q), 300);
});

/* click suggestion */
searchResults.addEventListener("click", (e) => {
  const item = e.target.closest(".search-item");
  if (!item || item.classList.contains("empty")) return;

  const idx = Number(item.dataset.idx);
  const feature = currentSearchFeatures[idx];
  if (!feature) return;

  const [lng, lat] = feature.center;
  const name = formatFeatureName(feature);

  clearSearchResults();
  searchInput.blur();

  map.flyTo({ center: [lng, lat], zoom: 5, essential: true });
  showWeatherFor(lat, lng, name);
});

/* Enter => first result */
searchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (!currentSearchFeatures.length) return;
  const feature = currentSearchFeatures[0];
  const [lng, lat] = feature.center;
  const name = formatFeatureName(feature);

  clearSearchResults();
  searchInput.blur();
  map.flyTo({ center: [lng, lat], zoom: 5, essential: true });
  showWeatherFor(lat, lng, name);
});

/* click outside search -> close dropdown */
document.addEventListener("click", (e) => {
  if (!searchContainer.contains(e.target)) clearSearchResults();
});
