#!/bin/bash
# Wyoming Charter — Deploy All Canisters to ICP
#
# Prerequisites:
# 1. dfx installed: sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
# 2. Identity created: dfx identity new wyoming-charter
# 3. Cycles wallet funded

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     WYOMING CHARTER — ICP CANISTER DEPLOYMENT                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

NETWORK=${1:-local}
echo "Deploying to network: $NETWORK"

cd "$(dirname "$0")"

# Start local replica if deploying locally
if [ "$NETWORK" = "local" ]; then
  echo ""
  echo "Starting local replica..."
  dfx start --background --clean 2>/dev/null || true
  sleep 3
fi

# Create canisters
echo ""
echo "Creating canisters..."
dfx canister create --all --network "$NETWORK"

# Build canisters
echo ""
echo "Building canisters..."
dfx build --network "$NETWORK"

# Deploy canisters
echo ""
echo "Deploying canisters..."
dfx deploy --network "$NETWORK"

# Get canister IDs
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    CANISTER IDS                               ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║ frnt_token:        $(dfx canister id frnt_token --network $NETWORK)"
echo "║ settlement_engine: $(dfx canister id settlement_engine --network $NETWORK)"
echo "║ node_registry:     $(dfx canister id node_registry --network $NETWORK)"
echo "║ grant_tracker:     $(dfx canister id grant_tracker --network $NETWORK)"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Bootstrap data
echo ""
echo "Bootstrapping node grid and grant pipeline..."
dfx canister call node_registry bootstrapGrid --network "$NETWORK"
dfx canister call grant_tracker bootstrapGrants --network "$NETWORK"

# Test basic queries
echo ""
echo "Testing canister queries..."
echo "Grid Stats:"
dfx canister call node_registry getGridStats --network "$NETWORK"

echo ""
echo "Grant Pipeline Stats:"
dfx canister call grant_tracker getPipelineStats --network "$NETWORK"

echo ""
echo "Settlement Engine Stats:"
dfx canister call settlement_engine getStats --network "$NETWORK"

echo ""
echo "FRNT Token Total Supply:"
dfx canister call frnt_token icrc1_total_supply --network "$NETWORK"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║             DEPLOYMENT COMPLETE                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

if [ "$NETWORK" = "ic" ]; then
  echo ""
  echo "Mainnet URLs:"
  echo "  FRNT Token:        https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=$(dfx canister id frnt_token --network ic)"
  echo "  Settlement Engine: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=$(dfx canister id settlement_engine --network ic)"
  echo "  Node Registry:     https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=$(dfx canister id node_registry --network ic)"
  echo "  Grant Tracker:     https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=$(dfx canister id grant_tracker --network ic)"
fi
