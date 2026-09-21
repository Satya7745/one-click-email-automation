import {
  buildComposeUrl,
  getEmailFromContext
} from "./utils.js";
import {
  buildMimeMessage,
  createGmailDraft,
  downloadDriveFile,
  getDriveFile,
  getGoogleAccessToken
} from "./google.js";

const MENU_ID = "one-click-email-send";
const STORAGE_KEY = "emailAutomationSettings";

const DEFAULTS = {
  composeMode: "gmail",
  cc: "",
  subject: "Quick introduction",
  body: "Hi {{name}},\n\nI came across your profile and wanted to reach out regarding an opportunity.\n\nBest regards,\n{{senderName}}",
  name: "Satya Vijay",
  attachResume: false,
  resumeDriveFileId: "",
  resumeLabel: "Resume"
};

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults();
  createContextMenu();
});

chrome.runtime.onStartup.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;

  try {
    const settings = await getSettings();
    const email = getEmailFromContext(info);

    if (!email) {
      throw new Error("No valid email address found in the selection or link.");
    }

    const { subject, body, cc, recipientName } = prepareMessage(email, info, settings);

    if (settings.attachResume && settings.resumeDriveFileId) {
      if (settings.composeMode !== "gmail") {
        throw new Error("Drive attachment requires Gmail compose mode.");
      }

      const draft = await createDraftWithAttachment({
        email,
        cc,
        subject,
        body,
        fileId: settings.resumeDriveFileId
      });

      await chrome.tabs.create({
        url: `https://mail.google.com/mail/u/0/#drafts/${draft.id}`
      });
      return;
    }

    const url = buildComposeUrl(email, {
      ...settings,
      subject,
      body,
      cc
    });

    await chrome.tabs.create({ url });
  } catch (error) {
    console.error("[One-Click Email Automation]", error);
    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Email preparation failed",
      message: error.message || "Unable to prepare the email."
    });
  }
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

function prepareMessage(email, info, settings) {
  const recipientName = extractRecipientName(info.selectionText, email);
  const replace = (value) =>
    String(value || "")
      .replaceAll("{{name}}", recipientName)
      .replaceAll("{{email}}", email)
      .replaceAll("{{senderName}}", settings.name || "");

  return {
    recipientName,
    subject: replace(settings.subject),
    body: replace(settings.body),
    cc: replace(settings.cc)
  };
}

function extractRecipientName(selectionText = "", email = "") {
  const value = selectionText.replace(email, "").trim();
  if (value && !value.includes("@")) {
    return value.replace(/[<>()[\]]/g, "").trim();
  }

  const localPart = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return localPart ? localPart.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "there";
}

async function createDraftWithAttachment({ email, cc, subject, body, fileId }) {
  const token = await getGoogleAccessToken();
  const metadata = await getDriveFile(token, fileId);
  const data = await downloadDriveFile(token, fileId);

  const raw = buildMimeMessage({
    to: email,
    cc,
    subject,
    body,
    attachment: {
      name: metadata.name,
      mimeType: metadata.mimeType,
      data
    }
  });

  return createGmailDraft(token, raw);
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
