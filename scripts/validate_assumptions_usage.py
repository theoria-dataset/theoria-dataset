#!/usr/bin/env python3
"""
Validate assumption and dependency usage in entries.

This script performs two key validations:
1. Ensures assumption IDs don't conflict with entry IDs
2. Verifies all listed assumptions/dependencies are used in derivation steps
"""

import json
import sys
from pathlib import Path
from typing import Set, List, Dict, Any


def load_json(filepath: Path) -> Dict[str, Any]:
    """Load and parse a JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_all_entry_ids(entries_dir: Path) -> Set[str]:
    """Get all entry IDs from the entries directory."""
    entry_ids = set()
    for entry_file in entries_dir.glob('*.json'):
        data = load_json(entry_file)
        entry_ids.add(data['result_id'])
    return entry_ids


def get_all_assumption_ids(assumptions_file: Path) -> Set[str]:
    """Get all assumption IDs from globals/assumptions.json."""
    data = load_json(assumptions_file)
    return {assumption['id'] for assumption in data['assumptions']}


def validate_no_id_conflicts(assumption_ids: Set[str], entry_ids: Set[str]) -> List[str]:
    """
    Validate that assumption IDs don't conflict with entry IDs.

    Returns list of error messages (empty if validation passes).
    """
    errors = []
    conflicts = assumption_ids.intersection(entry_ids)

    if conflicts:
        errors.append(f"Found {len(conflicts)} ID conflicts between assumptions and entries:")
        for conflict_id in sorted(conflicts):
            errors.append(f"  - '{conflict_id}' exists as both an assumption and an entry")

    return errors


def get_step_assumptions(derivation: List[Dict[str, Any]]) -> Set[str]:
    """Extract all assumption references from derivation steps."""
    step_assumptions = set()
    for step in derivation:
        if 'assumption' in step and step['assumption']:
            step_assumptions.add(step['assumption'])
    return step_assumptions


def validate_assumptions_used(entry_file: Path, data: Dict[str, Any]) -> tuple[List[str], List[str]]:
    """
    Validate that all listed assumptions and dependencies are used in derivation steps.

    Returns tuple of (errors, warnings):
    - errors: For reviewed entries with unused prerequisites
    - warnings: For draft entries with unused prerequisites
    """
    errors = []
    warnings = []

    # Get all prerequisites (assumptions + dependencies)
    prerequisites = set(data.get('assumptions', []))
    prerequisites.update(data.get('depends_on', []))

    # Get all assumptions referenced in derivation steps
    step_assumptions = get_step_assumptions(data.get('derivation', []))

    # Find unused prerequisites
    unused = prerequisites - step_assumptions

    if unused:
        is_reviewed = data.get('review_status') == 'reviewed'
        message_list = errors if is_reviewed else warnings

        status_label = "❌ ERROR" if is_reviewed else "⚠️  WARNING"
        message_list.append(f"{entry_file.name} ({status_label}):")
        message_list.append(f"  Found {len(unused)} unused prerequisites:")
        for prereq_id in sorted(unused):
            # Determine if it's an assumption or dependency
            prereq_type = "assumption" if prereq_id in data.get('assumptions', []) else "dependency"
            message_list.append(f"    - {prereq_type}: '{prereq_id}'")

    return errors, warnings


def main():
    """Main validation function."""
    # Setup paths
    project_root = Path(__file__).parent.parent
    entries_dir = project_root / 'entries'
    assumptions_file = project_root / 'globals' / 'assumptions.json'

    print("=" * 70)
    print("Validating Assumption and Dependency Usage")
    print("=" * 70)
    print()

    # Load all IDs
    print("Loading data...")
    entry_ids = get_all_entry_ids(entries_dir)
    assumption_ids = get_all_assumption_ids(assumptions_file)

    print(f"  Found {len(entry_ids)} entries")
    print(f"  Found {len(assumption_ids)} assumptions")
    print()

    # Validation 1: Check for ID conflicts
    print("Validation 1: Checking for ID conflicts between assumptions and entries...")
    conflict_errors = validate_no_id_conflicts(assumption_ids, entry_ids)

    if conflict_errors:
        print("❌ FAILED")
        for error in conflict_errors:
            print(error)
        print()
    else:
        print("✅ PASSED - No ID conflicts found")
        print()

    # Validation 2: Check that all prerequisites are used in derivation steps
    print("Validation 2: Checking that all prerequisites are used in derivation steps...")
    all_errors = []
    all_warnings = []

    for entry_file in sorted(entries_dir.glob('*.json')):
        data = load_json(entry_file)
        errors, warnings = validate_assumptions_used(entry_file, data)
        if errors:
            all_errors.extend(errors)
        if warnings:
            all_warnings.extend(warnings)

    # Report errors first (reviewed entries with unused prerequisites)
    if all_errors:
        print("❌ ERRORS - Reviewed entries with unused prerequisites:")
        print()
        for error in all_errors:
            print(error)
        print()
        print("CRITICAL: Reviewed entries must reference all prerequisites in derivation steps.")
        print("Either add step-level references or remove unused prerequisites.")
        print()

    # Then report warnings (draft entries)
    if all_warnings:
        print("⚠️  WARNINGS - Draft entries with unused prerequisites:")
        print()
        for warning in all_warnings:
            print(warning)
        print()
        print("Note: Draft entries may have unused prerequisites during development.")
        print("These should be addressed before changing review_status to 'reviewed'.")
        print()

    if not all_errors and not all_warnings:
        print("✅ PASSED - All prerequisites are used in derivation steps")
        print()

    # Summary
    print("=" * 70)
    print("Summary")
    print("=" * 70)

    if conflict_errors:
        print(f"❌ Found {len(conflict_errors)} ID conflicts (CRITICAL)")
        return 1
    elif all_errors:
        reviewed_count = len([e for e in all_errors if 'ERROR' in e and '.json' in e])
        print(f"❌ Found {reviewed_count} reviewed entries with unused prerequisites (CRITICAL)")
        print(f"   These entries must be fixed before merging")
        return 1
    elif all_warnings:
        draft_count = len([w for w in all_warnings if 'WARNING' in w and '.json' in w])
        print(f"⚠️  Found {draft_count} draft entries with unused prerequisites")
        print("   Review warnings but no action required for draft entries")
        return 0
    else:
        print("✅ All validations passed!")
        return 0


if __name__ == '__main__':
    sys.exit(main())
