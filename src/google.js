const DRIVE_API = "https://www.googleapis.com/drive/v3/files/";
const GMAIL_DRAFTS_API = "https://gmail.googleapis.com/gmail/v1/users/me/drafts";

export async function getGoogleAccessToken() {
  const result = await chrome.identity.getAuthToken({ interactive: true });
  if (!result?.token) {
    throw new Error("Google authorization did not return an access token.");
  }
  return result.token;
}

export async function getDriveFile(token, fileId) {
  const response = await fetch(
    `${DRIVE_API}${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,capabilities/canDownload&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Drive metadata request failed: ${response.status}`);
  }

  const metadata = await response.json();

  if (metadata.capabilities?.canDownload === false) {
    throw new Error("Google Drive does not allow this file to be downloaded.");
  }

  return metadata;
}

export async function downloadDriveFile(token, fileId) {
  const response = await fetch(
    `${DRIVE_API}${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Drive file download failed: ${response.status}`);
  }

  return response.arrayBuffer();
}

export async function createGmailDraft(token, rawMessage) {
  const response = await fetch(GMAIL_DRAFTS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: { raw: rawMessage } })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gmail draft creation failed: ${response.status} ${details}`);
  }

  return response.json();
}

export function buildMimeMessage({ to, cc, subject, body, attachment }) {
  const boundary = `=_OneClickEmail_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const headers = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : "",
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`
  ].filter(Boolean);

  const safeFileName = attachment.name.replace(/[\r\n"]/g, "_");
  const textPart = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body
  ].join("\r\n");

  const attachmentPart = [
    `--${boundary}`,
    `Content-Type: ${attachment.mimeType || "application/octet-stream"}; name="${safeFileName}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${safeFileName}"`,
    "",
    wrapBase64(toBase64(attachment.data))
  ].join("\r\n");

  const message = [
    headers.join("\r\n"),
    "",
    textPart,
    attachmentPart,
    `--${boundary}--`,
    ""
  ].join("\r\n");

  return base64UrlEncode(message);
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function wrapBase64(value) {
  return value.match(/.{1,76}/g)?.join("\r\n") || "";
}

function base64UrlEncode(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
