#!/usr/bin/env python3
"""
Validate equation_title and equation_proven usage across all entries.
Checks for:
1. Reviewed entries must have equation_title for all result_equations
2. Each equation_title must have at least one derivation step with equation_proven
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

# Get project root
ROOT = Path(__file__).resolve().parents[1]


def load_all_entries():
    """Load all entries and return entry data mapped by result_id."""
    entries_dir = ROOT / 'entries'
    entries = {}

    for json_file in entries_dir.glob('*.json'):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                result_id = data.get('result_id')
                if result_id:
                    entries[result_id] = {
                        'data': data,
                        'filename': json_file.name,
                        'review_status': data.get('review_status', 'draft')
                    }
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"[WARNING] Could not load {json_file.name}: {e}")

    return entries


def validate_equation_titles_and_proven():
    """Main validation function."""
    print("Validating equation_title and equation_proven usage")
    print("=" * 60)

    # Load data
    entries = load_all_entries()

    if not entries:
        print("[ERROR] No entries found to validate")
        return False

    reviewed_entries = [e for e in entries.values() if e['review_status'] == 'reviewed']
    draft_entries = [e for e in entries.values() if e['review_status'] == 'draft']

    print(f"Loaded {len(entries)} entries ({len(reviewed_entries)} reviewed, {len(draft_entries)} draft)")
    print()

    errors = []
    warnings = []

    # 1. Check equation_title requirements for reviewed entries
    print("1. Checking equation_title requirements for reviewed entries...")
    missing_equation_title_errors = []
    missing_equation_title_info = []

    for entry_id, entry_info in entries.items():
        is_reviewed = entry_info['review_status'] == 'reviewed'
        result_equations = entry_info['data'].get('result_equations', [])

        for i, eq in enumerate(result_equations):
            if 'equation_title' not in eq or not eq['equation_title'].strip():
                eq_id = eq.get('id', f'index-{i}')
                error_msg = f"Entry '{entry_id}' ({entry_info['filename']}) equation '{eq_id}' missing equation_title"

                if is_reviewed:
                    missing_equation_title_errors.append((entry_id, eq_id))
                    errors.append(f"[ERROR] {error_msg} - reviewed entries must have equation_title for all equations")
                else:
                    # Optional for draft: only info message
                    missing_equation_title_info.append((entry_id, eq_id))
                    # Don't add to warnings - just informational

    if missing_equation_title_errors:
        print(f"  Found {len(missing_equation_title_errors)} reviewed entries with missing equation_title")
    else:
        print("  [OK] All reviewed entries have equation_title for all equations")

    if missing_equation_title_info:
        print(f"  [INFO] {len(missing_equation_title_info)} draft entries have equations without equation_title (optional for draft)")

    # 2. Check equation_title/equation_proven matching
    print("\n2. Checking equation_title/equation_proven matching...")

    # Build maps
    equation_titles = defaultdict(list)  # entry_id -> [(eq_id, equation_title), ...]
    equation_proven_refs = defaultdict(list)  # entry_id -> [(step_num, eq_id), ...]
    invalid_equation_proven_errors = []
    invalid_equation_proven_warnings = []

    for entry_id, entry_info in entries.items():
        is_reviewed = entry_info['review_status'] == 'reviewed'

        # Map equations with titles
        result_equations = entry_info['data'].get('result_equations', [])
        equation_ids = {eq['id'] for eq in result_equations if 'id' in eq}

        for eq in result_equations:
            if 'equation_title' in eq and eq['equation_title'].strip():
                equation_titles[entry_id].append((eq['id'], eq['equation_title']))

        # Map derivation steps with equation_proven
        derivation = entry_info['data'].get('derivation', [])
        for step in derivation:
            if 'equation_proven' in step and step['equation_proven'].strip():
                eq_proven_id = step['equation_proven']
                step_num = step.get('step', '?')
                equation_proven_refs[entry_id].append((step_num, eq_proven_id))

                # Bonus check: verify equation_proven references valid equation ID
                if eq_proven_id not in equation_ids:
                    error_msg = f"Entry '{entry_id}' ({entry_info['filename']}) step {step_num} has equation_proven='{eq_proven_id}' but no equation with that ID exists"

                    if is_reviewed:
                        invalid_equation_proven_errors.append((entry_id, step_num, eq_proven_id))
                        errors.append(f"[ERROR] {error_msg}")
                    else:
                        invalid_equation_proven_warnings.append((entry_id, step_num, eq_proven_id))
                        warnings.append(f"[WARNING] {error_msg}")

    # Check matching
    orphan_equation_title_errors = []
    orphan_equation_title_warnings = []

    for entry_id, titled_equations in equation_titles.items():
        is_reviewed = entries[entry_id]['review_status'] == 'reviewed'
        proven_eq_ids = {eq_id for step, eq_id in equation_proven_refs.get(entry_id, [])}

        for eq_id, eq_title in titled_equations:
            if eq_id not in proven_eq_ids:
                error_msg = f"Entry '{entry_id}' ({entries[entry_id]['filename']}) equation '{eq_id}' has equation_title '{eq_title}' but no derivation step proves it"

                if is_reviewed:
                    orphan_equation_title_errors.append((entry_id, eq_id, eq_title))
                    errors.append(f"[ERROR] {error_msg} - add equation_proven='{eq_id}' to at least one derivation step")
                else:
                    orphan_equation_title_warnings.append((entry_id, eq_id, eq_title))
                    warnings.append(f"[WARNING] {error_msg} - should add equation_proven='{eq_id}' to derivation step")

    total_orphans = len(orphan_equation_title_errors) + len(orphan_equation_title_warnings)
    total_invalid = len(invalid_equation_proven_errors) + len(invalid_equation_proven_warnings)

    if total_orphans > 0:
        print(f"  Found {total_orphans} equations with equation_title but no matching equation_proven ({len(orphan_equation_title_errors)} errors, {len(orphan_equation_title_warnings)} warnings)")
    else:
        print("  [OK] All equations with equation_title have corresponding equation_proven steps")

    if total_invalid > 0:
        print(f"  Found {total_invalid} invalid equation_proven references ({len(invalid_equation_proven_errors)} errors, {len(invalid_equation_proven_warnings)} warnings)")

    # 3. Check no steps after last equation_proven for reviewed entries
    print("\n3. Checking no derivation steps after last equation is proven...")
    steps_after_last_proven_errors = []
    steps_after_last_proven_warnings = []

    for entry_id, entry_info in entries.items():
        is_reviewed = entry_info['review_status'] == 'reviewed'

        # Only check entries that have equation titles (i.e., equations to prove)
        if entry_id not in equation_titles or len(equation_titles[entry_id]) == 0:
            continue

        derivation = entry_info['data'].get('derivation', [])
        if not derivation:
            continue

        # Find the last step with equation_proven
        last_proven_step = None
        for step in derivation:
            if 'equation_proven' in step and step['equation_proven'].strip():
                last_proven_step = step.get('step', 0)

        # Check if there are steps after the last proven step
        if last_proven_step is not None:
            for step in derivation:
                step_num = step.get('step', 0)
                if step_num > last_proven_step:
                    error_msg = f"Entry '{entry_id}' ({entry_info['filename']}) has step {step_num} after the last equation is proven (step {last_proven_step})"

                    if is_reviewed:
                        steps_after_last_proven_errors.append((entry_id, step_num, last_proven_step))
                        errors.append(f"[ERROR] {error_msg} - all equations should be proven by the final derivation step")
                    else:
                        steps_after_last_proven_warnings.append((entry_id, step_num, last_proven_step))
                        warnings.append(f"[WARNING] {error_msg} - consider proving all equations by the final step")

    total_steps_after = len(steps_after_last_proven_errors) + len(steps_after_last_proven_warnings)
    if total_steps_after > 0:
        print(f"  Found {total_steps_after} steps after last equation proven ({len(steps_after_last_proven_errors)} errors, {len(steps_after_last_proven_warnings)} warnings)")
    else:
        print("  [OK] No steps after last equation is proven")

    # 4. Summary statistics
    print("\n4. Validation statistics...")
    total_equations_with_titles = sum(len(eqs) for eqs in equation_titles.values())
    total_proven_steps = sum(len(refs) for refs in equation_proven_refs.values())

    print(f"  Total entries: {len(entries)} ({len(reviewed_entries)} reviewed, {len(draft_entries)} draft)")
    print(f"  Equations with titles: {total_equations_with_titles}")
    print(f"  Derivation steps with equation_proven: {total_proven_steps}")

    # Print all errors and warnings
    if errors or warnings:
        print(f"\n{'='*60}")
        print("VALIDATION ISSUES FOUND:")

        if errors:
            print(f"\nERRORS ({len(errors)}):")
            for error in errors:
                print(f"  {error}")

        if warnings:
            print(f"\nWARNINGS ({len(warnings)}):")
            for warning in warnings:
                print(f"  {warning}")

        print(f"\n[RESULT] Validation failed with {len(errors)} errors and {len(warnings)} warnings")
        return len(errors) == 0  # Only fail on errors, not warnings
    else:
        print(f"\n[SUCCESS] All equation_title and equation_proven validation passed!")
        return True


def main():
    """Main entry point."""
    success = validate_equation_titles_and_proven()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
