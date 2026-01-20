// FS Evo — CSV ↔ JSON Converter
// Version: v1 (stable)
// Features: CSV→JSON, JSON→CSV, copy, download

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const input = document.getElementById("inputData");
  const output = document.getElementById("outputData");

  const csvToJsonRadio = document.getElementById("csvToJson");
  const jsonToCsvRadio = document.getElementById("jsonToCsv");

  const convertBtn = document.getElementById("convertBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  // Safety check
  if (
    !input ||
    !output ||
    !csvToJsonRadio ||
    !jsonToCsvRadio ||
    !convertBtn ||
    !clearBtn ||
    !copyBtn ||
    !downloadBtn
  ) {
    console.error("FS Evo: Required elements not found");
    return;
  }

  // ---------- CSV → JSON ----------
  function csvToJson(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(",");
      const obj = {};

      headers.forEach((h, i) => {
        obj[h] = (values[i] || "").trim();
      });

      return obj;
    });
  }

  // ---------- JSON → CSV ----------
  function jsonToCsv(jsonText) {
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data) || data.length === 0) {
      return "";
    }

    const headers = Object.keys(data[0]);
    const rows = [];

    // Header row
    rows.push(headers.join(","));

    // Data rows
    data.forEach(item => {
      const values = headers.map(h =>
        item[h] !== undefined ? String(item[h]).replace(/,/g, "") : ""
      );
      rows.push(values.join(","));
    });

    return rows.join("\n");
  }

  // ---------- Convert ----------
  function convertData() {
    const value = input.value.trim();
    if (!value) {
      output.value = "";
      return;
    }

    try {
      if (csvToJsonRadio.checked) {
        const json = csvToJson(value);
        output.value = JSON.stringify(json, null, 2);
      } else {
        const csv = jsonToCsv(value);
        output.value = csv;
      }
    } catch (err) {
      output.value = "Error: Invalid input format.";
    }
  }

  // ---------- Download ----------
  function downloadOutput() {
    if (!output.value) return;

    const isCsvToJson = csvToJsonRadio.checked;
    const filename = isCsvToJson ? "converted.json" : "converted.csv";
    const mimeType = isCsvToJson
      ? "application/json"
      : "text/csv";

    const blob = new Blob([output.value], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---------- Events ----------
  convertBtn.addEventListener("click", convertData);

  clearBtn.addEventListener("click", () => {
    input.value = "";
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

  downloadBtn.addEventListener("click", downloadOutput);
});
