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
│   ├── background.js      # Context-menu workflow
│   ├── options.css        # Settings UI
│   ├── options.html       # Settings page
│   ├── options.js         # Settings persistence
│   └── utils.js            # Email parsing + URL generation
│
├── test/
│   └── utils.test.js      # Unit tests
│
├── .gitignore
├── LICENSE
├── manifest.json          # Chrome MV3 configuration
├── package.json
└── README.md
~~~

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
0.1.0
~~~

---

# License

MIT
