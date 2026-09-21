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

const fields = [
  "composeMode",
  "name",
  "cc",
  "subject",
  "body",
  "resumeDriveFileId",
  "resumeLabel"
];

const status = document.getElementById("status");
const attachResume = document.getElementById("attachResume");
const composeMode = document.getElementById("composeMode");

load();

document.getElementById("save").addEventListener("click", save);
document.getElementById("reset").addEventListener("click", reset);
attachResume.addEventListener("change", refreshAttachmentState);
composeMode.addEventListener("change", refreshAttachmentState);

async function load() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const settings = { ...DEFAULTS, ...(stored[STORAGE_KEY] || {}) };

  for (const field of fields) {
    document.getElementById(field).value = settings[field] ?? "";
  }

  attachResume.checked = Boolean(settings.attachResume);
  refreshAttachmentState();
}

async function save() {
  const settings = readForm();
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
  showStatus("Settings saved.");
}

async function reset() {
  await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULTS });
  await load();
  showStatus("Defaults restored.");
}

function readForm() {
  return {
    composeMode: document.getElementById("composeMode").value,
    name: document.getElementById("name").value.trim(),
    cc: document.getElementById("cc").value.trim(),
    subject: document.getElementById("subject").value.trim(),
    body: document.getElementById("body").value.trim(),
    attachResume: attachResume.checked,
    resumeDriveFileId: document.getElementById("resumeDriveFileId").value.trim(),
    resumeLabel: document.getElementById("resumeLabel").value.trim() || "Resume"
  };
}

function refreshAttachmentState() {
  const enabled = attachResume.checked && composeMode.value === "gmail";
  document.getElementById("resumeDriveFileId").disabled = !enabled;
  document.getElementById("resumeLabel").disabled = !enabled;

  if (attachResume.checked && composeMode.value !== "gmail") {
    showStatus("Drive attachments require Gmail compose mode.");
  }
}

function showStatus(message) {
  status.textContent = message;
  clearTimeout(showStatus.timer);

  showStatus.timer = setTimeout(() => {
    status.textContent = "";
  }, 3000);
}
