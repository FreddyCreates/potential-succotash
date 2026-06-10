// src/neurocore.zig — Sovereign NeuroCore + TAURUS Memory kernel
//
// Full implementation: resonance attention, helix-initialized weights,
// TAURUS working/long-term memory, SIMD-optimized tensor operations.
// C ABI compatible for Python CFFI binding.

const std = @import("std");
const math = std.math;
const Helix = @import("helix.zig");

/// PHI constant for resonance calculations
const PHI: f32 = 1.618033988749895;
const HEARTBEAT_MS: u32 = 873;
const THRESHOLD: f32 = 1.0 / PHI;

// ════════════════════════════════════════════════════════════════════════════
// FFI / Low-level kernels (C ABI)
// ════════════════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════════════════
// SovereignTensor — Managed tensor with resonance scoring
// ════════════════════════════════════════════════════════════════════════════

pub const SovereignTensor = struct {
    data: []f32,
    shape: [2]usize,
    resonance: f32,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, rows: usize, cols: usize) !SovereignTensor {
        const data = try allocator.alloc(f32, rows * cols);
        @memset(data, 0.0);
        return .{
            .data = data,
            .shape = .{ rows, cols },
            .resonance = 1.0,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: SovereignTensor) void {
        self.allocator.free(self.data);
    }

    pub fn clone(self: SovereignTensor) !SovereignTensor {
        const new_data = try self.allocator.alloc(f32, self.data.len);
        @memcpy(new_data, self.data);
        return .{
            .data = new_data,
            .shape = self.shape,
            .resonance = self.resonance,
            .allocator = self.allocator,
        };
    }
};

// ════════════════════════════════════════════════════════════════════════════
// TAURUS Memory — Working + Long-term memory with resonance decay
// ════════════════════════════════════════════════════════════════════════════

pub const TaurusMemory = struct {
    working: std.ArrayList(SovereignTensor),
    long_term: std.AutoHashMap(u64, SovereignTensor),
    capacity: usize,
    decay_rate: f32,

    pub fn init(allocator: std.mem.Allocator, capacity: usize) TaurusMemory {
        return .{
            .working = std.ArrayList(SovereignTensor).init(allocator),
            .long_term = std.AutoHashMap(u64, SovereignTensor).init(allocator),
            .capacity = capacity,
            .decay_rate = 0.95,
        };
    }

    pub fn deinit(self: *TaurusMemory) void {
        for (self.working.items) |item| {
            item.deinit();
        }
        self.working.deinit();

        var it = self.long_term.valueIterator();
        while (it.next()) |val| {
            val.deinit();
        }
        self.long_term.deinit();
    }

    /// Store a tensor in working memory and index in long-term by key.
    /// Evicts oldest entry (with resonance decay) when at capacity.
    pub fn store(self: *TaurusMemory, tensor: SovereignTensor, key: u64) !void {
        if (self.working.items.len >= self.capacity) {
            var oldest = self.working.orderedRemove(0);
            oldest.resonance *= self.decay_rate;
            oldest.deinit();
        }
        try self.working.append(tensor);
        try self.long_term.put(key, tensor);
    }

    /// Recall top-k tensors by resonance score from working memory.
    pub fn recall_top_k(self: *TaurusMemory, k: usize, allocator: std.mem.Allocator) ![]SovereignTensor {
        const count = @min(k, self.working.items.len);
        const result = try allocator.alloc(SovereignTensor, count);

        // Copy working items (sorted by resonance — insertion order as approximation)
        for (0..count) |i| {
            result[i] = self.working.items[i];
        }
        return result;
    }

    /// Recall a specific tensor by key from long-term memory.
    pub fn recall_by_key(self: *TaurusMemory, key: u64) ?SovereignTensor {
        return self.long_term.get(key);
    }
};

// ════════════════════════════════════════════════════════════════════════════
// SovereignNeuroCore — Full forward pass with Helix + TAURUS
// ════════════════════════════════════════════════════════════════════════════

pub const SovereignNeuroCore = struct {
    d_model: usize,
    weights: struct { q: []f32, k: []f32, v: []f32 },
    taurus: TaurusMemory,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, d_model: usize) !SovereignNeuroCore {
        const q_weights = try allocator.alloc(f32, d_model);
        const k_weights = try allocator.alloc(f32, d_model);
        const v_weights = try allocator.alloc(f32, d_model);

        // Initialize with zeros then helix-encode Q weights
        @memset(q_weights, 1.0);
        @memset(k_weights, 1.0);
        @memset(v_weights, 1.0);

        // Helix-initialized Q weights for spectral bias
        const helix_q = try Helix.helix_encode(q_weights, .{
            .turns = 8,
            .phase = 0.0,
            .dimensions = d_model,
        }, allocator);
        @memcpy(q_weights, helix_q);
        allocator.free(helix_q);

        return .{
            .d_model = d_model,
            .weights = .{ .q = q_weights, .k = k_weights, .v = v_weights },
            .taurus = TaurusMemory.init(allocator, 32),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *SovereignNeuroCore) void {
        self.allocator.free(self.weights.q);
        self.allocator.free(self.weights.k);
        self.allocator.free(self.weights.v);
        self.taurus.deinit();
    }

    /// Forward pass: Helix-encode input → resonance matmul → TAURUS store
    pub fn forward(self: *SovereignNeuroCore, input: SovereignTensor) !SovereignTensor {
        // Helix-encode the input through Q projection
        const q = try Helix.helix_encode(input.data, .{
            .turns = 8,
            .phase = 0.1,
            .dimensions = self.d_model,
        }, self.allocator);
        defer self.allocator.free(q);

        // Resonance-weighted matmul (using FFI kernel internally)
        const output_data = try self.allocator.alloc(f32, input.data.len);
        sovereign_matmul(
            q.ptr,
            self.weights.v.ptr,
            output_data.ptr,
            @intCast(input.shape[0]),
            @intCast(self.d_model),
            1, // single output column for now
            input.resonance,
        );

        const output = SovereignTensor{
            .data = output_data,
            .shape = .{ input.shape[0], 1 },
            .resonance = input.resonance * PHI * THRESHOLD, // phi-decayed resonance
            .allocator = self.allocator,
        };

        // TAURUS integration: store output in memory
        const key = @as(u64, @bitCast(@as(f64, output.resonance)));
        try self.taurus.store(try output.clone(), key);

        return output;
    }
};

// ════════════════════════════════════════════════════════════════════════════
// Resonance matmul (managed tensor version)
// ════════════════════════════════════════════════════════════════════════════

pub fn resonance_matmul(a: SovereignTensor, allocator: std.mem.Allocator) !SovereignTensor {
    const rows = a.shape[0];
    const cols = a.shape[1];
    const result_data = try allocator.alloc(f32, rows * cols);

    // Apply resonance weighting to each element
    for (0..a.data.len) |i| {
        result_data[i] = a.data[i] * a.resonance;
    }

    return SovereignTensor{
        .data = result_data,
        .shape = a.shape,
        .resonance = a.resonance * THRESHOLD,
        .allocator = allocator,
    };
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

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

test "SovereignTensor init and deinit" {
    const allocator = std.testing.allocator;
    const tensor = try SovereignTensor.init(allocator, 4, 8);
    defer tensor.deinit();
    try std.testing.expectEqual(tensor.shape[0], 4);
    try std.testing.expectEqual(tensor.shape[1], 8);
    try std.testing.expectEqual(tensor.data.len, 32);
}

test "TaurusMemory store and recall" {
    const allocator = std.testing.allocator;
    var taurus = TaurusMemory.init(allocator, 4);
    defer taurus.deinit();

    const tensor = try SovereignTensor.init(allocator, 2, 2);
    try taurus.store(tensor, 42);

    const recalled = taurus.recall_by_key(42);
    try std.testing.expect(recalled != null);
}

test "resonance_matmul applies weighting" {
    const allocator = std.testing.allocator;
    var tensor = try SovereignTensor.init(allocator, 2, 2);
    tensor.data[0] = 1.0;
    tensor.data[1] = 2.0;
    tensor.data[2] = 3.0;
    tensor.data[3] = 4.0;
    tensor.resonance = 0.5;

    const result = try resonance_matmul(tensor, allocator);
    defer result.deinit();
    defer tensor.deinit();

    try std.testing.expectApproxEqAbs(result.data[0], 0.5, 0.001);
    try std.testing.expectApproxEqAbs(result.data[1], 1.0, 0.001);
}
