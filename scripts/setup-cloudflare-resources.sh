#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MedinaTech Workers Setup Script
# Creates all Cloudflare resources for the intelligent Workers infrastructure
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "🚀 MedinaTech Workers Setup"
echo "═══════════════════════════════════════════════════════════════"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in
echo "📋 Checking Cloudflare login status..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please log in to Cloudflare..."
    wrangler login
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📦 Creating D1 Database..."
echo "═══════════════════════════════════════════════════════════════"
wrangler d1 create medinatech-db || echo "D1 database may already exist"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📦 Creating KV Namespaces..."
echo "═══════════════════════════════════════════════════════════════"
wrangler kv namespace create HONEYPOT_LOGS || echo "Namespace may already exist"
wrangler kv namespace create SESSION_STORE || echo "Namespace may already exist"
wrangler kv namespace create IP_BLOCKLIST || echo "Namespace may already exist"
wrangler kv namespace create THREAT_INTEL || echo "Namespace may already exist"
wrangler kv namespace create KNOWLEDGE_CACHE || echo "Namespace may already exist"
wrangler kv namespace create CONFIG_STORE || echo "Namespace may already exist"
wrangler kv namespace create SCAN_PATTERNS || echo "Namespace may already exist"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📦 Creating R2 Bucket..."
echo "═══════════════════════════════════════════════════════════════"
wrangler r2 bucket create medinatech-assets || echo "Bucket may already exist"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📦 Creating Vectorize Index..."
echo "═══════════════════════════════════════════════════════════════"
wrangler vectorize create medinatech-index --dimensions=768 --metric=cosine || echo "Index may already exist"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📦 Creating Queues..."
echo "═══════════════════════════════════════════════════════════════"
wrangler queues create honeypot-events || echo "Queue may already exist"
wrangler queues create ai-analysis || echo "Queue may already exist"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Resources Created!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Copy the IDs from the output above"
echo "2. Update each wrangler.toml with the correct IDs:"
echo "   - workers/api-node/wrangler.toml"
echo "   - workers/gate-node/wrangler.toml"
echo "   - workers/knowledge-realm/wrangler.toml"
echo "   - workers/nova-sovereign/wrangler.toml"
echo "   - workers/enterprise-os-intelligence/wrangler.toml"
echo "   - workers/enterprisentelligence/wrangler.toml"
echo "   - workers/crimson-dawn-4f6d/wrangler.toml"
echo "   - workers/honeypot-admin/wrangler.toml"
echo "   - workers/honeypot-portal/wrangler.toml"
echo "   - workers/probe-node/wrangler.toml"
echo "   - workers/coordinator/wrangler.toml"
echo ""
echo "3. Deploy each Worker:"
echo "   cd workers/<name> && wrangler deploy"
echo ""
echo "Or deploy all at once:"
echo "   ./scripts/deploy-all-workers.sh"
