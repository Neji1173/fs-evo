// FS Evo - Coordinate Converter Logic
// WGS84 → Web Mercator (EPSG:3857) & UTM

document.addEventListener("DOMContentLoaded", () => {
  console.log("Coordinate logic loaded");

  const projectionSelect = document.getElementById("projection");
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");

  const outputXLabel = document.getElementById("output-x-label");
  const outputYLabel = document.getElementById("output-y-label");
  const outputX = document.getElementById("output-x");
  const outputY = document.getElementById("output-y");
  const outputNote = document.getElementById("output-note");
  const errorMessage = document.getElementById("error-message");

  const R = 6378137;
  const K0 = 0.9996;
  const E = 0.081819191;

  function toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  function getUTMZone(lng) {
    return Math.floor((lng + 180) / 6) + 1;
  }

  function latLngToUTM(lat, lng) {
    const zone = getUTMZone(lng);
    const lambda0 = toRadians((zone - 1) * 6 - 180 + 3);

    const latRad = toRadians(lat);
    const lngRad = toRadians(lng);

    const N = R / Math.sqrt(1 - Math.pow(E * Math.sin(latRad), 2));
    const T = Math.pow(Math.tan(latRad), 2);
    const C =
      (Math.pow(E, 2) / (1 - Math.pow(E, 2))) *
      Math.pow(Math.cos(latRad), 2);
    const A = Math.cos(latRad) * (lngRad - lambda0);

    const M =
      R *
      ((1 -
        Math.pow(E, 2) / 4 -
        (3 * Math.pow(E, 4)) / 64 -
        (5 * Math.pow(E, 6)) / 256) *
        latRad -
        ((3 * Math.pow(E, 2)) / 8 +
          (3 * Math.pow(E, 4)) / 32 +
          (45 * Math.pow(E, 6)) / 1024) *
          Math.sin(2 * latRad) +
        ((15 * Math.pow(E, 4)) / 256 +
          (45 * Math.pow(E, 6)) / 1024) *
          Math.sin(4 * latRad) -
        ((35 * Math.pow(E, 6)) / 3072) *
          Math.sin(6 * latRad));

    let easting =
      K0 *
        N *
        (A +
          ((1 - T + C) * Math.pow(A, 3)) / 6 +
          ((5 -
            18 * T +
            Math.pow(T, 2) +
            72 * C -
            58 *
              (Math.pow(E, 2) /
                (1 - Math.pow(E, 2)))) *
            Math.pow(A, 5)) /
            120) +
      500000;

    let northing =
      K0 *
      (M +
        N *
          Math.tan(latRad) *
          (Math.pow(A, 2) / 2 +
            ((5 - T + 9 * C + 4 * Math.pow(C, 2)) *
              Math.pow(A, 4)) /
              24 +
            ((61 -
              58 * T +
              Math.pow(T, 2) +
              600 * C -
              330 *
                (Math.pow(E, 2) /
                  (1 - Math.pow(E, 2)))) *
              Math.pow(A, 6)) /
              720));

    if (lat < 0) northing += 10000000;

    return { easting, northing, zone, hemisphere: lat >= 0 ? "N" : "S" };
  }

  function updateOutput() {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);

    if (isNaN(lat) || isNaN(lng)) {
      outputX.textContent = "—";
      outputY.textContent = "—";
      errorMessage.textContent = "";
      return;
    }

    if (lat < -90 || lat > 90) {
      errorMessage.textContent = "Latitude must be between −90 and 90.";
      return;
    }

    if (lng < -180 || lng > 180) {
      errorMessage.textContent = "Longitude must be between −180 and 180.";
      return;
    }

    errorMessage.textContent = "";

    if (projectionSelect.value === "mercator") {
      outputNote.textContent = "Web Mercator projection (EPSG:3857).";
      outputXLabel.textContent = "X:";
      outputYLabel.textContent = "Y:";

      const x = R * toRadians(lng);
      const y = R * Math.log(Math.tan(Math.PI / 4 + toRadians(lat) / 2));

      outputX.textContent = `${x.toFixed(3)} m`;
      outputY.textContent = `${y.toFixed(3)} m`;
      return;
    }

    const utm = latLngToUTM(lat, lng);
    outputNote.textContent = "UTM projection (WGS84).";
    outputXLabel.textContent = "Easting:";
    outputYLabel.textContent = "Northing:";

    outputX.textContent = `${utm.easting.toFixed(3)} m`;
    outputY.textContent = `${utm.northing.toFixed(
      3
    )} m (Zone ${utm.zone}${utm.hemisphere})`;
  }

  latInput.addEventListener("input", updateOutput);
  lngInput.addEventListener("input", updateOutput);
  projectionSelect.addEventListener("change", updateOutput);
});
