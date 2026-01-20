// FS Evo — Coordinate Converter
// Version: v1.1 (stable)
// Supported:
// - WGS84 ↔ Web Mercator (EPSG:4326 ↔ 3857)
// - WGS84 → UTM (forward only)
// Notes:
// - UTM → WGS84 requires zone & hemisphere (intentionally disabled)

document.addEventListener("DOMContentLoaded", () => {
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  const directionSelect = document.getElementById("direction");
  const projectionSelect = document.getElementById("projection");
  const output = document.getElementById("outputData");

  const convertBtn = document.getElementById("convertBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");

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

  // ---------- Constants (WGS84) ----------
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e = Math.sqrt(f * (2 - f));
  const e1sq = (e * e) / (1 - e * e);

  // ---------- Web Mercator ----------
  function wgs84ToWebMercator(lat, lon) {
    const R = 6378137;
    const x = R * (lon * Math.PI / 180);
    const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    return { x, y };
  }

  function webMercatorToWgs84(x, y) {
    const lon = (x / a) * (180 / Math.PI);
    const lat =
      (2 * Math.atan(Math.exp(y / a)) - Math.PI / 2) *
      (180 / Math.PI);
    return { lat, lon };
  }

  // ---------- UTM (Forward Only) ----------
  function wgs84ToUTM(lat, lon) {
    const zone = Math.floor((lon + 180) / 6) + 1;
    const λ0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

    const φ = lat * Math.PI / 180;
    const λ = lon * Math.PI / 180;

    const N = a / Math.sqrt(1 - e * e * Math.sin(φ) ** 2);
    const T = Math.tan(φ) ** 2;
    const C = e1sq * Math.cos(φ) ** 2;
    const A = Math.cos(φ) * (λ - λ0);

    const M =
      a *
      ((1 - e * e / 4 - 3 * e ** 4 / 64 - 5 * e ** 6 / 256) * φ
        - (3 * e ** 2 / 8 + 3 * e ** 4 / 32 + 45 * e ** 6 / 1024) * Math.sin(2 * φ)
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

  // ---------- Main Convert ----------
  function convertCoordinates() {
    const inputA = parseFloat(latInput.value);
    const inputB = parseFloat(lngInput.value);

    if (isNaN(inputA) || isNaN(inputB)) {
      output.value = "Error: Please enter valid numeric values.";
      return;
    }

    const direction = directionSelect.value;
    const projection = projectionSelect.value;

    // WGS84 → Web Mercator
    if (direction === "forward" && projection === "3857") {
      const { x, y } = wgs84ToWebMercator(inputA, inputB);
      output.value =
        `WGS84 → Web Mercator\n\n` +
        `X: ${x.toFixed(3)} m\n` +
        `Y: ${y.toFixed(3)} m`;
      return;
    }

    // WGS84 → UTM
    if (direction === "forward" && projection === "utm") {
      const utm = wgs84ToUTM(inputA, inputB);
      output.value =
        `WGS84 → UTM\n\n` +
        `Zone: ${utm.zone}${utm.hemisphere}\n` +
        `Easting : ${utm.easting.toFixed(3)} m\n` +
        `Northing: ${utm.northing.toFixed(3)} m`;
      return;
    }

    // Web Mercator → WGS84
    if (direction === "reverse" && projection === "3857") {
      const { lat, lon } = webMercatorToWgs84(inputB, inputA);
      output.value =
        `Web Mercator → WGS84\n\n` +
        `Latitude : ${lat.toFixed(6)}\n` +
        `Longitude: ${lon.toFixed(6)}`;
      return;
    }

    // UTM reverse (disabled)
    if (direction === "reverse" && projection === "utm") {
      output.value =
        "UTM → WGS84 is disabled in v1.\n\n" +
        "Reason:\n" +
        "- UTM conversion requires Zone and Hemisphere.\n" +
        "- These inputs are not yet provided.\n\n" +
        "This will be added in a future update.";
    }
  }

  // ---------- Events ----------
  convertBtn.addEventListener("click", convertCoordinates);

  clearBtn.addEventListener("click", () => {
    latInput.value = "";
    lngInput.value = "";
    output.value = "";
  });

  copyBtn.addEventListener("click", () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Output"), 1000);
  });

  downloadBtn.addEventListener("click", () => {
    if (!output.value) return;

    const blob = new Blob([output.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "coordinates.txt";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
