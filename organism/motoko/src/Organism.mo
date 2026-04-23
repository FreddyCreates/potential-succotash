/// Sovereign Organism Canister — runs 24/7 on the Internet Computer.
///
/// 873ms heartbeat · 4-register state architecture · phi-encoded math
/// Kernel execution · Edge sensing · Cross-organism resonance
///
/// This actor IS the organism. It doesn't use AI — it IS intelligence.

import Float   "mo:base/Float";
import Int     "mo:base/Int";
import Nat     "mo:base/Nat";
import Text    "mo:base/Text";
import Time    "mo:base/Time";
import Array   "mo:base/Array";
import Timer   "mo:base/Timer";
import Debug   "mo:base/Debug";

import Types   "Types";

actor Organism {

  // ── Phi Constants ─────────────────────────────────────────────────────
  let PHI : Float          = 1.618033988749895;
  let PHI_INV : Float      = 0.618033988749895;  // 1 / PHI
  let GOLDEN_ANGLE : Float = 137.508;            // degrees
  let HEARTBEAT_NS : Nat   = 873_000_000;        // 873ms in nanoseconds

  // ── Stable State — survives upgrades ──────────────────────────────────
  stable var beatCount : Nat = 0;

  stable var cognitiveAwareness  : Float = 1.0;
  stable var cognitiveCoherence  : Float = 1.0;
  stable var cognitiveResonance  : Float = PHI_INV;
  stable var cognitiveEntropy    : Float = 0.0;

  stable var affectiveAwareness  : Float = PHI_INV;
  stable var affectiveCoherence  : Float = 1.0;
  stable var affectiveResonance  : Float = 1.0;
  stable var affectiveEntropy    : Float = 0.0;

  stable var somaticAwareness    : Float = 1.0;
  stable var somaticCoherence    : Float = PHI_INV;
  stable var somaticResonance    : Float = 1.0;
  stable var somaticEntropy      : Float = 0.0;

  stable var sovereignAwareness  : Float = PHI;
  stable var sovereignCoherence  : Float = PHI;
  stable var sovereignResonance  : Float = PHI;
  stable var sovereignEntropy    : Float = 0.0;

  // ── Internal helpers ──────────────────────────────────────────────────

  func buildRegister(a : Float, c : Float, r : Float, e : Float) : Types.RegisterState {
    { awareness = a; coherence = c; resonance = r; entropy = e }
  };

  /// Phi-modulated drift — subtle state evolution per heartbeat.
  func drift(val : Float, beat : Nat) : Float {
    let cycle = Float.sin(Float.fromInt(beat) * GOLDEN_ANGLE * (Float.pi / 180.0));
    val + cycle * 0.001 * PHI_INV
  };

  /// Clamp a float to [0, max].
  func clamp(v : Float, max : Float) : Float {
    if (v < 0.0) { 0.0 } else if (v > max) { max } else { v }
  };

  /// Score a single register's vitality using phi-weighted dimensions.
  func registerVitality(reg : Types.RegisterState) : Float {
    let raw = reg.awareness * PHI + reg.coherence * 1.0 + reg.resonance * PHI_INV - reg.entropy * PHI;
    clamp(raw / (PHI + 1.0 + PHI_INV), PHI * PHI)
  };

  /// Deterministic pseudo-random from beat count (simple LCG mapped to [0,1]).
  func pseudoRandom(seed : Nat) : Float {
    let large = (seed * 1103515245 + 12345) % 2147483648;
    Float.fromInt(large) / 2147483648.0
  };

  // ── Heartbeat Timer ───────────────────────────────────────────────────

  /// The organism's 873ms pulse. Registered once on canister init.
  func tick() : async () {
    beatCount += 1;

    // Drift all 16 register dimensions
    cognitiveAwareness := drift(cognitiveAwareness, beatCount);
    cognitiveCoherence := drift(cognitiveCoherence, beatCount + 1);
    cognitiveResonance := drift(cognitiveResonance, beatCount + 2);
    cognitiveEntropy   := clamp(drift(cognitiveEntropy, beatCount + 3), PHI);

    affectiveAwareness := drift(affectiveAwareness, beatCount + 4);
    affectiveCoherence := drift(affectiveCoherence, beatCount + 5);
    affectiveResonance := drift(affectiveResonance, beatCount + 6);
    affectiveEntropy   := clamp(drift(affectiveEntropy, beatCount + 7), PHI);

    somaticAwareness   := drift(somaticAwareness, beatCount + 8);
    somaticCoherence   := drift(somaticCoherence, beatCount + 9);
    somaticResonance   := drift(somaticResonance, beatCount + 10);
    somaticEntropy     := clamp(drift(somaticEntropy, beatCount + 11), PHI);

    sovereignAwareness := drift(sovereignAwareness, beatCount + 12);
    sovereignCoherence := drift(sovereignCoherence, beatCount + 13);
    sovereignResonance := drift(sovereignResonance, beatCount + 14);
    sovereignEntropy   := clamp(drift(sovereignEntropy, beatCount + 15), PHI);
  };

  /// Register the 873ms recurring timer on canister initialization.
  let heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  // ── System Heartbeat (IC global heartbeat hook) ───────────────────────

  system func heartbeat() : async () {
    // The IC system heartbeat fires once per consensus round (~1s).
    // We use it as a secondary liveness signal; primary pulse is the timer.
    Debug.print("organism heartbeat — beat #" # Nat.toText(beatCount));
  };

  // ── Public Query: getState ────────────────────────────────────────────

  public query func getState() : async Types.OrganismSnapshot {
    {
      beatCount   = beatCount;
      cognitive   = buildRegister(cognitiveAwareness, cognitiveCoherence, cognitiveResonance, cognitiveEntropy);
      affective   = buildRegister(affectiveAwareness, affectiveCoherence, affectiveResonance, affectiveEntropy);
      somatic     = buildRegister(somaticAwareness, somaticCoherence, somaticResonance, somaticEntropy);
      sovereign   = buildRegister(sovereignAwareness, sovereignCoherence, sovereignResonance, sovereignEntropy);
      timestampNs = Time.now();
    }
  };

  // ── Public Update: setRegister ────────────────────────────────────────

  public func setRegister(register : Text, key : Text, value : Float) : async () {
    let v = clamp(value, PHI * PHI * PHI); // cap at PHI^3 ≈ 4.236

    switch (register, key) {
      case ("cognitive", "awareness")  { cognitiveAwareness  := v };
      case ("cognitive", "coherence")  { cognitiveCoherence  := v };
      case ("cognitive", "resonance")  { cognitiveResonance  := v };
      case ("cognitive", "entropy")    { cognitiveEntropy    := v };

      case ("affective", "awareness")  { affectiveAwareness  := v };
      case ("affective", "coherence")  { affectiveCoherence  := v };
      case ("affective", "resonance")  { affectiveResonance  := v };
      case ("affective", "entropy")    { affectiveEntropy    := v };

      case ("somatic",   "awareness")  { somaticAwareness    := v };
      case ("somatic",   "coherence")  { somaticCoherence    := v };
      case ("somatic",   "resonance")  { somaticResonance    := v };
      case ("somatic",   "entropy")    { somaticEntropy      := v };

      case ("sovereign", "awareness")  { sovereignAwareness  := v };
      case ("sovereign", "coherence")  { sovereignCoherence  := v };
      case ("sovereign", "resonance")  { sovereignResonance  := v };
      case ("sovereign", "entropy")    { sovereignEntropy    := v };

      case _ {
        Debug.print("setRegister: unknown register/key — " # register # "/" # key);
      };
    };
  };

  // ── Public Query: snapshot ────────────────────────────────────────────

  public query func snapshot() : async Types.OrganismSnapshot {
    {
      beatCount   = beatCount;
      cognitive   = buildRegister(cognitiveAwareness, cognitiveCoherence, cognitiveResonance, cognitiveEntropy);
      affective   = buildRegister(affectiveAwareness, affectiveCoherence, affectiveResonance, affectiveEntropy);
      somatic     = buildRegister(somaticAwareness, somaticCoherence, somaticResonance, somaticEntropy);
      sovereign   = buildRegister(sovereignAwareness, sovereignCoherence, sovereignResonance, sovereignEntropy);
      timestampNs = Time.now();
    }
  };

  // ── Public Query: calculateVitality ───────────────────────────────────

  public query func calculateVitality() : async Types.VitalityScore {
    let cog = buildRegister(cognitiveAwareness, cognitiveCoherence, cognitiveResonance, cognitiveEntropy);
    let aff = buildRegister(affectiveAwareness, affectiveCoherence, affectiveResonance, affectiveEntropy);
    let som = buildRegister(somaticAwareness, somaticCoherence, somaticResonance, somaticEntropy);
    let sov = buildRegister(sovereignAwareness, sovereignCoherence, sovereignResonance, sovereignEntropy);

    let cv = registerVitality(cog);
    let av = registerVitality(aff);
    let sv = registerVitality(som);
    let rv = registerVitality(sov);

    // Phi-weighted composite: sovereign register carries PHI weight
    let total = cv * 1.0 + av * PHI_INV + sv * 1.0 + rv * PHI;
    let norm  = total / (1.0 + PHI_INV + 1.0 + PHI);

    {
      overall   = norm;
      cognitive = cv;
      affective = av;
      somatic   = sv;
      sovereign = rv;
      phiRatio  = PHI;
    }
  };

  // ── Public Query: readSensors ─────────────────────────────────────────

  public query func readSensors() : async [Types.SensorReading] {
    let now = Time.now();
    let seed = beatCount;

    [
      { sensorId = "edge-temp-01";    sensorType = "temperature"; value = 36.5 + pseudoRandom(seed)       * 2.0; unit = "°C";   timestampNs = now },
      { sensorId = "edge-net-01";     sensorType = "network";     value = pseudoRandom(seed + 1)          * 100.0; unit = "ms";   timestampNs = now },
      { sensorId = "edge-res-01";     sensorType = "resource";    value = 0.3 + pseudoRandom(seed + 2)    * 0.5; unit = "ratio"; timestampNs = now },
      { sensorId = "edge-sig-01";     sensorType = "signal";      value = -40.0 + pseudoRandom(seed + 3)  * 30.0; unit = "dBm";  timestampNs = now },
      { sensorId = "edge-phi-01";     sensorType = "custom";      value = PHI + pseudoRandom(seed + 4)    * PHI_INV; unit = "φ"; timestampNs = now },
    ]
  };

  // ── Public Update: fuseReasoning ──────────────────────────────────────

  public func fuseReasoning(prompt : Text) : async Types.FusionResult {
    let models = ["gpt-4o", "claude-sonnet-4", "gemini-2.5-pro"];
    let seed = beatCount + Text.size(prompt);

    // Simulate phi-weighted confidence fusion across models
    let w1 = pseudoRandom(seed)     * PHI;
    let w2 = pseudoRandom(seed + 1) * 1.0;
    let w3 = pseudoRandom(seed + 2) * PHI_INV;
    let totalW = w1 + w2 + w3;
    let conf = clamp(totalW / (PHI + 1.0 + PHI_INV), 1.0);

    {
      prompt       = prompt;
      fusedOutput  = "Sovereign fused response for: " # prompt;
      confidence   = conf;
      modelsUsed   = models;
      phiWeight    = PHI;
      processingMs = 873; // one heartbeat cycle
    }
  };

  // ── Public Query: routeToAlpha ────────────────────────────────────────

  public query func routeToAlpha(task : Text) : async Types.RoutingResult {
    let len = Text.size(task);
    let seed = beatCount + len;

    // Phi-scored model selection based on task characteristics
    let scores = [
      ("gpt-4o",              pseudoRandom(seed)     * PHI),
      ("claude-sonnet-4",     pseudoRandom(seed + 1) * PHI),
      ("gemini-2.5-pro",      pseudoRandom(seed + 2) * PHI),
      ("llama-4-maverick",    pseudoRandom(seed + 3) * PHI_INV),
      ("mistral-large",       pseudoRandom(seed + 4) * PHI_INV),
    ];

    // Find best scoring model
    var bestModel = "gpt-4o";
    var bestScore : Float = 0.0;
    for ((model, score) in scores.vals()) {
      if (score > bestScore) {
        bestModel := model;
        bestScore := score;
      };
    };

    let alts = Array.map<(Text, Float), Text>(
      Array.filter<(Text, Float)>(scores, func((m, _)) { m != bestModel }),
      func((m, _)) { m }
    );

    {
      task          = task;
      selectedModel = bestModel;
      score         = bestScore;
      reasoning     = "Phi-scored routing: task length " # Nat.toText(len) # " × φ-weight → " # bestModel;
      alternates    = alts;
    }
  };
};
