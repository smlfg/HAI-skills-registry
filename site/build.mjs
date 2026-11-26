// Builds the static skill library from skills/<category>/<name>/SKILL.md (the only source of truth).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { parse as parseYaml } from 'yaml';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.env.REPO || 'smlfg/HAI-skills-registry';
const BRANCH = process.env.BRANCH || 'main';
export const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Only git-tracked files are published; outside a git checkout (test fixtures) every non-hidden file counts.
function listFiles(root) {
  try {
    const out = execFileSync('git', ['ls-files', '-z', 'skills'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    const files = out.toString().split('\0').filter(Boolean);
    if (files.length) return files.filter((f) => fs.existsSync(path.join(root, f)) && !fs.lstatSync(path.join(root, f)).isSymbolicLink());
  } catch {}
  return fs.readdirSync(path.join(root, 'skills'), { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => path.relative(root, path.join(e.parentPath, e.name)).split(path.sep).join('/'))
    .filter((f) => !f.split('/').some((p) => p.startsWith('.') || p === '__pycache__'));
}

function lastCommit(root, dir) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', dir], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch { return ''; }
}

// Body of the first "## <heading>" section, ignoring headings inside code fences.
function section(body, names) {
  let fenced = false;
  let found = null;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const heading = !fenced && line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      if (found) break;
      if (names.includes(heading[1].toLowerCase())) found = [];
    } else if (found) found.push(line);
  }
  return found ? found.join('\n').trim() : '';
}

// A step strip is only shown when the skill itself numbers its phases or steps.
function workflow(body) {
  const prose = body.replace(/^(```|~~~)[\s\S]*?^\1/gm, '');
  const steps = [...prose.matchAll(/^##\s+(?:Phase|Step)\s+(\w+)\s*[:.)–-]\s*(.+?)\s*$/gm)].map((m) => ({ n: m[1], title: m[2] }));
  return steps.length >= 3 ? steps : [];
}

// The description is split into "what it solves" and "when to use" using the author's own sentences.
function splitDescription(text) {
  const sentences = text.match(/.+?(?:[.!?](?=\s+[A-Z])|$)/g)?.map((s) => s.trim()) ?? [text];
  const isWhen = (s) => /^(Use|Run|Load)\b.*\b(when|before|after|for|if|whenever)\b/i.test(s);
  return {
    what: sentences.filter((s) => !isWhen(s)).join(' ') || text,
    when: sentences.filter(isWhen).join(' '),
  };
}

export function discover(root) {
  const files = listFiles(root);
  const skills = files.filter((f) => /^skills\/[^/]+\/[^/]+\/SKILL\.md$/.test(f)).map((file) => {
    const [, category, folder] = file.split('/');
    const dir = path.posix.dirname(file);
    const raw = fs.readFileSync(path.join(root, file), 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) throw new Error(`${file}: missing YAML frontmatter`);
    let meta;
    try { meta = parseYaml(match[1]); } catch {
      // Unquoted colons are common in descriptions; read the two fields line by line instead.
      meta = Object.fromEntries([...match[1].matchAll(/^([\w-]+):\s*(.*)$/gm)].map((m) => [m[1], m[2]]));
    }
    if (!meta?.name || !meta?.description) throw new Error(`${file}: frontmatter needs name and description`);
    const body = raw.slice(match[0].length);
    return {
      name: String(meta.name), folder, category, dir, path: file, raw, body,
      description: String(meta.description),
      ...splitDescription(String(meta.description)),
      outcome: section(body, ['success', 'success criteria', 'expected outcome', 'outcome', 'output']),
      example: section(body, ['example']),
      useCase: section(body, ['use case']),
      steps: workflow(body),
      files: files.filter((f) => f.startsWith(`${dir}/`) && f !== file).map((f) => f.slice(dir.length + 1)),
      updated: lastCommit(root, dir),
    };
  });
  const seen = new Set();
  for (const s of skills) {
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(s.folder)) throw new Error(`${s.path}: folder name is not URL safe`);
    if (seen.has(s.folder)) throw new Error(`${s.path}: duplicate skill folder name "${s.folder}"`);
    seen.add(s.folder);
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

// Relative links point to the published copy (supporting files), the skill page, or GitHub.
function renderer(skill, skills, base) {
  const md = new MarkdownIt({ html: false, linkify: true });
  const resolve = (href) => {
    if (/^([a-z]+:|\/\/|#)/i.test(href)) return href.startsWith('#') ? `${base}s/${skill.folder}/${href}` : href;
    const [target, hash = ''] = href.split('#');
    const full = path.posix.normalize(path.posix.join(skill.dir, target));
    const other = skills.find((s) => full === s.path || full === s.dir);
    if (other) return `${base}s/${other.folder}/${hash && `#${hash}`}`;
    if (skill.files.includes(full.slice(skill.dir.length + 1)) && full.startsWith(`${skill.dir}/`)) return `${base}raw/${full}`;
    return `https://github.com/${REPO}/blob/${BRANCH}/${full}${hash && `#${hash}`}`;
  };
  md.core.ruler.push('relative-links', (state) => {
    for (const token of state.tokens.flatMap((t) => t.children ?? [])) {
      const attr = token.type === 'link_open' ? 'href' : token.type === 'image' ? 'src' : null;
      if (attr) token.attrSet(attr, resolve(token.attrGet(attr)));
    }
  });
  return md;
}

export function build({ root = path.join(here, '..'), out = path.join(here, 'dist'), base = process.env.BASE_PATH || '/HAI-skills-registry' } = {}) {
  base = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
  const skills = discover(root);
  const records = skills.map((s) => {
    const md = renderer(s, skills, base);
    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${s.path}`;
    const { dir, body, ...rest } = s;
    return {
      ...rest,
      url: `${base}s/${s.folder}/`,
      rawUrl,
      githubUrl: `https://github.com/${REPO}/blob/${BRANCH}/${s.path}`,
      install: `npx skills@latest add ${REPO} --skill ${s.name}`,
      files: s.files.map((f) => ({ name: f, url: `${base}raw/${dir}/${f}` })),
      text: body,
      html: md.render(body.replace(/^\s*#\s+.*\n/, '')),
      outcomeHtml: s.outcome ? md.render(s.outcome) : '',
    };
  });

  fs.rmSync(out, { recursive: true, force: true });
  const write = (file, data) => {
    fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
    fs.writeFileSync(path.join(out, file), data);
  };
  for (const s of skills) {
    for (const f of [s.path, ...s.files.map((name) => `${s.dir}/${name}`)]) write(`raw/${f}`, fs.readFileSync(path.join(root, f)));
  }
  for (const asset of fs.readdirSync(path.join(here, 'assets'))) write(asset, fs.readFileSync(path.join(here, 'assets', asset)));

  const data = JSON.stringify({ repo: REPO, base, skills: records.map(({ example, useCase, outcome, body, ...r }) => r) });
  write('data.js', `window.LIBRARY=${data.replace(/</g, '\\u003c')};`);
  write('skills.json', JSON.stringify({
    repository: `https://github.com/${REPO}`,
    count: records.length,
    skills: records.map(({ text, html, outcomeHtml, raw, steps, what, folder, ...r }) => r),
  }, null, 2));

  // One real HTML page per skill, so shared links work without JavaScript and have their own title.
  const template = fs.readFileSync(path.join(here, 'template.html'), 'utf8');
  const page = (title, description, content) => template
    .replaceAll('{{base}}', base)
    .replace('{{title}}', () => escapeHtml(title))
    .replace('{{description}}', () => escapeHtml(description))
    .replace('{{content}}', () => content);
  const index = `<ul>${records.map((s) => `<li><a href="${s.url}">${escapeHtml(s.name)}</a> – ${escapeHtml(s.description)}</li>`).join('')}</ul>`;
  write('index.html', page('Skill Library', `${records.length} agent skills`, `<noscript>${index}</noscript>`));
  for (const s of records) {
    write(`s/${s.folder}/index.html`, page(`${s.name} – Skill Library`, s.description,
      `<noscript><h1>${escapeHtml(s.name)}</h1><p><a href="${s.rawUrl}">Raw Markdown</a></p>${s.html}</noscript>`));
  }
  write('404.html', page('Not found – Skill Library', 'Skill not found', ''));
  write('.nojekyll', '');
  return records;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(`Built ${build().length} skills.`);
