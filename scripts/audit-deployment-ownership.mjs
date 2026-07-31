import { readFile } from 'node:fs/promises'

const configUrl = new URL('../ops/deployment-ownership.json', import.meta.url)
const config = JSON.parse(await readFile(configUrl, 'utf8'))
const token = process.env.VERCEL_TOKEN
const teamId = process.env.VERCEL_TEAM_ID || config.teamId

if (!token) {
  console.error('VERCEL_TOKEN is required.')
  process.exit(2)
}

const headers = { Authorization: `Bearer ${token}` }
const errors = []

async function vercel(path) {
  const separator = path.includes('?') ? '&' : '?'
  const response = await fetch(
    `https://api.vercel.com${path}${separator}teamId=${encodeURIComponent(teamId)}`,
    { headers },
  )

  if (!response.ok) {
    throw new Error(`Vercel API ${response.status} for ${path}: ${await response.text()}`)
  }

  return response.json()
}

function compare(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
}

const projectResponse = await vercel('/v9/projects?limit=100')
const projects = projectResponse.projects || []
const projectsById = new Map(projects.map((project) => [project.id, project]))
const expectedByDomain = new Map()
const expectedProjectIds = new Set(config.projects.map((project) => project.id))

for (const expected of config.projects) {
  for (const domain of expected.customDomains) {
    if (expectedByDomain.has(domain)) {
      errors.push(`Ownership file assigns ${domain} more than once.`)
    }
    expectedByDomain.set(domain, expected.id)
  }

  const actual = projectsById.get(expected.id)
  if (!actual) {
    errors.push(`Missing Vercel project ${expected.name} (${expected.id}).`)
    continue
  }

  compare(`${expected.key}.name`, actual.name, expected.name)
  compare(`${expected.key}.rootDirectory`, actual.rootDirectory ?? null, expected.rootDirectory)
  compare(`${expected.key}.gitRepository`, actual.link?.repo ?? null, expected.gitRepository)

  const domainResponse = await vercel(`/v9/projects/${expected.id}/domains?limit=100`)
  const actualCustomDomains = (domainResponse.domains || [])
    .map((domain) => domain.name)
    .filter((domain) => !domain.endsWith('.vercel.app'))
    .sort()
  const expectedCustomDomains = [...expected.customDomains].sort()

  compare(`${expected.key}.customDomains`, actualCustomDomains, expectedCustomDomains)
}

for (const project of projects) {
  if (project.link?.repo === config.repository && !expectedProjectIds.has(project.id)) {
    errors.push(
      `Unexpected Git link: ${project.name} (${project.id}) is connected to ${config.repository}.`,
    )
  }

  const domainResponse = await vercel(`/v9/projects/${project.id}/domains?limit=100`)
  for (const domain of domainResponse.domains || []) {
    if (!domain.name.endsWith('.wavelaunch.org')) continue

    const expectedOwner = expectedByDomain.get(domain.name)
    if (!expectedOwner) {
      errors.push(`Unregistered Wavelaunch domain ${domain.name} is owned by ${project.name}.`)
    } else if (expectedOwner !== project.id) {
      errors.push(
        `${domain.name} is owned by ${project.name} (${project.id}), expected ${expectedOwner}.`,
      )
    }
  }
}

if (errors.length > 0) {
  console.error('Deployment ownership audit failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Deployment ownership audit passed.')
for (const project of config.projects) {
  const domains = project.customDomains.length
    ? project.customDomains.join(', ')
    : 'no custom domain'
  console.log(`- ${project.name}: ${domains}`)
}
