// src/qsha_binding.zig — Phantom-QSHA Commitment Integration
//
// Binds the Sovereign NeuroCore to Phantom-QSHA cryptographic attestation.
// Computes commitments over tensor data for verifiable computation proofs.
// Links to the C-compatible QSHA library via @cImport.

const std = @import("std");
const neurocore = @import("neurocore.zig");

// ── C FFI binding to Phantom-QSHA library ────────────────────────────────

const PhantomQSHA = @cImport({
    @cInclude("phantom_qsha.h");
});

/// Compute a 32-byte QSHA commitment hash over tensor data.
/// Used for execution receipts and verifiable computation proofs.
pub fn compute_commitment(tensor: neurocore.SovereignTensor) ![32]u8 {
    var hash: [32]u8 = undefined;
    PhantomQSHA.qsha_hash(
        @ptrCast(tensor.data.ptr),
        @intCast(tensor.data.len * @sizeOf(f32)),
        &hash,
    );
    return hash;
}

/// Compute commitment over raw byte slice (for binary/config hashing).
pub fn compute_raw_commitment(data: []const u8) [32]u8 {
    var hash: [32]u8 = undefined;
    PhantomQSHA.qsha_hash(data.ptr, @intCast(data.len), &hash);
    return hash;
}

// ── Execution Receipt ────────────────────────────────────────────────────

pub const ExecutionReceipt = struct {
    commitment: [32]u8,
    shadow_wire_masked: bool,
    timestamp_ms: u64,
    resonance_at_commit: f32,
};

/// Create an execution receipt from a forward-pass output tensor.
pub fn create_receipt(output: neurocore.SovereignTensor) !ExecutionReceipt {
    const commitment = try compute_commitment(output);
    return .{
        .commitment = commitment,
        .shadow_wire_masked = true,
        .timestamp_ms = @intCast(std.time.milliTimestamp()),
        .resonance_at_commit = output.resonance,
    };
}

// ── Manifest Binding ─────────────────────────────────────────────────────

/// Hash the entire binary + weights + config at build time for QSHA manifest attestation.
/// Call at startup to generate the runtime attestation hash.
pub fn attest_binary(binary_path: []const u8, allocator: std.mem.Allocator) ![32]u8 {
    const file = try std.fs.cwd().openFile(binary_path, .{});
    defer file.close();

    const stat = try file.stat();
    const contents = try allocator.alloc(u8, stat.size);
    defer allocator.free(contents);

    _ = try file.readAll(contents);
    return compute_raw_commitment(contents);
}

// ── Fallback (no C library) ──────────────────────────────────────────────
// When phantom_qsha.h is not available, use a software SHA-256 fallback.

pub fn compute_commitment_fallback(tensor: neurocore.SovereignTensor) [32]u8 {
    var hasher = std.crypto.hash.sha2.Sha256.init(.{});
    const bytes: []const u8 = @as([*]const u8, @ptrCast(tensor.data.ptr))[0 .. tensor.data.len * @sizeOf(f32)];
    hasher.update(bytes);
    return hasher.finalResult();
}

pub fn create_receipt_fallback(output: neurocore.SovereignTensor) ExecutionReceipt {
    const commitment = compute_commitment_fallback(output);
    return .{
        .commitment = commitment,
        .shadow_wire_masked = true,
        .timestamp_ms = @intCast(std.time.milliTimestamp()),
        .resonance_at_commit = output.resonance,
    };
}

// ── Tests ────────────────────────────────────────────────────────────────

test "compute_commitment_fallback produces deterministic hash" {
    const allocator = std.testing.allocator;
    var tensor = try neurocore.SovereignTensor.init(allocator, 2, 2);
    defer tensor.deinit();
    tensor.data[0] = 1.0;
    tensor.data[1] = 2.0;
    tensor.data[2] = 3.0;
    tensor.data[3] = 4.0;

    const hash1 = compute_commitment_fallback(tensor);
    const hash2 = compute_commitment_fallback(tensor);
    try std.testing.expectEqualSlices(u8, &hash1, &hash2);
}

test "create_receipt_fallback populates fields" {
    const allocator = std.testing.allocator;
    var tensor = try neurocore.SovereignTensor.init(allocator, 2, 2);
    defer tensor.deinit();
    tensor.resonance = 0.85;

    const receipt = create_receipt_fallback(tensor);
    try std.testing.expect(receipt.shadow_wire_masked);
    try std.testing.expectApproxEqAbs(receipt.resonance_at_commit, 0.85, 0.001);
    try std.testing.expect(receipt.timestamp_ms > 0);
}
