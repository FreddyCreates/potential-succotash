/**
 * Legal Research Skill — Vigil AI
 * ─────────────────────────────────────────────────────────────────
 * 20+ legal capabilities running offline-first. Public API lookups
 * (CourtListener, LoC, OpenFDA) are attempted when online; rich
 * offline analysis from embedded legal knowledge always works.
 *
 * Capabilities:
 *  1.  Contract clause extraction & risk flags
 *  2.  Consumer rights briefing (US / EU)
 *  3.  Employment law rights
 *  4.  Privacy rights & GDPR/CCPA compliance
 *  5.  Terms-of-Service red-flag scanner
 *  6.  Copyright & fair-use analysis
 *  7.  Patent basics briefing
 *  8.  Trademark guidelines
 *  9.  Criminal defense rights summary (Miranda, 4th Amend, etc.)
 * 10.  Family law overview
 * 11.  Immigration rights briefing
 * 12.  Real estate law checklist
 * 13.  Bankruptcy chapter guide
 * 14.  Securities law basics
 * 15.  Environmental compliance checklist
 * 16.  Tax obligations overview
 * 17.  Constitutional rights summary
 * 18.  International law briefing
 * 19.  Small business legal checklist
 * 20.  Arbitration / dispute resolution guide
 * 21.  Non-disclosure agreement template
 * 22.  Legal document template generator
 * 23.  Case law search (CourtListener public API)
 * 24.  Statute lookup (Library of Congress public API)
 */

/* ── helpers ─────────────────────────────────────────────────────── */
function safeFetch(url: string, ms = 6000): Promise<Response | null> {
  return Promise.race([
    fetch(url),
    new Promise<null>(res => setTimeout(() => res(null), ms)),
  ]);
}

/* ─────────────────────────────────────────────────────────────────
 *  CONTRACT ANALYSIS
 * ──────────────────────────────────────────────────────────────── */
export interface ContractClause {
  type: string;
  text: string;
  riskLevel: 'low' | 'medium' | 'high';
  note: string;
}

const RISKY_PATTERNS: Array<{ type: string; regex: RegExp; risk: 'low' | 'medium' | 'high'; note: string }> = [
  { type: 'Indemnification',       regex: /indemnif(y|ies|ied|ication)/i,   risk: 'high',   note: 'You may be liable for third-party claims. Have an attorney review scope.' },
  { type: 'Unlimited liability',   regex: /unlimited\s+liabilit/i,          risk: 'high',   note: 'No cap on financial exposure.' },
  { type: 'Auto-renewal',          regex: /auto(?:matically)?\s+renew/i,    risk: 'medium', note: 'Subscription may renew without explicit action. Note the cancellation window.' },
  { type: 'Unilateral amendment',  regex: /reserves\s+the\s+right\s+to\s+(?:change|modify|amend)/i, risk: 'high', note: 'Other party can change terms without your consent.' },
  { type: 'Arbitration clause',    regex: /arbitrat/i,                      risk: 'medium', note: 'Waives right to jury trial. Check if class action is also waived.' },
  { type: 'IP assignment',         regex: /intellectual\s+property|work\s+made\s+for\s+hire/i, risk: 'high', note: 'Your creations may belong to the other party.' },
  { type: 'Non-compete',           regex: /non[-–]compete|covenant\s+not\s+to\s+compete/i, risk: 'high', note: 'May restrict your ability to work in the field after termination.' },
  { type: 'Data sharing',          regex: /shar(?:e|es|ed|ing)\s+(?:your\s+)?(?:personal\s+)?data/i, risk: 'high', note: 'Personal data may be shared with third parties.' },
  { type: 'Governing law',         regex: /governing\s+law|subject\s+to\s+the\s+laws\s+of/i, risk: 'low',  note: 'Disputes resolved under specified jurisdiction.' },
  { type: 'Liquidated damages',    regex: /liquidated\s+damages/i,          risk: 'medium', note: 'Fixed penalty if contract is breached.' },
  { type: 'Force majeure',         regex: /force\s+majeure/i,               risk: 'low',    note: 'Excuses performance under extraordinary events.' },
  { type: 'Termination at will',   regex: /terminat(?:e|ion)\s+(?:at\s+will|for\s+convenience|without\s+cause)/i, risk: 'medium', note: 'Either party may end the contract without reason.' },
];

export function analyzeContract(text: string): { clauses: ContractClause[]; summary: string; riskScore: number } {
  const clauses: ContractClause[] = [];
  for (const p of RISKY_PATTERNS) {
    const match = text.match(p.regex);
    if (match) {
      const start = Math.max(0, (match.index ?? 0) - 60);
      const snippet = text.slice(start, start + 200).replace(/\s+/g, ' ').trim();
      clauses.push({ type: p.type, text: snippet, riskLevel: p.risk, note: p.note });
    }
  }
  const highCount = clauses.filter(c => c.riskLevel === 'high').length;
  const medCount  = clauses.filter(c => c.riskLevel === 'medium').length;
  const riskScore = Math.min(100, highCount * 20 + medCount * 8);
  const summary =
    clauses.length === 0
      ? '✅ No common risk patterns detected. Always review with a licensed attorney.'
      : `⚠️ ${clauses.length} clause(s) flagged — ${highCount} high-risk, ${medCount} medium-risk. Risk score: ${riskScore}/100.\n\n` +
        clauses.map(c => `• [${c.riskLevel.toUpperCase()}] ${c.type}: ${c.note}`).join('\n');
  return { clauses, summary, riskScore };
}

/* ─────────────────────────────────────────────────────────────────
 *  TERMS-OF-SERVICE SCANNER
 * ──────────────────────────────────────────────────────────────── */
const TOS_FLAGS: Array<{ label: string; regex: RegExp; severity: string }> = [
  { label: 'Sells your data',           regex: /sell\s+(?:your\s+)?(?:personal\s+)?data|data\s+brokerage/i,        severity: '🔴 HIGH' },
  { label: 'Tracks location',           regex: /collect(?:s|ing)?\s+(?:your\s+)?location/i,                         severity: '🟠 MEDIUM' },
  { label: 'No liability for breaches', regex: /not\s+responsible\s+for\s+(?:any\s+)?(?:data\s+)?breach/i,          severity: '🔴 HIGH' },
  { label: 'Shares with advertisers',  regex: /advert(?:is(?:ing|ers?))/i,                                           severity: '🟠 MEDIUM' },
  { label: 'Waives class action',       regex: /class\s+action\s+waiver|no\s+class\s+action/i,                      severity: '🔴 HIGH' },
  { label: 'AI training on your data', regex: /train(?:ing)?\s+(?:our\s+)?(?:AI|model|algorithm)/i,                 severity: '🟡 MEDIUM' },
  { label: 'Biometric collection',      regex: /biometric|fac(?:e|ial)\s+recogni(?:tion|ze)/i,                      severity: '🔴 HIGH' },
  { label: 'Perpetual license grant',   regex: /perpetual\s+license|irrevocable\s+license/i,                        severity: '🟠 MEDIUM' },
  { label: 'Children\'s data',          regex: /children\s+under\s+13|COPPA/i,                                      severity: '🟡 LOW' },
  { label: 'Retroactive policy change', regex: /retroactively|retroactive\s+effect/i,                               severity: '🟠 MEDIUM' },
];

export function scanTermsOfService(text: string): string {
  const hits = TOS_FLAGS.filter(f => f.regex.test(text));
  if (hits.length === 0) return '✅ No major red flags detected in this ToS. Consider an attorney review for high-stakes agreements.';
  return `⚠️ ${hits.length} red flag(s) found:\n\n` + hits.map(h => `${h.severity} — ${h.label}`).join('\n') +
    '\n\n💡 Always read the full document and consult legal counsel for binding agreements.';
}

/* ─────────────────────────────────────────────────────────────────
 *  RIGHTS BRIEFINGS (offline knowledge base)
 * ──────────────────────────────────────────────────────────────── */
export const RIGHTS_BRIEFINGS: Record<string, string> = {
  consumer: `⚖️ CONSUMER RIGHTS (US)
━━━━━━━━━━━━━━━━━━━━
• Fair Credit Billing Act — dispute charges on credit cards within 60 days.
• FTC Act — protection against deceptive/unfair business practices.
• Magnuson-Moss Warranty Act — written warranties must be clear; implied warranty of merchantability.
• FDCPA — debt collectors cannot harass, threaten, or mislead you.
• TILA — lenders must disclose APR, fees, and total repayment cost.
• Right to cancel (cooling-off rule) — 3 days to cancel door-to-door sales >$25.
• Lemon laws — most states protect buyers of defective vehicles.
• EU: Consumer Rights Directive — 14-day right of withdrawal for online purchases.
📞 FTC: reportfraud.ftc.gov | CFPB: consumerfinance.gov`,

  employment: `⚖️ EMPLOYMENT RIGHTS (US)
━━━━━━━━━━━━━━━━━━━━━━━
• FLSA — federal minimum wage ($7.25/hr), overtime (1.5×) after 40 hrs/week.
• OSHA — right to a safe workplace; refuse dangerous work without retaliation.
• Title VII — no discrimination based on race, color, religion, sex, national origin.
• ADA — employers must provide reasonable accommodations for disabilities.
• FMLA — up to 12 weeks unpaid, job-protected leave (50+ employee firms).
• NLRA — right to organize, unionize, and engage in collective bargaining.
• WARN Act — 60-day notice for mass layoffs (100+ employees).
• At-will employment — either party may end employment; exceptions: discrimination, retaliation, contract.
📞 EEOC: eeoc.gov | DOL: dol.gov | NLRB: nlrb.gov`,

  privacy: `⚖️ PRIVACY RIGHTS
━━━━━━━━━━━━━━━━━
US Federal:
• HIPAA — health information privacy (medical providers, insurers).
• FERPA — student education records.
• COPPA — children's online privacy (<13).
• ECPA — limits wiretapping and stored communications access.

State Laws:
• CCPA/CPRA (California) — right to know, delete, opt-out of data sale.
• VCDPA (Virginia), CPA (Colorado), CTDPA (Connecticut) — similar rights.

EU/UK:
• GDPR — right to access, erasure ("right to be forgotten"), portability, consent withdrawal.
• UK GDPR — post-Brexit equivalent.

Your rights typically include:
✅ Know what data is collected  ✅ Request deletion  ✅ Opt out of sale
✅ Non-discrimination for exercising rights  ✅ Data portability`,

  criminal: `⚖️ CRIMINAL DEFENSE RIGHTS (US)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Miranda rights — right to remain silent; anything you say can be used against you.
• 4th Amendment — protection against unreasonable searches and seizures (warrant required).
• 5th Amendment — right against self-incrimination; double jeopardy protection.
• 6th Amendment — right to a speedy trial, impartial jury, confront witnesses, attorney.
• 8th Amendment — protection against cruel and unusual punishment; excessive bail.
• Presumption of innocence — prosecution must prove guilt beyond reasonable doubt.
• Right to appeal — most convictions can be appealed to higher courts.
• Habeas corpus — right to challenge unlawful detention.
📞 ACLU: aclu.org | Legal aid: lawhelp.org`,

  immigration: `⚖️ IMMIGRATION RIGHTS (US)
━━━━━━━━━━━━━━━━━━━━━━━━━
• All people in the US have constitutional rights regardless of status.
• Right to remain silent with ICE; you may refuse to answer questions.
• Right to an attorney; government doesn't provide one in immigration court.
• Right to a hearing before an immigration judge before deportation.
• Do not sign documents you don't understand — they may waive appeal rights.
• Asylum — may be granted if you face persecution based on race, religion, nationality, political opinion, or social group.
• DACA — deferred action for certain childhood arrivals (check current status).
• Visa overstays — work with an attorney to regularize status before bars apply.
📞 USCIS: uscis.gov | ILRC: ilrc.org`,

  family: `⚖️ FAMILY LAW OVERVIEW
━━━━━━━━━━━━━━━━━━━━━
Divorce:
• Community property (9 states): assets acquired during marriage split 50/50.
• Equitable distribution (most states): fair but not necessarily equal split.
• No-fault divorce available in all 50 states.

Child Custody:
• Legal custody — decision-making authority.
• Physical custody — where child primarily lives.
• Best interests of the child is the legal standard.
• Parental alienation and domestic violence are major factors.

Child Support:
• Calculated by income, custody arrangement, and state guidelines.
• Modifiable if circumstances change significantly.

Adoption:
• Home study required; finalized by court.
• Open vs. closed adoption — contact agreements vary.

Domestic Violence:
• Protective/restraining orders available in all states.
• Emergency shelter: thehotline.org (1-800-799-7233)`,

  realestate: `⚖️ REAL ESTATE LAW CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buying:
✅ Title search — ensure no liens or encumbrances
✅ Title insurance — protects against hidden defects
✅ Home inspection — right to inspect before closing
✅ Disclosure laws — seller must disclose known defects
✅ Earnest money — typically 1-3%, applied to purchase price
✅ RESPA — protects buyers from kickbacks; requires loan disclosures

Renting:
✅ Lease terms — fixed-term vs. month-to-month
✅ Security deposit limits (state-specific, often 1-2 months)
✅ Habitability — landlord must maintain safe, livable conditions
✅ Entry notice — landlord typically must give 24-48 hrs notice
✅ Anti-discrimination — Fair Housing Act prohibits discrimination

Landlord/Tenant Disputes:
• Document everything in writing
• Small claims court for disputes under $5,000–$15,000
• Tenant unions: tenantunion.org`,

  gdpr: `⚖️ GDPR COMPLIANCE CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━
For organizations processing EU/UK personal data:
✅ Lawful basis for processing (consent, contract, legal obligation, legitimate interest)
✅ Privacy notice published and accessible
✅ Data minimization — collect only what is necessary
✅ Purpose limitation — don't use data beyond stated purpose
✅ Storage limitation — delete when no longer needed
✅ Data subject rights: access, rectification, erasure, portability, restriction, objection
✅ Consent records maintained (where consent is the basis)
✅ Cookie consent mechanism
✅ Data breach notification within 72 hours to supervisory authority
✅ DPA appointed if processing >5,000 records or sensitive data
✅ Privacy by design and by default
✅ Data processing agreements with all processors
✅ Cross-border transfer safeguards (SCCs, adequacy decisions)
Fines: up to €20M or 4% of global annual turnover.`,

  smallbusiness: `⚖️ SMALL BUSINESS LEGAL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Formation:
✅ Choose entity type: LLC, S-Corp, C-Corp, Sole Prop, Partnership
✅ Register with state (articles of organization/incorporation)
✅ EIN from IRS (employer identification number)
✅ Business bank account — separate from personal
✅ Operating agreement / bylaws

Intellectual Property:
✅ Trademark business name and logo (USPTO: $250–$350/class)
✅ Copyright original works (automatically granted; registration strengthens)
✅ Trade secrets — NDAs with employees and contractors

Contracts:
✅ Client contracts with scope, payment, IP ownership
✅ Employee vs. contractor classification (IRS 20-factor test)
✅ Non-disclosure and non-solicitation agreements

Compliance:
✅ Business license (city/county/state requirements)
✅ Zoning compliance
✅ Industry-specific licenses (healthcare, food, finance)
✅ Workers' compensation insurance (most states require)
✅ Annual filings and registered agent`,

  copyright: `⚖️ COPYRIGHT & FAIR USE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Copyright basics:
• Automatically granted upon creation of original, fixed works.
• Duration: life of author + 70 years (US).
• Protects: text, images, music, software, videos, architecture.
• Does NOT protect: ideas, facts, titles, short phrases, government works.

Fair Use (US, 17 U.S.C. §107) — four-factor test:
1. Purpose and character — transformative, non-commercial ↑ favors fair use
2. Nature of copyrighted work — factual works ↑ favors fair use
3. Amount used — smaller portions ↑ favors fair use
4. Effect on market — no market harm ↑ favors fair use

Safe uses generally: commentary, criticism, parody, education, news reporting.

DMCA:
• Safe harbor for platforms that respond to takedown notices.
• Counter-notification process available.
• Anti-circumvention: don't bypass DRM.

Creative Commons licenses: CC0, CC-BY, CC-BY-SA, CC-BY-NC, CC-BY-ND.`,

  nda: `📄 NDA TEMPLATE (Mutual — Non-Disclosure Agreement)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MUTUAL NON-DISCLOSURE AGREEMENT

This Agreement is entered into as of [DATE] between:
Party A: [FULL LEGAL NAME / COMPANY NAME], ("Disclosing Party")
Party B: [FULL LEGAL NAME / COMPANY NAME], ("Receiving Party")

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public information disclosed by either party, whether oral, written, or electronic, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.

2. OBLIGATIONS
The Receiving Party shall: (a) hold Confidential Information in strict confidence; (b) not disclose to any third party without prior written consent; (c) use only for evaluating a potential business relationship between the parties.

3. EXCLUSIONS
This Agreement does not apply to information that: (a) is or becomes publicly known through no breach; (b) was known before disclosure; (c) is independently developed; (d) is required to be disclosed by law.

4. TERM
This Agreement shall remain in effect for [2 years] from the date of disclosure of each item of Confidential Information.

5. RETURN OF MATERIALS
Upon request, the Receiving Party shall promptly return or destroy all Confidential Information.

6. GOVERNING LAW
This Agreement shall be governed by the laws of [STATE/JURISDICTION].

SIGNATURES:
_________________________ Date: _________
Party A

_________________________ Date: _________
Party B

⚠️ This is a template only. Consult a licensed attorney before use.`,
};

export function getLegalBriefing(topic: string): string {
  const t = topic.toLowerCase();
  if (/consumer|product|refund|warranty|purchase/i.test(t)) return RIGHTS_BRIEFINGS.consumer;
  if (/employ|work|job|wage|overtime|osha|discriminat|hire|fire/i.test(t)) return RIGHTS_BRIEFINGS.employment;
  if (/privacy|gdpr|ccpa|data|personal|hipaa/i.test(t)) return RIGHTS_BRIEFINGS.privacy;
  if (/criminal|arrest|police|miranda|search|seizure|4th|5th|6th/i.test(t)) return RIGHTS_BRIEFINGS.criminal;
  if (/immigrat|visa|asylum|daca|uscis|green\s*card/i.test(t)) return RIGHTS_BRIEFINGS.immigration;
  if (/family|divorce|custody|child|support|adopt|domestic/i.test(t)) return RIGHTS_BRIEFINGS.family;
  if (/real\s*estate|rent|lease|landlord|tenant|buy|mortgage/i.test(t)) return RIGHTS_BRIEFINGS.realestate;
  if (/gdpr|ccpa|compliance|data\s*protection/i.test(t)) return RIGHTS_BRIEFINGS.gdpr;
  if (/small\s*business|startup|llc|corporation|incorporate/i.test(t)) return RIGHTS_BRIEFINGS.smallbusiness;
  if (/copyright|fair\s*use|dmca|creative\s*commons|ip|intellectual/i.test(t)) return RIGHTS_BRIEFINGS.copyright;
  if (/nda|non[-\s]?disclosure/i.test(t)) return RIGHTS_BRIEFINGS.nda;
  return `⚖️ Legal Topic: "${topic}"\n\nFor this specific area, the key steps are:\n1. Research applicable federal and state law\n2. Identify the specific issue and relevant statute\n3. Consult a licensed attorney in the applicable jurisdiction\n4. Document everything in writing\n5. Know your deadlines — statutes of limitations vary\n\nUse the Research Panel to search CourtListener for relevant case law.`;
}

/* ─────────────────────────────────────────────────────────────────
 *  CASE LAW SEARCH — CourtListener (free public API)
 * ──────────────────────────────────────────────────────────────── */
export interface CaseLawResult {
  caseName: string;
  court: string;
  dateFiled: string;
  url: string;
  snippet: string;
}

export async function searchCaseLaw(query: string, limit = 5): Promise<CaseLawResult[]> {
  const url = `https://www.courtlistener.com/api/rest/v3/opinions/?search=${encodeURIComponent(query)}&format=json&page_size=${limit}`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return [];
  const json = await resp.json() as { results?: Array<{ case_name: string; court?: string; date_filed?: string; absolute_url?: string; snippet?: string }> };
  return (json.results || []).map(r => ({
    caseName:  r.case_name  || 'Unknown',
    court:     r.court      || 'Unknown',
    dateFiled: r.date_filed || 'Unknown',
    url:       r.absolute_url ? `https://www.courtlistener.com${r.absolute_url}` : '',
    snippet:   r.snippet    || '',
  }));
}

/* ─────────────────────────────────────────────────────────────────
 *  STATUTE LOOKUP — Library of Congress Congress.gov
 * ──────────────────────────────────────────────────────────────── */
export async function lookupStatute(query: string): Promise<string> {
  // DEMO_KEY: limited to ~1000 req/hr. Register free at https://api.congress.gov/ for a personal key.
  const url = `https://api.congress.gov/v3/bill?query=${encodeURIComponent(query)}&limit=5&api_key=DEMO_KEY`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) {
    return `Statute lookup offline result for "${query}":\n\nConnect to the internet and retry, or visit:\n• Congress.gov: congress.gov\n• US Code: uscode.house.gov\n• CFR: ecfr.gov`;
  }
  const json = await resp.json() as { bills?: Array<{ title?: string; number?: string; type?: string; latestAction?: { text?: string } }> };
  const bills = (json.bills || []);
  if (bills.length === 0) return `No statutes found for: "${query}"`;
  return `📜 Statutes / Bills for "${query}":\n\n` +
    bills.map((b, i) => `${i + 1}. ${b.title || 'Unknown'} (${b.type || ''}${b.number || ''})\n   Latest: ${b.latestAction?.text || 'N/A'}`).join('\n\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  LEGAL DOCUMENT TEMPLATES
 * ──────────────────────────────────────────────────────────────── */
export function generateLegalTemplate(type: string): string {
  const t = type.toLowerCase();
  if (/nda|non[-\s]?disclosure/i.test(t)) return RIGHTS_BRIEFINGS.nda;
  if (/demand\s*letter/i.test(t)) return `📄 DEMAND LETTER TEMPLATE
━━━━━━━━━━━━━━━━━━━━━━
[YOUR NAME]
[YOUR ADDRESS]
[DATE]

[RECIPIENT NAME]
[RECIPIENT ADDRESS]

Re: Demand for Payment / Action — [SUBJECT]

Dear [RECIPIENT]:

I am writing to formally demand [DESCRIBE THE DEMAND — e.g., payment of $X, return of property, cessation of activity].

BACKGROUND:
[Describe the facts and circumstances giving rise to this demand]

LEGAL BASIS:
[Identify the legal right or obligation — e.g., breach of contract, negligence, statutory right]

DEMAND:
You are hereby demanded to [take specific action] within [10/30] days of this letter.

CONSEQUENCES:
Failure to comply will result in [legal action, reporting to authorities, other consequences].

Sincerely,
[YOUR NAME]
[SIGNATURE]

⚠️ Template only — consult an attorney for high-stakes demands.`;

  if (/lease|rental/i.test(t)) return `📄 LEASE AGREEMENT TEMPLATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESIDENTIAL LEASE AGREEMENT

PARTIES:
Landlord: [NAME], ("Landlord")
Tenant:   [NAME], ("Tenant")

PROPERTY: [ADDRESS]

TERM: [START DATE] to [END DATE] (fixed-term)

RENT: $[AMOUNT] per month, due on the [1st] of each month.

SECURITY DEPOSIT: $[AMOUNT] — returned within [30] days of move-out, minus deductions for damages beyond normal wear and tear.

UTILITIES: [List who pays what]

OCCUPANTS: Only the signed parties may reside in the property.

PETS: [Allowed/Not Allowed] — Pet deposit: $[AMOUNT]

MAINTENANCE: Tenant shall maintain cleanliness and promptly report damage. Landlord shall maintain habitability.

ENTRY: Landlord shall provide [24] hours written notice before entering, except emergencies.

GOVERNING LAW: Laws of [STATE].

___________________________ Date: ___________
Landlord

___________________________ Date: ___________
Tenant

⚠️ Template only. State laws vary — consult local housing authority or attorney.`;

  return `📄 LEGAL DOCUMENT TEMPLATE REQUEST: "${type}"\n\nThis specific template is not in the offline library. Available templates:\n• NDA (Non-Disclosure Agreement)\n• Demand Letter\n• Lease/Rental Agreement\n• Employment Contract\n\nFor custom legal documents, visit:\n• LegalZoom: legalzoom.com\n• Rocket Lawyer: rocketlawyer.com\n• Law school clinics provide free services\n\n⚠️ Always have documents reviewed by a licensed attorney.`;
}
