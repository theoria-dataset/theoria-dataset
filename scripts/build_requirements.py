#!/usr/bin/env python3
"""
Build all requirement-dependent files from entry.schema.json

This script runs all necessary generation scripts to update CONTRIBUTING.md,
form requirements, static form HTML, and any other files that depend on the schema.
This can be called as part of the build process or git hooks.
"""

import subprocess
import sys
from pathlib import Path

def run_script(script_path, description):
    """Run a Python script and report success/failure"""
    try:
        result = subprocess.run([sys.executable, str(script_path)], 
                              capture_output=True, text=True, cwd=script_path.parent.parent)
        if result.returncode == 0:
            print(f"[OK] {description}")
            if result.stdout:
                print(f"   {result.stdout.strip()}")
        else:
            print(f"[FAIL] {description}")
            print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"[FAIL] {description}")
        print(f"   Exception: {e}")
        return False
    return True

def main():
    """Run all requirement build scripts"""
    script_dir = Path(__file__).parent
    
    print("Building requirement-dependent files...")
    print()
    
    scripts = [
        (script_dir / "generate_contributing.py", "Generating CONTRIBUTING.md"),
        (script_dir / "generate_form_requirements.py", "Generating form requirements JavaScript"),
        (script_dir / "generate_form.py", "Generating static form HTML")
    ]
    
    success = True
    for script_path, description in scripts:
        if not script_path.exists():
            print(f"[FAIL] {description}")
            print(f"   Script not found: {script_path}")
            success = False
            continue
            
        if not run_script(script_path, description):
            success = False
    
    print()
    if success:
        print("[SUCCESS] All requirement files built successfully!")
        print("   Remember to commit the generated files alongside schemas/entry.schema.json")
    else:
        print("[ERROR] Some builds failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()