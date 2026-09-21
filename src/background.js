import { buildComposeUrl, getEmailFromContext } from "./utils.js";

const MENU_ID = "one-click-email-send";
const STORAGE_KEY = "emailAutomationSettings";

const DEFAULTS = {
  composeMode: "gmail",
  cc: "",
  subject: "Quick introduction",
  body: "Hi {{name}},\n\nI came across your profile and wanted to reach out regarding an opportunity.\n\nBest regards,\nSatya Vijay",
  name: "Satya Vijay"
};

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults();
  createContextMenu();
});

chrome.runtime.onStartup.addListener(createContextMenu);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes[STORAGE_KEY]) {
    createContextMenu();
  }
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;

  const settings = await getSettings();
  const email = getEmailFromContext(info);

  if (!email) {
    console.warn("[One-Click Email Automation] No valid email address found.");
    return;
  }

  const url = buildComposeUrl(email, settings);
  await chrome.tabs.create({ url });
});

async function ensureDefaults() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  if (!stored[STORAGE_KEY]) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULTS });
  }
}

async function getSettings() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  return { ...DEFAULTS, ...(stored[STORAGE_KEY] || {}) };
}

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Send Email",
      contexts: ["selection", "link"]
    });
  });
}
