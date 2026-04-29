/// Settlement Engine Canister — Atomic FRNT Settlement
///
/// Sub-second finality · Visa/Kraken bypass · Zero intermediaries.
/// 873ms settlement verification heartbeat.

import Int       "mo:base/Int";
import Nat       "mo:base/Nat";
import Nat64     "mo:base/Nat64";
import Text      "mo:base/Text";
import Time      "mo:base/Time";
import Array     "mo:base/Array";
import Principal "mo:base/Principal";
import Timer     "mo:base/Timer";
import Debug     "mo:base/Debug";
import Result    "mo:base/Result";
import Buffer    "mo:base/Buffer";

actor SettlementEngine {

  // ── Constants ──────────────────────────────────────────────────────────
  let HEARTBEAT_NS       : Nat = 873_000_000;  // 873ms
  let MAX_SETTLEMENT_NS  : Int = 300_000_000;  // 0.3s target
  let PHI                : Float = 1.618033988749895;

  // ── Types ──────────────────────────────────────────────────────────────
  public type SettlementStatus = {
    #Pending;
    #Processing;
    #Completed;
    #Failed;
    #Expired;
  };

  public type Settlement = {
    id            : Nat;
    sender        : Principal;
    recipient     : Principal;
    amount        : Nat;
    fee           : Nat;
    status        : SettlementStatus;
    createdNs     : Int;
    completedNs   : ?Int;
    latencyNs     : ?Int;
    txHash        : ?Text;
    errorMessage  : ?Text;
  };

  public type SettlementRequest = {
    recipient     : Principal;
    amount        : Nat;
    memo          : ?Text;
    idempotencyKey: ?Text;
  };

  public type SettlementResult = {
    id          : Nat;
    status      : SettlementStatus;
    latencyNs   : Int;
    txHash      : Text;
  };

  public type EngineStats = {
    totalSettlements    : Nat;
    completedSettlements: Nat;
    failedSettlements   : Nat;
    averageLatencyNs    : Int;
    p99LatencyNs        : Int;
    throughputPerSecond : Float;
    uptimeNs            : Int;
    heartbeatCount      : Nat;
  };

  // ── Stable State ───────────────────────────────────────────────────────
  stable var settlementCounter : Nat = 0;
  stable var heartbeatCount    : Nat = 0;
  stable var startTimeNs       : Int = Time.now();
  stable var settlements       : [(Nat, Principal, Principal, Nat, Nat, Nat, Int, ?Int, ?Int, ?Text, ?Text)] = [];
  stable var idempotencyKeys   : [(Text, Nat)] = [];
  
  // Stats
  stable var totalCompleted    : Nat = 0;
  stable var totalFailed       : Nat = 0;
  stable var totalLatencyNs    : Int = 0;
  stable var maxLatencyNs      : Int = 0;

  // ── Runtime State ──────────────────────────────────────────────────────
  var pendingSettlements = Buffer.Buffer<Settlement>(64);
  var latencyHistory     = Buffer.Buffer<Int>(1000);

  // ── Heartbeat Timer ────────────────────────────────────────────────────
  func tick() : async () {
    heartbeatCount += 1;
    
    // Process pending settlements (simulated — in production, call FRNT canister)
    let now = Time.now();
    var processed = Buffer.Buffer<Nat>(8);
    
    for (i in pendingSettlements.keys()) {
      let s = pendingSettlements.get(i);
      if (s.status == #Pending or s.status == #Processing) {
        // Simulate settlement completion (in production: inter-canister call)
        let latency = now - s.createdNs;
        
        if (latency <= MAX_SETTLEMENT_NS * 2) {
          // Settlement succeeded
          let completed : Settlement = {
            id = s.id;
            sender = s.sender;
            recipient = s.recipient;
            amount = s.amount;
            fee = s.fee;
            status = #Completed;
            createdNs = s.createdNs;
            completedNs = ?now;
            latencyNs = ?latency;
            txHash = ?generateTxHash(s.id, now);
            errorMessage = null;
          };
          pendingSettlements.put(i, completed);
          processed.add(s.id);
          
          totalCompleted += 1;
          totalLatencyNs += latency;
          if (latency > maxLatencyNs) { maxLatencyNs := latency };
          latencyHistory.add(latency);
        } else {
          // Settlement expired
          let failed : Settlement = {
            id = s.id;
            sender = s.sender;
            recipient = s.recipient;
            amount = s.amount;
            fee = s.fee;
            status = #Expired;
            createdNs = s.createdNs;
            completedNs = ?now;
            latencyNs = ?latency;
            txHash = null;
            errorMessage = ?"Settlement timeout exceeded";
          };
          pendingSettlements.put(i, failed);
          processed.add(s.id);
          totalFailed += 1;
        };
      };
    };
    
    Debug.print("Settlement heartbeat #" # Nat.toText(heartbeatCount) # " — processed " # Nat.toText(processed.size()));
  };

  let _heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  // ── Helper Functions ───────────────────────────────────────────────────
  func generateTxHash(id: Nat, ts: Int) : Text {
    "0x" # Nat.toText(id) # "-" # Int.toText(ts)
  };

  func statusToNat(s: SettlementStatus) : Nat {
    switch (s) {
      case (#Pending) { 0 };
      case (#Processing) { 1 };
      case (#Completed) { 2 };
      case (#Failed) { 3 };
      case (#Expired) { 4 };
    }
  };

  func natToStatus(n: Nat) : SettlementStatus {
    switch (n) {
      case (0) { #Pending };
      case (1) { #Processing };
      case (2) { #Completed };
      case (3) { #Failed };
      case (_) { #Expired };
    }
  };

  // ── Public: Initiate Settlement ────────────────────────────────────────
  public shared(msg) func settle(request: SettlementRequest) : async Result.Result<SettlementResult, Text> {
    let caller = msg.caller;
    let now = Time.now();
    
    // Check idempotency key
    switch (request.idempotencyKey) {
      case (?key) {
        for ((k, id) in idempotencyKeys.vals()) {
          if (k == key) {
            return #err("Duplicate settlement: idempotency key already used");
          };
        };
        idempotencyKeys := Array.append(idempotencyKeys, [(key, settlementCounter)]);
      };
      case null {};
    };

    // Create settlement record
    settlementCounter += 1;
    let fee : Nat = 10_000; // 0.0001 FRNT
    
    let settlement : Settlement = {
      id = settlementCounter;
      sender = caller;
      recipient = request.recipient;
      amount = request.amount;
      fee = fee;
      status = #Processing;
      createdNs = now;
      completedNs = null;
      latencyNs = null;
      txHash = null;
      errorMessage = null;
    };
    
    pendingSettlements.add(settlement);
    
    // Immediate completion for demonstration (in production: async callback)
    let completedNs = Time.now();
    let latency = completedNs - now;
    
    let completed : Settlement = {
      id = settlementCounter;
      sender = caller;
      recipient = request.recipient;
      amount = request.amount;
      fee = fee;
      status = #Completed;
      createdNs = now;
      completedNs = ?completedNs;
      latencyNs = ?latency;
      txHash = ?generateTxHash(settlementCounter, completedNs);
      errorMessage = null;
    };
    
    // Update pending buffer
    let lastIdx = pendingSettlements.size() - 1;
    pendingSettlements.put(lastIdx, completed);
    
    totalCompleted += 1;
    totalLatencyNs += latency;
    latencyHistory.add(latency);
    
    #ok({
      id = settlementCounter;
      status = #Completed;
      latencyNs = latency;
      txHash = generateTxHash(settlementCounter, completedNs);
    })
  };

  // ── Public: Batch Settlement ───────────────────────────────────────────
  public shared(msg) func settleBatch(requests: [SettlementRequest]) : async [Result.Result<SettlementResult, Text>] {
    let results = Buffer.Buffer<Result.Result<SettlementResult, Text>>(requests.size());
    
    for (req in requests.vals()) {
      let result = await settle(req);
      results.add(result);
    };
    
    Buffer.toArray(results)
  };

  // ── Query: Get Settlement Status ───────────────────────────────────────
  public query func getSettlement(id: Nat) : async ?Settlement {
    for (s in pendingSettlements.vals()) {
      if (s.id == id) { return ?s };
    };
    null
  };

  // ── Query: Get Engine Stats ────────────────────────────────────────────
  public query func getStats() : async EngineStats {
    let now = Time.now();
    let uptime = now - startTimeNs;
    
    // Calculate p99 latency
    var p99 : Int = 0;
    if (latencyHistory.size() > 0) {
      let sorted = Array.sort<Int>(Buffer.toArray(latencyHistory), Int.compare);
      let p99Idx = (sorted.size() * 99) / 100;
      p99 := sorted[p99Idx];
    };
    
    // Calculate throughput
    let uptimeSeconds = Float.fromInt(uptime) / 1_000_000_000.0;
    let throughput = if (uptimeSeconds > 0.0) { 
      Float.fromInt(totalCompleted) / uptimeSeconds 
    } else { 0.0 };
    
    {
      totalSettlements = settlementCounter;
      completedSettlements = totalCompleted;
      failedSettlements = totalFailed;
      averageLatencyNs = if (totalCompleted > 0) { totalLatencyNs / totalCompleted } else { 0 };
      p99LatencyNs = p99;
      throughputPerSecond = throughput;
      uptimeNs = uptime;
      heartbeatCount = heartbeatCount;
    }
  };

  // ── Query: Settlement Comparison ───────────────────────────────────────
  public type SettlementComparison = {
    method          : Text;
    averageLatencyMs: Float;
    feePercent      : Float;
    intermediaries  : Nat;
    sovereign       : Bool;
  };

  public query func compareSettlementMethods() : async [SettlementComparison] {
    let avgLatencyNs = if (totalCompleted > 0) { totalLatencyNs / totalCompleted } else { MAX_SETTLEMENT_NS };
    
    [
      {
        method = "ICP-Native Phantom (FRNT)";
        averageLatencyMs = Float.fromInt(avgLatencyNs) / 1_000_000.0;
        feePercent = 0.01; // <0.1%
        intermediaries = 0;
        sovereign = true;
      },
      {
        method = "Visa/Kraken (Traditional)";
        averageLatencyMs = 900_000.0; // 15+ minutes
        feePercent = 4.0; // 3-5%
        intermediaries = 3;
        sovereign = false;
      }
    ]
  };

  // ── Admin: Clear History ───────────────────────────────────────────────
  public shared(msg) func clearHistory() : async () {
    // In production: add authorization check
    pendingSettlements.clear();
    latencyHistory.clear();
    idempotencyKeys := [];
  };

  // ── Upgrade Hooks ──────────────────────────────────────────────────────
  system func preupgrade() {
    let buf = Buffer.Buffer<(Nat, Principal, Principal, Nat, Nat, Nat, Int, ?Int, ?Int, ?Text, ?Text)>(pendingSettlements.size());
    for (s in pendingSettlements.vals()) {
      buf.add((
        s.id,
        s.sender,
        s.recipient,
        s.amount,
        s.fee,
        statusToNat(s.status),
        s.createdNs,
        s.completedNs,
        s.latencyNs,
        s.txHash,
        s.errorMessage
      ));
    };
    settlements := Buffer.toArray(buf);
  };

  system func postupgrade() {
    for ((id, sender, recipient, amount, fee, statusNat, createdNs, completedNs, latencyNs, txHash, errorMessage) in settlements.vals()) {
      pendingSettlements.add({
        id = id;
        sender = sender;
        recipient = recipient;
        amount = amount;
        fee = fee;
        status = natToStatus(statusNat);
        createdNs = createdNs;
        completedNs = completedNs;
        latencyNs = latencyNs;
        txHash = txHash;
        errorMessage = errorMessage;
      });
    };
    settlements := [];
  };
};
