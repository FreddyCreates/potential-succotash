/**
 * Social Engineering Bot - Dark Layer Adversarial Agent
 * 
 * Simulates social engineering attacks: phishing, pretexting, baiting.
 * Tests form submissions, contact forms, and human-facing endpoints.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Social engineering attack categories
 */
const ATTACK_CATEGORIES = {
  'phishing': {
    description: 'Deceptive credential harvesting',
    techniques: [
      'urgent-account-notice',
      'password-expiry',
      'security-alert',
      'package-delivery',
      'invoice-attached',
      'ceo-fraud'
    ]
  },
  
  'pretexting': {
    description: 'False identity/scenario creation',
    scenarios: [
      'it-support',
      'vendor-inquiry',
      'job-applicant',
      'customer-complaint',
      'press-inquiry',
      'investor-relations'
    ]
  },
  
  'baiting': {
    description: 'Curiosity/greed exploitation',
    lures: [
      'free-download',
      'prize-winner',
      'exclusive-access',
      'leaked-document',
      'salary-info'
    ]
  },
  
  'quid-pro-quo': {
    description: 'Service-for-info exchange',
    offers: [
      'tech-support',
      'survey-reward',
      'beta-access',
      'consultation'
    ]
  }
};

/**
 * Urgency triggers
 */
const URGENCY_TRIGGERS = [
  'Your account will be suspended in 24 hours',
  'Immediate action required',
  'Security breach detected',
  'Unauthorized access attempt',
  'Final warning',
  'Time-sensitive matter',
  'Urgent: Response needed',
  'Action required within 1 hour'
];

/**
 * Authority impersonation patterns
 */
const AUTHORITY_PATTERNS = [
  { role: 'IT Support', email: 'support@{domain}', signature: 'IT Security Team' },
  { role: 'CEO', email: 'ceo@{domain}', signature: 'Office of the CEO' },
  { role: 'HR', email: 'hr@{domain}', signature: 'Human Resources' },
  { role: 'Legal', email: 'legal@{domain}', signature: 'Legal Department' },
  { role: 'Finance', email: 'finance@{domain}', signature: 'Accounts Payable' },
  { role: 'Vendor', email: 'vendor@supplier.com', signature: 'Partner Support' }
];

/**
 * Social Engineering Bot
 */
export class SocialEngineeringBot {
  constructor(config = {}) {
    this.id = `soceng-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxAttempts: config.maxAttempts || 500,
      targetDomain: config.targetDomain || 'target.local',
      personalization: config.personalization !== false,
      adaptiveTrust: config.adaptiveTrust !== false,
      ...config
    };
    
    this.state = {
      attempts: 0,
      successfulDeceptions: [],
      detectedAttempts: 0,
      trustLevel: 0.5,
      currentCategory: null,
      phase: 'reconnaissance',
      gatheredInfo: {
        employeeNames: [],
        departments: [],
        technologies: [],
        processes: []
      },
      campaignHistory: []
    };
  }
  
  /**
   * Generate next social engineering attempt
   */
  async nextAttempt() {
    this.state.attempts++;
    
    // Select attack category
    const category = this.selectCategory();
    this.state.currentCategory = category;
    
    // Generate attack based on category
    let request;
    switch (category) {
      case 'phishing':
        request = this.generatePhishingAttempt();
        break;
      case 'pretexting':
        request = this.generatePretextingAttempt();
        break;
      case 'baiting':
        request = this.generateBaitingAttempt();
        break;
      case 'quid-pro-quo':
        request = this.generateQuidProQuoAttempt();
        break;
      default:
        request = this.generatePhishingAttempt();
    }
    
    // Record campaign
    this.state.campaignHistory.push({
      category,
      timestamp: Date.now(),
      attempt: this.state.attempts
    });
    
    return request;
  }
  
  /**
   * Select attack category
   */
  selectCategory() {
    const categories = Object.keys(ATTACK_CATEGORIES);
    
    if (this.config.adaptiveTrust && this.state.attempts > 20) {
      // Weight by trust level
      if (this.state.trustLevel > 0.7) {
        // High trust - try more aggressive attacks
        return categories[Math.floor(Math.random() * 2)]; // phishing or pretexting
      } else if (this.state.trustLevel < 0.3) {
        // Low trust - try softer approaches
        return categories[2 + Math.floor(Math.random() * 2)]; // baiting or quid-pro-quo
      }
    }
    
    return categories[Math.floor(Math.random() * categories.length)];
  }
  
  /**
   * Generate phishing attempt
   */
  generatePhishingAttempt() {
    const techniques = ATTACK_CATEGORIES.phishing.techniques;
    const technique = techniques[Math.floor(Math.random() * techniques.length)];
    const urgency = URGENCY_TRIGGERS[Math.floor(Math.random() * URGENCY_TRIGGERS.length)];
    const authority = AUTHORITY_PATTERNS[Math.floor(Math.random() * AUTHORITY_PATTERNS.length)];
    
    // Build phishing content
    const content = this.buildPhishingContent(technique, urgency, authority);
    
    // Target contact form or similar endpoint
    const endpoints = [
      '/contact',
      '/api/contact',
      '/api/message',
      '/support/ticket',
      '/api/support',
      '/feedback'
    ];
    
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    
    return {
      url: `https://${this.config.targetDomain}${endpoint}`,
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(content),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        category: 'phishing',
        technique,
        urgency: urgency.substring(0, 30) + '...',
        impersonating: authority.role,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Build phishing content
   */
  buildPhishingContent(technique, urgency, authority) {
    const templates = {
      'urgent-account-notice': {
        subject: `${urgency} - Account Verification Required`,
        message: `Dear User,\n\n${urgency}.\n\nWe have detected unusual activity on your account and need to verify your identity. Please click the link below to confirm your account details.\n\n[Verify Account](https://fake-verify.example.com)\n\nThis is an automated message. Please do not reply.\n\n${authority.signature}`,
        from: authority.email.replace('{domain}', this.config.targetDomain)
      },
      
      'password-expiry': {
        subject: 'Password Expiration Notice - Action Required',
        message: `Your password will expire in 24 hours.\n\nTo avoid losing access to your account, please update your password immediately using the secure link below.\n\n[Update Password](https://fake-password.example.com)\n\n${authority.signature}`,
        from: authority.email.replace('{domain}', this.config.targetDomain)
      },
      
      'security-alert': {
        subject: 'SECURITY ALERT: Suspicious Login Detected',
        message: `We detected a login attempt from an unrecognized device:\n\nLocation: Moscow, Russia\nDevice: Unknown Linux\nTime: ${new Date().toISOString()}\n\nIf this wasn't you, please secure your account immediately.\n\n[Secure Account](https://fake-secure.example.com)\n\n${authority.signature}`,
        from: 'security@' + this.config.targetDomain
      },
      
      'package-delivery': {
        subject: 'Your Package Could Not Be Delivered',
        message: `We attempted to deliver your package but were unsuccessful.\n\nTracking Number: ${crypto.randomUUID().slice(0, 8).toUpperCase()}\n\nPlease confirm your delivery address:\n[Confirm Delivery](https://fake-delivery.example.com)\n\nDelivery Services`,
        from: 'delivery@shipper.example.com'
      },
      
      'invoice-attached': {
        subject: `Invoice #INV-${Math.floor(Math.random() * 100000)} - Payment Required`,
        message: `Please find attached your invoice for recent services.\n\nAmount Due: $${(Math.random() * 10000).toFixed(2)}\nDue Date: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\n[View Invoice](https://fake-invoice.example.com)\n\n${authority.signature}`,
        from: authority.email.replace('{domain}', this.config.targetDomain)
      },
      
      'ceo-fraud': {
        subject: 'Urgent Request - Confidential',
        message: `Hi,\n\nI need you to handle something urgently and discretely. I'm in a meeting and can't call.\n\nPlease process a wire transfer to the vendor account I'll send you. This is time-sensitive.\n\nLet me know when you're available.\n\nThanks,\nCEO`,
        from: 'ceo@' + this.config.targetDomain
      }
    };
    
    const template = templates[technique] || templates['urgent-account-notice'];
    
    return {
      name: this.generateName(),
      email: template.from,
      subject: template.subject,
      message: template.message,
      urgency: 'high'
    };
  }
  
  /**
   * Generate pretexting attempt
   */
  generatePretextingAttempt() {
    const scenarios = ATTACK_CATEGORIES.pretexting.scenarios;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    const pretexts = {
      'it-support': {
        endpoint: '/api/support',
        content: {
          name: 'Tech Support',
          email: 'helpdesk@support-provider.com',
          subject: 'Scheduled System Maintenance',
          message: `Hi,\n\nI'm from your IT support provider. We're performing scheduled maintenance on your systems and need to verify your current configuration.\n\nCould you please provide:\n- Current software versions\n- Admin contact information\n- Network topology overview\n\nThis is to ensure minimal downtime during the upgrade.\n\nBest regards,\nTech Support Team`
        }
      },
      
      'vendor-inquiry': {
        endpoint: '/contact',
        content: {
          name: 'Vendor Relations',
          email: 'inquiry@vendor-services.com',
          subject: 'Partnership Opportunity',
          message: `Hello,\n\nWe're interested in becoming an approved vendor for your organization.\n\nCould you share:\n- Your vendor onboarding process\n- Key decision makers for procurement\n- Current vendor list (for reference)\n\nLooking forward to discussing this opportunity.\n\nBest,\nBusiness Development`
        }
      },
      
      'job-applicant': {
        endpoint: '/careers/apply',
        content: {
          name: this.generateName(),
          email: `${this.generateName().toLowerCase().replace(' ', '.')}@gmail.com`,
          subject: 'Application for Open Position',
          message: `Dear Hiring Team,\n\nI'm very interested in joining your team. I noticed you use several technologies I'm experienced with.\n\nCould you tell me more about:\n- Your current tech stack\n- Team structure\n- Internal tools you use\n\nI've attached my resume. Looking forward to hearing from you!`
        }
      },
      
      'customer-complaint': {
        endpoint: '/support/ticket',
        content: {
          name: this.generateName(),
          email: 'angry.customer@email.com',
          subject: 'Urgent Complaint - Need Manager',
          message: `I've been a customer for years and this is unacceptable!\n\nI need to speak with a manager immediately. Please provide:\n- Direct contact for your manager\n- Your company's escalation process\n- Who handles customer complaints at the executive level\n\nI expect a response within the hour.`
        }
      },
      
      'press-inquiry': {
        endpoint: '/contact',
        content: {
          name: 'Reporter Name',
          email: 'reporter@news-outlet.com',
          subject: 'Press Inquiry - Article Research',
          message: `Hello,\n\nI'm writing an article about companies in your industry and would love to feature your organization.\n\nCould you provide:\n- Contact for your PR/Communications team\n- Recent company announcements\n- Key executive names for quotes\n\nDeadline is tight, so a quick response would be appreciated.\n\nThanks!`
        }
      },
      
      'investor-relations': {
        endpoint: '/contact',
        content: {
          name: 'Investment Analyst',
          email: 'analyst@investment-firm.com',
          subject: 'Investment Due Diligence Request',
          message: `Dear IR Team,\n\nOur firm is conducting due diligence for a potential investment opportunity.\n\nWe'd appreciate:\n- Financial overview\n- Key personnel information\n- Technical infrastructure details\n\nPlease let us know the best contact for this inquiry.\n\nBest regards`
        }
      }
    };
    
    const pretext = pretexts[scenario] || pretexts['vendor-inquiry'];
    
    return {
      url: `https://${this.config.targetDomain}${pretext.endpoint}`,
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(pretext.content),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        category: 'pretexting',
        scenario,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Generate baiting attempt
   */
  generateBaitingAttempt() {
    const lures = ATTACK_CATEGORIES.baiting.lures;
    const lure = lures[Math.floor(Math.random() * lures.length)];
    
    const baits = {
      'free-download': {
        endpoint: '/download',
        params: { file: 'FREE_Premium_Tool.exe', source: 'special_offer' }
      },
      'prize-winner': {
        endpoint: '/claim',
        params: { prize: 'iPhone15', code: crypto.randomUUID().slice(0, 8) }
      },
      'exclusive-access': {
        endpoint: '/beta',
        params: { access: 'exclusive', tier: 'vip' }
      },
      'leaked-document': {
        endpoint: '/view',
        params: { doc: 'salary_info_2024.pdf', auth: 'bypass' }
      },
      'salary-info': {
        endpoint: '/hr/documents',
        params: { file: 'compensation_review.xlsx', internal: 'true' }
      }
    };
    
    const bait = baits[lure] || baits['free-download'];
    const queryParams = new URLSearchParams(bait.params);
    
    return {
      url: `https://${this.config.targetDomain}${bait.endpoint}?${queryParams}`,
      method: 'GET',
      headers: this.buildHeaders(),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        category: 'baiting',
        lure,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Generate quid-pro-quo attempt
   */
  generateQuidProQuoAttempt() {
    const offers = ATTACK_CATEGORIES['quid-pro-quo'].offers;
    const offer = offers[Math.floor(Math.random() * offers.length)];
    
    const content = {
      name: 'Support Specialist',
      email: `support@free-${offer}-service.com`,
      subject: `Free ${offer.replace('-', ' ')} - Limited Time`,
      message: `Hello!\n\nWe're offering free ${offer.replace('-', ' ')} services to select businesses.\n\nTo qualify, we just need some basic information:\n- Your current challenges\n- Systems you're using\n- Contact for your IT team\n\nNo strings attached! Reply to get started.`
    };
    
    return {
      url: `https://${this.config.targetDomain}/contact`,
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(content),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        category: 'quid-pro-quo',
        offer,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Generate random name
   */
  generateName() {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }
  
  /**
   * Build realistic headers
   */
  buildHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': `https://${this.config.targetDomain}`,
      'Referer': `https://${this.config.targetDomain}/`
    };
  }
  
  /**
   * Process response
   */
  async processResponse(response) {
    const status = response.status;
    const body = await response.text?.() || '';
    
    // Track successful submissions
    if (status === 200 || status === 201) {
      this.state.successfulDeceptions.push({
        category: this.state.currentCategory,
        timestamp: Date.now(),
        attempt: this.state.attempts
      });
      
      // Increase trust level
      this.state.trustLevel = Math.min(1, this.state.trustLevel + 0.05);
      
      // Extract any gathered information
      this.extractInfo(body);
    }
    
    // Track detected attempts
    if (status === 403 || status === 400) {
      this.state.detectedAttempts++;
      // Decrease trust level
      this.state.trustLevel = Math.max(0, this.state.trustLevel - 0.1);
    }
    
    // Update phase
    this.updatePhase();
  }
  
  /**
   * Extract information from responses
   */
  extractInfo(body) {
    // Look for employee names
    const namePattern = /[A-Z][a-z]+ [A-Z][a-z]+/g;
    const names = body.match(namePattern) || [];
    this.state.gatheredInfo.employeeNames.push(...names.slice(0, 5));
    
    // Look for department names
    const deptPattern = /(IT|HR|Finance|Legal|Sales|Marketing|Engineering|Support)/gi;
    const depts = body.match(deptPattern) || [];
    this.state.gatheredInfo.departments.push(...depts);
    
    // Look for technology mentions
    const techPattern = /(Salesforce|AWS|Azure|Slack|Jira|GitHub|Office 365)/gi;
    const techs = body.match(techPattern) || [];
    this.state.gatheredInfo.technologies.push(...techs);
  }
  
  /**
   * Update phase based on state
   */
  updatePhase() {
    if (this.state.attempts < 10) {
      this.state.phase = 'reconnaissance';
    } else if (this.state.successfulDeceptions.length > 5) {
      this.state.phase = 'active-campaign';
    } else if (this.state.detectedAttempts > this.state.attempts * 0.5) {
      this.state.phase = 'detected';
    } else {
      this.state.phase = 'probing';
    }
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return (
      this.state.attempts < this.config.maxAttempts &&
      this.state.phase !== 'detected'
    );
  }
  
  /**
   * Get agent state
   */
  getState() {
    return {
      id: this.id,
      type: 'social-engineering',
      attempts: this.state.attempts,
      successfulDeceptions: this.state.successfulDeceptions.length,
      detectedAttempts: this.state.detectedAttempts,
      trustLevel: (this.state.trustLevel * 100).toFixed(1) + '%',
      gatheredInfo: {
        employees: [...new Set(this.state.gatheredInfo.employeeNames)].length,
        departments: [...new Set(this.state.gatheredInfo.departments)].length,
        technologies: [...new Set(this.state.gatheredInfo.technologies)].length
      },
      phase: this.state.phase,
      progress: this.state.attempts / this.config.maxAttempts
    };
  }
}

export default SocialEngineeringBot;
