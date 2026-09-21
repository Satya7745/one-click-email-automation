const STORAGE_KEY = "emailAutomationSettings";

const DEFAULTS = {
  composeMode: "gmail",
  cc: "",
  subject: "Quick introduction",
  body: "Hi {{name}},\n\nI came across your profile and wanted to reach out regarding an opportunity.\n\nBest regards,\nSatya Vijay",
  name: "Satya Vijay"
};

const fields = ["composeMode", "name", "cc", "subject", "body"];
const status = document.getElementById("status");

load();

document.getElementById("save").addEventListener("click", save);
document.getElementById("reset").addEventListener("click", reset);

async function load() {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  const settings = { ...DEFAULTS, ...(stored[STORAGE_KEY] || {}) };

  for (const field of fields) {
    document.getElementById(field).value = settings[field] ?? "";
  }
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
  return Object.fromEntries(
    fields.map((field) => [field, document.getElementById(field).value.trim()])
  );
}

function showStatus(message) {
  status.textContent = message;
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => {
    status.textContent = "";
  }, 2500);
}
