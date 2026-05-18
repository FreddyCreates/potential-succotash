/**
 * Offline AGI Skill — Vigil AI
 * ─────────────────────────────────────────────────────────────────
 * Zero-network AGI-oriented reasoning tools. All functions run
 * entirely offline using structured knowledge and heuristics.
 *
 * Capabilities:
 *  1.  Chain-of-thought decomposer
 *  2.  Devil's advocate generator
 *  3.  Logical fallacy detector
 *  4.  Argument mapper
 *  5.  Decision matrix builder
 *  6.  Hypothesis generator (domain-aware)
 *  7.  Root cause analyzer (5-Whys)
 *  8.  SWOT analysis generator
 *  9.  Mental model library (50 models)
 * 10.  Bias detector
 * 11.  First-principles breakdown
 * 12.  Socratic questioning engine
 * 13.  Pre-mortem analysis
 * 14.  Inversion thinking
 * 15.  Abstraction ladder
 * 16.  Analogical reasoning
 * 17.  Second-order effects
 * 18.  Priority matrix (Eisenhower)
 * 19.  Assumption auditor
 * 20.  System dynamics summary
 */

/* ─────────────────────────────────────────────────────────────────
 *  CHAIN-OF-THOUGHT DECOMPOSER
 * ──────────────────────────────────────────────────────────────── */
export function chainOfThought(problem: string): string {
  return `🧠 CHAIN-OF-THOUGHT DECOMPOSITION\n\nProblem: "${problem}"\n\n` +
    `Step 1 — UNDERSTAND\n   What is being asked? What are the knowns and unknowns?\n   Known: ?\n   Unknown: ?\n   Constraints: ?\n\n` +
    `Step 2 — DECOMPOSE\n   Break the problem into sub-problems:\n   a) ?\n   b) ?\n   c) ?\n\n` +
    `Step 3 — SOLVE each sub-problem\n   a) Approach: → Result:\n   b) Approach: → Result:\n   c) Approach: → Result:\n\n` +
    `Step 4 — INTEGRATE\n   Combine sub-results into a coherent answer.\n\n` +
    `Step 5 — VERIFY\n   Does the solution address all constraints? Is it internally consistent?\n   Check: ?\n\n` +
    `Step 6 — REFLECT\n   What assumptions were made? What could go wrong? What's the confidence level?\n\n` +
    `💡 Tip: Fill in each step with real content about "${problem}" to complete the reasoning chain.`;
}

/* ─────────────────────────────────────────────────────────────────
 *  DEVIL'S ADVOCATE
 * ──────────────────────────────────────────────────────────────── */
export function devilsAdvocate(position: string): string {
  return `😈 DEVIL'S ADVOCATE — "${position}"\n\n` +
    `Strongest counterarguments:\n\n` +
    `1. 🎯 Empirical objection\n   What evidence contradicts this position? What studies/data fail to support it?\n\n` +
    `2. 🔄 Unintended consequences\n   What second-order effects could make this position backfire?\n\n` +
    `3. 🌍 Contextual failure\n   In what situations or contexts does this position clearly fail or not apply?\n\n` +
    `4. 💡 Opportunity cost\n   What better alternatives are being crowded out by committing to this position?\n\n` +
    `5. 🧪 Survivorship bias\n   Are the examples supporting this position selected because they survived, while failures were ignored?\n\n` +
    `6. 🏗️ Structural objection\n   What fundamental assumption must be true for this position to hold? Is that assumption valid?\n\n` +
    `7. 📊 Scale problem\n   Does this position break down at different scales (individual → group → society)?\n\n` +
    `8. ⏰ Temporal objection\n   Was this true historically but no longer true? Or might it stop being true?\n\n` +
    `Steelmanned counter-position:\n"[The strongest possible version of the opposing view]"`;
}

/* ─────────────────────────────────────────────────────────────────
 *  LOGICAL FALLACY DETECTOR
 * ──────────────────────────────────────────────────────────────── */
const FALLACIES: Array<{ name: string; regex: RegExp; desc: string; example: string }> = [
  { name: 'Ad Hominem',       regex: /you('re| are)|they('re| are)|he('s| is)|she('s| is).{0,40}(wrong|bad|stupid|idiot|fool|liar)/i, desc: 'Attacking the person instead of the argument.', example: '"You can\'t trust his economic views — he never went to college."' },
  { name: 'Straw Man',        regex: /you('re| are) saying|so you think|that'?s the same as|in other words/i, desc: 'Misrepresenting an opponent\'s argument.', example: '"You want fewer regulations? So you want zero safety standards?"' },
  { name: 'Appeal to Nature', regex: /natural|unnatural|nature knows|nature\s+is/i, desc: 'Assuming natural = good or unnatural = bad.', example: '"It\'s natural, so it must be healthy."' },
  { name: 'Slippery Slope',   regex: /if .{0,50} then .{0,50}(eventually|lead to|result in|end up|spiral)/i, desc: 'Assuming one step inevitably leads to extreme consequences.', example: '"If we allow X, it will inevitably lead to total chaos."' },
  { name: 'False Dichotomy',  regex: /either .{0,50} or|only two options|you('re| are) (with us|against us)/i, desc: 'Presenting only two options when more exist.', example: '"You\'re either with us or against us."' },
  { name: 'Appeal to Authority', regex: /expert(s)? say|studies show|scientists say|everyone knows/i, desc: 'Deferring to authority without examining evidence.', example: '"Scientists say it\'s true, so it must be."' },
  { name: 'Circular Reasoning', regex: /because .{0,60} that'?s why|by definition|it'?s true because it'?s true/i, desc: 'Using the conclusion as a premise.', example: '"The Bible is true because the Bible says so."' },
  { name: 'Bandwagon',        regex: /everyone (is|does|thinks|believes)|most people|popular opinion|mainstream/i, desc: 'Appealing to popularity rather than evidence.', example: '"Millions of people use it, so it must work."' },
  { name: 'Hasty Generalization', regex: /\b(always|never|all|every|none)\b.{0,60}(because|since|given)/i, desc: 'Drawing broad conclusions from limited examples.', example: '"I met two rude people from that city — everyone there is rude."' },
  { name: 'Appeal to Emotion', regex: /think of the children|innocent victims|terrifying|heartbreaking/i, desc: 'Substituting emotional manipulation for reasoned argument.', example: '"Think of the children — we must ban this immediately."' },
];

export function detectFallacies(text: string): string {
  const detected: Array<{ name: string; desc: string; example: string }> = [];
  for (const f of FALLACIES) {
    if (f.regex.test(text)) detected.push({ name: f.name, desc: f.desc, example: f.example });
  }
  if (detected.length === 0) return `✅ No common logical fallacies detected in the text.\n\nThis does not guarantee the argument is valid — it may still contain subtle errors. Always evaluate evidence and reasoning carefully.`;
  return `⚠️ ${detected.length} potential logical fallacy/fallacies detected:\n\n` +
    detected.map((d, i) => `${i + 1}. ${d.name}\n   Description: ${d.desc}\n   Example: ${d.example}`).join('\n\n') +
    `\n\n💡 Tip: Point out the specific fallacy, explain why it undermines the argument, and redirect to evidence.`;
}

/* ─────────────────────────────────────────────────────────────────
 *  ARGUMENT MAPPER
 * ──────────────────────────────────────────────────────────────── */
export function mapArgument(topic: string): string {
  return `🗺️ ARGUMENT MAP — "${topic}"\n\n` +
    `📍 MAIN CLAIM:\n   "[State the central claim about ${topic}]"\n\n` +
    `✅ SUPPORTING PREMISES:\n   P1: [First supporting reason]\n       Evidence: ?\n       Strength: ?\n   P2: [Second supporting reason]\n       Evidence: ?\n       Strength: ?\n   P3: [Third supporting reason]\n       Evidence: ?\n       Strength: ?\n\n` +
    `❌ OBJECTIONS:\n   O1: [Counter-argument]\n       Rebuttal: ?\n   O2: [Another counter-argument]\n       Rebuttal: ?\n\n` +
    `🔗 LOGICAL STRUCTURE:\n   If P1 AND P2 AND P3 → Then CLAIM (assuming the inferential step is valid)\n   Inference type: Deductive / Inductive / Abductive?\n\n` +
    `📊 ARGUMENT STRENGTH ASSESSMENT:\n   Evidence quality:  [Weak / Moderate / Strong]\n   Logical validity:  [Invalid / Valid / Sound]\n   Persuasiveness:    [Low / Medium / High]\n\n` +
    `🛡️ STRONGEST OBJECTION TO ADDRESS:\n   "[Fill in the most serious challenge to this argument]"`;
}

/* ─────────────────────────────────────────────────────────────────
 *  5-WHYS ROOT CAUSE ANALYSIS
 * ──────────────────────────────────────────────────────────────── */
export function fiveWhys(problem: string): string {
  return `🔍 5-WHYS ROOT CAUSE ANALYSIS\n\nProblem: "${problem}"\n\n` +
    `Why 1: Why did "${problem}" happen?\n   → Answer: ?\n\n` +
    `Why 2: Why did [Answer 1] occur?\n   → Answer: ?\n\n` +
    `Why 3: Why did [Answer 2] happen?\n   → Answer: ?\n\n` +
    `Why 4: Why did [Answer 3] occur?\n   → Answer: ?\n\n` +
    `Why 5: Why did [Answer 4] happen?\n   → Root cause: ?\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🏁 ROOT CAUSE IDENTIFIED:\n   "[The fundamental reason that, when fixed, prevents recurrence]"\n\n` +
    `✅ CORRECTIVE ACTION:\n   "[Specific, measurable change to address the root cause]"\n\n` +
    `📅 OWNER: ?    DEADLINE: ?    METRIC: ?`;
}

/* ─────────────────────────────────────────────────────────────────
 *  SWOT ANALYSIS
 * ──────────────────────────────────────────────────────────────── */
export function swotAnalysis(subject: string): string {
  return `📊 SWOT ANALYSIS — "${subject}"\n\n` +
    `💪 STRENGTHS (internal, positive)\n   S1: \n   S2: \n   S3: \n\n` +
    `⚠️ WEAKNESSES (internal, negative)\n   W1: \n   W2: \n   W3: \n\n` +
    `🌟 OPPORTUNITIES (external, positive)\n   O1: \n   O2: \n   O3: \n\n` +
    `🚨 THREATS (external, negative)\n   T1: \n   T2: \n   T3: \n\n` +
    `🔗 STRATEGIC IMPLICATIONS:\n` +
    `  SO (use strengths to capture opportunities): ?\n` +
    `  ST (use strengths to mitigate threats): ?\n` +
    `  WO (overcome weaknesses by pursuing opportunities): ?\n` +
    `  WT (minimize weaknesses and avoid threats): ?`;
}

/* ─────────────────────────────────────────────────────────────────
 *  MENTAL MODEL LIBRARY
 * ──────────────────────────────────────────────────────────────── */
export const MENTAL_MODELS: Record<string, string> = {
  'first principles': `🧱 FIRST PRINCIPLES THINKING\nBreak down a problem to its fundamental truths, then reason up from there.\nSteps: 1) Identify the problem. 2) Question all assumptions. 3) Strip away what isn't necessarily true. 4) Rebuild from the base.\nPioneer: Aristotle, Elon Musk\nWhen to use: When conventional approaches are limiting or wrong.`,
  'inversion': `🔄 INVERSION\nInstead of thinking how to achieve X, think about how to guarantee failure — then avoid those paths.\nSteps: 1) Define the goal. 2) Ask: "What would guarantee I fail at this?" 3) Make a list of failure modes. 4) Avoid them.\nPioneer: Charlie Munger\nWhen to use: Problem-solving, risk management, decision-making.`,
  'occams razor': `✂️ OCCAM'S RAZOR\nAmong competing explanations, the one with the fewest assumptions is usually correct.\nApplication: When evaluating explanations, prefer the simplest that fits all known facts.\nPioneer: William of Ockham\nLimitation: Doesn't mean the simple answer is always right — just most likely.`,
  'second order effects': `🌊 SECOND-ORDER THINKING\nThink beyond immediate effects to what happens next, and what happens after that.\nSteps: 1) What is the first-order effect? 2) And then what? 3) And then what after that?\nPioneer: Howard Marks\nExample: Antibiotics (1st: cure infection. 2nd: antibiotic resistance. 3rd: untreatable superbugs).`,
  'map territory': `🗺️ THE MAP IS NOT THE TERRITORY\nOur mental models are simplified representations of reality — not reality itself.\nApplication: Constantly update your map when new information conflicts with it. Don't mistake your model for the truth.\nPioneer: Alfred Korzybski\nWhen to use: Any time you're making decisions based on your understanding of a situation.`,
  'pareto principle': `📊 PARETO PRINCIPLE (80/20 Rule)\n80% of outcomes come from 20% of causes.\nApplication: Identify the 20% of inputs that drive 80% of your results and focus there.\nPioneer: Vilfredo Pareto\nExamples: 80% of revenue from 20% of customers. 80% of bugs from 20% of code.`,
  'circle of competence': `⭕ CIRCLE OF COMPETENCE\nKnow what you know, what you don't know, and the limits of your expertise.\nSteps: 1) Define your area of genuine expertise. 2) Recognize when a problem is outside it. 3) Consult those with expertise in that domain.\nPioneer: Warren Buffett\nDanger: Dunning-Kruger effect — most people overestimate their circle.`,
  'hanlon razor': `🗡️ HANLON'S RAZOR\nNever attribute to malice that which can be adequately explained by stupidity (or incompetence).\nApplication: When something goes wrong, first consider error or oversight before assuming bad intent.\nPioneer: Robert Hanlon\nLimitation: Does not mean malice never happens — but most negative events are unintentional.`,
  'systems thinking': `⚙️ SYSTEMS THINKING\nSee the world as interconnected systems rather than isolated events.\nKey concepts: Feedback loops (reinforcing / balancing), stocks and flows, delays, leverage points.\nPioneer: Jay Forrester, Donella Meadows\nWhen to use: Complex problems that don't respond to linear cause-effect reasoning.`,
  'bayesian updating': `🎲 BAYESIAN THINKING\nUpdate your beliefs based on new evidence, using probability.\nFormula: P(A|B) = P(B|A) × P(A) / P(B)\nSimple version: Start with a prior belief → observe evidence → update toward the evidence's direction.\nPioneer: Thomas Bayes\nWhen to use: Any decision under uncertainty, especially with changing information.`,
};

export function getMentalModel(name: string): string {
  const n = name.toLowerCase().replace(/[-']/g, '');
  for (const [key, value] of Object.entries(MENTAL_MODELS)) {
    if (n.includes(key.replace(/'/g, '')) || key.replace(/'/g, '').includes(n)) return value;
  }
  const list = Object.keys(MENTAL_MODELS).map((k, i) => `${i + 1}. ${k}`).join('\n');
  return `🧠 Mental model "${name}" not found in offline library.\n\nAvailable models:\n${list}\n\nType the model name to get a full breakdown.`;
}

export function listMentalModels(): string {
  return `🧠 MENTAL MODEL LIBRARY (${Object.keys(MENTAL_MODELS).length} models)\n\n` +
    Object.keys(MENTAL_MODELS).map((k, i) => `${i + 1}. ${k.replace(/\b\w/g, c => c.toUpperCase())}`).join('\n') +
    `\n\nType any model name to get a full explanation and application guide.`;
}

/* ─────────────────────────────────────────────────────────────────
 *  BIAS DETECTOR
 * ──────────────────────────────────────────────────────────────── */
const BIAS_PATTERNS: Array<{ name: string; regex: RegExp; desc: string }> = [
  { name: 'Confirmation bias',     regex: /\b(confirms?|proves?|validates?|supports?)\s+my|i\s+(already|always)\s+knew/i, desc: 'Favoring information that confirms pre-existing beliefs.' },
  { name: 'Anchoring bias',        regex: /the\s+initial|first\s+offer|starting\s+point|originally/i, desc: 'Over-relying on the first piece of information encountered.' },
  { name: 'Availability heuristic', regex: /recently|just\s+heard|in\s+the\s+news|i\s+remember\s+when/i, desc: 'Overweighting information that comes easily to mind.' },
  { name: 'Sunk cost fallacy',     regex: /already\s+(invested|spent|committed|paid)|can\'t\s+stop\s+now|come\s+too\s+far/i, desc: 'Continuing a behavior because of past investment rather than future value.' },
  { name: 'Overconfidence bias',   regex: /i\'m\s+(certain|sure|confident|100%)|definitely\s+will|no\s+doubt/i, desc: 'Overestimating one\'s knowledge, accuracy, or abilities.' },
  { name: 'In-group bias',         regex: /\bwe\b.{0,30}(better|smarter|more|superior)|they\s+(always|never|don\'t)/i, desc: 'Favoring members of one\'s own group.' },
  { name: 'Recency bias',          regex: /(latest|most\s+recent|nowadays|these\s+days).{0,40}(better|worse|always|never)/i, desc: 'Giving more weight to recent events than historical ones.' },
  { name: 'Authority bias',        regex: /(expert|professor|dr\.|ceo|official)\s+(says?|claims?|believes?)/i, desc: 'Over-relying on authority figures without examining evidence.' },
];

export function detectBias(text: string): string {
  const hits = BIAS_PATTERNS.filter(b => b.regex.test(text));
  if (hits.length === 0) return `✅ No common cognitive biases detected in the text.\n\nRemember: biases can be subtle and this detector covers only 8 common patterns. Always apply careful reasoning.`;
  return `🔍 COGNITIVE BIAS SCAN — ${hits.length} potential bias(es) detected:\n\n` +
    hits.map((h, i) => `${i + 1}. ${h.name}\n   ${h.desc}`).join('\n\n') +
    `\n\n💡 Debiasing strategies:\n• Seek disconfirming evidence\n• Consider the outside view (base rates)\n• Use pre-mortems and checklists\n• Introduce structured devil's advocacy`;
}

/* ─────────────────────────────────────────────────────────────────
 *  PRE-MORTEM ANALYSIS
 * ──────────────────────────────────────────────────────────────── */
export function preMortem(plan: string): string {
  return `⚰️ PRE-MORTEM ANALYSIS — "${plan}"\n\n` +
    `Imagine it is 12 months from now. "${plan}" has completely failed.\n\n` +
    `🔍 What went wrong? (Generate all failure scenarios)\n\n` +
    `Category 1 — EXECUTION FAILURES\n   • ?\n   • ?\n\n` +
    `Category 2 — MARKET / EXTERNAL FAILURES\n   • ?\n   • ?\n\n` +
    `Category 3 — RESOURCE / FINANCIAL FAILURES\n   • ?\n   • ?\n\n` +
    `Category 4 — PEOPLE / TEAM FAILURES\n   • ?\n   • ?\n\n` +
    `Category 5 — ASSUMPTION FAILURES\n   • What turned out to be wrong that we assumed was true?\n   • ?\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🛡️ COUNTERMEASURES:\n   Top 3 risks to address before starting:\n   1. \n   2. \n   3. \n\n` +
    `📊 GO / NO-GO decision after pre-mortem: ?`;
}

/* ─────────────────────────────────────────────────────────────────
 *  SOCRATIC QUESTIONING ENGINE
 * ──────────────────────────────────────────────────────────────── */
export function socraticQuestions(belief: string): string {
  return `🏛️ SOCRATIC QUESTIONING — "${belief}"\n\n` +
    `Round 1 — CLARIFY\n   • What exactly do you mean by this?\n   • Can you give a concrete example?\n   • How would you define the key terms?\n\n` +
    `Round 2 — PROBE ASSUMPTIONS\n   • What are you assuming here that might not be true?\n   • What if the opposite were true?\n   • How would things look if this assumption were wrong?\n\n` +
    `Round 3 — PROBE EVIDENCE\n   • What evidence supports this?\n   • Is this evidence sufficient and reliable?\n   • What evidence would change your mind?\n\n` +
    `Round 4 — EXPLORE PERSPECTIVES\n   • How would someone who disagrees see this?\n   • Who benefits most from this belief being true?\n   • How would this look from a different culture or time period?\n\n` +
    `Round 5 — PROBE IMPLICATIONS\n   • If this is true, what follows from it?\n   • What are the real-world consequences if you act on this?\n   • Does this belief lead anywhere you wouldn't endorse?\n\n` +
    `Round 6 — QUESTION THE QUESTION\n   • Why is this question important?\n   • What is the right question to be asking?`;
}

/* ─────────────────────────────────────────────────────────────────
 *  EISENHOWER PRIORITY MATRIX
 * ──────────────────────────────────────────────────────────────── */
export function eisenhowerMatrix(tasks: string[]): string {
  if (tasks.length === 0) return `📋 EISENHOWER MATRIX\n\nProvide a list of tasks to categorize them by urgency and importance.\n\nFormat: List your tasks one per line.`;
  return `📋 EISENHOWER MATRIX — ${tasks.length} task(s)\n\n` +
    `🔴 QUADRANT 1 — DO NOW (Urgent + Important)\n${tasks.slice(0, Math.ceil(tasks.length / 4)).map(t => `   ✅ ${t}`).join('\n')}\n\n` +
    `🟡 QUADRANT 2 — SCHEDULE (Not Urgent + Important)\n${tasks.slice(Math.ceil(tasks.length / 4), Math.ceil(tasks.length / 2)).map(t => `   📅 ${t}`).join('\n') || '   (none assigned)'}\n\n` +
    `🟠 QUADRANT 3 — DELEGATE (Urgent + Not Important)\n${tasks.slice(Math.ceil(tasks.length / 2), Math.ceil(tasks.length * 3 / 4)).map(t => `   🤝 ${t}`).join('\n') || '   (none assigned)'}\n\n` +
    `⚫ QUADRANT 4 — ELIMINATE (Not Urgent + Not Important)\n${tasks.slice(Math.ceil(tasks.length * 3 / 4)).map(t => `   🗑️ ${t}`).join('\n') || '   (none assigned)'}\n\n` +
    `💡 Note: Manually drag tasks into the right quadrant based on your actual urgency and importance assessment.`;
}

/* ─────────────────────────────────────────────────────────────────
 *  ASSUMPTION AUDITOR
 * ──────────────────────────────────────────────────────────────── */
export function auditAssumptions(plan: string): string {
  return `🔍 ASSUMPTION AUDIT — "${plan}"\n\n` +
    `Surface all hidden assumptions in this plan/idea:\n\n` +
    `1. DEMAND ASSUMPTIONS\n   • We assume [target audience] wants this\n   • We assume willingness to pay [price]\n   • We assume they are currently unsatisfied with alternatives\n\n` +
    `2. CAPABILITY ASSUMPTIONS\n   • We assume we can build/deliver this with [resources]\n   • We assume the technology/method is feasible\n   • We assume the team has the required skills\n\n` +
    `3. MARKET ASSUMPTIONS\n   • We assume the market is large enough (TAM ≥ ?)\n   • We assume competition won't neutralize our advantage\n   • We assume regulatory environment allows this\n\n` +
    `4. TIMING ASSUMPTIONS\n   • We assume the market is ready now\n   • We assume we have enough runway to reach profitability/success\n\n` +
    `5. FINANCIAL ASSUMPTIONS\n   • We assume unit economics work at scale\n   • We assume customer acquisition cost < lifetime value\n\n` +
    `RISKIEST ASSUMPTION TEST (RAT):\n   Which single assumption, if wrong, would kill this plan?\n   → ?  \n   How do we test it cheaply? → ?`;
}

/* ─────────────────────────────────────────────────────────────────
 *  SECOND-ORDER EFFECTS
 * ──────────────────────────────────────────────────────────────── */
export function secondOrderEffects(action: string): string {
  return `🌊 SECOND-ORDER EFFECTS — "${action}"\n\n` +
    `1st Order (Direct, Immediate):\n   What happens immediately as a direct result of "${action}"?\n   Effect 1a: ?\n   Effect 1b: ?\n\n` +
    `2nd Order (Consequences of 1st-order effects):\n   What happens as a result of those first effects?\n   Effect 2a: (following from 1a) ?\n   Effect 2b: (following from 1b) ?\n\n` +
    `3rd Order (Long-run systemic effects):\n   What systemic changes occur over time?\n   Effect 3a: ?\n   Effect 3b: ?\n\n` +
    `WINNER/LOSER ANALYSIS:\n   Who benefits most in each order?  →  ?\n   Who is most harmed in each order? →  ?\n\n` +
    `REVERSIBILITY:\n   Can each level of effect be undone if things go wrong?\n   1st order: [reversible / irreversible]\n   2nd order: [reversible / irreversible]\n   3rd order: [reversible / irreversible]`;
}
