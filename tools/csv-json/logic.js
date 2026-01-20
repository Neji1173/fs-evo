document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("input-data");
  const outputEl = document.getElementById("output-data");

  const csvRadio = document.querySelector(
    'input[name="mode"]:checked'
  );

  if (!inputEl || !outputEl) {
    console.error("FS Evo: input or output missing");
    return;
  }

  function csvToJson(csv) {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",");
    return lines.slice(1).map(row => {
      const values = row.split(",");
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = (values[i] || "").trim();
      });
      return obj;
    });
  }

  function update() {
    if (!inputEl.value.trim()) {
      outputEl.value = "";
      return;
    }

    outputEl.value = JSON.stringify(
      csvToJson(inputEl.value),
      null,
      2
    );
  }

  inputEl.addEventListener("input", update);
  update();
});
