/**
 * Grant Automation — Wyoming Charter Grant Pipeline
 * 
 * Tracks federal and state grant applications for sovereign infrastructure funding.
 */

interface Grant {
  id: number;
  name: string;
  category: 'Federal' | 'State' | 'Foundation' | 'Corporate' | 'Academic';
  agency: string;
  amountMin: number;  // USD cents
  amountMax: number;  // USD cents
  status: 'Research' | 'Drafting' | 'Submitted' | 'UnderReview' | 'Awarded' | 'Rejected';
  notes: string;
  deadlineMs?: number;
  submittedMs?: number;
  awardedMs?: number;
  createdMs: number;
  updatedMs: number;
}

interface PipelineStats {
  totalGrants: number;
  researchGrants: number;
  draftingGrants: number;
  submittedGrants: number;
  awardedGrants: number;
  rejectedGrants: number;
  totalPipelineMinUsd: number;
  totalPipelineMaxUsd: number;
  totalAwardedUsd: number;
}

export class GrantAutomation {
  private grants: Grant[] = [];
  private grantCounter = 0;

  constructor() {
    this.bootstrapGrants();
  }

  /**
   * Bootstrap default grant pipeline
   */
  private bootstrapGrants(): void {
    const now = Date.now();

    const defaultGrants: [string, 'Federal' | 'State', string, number, number, string][] = [
      ['E-Rate Program (FCC)', 'Federal', 'FCC', 250_000_00, 1_000_000_00, 'Sovereign canister per school qualifies as network infrastructure. Target Dallas ISD and Nebraska districts.'],
      ['Title IV-A ESSA', 'Federal', 'Dept of Education', 50_000_00, 500_000_00, 'Technology and STEM enrichment. Agentic AI curriculum tools for schools.'],
      ['TEA Innovation Grants', 'State', 'Texas Education Agency', 100_000_00, 750_000_00, 'TEKS-mapped AI lesson canister is novel infrastructure, not SaaS.'],
      ['NSF RI / Mid-Scale Research', 'Federal', 'National Science Foundation', 500_000_00, 5_000_000_00, 'Sovereign decentralized compute as research infrastructure. UNL partnership anchor.'],
      ['Wyoming SPDI / State AI Fund', 'State', 'Wyoming State', 0, 0, 'Wyoming leading AI-friendly regulatory sandboxes. FRNT demo is direct value proof.'],
      ['USDA ReConnect (Rural Broadband)', 'Federal', 'USDA', 1_000_000_00, 1_000_000_00, 'Midwest rural internet backbone expansion. Gen 3 nodes in Lincoln vault tie to backbone.'],
      ['SBA SBIR / STTR', 'Federal', 'SBA', 150_000_00, 2_000_000_00, 'Veteran-owned (Bad Marine LLC). Phase I feasibility — sovereign AI infrastructure for state agencies.']
    ];

    for (const [name, category, agency, minCents, maxCents, notes] of defaultGrants) {
      this.grantCounter++;
      this.grants.push({
        id: this.grantCounter,
        name,
        category,
        agency,
        amountMin: minCents,
        amountMax: maxCents === 0 ? minCents : maxCents,
        status: 'Research',
        notes,
        createdMs: now,
        updatedMs: now
      });
    }
  }

  /**
   * Get all grants
   */
  async getAllGrants(): Promise<Grant[]> {
    return this.grants;
  }

  /**
   * Get grant by ID
   */
  async getGrant(id: number): Promise<Grant | null> {
    return this.grants.find(g => g.id === id) || null;
  }

  /**
   * Get grants by status
   */
  async getGrantsByStatus(status: Grant['status']): Promise<Grant[]> {
    return this.grants.filter(g => g.status === status);
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(): Promise<PipelineStats> {
    let research = 0, drafting = 0, submitted = 0, awarded = 0, rejected = 0;
    let pipelineMin = 0, pipelineMax = 0, totalAwarded = 0;

    for (const grant of this.grants) {
      switch (grant.status) {
        case 'Research':
          research++;
          pipelineMin += grant.amountMin;
          pipelineMax += grant.amountMax;
          break;
        case 'Drafting':
          drafting++;
          pipelineMin += grant.amountMin;
          pipelineMax += grant.amountMax;
          break;
        case 'Submitted':
        case 'UnderReview':
          submitted++;
          pipelineMin += grant.amountMin;
          pipelineMax += grant.amountMax;
          break;
        case 'Awarded':
          awarded++;
          totalAwarded += grant.amountMax;
          break;
        case 'Rejected':
          rejected++;
          break;
      }
    }

    return {
      totalGrants: this.grants.length,
      researchGrants: research,
      draftingGrants: drafting,
      submittedGrants: submitted,
      awardedGrants: awarded,
      rejectedGrants: rejected,
      totalPipelineMinUsd: pipelineMin / 100, // Convert cents to dollars
      totalPipelineMaxUsd: pipelineMax / 100,
      totalAwardedUsd: totalAwarded / 100
    };
  }

  /**
   * Mark grant as submitted
   */
  async markSubmitted(id: number): Promise<Grant | null> {
    const grant = this.grants.find(g => g.id === id);
    if (grant) {
      grant.status = 'Submitted';
      grant.submittedMs = Date.now();
      grant.updatedMs = Date.now();
    }
    return grant || null;
  }

  /**
   * Mark grant as awarded
   */
  async markAwarded(id: number, awardedAmountCents: number): Promise<Grant | null> {
    const grant = this.grants.find(g => g.id === id);
    if (grant) {
      grant.status = 'Awarded';
      grant.amountMin = awardedAmountCents;
      grant.amountMax = awardedAmountCents;
      grant.awardedMs = Date.now();
      grant.updatedMs = Date.now();
    }
    return grant || null;
  }

  /**
   * Add new grant to pipeline
   */
  async addGrant(
    name: string,
    category: Grant['category'],
    agency: string,
    amountMinCents: number,
    amountMaxCents: number,
    notes: string
  ): Promise<Grant> {
    this.grantCounter++;
    const now = Date.now();
    const grant: Grant = {
      id: this.grantCounter,
      name,
      category,
      agency,
      amountMin: amountMinCents,
      amountMax: amountMaxCents,
      status: 'Research',
      notes,
      createdMs: now,
      updatedMs: now
    };
    this.grants.push(grant);
    return grant;
  }
}
