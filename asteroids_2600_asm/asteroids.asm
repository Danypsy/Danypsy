        ; ============================================
        ; ASTEROIDS FOR ATARI 2600
        ; 6502 Assembly - VCS Style
        ; ============================================
        ; 
        ; A classic Asteroids game for the Atari 2600
        ; Works on Stella, RetroArch, and other emulators
        ; 
        ; Author: Vibe Code
        ; Date: 2024
        ; 
        ; ============================================

        ; ============================================
        ; MEMORY MAP
        ; ============================================
        ; RAM: $80-$FF (128 bytes)
        ; ROM: $F000-$FFFF (4K)
        ; 
        ; TIA Registers: $00-$3F (read/write)
        ; RIOT Registers: $280-$2FF (I/O, Timer, RAM)
        ; ============================================

        ; ============================================
        ; INCLUDES
        ; ============================================
        ; We'll define everything here for simplicity
        ; ============================================

        ; ============================================
        ; CONSTANTS
        ; ============================================

        ; TIA Registers
VSYNC   = $00           ; Vertical Sync
VBLANK  = $01           ; Vertical Blank
WSYNC   = $02           ; Wait for Sync
RSYNC   = $03           ; Reset Sync
NUSIZ0  = $04           ; Player 0 Size
NUSIZ1  = $05           ; Player 1 Size
COLUP0  = $06           ; Player 0 Color
COLUP1  = $07           ; Player 1 Color
COLUPF  = $08           ; Playfield Color
COLUBK  = $09           ; Background Color
CTRLPF  = $0A           ; Playfield Control
PF0     = $0D           ; Playfield Register 0
PF1     = $0E           ; Playfield Register 1
PF2     = $0F           ; Playfield Register 2
RESP0   = $10           ; Player 0 Reset
RESP1   = $11           ; Player 1 Reset
RESM0   = $12           ; Missile 0 Reset
RESM1   = $13           ; Missile 1 Reset
RESBL   = $14           ; Ball Reset
AUDV0   = $15           ; Audio Channel 0 Volume
AUDV1   = $16           ; Audio Channel 1 Volume
AUDF0   = $17           ; Audio Channel 0 Frequency
AUDF1   = $18           ; Audio Channel 1 Frequency
AUDC0   = $19           ; Audio Channel 0 Control
AUDC1   = $1A           ; Audio Channel 1 Control
GRP0    = $1B           ; Player 0 Graphics
GRP1    = $1C           ; Player 1 Graphics
ENAM0   = $1D           ; Missile 0 Enable
ENAM1   = $1E           ; Missile 1 Enable
ENABL   = $1F           ; Ball Enable
HMP0    = $20           ; Player 0 Horizontal Motion
HMP1    = $21           ; Player 1 Horizontal Motion
HMM0    = $22           ; Missile 0 Horizontal Motion
HMM1    = $23           ; Missile 1 Horizontal Motion
HMBL    = $24           ; Ball Horizontal Motion
VDELP0  = $25           ; Player 0 Vertical Delay
VDELP1  = $26           ; Player 1 Vertical Delay
VDELBL  = $27           ; Ball Vertical Delay
CXM0P   = $30           ; Collision Detection
CXM1P   = $31
CXP0FB  = $32
CXP1FB  = $33
CXM0FB  = $34
CXM1FB  = $35
CXBLPF  = $36
CXPPMM  = $37
INPT0   = $38           ; Joystick 0 Input
INPT1   = $39           ; Joystick 1 Input
INPT2   = $3A           ; Joystick 2 Input
INPT3   = $3B           ; Joystick 3 Input
INPT4   = $3C           ; Joystick 4 Input
INPT5   = $3D           ; Joystick 5 Input

        ; RIOT Registers
SWACNT  = $280          ; Switch Control
SWCHA   = $280          ; Joystick 0
SWCHB   = $282          ; Joystick 1
INTIM   = $284          ; Timer Output
TIMINT  = $285          ; Timer Set

        ; ============================================
        ; RAM VARIABLES ($80-$FF)
        ; ============================================

        SEG.U variables
        ORG $80

; Game State Variables
GameState       ds 1    ; 0=title, 1=playing, 2=game over
Lives           ds 1    ; Number of lives (BCD)
Score           ds 3    ; Score (BCD, 6 digits)
HighScore       ds 3    ; High score (BCD, 6 digits)
Level           ds 1    ; Current level

; Player Variables
PlayerX         ds 1    ; Player X position
PlayerY         ds 1    ; Player Y position
PlayerAngle     ds 1    ; Player angle (0-255)
PlayerVelocityX ds 1    ; Player X velocity (signed)
PlayerVelocityY ds 1    ; Player Y velocity (signed)
PlayerThrust    ds 1    ; Thrust flag (0=off, 1=on)
PlayerInvuln    ds 1    ; Invulnerability timer

; Bullet Variables
BulletActive    ds 1    ; Bullet active flag
BulletX         ds 1    ; Bullet X position
BulletY         ds 1    ; Bullet Y position
BulletVelocityX ds 1   ; Bullet X velocity
BulletVelocityY ds 1   ; Bullet Y velocity
BulletTimer     ds 1    ; Bullet lifetime timer

; Asteroid Variables (we'll use multiple objects)
Asteroid0X      ds 1
Asteroid0Y      ds 1
Asteroid0VX     ds 1
Asteroid0VY     ds 1
Asteroid0Size   ds 1
Asteroid0Angle  ds 1
Asteroid0Active ds 1

Asteroid1X      ds 1
Asteroid1Y      ds 1
Asteroid1VX     ds 1
Asteroid1VY     ds 1
Asteroid1Size   ds 1
Asteroid1Angle  ds 1
Asteroid1Active ds 1

Asteroid2X      ds 1
Asteroid2Y      ds 1
Asteroid2VX     ds 1
Asteroid2VY     ds 1
Asteroid2Size   ds 1
Asteroid2Angle  ds 1
Asteroid2Active ds 1

Asteroid3X      ds 1
Asteroid3Y      ds 1
Asteroid3VX     ds 1
Asteroid3VY     ds 1
Asteroid3Size   ds 1
Asteroid3Angle  ds 1
Asteroid3Active ds 1

; Random Number Generator
RandomSeed      ds 1

; Frame Counter
FrameCounter    ds 1

; Temp Variables
Temp0           ds 1
Temp1           ds 1
Temp2           ds 1
Temp3           ds 1
Temp4           ds 1
Temp5           ds 1

; Joystick Input
Joystick0       ds 1
Joystick0Old    ds 1

; Sound Variables
SoundThrust     ds 1    ; Thrust sound flag
SoundShoot      ds 1    ; Shoot sound flag
SoundExplosion  ds 1    ; Explosion sound flag

        ; ============================================
        ; ROM CODE ($F000-$FFFF)
        ; ============================================

        SEG code
        ORG $F000

; ============================================
; RESET AND INITIALIZATION
; ============================================

Reset:
        ; Reset the system
        SEI             ; Disable interrupts
        CLD             ; Clear decimal mode
        
        ; Initialize RAM to 0
        LDX #0
        TXA
ClearRAM:
        STA 0,X
        INX
        BNE ClearRAM
        
        ; Set up stack
        LDX #$FF
        TXS
        
        ; Initialize TIA
        LDA #0
        STA VSYNC
        STA VBLANK
        STA WSYNC
        
        ; Set colors
        LDA #$1A        ; White for player
        STA COLUP0
        LDA #$44        ; Red for player 1 (bullets)
        STA COLUP1
        LDA #$1E        ; Background color (dark blue)
        STA COLUBK
        LDA #$00        ; Playfield color (black)
        STA COLUPF
        
        ; Initialize game state
        LDA #0
        STA GameState   ; Start at title screen
        STA Lives
        STA Level
        STA FrameCounter
        STA RandomSeed
        
        ; Set initial high score
        LDA #0
        STA HighScore
        STA HighScore+1
        STA HighScore+2
        
        ; Initialize player
        LDA #100
        STA PlayerX
        LDA #100
        STA PlayerY
        LDA #0
        STA PlayerAngle
        STA PlayerVelocityX
        STA PlayerVelocityY
        STA PlayerThrust
        
        ; Initialize bullet
        LDA #0
        STA BulletActive
        
        ; Initialize asteroids
        LDA #0
        STA Asteroid0Active
        STA Asteroid1Active
        STA Asteroid2Active
        STA Asteroid3Active
        
        ; Initialize sound
        LDA #0
        STA SoundThrust
        STA SoundShoot
        STA SoundExplosion
        STA AUDV0
        STA AUDV1
        
        ; Start the game loop
        JMP StartFrame

; ============================================
; MAIN GAME LOOP
; ============================================

StartFrame:
        ; Start vertical sync
        LDA #2
        STA VSYNC
        STA WSYNC
        STA WSYNC
        STA WSYNC
        LDA #0
        STA VSYNC
        
        ; 37 scanlines of VBlank
        LDA #43
        STA TIM64T
        
        ; Update game state during VBlank
        JSR UpdateGame
        
        ; Wait for VBlank to end
WaitVBlank:
        LDA INTIM
        BNE WaitVBlank
        STA WSYNC
        
        ; Now draw the visible frame
        LDA #0
        STA VBLANK
        
        ; Draw 192 visible scanlines
        LDY #192
ScanlineLoop:
        ; Draw each scanline
        JSR DrawScanline
        DEY
        BNE ScanlineLoop
        
        ; End of frame
        LDA #2
        STA VBLANK
        STA WSYNC
        
        ; 30 scanlines of overscan
        LDA #35
        STA TIM64T
        
        ; Update joystick during overscan
        JSR ReadJoystick
        
WaitOverscan:
        LDA INTIM
        BNE WaitOverscan
        STA WSYNC
        
        ; Loop back to start of frame
        JMP StartFrame

; ============================================
; UPDATE GAME STATE (during VBlank)
; ============================================

UpdateGame:
        ; Check game state
        LDA GameState
        CMP #0
        BEQ UpdateTitle
        CMP #1
        BEQ UpdatePlaying
        CMP #2
        BEQ UpdateGameOver
        RTS

UpdateTitle:
        ; Title screen logic
        ; Check for start button
        LDA SWCHB
        AND #$80        ; Check if select or reset pressed
        BNE TitleNoStart
        
        ; Start the game
        LDA #1
        STA GameState
        
        ; Initialize game
        JSR InitGame
        
TitleNoStart:
        RTS

UpdatePlaying:
        ; Update player
        JSR UpdatePlayer
        
        ; Update bullet
        JSR UpdateBullet
        
        ; Update asteroids
        JSR UpdateAsteroids
        
        ; Check collisions
        JSR CheckCollisions
        
        ; Spawn asteroids if needed
        JSR SpawnAsteroids
        
        ; Check if all asteroids are destroyed
        JSR CheckLevelComplete
        
        ; Update invulnerability timer
        LDA PlayerInvuln
        BEQ NoInvulnUpdate
        DEC PlayerInvuln
NoInvulnUpdate:
        
        ; Update bullet timer
        LDA BulletTimer
        BEQ NoBulletTimer
        DEC BulletTimer
NoBulletTimer:
        
        ; Increment frame counter
        INC FrameCounter
        
        ; Update sound
        JSR UpdateSound
        
        RTS

UpdateGameOver:
        ; Game over logic
        ; Check for restart
        LDA SWCHB
        AND #$80
        BNE GameOverNoRestart
        
        ; Restart game
        LDA #0
        STA GameState
        
GameOverNoRestart:
        RTS

; ============================================
; INITIALIZE GAME
; ============================================

InitGame:
        ; Reset lives
        LDA #3
        STA Lives
        
        ; Reset score
        LDA #0
        STA Score
        STA Score+1
        STA Score+2
        
        ; Reset level
        LDA #1
        STA Level
        
        ; Reset player
        LDA #100
        STA PlayerX
        LDA #100
        STA PlayerY
        LDA #0
        STA PlayerAngle
        STA PlayerVelocityX
        STA PlayerVelocityY
        STA PlayerThrust
        
        ; Make player invulnerable for a while
        LDA #120
        STA PlayerInvuln
        
        ; Clear all asteroids
        LDA #0
        STA Asteroid0Active
        STA Asteroid1Active
        STA Asteroid2Active
        STA Asteroid3Active
        
        ; Spawn initial asteroids
        JSR SpawnInitialAsteroids
        
        ; Clear bullet
        LDA #0
        STA BulletActive
        
        RTS

; ============================================
; SPAWN INITIAL ASTEROIDS
; ============================================

SpawnInitialAsteroids:
        ; Spawn 4 asteroids for level 1
        LDA Level
        CMP #1
        BNE SpawnMoreAsteroids
        
        ; Level 1: 4 asteroids
        JSR SpawnRandomAsteroid
        JSR SpawnRandomAsteroid
        JSR SpawnRandomAsteroid
        JSR SpawnRandomAsteroid
        RTS

SpawnMoreAsteroids:
        ; Higher levels: more asteroids
        ; For now, just spawn 4 + level
        LDA Level
        CLC
        ADC #3
        TAX
        
SpawnLoop:
        JSR SpawnRandomAsteroid
        DEX
        BNE SpawnLoop
        RTS

; ============================================
; SPAWN RANDOM ASTEROID
; ============================================

SpawnRandomAsteroid:
        ; Find an inactive asteroid slot
        LDX #0
FindInactiveAsteroid:
        LDA Asteroid0Active,X
        BEQ FoundInactiveSlot
        INX
        CPX #4
        BNE FindInactiveAsteroid
        RTS             ; No inactive slots, return

FoundInactiveSlot:
        ; X contains the asteroid index (0-3)
        ; Set as active
        LDA #1
        STA Asteroid0Active,X
        
        ; Generate random position
        JSR RandomByte
        AND #$7F        ; Limit to 0-127
        CLC
        ADC #16        ; Add margin
        STA Asteroid0X,X
        
        JSR RandomByte
        AND #$7F
        CLC
        ADC #16
        STA Asteroid0Y,X
        
        ; Generate random velocity
        JSR RandomByte
        AND #$0F
        SEC
        SBC #$08        ; -8 to +7
        STA Asteroid0VX,X
        
        JSR RandomByte
        AND #$0F
        SEC
        SBC #$08
        STA Asteroid0VY,X
        
        ; Random size (0-3: small to large)
        JSR RandomByte
        AND #$03
        STA Asteroid0Size,X
        
        ; Random rotation angle
        JSR RandomByte
        STA Asteroid0Angle,X
        
        RTS

; ============================================
; UPDATE PLAYER
; ============================================

UpdatePlayer:
        ; Check joystick input
        LDA Joystick0
        
        ; Check rotation left (bit 4 = left)
        AND #$10
        BEQ NoLeftRotation
        
        ; Rotate left
        DEC PlayerAngle
        JMP CheckRightRotation
        
NoLeftRotation:
        ; Check rotation right (bit 5 = right)
        LDA Joystick0
        AND #$20
        BEQ CheckRightRotation
        
        ; Rotate right
        INC PlayerAngle
        
CheckRightRotation:
        ; Check thrust (bit 6 = up)
        LDA Joystick0
        AND #$40
        BEQ NoThrust
        
        ; Apply thrust
        LDA #1
        STA PlayerThrust
        
        ; Calculate thrust vector based on angle
        ; This is simplified - we'll use a lookup table
        LDA PlayerAngle
        AND #$0F        ; Use only lower 4 bits for simplicity
        TAY
        
        ; Get X component from table
        LDA ThrustXTable,Y
        CLC
        ADC PlayerVelocityX
        STA PlayerVelocityX
        
        ; Get Y component from table
        LDA ThrustYTable,Y
        CLC
        ADC PlayerVelocityY
        STA PlayerVelocityY
        
        ; Limit velocity
        JSR LimitVelocity
        
        JMP UpdatePlayerPosition
        
NoThrust:
        LDA #0
        STA PlayerThrust
        
UpdatePlayerPosition:
        ; Apply friction (slow down over time)
        ; In space, there's no friction, but we'll add a little for gameplay
        LDA PlayerVelocityX
        BEQ NoXFriction
        CMP #0
        BPL PositiveXFriction
        
        ; Negative velocity
        INC PlayerVelocityX
        JMP NoXFriction
        
PositiveXFriction:
        DEC PlayerVelocityX
        
NoXFriction:
        LDA PlayerVelocityY
        BEQ NoYFriction
        CMP #0
        BPL PositiveYFriction
        
        ; Negative velocity
        INC PlayerVelocityY
        JMP NoYFriction
        
PositiveYFriction:
        DEC PlayerVelocityY
        
NoYFriction:
        ; Update position
        LDA PlayerX
        CLC
        ADC PlayerVelocityX
        STA PlayerX
        
        LDA PlayerY
        CLC
        ADC PlayerVelocityY
        STA PlayerY
        
        ; Wrap around screen edges
        LDA PlayerX
        CMP #160
        BCC NoXWrap
        LDA #0
        STA PlayerX
        JMP CheckYWrap
        
NoXWrap:
        CMP #0
        BCS CheckYWrap
        LDA #159
        STA PlayerX
        
CheckYWrap:
        LDA PlayerY
        CMP #192
        BCC NoYWrap
        LDA #0
        STA PlayerY
        RTS
        
NoYWrap:
        CMP #0
        BCS NoWrap
        LDA #191
        STA PlayerY
        
NoWrap:
        RTS

; ============================================
; LIMIT VELOCITY
; ============================================

LimitVelocity:
        LDA PlayerVelocityX
        CMP #4
        BCC CheckXMin
        LDA #4
        STA PlayerVelocityX
CheckXMin:
        CMP #$FB        ; -5
        BCS CheckYMax
        LDA #$FB
        STA PlayerVelocityX
        
CheckYMax:
        LDA PlayerVelocityY
        CMP #4
        BCC CheckYMin
        LDA #4
        STA PlayerVelocityY
CheckYMin:
        CMP #$FB
        BCS DoneLimit
        LDA #$FB
        STA PlayerVelocityY
        
DoneLimit:
        RTS

; ============================================
; THRUST TABLES (simplified)
; ============================================

ThrustXTable:
        .byte 0, 1, 1, 1, 0, -1, -1, -1
        .byte 0, 1, 1, 1, 0, -1, -1, -1

ThrustYTable:
        .byte -1, -1, 0, 1, 1, 1, 0, -1
        .byte -1, -1, 0, 1, 1, 1, 0, -1

; ============================================
; UPDATE BULLET
; ============================================

UpdateBullet:
        LDA BulletActive
        BEQ BulletInactive
        
        ; Update bullet position
        LDA BulletX
        CLC
        ADC BulletVelocityX
        STA BulletX
        
        LDA BulletY
        CLC
        ADC BulletVelocityY
        STA BulletY
        
        ; Check if bullet is out of bounds
        LDA BulletX
        CMP #160
        BCS BulletOutOfBounds
        CMP #0
        BCC BulletOutOfBounds
        
        LDA BulletY
        CMP #192
        BCS BulletOutOfBounds
        CMP #0
        BCC BulletOutOfBounds
        
        ; Update bullet timer
        DEC BulletTimer
        BNE BulletStillActive
        
BulletOutOfBounds:
        ; Deactivate bullet
        LDA #0
        STA BulletActive
        
BulletStillActive:
BulletInactive:
        RTS

; ============================================
; FIRE BULLET
; ============================================

FireBullet:
        ; Check if bullet is already active
        LDA BulletActive
        BNE BulletAlreadyActive
        
        ; Set bullet as active
        LDA #1
        STA BulletActive
        
        ; Set bullet position to player position
        LDA PlayerX
        STA BulletX
        LDA PlayerY
        STA BulletY
        
        ; Set bullet velocity based on player angle
        LDA PlayerAngle
        AND #$0F
        TAY
        
        ; Get bullet velocity from table (faster than thrust)
        LDA BulletXTable,Y
        CLC
        ADC PlayerVelocityX
        STA BulletVelocityX
        
        LDA BulletYTable,Y
        CLC
        ADC PlayerVelocityY
        STA BulletVelocityY
        
        ; Set bullet timer
        LDA #60
        STA BulletTimer
        
        ; Play shoot sound
        LDA #1
        STA SoundShoot
        
BulletAlreadyActive:
        RTS

; ============================================
; BULLET VELOCITY TABLES
; ============================================

BulletXTable:
        .byte 0, 2, 2, 2, 0, -2, -2, -2
        .byte 0, 2, 2, 2, 0, -2, -2, -2

BulletYTable:
        .byte -2, -2, 0, 2, 2, 2, 0, -2
        .byte -2, -2, 0, 2, 2, 2, 0, -2

; ============================================
; UPDATE ASTEROIDS
; ============================================

UpdateAsteroids:
        ; Update asteroid 0
        LDA Asteroid0Active
        BEQ SkipAsteroid0
        JSR UpdateAsteroid0
SkipAsteroid0:
        
        ; Update asteroid 1
        LDA Asteroid1Active
        BEQ SkipAsteroid1
        JSR UpdateAsteroid1
SkipAsteroid1:
        
        ; Update asteroid 2
        LDA Asteroid2Active
        BEQ SkipAsteroid2
        JSR UpdateAsteroid2
SkipAsteroid2:
        
        ; Update asteroid 3
        LDA Asteroid3Active
        BEQ SkipAsteroid3
        JSR UpdateAsteroid3
SkipAsteroid3:
        
        RTS

UpdateAsteroid0:
        LDX #0
        JMP UpdateAsteroidCommon

UpdateAsteroid1:
        LDX #1
        JMP UpdateAsteroidCommon

UpdateAsteroid2:
        LDX #2
        JMP UpdateAsteroidCommon

UpdateAsteroid3:
        LDX #3
        ; Fall through to UpdateAsteroidCommon

UpdateAsteroidCommon:
        ; Update position
        LDA Asteroid0X,X
        CLC
        ADC Asteroid0VX,X
        STA Asteroid0X,X
        
        LDA Asteroid0Y,X
        CLC
        ADC Asteroid0VY,X
        STA Asteroid0Y,X
        
        ; Update rotation angle
        INC Asteroid0Angle,X
        
        ; Wrap around screen edges
        LDA Asteroid0X,X
        CMP #160
        BCC NoAsteroidXWrap
        LDA #0
        STA Asteroid0X,X
        JMP CheckAsteroidYWrap
        
NoAsteroidXWrap:
        CMP #0
        BCS CheckAsteroidYWrap
        LDA #159
        STA Asteroid0X,X
        
CheckAsteroidYWrap:
        LDA Asteroid0Y,X
        CMP #192
        BCC NoAsteroidYWrap
        LDA #0
        STA Asteroid0Y,X
        RTS
        
NoAsteroidYWrap:
        CMP #0
        BCS AsteroidWrapDone
        LDA #191
        STA Asteroid0Y,X
        
AsteroidWrapDone:
        RTS

; ============================================
; SPAWN ASTEROIDS (during gameplay)
; ============================================

SpawnAsteroids:
        ; Spawn a new asteroid every 60 frames
        LDA FrameCounter
        AND #$3F        ; Every 64 frames
        BNE NoSpawn
        
        ; Check if we have space for more asteroids
        LDX #0
CountActiveAsteroids:
        LDA Asteroid0Active,X
        BEQ CheckAsteroidCount
        INX
        CPX #4
        BNE CountActiveAsteroids
        
        ; All asteroids are active, don't spawn
        RTS
        
CheckAsteroidCount:
        ; If we have less than 4 active asteroids, spawn one
        CPX #4
        BNE SpawnNewAsteroid
        RTS
        
SpawnNewAsteroid:
        JSR SpawnRandomAsteroid
NoSpawn:
        RTS

; ============================================
; CHECK COLLISIONS
; ============================================

CheckCollisions:
        ; Check bullet-asteroid collisions
        LDA BulletActive
        BEQ NoBulletCollisions
        
        LDX #0
CheckBulletAsteroidLoop:
        LDA Asteroid0Active,X
        BEQ SkipAsteroidCollision
        
        ; Check collision between bullet and asteroid X
        JSR CheckBulletAsteroidCollision
        BCC SkipAsteroidCollision
        
        ; Collision detected!
        ; Destroy asteroid
        LDA #0
        STA Asteroid0Active,X
        
        ; Deactivate bullet
        LDA #0
        STA BulletActive
        
        ; Play explosion sound
        LDA #1
        STA SoundExplosion
        
        ; Add to score
        LDA Asteroid0Size,X
        CLC
        ADC #1          ; Size 0 (small) = 100, 1 = 50, 2 = 25, 3 = 12
        TAY
        
        ; For now, just add 100 points
        JSR AddPoints100
        
        ; Split asteroid if it's large enough
        LDA Asteroid0Size,X
        CMP #1          ; Only split if size > 0
        BCS SplitAsteroid
        BEQ SplitAsteroid
        RTS
        
SplitAsteroid:
        ; Split into 2 smaller asteroids
        JSR SpawnSplitAsteroid
        JSR SpawnSplitAsteroid
        
SkipAsteroidCollision:
        INX
        CPX #4
        BNE CheckBulletAsteroidLoop
        
NoBulletCollisions:
        ; Check player-asteroid collisions
        LDA PlayerInvuln
        BNE NoPlayerCollisions
        
        LDX #0
CheckPlayerAsteroidLoop:
        LDA Asteroid0Active,X
        BEQ SkipPlayerAsteroidCollision
        
        ; Check collision between player and asteroid X
        JSR CheckPlayerAsteroidCollision
        BCC SkipPlayerAsteroidCollision
        
        ; Collision detected!
        ; Player hit!
        DEC Lives
        
        ; Check if game over
        LDA Lives
        BNE PlayerStillAlive
        
        ; Game over
        LDA #2
        STA GameState
        RTS
        
PlayerStillAlive:
        ; Make player invulnerable
        LDA #120
        STA PlayerInvuln
        
        ; Reset player position
        LDA #100
        STA PlayerX
        LDA #100
        STA PlayerY
        
        ; Clear velocity
        LDA #0
        STA PlayerVelocityX
        STA PlayerVelocityY
        
        ; Play explosion sound
        LDA #1
        STA SoundExplosion
        
        ; Destroy asteroid
        LDA #0
        STA Asteroid0Active,X
        
SkipPlayerAsteroidCollision:
        INX
        CPX #4
        BNE CheckPlayerAsteroidLoop
        
NoPlayerCollisions:
        RTS

; ============================================
; CHECK BULLET-ASTEROID COLLISION
; ============================================

CheckBulletAsteroidCollision:
        ; X contains asteroid index
        ; Check if bullet is close to asteroid
        
        ; Get asteroid X position
        LDA Asteroid0X,X
        SEC
        SBC BulletX
        BCS CheckXDiff
        EOR #$FF
        CLC
        ADC #1
CheckXDiff:
        CMP #16          ; If X difference > 16, no collision
        BCS NoCollision
        
        ; Get asteroid Y position
        LDA Asteroid0Y,X
        SEC
        SBC BulletY
        BCS CheckYDiff
        EOR #$FF
        CLC
        ADC #1
CheckYDiff:
        CMP #16          ; If Y difference > 16, no collision
        BCS NoCollision
        
        ; Collision!
        SEC
        RTS
        
NoCollision:
        CLC
        RTS

; ============================================
; CHECK PLAYER-ASTEROID COLLISION
; ============================================

CheckPlayerAsteroidCollision:
        ; X contains asteroid index
        
        ; Get asteroid X position
        LDA Asteroid0X,X
        SEC
        SBC PlayerX
        BCS CheckPlayerXDiff
        EOR #$FF
        CLC
        ADC #1
CheckPlayerXDiff:
        CMP #20          ; If X difference > 20, no collision
        BCS NoPlayerCollision
        
        ; Get asteroid Y position
        LDA Asteroid0Y,X
        SEC
        SBC PlayerY
        BCS CheckPlayerYDiff
        EOR #$FF
        CLC
        ADC #1
CheckPlayerYDiff:
        CMP #20          ; If Y difference > 20, no collision
        BCS NoPlayerCollision
        
        ; Collision!
        SEC
        RTS
        
NoPlayerCollision:
        CLC
        RTS

; ============================================
; SPAWN SPLIT ASTEROID (after collision)
; ============================================

SpawnSplitAsteroid:
        ; Find an inactive asteroid slot
        LDX #0
FindSplitSlot:
        LDA Asteroid0Active,X
        BEQ FoundSplitSlot
        INX
        CPX #4
        BNE FindSplitSlot
        RTS             ; No slots available

FoundSplitSlot:
        ; Set as active
        LDA #1
        STA Asteroid0Active,X
        
        ; Set position to current asteroid position
        ; (We need to get the position from the asteroid that was hit)
        ; For now, just use a random position
        JSR RandomByte
        AND #$7F
        CLC
        ADC #16
        STA Asteroid0X,X
        
        JSR RandomByte
        AND #$7F
        CLC
        ADC #16
        STA Asteroid0Y,X
        
        ; Set velocity (random direction)
        JSR RandomByte
        AND #$0F
        SEC
        SBC #$08
        STA Asteroid0VX,X
        
        JSR RandomByte
        AND #$0F
        SEC
        SBC #$08
        STA Asteroid0VY,X
        
        ; Set size (smaller than parent)
        LDA #0          ; Small size
        STA Asteroid0Size,X
        
        ; Set random angle
        JSR RandomByte
        STA Asteroid0Angle,X
        
        RTS

; ============================================
; CHECK LEVEL COMPLETE
; ============================================

CheckLevelComplete:
        ; Check if all asteroids are destroyed
        LDX #0
CheckAllAsteroids:
        LDA Asteroid0Active,X
        BNE AsteroidsRemaining
        INX
        CPX #4
        BNE CheckAllAsteroids
        
        ; All asteroids destroyed!
        ; Go to next level
        INC Level
        
        ; Add bonus points
        LDA Level
        TAY
        ; For now, just add 1000 points
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        JSR AddPoints100
        
        ; Spawn new asteroids
        JSR SpawnInitialAsteroids
        
AsteroidsRemaining:
        RTS

; ============================================
; ADD POINTS
; ============================================

AddPoints100:
        ; Add 100 points to score (BCD)
        SED             ; Set decimal mode
        
        LDA Score
        CLC
        ADC #0
        STA Score
        
        LDA Score+1
        ADC #1
        STA Score+1
        
        LDA Score+2
        ADC #0
        STA Score+2
        
        CLD             ; Clear decimal mode
        RTS

; ============================================
; READ JOYSTICK
; ============================================

ReadJoystick:
        ; Read joystick 0
        LDA SWCHA
        STA Joystick0
        
        ; Check for fire button (bit 7 of SWCHA is not used for fire)
        ; Fire button is on INPT4
        LDA INPT4
        AND #$80
        BNE FireNotPressed
        
        ; Fire button pressed
        LDA Joystick0Old
        AND #$80
        BNE FireAlreadyPressed
        
        ; New fire press
        JSR FireBullet
        
FireAlreadyPressed:
        ORA #$80
        STA Joystick0
        
FireNotPressed:
        ; Store old joystick state
        LDA Joystick0
        STA Joystick0Old
        
        RTS

; ============================================
; RANDOM BYTE GENERATOR
; ============================================

RandomByte:
        ; Simple LFSR random number generator
        LDA RandomSeed
        ASL
        BCC NoEOR
        EOR #$1D
NoEOR:
        STA RandomSeed
        RTS

; ============================================
; UPDATE SOUND
; ============================================

UpdateSound:
        ; Update thrust sound
        LDA SoundThrust
        BEQ NoThrustSound
        
        ; Set thrust sound (low frequency noise)
        LDA #$0F        ; Volume
        STA AUDV0
        LDA #$08        ; Frequency (low)
        STA AUDF0
        LDA #$04        ; Noise waveform
        STA AUDC0
        
        JMP CheckShootSound
        
NoThrustSound:
        ; Turn off thrust sound
        LDA #0
        STA AUDV0
        
CheckShootSound:
        LDA SoundShoot
        BEQ NoShootSound
        
        ; Set shoot sound (high frequency square wave)
        LDA #$0F
        STA AUDV1
        LDA #$1E        ; High frequency
        STA AUDF1
        LDA #$08        ; Square wave
        STA AUDC1
        
        ; Clear shoot sound flag
        LDA #0
        STA SoundShoot
        
        JMP CheckExplosionSound
        
NoShootSound:
        ; Turn off shoot sound
        LDA #0
        STA AUDV1
        
CheckExplosionSound:
        LDA SoundExplosion
        BEQ NoExplosionSound
        
        ; Set explosion sound (noise)
        LDA #$0F
        STA AUDV0
        LDA #$10        ; Medium frequency
        STA AUDF0
        LDA #$04        ; Noise
        STA AUDC0
        
        ; Clear explosion sound flag
        LDA #0
        STA SoundExplosion
        
NoExplosionSound:
        RTS

; ============================================
; DRAW SCANLINE
; ============================================

DrawScanline:
        ; This is where we draw each scanline
        ; For simplicity, we'll use a simple approach
        ; In a real game, we'd need to position sprites carefully
        
        ; Set playfield to black
        LDA #0
        STA PF0
        STA PF1
        STA PF2
        STA COLUPF
        
        ; Position player 0 (ship)
        LDA PlayerX
        SEC
        SBC #8          ; Center the sprite
        STA HMP0
        
        ; Position player 1 (bullet)
        LDA BulletX
        SEC
        SBC #4
        STA HMP1
        
        ; Set player graphics
        ; For now, just use simple shapes
        LDA #$FF        ; All pixels on
        STA GRP0
        STA GRP1
        
        ; Set colors based on state
        LDA PlayerInvuln
        BEQ NormalPlayerColor
        
        ; Invulnerable - blink
        LDA FrameCounter
        AND #$0F
        BNE NormalPlayerColor
        LDA #$00        ; Black when blinking
        STA COLUP0
        JMP SetBulletColor
        
NormalPlayerColor:
        LDA #$1A        ; White
        STA COLUP0
        
SetBulletColor:
        LDA #$44        ; Red for bullet
        STA COLUP1
        
        ; Draw asteroids as playfield graphics
        ; This is a simplification - in a real game, we'd need
        ; to carefully position the playfield to create asteroid shapes
        
        ; For now, just draw a simple pattern
        LDA #$FF
        STA PF0
        LDA #$00
        STA PF1
        LDA #$FF
        STA PF2
        
        ; End of scanline
        STA WSYNC
        
        RTS

; ============================================
; INTERRUPT VECTORS
; ============================================

        ORG $FFFA

        .word Reset     ; NMI
        .word Reset     ; RESET
        .word Reset     ; IRQ

; ============================================
; ROM PADDING
; ============================================

        ORG $FFFF
        .byte $FF       ; Padding
