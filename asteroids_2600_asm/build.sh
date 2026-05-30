#!/bin/bash

# ============================================
# BUILD SCRIPT FOR ASTEROIDS (ATARI 2600)
# ============================================

echo "=========================================="
echo "Building Asteroids for Atari 2600"
echo "=========================================="
echo

# Check if DASM is available
if command -v dasm &> /dev/null; then
    echo "Using DASM assembler..."
    dasm asteroids.asm -f3 -oasteroids.bin
    if [ $? -eq 0 ]; then
        echo "ROM built successfully!"
        echo "File: asteroids.bin (4K)"
        echo
        echo "To run the ROM:"
        echo "1. Copy asteroids.bin to your emulator's ROM directory"
        echo "2. Load it in Stella, RetroArch, or Javatari"
        echo
        exit 0
    else
        echo "Error: DASM assembly failed"
        exit 1
    fi
fi

# Check if py65 is available
if command -v python3 &> /dev/null; then
    echo "DASM not found. Trying py65..."
    python3 -m py65.disassembler.dasm asteroids.asm -o asteroids.bin
    if [ $? -eq 0 ]; then
        echo "ROM built successfully with py65!"
        echo "File: asteroids.bin (4K)"
        echo
        echo "To run the ROM:"
        echo "1. Copy asteroids.bin to your emulator's ROM directory"
        echo "2. Load it in Stella, RetroArch, or Javatari"
        echo
        exit 0
    fi
fi

# Check if as6502 is available (from cc65)
if command -v as6502 &> /dev/null; then
    echo "Trying as6502 (cc65)..."
    as6502 -o asteroids.o asteroids.asm
    if [ $? -eq 0 ]; then
        # Need to convert to binary
        echo "as6502 succeeded, but need to convert to binary format"
        echo "This assembler may not produce the correct format for Atari 2600"
        exit 1
    fi
fi

echo "Error: No suitable assembler found!"
echo
echo "Please install one of the following:"
echo "1. DASM (recommended):"
echo "   https://dasm-assembler.github.io/"
echo "   On Ubuntu: sudo apt-get install dasm"
echo "   On macOS: brew install dasm"
echo
echo "2. py65:"
echo "   https://github.com/mnaberez/py65"
echo "   pip install py65"
echo
echo "3. cc65 (includes as6502):"
echo "   https://cc65.github.io/"
echo

 exit 1
