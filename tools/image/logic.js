// FS Evo — Image Utility
// Version: v1 (resize + format convert)

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
  let loadedImage = null;

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      drawImage();
    };
    img.src = URL.createObjectURL(file);
  });

  function drawImage() {
    if (!loadedImage) return;

    const targetWidth = parseInt(widthInput.value);
    const scale =
      targetWidth && targetWidth > 0
        ? targetWidth / loadedImage.width
        : 1;

    const w = loadedImage.width * scale;
    const h = loadedImage.height * scale;

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(loadedImage, 0, 0, w, h);
  }

  convertBtn.addEventListener("click", drawImage);

  clearBtn.addEventListener("click", () => {
    imageInput.value = "";
    widthInput.value = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    loadedImage = null;
  });

  downloadBtn.addEventListener("click", () => {
    if (!loadedImage) return;

    const mime = formatSelect.value;
    const ext = mime.split("/")[1];

    const link = document.createElement("a");
    link.href = canvas.toDataURL(mime);
    link.download = `fs-evo-image.${ext}`;
    link.click();
  });
});
