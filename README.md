# WavelaunchOS

This repository is organized as one Wavelaunch repo with production apps in `apps/` and old/generated material in `archive/`.

## Apps

| App | Path | Purpose | Local URL | Production |
| --- | --- | --- | --- | --- |
| CRM | `apps/crm` | Admin CRM, client portal, submissions dashboard, CRM API | `http://localhost:3000` | `https://login.wavelaunch.org` |
| Apply | `apps/apply` | Public creator application form | `http://localhost:3001` | `https://apply.wavelaunch.org` |
| Workflow Dashboard | `apps/workflow-dashboard` | Internal workflow and reply orchestration | `http://127.0.0.1:3007` | local/internal |
| Blueprint Engine | `apps/blueprint-engine` | Local PDF generation API | `http://localhost:3010` | local/internal |
| Reply Automation | `apps/instantly-reply-automation` | Instantly reply automation and GUI | `http://localhost:3011` | local/internal |

## Common Commands

```bash
pnpm dev:crm
pnpm dev:apply
pnpm dev:workflow
pnpm dev:blueprint
pnpm dev:replies
```

Each app keeps its own dependencies and Prisma client. Install/build from the app folder or use the root shortcuts above.

Do not add a root `pnpm-workspace.yaml` unless the Prisma clients are separated first. The CRM, Apply app, and Workflow Dashboard each generate their own `@prisma/client`.

## Source Of Truth

- GitHub repo: `arunavtnt-prog/WavelaunchOS`
- CRM Vercel project: `wavelaunch-crm`, root directory `apps/crm`, domain `login.wavelaunch.org`
- Apply Vercel project: `wavelaunch-apply`, root directory `apps/apply`, domain `apply.wavelaunch.org`

Do not use `login.wavelaunch.org/apply` as the public form link. Send creators to `https://apply.wavelaunch.org`.
