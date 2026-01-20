// FS Evo — Image Utility
// Version: v1.1 (resize + format convert)
//
// Notes:
// - Preserves aspect ratio
// - Uses canvas only (no external libs)
// - Designed for quick, safe client-side use

document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const widthInput = document.getElementById("widthInput");
  const formatSelect = document.getElementById("formatSelect");
  const canvas = document.getElementById("canvas");

  const convertBtn = document.getElementById("convertBtn");
  const clearBtn = document.getElementById("clearBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  if (
    !imageInput ||
    !widthInput ||
    !formatSelect ||
    !canvas ||
    !convertBtn ||
    !clearBtn ||
    !downloadBtn
  ) {
    console.error("FS Evo: Image utility elements missing");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("FS Evo: Canvas context not available");
    return;
  }

  let loadedImage = null;
  let objectUrl = null;

  // ---------- Load Image ----------
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }

    const img = new Image();
    objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      loadedImage = img;
      drawImage();
    };

    img.onerror = () => {
      loadedImage = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    img.src = objectUrl;
  });

  // ---------- Draw / Resize ----------
  function drawImage() {
    if (!loadedImage) {
      return;
    }

    const targetWidth = parseInt(widthInput.value, 10);

    if (targetWidth !== undefined && targetWidth !== null && targetWidth <= 0) {
      return;
    }

    const scale =
      targetWidth && targetWidth > 0
        ? targetWidth / loadedImage.width
        : 1;

    const w = Math.round(loadedImage.width * scale);
    const h = Math.round(loadedImage.height * scale);

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(loadedImage, 0, 0, w, h);
  }

  // ---------- Events ----------
  convertBtn.addEventListener("click", () => {
    if (!loadedImage) {
      return;
    }
    drawImage();
  });

  clearBtn.addEventListener("click", () => {
    imageInput.value = "";
    widthInput.value = "";

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }

    loadedImage = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
  });

  downloadBtn.addEventListener("click", () => {
    if (!loadedImage || canvas.width === 0 || canvas.height === 0) {
      return;
    }

    // Ensure latest resize is applied
    drawImage();

    const mime = formatSelect.value;
    const ext = mime.split("/")[1];

    const link = document.createElement("a");
    link.href = canvas.toDataURL(mime);
    link.download = `fs-evo-image.${ext}`;
    link.click();
  });
});
