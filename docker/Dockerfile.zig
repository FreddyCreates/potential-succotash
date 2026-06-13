# Dockerfile.zig — Zig build environment for Sovereign Native Stack
FROM debian:bookworm-slim

ARG ZIG_VERSION=0.13.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    xz-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Zig
RUN curl -L "https://ziglang.org/download/${ZIG_VERSION}/zig-linux-x86_64-${ZIG_VERSION}.tar.xz" | \
    tar -xJ -C /usr/local && \
    ln -s /usr/local/zig-linux-x86_64-${ZIG_VERSION}/zig /usr/local/bin/zig

WORKDIR /workspace

# Copy source
COPY . .

# Default: build ReleaseFast
CMD ["zig", "build", "-Doptimize=ReleaseFast"]
