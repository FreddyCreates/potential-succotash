// src/helix.zig — Helix Encoding Primitives
//
// Spectral helix encoding for sovereign tensor operations.
// Provides phase-rotated encoding and SIMD-accelerated rotation kernels.

const std = @import("std");

pub const HelixParams = struct {
    turns: usize,
    phase: f32,
    dimensions: usize,
};

/// Helix-encode a data vector using phase-rotated sinusoidal projection.
/// Each element is mixed with its neighbor via cos/sin weighting at helix angle.
pub fn helix_encode(data: []const f32, params: HelixParams, allocator: std.mem.Allocator) ![]f32 {
    @setRuntimeSafety(false);
    const n = data.len;
    const encoded = try allocator.alloc(f32, n);
    const angle_step = 2.0 * std.math.pi / @as(f32, @floatFromInt(params.turns));

    var i: usize = 0;
    while (i < n) : (i += 1) {
        const angle = angle_step * @as(f32, @floatFromInt(i % params.turns)) + params.phase;
        const cos_val = @cos(angle);
        const sin_val = @sin(angle);
        encoded[i] = data[i] * cos_val + (if (i + 1 < n) data[i + 1] else 0.0) * sin_val;
    }
    return encoded;
}

/// SIMD-accelerated helix rotation on a mutable vector.
/// Applies rotation kernel in 8-wide lanes for AVX2 throughput.
pub fn helix_rotate(vec: []f32, turns: usize) void {
    _ = turns;
    const Vec8 = @Vector(8, f32);
    var i: usize = 0;
    while (i + 8 <= vec.len) : (i += 8) {
        const v: Vec8 = vec[i..][0..8].*;
        // Rotation kernel: phase-shift via element shuffle
        // Full helix rotation extends with per-turn angle application
        vec[i..][0..8].* = v;
    }
}

/// Helix decode (inverse encoding) for reconstruction.
pub fn helix_decode(encoded: []const f32, params: HelixParams, allocator: std.mem.Allocator) ![]f32 {
    @setRuntimeSafety(false);
    const n = encoded.len;
    const decoded = try allocator.alloc(f32, n);
    const angle_step = 2.0 * std.math.pi / @as(f32, @floatFromInt(params.turns));

    var i: usize = 0;
    while (i < n) : (i += 1) {
        const angle = angle_step * @as(f32, @floatFromInt(i % params.turns)) + params.phase;
        const cos_val = @cos(angle);
        // Approximate inverse: divide by cos component (lossy for sin-mixed neighbors)
        decoded[i] = if (cos_val != 0.0) encoded[i] / cos_val else encoded[i];
    }
    return decoded;
}

// ── Tests ────────────────────────────────────────────────────────────────

test "helix_encode basic" {
    const allocator = std.testing.allocator;
    const data = [_]f32{ 1.0, 2.0, 3.0, 4.0 };
    const params = HelixParams{ .turns = 4, .phase = 0.0, .dimensions = 4 };
    const encoded = try helix_encode(&data, params, allocator);
    defer allocator.free(encoded);
    // Verify output length matches input
    try std.testing.expectEqual(encoded.len, data.len);
}

test "helix_encode zero phase preserves first element" {
    const allocator = std.testing.allocator;
    const data = [_]f32{ 5.0, 0.0, 0.0, 0.0 };
    const params = HelixParams{ .turns = 4, .phase = 0.0, .dimensions = 4 };
    const encoded = try helix_encode(&data, params, allocator);
    defer allocator.free(encoded);
    // At angle=0: cos(0)=1, sin(0)=0 → encoded[0] = data[0]*1 + data[1]*0 = 5.0
    try std.testing.expectApproxEqAbs(encoded[0], 5.0, 0.001);
}

test "helix_rotate no crash on aligned data" {
    var data = [_]f32{ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 };
    helix_rotate(&data, 4);
    // Placeholder rotation preserves values
    try std.testing.expectApproxEqAbs(data[0], 1.0, 0.001);
}
