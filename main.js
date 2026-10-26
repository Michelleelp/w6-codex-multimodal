const imageInput = document.querySelector("#image-input");
const previewArea = document.querySelector(".preview-area");

function showEmptyMessage() {
  previewArea.replaceChildren();
  const message = document.createElement("p");
  message.textContent = "Select an image to see a preview.";
  previewArea.append(message);
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (!file) {
    showEmptyMessage();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const image = document.createElement("img");
    image.src = reader.result;
    image.alt = file.name;
    image.style.maxWidth = "100%";
    image.style.maxHeight = "360px";
    previewArea.replaceChildren(image);
  });
  reader.readAsDataURL(file);
});

showEmptyMessage();
