// src/neurocore.zig — Sovereign NeuroCore kernel (SIMD-optimized)
//
// Native implementation of resonance attention for edge deployment.
// C ABI compatible for Python CFFI binding.

const std = @import("std");
const math = std.math;

/// PHI constant for resonance calculations
const PHI: f32 = 1.618033988749895;
const HEARTBEAT_MS: u32 = 873;
const THRESHOLD: f32 = 1.0 / PHI;

/// Sovereign tensor header for FFI
pub const TensorHeader = extern struct {
    data_ptr: [*]f32,
    len: u32,
    shape_dims: u32,
    shape: [8]u32,
    resonance_score: f32,
};

/// Resonance-weighted dot product (SIMD candidate)
export fn resonance_dot(a: [*]const f32, b: [*]const f32, len: u32, resonance: f32) callconv(.C) f32 {
    var acc: f32 = 0.0;
    var i: u32 = 0;
    while (i < len) : (i += 1) {
        acc += a[i] * b[i];
    }
    return acc * resonance;
}

/// Native matmul with resonance weighting
export fn sovereign_matmul(
    a: [*]const f32,
    b: [*]const f32,
    out: [*]f32,
    m: u32,
    k: u32,
    n: u32,
    resonance: f32,
) callconv(.C) void {
    var i: u32 = 0;
    while (i < m) : (i += 1) {
        var j: u32 = 0;
        while (j < n) : (j += 1) {
            var acc: f32 = 0.0;
            var p: u32 = 0;
            while (p < k) : (p += 1) {
                acc += a[i * k + p] * b[p * n + j];
            }
            out[i * n + j] = acc * resonance;
        }
    }
}

/// Resonance attention score computation
export fn resonance_attention(
    q: [*]const f32,
    k: [*]const f32,
    scores_out: [*]f32,
    len: u32,
) callconv(.C) void {
    var max_s: f32 = -math.inf(f32);
    var i: u32 = 0;

    // Compute raw scores with resonance decay
    while (i < len) : (i += 1) {
        var dot: f32 = 0.0;
        var j: u32 = 0;
        while (j < len) : (j += 1) {
            dot += q[i] * k[j];
        }
        const resonance_decay = @exp(-@abs(dot) * 0.5);
        scores_out[i] = dot * resonance_decay;
        if (scores_out[i] > max_s) max_s = scores_out[i];
    }

    // Softmax
    var total: f32 = 0.0;
    i = 0;
    while (i < len) : (i += 1) {
        scores_out[i] = @exp(scores_out[i] - max_s);
        total += scores_out[i];
    }
    if (total > 0) {
        i = 0;
        while (i < len) : (i += 1) {
            scores_out[i] /= total;
        }
    }
}

/// Int8 quantization for edge deployment
export fn quantize_int8(
    data: [*]const f32,
    out: [*]i8,
    len: u32,
    scale_out: *f32,
) callconv(.C) void {
    var max_abs: f32 = 0.0;
    var i: u32 = 0;
    while (i < len) : (i += 1) {
        const abs_val = @abs(data[i]);
        if (abs_val > max_abs) max_abs = abs_val;
    }
    if (max_abs == 0) max_abs = 1.0;
    scale_out.* = max_abs;

    i = 0;
    while (i < len) : (i += 1) {
        out[i] = @intFromFloat((data[i] / max_abs) * 127.0);
    }
}

test "resonance_dot basic" {
    const a = [_]f32{ 1.0, 2.0, 3.0, 4.0 };
    const b = [_]f32{ 4.0, 3.0, 2.0, 1.0 };
    const result = resonance_dot(&a, &b, 4, 1.0);
    try std.testing.expectApproxEqAbs(result, 20.0, 0.001);
}

test "resonance_dot with resonance" {
    const a = [_]f32{ 1.0, 1.0 };
    const b = [_]f32{ 1.0, 1.0 };
    const result = resonance_dot(&a, &b, 2, PHI);
    try std.testing.expectApproxEqAbs(result, 2.0 * PHI, 0.001);
}
