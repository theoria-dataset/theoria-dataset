#!/usr/bin/env python3
"""
Quick test script to verify that the numpy/matplotlib fixes work
"""

import json
import sys

def test_file(filename):
    """Test a single JSON file's programmatic verification"""
    print(f"\nTesting {filename}...")
    
    try:
        with open(f"entries/{filename}", 'r') as f:
            data = json.load(f)
        
        if 'programmatic_verification' not in data:
            print(f"  No programmatic verification in {filename}")
            return True
            
        code_lines = data['programmatic_verification']['code']
        code = '\n'.join(code_lines)
        
        # Check for problematic imports
        if 'import numpy' in code:
            print(f"  ❌ Still contains numpy import")
            return False
        if 'import matplotlib' in code:
            print(f"  ❌ Still contains matplotlib import")
            return False
        if 'np.' in code:
            print(f"  ❌ Still contains numpy usage")
            return False
        if 'plt.' in code:
            print(f"  ❌ Still contains matplotlib usage")
            return False
            
        # Try to execute the code
        try:
            exec(code, {})
            print(f"  ✅ Code execution successful")
            return True
        except Exception as e:
            print(f"  ❌ Code execution failed: {e}")
            return False
            
    except Exception as e:
        print(f"  ❌ Failed to process file: {e}")
        return False

def main():
    # Test a few files that we know were fixed
    test_files = [
        "angular_momentum.json",
        "boltzmann_distribution.json", 
        "bose_einstein_distribution.json",
        "buoyancy_archimedes.json",
        "capacitance.json",
        "compton_scattering.json"
    ]
    
    print("Quick verification of numpy/matplotlib fixes")
    print("=" * 50)
    
    passed = 0
    total = len(test_files)
    
    for filename in test_files:
        if test_file(filename):
            passed += 1
    
    print(f"\n📊 Results: {passed}/{total} files passed")
    
    if passed == total:
        print("🎉 All tested files are working correctly!")
        print("The numpy/matplotlib removal was successful!")
    else:
        print("⚠️  Some files still need fixes")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 