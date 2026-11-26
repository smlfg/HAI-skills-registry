---
name: problem-class-tool-selection
description: Classify an engineering problem before choosing a tool or building code. Identify established problem classes, compare the smallest viable approaches, and justify REUSE / INTEGRATE / ADAPT / BUILD LAST with evidence. Use when deciding build vs reuse, choosing a library, or replacing repeated agent-written experiments with deterministic evaluation.
---

# Problem Class and Tool Selection

Principle: **Abstract → Discover → Evaluate → Decide.** Reuse proven mechanisms; own the domain-specific problem, interfaces, success criteria and judgment. Do not confuse a new application with a new algorithm.

## 1. Abstract before searching

- Describe the input, desired output, invariant, constraints and failure mode without naming the current tool.
- Separate the unique product requirement from commodity subproblems. Map each to established technical terms (e.g. search, parsing, scheduling, caching, symbolic computation, experiment tracking).
- State whether the problem is selecting a component, configuring it, evaluating it or inventing a missing capability. Search synonyms and the general class, not just the product name.
- When uncertain, label the classification a hypothesis and check it against documentation.

## 2. Discover the minimum viable tool

Invoke `prior-art-search` before implementation. Start with existing code, language standard library, installed packages and native features; then maintained libraries, services or frameworks. Compare at most three credible options, including a simple baseline.

| Criterion | Evidence |
|---|---|
| Functional fit | One real input/output example; hard constraints met |
| Integration | API contract, runtime/platform, transitive dependencies |
| Trust | License, maintenance, security, provenance |
| Lifecycle cost | Implementation, learning, operation, maintenance, exit cost |
| Reversibility | Can we remove or replace it without a rewrite? |

Choose the simplest option that meets the actual requirements, not the largest framework or most popular library. An existing tool is not automatically cheaper than a small standard-library implementation.

## 3. ML and data-pipeline decision map

| Problem class | Start here | Escalate when justified |
|---|---|---|
| Finite categorical combinations / ablation | Python itertools.product | Optuna GridSampler / BruteForceSampler or conditional search |
| Continuous, conditional or expensive HPO / CASH (combined algorithm selection and hyperparameter optimization) | Small random-search baseline | Optuna; distributed tuning only when resources justify it |
| Image preprocessing | Pillow | OpenCV for specialized operations |
| Symbolic math | SymPy | Domain-specific validator where necessary |
| Experiment tracking | CSV/JSON + git revision | MLflow or equivalent when querying and tracking become difficult |
| Pipeline caching | Explicit deterministic cache | joblib.Memory or existing cache infrastructure |
| Model quality evaluation | Fixed domain-specific ground truth + standard metrics | Specialized evaluation tools if independently validated |

These are examples, not mandatory dependencies. Verify current documentation and compatibility before adopting one.

## 4. Evidence before integration

If the bottleneck is exploring combinations rather than implementing capabilities, build a small configurable harness, not a new program for every trial.

- Freeze real development data, separate untouched holdout, scorer, baseline revision, metric and guardrails before search. Keep test/holdout out of tuning.
- Separate expensive inference from cheap postprocessing; cache raw outputs with keys covering input, model/version, preprocessing and relevant configuration. Never reuse invalidated cache entries.
- Expose component choices and parameters; use exhaustive search when tractable, otherwise budgeted search. Log config, seeds, data/scorer revisions, latency, failures and metrics for each trial.
- Compare baseline and candidates on identical cases with one independent scorer. Separate exact transcription, semantic equivalence and error preservation if relevant; synthetic results are not proof of real-world performance.
- Measure one change at a time for attribution; test interactions when justified. Run ablation to identify essential changes.
- Select the simplest variant meeting the target and guardrails. Refactor/downsize, rerun the same evaluation, then run the untouched holdout once for final acceptance. Preserve research artifacts outside production runtime.

Use `experiment-to-project` to establish a benchmark and `eval` to run it. Never let a candidate change its own acceptance metric; if a scorer bug is found, version the fix and rerun all candidates on equal terms.

## 5. Decision and owner gate

Return a brief decision record before implementation:

```text
Problem class / search vocabulary:
Domain-specific responsibility:
Candidates (including simple baseline) + evidence links:
Hard constraints / primary metric / guardrails:
Decision: REUSE | INTEGRATE | ADAPT | BUILD LAST
Why not the alternatives:
Smallest reversible next experiment:
Evidence / uncertainty / lifecycle cost:
Owner decision needed:
```

Do not install new dependencies, expand architecture or integrate a winner beyond the authorized scope. For learning missions, explain the underlying mechanism and give the human a small exercise before abstracting it away if their learning goal calls for it. Missing access or missing ground truth is a blocker, not proof that custom code is required.

## Example

A handwriting OCR pipeline has eight optional LaTeX normalization rules and several image/model settings. The abstract problem is conditional algorithm selection plus hyperparameter optimization, not "write another OCR pipeline." Compare itertools with Optuna; start by enumerating the 256 binary rule combinations on cached raw recognition outputs. Freeze a transcription scorer and a guardrail against silently correcting student errors. Measure on real handwriting, select the minimal effective rules, refactor and verify again. Keep OCR recognition, symbolic validation and tutor feedback separate.

## Use case

An overnight agent produces thousands of lines of experimental code while optimizing a pipeline. Instead of dispatching another worker to invent fixes, classify the problem, reuse existing search/evaluation tools and let a deterministic runner evaluate interchangeable components. The owner decides which measured improvements survive.
