'use strict';
const { base, skills } = window.LIBRARY;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const label = (c) => c[0].toUpperCase() + c.slice(1);
const state = { query: '', category: '', sort: 'name', selected: null, visible: [] };

const fromPath = () => skills.find((s) => location.pathname.replace(/index\.html$/, '') === s.url) || null;

// Name hits rank above description hits, which rank above body hits. All words must occur;
// if no skill has them all, the closest partial matches are shown and labelled as such.
const STOP = new Set('a an and for i in is it my of on or the to want with how'.split(' '));
const terms = () => {
  const all = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  const content = all.filter((w) => !STOP.has(w));
  return content.length ? content : all;
};

function search() {
  const words = terms();
  const scored = skills.filter((s) => !state.category || s.category === state.category).map((s) => {
    const fields = [s.name, s.description, s.text].map((f) => f.toLowerCase());
    let score = 0;
    let matched = 0;
    for (const w of words) {
      if (!fields.some((f) => f.includes(w))) continue;
      matched += 1;
      score += (fields[0].includes(w) ? 100 : 0) + (fields[1].includes(w) ? 10 : 0) + Math.min(fields[2].split(w).length - 1, 9);
    }
    return { s, score, matched };
  });
  let hits = scored.filter((h) => h.matched === words.length);
  state.partial = !hits.length && words.length > 1;
  if (state.partial) {
    hits = scored.filter((h) => h.matched).sort((a, b) => b.matched - a.matched || b.score - a.score).slice(0, 8);
    return hits.map((h) => h.s);
  }
  const order = state.sort === 'updated'
    ? (a, b) => b.s.updated.localeCompare(a.s.updated) || a.s.name.localeCompare(b.s.name)
    : (a, b) => a.s.name.localeCompare(b.s.name);
  hits.sort((a, b) => (words.length ? b.score - a.score : 0) || order(a, b));
  return hits.map((h) => h.s);
}

function mark(text) {
  const words = terms().map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return esc(text);
  return text.split(new RegExp(`(${words.join('|')})`, 'gi')).map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part))).join('');
}

// Shows why a skill matched when the match is not already visible in the card.
function snippet(s) {
  const missing = terms().filter((w) => !`${s.name} ${s.description}`.toLowerCase().includes(w) && s.text.toLowerCase().includes(w));
  if (!missing.length) return '';
  const at = s.text.toLowerCase().indexOf(missing[0]);
  const before = s.text.slice(0, at).match(/^##+ .*$/gm);
  const where = before ? before.at(-1).replace(/^#+ /, '') : 'Instructions';
  const cut = s.text.slice(Math.max(0, at - 50), at + 110).replace(/[#*`>|\n]+/g, ' ').trim();
  return `<p class="snippet"><b>${esc(where)}:</b> …${mark(cut)}…</p>`;
}

function renderSide() {
  const count = (c) => skills.filter((s) => !c || s.category === c).length;
  const categories = ['', ...[...new Set(skills.map((s) => s.category))].sort()];
  $('side').innerHTML = `<a class="brand" href="${base}">Skill Library</a>
    <div class="cats">${categories.map((c) => `<button data-category="${esc(c)}" aria-pressed="${c === state.category}">
      <span>${c ? esc(label(c)) : 'All skills'}</span><small>${count(c)}</small></button>`).join('')}</div>
    <div class="side-foot">
      <label>Sort <select id="sort"><option value="name">A–Z</option>${skills.some((s) => s.updated) ? '<option value="updated">Recently updated</option>' : ''}</select></label>
      <button id="theme">Light / dark</button>
      <a href="${base}skills.json">skills.json</a>
      <p class="keys"><kbd>/</kbd> search <kbd>↑</kbd><kbd>↓</kbd> select <kbd>⌘</kbd><kbd>↵</kbd> copy for agent</p>
    </div>`;
  $('sort').value = state.sort;
}

function renderList() {
  state.visible = search();
  $('status').textContent = state.partial ? `No skill has all words. Closest ${state.visible.length}:` : `${state.visible.length} of ${skills.length} skills`;
  $('cards').innerHTML = state.visible.map((s) => `<li class="card" aria-current="${s === state.selected}">
      <a href="${s.url}" data-skill="${esc(s.folder)}">
        <h2>${mark(s.name)}</h2><span class="tag">${esc(label(s.category))}</span>
        <p>${mark(s.what)}</p>
        ${s.when ? `<p class="when">${mark(s.when)}</p>` : ''}
        ${snippet(s)}
      </a>
      <button class="quick" data-copy="agent" data-skill="${esc(s.folder)}" title="Copy for Agent: ${esc(s.name)}">Copy</button>
    </li>`).join('') || '<li class="empty">No skill matches. Try fewer or different words.</li>';
}

function renderDetail() {
  const s = state.selected;
  document.body.classList.toggle('open', !!s);
  document.title = s ? `${s.name} – Skill Library` : 'Skill Library';
  if (!s) {
    const missing = location.pathname !== base && !location.pathname.endsWith('index.html');
    $('detail').innerHTML = `<p class="empty">${missing ? 'This skill does not exist (any more). ' : ''}Select a skill to read and copy it.</p>`;
    return;
  }
  const button = (kind, text, cls = '') => `<button class="${cls}" data-copy="${kind}" data-skill="${esc(s.folder)}">${text}</button>`;
  $('detail').innerHTML = `
    <header>
      <a class="back" href="${base}">← All skills</a>
      <span class="tag">${esc(label(s.category))}</span>
      <h1>${esc(s.name)}</h1>
      <div class="actions">
        ${button('agent', 'Copy for Agent', 'primary')}${button('markdown', 'Copy Markdown')}${button('url', 'Copy Raw URL')}${button('install', 'Copy Install Command')}
        <a class="button" href="${s.githubUrl}" target="_blank" rel="noopener">Open on GitHub ↗</a>
      </div>
      ${s.files.length ? `<div class="warn"><b>Needs ${s.files.length} supporting file${s.files.length > 1 ? 's' : ''}.</b> Copying the Markdown alone is not a working installation; use the install command for the full skill.
        <ul>${s.files.map((f) => `<li><a href="${f.url}">${esc(f.name)}</a></li>`).join('')}</ul></div>` : ''}
    </header>
    <dl>
      <dt>Solves</dt><dd>${esc(s.what)}</dd>
      ${s.when ? `<dt>Use when</dt><dd>${esc(s.when)}</dd>` : ''}
      ${s.outcomeHtml ? `<dt>Outcome</dt><dd>${s.outcomeHtml}</dd>` : ''}
    </dl>
    ${s.steps.length ? `<ol class="steps" aria-label="Workflow">${s.steps.map((x) => `<li><small>${esc(x.n)}</small>${esc(x.title.replace(/`/g, ''))}</li>`).join('')}</ol>` : ''}
    <div class="doc">${s.html}</div>
    <details><summary>Raw Markdown</summary><pre><code>${esc(s.raw)}</code></pre></details>
    <p class="source">Source: <a href="${s.githubUrl}">${esc(s.path)}</a>${s.updated ? ` · updated ${s.updated.slice(0, 10)}` : ''}</p>`;
}

function payload(s, kind) {
  if (kind === 'markdown') return s.raw;
  if (kind === 'url') return s.rawUrl;
  if (kind === 'install') return s.install;
  const files = s.files.length
    ? `\nNote: this skill depends on supporting files that are NOT included below. Say so if you need one and cannot fetch it:\n${s.files.map((f) => `- ${f.name}: ${s.rawUrl.replace(/SKILL\.md$/, f.name)}`).join('\n')}\n`
    : '';
  return `Apply the following skill ("${s.name}") to the current task. Follow its instructions.\n${files}\n--- BEGIN SKILL.md ---\n${s.raw}${s.raw.endsWith('\n') ? '' : '\n'}--- END SKILL.md ---\n`;
}

let toastTimer;
function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2200);
}

async function copy(s, kind, button) {
  const text = payload(s, kind);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    if (!ok) return toast('Copy failed. Open "Raw Markdown" and copy by hand.');
  }
  const names = { agent: 'skill for agent', markdown: 'Markdown', url: 'raw URL', install: 'install command' };
  toast(`✓ Copied ${names[kind]}: ${s.name}${s.files.length && kind !== 'url' && kind !== 'install' ? ' (supporting files not included)' : ''}`);
  if (button) {
    const before = button.textContent;
    button.textContent = '✓ Copied';
    setTimeout(() => { button.textContent = before; }, 1400);
  }
}

function select(s, history_ = 'push') {
  state.selected = s;
  if (history_) history[`${history_}State`](null, '', (s ? s.url : base) + location.hash.replace(/.*/, ''));
  renderList();
  renderDetail();
  $('detail').scrollTop = 0;
  document.querySelector('.card[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const s = skills.find((x) => x.folder === target.dataset.skill);
  if (target.dataset.copy) return copy(s, target.dataset.copy, target);
  if (target.id === 'theme') {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.theme = root.dataset.theme; } catch {}
  } else if (target.dataset.category !== undefined) {
    state.category = target.dataset.category;
    document.body.classList.remove('open');
    renderSide();
    renderList();
  } else if (target.tagName === 'A') {
    const url = new URL(target.href);
    const next = skills.find((x) => url.pathname === x.url);
    if (url.origin !== location.origin || (!next && url.pathname !== base)) return;
    if (url.hash) return;
    event.preventDefault();
    select(next || null);
  }
});

$('search').addEventListener('input', (e) => { state.query = e.target.value; document.body.classList.remove('open'); renderList(); });
document.addEventListener('change', (e) => { if (e.target.id === 'sort') { state.sort = e.target.value; renderList(); } });
addEventListener('popstate', () => select(fromPath(), null));

addEventListener('keydown', (event) => {
  const inSearch = document.activeElement === $('search');
  if ((event.key === '/' && !inSearch) || (event.key === 'k' && (event.metaKey || event.ctrlKey))) {
    event.preventDefault();
    document.body.classList.remove('open');
    $('search').focus();
    $('search').select();
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (!state.visible.length || document.activeElement.tagName === 'SELECT' || $('detail').contains(document.activeElement)) return;
    event.preventDefault();
    const at = state.visible.indexOf(state.selected);
    const next = at < 0 ? 0 : Math.min(Math.max(at + (event.key === 'ArrowDown' ? 1 : -1), 0), state.visible.length - 1);
    select(state.visible[next], 'replace');
  } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    const s = inSearch && !state.visible.includes(state.selected) ? state.visible[0] : state.selected || state.visible[0];
    if (s) copy(s, 'agent');
  } else if (event.key === 'Enter' && inSearch && state.visible.length) {
    select(state.visible.includes(state.selected) ? state.selected : state.visible[0]);
  } else if (event.key === 'Escape') {
    if (inSearch && state.query) { $('search').value = state.query = ''; renderList(); } else if (state.selected) select(null);
  }
});

state.selected = fromPath();
renderSide();
renderList();
renderDetail();
document.querySelector('.card[aria-current="true"]')?.scrollIntoView({ block: 'center' });
if (matchMedia('(min-width: 800px)').matches) $('search').focus({ preventScroll: true });
