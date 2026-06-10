// phantom_native/zig/src/runtime.zig
// Sovereign Swarm Runtime — Zig native entry point with manifest attestation
// Builds to attestable binary: `zig build -Doptimize=ReleaseFast`
// Cross-compile: `zig build arm` | `zig build x86-musl` | `zig build aarch64-musl`

const std = @import("std");
const neurocore = @import("neurocore.zig");
const crypto = std.crypto.hash.sha2;

// ============================================================================
// Build Manifest & Attestation
// ============================================================================

/// Compute SHA-256 of a byte buffer (for QSHA compatibility)
fn sha256_hex(data: []const u8) [64]u8 {
    var hash: [32]u8 = undefined;
    crypto.Sha256.hash(data, &hash, .{});
    return std.fmt.bytesToHex(hash, .lower);
}

/// Runtime self-attestation structure
const RuntimeManifest = struct {
    version: []const u8,
    build_target: []const u8,
    kernel_count: u32,
    simd_width: u32,
    phi_constant: f32,
};

const MANIFEST = RuntimeManifest{
    .version = "0.2.0",
    .build_target = @tagName(builtin.cpu.arch) ++ "-" ++ @tagName(builtin.os.tag),
    .kernel_count = 12, // exported C ABI functions
    .simd_width = neurocore.SIMD_WIDTH,
    .phi_constant = neurocore.PHI,
};

const builtin = @import("builtin");

// ============================================================================
// Entry Point
// ============================================================================

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();

    try stdout.print(
        \\╔══════════════════════════════════════════════════════════════╗
        \\║  PHANTOM SOVEREIGN SWARM RUNTIME v{s}                    ║
        \\╠══════════════════════════════════════════════════════════════╣
        \\║  Target: {s: <40}         ║
        \\║  SIMD Width: {d} lanes (f32)                               ║
        \\║  φ-Constant: {d:.6}                                    ║
        \\║  Kernels: {d} exported (C ABI)                             ║
        \\╚══════════════════════════════════════════════════════════════╝
        \\
    , .{
        MANIFEST.version,
        MANIFEST.build_target,
        MANIFEST.simd_width,
        MANIFEST.phi_constant,
        MANIFEST.kernel_count,
    });

    // Kernel verification smoke tests
    try stdout.print("\n[VERIFY] Running kernel integrity checks...\n", .{});

    // 1. Resonance dot product
    const a = [_]f32{ 1.0, 2.0, 3.0, 4.0 };
    const b = [_]f32{ 0.5, 0.5, 0.5, 0.5 };
    const dot = neurocore.resonance_dot(&a, &b, 4, neurocore.PHI);
    const expected_dot = (1.0 + 2.0 + 3.0 + 4.0) * 0.5 * neurocore.PHI;
    const dot_ok = @abs(dot - expected_dot) < 0.01;
    try stdout.print("  resonance_dot(φ): {d:.6} [{}]\n", .{ dot, if (dot_ok) "PASS" else "FAIL" });

    // 2. Quantization roundtrip
    const input = [_]f32{ 0.5, -1.0, 0.75 };
    var quantized: [3]i8 = undefined;
    const scale = neurocore.quantize_int8(&input, &quantized, 3);
    var restored: [3]f32 = undefined;
    neurocore.dequantize_int8(&quantized, &restored, 3, scale);
    const quant_ok = @abs(restored[1] - (-1.0)) < 0.02;
    try stdout.print("  quantize_int8 roundtrip: scale={d:.4} [{}]\n", .{ scale, if (quant_ok) "PASS" else "FAIL" });

    // 3. Constant-time compare
    const x = [_]u8{ 0xDE, 0xAD, 0xBE, 0xEF };
    const y = [_]u8{ 0xDE, 0xAD, 0xBE, 0xEF };
    const z = [_]u8{ 0xDE, 0xAD, 0xBE, 0x00 };
    const ct_ok = (neurocore.ct_compare(&x, &y, 4) == 1) and (neurocore.ct_compare(&x, &z, 4) == 0);
    try stdout.print("  ct_compare: [{}]\n", .{if (ct_ok) "PASS" else "FAIL"});

    // 4. Helix encoding
    var helix_buf: [8]f32 = undefined;
    neurocore.helix_encode(&helix_buf, 8, 1.0);
    const helix_ok = @abs(helix_buf[0] - @sin(neurocore.PHI)) < 0.001;
    try stdout.print("  helix_encode: pos[0]={d:.6} [{}]\n", .{ helix_buf[0], if (helix_ok) "PASS" else "FAIL" });

    // Manifest attestation hash
    const manifest_str = MANIFEST.version ++ "|" ++ MANIFEST.build_target;
    const manifest_hash = sha256_hex(manifest_str);
    try stdout.print("\n[ATTEST] Manifest QSHA: qsha:{s}\n", .{manifest_hash});
    try stdout.print("[STATUS] Ready for sealed-intent execution\n", .{});
}

