// Service worker initialization
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Function to inject or remove Pesticide assets
async function toggleAssets(tab) {
  try {
    // First, check if the assets are already injected
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          hasCSS: !!document.getElementById("pesticideCSS"),
          hasJS: !!document.getElementById("pesticideJS"),
          hasResult: !!document.getElementById("pesticide-for-chrome-result"),
        };
      },
    });

    if (result.result.hasCSS && result.result.hasJS) {
      // Remove existing assets
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const css = document.getElementById("pesticideCSS");
          const js = document.getElementById("pesticideJS");
          const result = document.getElementById("pesticide-for-chrome-result");
          if (css) css.remove();
          if (js) js.remove();
          if (result) result.remove();
        },
      });
    } else {
      // Inject CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["pesticide.min.css"],
      });

      // Create result div
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const result = document.createElement("div");
          result.id = "pesticide-for-chrome-result";
          document.body.appendChild(result);
        },
      });

      // Inject JS
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["pesticide.js"],
      });
    }
  } catch (err) {
    console.error("Failed to execute script:", err);
  }
}

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  toggleAssets(tab);
});
