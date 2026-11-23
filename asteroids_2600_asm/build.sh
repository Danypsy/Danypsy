#!/bin/bash
# Build Asteroids for Atari 2600 with DASM.
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v dasm >/dev/null 2>&1; then
    echo "Error: DASM is not installed."
    echo "DASM is the only supported assembler for this source."
    echo "Install: https://dasm-assembler.github.io/"
    exit 1
fi

dasm asteroids.asm -f3 -oasteroids.bin

size=$(wc -c < asteroids.bin | tr -d ' ')
echo "ROM built: asteroids.bin (${size} bytes)"
echo "Atari 2600 cartridge limit is 4096 bytes."
echo "Run with: stella asteroids.bin"
