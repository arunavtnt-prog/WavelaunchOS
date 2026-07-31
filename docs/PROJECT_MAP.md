# WavelaunchOS Project Map

## Active Apps

| Name | Directory | Role | Vercel project | Domain |
| --- | --- | --- | --- | --- |
| CRM | `apps/crm` | Admin CRM, portal, submissions, API | `wavelaunch-crm` | `login.wavelaunch.org` |
| Apply | `apps/apply` | Public application form | `wavelaunch-apply` | `apply.wavelaunch.org` |
| Workflow Dashboard | `apps/workflow-dashboard` | Internal workflow dashboard | none | local only |
| Blueprint Engine | `apps/blueprint-engine` | PDF generation service | none | local only |
| Reply Automation | `apps/instantly-reply-automation` | Instantly reply helper | none | local only |

## External Production Projects

| Name | Git repository | Vercel project | Domain |
| --- | --- | --- | --- |
| Review portal | `blueprintOS` | `wavelaunch-review` | `review.wavelaunch.org` |
| Final Blueprint | manual deployment | `final-blueprint` | `final-blueprint.vercel.app` |

`final-blueprint` must not own any `wavelaunch.org` custom domain.

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

## Deployment Ownership Rules

- Only `wavelaunch-crm` and `wavelaunch-apply` may connect to the `WavelaunchOS` GitHub repository.
- Each connected project must use its exact root directory from the tables above.
- A custom `wavelaunch.org` hostname belongs to exactly one Vercel project.
- Moving a domain means moving the project domain, not only assigning a deployment alias.
- DNS stays at the domain provider; project moves inside Vercel do not require DNS changes.
- `d26-application` is a retained legacy deployment with no Git connection and no custom domain.

Run the live checks:

```bash
pnpm check:production
```

Run the authenticated Vercel ownership audit:

```bash
VERCEL_TOKEN=... pnpm audit:deployments
```

The expected IDs and ownership contract are stored in `ops/deployment-ownership.json`.

## Archive

`archive/` contains legacy docs, old root files, generated outputs, experimental scripts, and reference material. It is not part of the active app surface.

## Dependency Boundary

Do not install these apps as one shared pnpm workspace yet. The Prisma apps currently rely on separate generated `@prisma/client` outputs, so each app should keep its own install/build context.
