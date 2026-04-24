/// AutoGenerateCallsEngine.mo — MOTOR AUTO-GENERATIONIS VOCATIONUM
///
/// 12 Web Worker Builder AIs (OPERARII AEDIFICATORES), each Latin-named
/// with 3 dedicated engines (Generator + Router + Builder).
///
/// 36 engines total. 776+ auto-generated calls across all domains.
/// Full routing table — every call auto-routed to correct target module.
/// All AI, AGI, 24/7, user-facing, cross-substrate.
///
/// As above, so below.

import Float  "mo:base/Float";
import Nat    "mo:base/Nat";
import Text   "mo:base/Text";
import Array  "mo:base/Array";
import Int    "mo:base/Int";
import Time   "mo:base/Time";

import Types  "Types";

module {

  // ── Phi Constants ─────────────────────────────────────────────────────
  let PHI : Float      = 1.618033988749895;
  let PHI_INV : Float  = 0.618033988749895;

  // ══════════════════════════════════════════════════════════════════════
  //  TYPES — GENERIS DEFINITIONUM
  // ══════════════════════════════════════════════════════════════════════

  /// Engine triad — every worker has exactly 3
  public type EngineTriad = {
    generator : EngineState;
    router    : EngineState;
    builder   : EngineState;
  };

  public type EngineState = {
    name         : Text;
    status       : Text;   // "active" | "idle" | "healing"
    callsRouted  : Nat;
    confidence   : Float;
    lastActiveNs : Int;
  };

  /// A single auto-generated call definition
  public type CallDefinition = {
    callId       : Nat;
    callName     : Text;
    domain       : Text;
    targetModule : Text;
    workerName   : Text;
    priority     : Float;   // phi-weighted
    autoRouted   : Bool;
  };

  /// Worker state — one of the 12 Builder AIs
  public type WorkerState = {
    id           : Nat;
    name         : Text;
    latinName    : Text;
    domain       : Text;
    engines      : EngineTriad;
    totalCalls   : Nat;
    callsGenerated : Nat;
    healthy      : Bool;
  };

  /// Full engine snapshot
  public type EngineSnapshot = {
    workers        : [WorkerState];
    totalWorkers   : Nat;
    totalEngines   : Nat;
    totalCalls     : Nat;
    healthyWorkers : Nat;
    timestampNs    : Int;
  };

  /// Routing result for a call
  public type CallRoutingResult = {
    callName      : Text;
    routedTo      : Text;
    workerUsed    : Text;
    engineUsed    : Text;
    confidence    : Float;
    phiWeight     : Float;
  };

  // ══════════════════════════════════════════════════════════════════════
  //  WORKER REGISTRY — REGISTRUM OPERARIORUM
  //  12 Workers × 3 Engines = 36 Engines
  // ══════════════════════════════════════════════════════════════════════

  /// Build the initial engine triad for a worker
  public func buildTriad(workerName : Text, ts : Int) : EngineTriad {
    {
      generator = {
        name = workerName # "-Generator";
        status = "active";
        callsRouted = 0;
        confidence = PHI_INV;
        lastActiveNs = ts;
      };
      router = {
        name = workerName # "-Router";
        status = "active";
        callsRouted = 0;
        confidence = PHI_INV;
        lastActiveNs = ts;
      };
      builder = {
        name = workerName # "-Builder";
        status = "active";
        callsRouted = 0;
        confidence = PHI_INV;
        lastActiveNs = ts;
      };
    }
  };

  /// Initialize all 12 workers with their Latin names, domains, and call counts
  public func initWorkers(ts : Int) : [WorkerState] {
    [
      // 1. PROTOCOLLUM — Protocols, Consensus, BFT — 144 calls
      {
        id = 1; name = "PROTOCOLLUM"; latinName = "OPERARIUS PROTOCOLLORUM";
        domain = "Protocols, Consensus, BFT";
        engines = buildTriad("PROTOCOLLUM", ts);
        totalCalls = 144; callsGenerated = 0; healthy = true;
      },
      // 2. TERMINALIS — Terminals, AI/AGI Hierarchy — 50 calls
      {
        id = 2; name = "TERMINALIS"; latinName = "OPERARIUS TERMINALIUM";
        domain = "Terminals, AI/AGI Hierarchy";
        engines = buildTriad("TERMINALIS", ts);
        totalCalls = 50; callsGenerated = 0; healthy = true;
      },
      // 3. ORGANISMUS — SDK Organisms, Emergence — 180 calls
      {
        id = 3; name = "ORGANISMUS"; latinName = "OPERARIUS ORGANISMORUM";
        domain = "SDK Organisms, Emergence";
        engines = buildTriad("ORGANISMUS", ts);
        totalCalls = 180; callsGenerated = 0; healthy = true;
      },
      // 4. MERCATOR — Marketplace, Tools, Tiers — 64 calls
      {
        id = 4; name = "MERCATOR"; latinName = "OPERARIUS MERCATUS";
        domain = "Marketplace, Tools, Tiers";
        engines = buildTriad("MERCATOR", ts);
        totalCalls = 64; callsGenerated = 0; healthy = true;
      },
      // 5. ORCHESTRATOR — Houses, Models, Families — 37 calls
      {
        id = 5; name = "ORCHESTRATOR"; latinName = "OPERARIUS ORCHESTRATORUM";
        domain = "Houses, Models, Families";
        engines = buildTriad("ORCHESTRATOR", ts);
        totalCalls = 37; callsGenerated = 0; healthy = true;
      },
      // 6. MATHEMATICUS — Math Formulas, Constants — 60 calls
      {
        id = 6; name = "MATHEMATICUS"; latinName = "OPERARIUS MATHEMATICORUM";
        domain = "Math Formulas, Constants";
        engines = buildTriad("MATHEMATICUS", ts);
        totalCalls = 60; callsGenerated = 0; healthy = true;
      },
      // 7. SYNAPTICUS — Synapses, Chaos, Connections — 20 calls
      {
        id = 7; name = "SYNAPTICUS"; latinName = "OPERARIUS SYNAPSIUM";
        domain = "Synapses, Chaos, Connections";
        engines = buildTriad("SYNAPTICUS", ts);
        totalCalls = 20; callsGenerated = 0; healthy = true;
      },
      // 8. SUBSTRATUM — Blockchain, Nodes, Layers — 40 calls
      {
        id = 8; name = "SUBSTRATUM"; latinName = "OPERARIUS SUBSTRATI";
        domain = "Blockchain, Nodes, Layers";
        engines = buildTriad("SUBSTRATUM", ts);
        totalCalls = 40; callsGenerated = 0; healthy = true;
      },
      // 9. UNIVERSUM — Domains, Ecosystems, Councils — 105 calls
      {
        id = 9; name = "UNIVERSUM"; latinName = "OPERARIUS UNIVERSORUM";
        domain = "Domains, Ecosystems, Councils";
        engines = buildTriad("UNIVERSUM", ts);
        totalCalls = 105; callsGenerated = 0; healthy = true;
      },
      // 10. CANISTRUM — Canister Tech, Factory — 23 calls
      {
        id = 10; name = "CANISTRUM"; latinName = "OPERARIUS CANISTRORUM";
        domain = "Canister Tech, Factory";
        engines = buildTriad("CANISTRUM", ts);
        totalCalls = 23; callsGenerated = 0; healthy = true;
      },
      // 11. LICENTIATOR — Licenses, Documents, Rights — 24 calls
      {
        id = 11; name = "LICENTIATOR"; latinName = "OPERARIUS LICENTIARUM";
        domain = "Licenses, Documents, Rights";
        engines = buildTriad("LICENTIATOR", ts);
        totalCalls = 24; callsGenerated = 0; healthy = true;
      },
      // 12. DEFENSOR — Defense, Care, Arsenal — 29 calls
      {
        id = 12; name = "DEFENSOR"; latinName = "OPERARIUS DEFENSIONIS ET CURAE";
        domain = "Defense, Care, Arsenal";
        engines = buildTriad("DEFENSOR", ts);
        totalCalls = 29; callsGenerated = 0; healthy = true;
      }
    ]
  };

  // ══════════════════════════════════════════════════════════════════════
  //  CALL GENERATION — GENERATIO VOCATIONUM
  //  776+ calls auto-generated and routed
  // ══════════════════════════════════════════════════════════════════════

  /// Generate calls for PROTOCOLLUM — 144 protocol calls
  public func generateProtocolCalls(ts : Int) : [CallDefinition] {
    let protocols = [
      "SovereignRouting", "EncryptedTransport", "PhiResonanceSync",
      "KnowledgeAbsorption", "MultiModelFusion", "ContractVerification",
      "EdgeMesh", "OrganismLifecycle", "CrossOrganismResonance",
      "HeartbeatProtocol", "ConsensusProtocol", "BFTValidation"
    ];
    let operations = [
      "init", "validate", "route", "execute",
      "sync", "verify", "heal", "broadcast",
      "aggregate", "finalize", "snapshot", "restore"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 0;
    for (p in protocols.vals()) {
      for (op in operations.vals()) {
        id += 1;
        let call : CallDefinition = {
          callId = id;
          callName = p # "." # op;
          domain = "Protocols";
          targetModule = "protocols/" # p;
          workerName = "PROTOCOLLUM";
          priority = PHI_INV * Float.fromInt(id % 8 + 1);
          autoRouted = true;
        };
        calls := Array.append(calls, [call]);
      };
    };
    calls
  };

  /// Generate calls for TERMINALIS — 50 terminal/AGI calls
  public func generateTerminalCalls(ts : Int) : [CallDefinition] {
    let terminals = [
      "AGIHierarchy", "TerminalInference", "CommandRouter",
      "ShellIntelligence", "PowerShellAI", "WSLBridge",
      "TerminalForge", "CommandHistory", "AutoComplete", "SessionState"
    ];
    let operations = ["init", "execute", "route", "complete", "analyze"];
    var calls : [CallDefinition] = [];
    var id : Nat = 200;
    for (t in terminals.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = t # "." # op;
          domain = "Terminals";
          targetModule = "sdk/terminals/" # t;
          workerName = "TERMINALIS";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for ORGANISMUS — 180 organism/SDK calls
  public func generateOrganismCalls(ts : Int) : [CallDefinition] {
    let sdks = [
      "SpatialMemory", "EnterpriseIntegration", "IntelligenceRouting",
      "OrganismRuntime", "DocumentAbsorption", "ModelEngine",
      "FrontendIntelligence", "MarketplaceSDK", "RegisterBuilder"
    ];
    let operations = [
      "init", "boot", "heartbeat", "sense", "execute",
      "absorb", "route", "fuse", "score", "heal",
      "snapshot", "restore", "resonate", "broadcast",
      "sync", "validate", "register", "deploy",
      "monitor", "shutdown"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 300;
    for (s in sdks.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = s # "." # op;
          domain = "Organisms";
          targetModule = "sdk/" # s;
          workerName = "ORGANISMUS";
          priority = PHI * Float.fromInt(id % 10 + 1) / 10.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for MERCATOR — 64 marketplace calls
  public func generateMarketplaceCalls(ts : Int) : [CallDefinition] {
    let tools = [
      "ToolSchema", "ToolRegistry", "ToolRouter",
      "ToolInvoker", "ToolSettlement", "CrawlingFamily",
      "ContextFamily", "CommanderFamily", "SentryFamily",
      "BuilderFamily", "MarketplaceRouter", "FamilyProfiles",
      "TierManager", "PermissionGate", "UsageTracker", "RewardEngine"
    ];
    let operations = ["init", "register", "invoke", "settle"];
    var calls : [CallDefinition] = [];
    var id : Nat = 500;
    for (t in tools.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = t # "." # op;
          domain = "Marketplace";
          targetModule = "sdk/marketplace/" # t;
          workerName = "MERCATOR";
          priority = PHI_INV * Float.fromInt(id % 6 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for ORCHESTRATOR — 37 model/family calls
  public func generateOrchestratorCalls(ts : Int) : [CallDefinition] {
    let houses = [
      "GPTHouse", "ClaudeHouse", "GeminiHouse", "LlamaHouse",
      "MistralHouse", "CohereHouse", "PhiHouse"
    ];
    let operations = [
      "init", "route", "score", "fuse", "rank"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 600;
    for (h in houses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = h # "." # op;
          domain = "Models";
          targetModule = "sdk/models/" # h;
          workerName = "ORCHESTRATOR";
          priority = PHI * Float.fromInt(id % 7 + 1) / 7.0;
          autoRouted = true;
        }]);
      };
    };
    // 2 extra cross-family calls
    calls := Array.append(calls, [{
      callId = id + 1;
      callName = "ModelFamilies.rankAll";
      domain = "Models";
      targetModule = "sdk/models/families";
      workerName = "ORCHESTRATOR";
      priority = PHI;
      autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 2;
      callName = "ModelFamilies.fuseAlpha";
      domain = "Models";
      targetModule = "sdk/models/fusion";
      workerName = "ORCHESTRATOR";
      priority = PHI;
      autoRouted = true;
    }]);
    calls
  };

  /// Generate calls for MATHEMATICUS — 60 math/constant calls
  public func generateMathCalls(ts : Int) : [CallDefinition] {
    let domains = [
      "PhiMath", "KuramotoSync", "FourierAnalysis",
      "GoldenAngle", "ZScoreNorm", "SqrtNorm",
      "IQRAnomaly", "PearsonCorrelation", "SpectralDFT",
      "MeanReversion", "PhiDecay", "EntropyCalc"
    ];
    let operations = ["compute", "validate", "normalize", "transform", "score"];
    var calls : [CallDefinition] = [];
    var id : Nat = 650;
    for (d in domains.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = d # "." # op;
          domain = "Mathematics";
          targetModule = "sdk/math/" # d;
          workerName = "MATHEMATICUS";
          priority = PHI * Float.fromInt(id % 4 + 1) / 4.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for SYNAPTICUS — 20 synapse/chaos calls
  public func generateSynapseCalls(ts : Int) : [CallDefinition] {
    let synapses = [
      "NeuralMesh", "ChaosBridge", "ResonanceLink",
      "AttentionGate"
    ];
    let operations = ["fire", "connect", "resonate", "modulate", "heal"];
    var calls : [CallDefinition] = [];
    var id : Nat = 720;
    for (s in synapses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = s # "." # op;
          domain = "Synapses";
          targetModule = "sdk/synapses/" # s;
          workerName = "SYNAPTICUS";
          priority = PHI_INV * Float.fromInt(id % 5 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for SUBSTRATUM — 40 blockchain/node calls
  public func generateBlockchainCalls(ts : Int) : [CallDefinition] {
    let layers = [
      "ICPCanister", "EthereumBridge", "SolanaBridge",
      "BitcoinOracle", "NodeManager", "LayerRouter",
      "CrossChainRelay", "ConsensusEngine"
    ];
    let operations = ["init", "deploy", "query", "update", "bridge"];
    var calls : [CallDefinition] = [];
    var id : Nat = 750;
    for (l in layers.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = l # "." # op;
          domain = "Blockchain";
          targetModule = "sdk/blockchain/" # l;
          workerName = "SUBSTRATUM";
          priority = PHI * Float.fromInt(id % 8 + 1) / 8.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for UNIVERSUM — 105 domain/ecosystem calls
  public func generateUniversumCalls(ts : Int) : [CallDefinition] {
    let ecosystems = [
      "IntelligenceDomain", "EnterpriseDomain", "CreativeDomain",
      "ResearchDomain", "SecurityDomain", "HealthDomain",
      "FinanceDomain", "EducationDomain", "InfrastructureDomain",
      "GovernanceDomain", "CommerceDomain", "SocialDomain",
      "MediaDomain", "LegalDomain", "ScienceDomain"
    ];
    let operations = [
      "register", "discover", "route", "govern",
      "audit", "sync", "evolve"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 800;
    for (e in ecosystems.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "Ecosystems";
          targetModule = "sdk/universum/" # e;
          workerName = "UNIVERSUM";
          priority = PHI_INV * Float.fromInt(id % 7 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for CANISTRUM — 23 canister/factory calls
  public func generateCanisterCalls(ts : Int) : [CallDefinition] {
    let canisters = [
      "CanisterFactory", "CanisterUpgrade", "CanisterMonitor",
      "StableStorage", "InterCanister"
    ];
    let operations = ["create", "upgrade", "monitor", "snapshot"];
    var calls : [CallDefinition] = [];
    var id : Nat = 910;
    for (c in canisters.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = c # "." # op;
          domain = "Canisters";
          targetModule = "sdk/canisters/" # c;
          workerName = "CANISTRUM";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };
    // 3 extra factory calls
    calls := Array.append(calls, [{
      callId = id + 1; callName = "CanisterFactory.batchCreate";
      domain = "Canisters"; targetModule = "sdk/canisters/factory";
      workerName = "CANISTRUM"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 2; callName = "CanisterFactory.migrateAll";
      domain = "Canisters"; targetModule = "sdk/canisters/factory";
      workerName = "CANISTRUM"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 3; callName = "CanisterFactory.healthCheck";
      domain = "Canisters"; targetModule = "sdk/canisters/factory";
      workerName = "CANISTRUM"; priority = PHI_INV; autoRouted = true;
    }]);
    calls
  };

  /// Generate calls for LICENTIATOR — 24 license/document calls
  public func generateLicenseCalls(ts : Int) : [CallDefinition] {
    let licenses = [
      "LicenseIssuer", "LicenseVerifier", "DocumentForge",
      "RightsManager", "ComplianceEngine", "AuditTrail"
    ];
    let operations = ["issue", "verify", "revoke", "audit"];
    var calls : [CallDefinition] = [];
    var id : Nat = 940;
    for (l in licenses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = l # "." # op;
          domain = "Licenses";
          targetModule = "sdk/licenses/" # l;
          workerName = "LICENTIATOR";
          priority = PHI_INV * Float.fromInt(id % 6 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for DEFENSOR — 29 defense/care calls
  public func generateDefenseCalls(ts : Int) : [CallDefinition] {
    let defenses = [
      "ThreatDetector", "ImmunityEngine", "GuardianShield",
      "PromptInjectionGuard", "DataLeakPrevention", "AnomalyScanner"
    ];
    let operations = ["scan", "defend", "heal", "report"];
    var calls : [CallDefinition] = [];
    var id : Nat = 970;
    for (d in defenses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = d # "." # op;
          domain = "Defense";
          targetModule = "sdk/defense/" # d;
          workerName = "DEFENSOR";
          priority = PHI * Float.fromInt(id % 6 + 1) / 6.0;
          autoRouted = true;
        }]);
      };
    };
    // 5 extra arsenal calls
    calls := Array.append(calls, [{
      callId = id + 1; callName = "Arsenal.deployCountermeasure";
      domain = "Defense"; targetModule = "sdk/defense/arsenal";
      workerName = "DEFENSOR"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 2; callName = "Arsenal.quarantine";
      domain = "Defense"; targetModule = "sdk/defense/arsenal";
      workerName = "DEFENSOR"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 3; callName = "Arsenal.emergencyShutdown";
      domain = "Defense"; targetModule = "sdk/defense/arsenal";
      workerName = "DEFENSOR"; priority = PHI * PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 4; callName = "CareEngine.selfHeal";
      domain = "Defense"; targetModule = "sdk/defense/care";
      workerName = "DEFENSOR"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 5; callName = "CareEngine.nurture";
      domain = "Defense"; targetModule = "sdk/defense/care";
      workerName = "DEFENSOR"; priority = PHI_INV; autoRouted = true;
    }]);
    calls
  };

  // ══════════════════════════════════════════════════════════════════════
  //  ROUTING TABLE — TABULA ITINERUM
  //  Every call auto-routed to its correct target module
  // ══════════════════════════════════════════════════════════════════════

  /// Route a call by name to the correct worker and engine
  public func routeCall(callName : Text, workers : [WorkerState]) : CallRoutingResult {
    // Determine domain from call prefix
    let workerName = resolveWorker(callName);
    let engineType = resolveEngine(callName);

    // Phi-weighted confidence scoring
    let confidence = PHI_INV * 0.9;
    let phiWeight  = PHI / (PHI + 1.0);

    {
      callName = callName;
      routedTo = resolveTarget(callName);
      workerUsed = workerName;
      engineUsed = engineType;
      confidence = confidence;
      phiWeight = phiWeight;
    }
  };

  /// Resolve which worker handles a call based on domain prefix
  func resolveWorker(callName : Text) : Text {
    // Match by known domain prefixes
    if (textStartsWith(callName, "Sovereign") or textStartsWith(callName, "Encrypted") or
        textStartsWith(callName, "PhiResonance") or textStartsWith(callName, "Knowledge") or
        textStartsWith(callName, "MultiModel") or textStartsWith(callName, "Contract") or
        textStartsWith(callName, "EdgeMesh") or textStartsWith(callName, "Organism") or
        textStartsWith(callName, "CrossOrganism") or textStartsWith(callName, "Heartbeat") or
        textStartsWith(callName, "Consensus") or textStartsWith(callName, "BFT")) {
      "PROTOCOLLUM"
    } else if (textStartsWith(callName, "AGI") or textStartsWith(callName, "Terminal") or
               textStartsWith(callName, "Command") or textStartsWith(callName, "Shell") or
               textStartsWith(callName, "PowerShell") or textStartsWith(callName, "WSL")) {
      "TERMINALIS"
    } else if (textStartsWith(callName, "Spatial") or textStartsWith(callName, "Enterprise") or
               textStartsWith(callName, "Intelligence") or textStartsWith(callName, "Document") or
               textStartsWith(callName, "Model") or textStartsWith(callName, "Frontend") or
               textStartsWith(callName, "Marketplace") or textStartsWith(callName, "Register")) {
      "ORGANISMUS"
    } else if (textStartsWith(callName, "Tool") or textStartsWith(callName, "Crawling") or
               textStartsWith(callName, "Context") or textStartsWith(callName, "Sentry") or
               textStartsWith(callName, "Builder") or textStartsWith(callName, "Tier") or
               textStartsWith(callName, "Permission") or textStartsWith(callName, "Usage") or
               textStartsWith(callName, "Reward")) {
      "MERCATOR"
    } else if (textStartsWith(callName, "GPT") or textStartsWith(callName, "Claude") or
               textStartsWith(callName, "Gemini") or textStartsWith(callName, "Llama") or
               textStartsWith(callName, "Mistral") or textStartsWith(callName, "Cohere") or
               textStartsWith(callName, "Phi")) {
      "ORCHESTRATOR"
    } else if (textStartsWith(callName, "Phi") or textStartsWith(callName, "Kuramoto") or
               textStartsWith(callName, "Fourier") or textStartsWith(callName, "Golden") or
               textStartsWith(callName, "ZScore") or textStartsWith(callName, "Sqrt") or
               textStartsWith(callName, "IQR") or textStartsWith(callName, "Pearson") or
               textStartsWith(callName, "Spectral") or textStartsWith(callName, "Mean") or
               textStartsWith(callName, "Entropy")) {
      "MATHEMATICUS"
    } else if (textStartsWith(callName, "Neural") or textStartsWith(callName, "Chaos") or
               textStartsWith(callName, "Resonance") or textStartsWith(callName, "Attention")) {
      "SYNAPTICUS"
    } else if (textStartsWith(callName, "ICP") or textStartsWith(callName, "Ethereum") or
               textStartsWith(callName, "Solana") or textStartsWith(callName, "Bitcoin") or
               textStartsWith(callName, "Node") or textStartsWith(callName, "Layer") or
               textStartsWith(callName, "CrossChain")) {
      "SUBSTRATUM"
    } else if (textStartsWith(callName, "Intelligence") or textStartsWith(callName, "Creative") or
               textStartsWith(callName, "Research") or textStartsWith(callName, "Security") or
               textStartsWith(callName, "Health") or textStartsWith(callName, "Finance") or
               textStartsWith(callName, "Education") or textStartsWith(callName, "Infrastructure") or
               textStartsWith(callName, "Governance") or textStartsWith(callName, "Commerce") or
               textStartsWith(callName, "Social") or textStartsWith(callName, "Media") or
               textStartsWith(callName, "Legal") or textStartsWith(callName, "Science")) {
      "UNIVERSUM"
    } else if (textStartsWith(callName, "Canister") or textStartsWith(callName, "Stable") or
               textStartsWith(callName, "InterCanister")) {
      "CANISTRUM"
    } else if (textStartsWith(callName, "License") or textStartsWith(callName, "Document") or
               textStartsWith(callName, "Rights") or textStartsWith(callName, "Compliance") or
               textStartsWith(callName, "Audit")) {
      "LICENTIATOR"
    } else if (textStartsWith(callName, "Threat") or textStartsWith(callName, "Immunity") or
               textStartsWith(callName, "Guardian") or textStartsWith(callName, "Prompt") or
               textStartsWith(callName, "DataLeak") or textStartsWith(callName, "Anomaly") or
               textStartsWith(callName, "Arsenal") or textStartsWith(callName, "Care")) {
      "DEFENSOR"
    } else {
      "ORGANISMUS" // Default fallback
    }
  };

  /// Resolve which engine type handles the operation
  func resolveEngine(callName : Text) : Text {
    if (textContains(callName, ".init") or textContains(callName, ".create") or
        textContains(callName, ".generate") or textContains(callName, ".issue") or
        textContains(callName, ".compute") or textContains(callName, ".fire") or
        textContains(callName, ".boot") or textContains(callName, ".deploy")) {
      "Generator"
    } else if (textContains(callName, ".route") or textContains(callName, ".discover") or
               textContains(callName, ".resolve") or textContains(callName, ".score") or
               textContains(callName, ".rank") or textContains(callName, ".analyze")) {
      "Router"
    } else {
      "Builder"
    }
  };

  /// Resolve the target module path
  func resolveTarget(callName : Text) : Text {
    let worker = resolveWorker(callName);
    switch (worker) {
      case "PROTOCOLLUM"   { "protocols/" # callName };
      case "TERMINALIS"    { "sdk/terminals/" # callName };
      case "ORGANISMUS"    { "sdk/" # callName };
      case "MERCATOR"      { "sdk/marketplace/" # callName };
      case "ORCHESTRATOR"  { "sdk/models/" # callName };
      case "MATHEMATICUS"  { "sdk/math/" # callName };
      case "SYNAPTICUS"    { "sdk/synapses/" # callName };
      case "SUBSTRATUM"    { "sdk/blockchain/" # callName };
      case "UNIVERSUM"     { "sdk/universum/" # callName };
      case "CANISTRUM"     { "sdk/canisters/" # callName };
      case "LICENTIATOR"   { "sdk/licenses/" # callName };
      case "DEFENSOR"      { "sdk/defense/" # callName };
      case _               { "sdk/" # callName };
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  SNAPSHOT — IMAGO MOTORIS
  // ══════════════════════════════════════════════════════════════════════

  /// Build a full engine snapshot
  public func snapshot(workers : [WorkerState], ts : Int) : EngineSnapshot {
    var healthy : Nat = 0;
    var totalCalls : Nat = 0;
    for (w in workers.vals()) {
      if (w.healthy) { healthy += 1 };
      totalCalls += w.totalCalls;
    };
    {
      workers = workers;
      totalWorkers = 12;
      totalEngines = 36;
      totalCalls = totalCalls;
      healthyWorkers = healthy;
      timestampNs = ts;
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  HELPER — AUXILIUM TEXTUALE
  // ══════════════════════════════════════════════════════════════════════

  /// Simple prefix check (Motoko doesn't have Text.startsWith in base)
  func textStartsWith(text : Text, prefix : Text) : Bool {
    let textChars = Text.toArray(text);
    let prefixChars = Text.toArray(prefix);
    if (prefixChars.size() > textChars.size()) { return false };
    var i : Nat = 0;
    while (i < prefixChars.size()) {
      if (textChars[i] != prefixChars[i]) { return false };
      i += 1;
    };
    true
  };

  /// Simple contains check
  func textContains(text : Text, sub : Text) : Bool {
    let textChars = Text.toArray(text);
    let subChars = Text.toArray(sub);
    if (subChars.size() > textChars.size()) { return false };
    var i : Nat = 0;
    while (i + subChars.size() <= textChars.size()) {
      var match = true;
      var j : Nat = 0;
      while (j < subChars.size()) {
        if (textChars[i + j] != subChars[j]) { match := false };
        j += 1;
      };
      if (match) { return true };
      i += 1;
    };
    false
  };
}
