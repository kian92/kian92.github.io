import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
const manifest = JSON.parse(await read('package.json'));
const lock = JSON.parse(await read('package-lock.json'));
for (const field of ['dependencies', 'devDependencies', 'optionalDependencies']) {
  assert.equal(Object.keys(manifest[field] ?? {}).length, 0, `Unexpected ${field}`);
}
assert.deepEqual(Object.keys(lock.packages), [''], 'Lockfile contains third-party packages');
const pages = ['index.html', ...(await readdir(path.join(root, 'projects')))
  .filter(name => name.endsWith('.html')).map(name => `projects/${name}`)];
const domain = `https://${(await read('CNAME')).trim()}`;
const canonicalUrls = new Set();
const sources = new Map(await Promise.all(pages.map(async name => [name, await read(name)])));
const decode = value => value.replaceAll('&amp;', '&');

async function checkReference(reference, page) {
  if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) return;
  const url = new URL(decode(reference), `https://local.test/${page}`);
  const target = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
  assert(!target.startsWith('vendor/') && !target.startsWith('node_modules/'),
    `${page} references removed libraries: ${reference}`);
  await access(path.join(root, target));
  if (url.hash && sources.has(target)) {
    const id = decodeURIComponent(url.hash.slice(1));
    const ids = [...sources.get(target).matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
    assert(ids.includes(id), `${page}: missing anchor ${reference}`);
  }
}

for (const [page, html] of sources) {
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${page} needs exactly one h1`);
  const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${page} has duplicate IDs`);
  const expectedUrl = `${domain}/${page === 'index.html' ? '' : page}`;
  let canonical;
  for (const match of html.matchAll(/<(?:a|img|script|link|meta)\b[^>]*>/g)) {
    const tag = match[0];
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)]
      .map(m => [m[1], m[3]]));
    for (const key of ['href', 'src']) if (attrs[key]) await checkReference(attrs[key], page);
    if (attrs.srcset) {
      for (const variant of attrs.srcset.split(',')) await checkReference(variant.trim().split(/\s+/)[0], page);
    }
    if (tag.startsWith('<img')) assert('alt' in attrs, `${page}: image missing alt text`);
    if (attrs.rel === 'canonical') canonical = attrs.href;
    if (['og:image', 'twitter:image'].includes(attrs.property ?? attrs.name)) {
      assert(attrs.content.startsWith(`${domain}/`));
      await access(path.join(root, new URL(attrs.content).pathname));
    }
  }
  assert.equal(canonical, expectedUrl, `${page}: wrong canonical URL`);
  canonicalUrls.add(canonical);
  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(json[1]);
  }
}
const sitemap = new Set([...((await read('sitemap.xml')).matchAll(/<loc>(.*?)<\/loc>/g))].map(m => m[1]));
assert.deepEqual(sitemap, canonicalUrls, 'Sitemap must match the public pages');
assert((await read('robots.txt')).includes(`Sitemap: ${domain}/sitemap.xml`));
const llms = await read('llms.txt');
assert(llms.startsWith('# '), 'llms.txt needs a site title');
for (const [, reference] of llms.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
  const url = new URL(reference);
  if (url.origin === domain) await checkReference(`${url.pathname}${url.hash}`, 'index.html');
}
console.log(`Checked ${pages.length} pages: links, assets, responsive images, metadata, sitemap, and llms.txt links. No third-party npm dependencies.`);
