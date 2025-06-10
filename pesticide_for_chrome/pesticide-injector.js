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
    console.log("Toggle clicked, checking current state...");

    // First, check if the assets are already injected
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const state = {
          hasCSS: !!document.getElementById("pesticideCSS"),
          hasJS: !!document.getElementById("pesticideJS"),
          hasResult: !!document.getElementById("pesticide-for-chrome-result"),
        };
        console.log("Current state:", state);
        return state;
      },
    });

    console.log("Check result:", result.result);

    if (
      result.result.hasCSS ||
      result.result.hasJS ||
      result.result.hasResult
    ) {
      console.log("Removing existing assets...");
      // Remove existing assets
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.log("Removing elements...");
          // Remove style element
          const styleElement = document.getElementById("pesticideCSS");
          if (styleElement) {
            console.log("Removing style element");
            styleElement.remove();
          }

          // Remove script element
          const scriptElement = document.getElementById("pesticideJS");
          if (scriptElement) {
            console.log("Removing script element");
            scriptElement.remove();
          }

          // Remove result div
          const resultElement = document.getElementById(
            "pesticide-for-chrome-result"
          );
          if (resultElement) {
            console.log("Removing result element");
            resultElement.remove();
          }

          // Also remove any dynamically added styles
          const styles = document.querySelectorAll("style");
          styles.forEach((style) => {
            if (style.textContent.includes("pesticide")) {
              console.log("Removing dynamic style element");
              style.remove();
            }
          });
        },
      });
      console.log("Assets removed");
    } else {
      console.log("Injecting new assets...");
      // Inject CSS by creating a style element
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          console.log("Fetching CSS...");
          const response = await fetch(
            chrome.runtime.getURL("pesticide.min.css")
          );
          const cssText = await response.text();
          console.log("Creating style element...");
          const style = document.createElement("style");
          style.id = "pesticideCSS";
          style.textContent = cssText;
          document.head.appendChild(style);
          console.log("CSS injected");
        },
      });

      // Create result div
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.log("Creating result div...");
          const result = document.createElement("div");
          result.id = "pesticide-for-chrome-result";
          document.body.appendChild(result);
          console.log("Result div created");
        },
      });

      // Inject JS
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["pesticide.js"],
      });
      console.log("JS injected");
    }
  } catch (err) {
    console.error("Failed to execute script:", err);
  }
}

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked");
  toggleAssets(tab);
});
