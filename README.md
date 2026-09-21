# One-Click Email Automation

> Prepare repetitive outreach emails in seconds — without manually retyping the same information.

A lightweight **Chrome extension** that turns an email address on any webpage into a ready-to-review email.

**Select an email → right-click → Send Email → review → send.**

No backend. No API keys. No terminal commands are required for normal use.

---

## What this extension does

When you right-click an email address, the extension:

1. Finds the email address.
2. Loads your saved email template.
3. Replaces placeholders such as <code>{{name}}</code> and <code>{{email}}</code>.
4. Opens a pre-filled Gmail compose window (or your default mail client).
5. Lets **you review and send the email manually**.

### What it does NOT do

- It does **not** automatically send emails.
- It does **not** ask for your Gmail password.
- It does **not** require a backend or database.
- It does **not** upload your templates to a server.

---

# Install in under 1 minute

There are two ways to install the extension. **For most users, Method A is the easiest.**

## Method A — Download ZIP (recommended)

No Git and no command line required.

### 1. Download the project

Open the repository:

https://github.com/Satya7745/one-click-email-automation

Then click:

~~~text
Code
  ↓
Download ZIP
~~~

### 2. Extract the ZIP

Extract the downloaded file somewhere permanent, for example:

~~~text
Documents/
└── one-click-email-automation/
~~~

**Important:** Keep the extracted folder. Chrome loads the extension directly from this folder.

### 3. Open Chrome Extensions

In Chrome, open:

~~~text
chrome://extensions
~~~

Turn on:

~~~text
Developer mode
~~~

### 4. Load the extension

Click:

~~~text
Load unpacked
~~~

Select the **extracted one-click-email-automation folder**.

You should now see:

**One-Click Email Automation**

installed in Chrome.

### 5. Configure your template

On the extension card:

~~~text
Details
  ↓
Extension options
~~~

Configure:

- Your name
- CC address (optional)
- Compose mode
- Subject
- Message body

Click **Save settings**.

### 6. Use it

Find an email address on a webpage.

Example:

~~~text
recruiter@example.com
~~~

Select the email address, then:

~~~text
Right-click
   ↓
Send Email
~~~

A prepared email opens.

**Review it → make any changes → Send.**

---

# Method B — Clone with Git

For developers:

~~~bash
git clone https://github.com/Satya7745/one-click-email-automation.git
cd one-click-email-automation
~~~

Then open:

~~~text
chrome://extensions
~~~

Enable **Developer mode** → **Load unpacked** → select the cloned folder.

---

# First-time setup

You only need to configure the template once.

### Example configuration

**Your name**

~~~text
Satya Vijay
~~~

**CC**

~~~text
optional@example.com
~~~

**Subject**

~~~text
AI/ML Engineer Opportunity — {{name}}
~~~

**Body**

~~~text
Hi {{name}},

I wanted to reach out regarding an AI/ML opportunity that may be relevant
to my background.

Please let me know if we can connect and discuss the role.

Best regards,
Satya Vijay
~~~

After saving, the same template can be reused for every email.

---

# Supported placeholders

| Placeholder | Replaced with |
|---|---|
| <code>{{email}}</code> | The detected recipient email address |
| <code>{{name}}</code> | The selected name, when available |

### Example

Template:

~~~text
Hi {{name}},

I am reaching out regarding an opportunity.

Regards,
Satya Vijay
~~~

For:

~~~text
Jane Doe <jane.doe@example.com>
~~~

the prepared message becomes:

~~~text
Hi Jane Doe,

I am reaching out regarding an opportunity.

Regards,
Satya Vijay
~~~

---

# Supported compose modes

## Gmail

Opens a Gmail web compose URL with the recipient, CC, subject, and body pre-filled.

Recommended when you use Gmail in the browser.

## Default mail client

Uses a standard <code>mailto:</code> link and lets the operating system/browser open the configured email application.

---

# Optional: automatically attach your Google Drive resume

The extension can also attach a file from Google Drive to the Gmail **draft** it creates.

**Current default:** Attach resume is OFF. Your resume file ID is pre-configured, so you only need to enable the attachment rule after completing Google OAuth setup.

This is still **rule-based**. There is no AI deciding whether to attach the file.

The rule is:

```text
Attach resume = ON
        +
Google Drive file ID configured
        +
Gmail compose mode
        ↓
Fetch configured Drive file
        ↓
Create Gmail draft with attachment
        ↓
Open the draft for review
        ↓
User sends manually
```

When **Attach resume** is OFF, the extension continues to use the normal Gmail compose URL and no Google API access is needed for that workflow.

## One-time Google setup

Drive/Gmail attachment support requires Google OAuth because the extension must be authorized to read the configured Drive file and create a Gmail draft. Chrome extensions can obtain OAuth tokens through the Identity API, while the Drive API supports downloading file content and the Gmail API supports creating drafts from RFC 2822/MIME messages. citeturn387847search1turn387847search2turn387847search4

### 1. Create a Google Cloud project

Open the Google Cloud Console and create/select a project.

Enable:

- Google Drive API
- Gmail API

### 2. Create a Chrome Extension OAuth client

In **Google Cloud Console → Google Auth Platform → Clients**, create an OAuth client with application type **Chrome Extension**.

Google's current documentation says a Chrome Extension OAuth client is associated with the extension's 32-character Chrome extension ID. citeturn538275search1turn538275search6

### 3. Get your extension ID

After loading the unpacked extension:

```text
chrome://extensions
       ↓
One-Click Email Automation
       ↓
Extension ID
```

Use this value as the **Item ID** when creating the Chrome Extension OAuth client.

### 4. Put the OAuth client ID in `manifest.json`

Replace:

```json
"client_id": "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com"
```

with the client ID generated by Google.

The manifest already declares the required OAuth scopes:

```text
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/gmail.compose
```

Google documents `drive.readonly` as allowing Drive file viewing/downloading, while `gmail.compose` is used for draft/compose operations. citeturn387847search5turn387847search4

### 5. Reload the extension

Open:

```text
chrome://extensions
```

and click **Reload**.

### 6. Configure the attachment rule

Open:

```text
Details
  ↓
Extension options
  ↓
Resume attachment
```

Enable:

```text
☑ Attach resume
```

Then paste the Google Drive **file ID**.

For a URL such as:

```text
https://drive.google.com/file/d/FILE_ID/view
```

the value to paste is:

```text
FILE_ID
```

The Drive API requires authorization to download file content. citeturn387847search2

### 7. First use

The first time the attachment rule is used, Google may ask you to authorize the extension.

After authorization:

```text
Right-click recruiter email
        ↓
Send Email
        ↓
Drive resume fetched
        ↓
Gmail draft created
        ↓
Resume attached
        ↓
Review
        ↓
Send
```

### Important limitation

This feature is intended for regular binary files such as PDF resumes. Google Workspace-native files (for example Google Docs) require an **export** operation rather than a normal `alt=media` download. citeturn387847search2turn387847search8

For a resume, using a PDF stored in Drive is the simplest option.

---

# Everyday workflow

Once installed, the workflow is intentionally simple:

~~~text
┌──────────────────────────┐
│ Find email address       │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Right-click              │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Send Email               │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Template is populated    │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Review the email         │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Send manually            │
└──────────────────────────┘
~~~

The goal is to remove repetitive typing while keeping the final action under the user's control.

---

# Project structure

~~~text
one-click-email-automation/
│
├── .github/
│   └── workflows/
│       └── validate.yml
│
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│
├── src/
│   ├── background.js      # Context-menu workflow + rules
│   ├── google.js          # Drive download + Gmail draft attachment
│   ├── options.css        # Settings UI styling
│   ├── options.html       # Settings page
│   ├── options.js         # Settings persistence + Google connection
│   └── utils.js           # Email parsing + compose URL generation
│
├── test/
│   └── utils.test.js      # Unit tests
│
├── .gitignore
├── LICENSE
├── manifest.json          # Chrome MV3 + OAuth configuration
├── package.json
└── README.md
~~~

---

# Current default configuration

The prototype is pre-configured for your recruiter outreach workflow:

~~~text
Name:
Satya Vijay

Compose mode:
Gmail

Subject:
AI/ML Engineer | 3.2 Years | LLMs, RAG & Agentic AI (Open to opportunities)

Resume file ID:
1N9SC-cyHicZQe-9xohpLRCT6hL4XK2W1

Resume label:
Satya Vijay - Resume.pdf

Attach resume:
OFF by default
~~~

The attachment is intentionally **OFF by default** because Google OAuth is required before the extension can access Drive and create a Gmail draft with an attachment.

---

# Permissions

The extension requests only these Chrome permissions:

| Permission | Why it is needed |
|---|---|
| <code>contextMenus</code> | Adds the **Send Email** right-click action |
| <code>storage</code> | Saves your email template/settings in Chrome storage |

The extension does not require broad webpage access for its core workflow.

---

# Privacy & security

This prototype is intentionally lightweight.

- Your email template is stored using Chrome extension storage.
- No email credentials are collected.
- No external server is required.
- No API key is required.
- No automatic sending occurs.
- The recipient, subject, CC, and body are passed to the compose URL opened by your browser.

**Always review the recipient and message before sending.**

---

# Troubleshooting

### I do not see "Send Email"

Make sure you:

1. Reload the extension from <code>chrome://extensions</code>.
2. Select an actual email address, or right-click a <code>mailto:</code> link.
3. Right-click the selection again.

### I installed the extension but nothing happens

Open:

~~~text
chrome://extensions
  → One-Click Email Automation
  → Errors
~~~

If Chrome reports an error, reload the extension and try again.

### Gmail opens but the message is not populated correctly

Check the template under:

~~~text
Details
  → Extension options
~~~

Then save the settings and retry.

### I changed the code

After making code changes:

~~~text
chrome://extensions
  → Reload
~~~

You normally do not need to reinstall the extension.

---

# Development

Normal users **do not need Node.js or npm**.

For contributors/developers:

~~~bash
npm test
npm run check
npm run validate
~~~

The extension itself has **no build step**.

GitHub Actions also runs the validation workflow on pushes and pull requests.

---

# Roadmap

Planned improvements:

- Multiple reusable templates
- <code>{{company}}</code> and <code>{{role}}</code> variables
- Template picker before composing
- Recruiter/company metadata
- Preview popup before opening Gmail
- Import/export settings
- Outlook compose support
- Better name extraction
- Chrome Web Store distribution

---

# Why there is no "Install" button yet

This repository is currently distributed as an **unpacked developer extension**.

Chrome does not provide a normal one-click browser installation flow for an arbitrary GitHub repository. The practical options are:

~~~text
GitHub
  ↓
Download ZIP
  ↓
Load unpacked
~~~

For a production release, the natural next step is:

~~~text
Chrome Web Store
  ↓
Install extension
~~~

---

# Version

~~~text
0.2.1
~~~

---

# License

MIT
