const imageSlots = [
  {
    input: document.querySelector("#image-input-1"),
    preview: document.querySelector("#preview-1"),
  },
  {
    input: document.querySelector("#image-input-2"),
    preview: document.querySelector("#preview-2"),
  },
];

function showEmptyMessage(preview) {
  preview.replaceChildren();
  const message = document.createElement("p");
  message.textContent = "Select an image to see a preview.";
  preview.append(message);
}

imageSlots.forEach(({ input, preview }) => {
  input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file) {
      showEmptyMessage(preview);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = document.createElement("img");
      image.src = reader.result;
      image.alt = file.name;
      image.style.maxWidth = "100%";
      image.style.maxHeight = "360px";
      preview.replaceChildren(image);
    });
    reader.readAsDataURL(file);
  });

  showEmptyMessage(preview);
});
