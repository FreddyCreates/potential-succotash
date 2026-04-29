/// Grant Tracker Canister — Wyoming Charter Grant Pipeline
///
/// Tracks federal and state grant applications for sovereign infrastructure funding.

import Int       "mo:base/Int";
import Nat       "mo:base/Nat";
import Text      "mo:base/Text";
import Time      "mo:base/Time";
import Array     "mo:base/Array";
import Principal "mo:base/Principal";
import Result    "mo:base/Result";
import Buffer    "mo:base/Buffer";
import Float     "mo:base/Float";

actor GrantTracker {

  // ── Types ──────────────────────────────────────────────────────────────
  public type GrantStatus = {
    #Research;
    #Drafting;
    #Submitted;
    #UnderReview;
    #Awarded;
    #Rejected;
  };

  public type GrantCategory = {
    #Federal;
    #State;
    #Foundation;
    #Corporate;
    #Academic;
  };

  public type Grant = {
    id            : Nat;
    name          : Text;
    category      : GrantCategory;
    agency        : Text;
    amountMin     : Nat;  // in USD cents
    amountMax     : Nat;  // in USD cents
    status        : GrantStatus;
    notes         : Text;
    deadlineNs    : ?Int;
    submittedNs   : ?Int;
    awardedNs     : ?Int;
    createdNs     : Int;
    updatedNs     : Int;
  };

  public type GrantUpdate = {
    status    : ?GrantStatus;
    notes     : ?Text;
    amountMin : ?Nat;
    amountMax : ?Nat;
    deadlineNs: ?Int;
  };

  public type PipelineStats = {
    totalGrants       : Nat;
    researchGrants    : Nat;
    draftingGrants    : Nat;
    submittedGrants   : Nat;
    awardedGrants     : Nat;
    rejectedGrants    : Nat;
    totalPipelineMin  : Nat;
    totalPipelineMax  : Nat;
    totalAwarded      : Nat;
  };

  // ── Stable State ───────────────────────────────────────────────────────
  stable var grantCounter : Nat = 0;
  stable var grantEntries : [(Nat, Text, Nat, Text, Nat, Nat, Nat, Text, ?Int, ?Int, ?Int, Int, Int)] = [];

  // ── Runtime State ──────────────────────────────────────────────────────
  var grants = Buffer.Buffer<Grant>(32);

  // ── Helper Functions ───────────────────────────────────────────────────
  func categoryToNat(c: GrantCategory) : Nat {
    switch (c) {
      case (#Federal) { 0 };
      case (#State) { 1 };
      case (#Foundation) { 2 };
      case (#Corporate) { 3 };
      case (#Academic) { 4 };
    }
  };

  func natToCategory(n: Nat) : GrantCategory {
    switch (n) {
      case (0) { #Federal };
      case (1) { #State };
      case (2) { #Foundation };
      case (3) { #Corporate };
      case (_) { #Academic };
    }
  };

  func statusToNat(s: GrantStatus) : Nat {
    switch (s) {
      case (#Research) { 0 };
      case (#Drafting) { 1 };
      case (#Submitted) { 2 };
      case (#UnderReview) { 3 };
      case (#Awarded) { 4 };
      case (#Rejected) { 5 };
    }
  };

  func natToStatus(n: Nat) : GrantStatus {
    switch (n) {
      case (0) { #Research };
      case (1) { #Drafting };
      case (2) { #Submitted };
      case (3) { #UnderReview };
      case (4) { #Awarded };
      case (_) { #Rejected };
    }
  };

  // ── Public: Add Grant ──────────────────────────────────────────────────
  public shared(msg) func addGrant(
    name: Text,
    category: GrantCategory,
    agency: Text,
    amountMin: Nat,
    amountMax: Nat,
    notes: Text,
    deadlineNs: ?Int
  ) : async Result.Result<Grant, Text> {
    grantCounter += 1;
    let now = Time.now();

    let grant : Grant = {
      id = grantCounter;
      name = name;
      category = category;
      agency = agency;
      amountMin = amountMin;
      amountMax = amountMax;
      status = #Research;
      notes = notes;
      deadlineNs = deadlineNs;
      submittedNs = null;
      awardedNs = null;
      createdNs = now;
      updatedNs = now;
    };

    grants.add(grant);
    #ok(grant)
  };

  // ── Public: Update Grant Status ────────────────────────────────────────
  public shared(msg) func updateGrant(id: Nat, update: GrantUpdate) : async Result.Result<Grant, Text> {
    for (i in grants.keys()) {
      let grant = grants.get(i);
      if (grant.id == id) {
        let now = Time.now();
        let newStatus = switch (update.status) { case (?s) { s }; case null { grant.status } };
        let submittedNs = switch (newStatus) {
          case (#Submitted) { ?now };
          case (_) { grant.submittedNs };
        };
        let awardedNs = switch (newStatus) {
          case (#Awarded) { ?now };
          case (_) { grant.awardedNs };
        };

        let updated : Grant = {
          id = grant.id;
          name = grant.name;
          category = grant.category;
          agency = grant.agency;
          amountMin = switch (update.amountMin) { case (?a) { a }; case null { grant.amountMin } };
          amountMax = switch (update.amountMax) { case (?a) { a }; case null { grant.amountMax } };
          status = newStatus;
          notes = switch (update.notes) { case (?n) { n }; case null { grant.notes } };
          deadlineNs = switch (update.deadlineNs) { case (?d) { ?d }; case null { grant.deadlineNs } };
          submittedNs = submittedNs;
          awardedNs = awardedNs;
          createdNs = grant.createdNs;
          updatedNs = now;
        };
        grants.put(i, updated);
        return #ok(updated);
      };
    };
    #err("Grant not found: " # Nat.toText(id))
  };

  // ── Public: Mark Submitted ─────────────────────────────────────────────
  public shared(msg) func markSubmitted(id: Nat) : async Result.Result<Grant, Text> {
    await updateGrant(id, { status = ?#Submitted; notes = null; amountMin = null; amountMax = null; deadlineNs = null })
  };

  // ── Public: Mark Awarded ───────────────────────────────────────────────
  public shared(msg) func markAwarded(id: Nat, awardedAmount: Nat) : async Result.Result<Grant, Text> {
    await updateGrant(id, { status = ?#Awarded; notes = null; amountMin = ?awardedAmount; amountMax = ?awardedAmount; deadlineNs = null })
  };

  // ── Query: Get All Grants ──────────────────────────────────────────────
  public query func getGrants() : async [Grant] {
    Buffer.toArray(grants)
  };

  // ── Query: Get Grant by ID ─────────────────────────────────────────────
  public query func getGrant(id: Nat) : async ?Grant {
    for (grant in grants.vals()) {
      if (grant.id == id) { return ?grant };
    };
    null
  };

  // ── Query: Get Grants by Status ────────────────────────────────────────
  public query func getGrantsByStatus(status: GrantStatus) : async [Grant] {
    let filtered = Buffer.Buffer<Grant>(16);
    for (grant in grants.vals()) {
      if (grant.status == status) {
        filtered.add(grant);
      };
    };
    Buffer.toArray(filtered)
  };

  // ── Query: Get Pipeline Stats ──────────────────────────────────────────
  public query func getPipelineStats() : async PipelineStats {
    var research = 0;
    var drafting = 0;
    var submitted = 0;
    var awarded = 0;
    var rejected = 0;
    var pipelineMin : Nat = 0;
    var pipelineMax : Nat = 0;
    var totalAwarded : Nat = 0;

    for (grant in grants.vals()) {
      switch (grant.status) {
        case (#Research) { research += 1; pipelineMin += grant.amountMin; pipelineMax += grant.amountMax };
        case (#Drafting) { drafting += 1; pipelineMin += grant.amountMin; pipelineMax += grant.amountMax };
        case (#Submitted) { submitted += 1; pipelineMin += grant.amountMin; pipelineMax += grant.amountMax };
        case (#UnderReview) { submitted += 1; pipelineMin += grant.amountMin; pipelineMax += grant.amountMax };
        case (#Awarded) { awarded += 1; totalAwarded += grant.amountMax };
        case (#Rejected) { rejected += 1 };
      };
    };

    {
      totalGrants = grants.size();
      researchGrants = research;
      draftingGrants = drafting;
      submittedGrants = submitted;
      awardedGrants = awarded;
      rejectedGrants = rejected;
      totalPipelineMin = pipelineMin;
      totalPipelineMax = pipelineMax;
      totalAwarded = totalAwarded;
    }
  };

  // ── Admin: Bootstrap Default Grants ────────────────────────────────────
  public shared(msg) func bootstrapGrants() : async Nat {
    grants.clear();
    let now = Time.now();

    let defaultGrants : [(Text, GrantCategory, Text, Nat, Nat, Text)] = [
      ("E-Rate Program (FCC)", #Federal, "FCC", 25_000_000, 100_000_000, "Sovereign canister per school qualifies as network infrastructure. Target Dallas ISD and Nebraska districts."),
      ("Title IV-A ESSA", #Federal, "Dept of Education", 5_000_000, 50_000_000, "Technology and STEM enrichment. Agentic AI curriculum tools for schools."),
      ("TEA Innovation Grants", #State, "Texas Education Agency", 10_000_000, 75_000_000, "TEKS-mapped AI lesson canister is novel infrastructure, not SaaS."),
      ("NSF RI / Mid-Scale Research", #Federal, "National Science Foundation", 50_000_000, 500_000_000, "Sovereign decentralized compute as research infrastructure. UNL partnership anchor."),
      ("Wyoming SPDI / State AI Fund", #State, "Wyoming State", 0, 0, "Wyoming leading AI-friendly regulatory sandboxes. FRNT demo is direct value proof."),
      ("USDA ReConnect (Rural Broadband)", #Federal, "USDA", 100_000_000, 0, "Midwest rural internet backbone expansion. Gen 3 nodes in Lincoln vault tie to backbone."),
      ("SBA SBIR / STTR", #Federal, "SBA", 15_000_000, 200_000_000, "Veteran-owned (Bad Marine LLC). Phase I feasibility — sovereign AI infrastructure for state agencies.")
    ];

    for ((name, category, agency, minUsd, maxUsd, notes) in defaultGrants.vals()) {
      grantCounter += 1;
      grants.add({
        id = grantCounter;
        name = name;
        category = category;
        agency = agency;
        amountMin = minUsd;
        amountMax = if (maxUsd == 0) { minUsd } else { maxUsd };
        status = #Research;
        notes = notes;
        deadlineNs = null;
        submittedNs = null;
        awardedNs = null;
        createdNs = now;
        updatedNs = now;
      });
    };

    grants.size()
  };

  // ── Upgrade Hooks ──────────────────────────────────────────────────────
  system func preupgrade() {
    let buf = Buffer.Buffer<(Nat, Text, Nat, Text, Nat, Nat, Nat, Text, ?Int, ?Int, ?Int, Int, Int)>(grants.size());
    for (grant in grants.vals()) {
      buf.add((
        grant.id,
        grant.name,
        categoryToNat(grant.category),
        grant.agency,
        grant.amountMin,
        grant.amountMax,
        statusToNat(grant.status),
        grant.notes,
        grant.deadlineNs,
        grant.submittedNs,
        grant.awardedNs,
        grant.createdNs,
        grant.updatedNs
      ));
    };
    grantEntries := Buffer.toArray(buf);
  };

  system func postupgrade() {
    for ((id, name, categoryNat, agency, amountMin, amountMax, statusNat, notes, deadlineNs, submittedNs, awardedNs, createdNs, updatedNs) in grantEntries.vals()) {
      grants.add({
        id = id;
        name = name;
        category = natToCategory(categoryNat);
        agency = agency;
        amountMin = amountMin;
        amountMax = amountMax;
        status = natToStatus(statusNat);
        notes = notes;
        deadlineNs = deadlineNs;
        submittedNs = submittedNs;
        awardedNs = awardedNs;
        createdNs = createdNs;
        updatedNs = updatedNs;
      });
    };
    grantEntries := [];
    grantCounter := grants.size();
  };
};
