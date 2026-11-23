#!/usr/bin/env python3
"""Slop checks for the Danypsy/Danypsy profile repository.

Run from the repo root (or any cwd): python3 scripts/check.py
Exit 0 if every check passes, 1 otherwise.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FAILURES: list[str] = []

SHORTCUT_COMMENT = re.compile(
    r"(?i)("
    r"for now,?\s+just"
    r"|\bhack\b"
    r"|workaround"
    r"|quick\s+fix"
    r"|temporary\s+fix"
    r"|tmp\s+hack"
    r"|kludge"
    r")"
)

# Comment prefixes we actually inspect (avoid matching "hack" inside code/strings loosely).
COMMENT_LINE = re.compile(
    r"^\s*(?://|#|;|--|/\*|\*|<!--)\s*(.*)$"
)

ASSET_REF = re.compile(
    r"""(?:src|href)\s*=\s*['"]([^'"]+)['"]""",
    re.IGNORECASE,
)

PROJECT_DOC_HEADINGS = re.compile(
    r"(?im)^#{1,3}\s+("
    r"Installation|Architecture|Fonctionnalit[ée]s|Getting Started|"
    r"Usage|Features|How to (?:run|play|install)|"
    r"Guide d'utilisation|D[ée]marrage rapide"
    r")\s*$"
)

FAKE_ASSEMBLER = re.compile(
    r"py65\.disassembler\.dasm|python3?\s+-m\s+py65"
)


def fail(check_id: str, where: str, message: str, how: str) -> None:
    FAILURES.append(
        f"[{check_id}] {where}\n"
        f"  {message}\n"
        f"  How to fix: {how}"
    )


def check_profile_readme() -> None:
    path = ROOT / "README.md"
    if not path.is_file():
        fail(
            "profile-readme",
            "README.md",
            "The profile README is missing.",
            "Restore README.md as the GitHub profile README for @Danypsy, "
            "including the special-repository HTML comment that says this "
            "file appears on the GitHub profile. Project docs belong in a "
            "subfolder README, never at the root.",
        )
        return

    text = path.read_text(encoding="utf-8")
    if "@Danypsy" not in text:
        fail(
            "profile-readme",
            "README.md",
            "The root README no longer identifies the GitHub profile (@Danypsy).",
            "This repository is Danypsy/Danypsy: its README appears on "
            "https://github.com/Danypsy. Keep the profile intro that mentions "
            "@Danypsy. Do not replace this file with a project README. Put "
            "project documentation in a subfolder (for example "
            "asteroids_vcs2600/README.md).",
        )
    if "appears on your GitHub profile" not in text and "appears on your GitHub profile" not in text.replace("`", ""):
        fail(
            "profile-readme",
            "README.md",
            "The special-repository HTML comment is missing.",
            "Keep the HTML comment that states Danypsy/Danypsy is a special "
            "repository because README.md appears on the GitHub profile. "
            "Agents must not delete or replace that comment when adding work.",
        )
    if PROJECT_DOC_HEADINGS.search(text):
        fail(
            "profile-readme",
            "README.md",
            "The profile README contains project-documentation headings "
            "(Installation, Architecture, Features, Usage, …).",
            "Leave the root README as a short profile page. Move installation, "
            "architecture and feature docs into a subfolder README. Adding a "
            "project section here overwrites Dany's public GitHub profile.",
        )


def check_allowed_toplevel() -> None:
    allow_path = ROOT / "scripts" / "allowed-top-level.txt"
    if not allow_path.is_file():
        fail(
            "allowed-top-level",
            "scripts/allowed-top-level.txt",
            "The allow-list file is missing.",
            "Restore scripts/allowed-top-level.txt with the approved root "
            "entries. This repo is a GitHub profile: new top-level projects "
            "need Dany's explicit approval and an allow-list update.",
        )
        return

    allowed = set()
    for line in allow_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        allowed.add(line)

    unexpected = []
    for entry in sorted(ROOT.iterdir()):
        name = entry.name
        if name == ".git" or name.startswith("."):
            continue
        if name not in allowed:
            unexpected.append(name)

    if unexpected:
        fail(
            "allowed-top-level",
            ", ".join(unexpected),
            "New top-level project(s) were added to the GitHub profile repository: "
            + ", ".join(unexpected) + ".",
            "Do not drop a new app, game or skill at the repository root. "
            "Create a separate GitHub repository for that work, or ask Dany "
            "to approve the directory and add its name to "
            "scripts/allowed-top-level.txt. Agents copy this pattern: a new "
            "folder here will be copied by the next agent.",
        )


def check_empty_artifacts() -> None:
    skip_names = {".gitkeep", ".keep"}
    skip_dirs = {".git"}
    for path in ROOT.rglob("*"):
        if any(part in skip_dirs for part in path.parts):
            continue
        if not path.is_file():
            continue
        if path.name in skip_names:
            continue
        if path.stat().st_size == 0:
            fail(
                "empty-artifact",
                str(path.relative_to(ROOT)),
                "A tracked (or working-tree) file is empty (0 bytes).",
                "Do not commit placeholder binaries or empty stubs. For the "
                "Atari ROM, assemble a real file with DASM "
                "(`dasm asteroids.asm -f3 -oasteroids.bin`) or remove the "
                "empty file and ignore `*.bin` so the next agent cannot copy "
                "a 0-byte ROM advertised as a 4K build.",
            )


def iter_source_files():
    suffixes = {".js", ".ts", ".tsx", ".py", ".asm", ".sh", ".bat", ".css", ".html", ".mak", ""}
    skip_dirs = {".git", "node_modules", "__pycache__", "dist", "build"}
    for path in ROOT.rglob("*"):
        if any(part in skip_dirs for part in path.parts):
            continue
        if not path.is_file():
            continue
        if path.resolve() == Path(__file__).resolve():
            continue
        if path.suffix.lower() in {".js", ".ts", ".tsx", ".py", ".asm", ".sh", ".bat", ".css", ".html"}:
            yield path
        elif path.name in {"Makefile", "makefile"}:
            yield path


def check_shortcut_comments() -> None:
    for path in iter_source_files():
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except UnicodeDecodeError:
            continue
        rel = str(path.relative_to(ROOT))
        for i, line in enumerate(lines, start=1):
            m = COMMENT_LINE.match(line)
            if not m:
                # Also catch end-of-line comments:  LDA #0  ; For now, just ...
                comment = None
                if ";" in line and not line.lstrip().startswith(";"):
                    comment = line.split(";", 1)[1]
                else:
                    pos = 0
                    while True:
                        found = line.find("//", pos)
                        if found == -1:
                            break
                        # Skip URL schemes such as https://
                        if found > 0 and line[found - 1] == ":":
                            pos = found + 2
                            continue
                        comment = line[found + 2:]
                        break
                if comment is None:
                    continue
            else:
                comment = m.group(1)
            if SHORTCUT_COMMENT.search(comment):
                fail(
                    "shortcut-comment",
                    f"{rel}:{i}",
                    f"A comment justifies a shortcut: {line.strip()}",
                    "Implement the intended behavior (for example: score by "
                    "asteroid size, spawn a split asteroid at the parent's "
                    "position) or delete the unfinished path. Do not leave a "
                    "comment that tells the next agent to copy the shortcut. "
                    "If the simple behavior is the real design, drop the "
                    "'for now' / 'hack' wording; the check, not a comment, "
                    "is how we explain the rule.",
                )


def check_missing_assets() -> None:
    for html in ROOT.rglob("*.html"):
        if ".git" in html.parts:
            continue
        text = html.read_text(encoding="utf-8")
        rel = str(html.relative_to(ROOT))
        for ref in ASSET_REF.findall(text):
            if ref.startswith(("http://", "https://", "data:", "mailto:", "javascript:")):
                continue
            if ref.startswith("#"):
                continue
            # Strip query/hash
            clean = ref.split("?")[0].split("#")[0]
            if not clean:
                continue
            target = (html.parent / clean).resolve()
            try:
                target.relative_to(ROOT)
            except ValueError:
                continue
            if not target.is_file():
                fail(
                    "missing-asset",
                    f"{rel} -> {ref}",
                    f"HTML references a local asset that does not exist: {ref}.",
                    "Either add the real file, or remove the tag. The web "
                    "Asteroids game already generates 8-bit sounds with the "
                    "Web Audio API in js/audio.js; do not leave <audio src> "
                    "tags that 404 and get copied into the next game.",
                )


def check_build_config() -> None:
    build_files = [
        ROOT / "asteroids_2600_asm" / "build.sh",
        ROOT / "asteroids_2600_asm" / "build.bat",
        ROOT / "asteroids_2600_asm" / "Makefile",
    ]
    for path in build_files:
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        rel = str(path.relative_to(ROOT))
        if FAKE_ASSEMBLER.search(text):
            fail(
                "build-config",
                rel,
                "The build script falls back to py65 as if it could assemble DASM source.",
                "py65 is a 6502 emulator, not a DASM-compatible assembler. "
                "Keep a single real assembler path (DASM: "
                "`dasm asteroids.asm -f3 -oasteroids.bin`) and fail clearly "
                "if DASM is missing. Do not invent fallbacks the next agent "
                "will copy.",
            )
        if re.search(r"\(4K\)|\(4\s*[Kk][oO]?\)", text) and "stat" not in text and "wc" not in text and "ls -l" not in text:
            # Claiming 4K without measuring the output.
            fail(
                "build-config",
                rel,
                "The build script claims the ROM is 4K without checking the output size.",
                "Print the real file size after a successful DASM run, or say "
                "only that the Atari 2600 cartridge limit is 4K. Do not echo "
                "'File: asteroids.bin (4K)' for a missing or empty file.",
            )

    dasm_cfg = ROOT / "asteroids_2600_asm" / "dasm.cfg"
    if dasm_cfg.is_file():
        referred = False
        for path in build_files:
            if path.is_file() and "dasm.cfg" in path.read_text(encoding="utf-8"):
                referred = True
                break
        if not referred:
            fail(
                "build-config",
                "asteroids_2600_asm/dasm.cfg",
                "dasm.cfg is not used by Makefile, build.sh or build.bat, and "
                "is not a format DASM reads (DASM is driven by CLI flags).",
                "Delete this unused config, or replace it with the real DASM "
                "invocation already documented: "
                "`dasm asteroids.asm -f3 -oasteroids.bin`. Dead config is "
                "copied by agents into the next project.",
            )


def check_score_test() -> None:
    test = ROOT / "tests" / "test_points.js"
    if not test.is_file():
        fail(
            "score-finite",
            "tests/test_points.js",
            "The scoring test is missing.",
            "Restore tests/test_points.js and run it with `node tests/test_points.js`. "
            "It guards the destroyAsteroid score so the HUD cannot show Infinity.",
        )
        return
    import subprocess
    proc = subprocess.run(
        ["node", str(test)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        detail = (proc.stdout + proc.stderr).strip() or "node tests/test_points.js failed"
        fail(
            "score-finite",
            "tests/test_points.js",
            detail,
            "Keep asteroid scoring finite: use AsteroidsUtils.pointsForAsteroidSize "
            "and never divide by splitCount (it starts at 0).",
        )


def main() -> int:
    check_profile_readme()
    check_allowed_toplevel()
    check_empty_artifacts()
    check_shortcut_comments()
    check_missing_assets()
    check_build_config()
    check_score_test()

    if FAILURES:
        print(f"check.py: {len(FAILURES)} failure(s)\n")
        for i, item in enumerate(FAILURES, start=1):
            print(f"{i}. {item}\n")
        return 1

    print("check.py: all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
