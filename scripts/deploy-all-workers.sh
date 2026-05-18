#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Deploy All MedinaTech Workers
# ═══════════════════════════════════════════════════════════════════════════════

set -e

WORKERS_DIR="$(dirname "$0")/../workers"

echo "🚀 Deploying All MedinaTech Workers"
echo "═══════════════════════════════════════════════════════════════"

WORKERS=(
    "api-node"
    "coordinator"
    "gate-node"
    "knowledge-realm"
    "nova-sovereign"
    "enterprise-os-intelligence"
    "enterprisentelligence"
    "crimson-dawn-4f6d"
    "honeypot-admin"
    "honeypot-portal"
    "probe-node"
)

for worker in "${WORKERS[@]}"; do
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "📦 Deploying: $worker"
    echo "═══════════════════════════════════════════════════════════════"
    
    if [ -d "$WORKERS_DIR/$worker" ]; then
        cd "$WORKERS_DIR/$worker"
        
        # Install dependencies if package.json exists
        if [ -f "package.json" ]; then
            npm install
        fi
        
        # Deploy
        wrangler deploy
        
        echo "✅ $worker deployed successfully"
    else
        echo "⚠️  $worker directory not found, skipping..."
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ All Workers Deployed!"
echo "═══════════════════════════════════════════════════════════════"
