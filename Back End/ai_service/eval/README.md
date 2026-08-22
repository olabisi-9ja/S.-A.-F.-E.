# S.A.F.E classifier evaluation

This folder turns the incident classifier from "it works" into **measured**:
a labelled, held-out dataset plus a script that reports real accuracy / F1 and
severity-error numbers you can put straight into Chapter 4.

## Files

| File | Purpose |
|---|---|
| `incidents_eval.jsonl` | 120 labelled incident reports (12 per category), each with ground-truth category and severity signals. **Deliberately disjoint** from the few-shot examples embedded in the prompt, so the numbers reflect generalisation, not memorisation. |
| `run_eval.py` | Runs every example through the classifier and computes classification metrics, severity error, and per-signal extraction metrics. |
| `eval_report.md` | Generated. Human-readable, drop-in for the thesis. |
| `eval_results.json` | Generated. Raw per-example predictions + aggregate metrics. |

## What is being evaluated

`run_eval.py` imports the reference classifier in `../main.py`, which **mirrors
the production classifier** in
`Back End/backend/controllers/incidentController.js`: identical category list,
definitions, severity rubric (`SEVERITY_BASE` + `SIGNAL_DELTA`), signal set and
few-shot examples. Keep the two in sync. (Running the same dataset against the
Node controller would give the same result; the Python reference exists so the
harness has no web-framework dependencies and can be run anywhere.)

## Running it

```bash
cd Back End/ai_service/eval

# 1) Baseline - keyword + rubric fallback. Needs NO API key. Quick sanity check
#    and a defensible lower bound for the thesis.
python run_eval.py --mode keyword

# 2) Real numbers - the Gemini (LLM) path. Requires your key.
export GEMINI_API_KEY="your_key_here"
python run_eval.py --mode llm

# 3) Auto - uses Gemini if GEMINI_API_KEY is set, otherwise the fallback.
python run_eval.py

# Quick smoke test on 20 examples:
python run_eval.py --mode llm --limit 20
```

Each run overwrites `eval_report.md` and `eval_results.json`.

## What the report gives you (Chapter 4)

- **Classification:** overall accuracy, per-class precision / recall / F1,
  macro-F1, weighted-F1, and a confusion matrix (shows exactly which categories
  get confused - useful discussion material).
- **Severity:** mean absolute error vs the rubric-expected score, and accuracy
  across severity bands (Low / Moderate / High / Critical). Because severity is
  computed deterministically from the signals, this really measures how
  accurately the incident is *read*.
- **Signal extraction:** per-signal precision / recall / F1 (weapon, injury,
  life-threatening, ongoing, multiple victims, property loss, resolved).

## Extending the dataset

Add more rows to `incidents_eval.jsonl`, one JSON object per line:

```json
{"text": "the report text", "category": "Theft", "signals": {"property_loss": true, "resolved_past": true}}
```

`signals` is sparse - any key omitted is treated as `false`. More data (and a
second annotator for inter-rater agreement) only strengthens the evaluation.
