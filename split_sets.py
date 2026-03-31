#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════╗
║   EnglishJibi — Set Splitter                 ║
║   Browse directories and select set.json     ║
║   Split into set1.json, set2.json, …         ║
╠══════════════════════════════════════════════╣
║  Install deps (once):                        ║
║    pip install questionary colorama          ║
║  Run:                                        ║
║    python split_sets.py                      ║
╚══════════════════════════════════════════════╝
"""

import os
import sys
import json
import re

try:
    import questionary
    from questionary import Style as QStyle, Choice
    import colorama
    from colorama import Fore, Style
    colorama.init(autoreset=True)
except ImportError:
    print("\n  Missing dependencies. Run:\n")
    print("    pip install questionary colorama\n")
    sys.exit(1)

# ── Style ─────────────────────────────────────────────────────────────────────

Q_STYLE = QStyle([
    ("qmark",       "fg:#f59e0b bold"),
    ("question",    "fg:#f1f5f9 bold"),
    ("answer",      "fg:#34d399 bold"),
    ("pointer",     "fg:#f59e0b bold"),
    ("highlighted", "fg:#f59e0b bold"),
    ("selected",    "fg:#34d399"),
    ("instruction", "fg:#64748b"),
    ("text",        "fg:#e2e8f0"),
    ("disabled",    "fg:#475569 italic"),
])

W = 52

# ── Print helpers ─────────────────────────────────────────────────────────────

def banner():
    print(f"\n{Fore.YELLOW}{'═' * W}")
    print(f"  EnglishJibi  ·  Set Splitter")
    print(f"{'═' * W}{Style.RESET_ALL}\n")

def rule(title=""):
    bar = f"─ {title} " + "─" * (W - len(title) - 3) if title else "─" * W
    print(f"\n{Fore.YELLOW}{bar}{Style.RESET_ALL}\n")

def ok(msg):   print(f"  {Fore.GREEN}✓{Style.RESET_ALL}  {msg}")
def info(msg): print(f"  {Fore.CYAN}→{Style.RESET_ALL}  {msg}")
def warn(msg): print(f"  {Fore.YELLOW}⚠{Style.RESET_ALL}  {msg}")
def err(msg):  print(f"  {Fore.RED}✗{Style.RESET_ALL}  {msg}")
def dim(msg):  print(f"  {Fore.WHITE}{Style.DIM}{msg}{Style.RESET_ALL}")

def abort(msg="Aborted."):
    print(f"\n  {Fore.RED}{msg}{Style.RESET_ALL}\n")
    sys.exit(0)

# ── Helpers ───────────────────────────────────────────────────────────────────

def ask_select(prompt, choices):
    val = questionary.select(prompt, choices=choices, style=Q_STYLE).ask()
    if val is None:
        abort()
    return val

def ask_int(prompt, default="25"):
    while True:
        raw = questionary.text(prompt, default=str(default), style=Q_STYLE).ask()
        if raw is None:
            abort()
        raw = raw.strip()
        if raw.isdigit() and int(raw) > 0:
            return int(raw)
        err("Enter a positive integer.")

def ask_confirm(prompt, default=True):
    val = questionary.confirm(prompt, default=default, style=Q_STYLE).ask()
    if val is None:
        abort()
    return val

# ── Config.js patcher ─────────────────────────────────────────────────────────

def patch_config_sets(config_path, new_sets):
    """Updates the `sets: N` line in config.js without touching anything else."""
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            content = f.read()
        patched = re.sub(r'(\bsets\s*:\s*)\d+', rf'\g<1>{new_sets}', content)
        if patched != content:
            with open(config_path, "w", encoding="utf-8") as f:
                f.write(patched)
            ok(f"config.js  →  sets updated to {new_sets}")
        else:
            warn("config.js  →  `sets` field not found; update it manually")
    except Exception as e:
        warn(f"Could not patch config.js: {e}")

# ── Directory Browser ────────────────────────────────────────────────────────

def browse_for_set_json(start_dir="data"):
    """Interactive directory browser to find and select set.json file (only from data folder)."""
    # Ensure we start from data directory
    if not os.path.exists(start_dir):
        err(f"'data' directory not found at: {os.path.abspath(start_dir)}")
        sys.exit(1)
    
    current_dir = os.path.abspath(start_dir)
    
    while True:
        # Get all subdirectories and files in current directory
        try:
            items = os.listdir(current_dir)
        except PermissionError:
            err(f"Permission denied: {current_dir}")
            current_dir = os.path.dirname(current_dir)
            continue
        
        dirs = []
        set_json_files = []
        
        for item in sorted(items):
            full_path = os.path.join(current_dir, item)
            if os.path.isdir(full_path):
                dirs.append(item)
            elif item.lower() == "set.json":
                set_json_files.append(item)
        
        # Build choices menu
        choices = []
        
        # Add parent directory option
        if os.path.dirname(current_dir) != current_dir:
            choices.append(Choice("📁 .. (Parent Directory)", value=".."))
        
        # Add set.json files if found
        for sj in set_json_files:
            choices.append(Choice(f"✅ {sj} (Select this file)", value=f"SELECT:{sj}"))
        
        # Add subdirectories
        for d in dirs:
            choices.append(Choice(f"📂 {d}", value=f"DIR:{d}"))
        
        if not choices:
            err("No accessible directories or files found here.")
            return None
        
        # Show current location and prompt
        rule(f"📍 {current_dir}")
        
        selection = ask_select(
            "Navigate to find set.json or select it:",
            choices=choices
        )
        
        # Handle selection
        if selection == "..":
            current_dir = os.path.dirname(current_dir)
        elif selection.startswith("SELECT:"):
            filename = selection.replace("SELECT:", "")
            return os.path.join(current_dir, filename)
        elif selection.startswith("DIR:"):
            dirname = selection.replace("DIR:", "")
            current_dir = os.path.join(current_dir, dirname)
        else:
            return None

# ── Write setN.json files ─────────────────────────────────────────────────────

def write_set_file(path, questions):
    with open(path, "w", encoding="utf-8") as f:
        f.write("[\n")
        for idx, q in enumerate(questions):
            line = json.dumps(q, ensure_ascii=False, separators=(',', ':'))
            f.write(f"  {line}")
            f.write(",\n" if idx < len(questions) - 1 else "\n")
        f.write("]")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    banner()

    # ── STEP 1: Browse and Select set.json ───────────────────────────────────
    rule("STEP 1  Browse and Select set.json")
    
    info("Scanning 'data' directory for set.json files")
    print()
    
    master_path = browse_for_set_json("data")
    
    if not master_path or not os.path.exists(master_path):
        err("No set.json file selected or file does not exist.")
        sys.exit(1)
    
    folder = os.path.dirname(master_path)
    config_path = os.path.join(folder, "config.js")

    print()
    info(f"Reading  {master_path}")

    try:
        with open(master_path, "r", encoding="utf-8") as f:
            questions = json.load(f)
    except json.JSONDecodeError as e:
        err(f"set.json has invalid JSON: {e}")
        sys.exit(1)

    total_q = len(questions)

    if total_q == 0:
        err("set.json is empty. Add questions first.")
        sys.exit(1)

    info(f"Total questions found:  {Fore.YELLOW}{total_q}{Style.RESET_ALL}")

    # ── STEP 2: Questions per set ─────────────────────────────────────────────
    rule("STEP 2  Split Configuration")

    qps        = ask_int("Questions per set", default=25) # type: ignore
    total_sets = (total_q + qps - 1) // qps   # ceiling division
    last_set_q = total_q - (total_sets - 1) * qps

    print()
    info(
        f"Will create  {Fore.YELLOW}{total_sets} set(s){Style.RESET_ALL}  "
        f"({qps} questions each"
        + (f", last set has {last_set_q}" if last_set_q != qps else "")
        + ")"
    )
    info(f"Files :  set1.json  →  set{total_sets}.json")
    info(f"Folder:  {folder}/")

    # Warn about existing files to be overwritten
    existing = [
        f"set{i+1}.json"
        for i in range(total_sets)
        if os.path.exists(os.path.join(folder, f"set{i+1}.json"))
    ]
    if existing:
        print()
        warn(f"{len(existing)} existing file(s) will be overwritten:")
        for name in existing[:5]:
            dim(f"  {folder}/{name}")
        if len(existing) > 5:
            dim(f"  … and {len(existing) - 5} more")

    print()
    if not ask_confirm("Proceed with split?"):
        abort("Cancelled. Nothing was written.")

    # ── STEP 3: Write ─────────────────────────────────────────────────────────
    rule("STEP 3  Writing Files")

    for i in range(total_sets):
        subset    = questions[i * qps : (i + 1) * qps]
        file_path = os.path.join(folder, f"set{i+1}.json")
        write_set_file(file_path, subset)
        ok(f"set{i+1}.json  ({len(subset)} questions)")

    # Auto-patch config.js sets count
    print()
    if os.path.isfile(config_path):
        patch_config_sets(config_path, total_sets)
    else:
        warn("config.js not found — remember to update `sets` manually")

    # ── Done ──────────────────────────────────────────────────────────────────
    print(f"\n{Fore.GREEN}{'═' * W}")
    print(f"  ✅  Done!  {total_sets} set(s) written to  {folder}/")
    print(f"{'═' * W}{Style.RESET_ALL}\n")

# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n  {Fore.YELLOW}Interrupted.{Style.RESET_ALL}\n")
        sys.exit(0)
