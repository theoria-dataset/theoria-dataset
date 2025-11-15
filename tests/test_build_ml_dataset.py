#!/usr/bin/env python3
"""
Tests for the build_ml_dataset.py script

This test suite verifies:
1. Global assumptions loading and resolution
2. Entry processing and filtering
3. Dataset structure and integrity
4. Edge cases and error handling
"""

import unittest
import json
import tempfile
import os
import sys
from pathlib import Path

# Add scripts directory to path so we can import the module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

try:
    from build_ml_dataset import (
        load_global_assumptions,
        resolve_assumption,
        process_entry,
        load_entries,
        build_dataset,
        load_version
    )
except ImportError as e:
    print(f"Could not import build_ml_dataset module: {e}")
    sys.exit(1)

class TestBuildMLDataset(unittest.TestCase):

    def setUp(self):
        """Set up test data"""
        self.test_dir = tempfile.mkdtemp()

        # Sample global assumptions
        self.sample_assumptions = {
            "assumptions": [
                {
                    "id": "classical_mechanics_framework",
                    "text": "Classical mechanics framework: relativistic effects negligible",
                    "type": "simplification",
                    "mathematical_expressions": ["v << c"],
                    "symbol_definitions": [
                        {"symbol": "v", "definition": "Characteristic velocity"},
                        {"symbol": "c", "definition": "Speed of light"}
                    ]
                },
                {
                    "id": "inertial_reference_frame",
                    "text": "Observer is in an inertial reference frame",
                    "type": "fundamental",
                    "mathematical_expressions": [],
                    "symbol_definitions": []
                }
            ]
        }

        # Sample entry data
        self.sample_entry_reviewed = {
            "result_id": "test_entry_1",
            "result_name": "Test Physics Law",
            "review_status": "reviewed",
            "assumptions": ["classical_mechanics_framework", "Custom assumption text"],
            "result_equations": [{"id": "eq1", "equation": "F = ma"}],
            "explanation": "Test explanation"
        }

        self.sample_entry_draft = {
            "result_id": "test_entry_2",
            "result_name": "Draft Physics Law",
            "review_status": "draft",
            "assumptions": ["inertial_reference_frame"],
            "result_equations": [{"id": "eq2", "equation": "E = mc^2"}],
            "explanation": "Draft explanation"
        }

        # Create test files
        self.assumptions_file = os.path.join(self.test_dir, "assumptions.json")
        with open(self.assumptions_file, 'w') as f:
            json.dump(self.sample_assumptions, f)

        self.entries_dir = os.path.join(self.test_dir, "entries")
        os.makedirs(self.entries_dir)

        with open(os.path.join(self.entries_dir, "test_entry_1.json"), 'w') as f:
            json.dump(self.sample_entry_reviewed, f)

        with open(os.path.join(self.entries_dir, "test_entry_2.json"), 'w') as f:
            json.dump(self.sample_entry_draft, f)

    def tearDown(self):
        """Clean up test files"""
        import shutil
        shutil.rmtree(self.test_dir)

    def test_load_global_assumptions(self):
        """Test loading global assumptions from JSON file"""
        assumptions = load_global_assumptions(self.assumptions_file)

        self.assertEqual(len(assumptions), 2)
        self.assertIn("classical_mechanics_framework", assumptions)
        self.assertIn("inertial_reference_frame", assumptions)

        # Check structure
        assumption = assumptions["classical_mechanics_framework"]
        self.assertEqual(assumption["type"], "simplification")
        self.assertEqual(len(assumption["mathematical_expressions"]), 1)
        self.assertEqual(len(assumption["symbol_definitions"]), 2)

    def test_load_global_assumptions_missing_file(self):
        """Test handling of missing assumptions file"""
        assumptions = load_global_assumptions("nonexistent_file.json")
        self.assertEqual(assumptions, {})

    def test_resolve_assumption_global(self):
        """Test resolving global assumption IDs"""
        assumptions = load_global_assumptions(self.assumptions_file)

        resolved = resolve_assumption("classical_mechanics_framework", assumptions)

        self.assertEqual(resolved["type"], "global")
        self.assertEqual(resolved["id"], "classical_mechanics_framework")
        self.assertEqual(resolved["assumption_type"], "simplification")
        self.assertIn("v << c", resolved["mathematical_expressions"])
        self.assertEqual(len(resolved["symbol_definitions"]), 2)

    def test_resolve_assumption_direct_text(self):
        """Test resolving direct text assumptions"""
        assumptions = load_global_assumptions(self.assumptions_file)

        resolved = resolve_assumption("Custom assumption text", assumptions)

        self.assertEqual(resolved["type"], "direct")
        self.assertEqual(resolved["text"], "Custom assumption text")
        self.assertEqual(resolved["assumption_type"], "unspecified")

    def test_resolve_assumption_nonexistent_id(self):
        """Test resolving nonexistent assumption ID (should treat as direct text)"""
        assumptions = load_global_assumptions(self.assumptions_file)

        resolved = resolve_assumption("nonexistent_id", assumptions)

        self.assertEqual(resolved["type"], "direct")
        self.assertEqual(resolved["text"], "nonexistent_id")

    def test_process_entry_with_assumptions(self):
        """Test processing entry with mixed assumptions"""
        assumptions = load_global_assumptions(self.assumptions_file)

        processed = process_entry(self.sample_entry_reviewed, assumptions)

        self.assertEqual(len(processed["assumptions"]), 2)

        # First assumption should be resolved from global
        first_assumption = processed["assumptions"][0]
        self.assertEqual(first_assumption["type"], "global")
        self.assertEqual(first_assumption["id"], "classical_mechanics_framework")

        # Second assumption should be direct text
        second_assumption = processed["assumptions"][1]
        self.assertEqual(second_assumption["type"], "direct")
        self.assertEqual(second_assumption["text"], "Custom assumption text")

    def test_process_entry_no_assumptions(self):
        """Test processing entry without assumptions"""
        assumptions = load_global_assumptions(self.assumptions_file)
        entry_no_assumptions = {
            "result_id": "test_no_assumptions",
            "result_name": "Test Entry",
            "review_status": "reviewed"
        }

        processed = process_entry(entry_no_assumptions, assumptions)

        # Should not have assumptions field or should be empty
        self.assertNotIn("assumptions", processed)

    def test_load_entries_exclude_drafts(self):
        """Test loading entries excluding drafts"""
        entries_pattern = os.path.join(self.entries_dir, "*.json")
        entries = load_entries(entries_pattern, include_drafts=False)

        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["result_id"], "test_entry_1")
        self.assertEqual(entries[0]["review_status"], "reviewed")

    def test_load_entries_include_drafts(self):
        """Test loading entries including drafts"""
        entries_pattern = os.path.join(self.entries_dir, "*.json")
        entries = load_entries(entries_pattern, include_drafts=True)

        self.assertEqual(len(entries), 2)
        entry_ids = [entry["result_id"] for entry in entries]
        self.assertIn("test_entry_1", entry_ids)
        self.assertIn("test_entry_2", entry_ids)

    def test_build_dataset_structure(self):
        """Test the complete dataset building process"""
        # Change to test directory temporarily
        original_cwd = os.getcwd()
        os.chdir(self.test_dir)

        try:
            # Create a globals directory structure
            os.makedirs("globals", exist_ok=True)
            with open("globals/assumptions.json", 'w') as f:
                json.dump(self.sample_assumptions, f)

            output_file = "test_output.json"
            dataset = build_dataset(include_drafts=False, output_file=output_file)

            # Check dataset structure
            self.assertIn("dataset_info", dataset)
            self.assertIn("global_assumptions", dataset)
            self.assertIn("entries", dataset)

            # Check dataset info
            info = dataset["dataset_info"]
            self.assertEqual(info["name"], "TheorIA Dataset")
            # Version should be loaded from manifest.json
            self.assertIsInstance(info["version"], str)
            self.assertTrue(len(info["version"]) > 0)
            self.assertEqual(info["total_entries"], 1)  # Only reviewed entry
            self.assertEqual(info["includes_drafts"], False)
            self.assertEqual(info["global_assumptions_count"], 2)

            # Check global assumptions
            self.assertEqual(len(dataset["global_assumptions"]), 2)

            # Check entries
            self.assertEqual(len(dataset["entries"]), 1)
            entry = dataset["entries"][0]
            self.assertEqual(entry["result_id"], "test_entry_1")

            # Check resolved assumptions
            self.assertEqual(len(entry["assumptions"]), 2)
            self.assertEqual(entry["assumptions"][0]["type"], "global")
            self.assertEqual(entry["assumptions"][1]["type"], "direct")

            # Check output file was created
            self.assertTrue(os.path.exists(output_file))

            # Clean up
            os.remove(output_file)

        finally:
            os.chdir(original_cwd)

    def test_build_dataset_include_drafts(self):
        """Test building dataset with drafts included"""
        original_cwd = os.getcwd()
        os.chdir(self.test_dir)

        try:
            # Create globals directory structure
            os.makedirs("globals", exist_ok=True)
            with open("globals/assumptions.json", 'w') as f:
                json.dump(self.sample_assumptions, f)

            output_file = "test_output_drafts.json"
            dataset = build_dataset(include_drafts=True, output_file=output_file)

            # Should include both entries
            self.assertEqual(dataset["dataset_info"]["total_entries"], 2)
            self.assertEqual(dataset["dataset_info"]["includes_drafts"], True)
            self.assertEqual(len(dataset["entries"]), 2)

            # Clean up
            os.remove(output_file)

        finally:
            os.chdir(original_cwd)

    def test_invalid_json_handling(self):
        """Test handling of invalid JSON files"""
        # Create invalid JSON file
        invalid_file = os.path.join(self.entries_dir, "invalid.json")
        with open(invalid_file, 'w') as f:
            f.write("{ invalid json content")

        entries_pattern = os.path.join(self.entries_dir, "*.json")
        entries = load_entries(entries_pattern, include_drafts=True)

        # Should still load valid entries, skip invalid ones
        self.assertEqual(len(entries), 2)  # Should still get the 2 valid entries

    def test_assumption_pattern_matching(self):
        """Test assumption ID pattern matching"""
        assumptions = load_global_assumptions(self.assumptions_file)

        # Valid ID patterns
        valid_ids = ["classical_mechanics_framework", "test_123", "a_b_c", "simple"]
        for assumption_id in valid_ids:
            # Even if ID doesn't exist, should attempt global resolution first
            resolved = resolve_assumption(assumption_id, {})
            self.assertEqual(resolved["type"], "direct")  # Falls back to direct since ID not found

        # Invalid ID patterns (should be treated as direct text)
        invalid_patterns = ["Test Assumption", "test-assumption", "test.assumption", "Test@123"]
        for pattern in invalid_patterns:
            resolved = resolve_assumption(pattern, assumptions)
            self.assertEqual(resolved["type"], "direct")
            self.assertEqual(resolved["text"], pattern)


if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)