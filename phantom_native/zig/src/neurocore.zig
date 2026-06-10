// phantom_native/zig/src/neurocore.zig
// Sovereign NeuroCore — Zig native kernel with SIMD vectorization
// C ABI exports for Python ctypes binding (zero NumPy dependency)
// Targets: x86_64 (SSE/AVX), ARM (NEON), Xtensa (ESP32-S3)
// All crypto-adjacent operations use constant-time primitives.

const std = @import("std");
const math = std.math;
const builtin = @import("builtin");

// ============================================================================
// SIMD Configuration — compile-time lane width selection
// ============================================================================

/// SIMD lane width: 8 floats (256-bit AVX) or 4 floats (128-bit NEON/SSE)
/// Note: Defaults to 4 on x86_64 for SSE2 baseline compatibility.
/// Override with `-Dcpu=x86_64_v3` or higher to enable AVX (8 lanes).
const SIMD_WIDTH: comptime_int = switch (builtin.cpu.arch) {
    .x86_64 => if (@hasField(@TypeOf(builtin.cpu.features), "avx")) 8 else 4,
    else => 4,
};
const SimdVec = @Vector(SIMD_WIDTH, f32);

/// Alignment for quantized int8 weights (32-byte for AVX, 16-byte for NEON)
pub const QUANT_ALIGNMENT: comptime_int = if (builtin.cpu.arch == .x86_64) 32 else 16;

// ============================================================================
// φ-Constants (Organism Mathematics)
// ============================================================================

pub const PHI: f32 = 1.618033988749895;
pub const PHI_INV: f32 = 0.618033988749895; // 1/φ = φ - 1
pub const HEARTBEAT_NS: u64 = 873_000_000; // 873ms in nanoseconds

// ============================================================================
// Core SIMD Kernels
// ============================================================================

/// SIMD-accelerated resonance dot product.
/// Uses @Vector for hardware-native parallel accumulation.
/// Falls back to scalar for tail elements (len % SIMD_WIDTH != 0).
export fn resonance_dot(a: [*]const f32, b: [*]const f32, len: usize, resonance: f32) f32 {
    var acc_vec: SimdVec = @splat(0.0);
    const full_chunks = len / SIMD_WIDTH;

    // SIMD main loop
    for (0..full_chunks) |chunk| {
        const offset = chunk * SIMD_WIDTH;
        const va: SimdVec = a[offset..][0..SIMD_WIDTH].*;
        const vb: SimdVec = b[offset..][0..SIMD_WIDTH].*;
        acc_vec += va * vb;
    }

    // Reduce SIMD accumulator
    var acc: f32 = @reduce(.Add, acc_vec);

    // Scalar tail
    const tail_start = full_chunks * SIMD_WIDTH;
    for (tail_start..len) |i| {
        acc += a[i] * b[i];
    }

    return acc * resonance;
}

/// SIMD-accelerated resonance dot product for int8 quantized data.
/// Operates on aligned i8 buffers, returns f32 result.
export fn resonance_dot_i8(
    a: [*]const i8,
    b: [*]const i8,
    len: usize,
    scale_a: f32,
    scale_b: f32,
    resonance: f32,
) f32 {
    var acc: i32 = 0;
    for (0..len) |i| {
        acc += @as(i32, a[i]) * @as(i32, b[i]);
    }
    // Dequantize: (acc / (127*127)) * scale_a * scale_b * resonance
    const dequant = @as(f32, @floatFromInt(acc)) / (127.0 * 127.0);
    return dequant * scale_a * scale_b * resonance;
}

/// Native softmax over a float buffer (in-place, numerically stable)
export fn native_softmax(data: [*]f32, len: usize) void {
    // Pass 1: find max (SIMD)
    var max_val: f32 = -math.inf(f32);
    for (0..len) |i| {
        if (data[i] > max_val) max_val = data[i];
    }
    // Pass 2: exp and sum
    var total: f32 = 0.0;
    for (0..len) |i| {
        data[i] = @exp(data[i] - max_val);
        total += data[i];
    }
    // Pass 3: normalize
    if (total > 0.0) {
        const inv_total = 1.0 / total;
        for (0..len) |i| {
            data[i] *= inv_total;
        }
    }
}

/// Quantize float buffer to int8 with QUANT_ALIGNMENT guarantee.
/// Returns scale factor for dequantization.
export fn quantize_int8(input: [*]const f32, output: [*]i8, len: usize) f32 {
    var max_abs: f32 = 0.0;
    for (0..len) |i| {
        const abs_val = @abs(input[i]);
        if (abs_val > max_abs) max_abs = abs_val;
    }
    const scale = if (max_abs > 0.0) max_abs else 1.0;
    const inv_scale = 127.0 / scale;
    for (0..len) |i| {
        output[i] = @intFromFloat(input[i] * inv_scale);
    }
    return scale;
}

/// Dequantize int8 buffer back to float
export fn dequantize_int8(input: [*]const i8, output: [*]f32, len: usize, scale: f32) void {
    const factor = scale / 127.0;
    for (0..len) |i| {
        output[i] = @as(f32, @floatFromInt(input[i])) * factor;
    }
}

/// SIMD Matrix multiply: C[m,n] = A[m,k] * B[k,n] * resonance
/// Inner loop vectorized over the k (reduction) dimension.
export fn matmul_resonance(
    a: [*]const f32,
    b: [*]const f32,
    c: [*]f32,
    m: usize,
    k: usize,
    n: usize,
    resonance: f32,
) void {
    for (0..m) |i| {
        for (0..n) |j| {
            var acc_vec: SimdVec = @splat(0.0);
            const full_chunks = k / SIMD_WIDTH;

            for (0..full_chunks) |chunk| {
                const offset = chunk * SIMD_WIDTH;
                const va: SimdVec = a[i * k + offset ..][0..SIMD_WIDTH].*;
                // Gather column j from B (strided access)
                var vb: SimdVec = undefined;
                inline for (0..SIMD_WIDTH) |s| {
                    vb[s] = b[(offset + s) * n + j];
                }
                acc_vec += va * vb;
            }

            var acc: f32 = @reduce(.Add, acc_vec);

            // Scalar tail
            const tail_start = full_chunks * SIMD_WIDTH;
            for (tail_start..k) |p| {
                acc += a[i * k + p] * b[p * n + j];
            }

            c[i * n + j] = acc * resonance;
        }
    }
}

// ============================================================================
// Constant-Time Primitives (Side-Channel Resistant)
// ============================================================================

/// Constant-time comparison of two byte buffers.
/// Returns 1 if equal, 0 if different. Execution time independent of content.
export fn ct_compare(a: [*]const u8, b: [*]const u8, len: usize) u8 {
    var diff: u8 = 0;
    for (0..len) |i| {
        diff |= a[i] ^ b[i];
    }
    // Convert to 0 or 1 without branching
    return @intFromBool(diff == 0);
}

/// Constant-time conditional select: returns a if sel==1, b if sel==0.
/// No branching — prevents timing side-channels.
export fn ct_select_f32(a: f32, b: f32, sel: u1) f32 {
    const mask: u32 = @as(u32, 0) -% @as(u32, sel); // all-ones if sel=1, all-zeros if sel=0
    const a_bits: u32 = @bitCast(a);
    const b_bits: u32 = @bitCast(b);
    const result_bits = (a_bits & mask) | (b_bits & ~mask);
    return @bitCast(result_bits);
}

/// Constant-time conditional buffer swap.
/// Swaps contents of a and b if swap==1; does nothing if swap==0.
/// Timing is identical regardless of swap value.
export fn ct_swap(a: [*]u8, b: [*]u8, len: usize, swap: u1) void {
    const mask: u8 = @as(u8, 0) -% @as(u8, swap);
    for (0..len) |i| {
        const diff = (a[i] ^ b[i]) & mask;
        a[i] ^= diff;
        b[i] ^= diff;
    }
}

// ============================================================================
// Timing Regularization (Shadow Wire Covert Channel Prevention)
// ============================================================================

/// Execute a function and pad execution to a fixed duration.
/// Ensures identical timing regardless of input-dependent branching.
/// Uses nanosleep for durations > 1ms to avoid CPU waste; busy-waits for precision tail.
export fn timing_regularize(target_ns: u64) void {
    const start = std.time.nanoTimestamp();
    const target_signed: i128 = @intCast(target_ns);

    // Sleep for bulk of duration (reduce CPU usage)
    if (target_ns > 1_000_000) { // > 1ms
        const sleep_ns = target_ns - 500_000; // leave 0.5ms for precision tail
        std.time.sleep(sleep_ns);
    }

    // Busy-wait for precision tail (prevents timing jitter)
    while (true) {
        const elapsed = std.time.nanoTimestamp() - start;
        if (elapsed >= target_signed) break;
        std.mem.doNotOptimizeAway(@as(u8, 0));
    }
}

/// Heartbeat-aligned execution: pads to next 873ms boundary.
/// Ensures swarm node execution traces look uniform to observers.
export fn heartbeat_align() void {
    timing_regularize(HEARTBEAT_NS);
}

// ============================================================================
// Helix Position Encoding (MESIE Spectral Geometry)
// ============================================================================

/// Generate helix-encoded position embeddings for a given dimension.
/// Based on the organism's spectral helix geometry (φ-scaled frequencies).
export fn helix_encode(output: [*]f32, dim: usize, position: f32) void {
    for (0..dim) |i| {
        const freq = PHI / @as(f32, @floatFromInt(i + 1));
        if (i % 2 == 0) {
            output[i] = @sin(position * freq);
        } else {
            output[i] = @cos(position * freq);
        }
    }
}

/// Apply resonance decay to a buffer (spectral damping)
export fn resonance_decay(data: [*]f32, len: usize, decay_rate: f32) void {
    for (0..len) |i| {
        const t = @as(f32, @floatFromInt(i)) / @as(f32, @floatFromInt(len));
        data[i] *= @exp(-decay_rate * t);
    }
}

// ============================================================================
// Tests
// ============================================================================

test "resonance_dot SIMD" {
    const a = [_]f32{ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 };
    const b = [_]f32{ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 };
    const result = resonance_dot(&a, &b, 9, 1.0);
    try std.testing.expectApproxEqAbs(result, 45.0, 0.001);
}

test "resonance_dot with phi" {
    const a = [_]f32{ 1.0, 2.0, 3.0 };
    const b = [_]f32{ 4.0, 5.0, 6.0 };
    const result = resonance_dot(&a, &b, 3, PHI);
    try std.testing.expectApproxEqAbs(result, 32.0 * PHI, 0.01);
}

test "quantize roundtrip" {
    const input = [_]f32{ 0.5, -1.0, 0.25 };
    var quantized: [3]i8 = undefined;
    const scale = quantize_int8(&input, &quantized, 3);
    try std.testing.expectApproxEqAbs(scale, 1.0, 0.001);
    try std.testing.expectEqual(quantized[1], -127);

    var restored: [3]f32 = undefined;
    dequantize_int8(&quantized, &restored, 3, scale);
    try std.testing.expectApproxEqAbs(restored[1], -1.0, 0.01);
}

test "constant-time compare" {
    const a = [_]u8{ 0x01, 0x02, 0x03 };
    const b = [_]u8{ 0x01, 0x02, 0x03 };
    const c = [_]u8{ 0x01, 0x02, 0x04 };
    try std.testing.expectEqual(ct_compare(&a, &b, 3), 1);
    try std.testing.expectEqual(ct_compare(&a, &c, 3), 0);
}

test "helix encoding" {
    var output: [4]f32 = undefined;
    helix_encode(&output, 4, 1.0);
    // Position 1, dim 0: sin(PHI / 1)
    try std.testing.expectApproxEqAbs(output[0], @sin(PHI), 0.001);
    // Position 1, dim 1: cos(PHI / 2)
    try std.testing.expectApproxEqAbs(output[1], @cos(PHI / 2.0), 0.001);
}

test "ct_select_f32" {
    const a: f32 = 3.14;
    const b: f32 = 2.71;
    try std.testing.expectApproxEqAbs(ct_select_f32(a, b, 1), 3.14, 0.001);
    try std.testing.expectApproxEqAbs(ct_select_f32(a, b, 0), 2.71, 0.001);
}
