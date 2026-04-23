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
};
