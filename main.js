const imageInput = document.querySelector("#image-input");
const previewArea = document.querySelector(".preview-area");
const describeButton = document.querySelector("button");
const resultArea = document.querySelector(".result-area");
const statusMessage = document.createElement("p");
statusMessage.className = "status-message";
statusMessage.setAttribute("role", "status");
statusMessage.setAttribute("aria-live", "polite");
describeButton.insertAdjacentElement("afterend", statusMessage);

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

describeButton.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    statusMessage.textContent = "Please select an image first.";
    statusMessage.className = "status-message error";
    return;
  }

  describeButton.disabled = true;
  statusMessage.textContent = "Analyzing image...";
  statusMessage.className = "status-message";

  try {
    const reader = new FileReader();
    const base64Image = await new Promise((resolve, reject) => {
      reader.addEventListener("load", () => {
        resolve(reader.result.split(",")[1]);
      });
      reader.addEventListener("error", () => reject(new Error("The image could not be read.")));
      reader.readAsDataURL(file);
    });

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    resultArea.textContent = data.response;
    statusMessage.textContent = "Image description generated successfully.";
    statusMessage.className = "status-message success";
  } catch (error) {
    statusMessage.textContent = `Could not describe the image. ${error.message} Check that Ollama is running at http://localhost:11434 and that the llava model is available.`;
    statusMessage.className = "status-message error";
  } finally {
    describeButton.disabled = false;
  }
});
