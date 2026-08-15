# Security Policy

## Reporting a vulnerability

Please report vulnerabilities **privately** via GitHub's private vulnerability
reporting:

1. Open the repository's **Security** tab →
   **Report a vulnerability**.
2. Do **not** open a public issue for a security problem.

## Before you report

- **Redact secrets first**: never include real tokens, API keys, cookies,
  Authorization headers, or private file contents in the report.
- Include the affected plugin version (`package.json` → `version`), the
  DeepSeek Harness version, and minimal reproduction steps.

## What to expect

- **Acknowledgment**: within 7 days of a valid report.
- **Fix**: we aim to release a patch for confirmed vulnerabilities within
  30 days; critical issues are handled as fast as possible.
- **Disclosure**: coordinated — we publish the advisory together with the
  fix, and credit the reporter in the release notes and advisory unless you
  ask to stay anonymous.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.4.x (latest) | ✅ |
| < 0.4.0 | ❌ upgrade to the latest patch release |

## Scope

- The plugin's own code: host half, client bundle, build scripts.
- Browser-local data handling (`localStorage` under `dsh.composer-history.v1`).
- Out of scope: bugs in the DeepSeek Harness runtime or in unrelated plugins —
  report those to their own repositories.
