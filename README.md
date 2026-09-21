# One-Click Email Automation

A lightweight Chrome extension for preparing repetitive email outreach in seconds.

The extension adds a **Send Email** option to the browser context menu when an email address is selected or linked. It loads a saved template, substitutes supported variables, and opens a prepared Gmail or mailto compose window.

> **Design principle:** automate preparation, not sending. The user reviews and explicitly sends the email.

## Features

- Chrome Manifest V3
- Right-click email addresses and choose **Send Email**
- Gmail compose URL support
- mailto fallback
- Configurable sender name, CC, subject, and body
- Template variables: `{{name}}`, `{{email}}`
- Local Chrome storage only
- No backend, database, or external API
- No automatic sending
- Unit tests and GitHub Actions validation

## Project Structure

```text
one-click-email-automation/
├── .github/workflows/validate.yml
├── icons/
├── src/
│   ├── background.js
│   ├── options.css
│   ├── options.html
│   ├── options.js
│   └── utils.js
├── test/
│   └── utils.test.js
├── .gitignore
├── LICENSE
├── manifest.json
├── package.json
└── README.md
```

## Installation

1. Clone the repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository directory.
6. Open the extension's **Options** page and configure your template.

## Usage

1. Find an email address on a webpage.
2. Select the email address, or right-click a `mailto:` link.
3. Choose **Send Email**.
4. The extension prepares the recipient, subject, CC, and body.
5. Review the message in Gmail or your default mail client.
6. Send it manually.

## Template Variables

| Variable | Meaning |
|---|---|
| `{{email}}` | Recipient email address |
| `{{name}}` | Best-effort name derived from the selected text or email |

Example:

```text
Subject:
AI/ML Engineer Opportunity — {{name}}

Body:
Hi {{name}},

I came across an opportunity that looks relevant to my background. I would be interested in discussing the role.

Regards,
Your Name
```

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run syntax validation:

```bash
npm run check
```

The extension itself requires no build step.

## Security & Privacy

The extension is intentionally minimal:

- No email credentials are collected.
- No email is automatically sent.
- Template settings are stored using Chrome's local extension storage.
- No external service is required.
- The extension only needs the permissions required for context menus and local storage.

## Roadmap

- Multiple reusable templates
- `{{company}}` and `{{role}}` variables
- Template selection before composing
- Optional recruiter/company metadata
- Compose preview popup
- Import/export configuration
- Microsoft Outlook compose support
- Better name extraction
- Chrome Web Store packaging

## License

MIT
