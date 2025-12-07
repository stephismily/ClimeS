mapboxgl.accessToken =
  "pk.eyJ1Ijoic3VzYW4wMDAwMDA3IiwiYSI6ImNtaGJ0bWcwcjEyNDkyaXNoNXowMDd0eXcifQ.Bp7miSYXMTi2W9RchOIhXA";

const app = document.getElementById("app");
const card = document.getElementById("weatherCard");

const mTemp = document.getElementById("mTemp");
const mHum = document.getElementById("mHum");
const mWind = document.getElementById("mWind");
const mCond = document.getElementById("mCond");
const cardTitle = document.getElementById("cardTitle");
const cardCoords = document.getElementById("cardCoords");

const splitBtn = document.getElementById("splitBtn");
const closeBtn = document.getElementById("closeBtn");

/* ✅ MAP */
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/standard-satellite",
  center: [78.96, 20.59],
  zoom: 1.6,
  projection: "globe"
});

/* ✅ FORCE MAPBOX RESIZE */
function forceResize() {
  requestAnimationFrame(() => map.resize());
}

map.on("load", forceResize);
window.addEventListener("resize", forceResize);

/* ✅ MOBILE CENTER FIX */
if (window.innerWidth < 768) {
  map.setZoom(1.3);
  map.setCenter([78.96, 15]);
  map.scrollZoom.disable();
}

/* LOCK / UNLOCK */
function lockGlobe() {
  map.dragPan.disable();
  map.scrollZoom.disable();
}

function unlockGlobe() {
  map.dragPan.enable();
  map.scrollZoom.enable();
}

/* WEATHER */
async function fetchWeather(lat, lon) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
  );
  return response.json();
}

/* MAP CLICK */
map.on("click", async (e) => {
  const { lat, lng } = e.lngLat;

  card.classList.add("visible");
  if (!app.classList.contains("split")) lockGlobe();

  forceResize();

  cardTitle.textContent = "Loading...";
  cardCoords.textContent = `Lat ${lat.toFixed(2)}, Lon ${lng.toFixed(2)}`;

  const data = await fetchWeather(lat, lng);
  mTemp.textContent = data.hourly.temperature_2m[0].toFixed(1);
  mHum.textContent = data.hourly.relative_humidity_2m[0];
  mWind.textContent = data.hourly.wind_speed_10m[0].toFixed(1);
  mCond.textContent = "Clear";
});

/* BUTTONS */
splitBtn.onclick = () => {
  app.classList.toggle("split");
  unlockGlobe();
  forceResize();
};

closeBtn.onclick = () => {
  card.classList.remove("visible");
  app.classList.remove("split");
  unlockGlobe();
  forceResize();
};
