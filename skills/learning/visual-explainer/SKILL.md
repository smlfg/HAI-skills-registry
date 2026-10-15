---
name: visual-explainer
description: Generate self-contained HTML explainers with SVG diagrams and interactive step-by-step animations for algorithms, data structures, systems or concepts. Use when a static diagram isn't enough and stepping through a change helps understanding.
---

# Visual Explainer

Generate self-contained HTML files for technical diagrams, visualisations and learning pages.

## When to use

- The user needs a visual explanation of an algorithm, data structure, system or concept.
- A static diagram isn't enough; step-by-step interaction helps.
- The user provides audio notes that should accompany the visual.

## Workflow

1. **Pick an aesthetic**: paper/ink, editorial, blueprint, or IDE-inspired. Commit to one.
2. **Structure the page** into sections with a clear narrative (problem → idea → mechanics → example → pitfalls).
3. **Use SVG** for diagrams and plain CSS for layout. No external CDNs; the file must work offline.
4. **Add step animations** where movement or change matters: a state array, a `render(step)` function, Prev/Next buttons, keyboard arrows, and a caption per step.
5. **Embed audio** only when the user provides it, synced to steps if possible.
6. **Verify** the HTML opens without console errors and works at narrow widths.

## Step-animation pattern

```html
<svg id="viz" viewBox="0 0 600 200"></svg>
<p id="caption"></p>
<button id="prev">◀</button><button id="next">▶</button>
<script>
const steps = [
  { arr: [5, 2, 9, 1], hi: [0, 1], text: "Compare 5 and 2" },
  { arr: [2, 5, 9, 1], hi: [0, 1], text: "Swap: 2 < 5" },
];
let i = 0;
function render() { /* draw steps[i].arr as rects, highlight steps[i].hi */
  document.getElementById("caption").textContent = steps[i].text; }
document.getElementById("next").onclick = () => { i = Math.min(i + 1, steps.length - 1); render(); };
document.getElementById("prev").onclick = () => { i = Math.max(i - 1, 0); render(); };
render();
</script>
```

## Example

> "Explain how a hash map handles collisions."
> → `hashmap-collisions.html`: blueprint style; SVG buckets; 8 steps inserting keys, one collision resolved by chaining, then by linear probing; caption per step; works offline.

## Use case

You're learning (or teaching) an algorithm and the textbook figure doesn't click. Ask for a visual explainer: you get one offline HTML file you can step through, share, and open again before the exam.
