#!/usr/bin/env python3
"""
Friendly test script for TheorIA dataset contributors.

Usage:
    python scripts/test_entry.py [entry_filename.json]
    
If no filename is provided, tests all entries.
"""

import sys
import os
import json
from pathlib import Path

# Add the project root to Python path
ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from scripts.verify_programmatic import run_verifications, entries_dir


def test_single_entry(filename):
    """Test a single entry file."""
    if not filename.endswith('.json'):
        filename += '.json'
    
    entry_path = Path(entries_dir) / filename
    
    if not entry_path.exists():
        print(f"❌ Error: File '{filename}' not found in entries/ directory")
        print(f"📁 Available files:")
        for f in sorted(Path(entries_dir).glob("*.json")):
            print(f"   • {f.name}")
        return False
    
    print(f"🧪 Testing entry: {filename}")
    print("="*50)
    
    # First, check JSON syntax
    try:
        with open(entry_path, 'r') as f:
            data = json.load(f)
        print("✅ JSON syntax is valid")
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON syntax:")
        print(f"   → Error: {e}")
        print(f"   → Tip: Use a JSON validator or formatter to fix syntax issues")
        return False
    
    # Check required fields
    required_fields = [
        'result_id', 'result_name', 'result_equations', 'explanation',
        'definitions', 'assumptions', 'derivation',
        'derivation_explanation', 
        'programmatic_verification', 'domain', 'theory_status',
        'references', 'contributors', 'review_status'
    ]
    
    missing = [field for field in required_fields if field not in data]
    if missing:
        print(f"❌ Missing required fields: {', '.join(missing)}")
        print(f"   → See CONTRIBUTING.md for field descriptions")
        return False
    
    print("✅ All required fields present")
    
    # Check result_id matches filename
    expected_id = entry_path.stem
    if data.get('result_id') != expected_id:
        print(f"❌ result_id mismatch:")
        print(f"   → Filename: {filename} (expects result_id: '{expected_id}')")
        print(f"   → Actual result_id: '{data.get('result_id')}'")
        print(f"   → Fix: Either rename file to '{data.get('result_id')}.json' or change result_id to '{expected_id}'")
        return False
    
    print("✅ result_id matches filename")
    
    # Test programmatic verification
    pv = data.get('programmatic_verification', {})
    if not pv:
        print("⚠️  No programmatic verification - skipping code test")
        return True
    
    print("🔬 Running programmatic verification...")
    
    # Temporarily modify entries_dir to test only this file
    import scripts.verify_programmatic as vp
    original_dir = vp.entries_dir
    temp_dir = entry_path.parent
    
    # Create a temporary directory with only this entry
    import tempfile
    import shutil
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        temp_file = tmpdir_path / filename
        shutil.copy2(entry_path, temp_file)
        
        vp.entries_dir = tmpdir
        try:
            vp.run_verifications()
            return True
        except Exception as e:
            return False
        finally:
            vp.entries_dir = original_dir


def main():
    """Main entry point."""
    print("🧬 TheorIA Dataset Entry Tester")
    print("="*40)
    
    if len(sys.argv) > 1:
        filename = sys.argv[1]
        success = test_single_entry(filename)
        if success:
            print(f"\n🎉 Entry '{filename}' is ready for submission!")
        else:
            print(f"\n❌ Entry '{filename}' needs fixes before submission.")
            sys.exit(1)
    else:
        print("🧪 Testing all entries...")
        print("="*40)
        try:
            run_verifications()
        except Exception:
            sys.exit(1)


if __name__ == "__main__":
    main()