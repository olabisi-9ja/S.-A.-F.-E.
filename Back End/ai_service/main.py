"""
S.A.F.E - standalone AI classification reference service.

WHAT THIS IS
------------
A runnable, self-contained reference implementation of the S.A.F.E incident
classifier. It mirrors the *production* classifier that lives inside the Node
backend (``Back End/backend/controllers/incidentController.js`` -> classifyIncident).

PRODUCTION DOES NOT CALL THIS SERVICE. Classification in the live system runs
inside the Node backend via the Google Gemini API. This file exists so the
design can be inspected, demoed, and evaluated in isolation (e.g. run it over a
labelled eval set to measure accuracy / F1).

DESIGN (honest and defensible - matches the thesis)
---------------------------------------------------
1. A hosted LLM (Google Gemini) classifies the free-text report into ONE
   canonical category AND extracts structured severity SIGNALS from the text
   (weapon present, injury, life-threatening, ongoing, etc.).
2. The severity SCORE is NOT an arbitrary number from the model. It is computed
   deterministically from a published rubric (SEVERITY_BASE + SIGNAL_DELTA).
   The model only extracts factual signals; the arithmetic is fixed and auditable.
3. The category is normalised to the canonical list shared with the clients.
4. AI never gates an emergency (SOS). Classification applies to incident REPORTS
   only, for additive triage. See the SOS safety guarantee in alertController.js.

NOTE: An earlier version of this file used a DistilBERT zero-shot (NLI) pipeline
with a hardcoded severity lookup table nudged by model confidence. That approach
was replaced because (a) zero-shot entailment is markedly less accurate than a
definition + few-shot prompted LLM, and (b) a confidence-nudged lookup table does
not measure anything about the actual incident. The rubric below fixes both.

Keep CATEGORIES / CATEGORY_DEFINITIONS / SEVERITY_BASE / SIGNAL_DELTA / FEWSHOT
in sync with incidentController.js.
"""

import json
import logging
import os
import re
from typing import Any, Dict, Optional

try:
    import uvicorn
    from fastapi import FastAPI
    from pydantic import BaseModel
    HAVE_FASTAPI = True
except ImportError:  # web deps are optional -> allows importing this module as a
    # library (e.g. for evaluation via eval/run_eval.py) without FastAPI installed.
    uvicorn = None
    HAVE_FASTAPI = False

    class BaseModel:  # type: ignore
        pass

    class FastAPI:  # type: ignore - never instantiated when HAVE_FASTAPI is False
        pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Canonical category list - MUST match the client dropdown and incidentController.js.
CATEGORIES = [
    "Theft",
    "Assault",
    "Harassment",
    "Vandalism",
    "Suspicious Activity",
    "Cultism",
    "Armed Robbery",
    "Emergency / Medical",
    "Fire",
    "Other",
]

CATEGORY_DEFINITIONS = [
    ("- Theft", "Property taken without force or threat (phone/laptop stolen from an unattended spot, pickpocketing, snatch-and-run)."),
    ("- Armed Robbery", "Property taken using a weapon or the threat of one (gun, knife, machete, acid). Use this INSTEAD of Theft when a weapon is involved."),
    ("- Assault", "Physical attack, beating, fighting, or use of physical force against a person."),
    ("- Harassment", "Threats, intimidation, bullying, stalking, sexual harassment, or verbal abuse where physical contact has not (yet) occurred."),
    ("- Vandalism", "Deliberate damage to property (broken window, slashed tyre, defaced wall). No person harmed."),
    ("- Suspicious Activity", "A person or situation that seems wrong but NO crime has clearly happened yet (lurking, tailing someone, unattended bag)."),
    ("- Cultism", "Cult / gang / confraternity activity, initiation, clashes, or related threats."),
    ("- Emergency / Medical", "Medical emergency: someone hurt, unwell, fainted, unconscious, an accident, or anything needing first aid or an ambulance."),
    ("- Fire", "Fire, smoke, explosion, or a real risk of fire."),
    ("- Other", "Anything that does not fit the categories above."),
]

# Base severity per category; adjusted by the extracted signals below.
# Calibrated so that the CATEGORY ALONE already lands the incident in the
# correct triage band (Low <40 / Moderate 40-59 / High 60-79 / Critical 80+),
# matching the bands used by the web + mobile clients. That way an
# under-extracted signal can never drag a serious crime into a low band.
SEVERITY_BASE = {
    "Armed Robbery": 82,
    "Fire": 82,
    "Emergency / Medical": 72,
    "Assault": 74,
    "Cultism": 72,
    "Harassment": 58,
    "Theft": 56,
    "Vandalism": 44,
    "Suspicious Activity": 40,
    "Other": 34,
}

# Published, deterministic severity rubric. The model only sets the booleans;
# the final score is computed from this table, so it is reproducible.
# Recalibrated after field reports of systematic UNDER-scoring:
#   - resolved_past was -12: almost every campus report is past-tense
#     ("my phone was stolen"), so nearly everything lost 12 points for
#     recency alone. Severity should grade the INCIDENT, not the tense.
#     Now -5: over-and-done still matters, but it no longer swamps the base.
#   - life_threatening / injury / ongoing_now raised so active, violent,
#     weaponised situations clearly cross band boundaries.
SIGNAL_DELTA = {
    "life_threatening": 20,  # imminent danger to life
    "weapon_involved": 14,   # a weapon is mentioned/present
    "injury_reported": 12,   # a person is reported hurt/injured/bleeding
    "ongoing_now": 12,       # incident happening now / suspect still on scene
    "multiple_victims": 8,   # more than one person affected/targeted
    "property_loss": 5,      # valuables stolen or property damaged/lost
    "resolved_past": -5,     # event is over; suspect gone; no current danger
}

SIGNAL_KEYS = list(SIGNAL_DELTA.keys())

# Few-shot examples - Nigerian campus phrasing. ~2 per category: (report, category, signals).
FEWSHOT = [
    ("Two boys on a bike just snatched my phone near the faculty gate and rode off.", "Theft", {"ongoing_now": True, "property_loss": True}),
    ("I left my laptop in the reading room and when I came back it was gone.", "Theft", {"resolved_past": True, "property_loss": True}),
    ("Some guys beat up a student behind the hostel, he is bleeding from the nose.", "Assault", {"injury_reported": True, "ongoing_now": True}),
    ("There was a fist fight between two students in the cafeteria; security came and it is over now.", "Assault", {"resolved_past": True}),
    ("A senior student keeps sending threatening messages and waits outside my class to intimidate me.", "Harassment", {"ongoing_now": True}),
    ("A lecturer is threatening to fail me if I do not visit his office alone.", "Harassment", {"ongoing_now": True}),
    ("The window of the lab was smashed overnight, nothing was stolen.", "Vandalism", {"property_loss": True, "resolved_past": True}),
    ("Someone keyed my car and slashed two tyres in the car park.", "Vandalism", {"property_loss": True, "resolved_past": True}),
    ("A man I do not recognize is lingering near the female hostel taking photos of students.", "Suspicious Activity", {"ongoing_now": True}),
    ("There is an unattended bag sitting in the lecture hall that nobody claims.", "Suspicious Activity", {"ongoing_now": True}),
    ("A group wearing black is gathering at the back gate shouting confraternity slogans.", "Cultism", {"ongoing_now": True, "multiple_victims": True}),
    ("We found cult initiation materials and a threatening note in the classroom.", "Cultism", {"resolved_past": True}),
    ("Three men with guns robbed students at the campus gate and took their phones and money.", "Armed Robbery", {"weapon_involved": True, "multiple_victims": True, "property_loss": True, "resolved_past": True}),
    ("A guy pulled a knife on me and collected my bag near the bus park.", "Armed Robbery", {"weapon_involved": True, "property_loss": True, "resolved_past": True}),
    ("A student just collapsed in the exam hall and is not responding, we need an ambulance.", "Emergency / Medical", {"life_threatening": True, "injury_reported": True, "ongoing_now": True}),
    ("Someone fell down the stairs and twisted her ankle, she cannot walk.", "Emergency / Medical", {"injury_reported": True, "ongoing_now": True}),
    ("Smoke is coming from the chemistry lab and we can see flames, everyone is running out.", "Fire", {"life_threatening": True, "ongoing_now": True, "multiple_victims": True}),
    ("A small bin caught fire outside the hostel but we put it out with water.", "Fire", {"resolved_past": True}),
    ("The street light at the male hostel has been broken for weeks, it is very dark at night.", "Other", {}),
    ("I lost my ID card somewhere between the library and the admin block.", "Other", {"property_loss": True, "resolved_past": True}),
]


def normalize_category(raw: Optional[str]) -> str:
    if not raw:
        return "Other"
    c = str(raw).strip()
    if c in CATEGORIES:
        return c
    lc = c.lower()
    aliases = {
        "medical": "Emergency / Medical",
        "emergency": "Emergency / Medical",
        "emergency / medical": "Emergency / Medical",
        "emergency/medical": "Emergency / Medical",
        "robbery": "Armed Robbery",
        "armed robbery": "Armed Robbery",
        "armed-robbery": "Armed Robbery",
        "suspicious": "Suspicious Activity",
        "suspicious activity": "Suspicious Activity",
        "general": "Other",
    }
    if lc in aliases:
        return aliases[lc]
    for cat in CATEGORIES:
        if lc in cat.lower():
            return cat
    if any(k in lc for k in ("medic", "injur", "faint", "ambulance", "unconscious")):
        return "Emergency / Medical"
    if any(k in lc for k in ("weapon", "gun", "robber", "knife", "machete")):
        return "Armed Robbery"
    return "Other"


def compute_severity(category: str, signals: Optional[Dict[str, bool]] = None) -> int:
    signals = signals or {}
    score = SEVERITY_BASE.get(category, 35)
    for key in SIGNAL_KEYS:
        if signals.get(key):
            score += SIGNAL_DELTA[key]
    return max(0, min(100, round(score)))


def escalate_category(category: str, signals: Optional[Dict[str, bool]] = None):
    """Safety escalation guard.

    The single most common misclassification is a weapon/force robbery landing
    in "Theft", which also silently drops the severity ~30 points (Theft base
    56 vs Armed Robbery base 82). If the extracted signals prove a weapon or
    force against the victim, escalate the label deterministically - the
    category definition itself says Armed Robbery applies INSTEAD of Theft
    whenever a weapon or force is involved.

    Returns (category, note); note is None when no escalation happened.
    """
    signals = signals or {}
    if category == "Theft" and signals.get("weapon_involved"):
        return "Armed Robbery", "escalated Theft -> Armed Robbery (weapon involved)"
    if category == "Theft" and signals.get("injury_reported") and signals.get("property_loss"):
        return "Armed Robbery", "escalated Theft -> Armed Robbery (force used against victim to take property)"
    return category, None


def build_prompt(description: str) -> str:
    defs = "\n".join(f"{k}: {v}" for k, v in CATEGORY_DEFINITIONS)
    examples = []
    for text, cat, sig in FEWSHOT:
        sig_str = ", ".join(f"{k}={'true' if sig.get(k) else 'false'}" for k in SIGNAL_KEYS)
        examples.append(f'Report: "{text}"\nCategory: {cat}\nSignals: {sig_str}')
    examples_block = "\n\n".join(examples)
    safe_desc = description.replace('"', '\\"')
    return f"""You are a triage assistant for a Nigerian university (KWASU) campus safety system.
Given an incident report you must do TWO things:
1. Classify it into exactly ONE category from the list below.
2. Extract structured severity SIGNALS that are explicitly supported by the text.

Categories and definitions:
{defs}

Signals to extract (each true/false, based ONLY on what the text says; if unclear, false):
- weapon_involved: a weapon is mentioned or present (gun, knife, machete, acid, club, broken bottle).
- life_threatening: imminent danger to life (unconscious / not breathing, severe bleeding, active shooter, fire spreading, someone trapped).
- injury_reported: a person is reported hurt, injured, or bleeding.
- ongoing_now: the incident is happening right now / suspect is still on the scene.
- multiple_victims: more than one person is affected or targeted.
- property_loss: valuables were stolen or property was damaged or lost.
- resolved_past: the event is already over and there is no current danger (suspect fled, clearly past tense).

Rules:
- Choose the single best-fitting category using the definitions. In particular: Armed Robbery (not Theft) when a weapon is involved; Suspicious Activity only when no crime has clearly occurred yet.
- If a weapon was used, brandished, or threatened - OR physical force was used against the victim to take property (pushed, dragged, knocked down, beaten, struggled with) - classify as Armed Robbery, NOT Theft. A quick snatch-and-run that only grabbed the item is Theft.
- When a report plausibly fits two categories, choose the MORE serious one. This is a safety triage system: under-classifying an incident is worse than over-classifying it.
- Extract signals strictly from the text. Do not infer beyond what is written.
- Set is_suspicious true if the report describes something ambiguous, possibly criminal, or warranting a patrol check.
- confidence reflects how clearly the text maps to the chosen category (high / medium / low).

Respond ONLY with a JSON object of this shape:
{{"category": str, "confidence": "high|medium|low", "signals": {{"weapon_involved": bool, "life_threatening": bool, "injury_reported": bool, "ongoing_now": bool, "multiple_victims": bool, "property_loss": bool, "resolved_past": bool}}, "is_suspicious": bool, "reasoning": str}}

Examples:
{examples_block}

Now classify this report:
Report: "{safe_desc}\""""


def _parse_json_loose(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    t = re.sub(r"```json|```", "", text, flags=re.IGNORECASE).strip()
    start, end = t.find("{"), t.rfind("}")
    if start != -1 and end != -1 and end > start:
        t = t[start:end + 1]
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        return None


def classify_by_keywords(description: str) -> Dict[str, Any]:
    """Rubric-based keyword fallback used when GEMINI_API_KEY is unset or the call fails."""
    d = (description or "").lower()

    def has(*words):
        # Word-boundary match (prefix): \bcult matches "cultist"/"cultists" but NOT
        # "faculty"; \bwound matches "wounded" but NOT "around". Plain substring
        # matching caused systematic false positives (faculty -> Cultism,
        # around -> injury, begun -> gun, dangerous -> gang).
        return any(re.search(r"\b" + re.escape(w), d) for w in words)

    signals = {
        "weapon_involved": has("gun", "knife", "machete", "cutlass", "acid", "pistol", "weapon", "armed", "gunmen", "robbers", "wielding", "broken bottle", "axe", "sword", "dagger", "gunshot"),
        "life_threatening": has("unconscious", "not breathing", "severe bleeding", "dying", "collapsed", "spreading fire", "trapped"),
        "injury_reported": has("hurt", "injur", "bleed", "wound", "faint", "collapsed", "beat up", "attacked", "beaten", "stabbed", "strangled"),
        "ongoing_now": has("just now", "right now", "ongoing", "at the moment", "still here", "is happening", "right there", "just happened", "just snatched", "just attacked", "currently", "as we speak", "still there", "still at"),
        "multiple_victims": has("students", "group", "crowd", "people", "they", "them", "several"),
        "property_loss": has("stolen", "snatched", "robbed", "took", "collected", "missing", "lost", "broke", "damaged", "smashed", "slashed"),
        "resolved_past": has("yesterday", "earlier", "last night", "was stolen", "happened", "already", "over now", "fled", "ran off", "ran away", "ran towards", "rode off", "disappeared", "escaped", "gone"),
    }

    category = "Other"
    if has("fire", "smoke", "flame", "burn"):
        category = "Fire"
    elif signals["weapon_involved"] and (signals["property_loss"] or has("rob")):
        category = "Armed Robbery"
    elif has("assault", "attack", "fight", "beat"):
        category = "Assault"
    elif has("harass", "threaten", "intimidat", "stalk", "bully"):
        category = "Harassment"
    elif has("cult", "confratern", "gang", "initiation"):
        category = "Cultism"
    elif has("medic", "injur", "faint", "collapsed", "ambulance", "unconscious", "sick", "accident"):
        category = "Emergency / Medical"
    elif has("vandal", "damage", "smashed", "defac", "slashed", "keyed"):
        category = "Vandalism"
    elif has("theft", "stolen", "snatched", "robbed", "missing", "lost"):
        category = "Theft"
    elif has("suspicious", "lurking", "lingering", "following", "tailing", "unattended", "taking photos", "stranger"):
        category = "Suspicious Activity"

    # Same deterministic escalation as the LLM path (e.g. force-theft -> Armed Robbery).
    category, note = escalate_category(category, signals)
    reasoning = "Keyword + rubric fallback (LLM unavailable)."
    if note:
        reasoning = f"{reasoning} [{note}]"

    return {
        "category": category,
        "severity_score": compute_severity(category, signals),
        "is_suspicious": category == "Suspicious Activity",
        "confidence": "low",
        "signals": signals,
        "reasoning": reasoning,
    }


def classify_incident(description: str) -> Dict[str, Any]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "placeholder":
        return classify_by_keywords(description)

    try:
        from google import genai  # imported lazily so the module loads without the SDK installed
    except ImportError:
        logger.warning("google-genai not installed; using keyword + rubric fallback.")
        return classify_by_keywords(description)

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=build_prompt(description),
            config={"temperature": 0.2, "response_mime_type": "application/json"},
        )
        parsed = _parse_json_loose(getattr(response, "text", ""))
    except Exception as e:  # pragma: no cover - network / auth errors
        logger.warning("Gemini classification failed, using keyword + rubric fallback: %s", e)
        return classify_by_keywords(description)

    if not parsed:
        return classify_by_keywords(description)

    signals = parsed.get("signals") or {}
    category = normalize_category(parsed.get("category"))
    confidence = parsed.get("confidence") or "medium"

    # Deterministic safety escalation (e.g. weapon robberies misread as Theft).
    category, note = escalate_category(category, signals)
    if note:
        logger.info("Classification escalation: %s", note)

    reasoning = parsed.get("reasoning") or ""
    is_suspicious = bool(parsed.get("is_suspicious")) or category == "Suspicious Activity" or confidence == "low"

    return {
        "category": category,
        "severity_score": compute_severity(category, signals),
        "is_suspicious": is_suspicious,
        "confidence": confidence,
        "signals": signals,
        "reasoning": f"{reasoning} [{note}]" if note else reasoning,
    }


# --------------------------------------------------------------------------- #
# FastAPI surface (optional - only for local demos). Production does not use it.
# Guarded so this module can ALSO be imported as a library (e.g. by
# eval/run_eval.py) without FastAPI/uvicorn installed.
# --------------------------------------------------------------------------- #
if HAVE_FASTAPI:
    app = FastAPI(title="S.A.F.E AI Classification Service (reference)")

    class IncidentRequest(BaseModel):
        text: str

    class IncidentResponse(BaseModel):
        category: str
        severity_score: int
        is_suspicious: bool
        confidence: str = "medium"
        signals: Dict[str, bool] = {}
        reasoning: str = ""

    @app.post("/classify", response_model=IncidentResponse)
    async def classify_incident_endpoint(request: IncidentRequest) -> IncidentResponse:
        result = classify_incident(request.text)
        return IncidentResponse(**result)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        # CLI: python main.py "some incident text"
        print(json.dumps(classify_incident(" ".join(sys.argv[1:])), indent=2))
    elif uvicorn is not None:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    else:
        print("uvicorn not installed; pass an incident text as an argument to classify it.")
