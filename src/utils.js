export const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function getEmailFromContext(info) {
  if (info.linkUrl?.toLowerCase().startsWith("mailto:")) {
    try {
      const address = new URL(info.linkUrl).pathname;
      const match = address.match(EMAIL_RE);
      if (match) return match[0];
    } catch {
      // Fall through to selection parsing.
    }
  }

  const match = (info.selectionText || "").match(EMAIL_RE);
  return match ? match[0] : null;
}

export function buildComposeUrl(email, settings) {
  const name = (settings.name || "").trim();
  const replacements = { "{{name}}": name, "{{email}}": email };

  const replaceTokens = (value) =>
    String(value || "").replace(/{{name}}|{{email}}/g, (token) => replacements[token]);

  const cc = replaceTokens(settings.cc).trim();
  const subject = replaceTokens(settings.subject).trim();
  const body = replaceTokens(settings.body).trim();

  if (settings.composeMode === "mailto") {
    const params = new URLSearchParams();
    if (cc) params.set("cc", cc);
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    const query = params.toString();
    return "mailto:" + encodeURIComponent(email) + (query ? "?" + query : "");
  }

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email
  });
  if (cc) params.set("cc", cc);
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);

  return "https://mail.google.com/mail/u/0/?" + params.toString();
}
