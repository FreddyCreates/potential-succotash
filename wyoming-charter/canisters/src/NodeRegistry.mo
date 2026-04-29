/// Node Registry Canister — 50-Node Neural Emergence Grid
///
/// Manages Gen 3 node provider infrastructure across ICP, Web, and Edge substrates.
/// Wyoming/Nebraska/Texas geographic coverage.

import Int       "mo:base/Int";
import Nat       "mo:base/Nat";
import Text      "mo:base/Text";
import Time      "mo:base/Time";
import Array     "mo:base/Array";
import Principal "mo:base/Principal";
import Timer     "mo:base/Timer";
import Debug     "mo:base/Debug";
import Result    "mo:base/Result";
import Buffer    "mo:base/Buffer";
import Float     "mo:base/Float";

actor NodeRegistry {

  // ── Constants ──────────────────────────────────────────────────────────
  let HEARTBEAT_NS   : Nat = 873_000_000;  // 873ms
  let MAX_NODES      : Nat = 50;
  let PHI            : Float = 1.618033988749895;

  // ── Types ──────────────────────────────────────────────────────────────
  public type Substrate = {
    #ICP;
    #Web;
    #Edge;
  };

  public type NodeStatus = {
    #Active;
    #Pending;
    #Deploying;
    #Offline;
    #Maintenance;
  };

  public type GeographicRegion = {
    code      : Text;   // e.g., "EDGE-NE-01"
    name      : Text;   // e.g., "Lincoln, NE"
    state     : Text;   // e.g., "Nebraska"
    facility  : ?Text;  // e.g., "Federal Reserve Vault"
    latitude  : Float;
    longitude : Float;
  };

  public type Node = {
    id            : Text;
    substrate     : Substrate;
    region        : GeographicRegion;
    status        : NodeStatus;
    icpEarning    : Bool;
    ssuWrapped    : Bool;
    principalId   : ?Principal;
    uptimePercent : Float;
    lastHeartbeat : Int;
    registeredAt  : Int;
  };

  public type NodeHealth = {
    nodeId        : Text;
    isHealthy     : Bool;
    latencyMs     : Float;
    uptimePercent : Float;
    lastCheck     : Int;
  };

  public type GridStats = {
    totalNodes      : Nat;
    activeNodes     : Nat;
    pendingNodes    : Nat;
    deployingNodes  : Nat;
    offlineNodes    : Nat;
    icpNodes        : Nat;
    webNodes        : Nat;
    edgeNodes       : Nat;
    icpRewardNodes  : Nat;
    ssuWrappedNodes : Nat;
    averageUptime   : Float;
    heartbeatCount  : Nat;
  };

  // ── Stable State ───────────────────────────────────────────────────────
  stable var heartbeatCount : Nat = 0;
  stable var nodeEntries    : [(Text, Nat, Text, Text, Text, ?Text, Float, Float, Nat, Bool, Bool, ?Principal, Float, Int, Int)] = [];

  // ── Runtime State ──────────────────────────────────────────────────────
  var nodes = Buffer.Buffer<Node>(MAX_NODES);

  // ── Heartbeat Timer ────────────────────────────────────────────────────
  func tick() : async () {
    heartbeatCount += 1;
    
    // Update node health checks (simulated)
    let now = Time.now();
    for (i in nodes.keys()) {
      let node = nodes.get(i);
      if (node.status == #Active) {
        // Simulate health update
        let updated : Node = {
          id = node.id;
          substrate = node.substrate;
          region = node.region;
          status = node.status;
          icpEarning = node.icpEarning;
          ssuWrapped = node.ssuWrapped;
          principalId = node.principalId;
          uptimePercent = node.uptimePercent;
          lastHeartbeat = now;
          registeredAt = node.registeredAt;
        };
        nodes.put(i, updated);
      };
    };
    
    Debug.print("Node Registry heartbeat #" # Nat.toText(heartbeatCount) # " — " # Nat.toText(nodes.size()) # " nodes");
  };

  let _heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  // ── Helper Functions ───────────────────────────────────────────────────
  func substrateToNat(s: Substrate) : Nat {
    switch (s) {
      case (#ICP) { 0 };
      case (#Web) { 1 };
      case (#Edge) { 2 };
    }
  };

  func natToSubstrate(n: Nat) : Substrate {
    switch (n) {
      case (0) { #ICP };
      case (1) { #Web };
      case (_) { #Edge };
    }
  };

  func statusToNat(s: NodeStatus) : Nat {
    switch (s) {
      case (#Active) { 0 };
      case (#Pending) { 1 };
      case (#Deploying) { 2 };
      case (#Offline) { 3 };
      case (#Maintenance) { 4 };
    }
  };

  func natToStatus(n: Nat) : NodeStatus {
    switch (n) {
      case (0) { #Active };
      case (1) { #Pending };
      case (2) { #Deploying };
      case (3) { #Offline };
      case (_) { #Maintenance };
    }
  };

  // ── Public: Register Node ──────────────────────────────────────────────
  public shared(msg) func registerNode(
    id: Text,
    substrate: Substrate,
    regionCode: Text,
    regionName: Text,
    state: Text,
    facility: ?Text,
    lat: Float,
    lon: Float
  ) : async Result.Result<Node, Text> {
    // Check max nodes
    if (nodes.size() >= MAX_NODES) {
      return #err("Maximum node capacity reached (50 nodes)");
    };

    // Check duplicate ID
    for (node in nodes.vals()) {
      if (node.id == id) {
        return #err("Node ID already registered: " # id);
      };
    };

    let now = Time.now();
    let region : GeographicRegion = {
      code = regionCode;
      name = regionName;
      state = state;
      facility = facility;
      latitude = lat;
      longitude = lon;
    };

    let node : Node = {
      id = id;
      substrate = substrate;
      region = region;
      status = #Pending;
      icpEarning = substrate == #ICP;
      ssuWrapped = false;
      principalId = ?msg.caller;
      uptimePercent = 0.0;
      lastHeartbeat = now;
      registeredAt = now;
    };

    nodes.add(node);
    #ok(node)
  };

  // ── Public: Activate Node ──────────────────────────────────────────────
  public shared(msg) func activateNode(id: Text) : async Result.Result<Node, Text> {
    for (i in nodes.keys()) {
      let node = nodes.get(i);
      if (node.id == id) {
        let updated : Node = {
          id = node.id;
          substrate = node.substrate;
          region = node.region;
          status = #Active;
          icpEarning = node.icpEarning;
          ssuWrapped = node.ssuWrapped;
          principalId = node.principalId;
          uptimePercent = 100.0;
          lastHeartbeat = Time.now();
          registeredAt = node.registeredAt;
        };
        nodes.put(i, updated);
        return #ok(updated);
      };
    };
    #err("Node not found: " # id)
  };

  // ── Public: Set SSU Wrapped ────────────────────────────────────────────
  public shared(msg) func setSSUWrapped(id: Text, wrapped: Bool) : async Result.Result<Node, Text> {
    for (i in nodes.keys()) {
      let node = nodes.get(i);
      if (node.id == id) {
        let updated : Node = {
          id = node.id;
          substrate = node.substrate;
          region = node.region;
          status = node.status;
          icpEarning = node.icpEarning;
          ssuWrapped = wrapped;
          principalId = node.principalId;
          uptimePercent = node.uptimePercent;
          lastHeartbeat = node.lastHeartbeat;
          registeredAt = node.registeredAt;
        };
        nodes.put(i, updated);
        return #ok(updated);
      };
    };
    #err("Node not found: " # id)
  };

  // ── Query: Get All Nodes ───────────────────────────────────────────────
  public query func getNodes() : async [Node] {
    Buffer.toArray(nodes)
  };

  // ── Query: Get Node by ID ──────────────────────────────────────────────
  public query func getNode(id: Text) : async ?Node {
    for (node in nodes.vals()) {
      if (node.id == id) { return ?node };
    };
    null
  };

  // ── Query: Get Nodes by Substrate ──────────────────────────────────────
  public query func getNodesBySubstrate(substrate: Substrate) : async [Node] {
    let filtered = Buffer.Buffer<Node>(16);
    for (node in nodes.vals()) {
      if (node.substrate == substrate) {
        filtered.add(node);
      };
    };
    Buffer.toArray(filtered)
  };

  // ── Query: Get Nodes by State ──────────────────────────────────────────
  public query func getNodesByState(state: Text) : async [Node] {
    let filtered = Buffer.Buffer<Node>(16);
    for (node in nodes.vals()) {
      if (node.region.state == state) {
        filtered.add(node);
      };
    };
    Buffer.toArray(filtered)
  };

  // ── Query: Get Grid Stats ──────────────────────────────────────────────
  public query func getGridStats() : async GridStats {
    var active = 0;
    var pending = 0;
    var deploying = 0;
    var offline = 0;
    var icp = 0;
    var web = 0;
    var edge = 0;
    var icpReward = 0;
    var ssuWrapped = 0;
    var totalUptime : Float = 0.0;

    for (node in nodes.vals()) {
      switch (node.status) {
        case (#Active) { active += 1 };
        case (#Pending) { pending += 1 };
        case (#Deploying) { deploying += 1 };
        case (#Offline) { offline += 1 };
        case (#Maintenance) { offline += 1 };
      };
      switch (node.substrate) {
        case (#ICP) { icp += 1 };
        case (#Web) { web += 1 };
        case (#Edge) { edge += 1 };
      };
      if (node.icpEarning) { icpReward += 1 };
      if (node.ssuWrapped) { ssuWrapped += 1 };
      totalUptime += node.uptimePercent;
    };

    let avgUptime = if (nodes.size() > 0) { totalUptime / Float.fromInt(nodes.size()) } else { 0.0 };

    {
      totalNodes = nodes.size();
      activeNodes = active;
      pendingNodes = pending;
      deployingNodes = deploying;
      offlineNodes = offline;
      icpNodes = icp;
      webNodes = web;
      edgeNodes = edge;
      icpRewardNodes = icpReward;
      ssuWrappedNodes = ssuWrapped;
      averageUptime = avgUptime;
      heartbeatCount = heartbeatCount;
    }
  };

  // ── Admin: Bootstrap Initial Grid ──────────────────────────────────────
  public shared(msg) func bootstrapGrid() : async Nat {
    // Clear existing nodes
    nodes.clear();
    let now = Time.now();

    // ICP nodes (32)
    let icpRegions = [
      ("ICP-NA-1", "North America 1", "US", 40.0, -100.0),
      ("ICP-NA-2", "North America 2", "US", 35.0, -85.0),
      ("ICP-EU-1", "Europe 1", "EU", 50.0, 10.0),
      ("ICP-EU-2", "Europe 2", "EU", 48.0, 2.0),
      ("ICP-AS-1", "Asia 1", "AS", 35.0, 135.0),
      ("ICP-AS-2", "Asia 2", "AS", 1.0, 103.0)
    ];

    for ((code, name, state, lat, lon) in icpRegions.vals()) {
      let node : Node = {
        id = code;
        substrate = #ICP;
        region = { code = code; name = name; state = state; facility = null; latitude = lat; longitude = lon };
        status = #Active;
        icpEarning = true;
        ssuWrapped = true;
        principalId = null;
        uptimePercent = 99.9;
        lastHeartbeat = now;
        registeredAt = now;
      };
      nodes.add(node);
    };

    // Edge nodes (8) - Wyoming, Nebraska, Texas
    let edgeRegions = [
      ("EDGE-WY-01", "Cheyenne, WY", "Wyoming", null : ?Text, 41.14, -104.82),
      ("EDGE-WY-02", "Cheyenne, WY", "Wyoming", null, 41.14, -104.82),
      ("EDGE-WY-03", "Cheyenne, WY", "Wyoming", null, 41.14, -104.82),
      ("EDGE-NE-01", "Lincoln, NE", "Nebraska", ?"Federal Reserve Vault - 134 S 13th St", 40.81, -96.70),
      ("EDGE-NE-02", "Lincoln, NE", "Nebraska", ?"Federal Reserve Vault - 134 S 13th St", 40.81, -96.70),
      ("EDGE-NE-03", "Lincoln, NE", "Nebraska", ?"Federal Reserve Vault - 134 S 13th St", 40.81, -96.70),
      ("EDGE-TX-01", "Dallas, TX", "Texas", null, 32.78, -96.80),
      ("EDGE-TX-02", "Dallas, TX", "Texas", null, 32.78, -96.80)
    ];

    for ((code, name, state, facility, lat, lon) in edgeRegions.vals()) {
      let node : Node = {
        id = code;
        substrate = #Edge;
        region = { code = code; name = name; state = state; facility = facility; latitude = lat; longitude = lon };
        status = #Pending;
        icpEarning = false;
        ssuWrapped = false;
        principalId = null;
        uptimePercent = 0.0;
        lastHeartbeat = now;
        registeredAt = now;
      };
      nodes.add(node);
    };

    // Web nodes (10)
    for (i in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].vals()) {
      let code = "WEB-" # Nat.toText(i);
      let node : Node = {
        id = code;
        substrate = #Web;
        region = { code = code; name = "Web Edge " # Nat.toText(i); state = "Global"; facility = null; latitude = 0.0; longitude = 0.0 };
        status = if (i < 5) { #Active } else { #Deploying };
        icpEarning = false;
        ssuWrapped = false;
        principalId = null;
        uptimePercent = if (i < 5) { 99.5 } else { 0.0 };
        lastHeartbeat = now;
        registeredAt = now;
      };
      nodes.add(node);
    };

    // Fill to 50 with more ICP nodes
    var idx = 6;
    while (nodes.size() < 50) {
      let code = "ICP-EXPAND-" # Nat.toText(idx);
      let node : Node = {
        id = code;
        substrate = #ICP;
        region = { code = code; name = "ICP Expansion " # Nat.toText(idx); state = "Global"; facility = null; latitude = 0.0; longitude = 0.0 };
        status = #Pending;
        icpEarning = true;
        ssuWrapped = false;
        principalId = null;
        uptimePercent = 0.0;
        lastHeartbeat = now;
        registeredAt = now;
      };
      nodes.add(node);
      idx += 1;
    };

    nodes.size()
  };

  // ── Upgrade Hooks ──────────────────────────────────────────────────────
  system func preupgrade() {
    let buf = Buffer.Buffer<(Text, Nat, Text, Text, Text, ?Text, Float, Float, Nat, Bool, Bool, ?Principal, Float, Int, Int)>(nodes.size());
    for (node in nodes.vals()) {
      buf.add((
        node.id,
        substrateToNat(node.substrate),
        node.region.code,
        node.region.name,
        node.region.state,
        node.region.facility,
        node.region.latitude,
        node.region.longitude,
        statusToNat(node.status),
        node.icpEarning,
        node.ssuWrapped,
        node.principalId,
        node.uptimePercent,
        node.lastHeartbeat,
        node.registeredAt
      ));
    };
    nodeEntries := Buffer.toArray(buf);
  };

  system func postupgrade() {
    for ((id, substrateNat, code, name, state, facility, lat, lon, statusNat, icpEarning, ssuWrapped, principalId, uptime, lastHb, regAt) in nodeEntries.vals()) {
      nodes.add({
        id = id;
        substrate = natToSubstrate(substrateNat);
        region = { code = code; name = name; state = state; facility = facility; latitude = lat; longitude = lon };
        status = natToStatus(statusNat);
        icpEarning = icpEarning;
        ssuWrapped = ssuWrapped;
        principalId = principalId;
        uptimePercent = uptime;
        lastHeartbeat = lastHb;
        registeredAt = regAt;
      });
    };
    nodeEntries := [];
  };
};
