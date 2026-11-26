import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'skills-'));
const sources = () => fs.readdirSync(path.join(root, 'skills'), { recursive: true }).filter((f) => f.endsWith('SKILL.md'));

test('every skill is indexed and copied byte for byte', () => {
  const out = tmp();
  const records = build({ root, out });
  assert.equal(records.length, sources().length);
  for (const s of records) {
    const source = fs.readFileSync(path.join(root, s.path));
    assert.ok(Buffer.from(s.raw, 'utf8').equals(source), `${s.path}: Copy Markdown differs from source`);
    assert.ok(fs.readFileSync(path.join(out, 'raw', s.path)).equals(source), `${s.path}: published copy differs`);
    assert.ok(fs.existsSync(path.join(out, 's', s.folder, 'index.html')), `${s.path}: no page`);
  }
});

test('index, links and supporting files resolve under the base path', () => {
  const out = tmp();
  const records = build({ root, out, base: '/HAI-skills-registry' });
  const index = JSON.parse(fs.readFileSync(path.join(out, 'skills.json'), 'utf8'));
  assert.equal(index.count, records.length);
  const exists = (url) => {
    const rel = url.slice('/HAI-skills-registry/'.length).split('#')[0];
    return fs.existsSync(path.join(out, rel.endsWith('/') || !rel ? `${rel}index.html` : rel));
  };
  for (const s of records) {
    for (const f of s.files) assert.ok(exists(f.url), `${s.name}: missing ${f.name}`);
    for (const [, url] of s.html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (url.startsWith('/')) assert.ok(url.startsWith('/HAI-skills-registry/') && exists(url), `${s.name}: broken link ${url}`);
      else assert.match(url, /^(https?:|mailto:)/, `${s.name}: unresolved link ${url}`);
    }
  }
});

test('added, changed and removed skills follow without manual edits', () => {
  const fixture = tmp();
  const write = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(fixture, rel)), { recursive: true });
    fs.writeFileSync(path.join(fixture, rel), text);
  };
  const skill = (name, body) => `---\nname: ${name}\ndescription: Does ${name}. Use when testing.\n---\n\n# ${name}\n\n${body}\n`;
  const run = () => build({ root: fixture, out: tmp() });
  write('skills/a/one/SKILL.md', skill('one', '[helper](scripts/x.sh) [other](../../b/two/SKILL.md) <script>x</script>'));
  write('skills/a/one/scripts/x.sh', 'echo\n');
  write('secret.txt', 'not published');
  assert.deepEqual(run().map((s) => s.name), ['one']);
  write('skills/b/two/SKILL.md', skill('two', '## Phase 1: a\n\n## Phase 2: b\n\n## Phase 3: c'));
  const [one, two] = run();
  assert.equal(two.category, 'b');
  assert.equal(two.steps.length, 3);
  assert.equal(two.when, 'Use when testing.');
  assert.match(one.html, /raw\/skills\/a\/one\/scripts\/x\.sh/);
  assert.match(one.html, /s\/two\//);
  assert.doesNotMatch(one.html, /<script>/);
  fs.rmSync(path.join(fixture, 'skills/a/one'), { recursive: true });
  assert.deepEqual(run().map((s) => s.name), ['two']);
});
