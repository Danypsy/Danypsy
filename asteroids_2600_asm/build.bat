@echo off
REM Build Asteroids for Atari 2600 with DASM.
cd /d "%~dp0"

where dasm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: DASM is not installed.
    echo DASM is the only supported assembler for this source.
    echo Install: https://dasm-assembler.github.io/
    exit /b 1
)

dasm asteroids.asm -f3 -oasteroids.bin
if %ERRORLEVEL% neq 0 exit /b 1

echo ROM built: asteroids.bin
for %%F in (asteroids.bin) do echo Size: %%~zF bytes
echo Atari 2600 cartridge limit is 4096 bytes.
echo Run with: stella asteroids.bin
