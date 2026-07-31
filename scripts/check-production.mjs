const failures = []

async function check(name, request, validate) {
  try {
    const response = await fetch(request.url, {
      method: request.method || 'GET',
      headers: request.headers,
      body: request.body,
      redirect: request.redirect || 'follow',
    })
    const result = await validate(response)
    if (result !== true) failures.push(`${name}: ${result}`)
    else console.log(`PASS ${name}`)
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

await check(
  'CRM health and database',
  { url: 'https://login.wavelaunch.org/api/health' },
  async (response) => {
    const body = await response.json().catch(() => null)
    return response.status === 200
      && body?.service === 'wavelaunch-crm'
      && body?.database === 'connected'
      && body?.auth === 'ready'
      ? true
      : `expected CRM health response, received ${response.status} ${JSON.stringify(body)}`
  },
)

await check(
  'CRM submissions route',
  { url: 'https://login.wavelaunch.org/submissions', redirect: 'manual' },
  async (response) => response.status === 307 && response.headers.get('location') === '/login'
    ? true
    : `expected 307 to /login, received ${response.status} to ${response.headers.get('location')}`,
)

await check(
  'CRM login',
  { url: 'https://login.wavelaunch.org/login' },
  async (response) => response.status === 200 ? true : `expected 200, received ${response.status}`,
)

await check(
  'CRM submissions API protection',
  { url: 'https://login.wavelaunch.org/api/applications' },
  async (response) => response.status === 401
    ? true
    : `expected 401 without an admin session, received ${response.status}`,
)

await check(
  'Apply health',
  { url: 'https://apply.wavelaunch.org/api/health' },
  async (response) => {
    const body = await response.json().catch(() => null)
    return response.status === 200 && body?.service === 'wavelaunch-apply'
      ? true
      : `expected Apply health response, received ${response.status} ${JSON.stringify(body)}`
  },
)

await check(
  'Apply form',
  { url: 'https://apply.wavelaunch.org/apply' },
  async (response) => response.status === 200 ? true : `expected 200, received ${response.status}`,
)

await check(
  'Apply-to-CRM CORS',
  {
    url: 'https://login.wavelaunch.org/api/applications',
    method: 'OPTIONS',
    headers: { Origin: 'https://apply.wavelaunch.org' },
  },
  async (response) => {
    const origin = response.headers.get('access-control-allow-origin')
    return response.status === 204 && origin === 'https://apply.wavelaunch.org'
      ? true
      : `expected 204 with Apply origin, received ${response.status} with ${origin}`
  },
)

await check(
  'Submission validation',
  {
    url: 'https://login.wavelaunch.org/api/applications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://apply.wavelaunch.org',
    },
    body: '{}',
  },
  async (response) => {
    const body = await response.json().catch(() => null)
    return response.status === 400 && body?.success === false
      ? true
      : `expected safe 400 validation response, received ${response.status} ${JSON.stringify(body)}`
  },
)

await check(
  'Review domain isolation',
  { url: 'https://review.wavelaunch.org/', redirect: 'manual' },
  async (response) => response.status === 307 && response.headers.get('location') === '/login'
    ? true
    : `expected 307 to /login, received ${response.status} to ${response.headers.get('location')}`,
)

await check(
  'Blueprint default domain',
  { url: 'https://final-blueprint.vercel.app/', redirect: 'manual' },
  async (response) => response.status === 307 && response.headers.get('location') === '/login'
    ? true
    : `expected 307 to /login, received ${response.status} to ${response.headers.get('location')}`,
)

if (failures.length > 0) {
  console.error('\nProduction checks failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('\nAll production checks passed.')
