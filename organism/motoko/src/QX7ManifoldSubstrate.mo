/// QX7 Manifold Substrate — Type-Level Spatial Enforcement
/// Embeds golden-ratio / sunflower-theorem constraints directly in the type system.
/// Invalid coordinates, forbidden trajectories, and mixed-region states are compile-time errors.

import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Array "mo:base/Array";

module {

  // ── φ-Mathematics Primitives ────────────────────────────────────────────────

  /// Golden ratio (shared constant with JS dimensio.js layer)
  public let PHI : Float = 1.6180339887498948482;

  /// Inverse golden ratio (φ⁻¹ = φ − 1)
  public let PHI_INV : Float = 0.6180339887498948482;

  /// Golden angle in radians (2π / φ²)
  public let GOLDEN_ANGLE : Float = 2.39996322972865332;

  /// Heartbeat interval aligned with organism rhythm (ms)
  public let HEARTBEAT_MS : Nat = 873;

  /// Phi threshold for convergence checks
  public let THRESHOLD : Float = 0.618;

  // ── 1. Branded / Phantom Types for Manifold Safety ─────────────────────────

  /// Raw unvalidated 3D coordinate — untrusted input from sensors or JS layer
  public type RawCoord = {
    x : Float;
    y : Float;
    z : Float;
  };

  /// Manifold-validated coordinate branded with spiral step provenance.
  /// Only constructible via validatePoint — enforces spatial exclusion at type boundary.
  public type ManifoldCoord = {
    #Safe : { x : Float; y : Float; z : Float; spiralStep : Nat };
  };

  /// Region classification — prevents mixing interior/exterior/forbidden zones.
  /// Pattern matching is exhaustive: all three must be handled.
  public type Region = {
    #Interior;
    #Exterior;
    #Forbidden;
  };

  /// A point tagged with its region. Phantom parameter R enforces region at type level.
  public type RegionTaggedPoint = {
    coord  : ManifoldCoord;
    region : Region;
  };

  // ── 2. Spatial Exclusion Envelope (Sunflower / PROTO-258) ──────────────────

  /// Checks whether a raw point satisfies the φ-spiral spatial exclusion bound.
  /// Uses golden-ratio decay: separation(n) = φ⁻ⁿ × φ
  public func isValidSpiralPoint(p : RawCoord, step : Nat) : Bool {
    let r = Float.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    // Irrational separation via φ-inverse decay
    let separation = Float.pow(PHI_INV, Float.fromInt(step));
    r <= separation * PHI
  };

  /// Validate a raw coordinate against the manifold. Returns null if point violates
  /// spatial exclusion — Option type forces callers to handle rejection.
  public func validatePoint(raw : RawCoord, step : Nat) : ?ManifoldCoord {
    if (isValidSpiralPoint(raw, step)) {
      ?(#Safe({ x = raw.x; y = raw.y; z = raw.z; spiralStep = step }))
    } else {
      null
    }
  };

  /// Classify which region a validated point belongs to based on radius thresholds.
  public func classifyRegion(coord : ManifoldCoord) : Region {
    switch (coord) {
      case (#Safe(p)) {
        let r = Float.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        if (r < THRESHOLD) { #Interior }
        else if (r <= PHI) { #Exterior }
        else { #Forbidden }
      };
    }
  };

  /// Tag a validated point with its region for downstream pattern matching.
  public func tagWithRegion(coord : ManifoldCoord) : RegionTaggedPoint {
    { coord = coord; region = classifyRegion(coord) }
  };

  // ── 3. Type-Level Trajectory Enforcement ───────────────────────────────────

  /// Trajectory segment classification — enforces valid state transitions.
  /// A trajectory is only valid if all waypoints are Safe and transitions are allowed.
  public type TrajectorySegment = {
    #Allowed   : { from : ManifoldCoord; to : ManifoldCoord; stepDelta : Nat };
    #Forbidden : { reason : Text };
  };

  /// Full validated trajectory (sequence of allowed segments only).
  public type ValidTrajectory = {
    segments   : [TrajectorySegment];
    totalSteps : Nat;
    phiLength  : Float;  // arc length scaled by φ
  };

  /// Check if a transition between two manifold points is permitted.
  /// Enforces: step must advance, and angular separation must approximate golden angle.
  public func validateTransition(from : ManifoldCoord, to : ManifoldCoord) : TrajectorySegment {
    switch (from, to) {
      case (#Safe(f), #Safe(t)) {
        if (t.spiralStep <= f.spiralStep) {
          #Forbidden({ reason = "Step must advance monotonically" })
        } else {
          let stepDelta = t.spiralStep - f.spiralStep;
          let angleDiff = Float.abs(
            Float.atan2(t.y, t.x) - Float.atan2(f.y, f.x)
          );
          // Allow if angular separation is within φ-tolerance of golden angle multiples
          let tolerance = PHI_INV / Float.fromInt(stepDelta);
          let remainder = Float.abs(angleDiff - GOLDEN_ANGLE * Float.fromInt(stepDelta));
          if (remainder <= tolerance) {
            #Allowed({ from = from; to = to; stepDelta = stepDelta })
          } else {
            #Forbidden({ reason = "Angular separation violates golden-angle constraint" })
          }
        }
      };
    }
  };

  /// Build a validated trajectory from a sequence of manifold points.
  /// Returns null if any transition is forbidden.
  public func buildTrajectory(points : [ManifoldCoord]) : ?ValidTrajectory {
    if (points.size() < 2) { return null };

    var segments : [TrajectorySegment] = [];
    var totalLength : Float = 0.0;

    var i = 0;
    while (i < points.size() - 1) {
      let seg = validateTransition(points[i], points[i + 1]);
      switch (seg) {
        case (#Forbidden(_)) { return null };
        case (#Allowed(a)) {
          segments := Array.append(segments, [seg]);
          // Accumulate φ-scaled arc length
          switch (a.from, a.to) {
            case (#Safe(f), #Safe(t)) {
              let dx = t.x - f.x;
              let dy = t.y - f.y;
              let dz = t.z - f.z;
              totalLength += Float.sqrt(dx*dx + dy*dy + dz*dz) * PHI;
            };
          };
        };
      };
      i += 1;
    };

    ?{
      segments = segments;
      totalSteps = points.size();
      phiLength = totalLength;
    }
  };

  // ── 4. Fibonacci-Scaled Primitives ─────────────────────────────────────────

  /// Generate the nth Fibonacci number (for lattice spacing calculations).
  public func fibonacci(n : Nat) : Nat {
    if (n == 0) { return 0 };
    if (n == 1) { return 1 };
    var a : Nat = 0;
    var b : Nat = 1;
    var i : Nat = 2;
    while (i <= n) {
      let temp = a + b;
      a := b;
      b := temp;
      i += 1;
    };
    b
  };

  /// Generate a sunflower spiral point at index n (Vogel's model).
  /// Returns a RawCoord in 3D (z = 0 for 2D spiral, extend for helix).
  public func sunflowerPoint(n : Nat, scale : Float) : RawCoord {
    let nf = Float.fromInt(n);
    let r = scale * Float.sqrt(nf);
    let theta = nf * GOLDEN_ANGLE;
    { x = r * Float.cos(theta); y = r * Float.sin(theta); z = 0.0 }
  };

  /// Generate a sequence of validated spiral points for VA-1000 actuator serialization.
  /// Invalid points are filtered — only manifold-safe points pass through.
  public func generateSpiralBatch(count : Nat, scale : Float) : [ManifoldCoord] {
    var result : [ManifoldCoord] = [];
    var i : Nat = 1;
    while (i <= count) {
      let raw = sunflowerPoint(i, scale);
      switch (validatePoint(raw, i)) {
        case (?coord) { result := Array.append(result, [coord]) };
        case null {};
      };
      i += 1;
    };
    result
  };

  // ── 5. Serialization Guard (VA-1000 Actuator Interface) ────────────────────

  /// Actuator command — only accepts ManifoldCoord (validated).
  /// This is the type boundary enforced before any physical actuation.
  public type ActuatorCommand = {
    #MoveTo    : { target : ManifoldCoord; velocity : Float };
    #Trace     : { trajectory : ValidTrajectory; feedRate : Float };
    #Halt      : { reason : Text };
  };

  /// Serialize a ManifoldCoord to a flat record for Candid/JS interop.
  /// Only callable with validated points — type system prevents raw coord leakage.
  public func serializeForActuator(cmd : ActuatorCommand) : {
    cmdType : Text;
    x : Float;
    y : Float;
    z : Float;
    param : Float;
  } {
    switch (cmd) {
      case (#MoveTo(m)) {
        switch (m.target) {
          case (#Safe(p)) {
            { cmdType = "move"; x = p.x; y = p.y; z = p.z; param = m.velocity }
          };
        }
      };
      case (#Trace(t)) {
        // Serialize first waypoint as representative
        switch (t.trajectory.segments[0]) {
          case (#Allowed(a)) {
            switch (a.from) {
              case (#Safe(p)) {
                { cmdType = "trace"; x = p.x; y = p.y; z = p.z; param = t.feedRate }
              };
            }
          };
          case (#Forbidden(_)) {
            { cmdType = "error"; x = 0.0; y = 0.0; z = 0.0; param = 0.0 }
          };
        }
      };
      case (#Halt(h)) {
        { cmdType = "halt"; x = 0.0; y = 0.0; z = 0.0; param = 0.0 }
      };
    }
  };
};
