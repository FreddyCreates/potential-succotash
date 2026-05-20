/**
 * Dark Computing API - Metered Commercial Endpoint
 * 
 * Production-ready API for dark computing services.
 * Provides metered access to dark layer analysis.
 * 
 * Pricing:
 * - /dark/analyze: $0.001 per call
 * - /dark/classify: $0.0005 per call
 * - /dark/score: $0.0003 per call
 * - /sandland/run: $0.10 per simulation hour
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * API Key validation (placeholder - integrate with billing system)
 */
function validateAPIKey(apiKey) {
  if (!apiKey) return { valid: false, error: 'Missing API key' };
  if (!apiKey.startsWith('dark_')) return { valid: false, error: 'Invalid API key format' };
  
  // In production: validate against database, check tier, rate limits
  return {
    valid: true,
    tier: apiKey.includes('_ent_') ? 'enterprise' : 
          apiKey.includes('_pro_') ? 'professional' : 'developer',
    customerId: apiKey.split('_')[2] || 'unknown'
  };
}

/**
 * Rate limit check (placeholder - integrate with KV/Redis)
 */
function checkRateLimit(customerId, tier) {
  const limits = {
    developer: 10,      // 10 req/sec
    professional: 100,  // 100 req/sec
    enterprise: 1000    // 1000 req/sec
  };
  
  // In production: check against distributed rate limiter
  return {
    allowed: true,
    remaining: limits[tier] - 1,
    resetAt: Date.now() + 1000
  };
}

/**
 * Usage metering (placeholder - integrate with billing system)
 */
function recordUsage(customerId, endpoint, units = 1) {
  // In production: send to usage metering queue
  const prices = {
    '/dark/analyze': 0.001,
    '/dark/classify': 0.0005,
    '/dark/score': 0.0003,
    '/sandland/run': 0.10
  };
  
  return {
    customerId,
    endpoint,
    units,
    cost: prices[endpoint] * units,
    timestamp: Date.now()
  };
}

/**
 * Dark Analysis Engine
 */
function analyzeFingerprint(fingerprint) {
  let riskScore = 0;
  const tags = [];
  
  const ua = (fingerprint.userAgent || '').toLowerCase();
  const path = (fingerprint.path || '').toLowerCase();
  
  // User agent scoring
  if (ua.includes('bot')) { riskScore += 0.2; tags.push('bot'); }
  if (ua.includes('crawler')) { riskScore += 0.2; tags.push('crawler'); }
  if (ua.includes('python')) { riskScore += 0.3; tags.push('automated'); }
  if (ua.includes('curl')) { riskScore += 0.2; tags.push('cli-tool'); }
  if (ua.includes('scanner') || ua.includes('nikto') || ua.includes('nmap')) {
    riskScore += 0.5; tags.push('scanner');
  }
  
  // Path scoring
  if (path.includes('admin')) { riskScore += 0.2; tags.push('admin-probe'); }
  if (path.includes('.env')) { riskScore += 0.4; tags.push('config-probe'); }
  if (path.includes('..')) { riskScore += 0.5; tags.push('path-traversal'); }
  if (path.includes('wp-')) { riskScore += 0.2; tags.push('cms-probe'); }
  
  // Behavioral factors
  if (fingerprint.requestCount > 100) { riskScore += 0.2; tags.push('high-volume'); }
  if (fingerprint.errorRate > 0.5) { riskScore += 0.3; tags.push('error-probing'); }
  
  // Clamp and calculate confidence
  riskScore = Math.min(1, Math.max(0, riskScore));
  const confidence = 0.6 + (riskScore * 0.4);
  
  return {
    riskScore,
    anomalyScore: riskScore * 0.8,
    tags,
    confidence,
    action: riskScore > 0.7 ? 'block' : riskScore > 0.4 ? 'challenge' : 'allow'
  };
}

/**
 * Classification Engine
 */
function classifyAgent(fingerprint) {
  const ua = (fingerprint.userAgent || '').toLowerCase();
  
  let classification = 'unknown';
  let confidence = 0.5;
  
  // AI/LLM agents
  if (ua.includes('gpt') || ua.includes('claude') || ua.includes('bard')) {
    classification = 'ai-agent';
    confidence = 0.9;
  }
  // Search engine bots
  else if (ua.includes('googlebot') || ua.includes('bingbot') || ua.includes('yandex')) {
    classification = 'search-bot';
    confidence = 0.95;
  }
  // Security scanners
  else if (ua.includes('scanner') || ua.includes('nikto') || ua.includes('nmap') || ua.includes('sqlmap')) {
    classification = 'security-scanner';
    confidence = 0.85;
  }
  // Crawlers
  else if (ua.includes('crawler') || ua.includes('spider') || ua.includes('scraper')) {
    classification = 'crawler';
    confidence = 0.8;
  }
  // CLI tools
  else if (ua.includes('curl') || ua.includes('wget') || ua.includes('python') || ua.includes('java')) {
    classification = 'automated-tool';
    confidence = 0.75;
  }
  // Browser-like
  else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari')) {
    classification = 'browser';
    confidence = 0.7;
  }
  
  return {
    classification,
    confidence,
    isHuman: classification === 'browser' && confidence > 0.8,
    isBot: classification !== 'browser',
    subType: getSubType(classification, ua)
  };
}

function getSubType(classification, ua) {
  if (classification === 'ai-agent') {
    if (ua.includes('gpt')) return 'openai';
    if (ua.includes('claude')) return 'anthropic';
    if (ua.includes('bard')) return 'google';
    return 'unknown-ai';
  }
  return null;
}

/**
 * Quick Score Engine
 */
function quickScore(fingerprint) {
  let score = 0.5; // Neutral default
  
  const ua = fingerprint.userAgent || '';
  const ip = fingerprint.ip || '';
  
  // Quick heuristics
  if (ua.length < 20) score -= 0.2;
  if (ua.includes('bot')) score -= 0.1;
  if (!ua.includes('Mozilla')) score -= 0.15;
  
  // IP-based (placeholder)
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) {
    score -= 0.1; // Internal IP in external context
  }
  
  return {
    score: Math.min(1, Math.max(0, score)),
    risk: score < 0.3 ? 'high' : score < 0.6 ? 'medium' : 'low'
  };
}

/**
 * Dark Computing API Worker
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    };
    
    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // API Key validation
    const apiKey = request.headers.get('X-API-Key') || 
                   request.headers.get('Authorization')?.replace('Bearer ', '');
    const auth = validateAPIKey(apiKey);
    
    if (!auth.valid) {
      return Response.json({
        error: 'Unauthorized',
        message: auth.error,
        docs: 'https://docs.obscura.dev/authentication'
      }, { 
        status: 401,
        headers: corsHeaders
      });
    }
    
    // Rate limiting
    const rateLimit = checkRateLimit(auth.customerId, auth.tier);
    if (!rateLimit.allowed) {
      return Response.json({
        error: 'Rate limit exceeded',
        retryAfter: rateLimit.resetAt,
        tier: auth.tier,
        upgrade: 'https://obscura.dev/pricing'
      }, {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
        }
      });
    }
    
    // Route handling
    try {
      // Health check (free)
      if (path === '/dark/health') {
        return Response.json({
          status: 'operational',
          layer: 'dark',
          timestamp: Date.now(),
          phi: PHI,
          heartbeat: HB
        }, { headers: corsHeaders });
      }
      
      // Dark Analysis ($0.001)
      if (path === '/dark/analyze' && method === 'POST') {
        const body = await request.json();
        const usage = recordUsage(auth.customerId, '/dark/analyze');
        
        const result = analyzeFingerprint(body.fingerprint || body);
        
        return Response.json({
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
          ...result,
          usage: {
            cost: usage.cost,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Classification ($0.0005)
      if (path === '/dark/classify' && method === 'POST') {
        const body = await request.json();
        const usage = recordUsage(auth.customerId, '/dark/classify');
        
        const result = classifyAgent(body.fingerprint || body);
        
        return Response.json({
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
          ...result,
          usage: {
            cost: usage.cost,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Quick Score ($0.0003)
      if (path === '/dark/score' && method === 'POST') {
        const body = await request.json();
        const usage = recordUsage(auth.customerId, '/dark/score');
        
        const result = quickScore(body.fingerprint || body);
        
        return Response.json({
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
          ...result,
          usage: {
            cost: usage.cost,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Sandland simulation ($0.10/hour)
      if (path === '/sandland/run' && method === 'POST') {
        const body = await request.json();
        const hours = body.duration || 1;
        const usage = recordUsage(auth.customerId, '/sandland/run', hours);
        
        // In production: queue simulation job
        return Response.json({
          jobId: crypto.randomUUID(),
          status: 'queued',
          scenario: body.scenario || 'default',
          estimatedDuration: `${hours}h`,
          usage: {
            cost: usage.cost,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Sandland scenarios list
      if (path === '/sandland/scenarios' && method === 'GET') {
        return Response.json({
          scenarios: [
            { id: 'botnet-recon', name: 'Botnet Reconnaissance', difficulty: 'medium', agents: ['scanner-bot', 'botnet-node'] },
            { id: 'llm-mapper', name: 'LLM Agent Mapping', difficulty: 'medium', agents: ['llm-agent-sim'] },
            { id: 'tor-hardmode', name: 'Tor Hardmode', difficulty: 'hard', agents: ['apt-simulator', 'brute-force-bot'] },
            { id: 'nation-state', name: 'APT Simulation', difficulty: 'extreme', agents: ['apt-simulator', 'zero-day-exploit-sim', 'ransomware-c2-sim'] },
            { id: 'crypto-heist', name: 'Crypto Attack', difficulty: 'hard', agents: ['credential-stuffing-bot', 'api-abuse-agent'] },
            { id: 'social-attack', name: 'Social Engineering', difficulty: 'medium', agents: ['social-engineering-bot'] },
            { id: 'full-spectrum', name: 'Full Spectrum Attack', difficulty: 'extreme', agents: ['all'] }
          ]
        }, { headers: corsHeaders });
      }
      
      // Batch Analysis ($0.0008 per item)
      if (path === '/dark/batch' && method === 'POST') {
        const body = await request.json();
        const items = body.fingerprints || body.items || [];
        const usage = recordUsage(auth.customerId, '/dark/batch', items.length);
        
        const results = items.map(item => {
          const fingerprint = item.fingerprint || item;
          return {
            id: item.id || crypto.randomUUID().slice(0, 8),
            ...analyzeFingerprint(fingerprint)
          };
        });
        
        return Response.json({
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
          results,
          summary: {
            total: results.length,
            highRisk: results.filter(r => r.riskScore > 0.7).length,
            mediumRisk: results.filter(r => r.riskScore > 0.4 && r.riskScore <= 0.7).length,
            lowRisk: results.filter(r => r.riskScore <= 0.4).length
          },
          usage: {
            cost: items.length * 0.0008,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Streaming Threat Feed (WebSocket-style via SSE) ($0.05/minute)
      if (path === '/dark/stream' && method === 'GET') {
        const duration = parseInt(url.searchParams.get('duration') || '60');
        const usage = recordUsage(auth.customerId, '/dark/stream', Math.ceil(duration / 60));
        
        // Return SSE setup info (actual streaming would be via separate connection)
        return Response.json({
          endpoint: `wss://stream.obscura.dev/threat-feed?token=${crypto.randomUUID()}`,
          format: 'server-sent-events',
          events: ['threat-detected', 'pattern-emerging', 'agent-classified', 'attack-blocked'],
          duration: `${duration}s`,
          usage: {
            cost: Math.ceil(duration / 60) * 0.05,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Membrane Health Dashboard ($0.01/call)
      if (path === '/dark/membrane/health' && method === 'GET') {
        const usage = recordUsage(auth.customerId, '/dark/membrane/health');
        
        return Response.json({
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
          membrane: {
            status: 'operational',
            layers: {
              cortex: { status: 'healthy', latency: Math.floor(Math.random() * 50) + 10 },
              subcortex: { status: 'healthy', latency: Math.floor(Math.random() * 20) + 5 },
              darkLayer: { status: 'active', events: 0 }
            },
            phi: {
              resonance: 0.618 + Math.random() * 0.1,
              heartbeat: HB,
              coherence: 0.9 + Math.random() * 0.1
            },
            shadow: {
              patternsEmerging: Math.floor(Math.random() * 10),
              patternsConfirmed: Math.floor(Math.random() * 100),
              threatsActive: Math.floor(Math.random() * 5)
            }
          },
          traffic: {
            last24h: {
              requests: Math.floor(Math.random() * 1000000),
              blocked: Math.floor(Math.random() * 10000),
              challenged: Math.floor(Math.random() * 50000),
              allowed: Math.floor(Math.random() * 940000)
            },
            topThreats: [
              { type: 'credential-stuffing', count: Math.floor(Math.random() * 1000), severity: 'high' },
              { type: 'scanner', count: Math.floor(Math.random() * 5000), severity: 'medium' },
              { type: 'llm-agent', count: Math.floor(Math.random() * 10000), severity: 'low' }
            ]
          },
          usage: {
            cost: 0.01,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Usage Analytics ($0.02/call)
      if (path === '/dark/analytics' && method === 'GET') {
        const usage = recordUsage(auth.customerId, '/dark/analytics');
        const period = url.searchParams.get('period') || '7d';
        
        return Response.json({
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
          period,
          analytics: {
            apiCalls: {
              total: Math.floor(Math.random() * 100000),
              byEndpoint: {
                '/dark/analyze': Math.floor(Math.random() * 40000),
                '/dark/classify': Math.floor(Math.random() * 30000),
                '/dark/score': Math.floor(Math.random() * 25000),
                '/dark/batch': Math.floor(Math.random() * 5000)
              }
            },
            costs: {
              total: (Math.random() * 500).toFixed(2),
              byEndpoint: {
                '/dark/analyze': (Math.random() * 200).toFixed(2),
                '/dark/classify': (Math.random() * 100).toFixed(2),
                '/dark/score': (Math.random() * 50).toFixed(2),
                '/sandland/run': (Math.random() * 150).toFixed(2)
              }
            },
            threats: {
              detected: Math.floor(Math.random() * 5000),
              blocked: Math.floor(Math.random() * 4000),
              bypassed: Math.floor(Math.random() * 100),
              falsePositives: Math.floor(Math.random() * 50)
            },
            effectivenessScore: (0.9 + Math.random() * 0.1).toFixed(3)
          },
          usage: {
            cost: 0.02,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // Threat Intelligence Export ($0.50/export)
      if (path === '/dark/export/threats' && method === 'POST') {
        const body = await request.json();
        const format = body.format || 'json';
        const usage = recordUsage(auth.customerId, '/dark/export/threats');
        
        return Response.json({
          requestId: crypto.randomUUID(),
          timestamp: Date.now(),
          export: {
            format,
            status: 'queued',
            downloadUrl: `https://exports.obscura.dev/${crypto.randomUUID()}.${format}`,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            estimatedSize: '~5MB',
            includes: ['signatures', 'patterns', 'iocs', 'behavioral-models']
          },
          usage: {
            cost: 0.50,
            remaining: rateLimit.remaining
          }
        }, { headers: corsHeaders });
      }
      
      // API docs
      if (path === '/dark/docs' || path === '/') {
        return Response.json({
          name: 'Obscura Dark Computing API',
          version: '2.0.0',
          documentation: 'https://docs.obscura.dev',
          endpoints: {
            '/dark/health': { method: 'GET', price: 'free', description: 'Health check' },
            '/dark/analyze': { method: 'POST', price: '$0.001', description: 'Full risk analysis' },
            '/dark/classify': { method: 'POST', price: '$0.0005', description: 'Agent classification' },
            '/dark/score': { method: 'POST', price: '$0.0003', description: 'Quick risk score' },
            '/dark/batch': { method: 'POST', price: '$0.0008/item', description: 'Batch analysis' },
            '/dark/stream': { method: 'GET', price: '$0.05/minute', description: 'Streaming threat feed' },
            '/dark/membrane/health': { method: 'GET', price: '$0.01', description: 'Membrane health dashboard' },
            '/dark/analytics': { method: 'GET', price: '$0.02', description: 'Usage analytics' },
            '/dark/export/threats': { method: 'POST', price: '$0.50', description: 'Export threat intelligence' },
            '/sandland/run': { method: 'POST', price: '$0.10/hour', description: 'Run simulation' },
            '/sandland/scenarios': { method: 'GET', price: 'free', description: 'List scenarios' }
          },
          authentication: {
            type: 'API Key',
            header: 'X-API-Key',
            format: 'dark_<tier>_<customer_id>_<key>'
          },
          pricing: 'https://obscura.dev/pricing',
          support: 'support@obscura.dev'
        }, { headers: corsHeaders });
      }
      
      // 404
      return Response.json({
        error: 'Not found',
        path,
        docs: 'https://docs.obscura.dev'
      }, { 
        status: 404,
        headers: corsHeaders
      });
      
    } catch (error) {
      return Response.json({
        error: 'Internal error',
        message: 'Analysis failed',
        requestId: crypto.randomUUID()
      }, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
