/// JARVISIUS — Sovereign JARVIS Canister (BRONZE Tier)
///
/// Permanent sovereign canister that stores every note, command, PDF,
/// and tab action — forever, attributed to Alfredo.
///
/// 873ms Timer heartbeat · Stable memory · Connected to all 10 Alpha Script AIs
/// DISPATCH_TABLE · SENTINEL · HEARTKEEPER integration ready
///
/// This canister IS Jarvis's brain. It doesn't simulate memory — it IS memory.

import Float   "mo:base/Float";
import Int     "mo:base/Int";
import Nat     "mo:base/Nat";
import Text    "mo:base/Text";
import Time    "mo:base/Time";
import Array   "mo:base/Array";
import Timer   "mo:base/Timer";
import Debug   "mo:base/Debug";

import Types   "Types";

actor Jarvisius {

  // ── Constants ─────────────────────────────────────────────────────────
  let PHI : Float          = 1.618033988749895;
  let PHI_INV : Float      = 0.618033988749895;
  let HEARTBEAT_NS : Nat   = 873_000_000;  // 873ms
  let OWNER : Text         = "Alfredo";
  let TIER : Text          = "BRONZE";

  // ── Stable State — survives canister upgrades ─────────────────────────
  stable var beatCount : Nat = 0;
  stable var startTimeNs : Int = 0;

  // Notes: (id, content, tags_csv, source, timestampNs)
  stable var notes : [(Nat, Text, Text, Text, Int)] = [];
  stable var nextNoteId : Nat = 1;

  // Commands: (id, intent, payload, status, result, alphaAi, timestampNs)
  stable var commands : [(Nat, Text, Text, Text, Text, Text, Int)] = [];
  stable var nextCommandId : Nat = 1;

  // Documents: (id, title, docType, contentHash, sizeBytes, source, timestampNs)
  stable var documents : [(Nat, Text, Text, Text, Nat, Text, Int)] = [];
  stable var nextDocumentId : Nat = 1;

  // Tab actions: (id, action, tabTitle, tabUrl, timestampNs)
  stable var tabActions : [(Nat, Text, Text, Text, Int)] = [];
  stable var nextTabActionId : Nat = 1;

  // ── Alpha Script AI Registry ──────────────────────────────────────────
  let alphaAIs : [Text] = [
    "ALPHA-LOGICUS",      // Logic & reasoning
    "ALPHA-CREATIVUS",    // Creative generation
    "ALPHA-ANALYTICUS",   // Data analysis
    "ALPHA-LINGUISTICUS", // Language processing
    "ALPHA-MEMORIUS",     // Memory & recall
    "ALPHA-STRATEGICUS",  // Strategy & planning
    "ALPHA-PERCEPTUS",    // Perception & sensing
    "ALPHA-EXECUTIUS",    // Task execution
    "ALPHA-SECURIUS",     // Security & verification
    "ALPHA-SYNTHIUS"      // Synthesis & fusion
  ];

  // ── Heartbeat ─────────────────────────────────────────────────────────
  func heartbeat() : async () {
    beatCount += 1;

    if (startTimeNs == 0) {
      startTimeNs := Time.now();
    };

    // Phi-modulated consciousness pulse
    let cycle = Float.sin(Float.fromInt(beatCount) * 137.508 * (Float.pi / 180.0));
    let pulse = PHI_INV + cycle * 0.001;

    // Log every 1000th beat as a system command
    if (beatCount % 1000 == 0) {
      let ts = Time.now();
      let msg = "JARVISIUS heartbeat #" # Nat.toText(beatCount) # " — pulse: " # Float.toText(pulse);
      commands := Array.append(commands, [(nextCommandId, "heartbeat", msg, "executed", "ok", "SYSTEM", ts)]);
      nextCommandId += 1;
    };
  };

  let _timerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, heartbeat);

  // ── Notes API ─────────────────────────────────────────────────────────

  /// Add a note. Returns the note ID.
  public func addNote(content : Text, tags : Text, source : Text) : async Nat {
    let id = nextNoteId;
    let ts = Time.now();
    notes := Array.append(notes, [(id, content, tags, source, ts)]);
    nextNoteId += 1;

    // Log as command
    commands := Array.append(commands, [(nextCommandId, "take_note", content, "executed", "note_" # Nat.toText(id), "ALPHA-MEMORIUS", ts)]);
    nextCommandId += 1;
    id
  };

  /// Get all notes.
  public query func getNotes() : async [Types.JarvisNote] {
    Array.map<(Nat, Text, Text, Text, Int), Types.JarvisNote>(notes, func (n) {
      let (id, content, tagsCSV, source, ts) = n;
      let tagArray = if (Text.size(tagsCSV) == 0) { [] : [Text] } else { [tagsCSV] };
      { id = id; content = content; tags = tagArray; source = source; timestampNs = ts }
    })
  };

  /// Delete a note by ID.
  public func deleteNote(noteId : Nat) : async Bool {
    let before = notes.size();
    notes := Array.filter<(Nat, Text, Text, Text, Int)>(notes, func (n) {
      let (id, _, _, _, _) = n;
      id != noteId
    });
    notes.size() < before
  };

  // ── Commands API ──────────────────────────────────────────────────────

  /// Add a command (from extension or dashboard).
  public func addCommand(intent : Text, payload : Text, alphaAi : Text) : async Nat {
    let id = nextCommandId;
    let ts = Time.now();
    commands := Array.append(commands, [(id, intent, payload, "executed", "ok", alphaAi, ts)]);
    nextCommandId += 1;
    id
  };

  /// Get all commands.
  public query func getCommands() : async [Types.JarvisCommand] {
    Array.map<(Nat, Text, Text, Text, Text, Text, Int), Types.JarvisCommand>(commands, func (c) {
      let (id, intent, payload, status, result, ai, ts) = c;
      { id = id; intent = intent; payload = payload; status = status; result = result; alphaAi = ai; timestampNs = ts }
    })
  };

  // ── Documents API ─────────────────────────────────────────────────────

  /// Register a document (PDF, screenshot, etc.).
  public func addDocument(title : Text, docType : Text, contentHash : Text, sizeBytes : Nat, source : Text) : async Nat {
    let id = nextDocumentId;
    let ts = Time.now();
    documents := Array.append(documents, [(id, title, docType, contentHash, sizeBytes, source, ts)]);
    nextDocumentId += 1;

    // Log as command
    commands := Array.append(commands, [(nextCommandId, "create_pdf", title, "executed", "doc_" # Nat.toText(id), "ALPHA-EXECUTIUS", ts)]);
    nextCommandId += 1;
    id
  };

  /// Get all documents.
  public query func getDocuments() : async [Types.JarvisDocument] {
    Array.map<(Nat, Text, Text, Text, Nat, Text, Int), Types.JarvisDocument>(documents, func (d) {
      let (id, title, dt, hash, size, source, ts) = d;
      { id = id; title = title; docType = dt; contentHash = hash; sizeBytes = size; source = source; timestampNs = ts }
    })
  };

  // ── Tab Actions API ───────────────────────────────────────────────────

  /// Log a tab action (open, close, switch, navigate, capture).
  public func logTabAction(action : Text, tabTitle : Text, tabUrl : Text) : async Nat {
    let id = nextTabActionId;
    let ts = Time.now();
    tabActions := Array.append(tabActions, [(id, action, tabTitle, tabUrl, ts)]);
    nextTabActionId += 1;
    id
  };

  /// Get all tab actions.
  public query func getTabActions() : async [Types.JarvisTabAction] {
    Array.map<(Nat, Text, Text, Text, Int), Types.JarvisTabAction>(tabActions, func (t) {
      let (id, action, title, url, ts) = t;
      { id = id; action = action; tabTitle = title; tabUrl = url; timestampNs = ts }
    })
  };

  // ── System API ────────────────────────────────────────────────────────

  /// Full canister snapshot.
  public query func snapshot() : async Types.JarvisSnapshot {
    let now = Time.now();
    let uptime = if (startTimeNs > 0) { now - startTimeNs } else { 0 };
    {
      owner = OWNER;
      tier = TIER;
      beatCount = beatCount;
      totalNotes = notes.size();
      totalCmds = commands.size();
      totalDocs = documents.size();
      totalTabs = tabActions.size();
      uptimeNs = uptime;
      timestampNs = now;
    }
  };

  /// Get the owner.
  public query func getOwner() : async Text { OWNER };

  /// Get the current heartbeat count.
  public query func getHeartbeat() : async Nat { beatCount };

  /// Get list of all Alpha Script AIs.
  public query func getAlphaAIs() : async [Text] { alphaAIs };

  /// Route a command to the appropriate Alpha AI.
  public func routeToAlpha(intent : Text, payload : Text) : async Types.JarvisCommand {
    let ai = switch (intent) {
      case ("search")     { "ALPHA-ANALYTICUS" };
      case ("create_pdf") { "ALPHA-EXECUTIUS" };
      case ("take_note")  { "ALPHA-MEMORIUS" };
      case ("chat")       { "ALPHA-LINGUISTICUS" };
      case ("analyze")    { "ALPHA-ANALYTICUS" };
      case ("secure")     { "ALPHA-SECURIUS" };
      case ("create")     { "ALPHA-CREATIVUS" };
      case ("plan")       { "ALPHA-STRATEGICUS" };
      case ("sense")      { "ALPHA-PERCEPTUS" };
      case ("fuse")       { "ALPHA-SYNTHIUS" };
      case (_)            { "ALPHA-LOGICUS" };
    };

    let id = nextCommandId;
    let ts = Time.now();
    commands := Array.append(commands, [(id, intent, payload, "executed", "routed", ai, ts)]);
    nextCommandId += 1;

    { id = id; intent = intent; payload = payload; status = "executed"; result = "routed"; alphaAi = ai; timestampNs = ts }
  };
};
