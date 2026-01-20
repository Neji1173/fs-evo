// FS Evo — Coordinate Converter
// Step 21: Base conversion logic (Lat/Lon passthrough)

document.addEventListener("DOMContentLoaded", () => {
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  const output = document.getElementById("outputData");

  const convertBtn = document.getElementById("convertBtn");
  const clearBtn = document.getElementById("clearBtn");

  if (!latInput || !lngInput || !output || !convertBtn || !clearBtn) {
    console.error("FS Evo: Coordinate elements missing");
    return;
  }

  function convertCoordinates() {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);

    if (isNaN(lat) || isNaN(lng)) {
      output.value = "Error: Please enter valid latitude and longitude values.";
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      output.value = "Error: Latitude must be between -90 and 90, Longitude between -180 and 180.";
      return;
    }

    output.value =
      `Latitude : ${lat}\n` +
      `Longitude: ${lng}\n\n` +
      `Status   : Valid geographic coordinates`;
  }

  convertBtn.addEventListener("click", convertCoordinates);

  clearBtn.addEventListener("click", () => {
    latInput.value = "";
    lngInput.value = "";
    output.value = "";
  });
});
