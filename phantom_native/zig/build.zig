// phantom_native/zig/build.zig
// Sovereign Native Stack — Zig build system with cross-compilation targets
// Produces attestable static binaries for: x86_64, ARM Cortex, ESP32-S3 Xtensa
// Python is the reference/verification layer; Zig is the deployment layer.
const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // =========================================================================
    // Core Static Library: tensor + neurocore SIMD kernels
    // =========================================================================
    const lib = b.addStaticLibrary(.{
        .name = "phantom_native",
        .root_source_file = b.path("src/neurocore.zig"),
        .target = target,
        .optimize = optimize,
    });
    b.installArtifact(lib);

    // =========================================================================
    // Standalone Runtime Executable (attestable binary)
    // =========================================================================
    const exe = b.addExecutable(.{
        .name = "phantom_swarm",
        .root_source_file = b.path("src/runtime.zig"),
        .target = target,
        .optimize = optimize,
    });
    exe.linkLibrary(lib);
    b.installArtifact(exe);

    // =========================================================================
    // Cross-Compilation Named Steps
    // =========================================================================

    // ARM Cortex-M7 freestanding (embedded edge nodes)
    const arm_lib = b.addStaticLibrary(.{
        .name = "phantom_native_arm",
        .root_source_file = b.path("src/neurocore.zig"),
        .target = b.resolveTargetQuery(.{
            .cpu_arch = .arm,
            .os_tag = .freestanding,
            .abi = .eabi,
            .cpu_model = .{ .explicit = &std.Target.arm.cpu.cortex_m7 },
        }),
        .optimize = .ReleaseFast,
    });
    const arm_step = b.step("arm", "Build for ARM Cortex-M7 freestanding");
    arm_step.dependOn(&b.addInstallArtifact(arm_lib, .{}).step);

    // x86_64 Linux musl (static micro-cluster binary)
    const x86_lib = b.addStaticLibrary(.{
        .name = "phantom_native_x86",
        .root_source_file = b.path("src/neurocore.zig"),
        .target = b.resolveTargetQuery(.{
            .cpu_arch = .x86_64,
            .os_tag = .linux,
            .abi = .musl,
        }),
        .optimize = .ReleaseFast,
    });
    const x86_step = b.step("x86-musl", "Build for x86_64-linux-musl (static)");
    x86_step.dependOn(&b.addInstallArtifact(x86_lib, .{}).step);

    // AArch64 Linux musl (Raspberry Pi / ARM servers)
    const aarch64_lib = b.addStaticLibrary(.{
        .name = "phantom_native_aarch64",
        .root_source_file = b.path("src/neurocore.zig"),
        .target = b.resolveTargetQuery(.{
            .cpu_arch = .aarch64,
            .os_tag = .linux,
            .abi = .musl,
        }),
        .optimize = .ReleaseFast,
    });
    const aarch64_step = b.step("aarch64-musl", "Build for aarch64-linux-musl (static)");
    aarch64_step.dependOn(&b.addInstallArtifact(aarch64_lib, .{}).step);

    // =========================================================================
    // Test Step
    // =========================================================================
    const unit_tests = b.addTest(.{
        .root_source_file = b.path("src/neurocore.zig"),
        .target = target,
        .optimize = optimize,
    });
    const run_tests = b.addRunArtifact(unit_tests);
    const test_step = b.step("test", "Run native unit tests");
    test_step.dependOn(&run_tests.step);
}

