// FS Evo — Coordinate Converter
// Step 25: WGS84 ↔ Web Mercator ↔ UTM (Complete)

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
    !output ||
    !copyBtn ||
    !downloadBtn
  ) {
    console.error("FS Evo: Required elements not found");
    return;
  }

  // WGS84 constants
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e = Math.sqrt(f * (2 - f));
  const e1sq = e * e / (1 - e * e);

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

  // ---------- UTM ----------
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

  function utmToWgs84(easting, northing, zone, hemisphere) {
    if (hemisphere === "S") northing -= 10000000;

    const λ0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;
    const M = northing / k0;

    const μ =
      M /
      (a *
        (1 - e ** 2 / 4 - 3 * e ** 4 / 64 - 5 * e ** 6 / 256));

    const φ1 =
      μ +
      (3 * e / 2 - 27 * e ** 3 / 32) * Math.sin(2 * μ) +
      (21 * e ** 2 / 16 - 55 * e ** 4 / 32) * Math.sin(4 * μ) +
      (151 * e ** 3 / 96) * Math.sin(6 * μ);

    const N1 = a / Math.sqrt(1 - e ** 2 * Math.sin(φ1) ** 2);
    const T1 = Math.tan(φ1) ** 2;
    const C1 = e1sq * Math.cos(φ1) ** 2;
    const R1 =
      (a * (1 - e ** 2)) /
      Math.pow(1 - e ** 2 * Math.sin(φ1) ** 2, 1.5);

    const D = (easting - 500000) / (N1 * k0);

    const lat =
      φ1 -
      (N1 * Math.tan(φ1) / R1) *
        (D ** 2 / 2 -
          (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e1sq) *
            D ** 4 / 24);

    const lon =
      λ0 +
      (D -
        (1 + 2 * T1 + C1) * D ** 3 / 6 +
        (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * e1sq + 24 * T1 ** 2) *
          D ** 5 / 120) /
        Math.cos(φ1);

    return {
      lat: lat * (180 / Math.PI),
      lon: lon * (180 / Math.PI),
    };
  }

  function convertCoordinates() {
    const A = parseFloat(latInput.value);
    const B = parseFloat(lngInput.value);

    if (isNaN(A) || isNaN(B)) {
      output.value = "Error: Enter valid numeric values.";
      return;
    }

    const direction = directionSelect.value;
    const proj = projectionSelect.value;

    if (direction === "forward" && proj === "3857") {
      const { x, y } = wgs84ToWebMercator(A, B);
      output.value =
        `WGS84 → Web Mercator\n\nX: ${x.toFixed(3)}\nY: ${y.toFixed(3)}`;
    }

    if (direction === "forward" && proj === "utm") {
      const utm = wgs84ToUTM(A, B);
      output.value =
        `WGS84 → UTM\n\nZone: ${utm.zone}${utm.hemisphere}\n` +
        `Easting : ${utm.easting.toFixed(3)}\n` +
        `Northing: ${utm.northing.toFixed(3)}`;
    }

    if (direction === "reverse" && proj === "3857") {
      const { lat, lon } = webMercatorToWgs84(B, A);
      output.value =
        `Web Mercator → WGS84\n\nLat: ${lat.toFixed(6)}\nLon: ${lon.toFixed(6)}`;
    }

    if (direction === "reverse" && proj === "utm") {
      const zone = Math.floor((B + 180) / 6) + 1;
      const hemisphere = A >= 0 ? "N" : "S";

      const { lat, lon } = utmToWgs84(B, A, zone, hemisphere);
      output.value =
        `UTM → WGS84\n\nLat: ${lat.toFixed(6)}\nLon: ${lon.toFixed(6)}`;
    }
  }

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
    setTimeout(() => {
      copyBtn.textContent = "Copy Output";
    }, 1000);
  });

  downloadBtn.addEventListener("click", () => {
    if (!output.value) return;

    const blob = new Blob([output.value], {
      type: "text/plain",
    });

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
