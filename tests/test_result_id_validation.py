import json
import os
from pathlib import Path
import pytest

# Get the project root directory
ROOT = Path(__file__).resolve().parents[1]
ENTRIES_DIR = ROOT / "entries"


def test_result_id_matches_filename():
    """Test that result_id field matches the filename (without .json extension) for all entries."""
    if not ENTRIES_DIR.exists():
        pytest.skip(f"Entries directory not found: {ENTRIES_DIR}")
    
    entry_files = list(ENTRIES_DIR.glob("*.json"))
    if not entry_files:
        pytest.skip("No entry files found")
    
    errors = []
    
    for entry_file in entry_files:
        expected_result_id = entry_file.stem  # filename without extension
        
        try:
            with open(entry_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError, OSError) as e:
            errors.append(f"{entry_file.name}: Failed to read file - {e}")
            continue
        
        if "result_id" not in data:
            errors.append(f"{entry_file.name}: Missing 'result_id' field")
            continue
        
        actual_result_id = data["result_id"]
        
        if actual_result_id != expected_result_id:
            errors.append(
                f"{entry_file.name}: result_id mismatch - "
                f"expected '{expected_result_id}', got '{actual_result_id}'"
            )
    
    if errors:
        error_message = "\n".join(errors)
        pytest.fail(f"Result ID validation failed:\n{error_message}")


def test_cross_references_use_result_ids():
    """Test that cross-references use result_ids instead of filenames."""
    if not ENTRIES_DIR.exists():
        pytest.skip(f"Entries directory not found: {ENTRIES_DIR}")
    
    entry_files = list(ENTRIES_DIR.glob("*.json"))
    if not entry_files:
        pytest.skip("No entry files found")
    
    errors = []
    
    for entry_file in entry_files:
        try:
            with open(entry_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError, OSError) as e:
            errors.append(f"{entry_file.name}: Failed to read file - {e}")
            continue
        
        # Check dependencies field
        if "dependencies" in data and data["dependencies"]:
            for dep in data["dependencies"]:
                if dep.endswith(".json"):
                    errors.append(
                        f"{entry_file.name}: dependency '{dep}' should not include .json extension"
                    )
        
        # Check superseded_by field
        if "superseded_by" in data and data["superseded_by"]:
            for sup in data["superseded_by"]:
                if sup.endswith(".json"):
                    errors.append(
                        f"{entry_file.name}: superseded_by '{sup}' should not include .json extension"
                    )
        
        # Check approximation_of field
        if "approximation_of" in data and data["approximation_of"]:
            if data["approximation_of"].endswith(".json"):
                errors.append(
                    f"{entry_file.name}: approximation_of '{data['approximation_of']}' "
                    "should not include .json extension"
                )
    
    if errors:
        error_message = "\n".join(errors)
        pytest.fail(f"Cross-reference validation failed:\n{error_message}")