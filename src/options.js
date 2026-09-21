const STORAGE_KEY = "emailAutomationSettingsV2";

const DEFAULTS = {
  composeMode: "gmail",
  cc: "",
  subject: "AI/ML Engineer | 3.2 Years | LLMs, RAG & Agentic AI (Open to opportunities)",
  body: "Hi,\n\nI’m Satya Vijay, an AI/ML Engineer with 3.2 years of experience building and productionizing LLM, RAG, and multi-agent AI systems for enterprise environments, including work associated with Microsoft and LTIMindtree.\n\nI specialize in designing and shipping end-to-end Generative AI solutions, covering the complete lifecycle from document ingestion → embeddings → vector indexing → retrieval → streaming RAG → productionized agent orchestration across Azure and Google platforms.\n\nRELEVANT HIGHLIGHTS\n\nProduction LLMs & Agentic AI\n• LangChain, AutoGen, OpenAI AgentKit\n• Azure OpenAI, Google Opal, Microsoft Copilot Studio\n• Multi-agent orchestration and production AI workflows\n\nRAG & Vector Search\n• FAISS, Qdrant, Chroma\n• Embedding and document-processing pipelines\n• Incremental indexing and retrieval optimization\n• Precision@k and retrieval-quality optimization\n\nMLOps & Production Engineering\n• Docker, Kubernetes\n• CI/CD with GitHub Actions and Azure DevOps\n• Databricks\n• Production observability covering latency, token consumption, failure rates, and reliability\n\nPROJECT IMPACT\n\n• Led development of a Response AI multi-agent system and production RAG pipelines\n• Worked on improving production reliability, query latency, and operational cost\n• Recognized with a Super Crew Award for project contributions\n\nI’m currently exploring opportunities in AI/ML, Generative AI, LLM Engineering, RAG, and Agentic AI where I can contribute to building scalable, production-grade AI systems.\n\nIf my background aligns with the roles you are hiring for, I would appreciate the opportunity for a 15-minute conversation to discuss the role, team, and potential fit.\n\nCONTACT\n\nPhone: +91 93915 20600\nEmail: akellasrisatyavijay@gmail.com\nLinkedIn: https://www.linkedin.com/in/satyavijay/\nPortfolio: https://satya7745.github.io/Portfolio/\nResume: https://drive.usercontent.google.com/download?id=1N9SC-cyHicZQe-9xohpLRCT6hL4XK2W1&export=download\n\nThank you for your time. I look forward to connecting.\n\nBest regards,\nSatya Vijay",
  name: "Satya Vijay",
  attachResume: false,
  resumeDriveFileId: "1N9SC-cyHicZQe-9xohpLRCT6hL4XK2W1",
  resumeLabel: "Satya Vijay - Resume.pdf"
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
document.getElementById("connectGoogle").addEventListener("click", connectGoogle);
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

async function connectGoogle() {
  const button = document.getElementById("connectGoogle");
  button.disabled = true;
  showStatus("Connecting to Google…");

  try {
    const result = await chrome.identity.getAuthToken({ interactive: true });

    if (!result?.token) {
      throw new Error("Google did not return an access token.");
    }

    showStatus("Google connected. You can now enable Attach resume.");
  } catch (error) {
    const message = error?.message || String(error);
    console.error("[One-Click Email Automation] Google connection failed:", error);

    if (message.toLowerCase().includes("oauth")) {
      showStatus("Google OAuth is not configured. Check manifest.json and Google Cloud.");
    } else if (message.toLowerCase().includes("access_denied")) {
      showStatus("Access denied. Add your Google account as a test user in Google Cloud.");
    } else {
      showStatus(`Google connection failed: ${message}`);
    }
  } finally {
    button.disabled = false;
  }
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
