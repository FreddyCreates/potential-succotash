// phantom_native/zig/build.zig
// Sovereign Native Stack — Zig build for performance-critical kernels (C ABI compatible)
// Python is the reference/verification layer; Zig is the deployment layer.
const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Static library: core tensor + neurocore kernels
    const lib = b.addStaticLibrary(.{
        .name = "phantom_native",
        .root_source_file = b.path("src/neurocore.zig"),
        .target = target,
        .optimize = optimize,
    });
    b.installArtifact(lib);

    // Executable: swarm runtime with manifest attestation
    const exe = b.addExecutable(.{
        .name = "phantom_swarm",
        .root_source_file = b.path("src/runtime.zig"),
        .target = target,
        .optimize = optimize,
    });
    exe.linkLibrary(lib);
    b.installArtifact(exe);

    // Test step
    const unit_tests = b.addTest(.{
        .root_source_file = b.path("src/neurocore.zig"),
        .target = target,
        .optimize = optimize,
    });
    const run_tests = b.addRunArtifact(unit_tests);
    const test_step = b.step("test", "Run native unit tests");
    test_step.dependOn(&run_tests.step);
}
