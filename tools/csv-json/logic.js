// FS Evo — CSV ↔ JSON Converter
// Step 17 complete: buttons + conversion logic

document.addEventListener("DOMContentLoaded", () => {
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
    !copyBtn
  ) {
    console.error("FS Evo: Required elements not found");
    return;
  }

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
        output.value = "JSON → CSV will be added next.";
      }
    } catch (err) {
      output.value = "Error: Invalid input format.";
    }
  }

  convertBtn.addEventListener("click", convertData);
  
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
});

 downloadBtn.addEventListener("click", downloadOutput);
