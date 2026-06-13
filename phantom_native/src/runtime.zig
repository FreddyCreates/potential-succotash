// src/runtime.zig — Sovereign Swarm Runtime (standalone executable)
//
// Minimal standalone runtime for sovereign execution.
// Reads spectral configs, spawns neurocores, processes intents.

const std = @import("std");
const neurocore = @import("neurocore.zig");

const PHI: f32 = 1.618033988749895;
const HEARTBEAT_MS: u32 = 873;

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();

    try stdout.print("═══════════════════════════════════════════════════════\n", .{});
    try stdout.print("  Phantom Swarm Runtime — Sovereign Native Stack\n", .{});
    try stdout.print("  PHI: {d:.6}  HEARTBEAT: {d}ms\n", .{ PHI, HEARTBEAT_MS });
    try stdout.print("═══════════════════════════════════════════════════════\n", .{});

    // Demo: resonance dot product
    const a = [_]f32{ 1.0, 2.0, 3.0, 4.0 };
    const b = [_]f32{ 0.5, 0.5, 0.5, 0.5 };
    const dot_result = neurocore.resonance_dot(&a, &b, 4, PHI);
    try stdout.print("  Resonance dot: {d:.4}\n", .{dot_result});

    // Demo: matmul 2x2
    const mat_a = [_]f32{ 1.0, 2.0, 3.0, 4.0 };
    const mat_b = [_]f32{ 5.0, 6.0, 7.0, 8.0 };
    var mat_out: [4]f32 = undefined;
    neurocore.sovereign_matmul(&mat_a, &mat_b, &mat_out, 2, 2, 2, 1.0);
    try stdout.print("  Matmul [2x2]: [{d:.1}, {d:.1}, {d:.1}, {d:.1}]\n", .{
        mat_out[0], mat_out[1], mat_out[2], mat_out[3],
    });

    // Demo: quantization
    const data = [_]f32{ -1.0, 0.5, 0.75, -0.25 };
    var quantized: [4]i8 = undefined;
    var scale: f32 = undefined;
    neurocore.quantize_int8(&data, &quantized, 4, &scale);
    try stdout.print("  Quantized (scale={d:.3}): [{d}, {d}, {d}, {d}]\n", .{
        scale, quantized[0], quantized[1], quantized[2], quantized[3],
    });

    try stdout.print("═══════════════════════════════════════════════════════\n", .{});
    try stdout.print("  Runtime ready. Swarm operational.\n", .{});
    try stdout.print("═══════════════════════════════════════════════════════\n", .{});
}
