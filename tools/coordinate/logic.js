// FS Evo — Coordinate Converter
// Step 23: WGS84 ↔ Web Mercator (EPSG:4326 ↔ EPSG:3857)

document.addEventListener("DOMContentLoaded", () => {
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  const directionSelect = document.getElementById("direction");
  const projectionSelect = document.getElementById("projection");
  const output = document.getElementById("outputData");

  const convertBtn = document.getElementById("convertBtn");
  const clearBtn = document.getElementById("clearBtn");

  if (
    !latInput ||
    !lngInput ||
    !directionSelect ||
    !projectionSelect ||
    !output
  ) {
    console.error("FS Evo: Required elements not found");
    return;
  }

  const RADIUS = 6378137;

  // ---------- Forward ----------
  function wgs84ToWebMercator(lat, lon) {
    const x = RADIUS * (lon * Math.PI / 180);
    const y =
      RADIUS *
      Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    return { x, y };
  }

  // ---------- Reverse ----------
  function webMercatorToWgs84(x, y) {
    const lon = (x / RADIUS) * (180 / Math.PI);
    const lat =
      (2 * Math.atan(Math.exp(y / RADIUS)) - Math.PI / 2) *
      (180 / Math.PI);
    return { lat, lon };
  }

  function convertCoordinates() {
    const a = parseFloat(latInput.value);
    const b = parseFloat(lngInput.value);

    if (isNaN(a) || isNaN(b)) {
      output.value = "Error: Enter valid numeric values.";
      return;
    }

    const direction = directionSelect.value;

    if (direction === "forward") {
      if (a < -85.0511 || a > 85.0511) {
        output.value = "Error: Latitude out of Web Mercator bounds.";
        return;
      }

      const { x, y } = wgs84ToWebMercator(a, b);

      output.value =
        `Input CRS : WGS84 (EPSG:4326)\n` +
        `Output CRS: Web Mercator (EPSG:3857)\n\n` +
        `X (meters): ${x.toFixed(3)}\n` +
        `Y (meters): ${y.toFixed(3)}`;
    }

    if (direction === "reverse") {
      const { lat, lon } = webMercatorToWgs84(b, a);

      output.value =
        `Input CRS : Web Mercator (EPSG:3857)\n` +
        `Output CRS: WGS84 (EPSG:4326)\n\n` +
        `Latitude : ${lat.toFixed(6)}\n` +
        `Longitude: ${lon.toFixed(6)}`;
    }
  }

  convertBtn.addEventListener("click", convertCoordinates);

  clearBtn.addEventListener("click", () => {
    latInput.value = "";
    lngInput.value = "";
    output.value = "";
  });
});
