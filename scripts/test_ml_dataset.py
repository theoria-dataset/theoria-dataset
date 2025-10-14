#!/usr/bin/env python3
"""
Simple test runner for the ML dataset script

This script can be used in CI/CD or make commands to verify
the ML dataset builder functionality.
"""

import sys
import os
import subprocess

def run_tests():
    """Run the ML dataset tests"""

    # Get the repository root
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_file = os.path.join(repo_root, 'tests', 'test_build_ml_dataset.py')

    if not os.path.exists(test_file):
        print(f"Test file not found: {test_file}")
        return False

    print("Running ML Dataset Script Tests...")
    print("=" * 50)

    try:
        # Run the tests
        result = subprocess.run([
            sys.executable, test_file
        ], cwd=repo_root, capture_output=True, text=True)

        if result.returncode == 0:
            print("All tests passed!")
            print(f"Test output:\n{result.stdout}")
            return True
        else:
            print("Tests failed!")
            print(f"Error output:\n{result.stderr}")
            print(f"Standard output:\n{result.stdout}")
            return False

    except Exception as e:
        print(f"Error running tests: {e}")
        return False

def test_script_functionality():
    """Test basic script functionality with real data"""

    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    script_path = os.path.join(repo_root, 'scripts', 'build_ml_dataset.py')

    if not os.path.exists(script_path):
        print(f"Script not found: {script_path}")
        return False

    print("\nTesting script with real data...")
    print("=" * 50)

    try:
        # Test the script with a dry run (just check it can load data)
        result = subprocess.run([
            sys.executable, script_path, '--output', '/tmp/test_dataset.json'
        ], cwd=repo_root, capture_output=True, text=True)

        if result.returncode == 0:
            print("Script runs successfully with real data!")
            print("Output:")
            print(result.stdout)

            # Clean up test file if it exists
            test_file = '/tmp/test_dataset.json'
            if os.path.exists(test_file):
                os.remove(test_file)
                print("Cleaned up test output file")

            return True
        else:
            print("Script failed with real data!")
            print(f"Error: {result.stderr}")
            print(f"Output: {result.stdout}")
            return False

    except Exception as e:
        print(f"Error testing script: {e}")
        return False

def main():
    """Main test runner"""
    print("TheorIA Dataset - ML Script Test Suite")
    print("=====================================\n")

    success = True

    # Run unit tests
    if not run_tests():
        success = False

    # Test with real data
    if not test_script_functionality():
        success = False

    if success:
        print("\nAll tests passed! The ML dataset script is working correctly.")
        sys.exit(0)
    else:
        print("\nSome tests failed. Please check the output above.")
        sys.exit(1)

if __name__ == '__main__':
    main()