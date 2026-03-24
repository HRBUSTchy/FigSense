const { writeFileSync } = require('fs');

const TOKEN = process.env.FIGMA_TOKEN || 'YOUR_FIGMA_TOKEN_HERE';
const FILE_KEY = `vy8zW7EcjY5KEk6TijNpOH`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function exampleRetryAfter429(
  url,
  opts = { headers: {}, method: '' },
  { maxRetries = 0 } = {}
) {
  let attempts = 0;

  while (true) {
    const res = await fetch(url, {
      ...opts,
      headers: { ...(opts.headers || {}), 'X-Figma-Token': `${TOKEN}` },
    });

    if (res.status !== 429) return res;

    if (attempts++ >= maxRetries) {
      throw new Error(`429 Too Many Requests after ${attempts} attempts`);
    }

    const retryAfterSec = Number(res.headers.get('retry-after')) || 1; // integer seconds
    await sleep(retryAfterSec * 1000);
  }
}

(async () => {
  const url = `https://api.figma.com/v1/files/${encodeURIComponent(FILE_KEY)}?ids=14-3727`;
  const res = await exampleRetryAfter429(
    url,
    { method: 'GET' },
    { maxRetries: 6 }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  writeFileSync('./test.json', JSON.stringify(data, null, 2));
})().catch((err) => {
  console.error('-=-=-=-==', err.message || String(err));
});
