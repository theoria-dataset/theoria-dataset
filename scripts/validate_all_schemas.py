#!/usr/bin/env python3
"""
Validate all entries against JSON schemas.
"""

import json
import sys
from pathlib import Path

# Get project root
ROOT = Path(__file__).resolve().parents[1]

# Import validation logic from validate_schema.py
sys.path.append(str(ROOT / 'scripts'))
from validate_schema import validate_entry_schema


def main():
    """Validate all entries in the entries directory."""
    entries_dir = ROOT / 'entries'
    
    if not entries_dir.exists():
        print(f"[ERROR] Entries directory not found: {entries_dir}")
        sys.exit(1)
    
    # Find all JSON files
    json_files = list(entries_dir.glob('*.json'))
    if not json_files:
        print(f"[ERROR] No JSON files found in {entries_dir}")
        sys.exit(1)
    
    print(f"Schema validation for {len(json_files)} entries")
    print("=" * 60)
    
    passed = 0
    failed = 0
    total_errors = 0
    
    for entry_path in sorted(json_files):
        print(f"Validating {entry_path.name}...")
        
        is_valid, errors = validate_entry_schema(entry_path)
        
        if is_valid:
            print(f"  [OK] Schema validation passed")
            passed += 1
        else:
            print(f"  [ERROR] Schema validation failed ({len(errors)} issues):")
            for error in errors:
                if error.startswith('[ERROR]'):
                    print(f"    {error}")
                elif error.startswith('[WARNING]'):
                    print(f"    {error}")
                else:
                    print(f"      {error}")
            failed += 1
            total_errors += len(errors)
    
    print("\n" + "=" * 60)
    print("Schema Validation Summary:")
    print(f"  Passed: {passed} entries")
    print(f"  Failed: {failed} entries")
    print(f"  Total:  {len(json_files)} entries")
    
    if failed > 0:
        print(f"  Errors: {total_errors} total issues")
        print(f"\n[ERROR] Schema validation failed for {failed} entries")
        print("Please fix the issues above before proceeding.")
        sys.exit(1)
    else:
        print(f"\n[SUCCESS] All entries passed schema validation!")


if __name__ == "__main__":
    main()