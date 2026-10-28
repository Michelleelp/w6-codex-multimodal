const imageSlots = [
  {
    input: document.querySelector("#image-input-1"),
    preview: document.querySelector("#preview-1"),
    result: document.querySelector("#result-1"),
    label: "Image 1",
  },
  {
    input: document.querySelector("#image-input-2"),
    preview: document.querySelector("#preview-2"),
    result: document.querySelector("#result-2"),
    label: "Image 2",
  },
];
const describeButton = document.querySelector("button");
const statusMessage = document.createElement("p");
statusMessage.className = "status-message";
statusMessage.setAttribute("role", "status");
statusMessage.setAttribute("aria-live", "polite");
describeButton.insertAdjacentElement("afterend", statusMessage);

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

function readImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result.split(",")[1]));
    reader.addEventListener("error", () => reject(new Error("The image file could not be read.")));
    reader.readAsDataURL(file);
  });
}

async function requestDescription(file) {
  const base64Image = await readImageAsBase64(file);
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llava",
      prompt: "Describe this image.",
      stream: false,
      images: [base64Image],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama returned an HTTP ${response.status} error.`);
  }

  const data = await response.json();
  return data.response;
}

describeButton.addEventListener("click", async () => {
  const selectedSlots = imageSlots.filter(({ input }) => input.files[0]);
  if (selectedSlots.length === 0) {
    statusMessage.textContent = "Please select at least one image first.";
    statusMessage.className = "status-message error";
    return;
  }

  if (selectedSlots.length === 1) {
    const unselectedSlot = imageSlots.find(({ input }) => !input.files[0]);
    unselectedSlot.result.textContent = `No image selected for ${unselectedSlot.label}.`;
  }

  describeButton.disabled = true;
  statusMessage.className = "status-message";
  let failedCount = 0;

  try {
    for (const slot of selectedSlots) {
      statusMessage.textContent = `Analyzing ${slot.label}...`;
      slot.result.textContent = "Analyzing image...";

      try {
        slot.result.textContent = await requestDescription(slot.input.files[0]);
      } catch (error) {
        failedCount += 1;
        slot.result.textContent = `Could not describe this image. ${error.message} Check that Ollama is running at http://localhost:11434 and that the llava model is available.`;
      }
    }

    if (failedCount === 0) {
      statusMessage.textContent = "Image description(s) generated successfully.";
      statusMessage.className = "status-message success";
    } else {
      statusMessage.textContent = `${failedCount} image description request(s) failed. See the affected image section for details.`;
      statusMessage.className = "status-message error";
    }
  } finally {
    describeButton.disabled = false;
  }
});
