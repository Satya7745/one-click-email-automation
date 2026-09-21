import test from "node:test";
import assert from "node:assert/strict";
import { buildComposeUrl, getEmailFromContext } from "../src/utils.js";

const settings = {
  composeMode: "gmail",
  cc: "cc@example.com",
  subject: "Hello {{name}}",
  body: "Hi {{name}},\nYour email is {{email}}.",
  name: "Satya"
};

test("extracts email from selected text", () => {
  assert.equal(
    getEmailFromContext({ selectionText: "Contact recruiter@example.com for details" }),
    "recruiter@example.com"
  );
});

test("extracts email from mailto link", () => {
  assert.equal(
    getEmailFromContext({ linkUrl: "mailto:hiring@example.com?subject=Hello" }),
    "hiring@example.com"
  );
});

test("returns null when no email is present", () => {
  assert.equal(getEmailFromContext({ selectionText: "hello world" }), null);
});

test("builds Gmail compose URL with substituted fields", () => {
  const url = new URL(buildComposeUrl("recruiter@example.com", settings));
  assert.equal(url.origin, "https://mail.google.com");
  assert.equal(url.searchParams.get("to"), "recruiter@example.com");
  assert.equal(url.searchParams.get("cc"), "cc@example.com");
  assert.equal(url.searchParams.get("su"), "Hello Satya");
  assert.equal(url.searchParams.get("body"), "Hi Satya,\nYour email is recruiter@example.com.");
});

test("builds mailto URL", () => {
  const url = buildComposeUrl("recruiter@example.com", {
    ...settings,
    composeMode: "mailto"
  });
  assert.match(url, /^mailto:/);
  assert.equal(decodeURIComponent(url.split("?")[0]), "mailto:recruiter@example.com");
});
