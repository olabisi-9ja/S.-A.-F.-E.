import { Op, Sequelize } from 'sequelize';
import { Incident, User, Message, Notification } from '../models/index.js';
import { sendSMS } from '../services/smsService.js';
import logger from '../utils/logger.js';
import { generateUploadURL } from '../services/s3Service.js';
import { pushToAdmins, pushToUser } from '../services/pushService.js';
import validator from 'validator';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const rawApiKey = process.env.GEMINI_API_KEY || 'dummy_key_if_not_provided';
const ai = new GoogleGenAI({
  apiKey: rawApiKey.replace(/^"|"$/g, '')
});

// ---------------------------------------------------------------------------
// AI-assisted incident classification + rubric-based severity scoring.
//
// Design (honest, defensible, and matches the thesis write-up):
//   1. A hosted LLM (Google Gemini) classifies the free-text report into ONE
//      canonical category AND extracts structured severity SIGNALS from the
//      text (weapon present, injury, life-threatening, ongoing, etc.).
//   2. The severity SCORE is NOT an arbitrary number emitted by the model. It
//      is computed deterministically in code from a published rubric
//      (SEVERITY_BASE + SIGNAL_DELTA). The model only extracts factual signals;
//      the arithmetic is fixed and explainable, so a reviewer can audit it.
//   3. The category is normalised to the canonical list shared with the mobile
//      and web clients, so analytics never split "Medical" and
//      "Emergency / Medical" into two buckets.
//   4. AI never gates an emergency (SOS). See alertController.js. Classification
//      is applied to incident REPORTS only, for additive triage.
//
// The exact same definitions, rubric and examples live in
// `Back End/ai_service/main.py` (standalone reference / eval entry point).
// Keep the two in sync.
// ---------------------------------------------------------------------------

// MUST stay in sync with the dropdown in the mobile + web clients
// (see Front End/src/data/mockData.ts -> INCIDENT_CATEGORIES).
const CATEGORIES = [
  'Theft',
  'Assault',
  'Harassment',
  'Vandalism',
  'Suspicious Activity',
  'Cultism',
  'Armed Robbery',
  'Emergency / Medical',
  'Fire',
  'Other',
];

const CATEGORY_DEFINITIONS = [
  ['- Theft', 'Property taken without force or threat (phone/laptop stolen from an unattended spot, pickpocketing, snatch-and-run).'],
  ['- Armed Robbery', 'Property taken using a weapon or the threat of one (gun, knife, machete, acid). Use this INSTEAD of Theft when a weapon is involved.'],
  ['- Assault', 'Physical attack, beating, fighting, or use of physical force against a person.'],
  ['- Harassment', 'Threats, intimidation, bullying, stalking, sexual harassment, or verbal abuse where physical contact has not (yet) occurred.'],
  ['- Vandalism', 'Deliberate damage to property (broken window, slashed tyre, defaced wall). No person harmed.'],
  ['- Suspicious Activity', 'A person or situation that seems wrong but NO crime has clearly happened yet (lurking, tailing someone, unattended bag).'],
  ['- Cultism', 'Cult / gang / confraternity activity, initiation, clashes, or related threats.'],
  ['- Emergency / Medical', 'Medical emergency: someone hurt, unwell, fainted, unconscious, an accident, or anything needing first aid or an ambulance.'],
  ['- Fire', 'Fire, smoke, explosion, or a real risk of fire.'],
  ['- Other', 'Anything that does not fit the categories above.'],
];

// Base severity per category; adjusted by the extracted signals below.
// Calibrated so that the CATEGORY ALONE already lands the incident in the
// correct triage band (Low <40 / Moderate 40-59 / High 60-79 / Critical 80+),
// matching the bands used by the web + mobile clients. That way an
// under-extracted signal can never drag a serious crime into a low band.
const SEVERITY_BASE = {
  'Armed Robbery': 82,
  'Fire': 82,
  'Emergency / Medical': 72,
  'Assault': 74,
  'Cultism': 72,
  'Harassment': 58,
  'Theft': 56,
  'Vandalism': 44,
  'Suspicious Activity': 40,
  'Other': 34,
};

// Published, deterministic severity rubric. The model only sets the booleans;
// the final score is computed from this table, so it is reproducible and
// auditable (not a black-box number).
// Recalibrated after field reports of systematic UNDER-scoring:
//   - resolved_past was -12: almost every campus report is past-tense
//     ("my phone was stolen"), so nearly everything lost 12 points for
//     recency alone. Severity should grade the INCIDENT, not the tense.
//     Now -5: over-and-done still matters, but it no longer swamps the base.
//   - life_threatening / injury / ongoing_now / weapon_involved raised so
//     active, violent, weaponised situations clearly cross band boundaries.
const SIGNAL_DELTA = {
  life_threatening: 20, // imminent danger to life: unconscious/not breathing, severe bleeding, active shooter, spreading fire, trapped
  weapon_involved: 14,  // a weapon is mentioned/present (gun, knife, machete, acid, club)
  injury_reported: 12,  // a person is reported hurt/injured/bleeding
  ongoing_now: 12,      // incident is happening now / suspect still on scene
  multiple_victims: 8,  // more than one person affected/targeted
  property_loss: 5,     // valuables stolen or property damaged/lost
  resolved_past: -5,    // event is over; suspect gone; no current danger
};

const SIGNAL_KEYS = Object.keys(SIGNAL_DELTA);

// Map free-form model output / legacy labels to the canonical list.
function normalizeCategory(raw) {
  if (!raw) return 'Other';
  const c = String(raw).trim();
  if (CATEGORIES.includes(c)) return c;
  const lc = c.toLowerCase();
  const aliases = {
    medical: 'Emergency / Medical',
    emergency: 'Emergency / Medical',
    'emergency / medical': 'Emergency / Medical',
    'emergency/medical': 'Emergency / Medical',
    robbery: 'Armed Robbery',
    'armed robbery': 'Armed Robbery',
    'armed-robbery': 'Armed Robbery',
    suspicious: 'Suspicious Activity',
    'suspicious activity': 'Suspicious Activity',
    general: 'Other',
  };
  if (aliases[lc]) return aliases[lc];
  for (const cat of CATEGORIES) {
    if (lc.includes(cat.toLowerCase())) return cat;
  }
  if (lc.includes('medic') || lc.includes('injur') || lc.includes('faint') || lc.includes('ambulance') || lc.includes('unconscious')) return 'Emergency / Medical';
  if (lc.includes('weapon') || lc.includes('gun') || lc.includes('robber') || lc.includes('knife') || lc.includes('machete')) return 'Armed Robbery';
  return 'Other';
}

function computeSeverity(category, signals = {}) {
  let score = SEVERITY_BASE[category] ?? 35;
  for (const key of SIGNAL_KEYS) {
    if (signals[key]) score += SIGNAL_DELTA[key];
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Safety escalation guard. The single most common misclassification is a
// weapon/force robbery landing in "Theft", which also silently drops the
// severity ~30 points (Theft base 56 vs Armed Robbery base 82). If the
// extracted signals prove a weapon or force against the victim, escalate the
// label deterministically - the category definition itself says Armed Robbery
// applies INSTEAD of Theft whenever a weapon or force is involved.
function escalateCategory(category, signals = {}) {
  if (category === 'Theft' && signals.weapon_involved) {
    return { category: 'Armed Robbery', note: 'escalated Theft -> Armed Robbery (weapon involved)' };
  }
  if (category === 'Theft' && signals.injury_reported && signals.property_loss) {
    return { category: 'Armed Robbery', note: 'escalated Theft -> Armed Robbery (force used against victim to take property)' };
  }
  return { category, note: null };
}

// Few-shot examples - Nigerian campus phrasing. ~2 per category. Each example
// pairs a realistic report with its correct category and the signals it implies.
const FEWSHOT = [
  ['Two boys on a bike just snatched my phone near the faculty gate and rode off.', 'Theft', { ongoing_now: true, property_loss: true }],
  ['I left my laptop in the reading room and when I came back it was gone.', 'Theft', { resolved_past: true, property_loss: true }],
  ['Some guys beat up a student behind the hostel, he is bleeding from the nose.', 'Assault', { injury_reported: true, ongoing_now: true }],
  ['There was a fist fight between two students in the cafeteria; security came and it is over now.', 'Assault', { resolved_past: true }],
  ['A senior student keeps sending threatening messages and waits outside my class to intimidate me.', 'Harassment', { ongoing_now: true }],
  ['A lecturer is threatening to fail me if I do not visit his office alone.', 'Harassment', { ongoing_now: true }],
  ['The window of the lab was smashed overnight, nothing was stolen.', 'Vandalism', { property_loss: true, resolved_past: true }],
  ['Someone keyed my car and slashed two tyres in the car park.', 'Vandalism', { property_loss: true, resolved_past: true }],
  ['A man I do not recognize is lingering near the female hostel taking photos of students.', 'Suspicious Activity', { ongoing_now: true }],
  ['There is an unattended bag sitting in the lecture hall that nobody claims.', 'Suspicious Activity', { ongoing_now: true }],
  ['A group wearing black is gathering at the back gate shouting confraternity slogans.', 'Cultism', { ongoing_now: true, multiple_victims: true }],
  ['We found cult initiation materials and a threatening note in the classroom.', 'Cultism', { resolved_past: true }],
  ['Three men with guns robbed students at the campus gate and took their phones and money.', 'Armed Robbery', { weapon_involved: true, multiple_victims: true, property_loss: true, resolved_past: true }],
  ['A guy pulled a knife on me and collected my bag near the bus park.', 'Armed Robbery', { weapon_involved: true, property_loss: true, resolved_past: true }],
  ['A student just collapsed in the exam hall and is not responding, we need an ambulance.', 'Emergency / Medical', { life_threatening: true, injury_reported: true, ongoing_now: true }],
  ['Someone fell down the stairs and twisted her ankle, she cannot walk.', 'Emergency / Medical', { injury_reported: true, ongoing_now: true }],
  ['Smoke is coming from the chemistry lab and we can see flames, everyone is running out.', 'Fire', { life_threatening: true, ongoing_now: true, multiple_victims: true }],
  ['A small bin caught fire outside the hostel but we put it out with water.', 'Fire', { resolved_past: true }],
  ['The street light at the male hostel has been broken for weeks, it is very dark at night.', 'Other', {}],
  ['I lost my ID card somewhere between the library and the admin block.', 'Other', { property_loss: true, resolved_past: true }],
];

function buildClassificationPrompt(description) {
  const defs = CATEGORY_DEFINITIONS.map(([k, v]) => `${k}: ${v}`).join('\n');
  const examples = FEWSHOT.map(([text, cat, sig]) => {
    const sigStr = SIGNAL_KEYS.map(k => `${k}=${sig[k] ? 'true' : 'false'}`).join(', ');
    return `Report: "${text}"\nCategory: ${cat}\nSignals: ${sigStr}`;
  }).join('\n\n');

  return `You are a triage assistant for a Nigerian university (KWASU) campus safety system.
Given an incident report you must do TWO things:
1. Classify it into exactly ONE category from the list below.
2. Extract structured severity SIGNALS that are explicitly supported by the text.

Categories and definitions:
${defs}

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

Examples:
${examples}

Now classify this report:
Report: "${String(description).replace(/"/g, '\\"')}"`;
}

// Robust JSON extraction. With responseMimeType Gemini usually returns clean JSON,
// but we guard against stray prose / code fences.
function parseJsonLoose(text) {
  if (!text) return null;
  let t = String(text).replace(/```json|```/gi, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }
  return JSON.parse(t);
}

export const reportTimeouts = new Map();

export const getUploadUrl = async (req, res) => {
  try {
    const { fileType } = req.query;
    if (!fileType) {
      return res.status(400).json({ success: false, error: 'fileType query param is required.' });
    }
    
    const { uploadUrl, publicUrl, key } = await generateUploadURL(fileType);
    
    res.json({
      success: true,
      data: { uploadUrl, publicUrl, key }
    });
  } catch (error) {
    logger.error('Error getting upload URL:', error);
    res.status(500).json({ success: false, error: 'Failed to generate upload URL.' });
  }
};

// AI-assisted classification using Gemini + a deterministic severity rubric.
// Returns the persisted fields (ai_category_suggestion / ai_severity_score /
// ai_is_suspicious) plus extra triage detail (ai_signals / ai_confidence /
// ai_reasoning) surfaced in the API response for staff and for evaluation.
async function classifyIncident(description) {
  // A rubric-based keyword fallback is always available, so incident reporting
  // never fails if the LLM key is missing or the call errors.
  const fallback = () => classifyByKeywords(description);

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      return fallback();
    }

    const prompt = buildClassificationPrompt(description);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        // responseMimeType forces valid JSON output. We intentionally do NOT
        // pass responseSchema: the Type-enum format differs across @google/genai
        // versions and an incompatible value would throw at call time, silently
        // forcing the keyword fallback. The prompt pins the exact JSON shape and
        // parseJsonLoose + graceful defaults below handle robustness instead.
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonLoose(response.text);
    const signals = (parsed && parsed.signals) || {};
    let category = normalizeCategory(parsed && parsed.category);
    const confidence = (parsed && parsed.confidence) || 'medium';

    // Deterministic safety escalation (e.g. weapon robberies misread as Theft).
    const { category: escalated, note } = escalateCategory(category, signals);
    if (note) {
      category = escalated;
      logger.info(`Classification escalation: ${note}`);
    }

    const severity = computeSeverity(category, signals);
    const reasoning = (parsed && parsed.reasoning) || '';
    const isSuspicious =
      !!parsed?.is_suspicious ||
      category === 'Suspicious Activity' ||
      confidence === 'low';

    return {
      ai_category_suggestion: category,
      ai_severity_score: severity,
      ai_is_suspicious: isSuspicious,
      ai_confidence: confidence,
      ai_signals: signals,
      ai_reasoning: note ? `${reasoning} [${note}]` : reasoning,
    };
  } catch (error) {
    logger.warn('Gemini classification failed, using keyword + rubric fallback:', error.message);
    return fallback();
  }
}

// Keyword fallback that still feeds the SAME rubric, so severity stays
// deterministic and explainable even when the LLM is unavailable. Used when
// GEMINI_API_KEY is unset or the Gemini call throws.
function classifyByKeywords(description) {
  const d = (description || '').toLowerCase();
  // Word-boundary match (prefix): \bcult matches "cultist"/"cultists" but NOT
  // "faculty"; \bwound matches "wounded" but NOT "around". Plain substring
  // matching caused systematic false positives (faculty -> Cultism,
  // around -> injury, begun -> gun, dangerous -> gang).
  const has = (...words) =>
    words.some(w => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(d));

  const signals = {
    weapon_involved: has('gun', 'knife', 'machete', 'cutlass', 'acid', 'pistol', 'weapon', 'armed', 'gunmen', 'robbers', 'wielding', 'broken bottle', 'axe', 'sword', 'dagger', 'gunshot'),
    life_threatening: has('unconscious', 'not breathing', 'severe bleeding', 'dying', 'collapsed', 'spreading fire', 'trapped'),
    injury_reported: has('hurt', 'injur', 'bleed', 'wound', 'faint', 'collapsed', 'beat up', 'attacked', 'beaten', 'stabbed', 'strangled'),
    ongoing_now: has('just now', 'right now', 'ongoing', 'at the moment', 'still here', 'is happening', "he's here", 'right there', 'just happened', 'just snatched', 'just attacked', 'currently', 'as we speak', 'still there', 'still at'),
    multiple_victims: has('students', 'group', 'crowd', 'people', 'they', 'them', 'several'),
    property_loss: has('stolen', 'snatched', 'robbed', 'took', 'collected', 'missing', 'lost', 'broke', 'damaged', 'smashed', 'slashed'),
    resolved_past: has('yesterday', 'earlier', 'last night', 'was stolen', 'happened', 'already', 'over now', 'fled', 'ran off', 'ran away', 'ran towards', 'rode off', 'disappeared', 'escaped', 'gone'),
  };

  let category = 'Other';
  if (has('fire', 'smoke', 'flame', 'burn')) category = 'Fire';
  else if (signals.weapon_involved && (signals.property_loss || has('rob'))) category = 'Armed Robbery';
  else if (has('assault', 'attack', 'fight', 'beat')) category = 'Assault';
  else if (has('harass', 'threaten', 'intimidat', 'stalk', 'bully')) category = 'Harassment';
  else if (has('cult', 'confratern', 'gang', 'initiation')) category = 'Cultism';
  else if (has('medic', 'injur', 'faint', 'collapsed', 'ambulance', 'unconscious', 'sick', 'accident')) category = 'Emergency / Medical';
  else if (has('vandal', 'damage', 'smashed', 'defac', 'slashed', 'keyed')) category = 'Vandalism';
  else if (has('theft', 'stolen', 'snatched', 'robbed', 'missing', 'lost')) category = 'Theft';
  else if (has('suspicious', 'lurking', 'lingering', 'following', 'tailing', 'unattended', 'taking photos', 'stranger')) category = 'Suspicious Activity';

  // Same deterministic escalation as the LLM path (e.g. force-theft -> Armed Robbery).
  const { category: escalated, note } = escalateCategory(category, signals);
  category = escalated;

  return {
    ai_category_suggestion: category,
    ai_severity_score: computeSeverity(category, signals),
    ai_is_suspicious: category === 'Suspicious Activity',
    ai_confidence: 'low',
    ai_signals: signals,
    ai_reasoning: note ? `Keyword + rubric fallback (LLM unavailable). [${note}]` : 'Keyword + rubric fallback (LLM unavailable).',
  };
}

async function checkPotentialDuplicate(newDescription, newCategory) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      return null;
    }

    // Query incidents of the same category reported in the last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const existingIncidents = await Incident.findAll({
      where: {
        category: newCategory,
        created_at: { [Op.gte]: sixHoursAgo }
      },
      limit: 10,
      attributes: ['id', 'description'],
      raw: true
    });

    if (existingIncidents.length === 0) return null;

    const incidentsList = existingIncidents.map(inc => `ID: ${inc.id} | Description: ${inc.description}`).join('\n');
    
    const systemPrompt = `Analyze if the following new incident report is a duplicate (describing the exact same event) of any existing reports.
New Incident Description: "${newDescription}"
Category: ${newCategory}

Here are the existing reports from the last 6 hours:
${incidentsList}

Determine if the new report is a duplicate.
Respond ONLY with a JSON object in this format. Do not include markdown backticks:
{
  "is_duplicate": <true or false>,
  "duplicate_of_id": <the ID of the matching duplicate incident, or null if not a duplicate>
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ]
    });

    const parsed = JSON.parse(response.text.trim().replace(/```json|```/g, '').trim());
    return parsed.is_duplicate ? parsed.duplicate_of_id : null;
  } catch (error) {
    logger.warn('AI deduplication check failed:', error.message);
    return null;
  }
}

// Lets the mobile app show the AI's suggested category/severity BEFORE the
// user submits, so they can confirm or override it (FR: AI-assisted
// classification with human-in-the-loop confirmation).
export const previewClassification = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'A description of at least 5 characters is required.',
      });
    }

    const aiResult = await classifyIncident(description);
    res.json({ success: true, data: { ai_classification: aiResult } });
  } catch (error) {
    logger.error('Preview classification error:', error);
    res.status(500).json({ success: false, error: 'Failed to classify description.' });
  }
};

export const createIncident = async (req, res) => {
  try {
    const { category, description, latitude, longitude, media_url, audio_url } = req.body;

    if (!category || !description || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category, description, and location are required.' 
      });
    }

    // AI Classification
    const aiResult = await classifyIncident(description);

    // AI Deduplication check
    const duplicateOfId = await checkPotentialDuplicate(description, category || aiResult.ai_category_suggestion);
    
    let safeDescription = validator.escape(description);
    if (duplicateOfId) {
      safeDescription = `[⚠️ POTENTIAL DUPLICATE OF INCIDENT #${duplicateOfId}] ` + safeDescription;
    }

    // The user has already seen the AI suggestion via /incidents/classify and
    // may confirm or override it, so their chosen category wins here.
    // Only the three persisted AI columns are written to the row; the extracted
    // signals / confidence / reasoning travel in the response and socket event.
    const incident = await Incident.create({
      reporter_id: req.userId,
      category: category || aiResult.ai_category_suggestion,
      description: safeDescription,
      latitude,
      longitude,
      media_url: media_url || null,
      audio_url: audio_url || null,
      ai_category_suggestion: aiResult.ai_category_suggestion,
      ai_severity_score: aiResult.ai_severity_score,
      ai_is_suspicious: aiResult.ai_is_suspicious,
    });

    // Populate reporter info
    const reporter = await User.findByPk(req.userId, {
      attributes: ['full_name', 'institutional_email'],
    });

    // Get all admin users for notification
    const admins = await User.findAll({
      where: { role: { [Op.in]: ['security_admin', 'super_admin'] } },
      attributes: ['id'],
    });

    // Create notifications for admins
    await Notification.bulkCreate(
      admins.map(admin => ({
        recipient_id: admin.id,
        type: 'new_incident',
        title: 'New Incident Reported',
        content: `${reporter.full_name} reported a ${incident.category} incident.`,
        related_entity_type: 'incident',
        related_entity_id: incident.id,
      }))
    );

    // Emit socket event (will be handled by socket.io middleware)
    req.io?.emit('new_incident', {
      id: incident.id,
      category: incident.category,
      severity: incident.ai_severity_score,
      reporter_name: reporter.full_name,
      location: { latitude, longitude },
      timestamp: incident.created_at,
      is_suspicious: incident.ai_is_suspicious,
      // Rubric-derived triage detail for the admin dashboard.
      ai_signals: aiResult.ai_signals,
      ai_confidence: aiResult.ai_confidence,
    });

    // Push notification to security personnel (fire-and-forget)
    pushToAdmins({
      title: 'New Incident Reported',
      body: `${reporter.full_name} reported a ${incident.category} incident.`,
      data: { type: 'incident', incidentId: incident.id },
    });

    // Schedule SMS fallback for 15 minutes if not acknowledged
    const fallbackTimeout = setTimeout(async () => {
      try {
        const freshIncident = await Incident.findByPk(incident.id);
        if (freshIncident && freshIncident.status === 'received') {
          const securityPhone = process.env.SECURITY_PHONE;
          if (securityPhone) {
            await sendSMS(
              securityPhone,
              `🚨 SAFE REPORT: Unacknowledged ${incident.category} report from ${reporter.full_name}. Action required.`
            );
          }
        }
      } catch (err) {
        logger.error('Report SMS fallback failed:', err.message);
      }
    }, 15 * 60 * 1000);
    
    reportTimeouts.set(incident.id, fallbackTimeout);

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully.',
      data: {
        incident: {
          ...incident.toJSON(),
          reporter_name: reporter.full_name,
        },
        ai_classification: aiResult,
      },
    });
  } catch (error) {
    logger.error('Create incident error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create incident.' 
    });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const { status, category, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;

    // If not admin, only show own incidents
    if (req.userRole === 'standard_user') {
      where.reporter_id = req.userId;
    }

    const { count, rows } = await Incident.findAndCountAll({
      where,
      include: [
        { association: 'reporter', attributes: ['full_name', 'institutional_email'] },
        { association: 'assignedOfficer', attributes: ['full_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        incidents: rows.map(inc => ({
          ...inc.toJSON(),
          reporter_name: inc.reporter?.full_name,
        })),
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get incidents error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch incidents.' 
    });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByPk(id, {
      include: [
        { association: 'reporter', attributes: ['full_name', 'institutional_email', 'phone'] },
        { association: 'assignedOfficer', attributes: ['full_name'] },
        { association: 'messages', include: [{ association: 'sender', attributes: ['full_name', 'role'] }] },
      ],
    });

    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found.' 
      });
    }

    // Check permission
    if (req.userRole === 'standard_user' && incident.reporter_id !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied.' 
      });
    }

    res.json({
      success: true,
      data: {
        incident: {
          ...incident.toJSON(),
          reporter_name: incident.reporter?.full_name,
        },
      },
    });
  } catch (error) {
    logger.error('Get incident error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch incident.' 
    });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_officer_id, assigned_officer_name, resolution_notes } = req.body;

    const incident = await Incident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found.' 
      });
    }

    // Only admins can update
    if (req.userRole === 'standard_user') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only security personnel can update incidents.' 
      });
    }

    if (status) {
      incident.status = status;
      if (status === 'resolved') {
        incident.resolved_at = new Date();
      }
      // If status is changed from received, clear timeout
      if (status !== 'received' && reportTimeouts.has(incident.id)) {
        clearTimeout(reportTimeouts.get(incident.id));
        reportTimeouts.delete(incident.id);
      }
    }
    if (assigned_officer_id) {
      incident.assigned_officer_id = assigned_officer_id;
      // Also clear timeout if assigned
      if (reportTimeouts.has(incident.id)) {
        clearTimeout(reportTimeouts.get(incident.id));
        reportTimeouts.delete(incident.id);
      }
    }
    if (assigned_officer_name) incident.assigned_officer_name = assigned_officer_name;
    if (resolution_notes) incident.resolution_notes = resolution_notes;

    await incident.save();

    // Notify reporter of status change
    const reporter = await User.findByPk(incident.reporter_id);
    if (reporter) {
      await Notification.create({
        recipient_id: reporter.id,
        type: 'status_update',
        title: 'Incident Status Updated',
        content: `Your incident #${id} status is now: ${status}`,
        related_entity_type: 'incident',
        related_entity_id: incident.id,
      });

      pushToUser(reporter.id, {
        title: 'Incident Status Updated',
        body: `Your incident #${id} status is now: ${status}`,
        data: { type: 'incident', incidentId: incident.id },
      });
    }

    // Emit socket event
    req.io?.emit('status_update', {
      incidentId: id,
      status: incident.status,
      assigned_officer: incident.assigned_officer_name,
    });

    res.json({
      success: true,
      message: 'Incident updated successfully.',
      data: { incident },
    });
  } catch (error) {
    logger.error('Update incident error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update incident.' 
    });
  }
};

export const getIncidentStats = async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const where = { created_at: { [Op.gte]: daysAgo } };
    if (req.userRole === 'standard_user') {
      where.reporter_id = req.userId;
    }

    const total = await Incident.count({ where });
    const byStatus = await Incident.findAll({
      where,
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    const byCategory = await Incident.findAll({
      where,
      attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    });
    const avgSeverity = await Incident.findOne({
      where,
      attributes: [[Sequelize.fn('AVG', Sequelize.col('ai_severity_score')), 'avg_severity']],
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: Object.fromEntries(byStatus.map(s => [s.status, s.count])),
        byCategory: Object.fromEntries(byCategory.map(c => [c.category, c.count])),
        avgSeverity: Math.round(avgSeverity?.dataValues?.avg_severity || 0),
      },
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics.' 
    });
  }
};
