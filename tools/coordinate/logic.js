// FS Evo — Coordinate Converter
// Step 22: WGS84 → Web Mercator (EPSG:3857)

document.addEventListener("DOMContentLoaded", () => {
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  const projectionSelect = document.getElementById("projection");
  const output = document.getElementById("outputData");

  const convertBtn = document.getElementById("convertBtn");
  const clearBtn = document.getElementById("clearBtn");

  if (!latInput || !lngInput || !projectionSelect || !output) {
    console.error("FS Evo: Required elements not found");
    return;
  }

  const RADIUS = 6378137; // Earth radius in meters (Web Mercator)

  function wgs84ToWebMercator(lat, lng) {
    const x = RADIUS * (lng * Math.PI / 180);
    const y =
      RADIUS *
      Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    return { x, y };
  }

  function convertCoordinates() {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);

    if (isNaN(lat) || isNaN(lng)) {
      output.value = "Error: Enter valid numeric latitude and longitude.";
      return;
    }

    if (lat < -85.0511 || lat > 85.0511) {
      output.value = "Error: Latitude out of Web Mercator bounds.";
      return;
    }

    const proj = projectionSelect.value;

    if (proj === "3857") {
      const { x, y } = wgs84ToWebMercator(lat, lng);

      output.value =
        `Input CRS : WGS84 (EPSG:4326)\n` +
        `Output CRS: Web Mercator (EPSG:3857)\n\n` +
        `X (meters): ${x.toFixed(3)}\n` +
        `Y (meters): ${y.toFixed(3)}`;
    }
  }

  convertBtn.addEventListener("click", convertCoordinates);

  clearBtn.addEventListener("click", () => {
    latInput.value = "";
    lngInput.value = "";
    output.value = "";
  });
});
