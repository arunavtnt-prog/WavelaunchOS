# WavelaunchOS Project Map

## Active Apps

| Name | Directory | Role | Vercel project | Domain |
| --- | --- | --- | --- | --- |
| CRM | `apps/crm` | Admin CRM, portal, submissions, API | `wavelaunch-crm` | `login.wavelaunch.org` |
| Apply | `apps/apply` | Public application form | `wavelaunch-apply` | `apply.wavelaunch.org` |
| Workflow Dashboard | `apps/workflow-dashboard` | Internal workflow dashboard | none | local only |
| Blueprint Engine | `apps/blueprint-engine` | PDF generation service | none | local only |
| Reply Automation | `apps/instantly-reply-automation` | Instantly reply helper | none | local only |

## Local Ports

| Port | Service |
| --- | --- |
| `3000` | CRM |
| `3001` | Apply |
| `3007` | Workflow Dashboard |
| `3010` | Blueprint Engine |
| `3011` | Reply Automation GUI |

## Link Rules

- Creator-facing form links must use `https://apply.wavelaunch.org`.
- CRM/admin links must use `https://login.wavelaunch.org`.
- Apply may call CRM APIs through `https://login.wavelaunch.org/api/...`.
- Internal workflow tools should use environment variables for service URLs, with the local defaults above.

## Archive

`archive/` contains legacy docs, old root files, generated outputs, experimental scripts, and reference material. It is not part of the active app surface.

## Dependency Boundary

Do not install these apps as one shared pnpm workspace yet. The Prisma apps currently rely on separate generated `@prisma/client` outputs, so each app should keep its own install/build context.
