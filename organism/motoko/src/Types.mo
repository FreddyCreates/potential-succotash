/// Shared types for the Sovereign Organism canister.
/// 4-register state architecture: Cognitive / Affective / Somatic / Sovereign.

module {

  /// A single register holds named float values representing internal state dimensions.
  public type RegisterState = {
    awareness   : Float;
    coherence   : Float;
    resonance   : Float;
    entropy     : Float;
  };

  /// Full organism snapshot frozen at a point in time.
  public type OrganismSnapshot = {
    beatCount   : Nat;
    cognitive   : RegisterState;
    affective   : RegisterState;
    somatic     : RegisterState;
    sovereign   : RegisterState;
    timestampNs : Int;
  };

  /// Phi-weighted vitality score across all registers.
  public type VitalityScore = {
    overall     : Float;
    cognitive   : Float;
    affective   : Float;
    somatic     : Float;
    sovereign   : Float;
    phiRatio    : Float;
  };

  /// Edge sensor reading from the organism runtime.
  public type SensorReading = {
    sensorId    : Text;
    sensorType  : Text;  // "temperature" | "network" | "resource" | "signal" | "custom"
    value       : Float;
    unit        : Text;
    timestampNs : Int;
  };

  /// Result of multi-model fusion with phi-weighted scoring.
  public type FusionResult = {
    prompt         : Text;
    fusedOutput    : Text;
    confidence     : Float;
    modelsUsed     : [Text];
    phiWeight      : Float;
    processingMs   : Nat;
  };

  /// Routing result for alpha-model selection.
  public type RoutingResult = {
    task           : Text;
    selectedModel  : Text;
    score          : Float;
    reasoning      : Text;
    alternates     : [Text];
  };

  // ── JARVISIUS Types ───────────────────────────────────────────────────

  /// A note stored by the Jarvisius canister.
  public type JarvisNote = {
    id          : Text;
    content     : Text;
    owner       : Text;
    timestampNs : Int;
  };

  /// A command logged by the Jarvisius canister.
  public type JarvisCommand = {
    id          : Text;
    intent      : Text;
    payload     : Text;
    owner       : Text;
    timestampNs : Int;
  };

  /// A document stored by the Jarvisius canister.
  public type JarvisDocument = {
    id          : Text;
    docType     : Text;
    content     : Text;
    owner       : Text;
    timestampNs : Int;
  };

  /// A tab action logged by the Jarvisius canister.
  public type JarvisTabAction = {
    id          : Text;
    actionType  : Text;
    tabInfo     : Text;
    owner       : Text;
    timestampNs : Int;
  };

  /// Snapshot of the Jarvisius canister state.
  public type JarvisSnapshot = {
    heartbeatCount : Nat;
    noteCount      : Nat;
    commandCount   : Nat;
    documentCount  : Nat;
    tabActionCount : Nat;
    owner          : Text;
    timestampNs    : Int;
  };
};
