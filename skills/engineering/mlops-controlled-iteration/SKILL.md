---
name: mlops-controlled-iteration
description: Run evidence-based MLOps and LLMOps iterations on an existing model pipeline. Separate data, preprocessing, model, prompt, decoding, runtime, postprocessing and guardrails; change one factor at a time against frozen real inputs, ground truth and reproducible latency/quality measurements. Use for model or prompt comparisons, inference tuning, eval regressions, and unreliable AI pipelines.
---

# MLOps Controlled Iteration

**Principle: a better-looking model answer is not proof of a better system.** First localize the error; then change one causal factor and measure quality, latency and failure cost together.

Use this skill for an *existing* ML/LLM pipeline with at least one runnable baseline. For a project still searching for its task, metrics and first prototype, start with `experiment-to-project`. For an already defined test plan, use `eval` to execute it.

## Procedure

1. **Freeze an honest baseline.** Save a representative set of real inputs (privately where needed), independent ground truth, failures and a reproducible run command. Fingerprint the exact input bytes, code, model and configuration. A live preview or the agreement of two models is **not** ground truth.
2. **Locate the failing stage.** Trace acquisition → preprocessing → model → decoding → postprocessing → user action. Inspect intermediate artifacts. An input crop that changes one digit is not a model-reasoning failure; a valid JSON object with truncated content is not a successful extraction.
3. **Define the experiment before running it.** State one hypothesis, one factor to change and a control. Hold task set, input versions, model, prompt, decoding and runtime constant except for that factor. For multi-candidate studies, use a shared immutable snapshot and log the factors separately; do not call eight unrelated full pipelines an A/B test.
4. **Use a fixed scoring rule.** Select task-relevant accuracy against independent truth (e.g. exact line/symbol correctness, false approvals, downstream task success); define critical failures separately. Human rankings are preference labels, **not** reinforcement learning or correctness labels. Where learning is the purpose, measure whether the learner can do the next step independently.
5. **Measure realistic performance.** Log model and quantization/version, hardware, input size/tokens, output token budget, prompt/temperature, concurrency requested **and actual slots**, cold versus warm state, p50/p95 latency, timeouts, throughput and cost/quota. Parallel requests are not evidence of parallel computation; verify measured throughput and queueing.
6. **Compare and inspect failures.** Run the same cases on baseline and candidate. Inspect raw outputs for regressions, wrong labels and broken format. Repeated identical predictions on an unchanged input show repeatability, not correctness. Distinguish model errors from measurement/scorer errors.
7. **Guardrails only with evidence.** Safety-critical stops remain hard constraints. For optional filters, record false positives and false negatives before layering more filters/retries; never optimize one score by silently suppressing valid outputs.
8. **Promote only if the user's outcome improves.** Record the decision and uncertainty; retain baseline and rollback. If the change is ambiguous, keep the baseline. Stop optimizing when the human can use the working system.

## Experiment record — keep it small

```text
Question / hypothesis:
Control vs candidate (ONE changed factor):
Dataset hash + independent ground truth:
Model / prompt / preprocessing / runtime versions:
Quality + critical failures:
Cold/warm | input/output tokens | slots | p50/p95 | throughput | cost:
Regression cases + raw evidence:
Decision: keep baseline | promote | inconclusive
Next human action:
```

## Example

A handwriting-to-text pipeline reads the same written digit correctly with one image crop and incorrectly with a slightly wider crop. Repeating the wider image six times produces six identical **wrong** readings. Do not add a majority-vote reader or swap the tutor. Freeze both images, record the correct transcription, vary crop size only, measure symbol accuracy and latency, then keep the crop setting that wins on a representative set—not just this one example. Next, compare tutor prompts on the **same** accepted text snapshot, with the same model; collect anonymized preferences separately from mathematical correctness.

## Use case

An agent proposes switching models, adding OCR retries, adjusting context size and increasing parallelism at once to make a real-time tutor faster. Invoke `/mlops-controlled-iteration`: separate the four factors, replay identical inputs, measure where the time and errors actually occur, verify the server's real slots, and promote only changes with a verified net benefit.

**Related:** `change-isolation` protects contracts and blast radius; `experiment-to-project` creates the bench; `eval` executes a fixed suite; `skilleval` compares agent-produced artifacts.
