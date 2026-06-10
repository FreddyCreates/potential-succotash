// phantom_native/zig/src/neurocore.zig
// Sovereign NeuroCore — Zig native kernel (SIMD-ready)
// C ABI exports for Python CFFI binding (no NumPy dependency)

const std = @import("std");
const math = std.math;

/// Resonance-weighted dot product (scalar fallback; SIMD override available)
export fn resonance_dot(a: [*]const f32, b: [*]const f32, len: usize, resonance: f32) f32 {
    var acc: f32 = 0.0;
    for (0..len) |i| {
        acc += a[i] * b[i];
    }
    return acc * resonance;
}

/// Native softmax over a float buffer (in-place)
export fn native_softmax(data: [*]f32, len: usize) void {
    var max_val: f32 = -math.inf(f32);
    for (0..len) |i| {
        if (data[i] > max_val) max_val = data[i];
    }
    var total: f32 = 0.0;
    for (0..len) |i| {
        data[i] = @exp(data[i] - max_val);
        total += data[i];
    }
    if (total > 0.0) {
        for (0..len) |i| {
            data[i] /= total;
        }
    }
}

/// Quantize float buffer to int8 (returns scale factor)
export fn quantize_int8(input: [*]const f32, output: [*]i8, len: usize) f32 {
    var max_abs: f32 = 0.0;
    for (0..len) |i| {
        const abs_val = @abs(input[i]);
        if (abs_val > max_abs) max_abs = abs_val;
    }
    const scale = if (max_abs > 0.0) max_abs else 1.0;
    for (0..len) |i| {
        const normalized = input[i] / scale;
        output[i] = @intFromFloat(normalized * 127.0);
    }
    return scale;
}

/// Matrix multiply: C[m,n] = A[m,k] * B[k,n] * resonance
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
            var acc: f32 = 0.0;
            for (0..k) |p| {
                acc += a[i * k + p] * b[p * n + j];
            }
            c[i * n + j] = acc * resonance;
        }
    }
}

test "resonance_dot basic" {
    const a = [_]f32{ 1.0, 2.0, 3.0 };
    const b = [_]f32{ 4.0, 5.0, 6.0 };
    const result = resonance_dot(&a, &b, 3, 1.0);
    try std.testing.expectApproxEqAbs(result, 32.0, 0.001);
}

test "quantize roundtrip" {
    const input = [_]f32{ 0.5, -1.0, 0.25 };
    var output: [3]i8 = undefined;
    const scale = quantize_int8(&input, &output, 3);
    try std.testing.expectApproxEqAbs(scale, 1.0, 0.001);
    try std.testing.expectEqual(output[1], -127);
}
