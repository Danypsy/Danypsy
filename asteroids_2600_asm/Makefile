# ============================================
# MAKEFILE FOR ASTEROIDS (ATARI 2600)
# ============================================

# Target ROM file
TARGET = asteroids.bin

# Source file
SOURCE = asteroids.asm

# Assembler (try DASM first, then py65)
ASM = dasm

# Flags for DASM
DASM_FLAGS = -f3 -o$(TARGET)

# Default target
all: $(TARGET)

# Build with DASM
$(TARGET): $(SOURCE)
	@echo "Building Asteroids for Atari 2600..."
	@echo "Using $(ASM)..."
	$(ASM) $(DASM_FLAGS) $(SOURCE)
	@echo "ROM built successfully!"
	@echo "File: $(TARGET) (4K)"

# Clean
clean:
	rm -f $(TARGET) *.sym *.lst *.err
	@echo "Cleaned up build files"

# Run with Stella (if available)
run: $(TARGET)
	@echo "Running with Stella..."
	stella $(TARGET)

# Show help
help:
	@echo "Makefile for Asteroids (Atari 2600)"
	@echo ""
	@echo "Targets:"
	@echo "  make        - Build the ROM"
	@echo "  make clean  - Clean build files"
	@echo "  make run    - Build and run with Stella"
	@echo ""
	@echo "To run manually:"
	@echo "  stella $(TARGET)"
	@echo ""
	@echo "To assemble manually:"
	@echo "  dasm $(SOURCE) -f3 -o$(TARGET)"

.PHONY: all clean run help
