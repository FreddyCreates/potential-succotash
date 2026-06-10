// build.zig — Sovereign Native Stack (Zig export skeleton)
//
// Builds the performance-critical native kernels:
// - phantom_native: static library with SIMD-optimized tensor ops
// - phantom_swarm: standalone swarm runtime executable
//
// Build: zig build -Doptimize=ReleaseFast
// Output: attestable deterministic binary

const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // ── Static Library: phantom_native ───────────────────────────────────────
    const lib = b.addStaticLibrary(.{
        .name = "phantom_native",
        .root_source_file = b.path("src/neurocore.zig"),
        .target = target,
        .optimize = optimize,
    });
    b.installArtifact(lib);

    // ── Executable: phantom_swarm runtime ────────────────────────────────────
    const exe = b.addExecutable(.{
        .name = "phantom_swarm",
        .root_source_file = b.path("src/runtime.zig"),
        .target = target,
        .optimize = optimize,
    });
    exe.linkLibrary(lib);
    b.installArtifact(exe);

    // ── Tests ────────────────────────────────────────────────────────────────
    const unit_tests = b.addTest(.{
        .root_source_file = b.path("src/neurocore.zig"),
        .target = target,
        .optimize = optimize,
    });
    const run_unit_tests = b.addRunArtifact(unit_tests);
    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_unit_tests.step);
}
