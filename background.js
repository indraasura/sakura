chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-overlay") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      chrome.storage.local.get(["mode", "lastMode"], (res) => {
        const current = res?.mode ?? "off";
        const last = res?.lastMode ?? "reading";
        const next = current === "off" ? last : "off";
        chrome.storage.local.set({ mode: next, lastMode: next !== "off" ? next : last });
        chrome.tabs.sendMessage(tabId, { type: "SET_MODE", mode: next });
      });
    });
  }
});
