@echo off
REM ============================================
REM BUILD BATCH FILE FOR ASTEROIDS (ATARI 2600)
REM ============================================

REM Check if DASM is available
where dasm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Using DASM assembler...
    dasm asteroids.asm -f3 -oasteroids.bin
) else (
    echo DASM not found. Trying alternative methods...
    
    REM Check if Python and py65 are available
    where python >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        python -m py65.disassembler.dasm asteroids.asm -o asteroids.bin
        if %ERRORLEVEL% equ 0 (
            echo Built with py65
            goto SUCCESS
        )
    )
    
    echo Error: No assembler found!
    echo Please install DASM or py65 to assemble the ROM.
    echo.
    echo DASM: https://dasm-assembler.github.io/
    echo py65: https://github.com/mnaberez/py65
    goto END
)

:SUCCESS
echo.
echo ROM built successfully!
echo File: asteroids.bin (4K)
echo.
echo To run the ROM:
echo 1. Copy asteroids.bin to your emulator's ROM directory
echo 2. Load it in Stella, RetroArch, or Javatari

:END
pause
