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

let currentOffset = 0;
let weatherData = null;

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

unlockGlobe();

/* UI BUTTONS */
closeBtn.onclick = () => {
  card.classList.remove("visible");
  app.classList.remove("split");
  unlockGlobe();
};

splitBtn.onclick = () => {
  app.classList.toggle("split");
  if (app.classList.contains("split")) unlockGlobe();
  else lockGlobe();
};

/* FETCH WEATHER APIS */
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&past_days=1&forecast_days=2&timezone=auto`;
  const res = await fetch(url);
  return res.json();
}

async function getLocationName(lat, lon) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const res = await fetch(url);
  const data = await res.json();

  return (
    data.city ||
    data.locality ||
    data.principalSubdivision ||
    data.countryName ||
    "Unknown Location"
  );
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

/* WEATHER CODE → 5 CATEGORY ANIMATIONS
   Updated mapping:
   - code 2 (Partly cloudy) => sunny
   - code 3 (Overcast) => foggy
*/
function codeToCategory(code) {
  if ([3].includes(code)) return "foggy"; // Overcast -> foggy
  if ([45, 48].includes(code)) return "foggy";
  if ([2].includes(code)) return "sunny"; // Partly cloudy -> sunny
  if ([0, 1].includes(code)) return "sunny";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "storm";
  return "sunny";
}

/* Combined logic → if temp < 5°C force snowy */
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

/* SMOOTH TRANSITION FOR IFRAME */
function smoothSwapIframe(newSrc) {
  // Ensure element has explicit opacity for gsap to animate consistently
  if (!animFrame.style.opacity) animFrame.style.opacity = "1";

  gsap.to(animFrame, {
    opacity: 0,
    duration: 0.35,
    ease: "power2.inOut",
    onComplete: () => {
      // Small delay to reduce flicker across browsers
      animFrame.src = newSrc;
      // once new src is set, fade in
      gsap.to(animFrame, { opacity: 1, duration: 0.45, ease: "power2.out" });
    },
  });
}

/* UPDATE CARD */
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

  // compare by pathname end because animFrame.src may be absolute URL
  if (!animFrame.src || !animFrame.src.endsWith(targetSrc)) {
    smoothSwapIframe(targetSrc);
  }
}

/* MAP CLICK */
map.on("click", async (e) => {
  const { lat, lng } = e.lngLat;

  if (card.classList.contains("visible") && !app.classList.contains("split"))
    return;

  card.classList.add("visible");
  lockGlobe();

  cardTitle.textContent = "Loading...";
  cardCoords.textContent = "";
  mTemp.textContent =
    mWind.textContent =
    mHum.textContent =
    mCond.textContent =
      "--";

  try {
    const [data, locationName] = await Promise.all([
      fetchWeather(lat, lng),
      getLocationName(lat, lng),
    ]);

    weatherData = data;
    currentOffset = 0;

    updateCard(0);

    cardTitle.textContent = locationName;
    cardCoords.textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lng.toFixed(2)}`;
  } catch (err) {
    console.error(err);
    cardTitle.textContent = "Error fetching data.";
  }
});

/* SCROLL DAYS */
card.addEventListener("wheel", (e) => {
  if (!weatherData) return;

  if (e.deltaY < 0 && currentOffset > -1) {
    currentOffset--;
    updateCard(currentOffset, -1);
  } else if (e.deltaY > 0 && currentOffset < 1) {
    currentOffset++;
    updateCard(currentOffset, 1);
  }
});
