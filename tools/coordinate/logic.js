// FS Evo — Coordinate Converter
// Step 24A: WGS84 → Web Mercator & WGS84 → UTM

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

  const a = 6378137.0; // WGS84 semi-major axis
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e = Math.sqrt(f * (2 - f));

  // ---------- Web Mercator ----------
  function wgs84ToWebMercator(lat, lon) {
    const R = 6378137;
    const x = R * (lon * Math.PI / 180);
    const y =
      R *
      Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    return { x, y };
  }

  // ---------- UTM ----------
  function wgs84ToUTM(lat, lon) {
    const zone = Math.floor((lon + 180) / 6) + 1;
    const λ0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

    const φ = lat * Math.PI / 180;
    const λ = lon * Math.PI / 180;

    const N = a / Math.sqrt(1 - e * e * Math.sin(φ) * Math.sin(φ));
    const T = Math.tan(φ) * Math.tan(φ);
    const C = (e * e / (1 - e * e)) * Math.cos(φ) * Math.cos(φ);
    const A = Math.cos(φ) * (λ - λ0);

    const M =
      a *
      ((1 - e * e / 4 - 3 * e ** 4 / 64 - 5 * e ** 6 / 256) * φ
        - (3 * e * e / 8 + 3 * e ** 4 / 32 + 45 * e ** 6 / 1024) * Math.sin(2 * φ)
        + (15 * e ** 4 / 256 + 45 * e ** 6 / 1024) * Math.sin(4 * φ)
        - (35 * e ** 6 / 3072) * Math.sin(6 * φ));

    let easting =
      k0 *
        N *
        (A +
          (1 - T + C) * A ** 3 / 6 +
          (5 - 18 * T + T ** 2 + 72 * C) * A ** 5 / 120) +
      500000;

    let northing =
      k0 *
      (M +
        N *
          Math.tan(φ) *
          (A ** 2 / 2 +
            (5 - T + 9 * C) * A ** 4 / 24 +
            (61 - 58 * T + T ** 2) * A ** 6 / 720));

    const hemisphere = lat >= 0 ? "N" : "S";
    if (lat < 0) northing += 10000000;

    return { easting, northing, zone, hemisphere };
  }

  function convertCoordinates() {
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lngInput.value);

    if (isNaN(lat) || isNaN(lon)) {
      output.value = "Error: Enter valid numeric values.";
      return;
    }

    if (directionSelect.value !== "forward") {
      output.value = "Reverse conversion will be added next.";
      return;
    }

    if (projectionSelect.value === "3857") {
      const { x, y } = wgs84ToWebMercator(lat, lon);

      output.value =
        `Input CRS : WGS84 (EPSG:4326)\n` +
        `Output CRS: Web Mercator (EPSG:3857)\n\n` +
        `X (meters): ${x.toFixed(3)}\n` +
        `Y (meters): ${y.toFixed(3)}`;
    }

    if (projectionSelect.value === "utm") {
      const utm = wgs84ToUTM(lat, lon);

      output.value =
        `Input CRS : WGS84 (EPSG:4326)\n` +
        `Output CRS: UTM (WGS84)\n\n` +
        `Zone      : ${utm.zone}${utm.hemisphere}\n` +
        `Easting   : ${utm.easting.toFixed(3)} m\n` +
        `Northing  : ${utm.northing.toFixed(3)} m`;
    }
  }

  convertBtn.addEventListener("click", convertCoordinates);

  clearBtn.addEventListener("click", () => {
    latInput.value = "";
    lngInput.value = "";
    output.value = "";
  });
});
