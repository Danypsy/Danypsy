# Asteroids for Atari 2600 — DASM only.
TARGET = asteroids.bin
SOURCE = asteroids.asm
ASM = dasm
DASM_FLAGS = -f3 -o$(TARGET)

all: $(TARGET)

$(TARGET): $(SOURCE)
	$(ASM) $(DASM_FLAGS) $(SOURCE)
	@echo "ROM built: $(TARGET)"
	@wc -c $(TARGET)
	@echo "Atari 2600 cartridge limit is 4096 bytes."

clean:
	rm -f $(TARGET) *.sym *.lst *.err

run: $(TARGET)
	stella $(TARGET)

help:
	@echo "Targets: make, make clean, make run"
	@echo "Assemble manually: dasm $(SOURCE) -f3 -o$(TARGET)"

.PHONY: all clean run help
