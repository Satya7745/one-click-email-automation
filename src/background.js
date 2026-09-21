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
  subject: "AI/ML Engineer | 3.2 Years | LLMs, RAG & Agentic AI (Open to opportunities)",
  body: "Hi,\n\nI’m Satya Vijay, an AI/ML Engineer with 3.2 years of experience building and productionizing LLM, RAG, and multi-agent AI systems for enterprise environments, including work associated with Microsoft and LTIMindtree.\n\nI specialize in designing and shipping end-to-end Generative AI solutions, covering the complete lifecycle from document ingestion → embeddings → vector indexing → retrieval → streaming RAG → productionized agent orchestration across Azure and Google platforms.\n\nRELEVANT HIGHLIGHTS\n\nProduction LLMs & Agentic AI\n• LangChain, AutoGen, OpenAI AgentKit\n• Azure OpenAI, Google Opal, Microsoft Copilot Studio\n• Multi-agent orchestration and production AI workflows\n\nRAG & Vector Search\n• FAISS, Qdrant, Chroma\n• Embedding and document-processing pipelines\n• Incremental indexing and retrieval optimization\n• Precision@k and retrieval-quality optimization\n\nMLOps & Production Engineering\n• Docker, Kubernetes\n• CI/CD with GitHub Actions and Azure DevOps\n• Databricks\n• Production observability covering latency, token consumption, failure rates, and reliability\n\nPROJECT IMPACT\n\n• Led development of a Response AI multi-agent system and production RAG pipelines\n• Worked on improving production reliability, query latency, and operational cost\n• Recognized with a Super Crew Award for project contributions\n\nI’m currently exploring opportunities in AI/ML, Generative AI, LLM Engineering, RAG, and Agentic AI where I can contribute to building scalable, production-grade AI systems.\n\nIf my background aligns with the roles you are hiring for, I would appreciate the opportunity for a 15-minute conversation to discuss the role, team, and potential fit.\n\nCONTACT\n\nPhone: +91 93915 20600\nEmail: akellasrisatyavijay@gmail.com\nLinkedIn: https://www.linkedin.com/in/satyavijay/\nPortfolio: https://satya7745.github.io/Portfolio/\nResume: https://drive.usercontent.google.com/download?id=1N9SC-cyHicZQe-9xohpLRCT6hL4XK2W1&export=download\n\nThank you for your time. I look forward to connecting.\n\nBest regards,\nSatya Vijay",
  name: "Satya Vijay",
  attachResume: true,
  resumeDriveFileId: "1N9SC-cyHicZQe-9xohpLRCT6hL4XK2W1",
  resumeLabel: "Satya Vijay - Resume.pdf"
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
        fileId: settings.resumeDriveFileId,
        attachmentLabel: settings.resumeLabel || "Resume"
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

async function createDraftWithAttachment({ email, cc, subject, body, fileId, attachmentLabel }) {
  const token = await getGoogleAccessToken();
  const metadata = await getDriveFile(token, fileId);
  const data = await downloadDriveFile(token, fileId);

  const raw = buildMimeMessage({
    to: email,
    cc,
    subject,
    body,
    attachment: {
      name: attachmentLabel || metadata.name,
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
