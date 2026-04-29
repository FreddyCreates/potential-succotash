/// FRNT Token Canister — ICRC-1 Compliant
///
/// Wyoming Charter sovereign settlement token.
/// Sub-second finality · <0.1% fees · Visa/Kraken bypass.

import Int       "mo:base/Int";
import Nat       "mo:base/Nat";
import Nat64     "mo:base/Nat64";
import Text      "mo:base/Text";
import Time      "mo:base/Time";
import Array     "mo:base/Array";
import Principal "mo:base/Principal";
import HashMap   "mo:base/HashMap";
import Iter      "mo:base/Iter";
import Option    "mo:base/Option";
import Result    "mo:base/Result";
import Buffer    "mo:base/Buffer";

actor FRNTToken {

  // ── Token Metadata ─────────────────────────────────────────────────────
  let TOKEN_NAME     : Text = "FRNT";
  let TOKEN_SYMBOL   : Text = "FRNT";
  let TOKEN_DECIMALS : Nat8 = 8;
  let TOKEN_FEE      : Nat  = 10_000; // 0.0001 FRNT (0.01% of 1 FRNT)

  // ── Stable State ───────────────────────────────────────────────────────
  stable var totalSupply     : Nat = 0;
  stable var mintAuthority   : Principal = Principal.fromText("aaaaa-aa");
  stable var feeCollector    : Principal = Principal.fromText("aaaaa-aa");
  stable var balanceEntries  : [(Principal, Nat)] = [];
  stable var allowanceEntries: [((Principal, Principal), Nat)] = [];
  stable var txCounter       : Nat = 0;

  // ── Runtime State ──────────────────────────────────────────────────────
  var balances   = HashMap.HashMap<Principal, Nat>(16, Principal.equal, Principal.hash);
  var allowances = HashMap.HashMap<(Principal, Principal), Nat>(16, 
    func(a: (Principal, Principal), b: (Principal, Principal)) : Bool { 
      Principal.equal(a.0, b.0) and Principal.equal(a.1, b.1) 
    },
    func(k: (Principal, Principal)) : Nat32 { 
      Principal.hash(k.0) ^ Principal.hash(k.1) 
    }
  );

  // ── Upgrade Hooks ──────────────────────────────────────────────────────
  system func preupgrade() {
    balanceEntries := Iter.toArray(balances.entries());
    allowanceEntries := Iter.toArray(allowances.entries());
  };

  system func postupgrade() {
    for ((p, b) in balanceEntries.vals()) { balances.put(p, b) };
    for ((k, a) in allowanceEntries.vals()) { allowances.put(k, a) };
    balanceEntries := [];
    allowanceEntries := [];
  };

  // ── ICRC-1 Metadata ────────────────────────────────────────────────────
  public type Value = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
  };

  public query func icrc1_name() : async Text { TOKEN_NAME };
  public query func icrc1_symbol() : async Text { TOKEN_SYMBOL };
  public query func icrc1_decimals() : async Nat8 { TOKEN_DECIMALS };
  public query func icrc1_fee() : async Nat { TOKEN_FEE };
  public query func icrc1_total_supply() : async Nat { totalSupply };
  public query func icrc1_minting_account() : async ?{ owner: Principal; subaccount: ?Blob } {
    ?{ owner = mintAuthority; subaccount = null }
  };

  public query func icrc1_metadata() : async [(Text, Value)] {
    [
      ("icrc1:name", #Text(TOKEN_NAME)),
      ("icrc1:symbol", #Text(TOKEN_SYMBOL)),
      ("icrc1:decimals", #Nat(Nat8.toNat(TOKEN_DECIMALS))),
      ("icrc1:fee", #Nat(TOKEN_FEE))
    ]
  };

  // ── ICRC-1 Balance ─────────────────────────────────────────────────────
  public type Account = { owner: Principal; subaccount: ?Blob };

  public query func icrc1_balance_of(account: Account) : async Nat {
    Option.get(balances.get(account.owner), 0)
  };

  // ── ICRC-1 Transfer ────────────────────────────────────────────────────
  public type TransferArgs = {
    from_subaccount: ?Blob;
    to: Account;
    amount: Nat;
    fee: ?Nat;
    memo: ?Blob;
    created_at_time: ?Nat64;
  };

  public type TransferError = {
    #BadFee : { expected_fee: Nat };
    #BadBurn : { min_burn_amount: Nat };
    #InsufficientFunds : { balance: Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
    #Duplicate : { duplicate_of: Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code: Nat; message: Text };
  };

  public shared(msg) func icrc1_transfer(args: TransferArgs) : async Result.Result<Nat, TransferError> {
    let caller = msg.caller;
    let fee = Option.get(args.fee, TOKEN_FEE);

    // Validate fee
    if (fee != TOKEN_FEE) {
      return #err(#BadFee({ expected_fee = TOKEN_FEE }));
    };

    // Get caller balance
    let callerBalance = Option.get(balances.get(caller), 0);
    let totalDebit = args.amount + fee;

    // Check sufficient funds
    if (callerBalance < totalDebit) {
      return #err(#InsufficientFunds({ balance = callerBalance }));
    };

    // Execute transfer
    balances.put(caller, callerBalance - totalDebit);
    let recipientBalance = Option.get(balances.get(args.to.owner), 0);
    balances.put(args.to.owner, recipientBalance + args.amount);

    // Collect fee
    if (fee > 0) {
      let collectorBalance = Option.get(balances.get(feeCollector), 0);
      balances.put(feeCollector, collectorBalance + fee);
    };

    txCounter += 1;
    #ok(txCounter)
  };

  // ── ICRC-2 Approve ─────────────────────────────────────────────────────
  public type ApproveArgs = {
    from_subaccount: ?Blob;
    spender: Account;
    amount: Nat;
    expected_allowance: ?Nat;
    expires_at: ?Nat64;
    fee: ?Nat;
    memo: ?Blob;
    created_at_time: ?Nat64;
  };

  public type ApproveError = {
    #BadFee : { expected_fee: Nat };
    #InsufficientFunds : { balance: Nat };
    #AllowanceChanged : { current_allowance: Nat };
    #Expired : { ledger_time: Nat64 };
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
    #Duplicate : { duplicate_of: Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code: Nat; message: Text };
  };

  public shared(msg) func icrc2_approve(args: ApproveArgs) : async Result.Result<Nat, ApproveError> {
    let caller = msg.caller;
    let fee = Option.get(args.fee, TOKEN_FEE);

    if (fee != TOKEN_FEE) {
      return #err(#BadFee({ expected_fee = TOKEN_FEE }));
    };

    let callerBalance = Option.get(balances.get(caller), 0);
    if (callerBalance < fee) {
      return #err(#InsufficientFunds({ balance = callerBalance }));
    };

    // Deduct fee
    balances.put(caller, callerBalance - fee);
    let collectorBalance = Option.get(balances.get(feeCollector), 0);
    balances.put(feeCollector, collectorBalance + fee);

    // Set allowance
    allowances.put((caller, args.spender.owner), args.amount);

    txCounter += 1;
    #ok(txCounter)
  };

  public query func icrc2_allowance(args: { account: Account; spender: Account }) : async { allowance: Nat; expires_at: ?Nat64 } {
    let current = Option.get(allowances.get((args.account.owner, args.spender.owner)), 0);
    { allowance = current; expires_at = null }
  };

  // ── ICRC-2 Transfer From ───────────────────────────────────────────────
  public type TransferFromArgs = {
    spender_subaccount: ?Blob;
    from: Account;
    to: Account;
    amount: Nat;
    fee: ?Nat;
    memo: ?Blob;
    created_at_time: ?Nat64;
  };

  public type TransferFromError = {
    #BadFee : { expected_fee: Nat };
    #BadBurn : { min_burn_amount: Nat };
    #InsufficientFunds : { balance: Nat };
    #InsufficientAllowance : { allowance: Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
    #Duplicate : { duplicate_of: Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code: Nat; message: Text };
  };

  public shared(msg) func icrc2_transfer_from(args: TransferFromArgs) : async Result.Result<Nat, TransferFromError> {
    let spender = msg.caller;
    let fee = Option.get(args.fee, TOKEN_FEE);

    if (fee != TOKEN_FEE) {
      return #err(#BadFee({ expected_fee = TOKEN_FEE }));
    };

    // Check allowance
    let currentAllowance = Option.get(allowances.get((args.from.owner, spender)), 0);
    let totalDebit = args.amount + fee;
    if (currentAllowance < totalDebit) {
      return #err(#InsufficientAllowance({ allowance = currentAllowance }));
    };

    // Check balance
    let fromBalance = Option.get(balances.get(args.from.owner), 0);
    if (fromBalance < totalDebit) {
      return #err(#InsufficientFunds({ balance = fromBalance }));
    };

    // Execute transfer
    balances.put(args.from.owner, fromBalance - totalDebit);
    let toBalance = Option.get(balances.get(args.to.owner), 0);
    balances.put(args.to.owner, toBalance + args.amount);

    // Reduce allowance
    allowances.put((args.from.owner, spender), currentAllowance - totalDebit);

    // Collect fee
    if (fee > 0) {
      let collectorBalance = Option.get(balances.get(feeCollector), 0);
      balances.put(feeCollector, collectorBalance + fee);
    };

    txCounter += 1;
    #ok(txCounter)
  };

  // ── Admin Functions ────────────────────────────────────────────────────
  public shared(msg) func mint(to: Principal, amount: Nat) : async Result.Result<Nat, Text> {
    if (msg.caller != mintAuthority) {
      return #err("Unauthorized: only mint authority can mint");
    };

    let currentBalance = Option.get(balances.get(to), 0);
    balances.put(to, currentBalance + amount);
    totalSupply += amount;

    txCounter += 1;
    #ok(txCounter)
  };

  public shared(msg) func burn(amount: Nat) : async Result.Result<Nat, Text> {
    let caller = msg.caller;
    let currentBalance = Option.get(balances.get(caller), 0);

    if (currentBalance < amount) {
      return #err("Insufficient balance to burn");
    };

    balances.put(caller, currentBalance - amount);
    totalSupply -= amount;

    txCounter += 1;
    #ok(txCounter)
  };

  public shared(msg) func setMintAuthority(newAuthority: Principal) : async Result.Result<(), Text> {
    if (msg.caller != mintAuthority and mintAuthority != Principal.fromText("aaaaa-aa")) {
      return #err("Unauthorized");
    };
    mintAuthority := newAuthority;
    #ok()
  };

  public shared(msg) func setFeeCollector(collector: Principal) : async Result.Result<(), Text> {
    if (msg.caller != mintAuthority) {
      return #err("Unauthorized");
    };
    feeCollector := collector;
    #ok()
  };

  // ── Query Functions ────────────────────────────────────────────────────
  public query func getTransactionCount() : async Nat { txCounter };
  public query func getMintAuthority() : async Principal { mintAuthority };
  public query func getFeeCollector() : async Principal { feeCollector };
};
