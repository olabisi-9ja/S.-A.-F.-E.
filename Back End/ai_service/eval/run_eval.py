#!/usr/bin/env python3
"""
Evaluate the S.A.F.E incident classifier.

The classifier under test is the reference implementation in ``../main.py``,
which deliberately mirrors the PRODUCTION classifier in
``Back End/backend/controllers/incidentController.js`` (same categories,
definitions, rubric, signal set and few-shot examples). Keep them in sync.

It classifies each example in ``incidents_eval.jsonl`` and reports:

  * Classification : overall accuracy, per-class precision / recall / F1,
                     macro-F1, weighted-F1, and a confusion matrix.
  * Severity       : mean absolute error vs the rubric-expected score
                     (computed from the GROUND-TRUTH category + signals) and
                     accuracy across severity bands (Low / Moderate / High /
                     Critical). Severity is deterministic given the signals, so
                     this really measures how accurately the signals are read.
  * Signal         : per-signal precision / recall / F1 (does the model correctly
                     detect a weapon, an injury, an ongoing incident, etc.).

Outputs:
  eval_report.md     - human-readable, drop-in for the thesis (Chapter 4)
  eval_results.json  - raw per-example predictions + aggregate metrics

Usage
-----
  python run_eval.py                 # auto: Gemini if GEMINI_API_KEY is set,
                                     #       else keyword+rubric fallback
  python run_eval.py --mode keyword  # force the keyword+rubric fallback (baseline)
  python run_eval.py --mode llm      # force the Gemini path (requires key)
  python run_eval.py --limit 20      # only the first 20 examples (quick check)
"""

import argparse
import json
import os
import sys
import time
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))  # so `import main` resolves ../main.py
import main  # noqa: E402

DATASET = os.path.join(HERE, "incidents_eval.jsonl")
REPORT_MD = os.path.join(HERE, "eval_report.md")
RESULTS_JSON = os.path.join(HERE, "eval_results.json")

SEVERITY_BANDS = [(0, 39, "Low"), (40, 59, "Moderate"), (60, 79, "High"), (80, 100, "Critical")]
BAND_NAMES = [b[2] for b in SEVERITY_BANDS]


def band_for(score):
    for lo, hi, name in SEVERITY_BANDS:
        if lo <= score <= hi:
            return name
    return "Critical"


def abbrev(name):
    specials = {"Suspicious Activity": "Susp.", "Emergency / Medical": "Med.", "Armed Robbery": "ArmRob"}
    return specials.get(name, name[:6])


def run(mode, limit):
    if mode == "keyword":
        os.environ.pop("GEMINI_API_KEY", None)
        mode_label = "keyword + rubric fallback (no LLM)"
    elif mode == "llm":
        key = os.environ.get("GEMINI_API_KEY")
        if not key or key == "placeholder":
            sys.exit("ERROR: --mode llm requires GEMINI_API_KEY to be set.")
        mode_label = "Google Gemini (gemini-2.5-flash) + rubric"
    else:
        key = os.environ.get("GEMINI_API_KEY")
        mode_label = ("Google Gemini (gemini-2.5-flash) + rubric"
                      if key and key != "placeholder"
                      else "keyword + rubric fallback (GEMINI_API_KEY not set)")

    rows = []
    with open(DATASET, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    if limit:
        rows = rows[:limit]

    cats = list(main.CATEGORIES)
    signal_keys = list(main.SIGNAL_KEYS)

    cm = {t: {p: 0 for p in cats} for t in cats}      # cm[true][pred]
    sig_tp = defaultdict(int)
    sig_fp = defaultdict(int)
    sig_fn = defaultdict(int)
    per_example = []
    sev_abs_err = []
    band_correct = 0

    t0 = time.time()
    for i, row in enumerate(rows, 1):
        text = row["text"]
        true_cat = row["category"]
        true_sig = {k: bool(row.get("signals", {}).get(k, False)) for k in signal_keys}

        pred = main.classify_incident(text)
        pred_cat = pred["category"]
        pred_sig = {k: bool(pred.get("signals", {}).get(k, False)) for k in signal_keys}

        cm[true_cat][pred_cat] += 1
        expected_sev = main.compute_severity(true_cat, true_sig)
        pred_sev = int(pred["severity_score"])
        sev_abs_err.append(abs(pred_sev - expected_sev))
        if band_for(expected_sev) == band_for(pred_sev):
            band_correct += 1

        for k in signal_keys:
            if pred_sig[k] and true_sig[k]:
                sig_tp[k] += 1
            elif pred_sig[k] and not true_sig[k]:
                sig_fp[k] += 1
            elif not pred_sig[k] and true_sig[k]:
                sig_fn[k] += 1

        per_example.append({
            "text": text,
            "true_category": true_cat,
            "pred_category": pred_cat,
            "correct": pred_cat == true_cat,
            "expected_severity": expected_sev,
            "pred_severity": pred_sev,
            "true_signals": true_sig,
            "pred_signals": pred_sig,
            "confidence": pred.get("confidence"),
        })

        if i % 10 == 0 or i == len(rows):
            sys.stderr.write(f"\r  classified {i}/{len(rows)} ...")
            sys.stderr.flush()
    sys.stderr.write("\n")
    elapsed = time.time() - t0

    n = len(rows)
    correct = sum(1 for e in per_example if e["correct"])
    accuracy = correct / n if n else 0.0

    per_class = {}
    for c in cats:
        tp = cm[c][c]
        fp = sum(cm[t][c] for t in cats if t != c)
        fn = sum(cm[c][p] for p in cats if p != c)
        support = tp + fn
        prec = tp / (tp + fp) if (tp + fp) else 0.0
        rec = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) else 0.0
        per_class[c] = {"support": support, "precision": prec, "recall": rec, "f1": f1}

    macro_f1 = sum(v["f1"] for v in per_class.values()) / len(cats)
    weighted_f1 = sum(per_class[c]["f1"] * per_class[c]["support"] for c in cats) / max(1, n)
    macro_prec = sum(v["precision"] for v in per_class.values()) / len(cats)
    macro_rec = sum(v["recall"] for v in per_class.values()) / len(cats)

    mae = sum(sev_abs_err) / n if n else 0.0
    bucket_acc = band_correct / n if n else 0.0

    signal_metrics = {}
    for k in signal_keys:
        tp, fp, fn = sig_tp[k], sig_fp[k], sig_fn[k]
        p = tp / (tp + fp) if (tp + fp) else 0.0
        r = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (2 * p * r / (p + r)) if (p + r) else 0.0
        signal_metrics[k] = {"precision": p, "recall": r, "f1": f1, "positives": tp + fn}

    results = {
        "config": {"mode": mode, "mode_label": mode_label, "n": n, "elapsed_sec": round(elapsed, 2)},
        "classification": {
            "accuracy": accuracy,
            "macro_precision": macro_prec,
            "macro_recall": macro_rec,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "per_class": per_class,
            "confusion_matrix": cm,
        },
        "severity": {
            "mean_absolute_error": mae,
            "band_accuracy": bucket_acc,
            "bands": BAND_NAMES,
        },
        "signals": signal_metrics,
        "examples": per_example,
    }

    with open(RESULTS_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    write_markdown(results)
    print_summary(results)
    print(f"\nWrote {REPORT_MD} and {RESULTS_JSON}")


def write_markdown(r):
    cfg = r["config"]
    cl = r["classification"]
    sev = r["severity"]
    sig = r["signals"]
    lines = []
    lines.append("# S.A.F.E Incident Classifier - Evaluation Report\n")
    lines.append(f"**Mode:** {cfg['mode_label']}  ")
    lines.append(f"**Dataset:** `incidents_eval.jsonl` ({cfg['n']} labelled examples, balanced 12 per category)  ")
    lines.append(f"**Classifier under test:** reference implementation in `ai_service/main.py`, which mirrors "
                 "the production classifier in `Back End/backend/controllers/incidentController.js` "
                 "(same categories, definitions, rubric, signal set and few-shot examples).  ")
    lines.append(f"**Wall time:** {cfg['elapsed_sec']} s\n")

    lines.append("## 1. Classification\n")
    lines.append("| Metric | Value |")
    lines.append("|---|---|")
    lines.append(f"| Accuracy | **{cl['accuracy']:.1%}** |")
    lines.append(f"| Macro precision | {cl['macro_precision']:.3f} |")
    lines.append(f"| Macro recall | {cl['macro_recall']:.3f} |")
    lines.append(f"| Macro F1 | **{cl['macro_f1']:.3f}** |")
    lines.append(f"| Weighted F1 | {cl['weighted_f1']:.3f} |\n")

    lines.append("### Per-class precision / recall / F1\n")
    lines.append("| Category | Support | Precision | Recall | F1 |")
    lines.append("|---|---:|---:|---:|---:|")
    for c, m in cl["per_class"].items():
        lines.append(f"| {c} | {m['support']} | {m['precision']:.3f} | {m['recall']:.3f} | {m['f1']:.3f} |")
    lines.append("")

    lines.append("### Confusion matrix (rows = true, columns = predicted)\n")
    cm = cl["confusion_matrix"]
    cats = list(cm.keys())
    hdr = "| true \\ pred | " + " | ".join(abbrev(c) for c in cats) + " |"
    sep = "|" + "---:|" * (len(cats) + 1)
    lines.append(hdr)
    lines.append(sep)
    for t in cats:
        row = f"| {abbrev(t)} | " + " | ".join(str(cm[t][p]) for p in cats) + " |"
        lines.append(row)
    lines.append("")

    lines.append("## 2. Severity\n")
    lines.append("Severity is computed deterministically from the rubric once the signals are known, "
                 "so these figures measure how accurately the classifier READS the incident.\n")
    lines.append("| Metric | Value |")
    lines.append("|---|---|")
    lines.append(f"| Mean absolute error vs rubric-expected score (0-100) | **{sev['mean_absolute_error']:.1f}** |")
    lines.append(f"| Band accuracy (Low / Moderate / High / Critical) | **{sev['band_accuracy']:.1%}** |\n")

    lines.append("## 3. Signal extraction\n")
    lines.append("| Signal | Positives | Precision | Recall | F1 |")
    lines.append("|---|---:|---:|---:|---:|")
    for k, m in sig.items():
        lines.append(f"| {k} | {m['positives']} | {m['precision']:.3f} | {m['recall']:.3f} | {m['f1']:.3f} |")
    lines.append("")

    lines.append("## Notes\n")
    lines.append("- The dataset is disjoint from the few-shot examples embedded in the prompt, so the "
                 "scores reflect generalisation, not memorisation.\n")
    lines.append("- To obtain the Gemini (LLM) figures, set `GEMINI_API_KEY` and re-run "
                 "`python run_eval.py --mode llm`; it overwrites this file.\n")

    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def print_summary(r):
    cl = r["classification"]
    sev = r["severity"]
    print("=" * 60)
    print(f"Mode            : {r['config']['mode_label']}")
    print(f"N               : {r['config']['n']}")
    print(f"Accuracy        : {cl['accuracy']:.1%}")
    print(f"Macro F1        : {cl['macro_f1']:.3f}")
    print(f"Weighted F1     : {cl['weighted_f1']:.3f}")
    print(f"Severity MAE    : {sev['mean_absolute_error']:.1f}")
    print(f"Severity band acc: {sev['band_accuracy']:.1%}")
    print("=" * 60)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mode", choices=["auto", "keyword", "llm"], default="auto")
    ap.add_argument("--limit", type=int, default=0, help="evaluate only the first N examples")
    args = ap.parse_args()
    run(args.mode, args.limit)
