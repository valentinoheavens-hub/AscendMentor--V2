// ─────────────────────────────────────────────────────────────────────────────
// Clarity Assessment™ — 30 Canonical Questions
// Source: ascendmentor_clarity_assessment.html — BGC proprietary instrument
// ─────────────────────────────────────────────────────────────────────────────

export interface AssessmentOption {
  score: 4 | 3 | 2 | 1 | 0;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  dimension_id: string;
  question: string;
  options: [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ── STRATEGIC DIRECTION (6 questions, max 24) ────────────────────────────
  {
    id: 'sd_q1',
    dimension_id: 'strategic_direction',
    question: 'When someone asks what your organisation stands for, how do you respond?',
    options: [
      { score: 4, text: 'I have a sharp, consistent answer I can give in 30 seconds' },
      { score: 3, text: 'I have a general sense but the words come out differently each time' },
      { score: 2, text: 'I usually say something about our services or products, not our purpose' },
      { score: 1, text: 'I struggle to give a clear answer' },
      { score: 0, text: 'I have not seriously thought about this question' },
    ],
  },
  {
    id: 'sd_q2',
    dimension_id: 'strategic_direction',
    question: 'How clearly are your top three strategic priorities defined for the next 12 months?',
    options: [
      { score: 4, text: 'Written, communicated, and tracked — everyone knows them' },
      { score: 3, text: 'Defined in my head but not formally documented or shared' },
      { score: 2, text: 'We have a list of priorities but too many to be useful' },
      { score: 1, text: 'Priorities shift frequently depending on what comes up' },
      { score: 0, text: 'We operate mostly reactively with no defined priorities' },
    ],
  },
  {
    id: 'sd_q3',
    dimension_id: 'strategic_direction',
    question: 'How well does your team understand the direction you are taking the organisation?',
    options: [
      { score: 4, text: 'Extremely well — they can explain it to others independently' },
      { score: 3, text: 'Most people understand it at a general level' },
      { score: 2, text: 'There is some understanding but also confusion and mixed messages' },
      { score: 1, text: 'Most people are focused on their tasks and not the bigger direction' },
      { score: 0, text: 'Direction is something I carry alone' },
    ],
  },
  {
    id: 'sd_q4',
    dimension_id: 'strategic_direction',
    question: 'When you make a major decision, how do you evaluate whether it is aligned with your strategy?',
    options: [
      { score: 4, text: 'I test it against documented strategic criteria before deciding' },
      { score: 3, text: 'I intuitively sense whether it fits — rarely write it down' },
      { score: 2, text: 'Alignment to strategy is secondary to urgency or opportunity' },
      { score: 1, text: 'Most decisions are made based on what is available or pressing' },
      { score: 0, text: 'I do not have a clear enough strategy to test decisions against' },
    ],
  },
  {
    id: 'sd_q5',
    dimension_id: 'strategic_direction',
    question: 'How would you describe the gap between where you are and where you want to be?',
    options: [
      { score: 4, text: 'Small and closing — I have a clear plan bridging the gap' },
      { score: 3, text: 'Visible and mapped — I know the gap and what is needed' },
      { score: 2, text: 'I can feel the gap but cannot fully define it' },
      { score: 1, text: 'The gap is large and the path unclear' },
      { score: 0, text: 'I am not sure what "where I want to be" looks like' },
    ],
  },
  {
    id: 'sd_q6',
    dimension_id: 'strategic_direction',
    question: 'How frequently do you revisit and update your organisational strategy?',
    options: [
      { score: 4, text: 'Quarterly reviews with documented updates' },
      { score: 3, text: 'Annually or when a major change happens' },
      { score: 2, text: 'Irregularly — when things feel off track' },
      { score: 1, text: 'Rarely — the strategy has not changed in years' },
      { score: 0, text: 'We do not have a formal strategy to revisit' },
    ],
  },

  // ── PEOPLE CLARITY (5 questions, max 20) ────────────────────────────────
  {
    id: 'pc_q1',
    dimension_id: 'people_clarity',
    question: 'How clearly defined are the roles and responsibilities of your key team members?',
    options: [
      { score: 4, text: 'Documented, agreed, and actively referenced' },
      { score: 3, text: 'Informally understood but not written down' },
      { score: 2, text: 'Some clarity exists but overlap and confusion are common' },
      { score: 1, text: 'Roles blur frequently — people are unsure who owns what' },
      { score: 0, text: 'Roles are assigned ad hoc with no clear structure' },
    ],
  },
  {
    id: 'pc_q2',
    dimension_id: 'people_clarity',
    question: "How aligned is your leadership team around the organisation's direction and values?",
    options: [
      { score: 4, text: 'Deeply aligned — we resolve differences constructively and move together' },
      { score: 3, text: 'Generally aligned with occasional friction on priorities' },
      { score: 2, text: 'Surface alignment but underlying tensions affect decisions' },
      { score: 1, text: 'Misalignment is frequent and slows execution' },
      { score: 0, text: 'There is no real leadership team — I carry direction alone' },
    ],
  },
  {
    id: 'pc_q3',
    dimension_id: 'people_clarity',
    question: 'How confident are you that the right people are in the right roles in your organisation?',
    options: [
      { score: 4, text: 'Very confident — roles match strengths and the evidence supports it' },
      { score: 3, text: 'Mostly confident with one or two known mismatches I am addressing' },
      { score: 2, text: 'Some doubt — loyalty or habit has influenced some role assignments' },
      { score: 1, text: 'Several people are in roles they are not suited for' },
      { score: 0, text: 'I have not seriously evaluated person-role fit' },
    ],
  },
  {
    id: 'pc_q4',
    dimension_id: 'people_clarity',
    question: 'How effectively does your organisation handle accountability when results fall short?',
    options: [
      { score: 4, text: 'Clearly and consistently — with documented expectations and follow-through' },
      { score: 3, text: 'Fairly well but inconsistently applied across different people' },
      { score: 2, text: 'Accountability conversations happen but are uncomfortable and rare' },
      { score: 1, text: 'Poor performance is usually tolerated or avoided' },
      { score: 0, text: 'There is no accountability culture — things just slide' },
    ],
  },
  {
    id: 'pc_q5',
    dimension_id: 'people_clarity',
    question: 'How well does your organisation develop its people intentionally?',
    options: [
      { score: 4, text: 'Structured learning paths exist and development is tracked' },
      { score: 3, text: 'Ad hoc development happens but no systematic approach' },
      { score: 2, text: 'Development only happens when someone asks for it' },
      { score: 1, text: 'We are too busy executing to focus on development' },
      { score: 0, text: 'People development is not a current priority' },
    ],
  },

  // ── SYSTEMS & PROCESSES (5 questions, max 20) ────────────────────────────
  {
    id: 'sp_q1',
    dimension_id: 'systems_processes',
    question: 'How well-documented are your core operating processes?',
    options: [
      { score: 4, text: 'Fully documented SOPs that are regularly updated and followed' },
      { score: 3, text: 'Key processes are documented but coverage is incomplete' },
      { score: 2, text: 'Some documentation exists but it is outdated or not used' },
      { score: 1, text: "Most processes exist only in people's heads" },
      { score: 0, text: 'We do not have documented processes' },
    ],
  },
  {
    id: 'sp_q2',
    dimension_id: 'systems_processes',
    question: 'How dependent is your organisation on you personally to function day-to-day?',
    options: [
      { score: 4, text: 'The organisation runs effectively without my daily involvement' },
      { score: 3, text: 'It functions but key decisions still flow through me too often' },
      { score: 2, text: 'I am involved in most significant activities daily' },
      { score: 1, text: 'The organisation largely stops or slows when I am unavailable' },
      { score: 0, text: 'I am the organisation — everything depends on me' },
    ],
  },
  {
    id: 'sp_q3',
    dimension_id: 'systems_processes',
    question: 'How effectively does your organisation use technology and tools to drive efficiency?',
    options: [
      { score: 4, text: 'Intentionally selected tools that are well-integrated and used consistently' },
      { score: 3, text: 'Good tools in use but not fully integrated or consistently adopted' },
      { score: 2, text: 'A mix of tools that were added reactively without a clear system' },
      { score: 1, text: 'Minimal technology — most work is manual' },
      { score: 0, text: 'Technology is a pain point we have not solved' },
    ],
  },
  {
    id: 'sp_q4',
    dimension_id: 'systems_processes',
    question: 'How consistently is quality maintained in your deliverables and client experience?',
    options: [
      { score: 4, text: 'Very consistently — quality standards are defined and monitored' },
      { score: 3, text: 'Generally good but quality varies depending on who delivers' },
      { score: 2, text: 'Quality is inconsistent and client experience varies' },
      { score: 1, text: 'Quality issues are frequent and affect our reputation' },
      { score: 0, text: 'Quality control is something we have not formally addressed' },
    ],
  },
  {
    id: 'sp_q5',
    dimension_id: 'systems_processes',
    question: 'How quickly and effectively does your organisation learn from mistakes and adapt?',
    options: [
      { score: 4, text: 'Rapidly — we debrief, document lessons, and update our systems' },
      { score: 3, text: 'We learn but adaptation is slow and rarely documented' },
      { score: 2, text: 'We acknowledge mistakes but rarely change our approach systematically' },
      { score: 1, text: 'The same mistakes recur because we do not have a learning mechanism' },
      { score: 0, text: 'Mistakes are usually attributed to individuals rather than examined systemically' },
    ],
  },

  // ── STRUCTURAL CLARITY (5 questions, max 20) ────────────────────────────
  {
    id: 'sc_q1',
    dimension_id: 'structural_clarity',
    question: 'How clearly does your organisational structure reflect your strategic priorities?',
    options: [
      { score: 4, text: 'Tightly aligned — structure was deliberately designed for strategy' },
      { score: 3, text: 'Reasonably aligned but some legacy structures remain' },
      { score: 2, text: 'Structure has grown organically and does not fully serve the strategy' },
      { score: 1, text: 'Structure is unclear and has not been formally designed' },
      { score: 0, text: 'We have not thought about structure in relation to strategy' },
    ],
  },
  {
    id: 'sc_q2',
    dimension_id: 'structural_clarity',
    question: 'How effective are your decision-making processes?',
    options: [
      { score: 4, text: 'Clear decision rights exist at each level — fast and accountable' },
      { score: 3, text: 'Most decisions are made reasonably well with some bottlenecks' },
      { score: 2, text: 'Decision-making is slow — too much escalation or avoidance' },
      { score: 1, text: 'Decisions are inconsistent and often revisited' },
      { score: 0, text: 'Decision-making is a significant weakness of our organisation' },
    ],
  },
  {
    id: 'sc_q3',
    dimension_id: 'structural_clarity',
    question: 'How well-designed is your revenue generation model?',
    options: [
      { score: 4, text: 'Multi-channel, documented, and predictably delivering results' },
      { score: 3, text: 'Working but heavily reliant on one channel or a few relationships' },
      { score: 2, text: 'Inconsistent — revenue comes but the system behind it is unclear' },
      { score: 1, text: 'Revenue is largely reactive and unpredictable' },
      { score: 0, text: 'Revenue model needs to be fundamentally rethought' },
    ],
  },
  {
    id: 'sc_q4',
    dimension_id: 'structural_clarity',
    question: 'How prepared is your organisation to scale to the next level?',
    options: [
      { score: 4, text: 'Ready — the infrastructure, team, and systems can absorb growth' },
      { score: 3, text: 'Mostly ready with a few gaps I am actively addressing' },
      { score: 2, text: 'Not ready — growth would strain what we have' },
      { score: 1, text: 'We would need to rebuild significant parts to scale' },
      { score: 0, text: 'Scale readiness has not been evaluated' },
    ],
  },
  {
    id: 'sc_q5',
    dimension_id: 'structural_clarity',
    question: 'How clearly defined are the governance structures in your organisation?',
    options: [
      { score: 4, text: 'Board or advisory structures are in place with clear mandates' },
      { score: 3, text: 'Some governance exists but informally and inconsistently applied' },
      { score: 2, text: 'Governance is minimal — accountability sits primarily with founders' },
      { score: 1, text: 'There is essentially no governance structure' },
      { score: 0, text: 'Governance is something we have not addressed' },
    ],
  },

  // ── LEADERSHIP MASTERY (5 questions, max 20) ────────────────────────────
  {
    id: 'lm_q1',
    dimension_id: 'leadership_mastery',
    question: 'How clearly defined is your personal leadership philosophy?',
    options: [
      { score: 4, text: 'Articulated, documented, and consciously practised' },
      { score: 3, text: 'Developed through experience but not formally articulated' },
      { score: 2, text: 'I know what kind of leader I want to be but I do not always act on it' },
      { score: 1, text: 'My leadership style is largely reactive to situations' },
      { score: 0, text: 'I have not seriously defined my leadership philosophy' },
    ],
  },
  {
    id: 'lm_q2',
    dimension_id: 'leadership_mastery',
    question: 'How effectively do you manage your own energy, focus, and decision-making under pressure?',
    options: [
      { score: 4, text: 'Very effectively — I have deliberate practices that sustain my performance' },
      { score: 3, text: 'Fairly well — I manage pressure reasonably but inconsistently' },
      { score: 2, text: 'Pressure often affects my clarity and quality of decisions' },
      { score: 1, text: 'I frequently operate depleted and this affects my leadership' },
      { score: 0, text: 'Self-management is a significant personal challenge' },
    ],
  },
  {
    id: 'lm_q3',
    dimension_id: 'leadership_mastery',
    question: 'How consistently do you invest in your own learning and development?',
    options: [
      { score: 4, text: 'Systematically — structured learning is a non-negotiable in my schedule' },
      { score: 3, text: 'Regularly but informally — I read and learn opportunistically' },
      { score: 2, text: 'Occasionally when something specific comes up' },
      { score: 1, text: 'Rarely — execution leaves little room for personal development' },
      { score: 0, text: 'I have largely stopped investing in my own growth' },
    ],
  },
  {
    id: 'lm_q4',
    dimension_id: 'leadership_mastery',
    question: 'How aware are you of the specific gaps or blind spots limiting your leadership effectiveness?',
    options: [
      { score: 4, text: 'Highly aware — I have sought feedback and work on these intentionally' },
      { score: 3, text: 'Reasonably aware with some clarity on what to work on' },
      { score: 2, text: 'I sense there are gaps but have not named or addressed them' },
      { score: 1, text: 'I receive little feedback and am uncertain what my blind spots are' },
      { score: 0, text: 'I have not actively sought this kind of self-awareness' },
    ],
  },
  {
    id: 'lm_q5',
    dimension_id: 'leadership_mastery',
    question: 'How well does your daily behaviour reflect the leader you aspire to be?',
    options: [
      { score: 4, text: 'Very consistently — the gap between aspiration and action is small' },
      { score: 3, text: 'Mostly aligned with occasional drift under stress or pressure' },
      { score: 2, text: 'A visible gap exists between who I aspire to be and how I show up' },
      { score: 1, text: 'The gap is large and growing' },
      { score: 0, text: 'I have not seriously examined this question' },
    ],
  },
];

export const TOTAL_QUESTIONS = ASSESSMENT_QUESTIONS.length; // 30
export const MAX_TOTAL_SCORE = 104; // 24 + 20 + 20 + 20 + 20
