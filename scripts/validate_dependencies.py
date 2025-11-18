#!/usr/bin/env python3
"""
Validate dependencies and references across all entries.
Checks for:
1. Dependencies pointing to non-existent entries
2. Circular dependencies
3. Reviewed entries only depending on other reviewed entries
4. All assumption references exist in global assumptions
"""

import json
import sys
from pathlib import Path
from collections import defaultdict, deque

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
                        'dependencies': data.get('depends_on', []),
                        'review_status': data.get('review_status', 'draft')
                    }
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"[WARNING] Could not load {json_file.name}: {e}")
    
    return entries


def load_global_assumptions():
    """Load global assumptions."""
    try:
        with open(ROOT / 'globals' / 'assumptions.json', 'r', encoding='utf-8') as f:
            assumptions_data = json.load(f)
            return {item['id']: item for item in assumptions_data['assumptions']}
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
        print(f"[WARNING] Could not load global assumptions: {e}")
        return {}


def find_circular_dependencies(entries):
    """Find circular dependencies using DFS and return the actual cycles."""
    def find_cycle_path(node, visited, rec_stack, path, graph):
        visited[node] = True
        rec_stack[node] = True
        path.append(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in entries:
                continue  # Skip non-existent entries (will be caught by other validation)
            
            if not visited.get(neighbor, False):
                cycle = find_cycle_path(neighbor, visited, rec_stack, path, graph)
                if cycle:
                    return cycle
            elif rec_stack.get(neighbor, False):
                # Found a cycle - extract the cycle from the path
                if neighbor in path:
                    cycle_start_idx = path.index(neighbor)
                    cycle_path = path[cycle_start_idx:] + [neighbor]  # Include the neighbor to close the cycle
                    return cycle_path
        
        path.pop()
        rec_stack[node] = False
        return None
    
    # Build dependency graph
    graph = {}
    for entry_id, entry_info in entries.items():
        graph[entry_id] = entry_info['dependencies']
    
    visited = {}
    rec_stack = {}
    found_cycles = []
    
    for node in entries:
        if not visited.get(node, False):
            cycle = find_cycle_path(node, visited, rec_stack, [], graph)
            if cycle:
                found_cycles.append(cycle)
                # Reset visited to find other cycles
                visited = {}
                rec_stack = {}
    
    return found_cycles


def validate_dependencies_and_references():
    """Main validation function."""
    print("Validating dependencies and references")
    print("=" * 60)
    
    # Load data
    entries = load_all_entries()
    global_assumptions = load_global_assumptions()
    
    if not entries:
        print("[ERROR] No entries found to validate")
        return False
    
    print(f"Loaded {len(entries)} entries and {len(global_assumptions)} global assumptions")
    print()
    
    errors = []
    warnings = []
    
    # 1. Check for non-existent dependencies
    print("1. Checking for non-existent dependencies...")
    missing_deps_errors = []
    missing_deps_warnings = []
    
    for entry_id, entry_info in entries.items():
        for dep in entry_info['dependencies']:
            if dep not in entries:
                if entry_info['review_status'] == 'reviewed':
                    missing_deps_errors.append((entry_id, dep, entry_info['filename']))
                    errors.append(f"[ERROR] Reviewed entry '{entry_id}' ({entry_info['filename']}) depends on non-existent entry '{dep}'")
                else:
                    missing_deps_warnings.append((entry_id, dep, entry_info['filename']))
                    warnings.append(f"[WARNING] Draft entry '{entry_id}' ({entry_info['filename']}) depends on non-existent entry '{dep}' (acceptable for draft)")
    
    total_missing = len(missing_deps_errors) + len(missing_deps_warnings)
    if total_missing > 0:
        print(f"  Found {total_missing} missing dependencies ({len(missing_deps_errors)} errors, {len(missing_deps_warnings)} warnings)")
    else:
        print("  [OK] All dependencies point to existing entries")
    
    # 2. Check for circular dependencies
    print("\n2. Checking for circular dependencies...")
    cycles = find_circular_dependencies(entries)
    cycle_errors = []
    cycle_warnings = []
    
    if cycles:
        for cycle_path in cycles:
            # Check if any entry in the cycle is reviewed
            has_reviewed_entry = any(entries[node]['review_status'] == 'reviewed' for node in cycle_path[:-1])  # Exclude last duplicate
            cycle_display = " → ".join(cycle_path)
            
            if has_reviewed_entry:
                cycle_errors.append(cycle_path)
                errors.append(f"[ERROR] Circular dependency found: {cycle_display}")
            else:
                cycle_warnings.append(cycle_path)
                warnings.append(f"[WARNING] Circular dependency found: {cycle_display} (should be fixed before review)")
        
        total_cycles = len(cycle_errors) + len(cycle_warnings)
        print(f"  Found {total_cycles} circular dependencies ({len(cycle_errors)} errors, {len(cycle_warnings)} warnings)")
    else:
        print("  [OK] No circular dependencies found")
    
    # 3. Check reviewed entries dependencies (informational only)
    print("\n3. Checking reviewed entries dependencies...")
    reviewed_depending_on_draft = []
    for entry_id, entry_info in entries.items():
        if entry_info['review_status'] == 'reviewed':
            for dep in entry_info['dependencies']:
                if dep in entries and entries[dep]['review_status'] == 'draft':
                    reviewed_depending_on_draft.append((entry_id, dep))
    
    if reviewed_depending_on_draft:
        print(f"  [INFO] {len(reviewed_depending_on_draft)} reviewed entries depend on draft entries (this is expected during development)")
        for entry_id, dep in reviewed_depending_on_draft:
            print(f"    - '{entry_id}' depends on draft entry '{dep}'")
    else:
        print("  [OK] All reviewed entries depend only on reviewed entries")
    
    # 4. Check assumption references
    print("\n4. Checking assumption references...")
    invalid_assumption_errors = []
    invalid_assumption_warnings = []

    for entry_id, entry_info in entries.items():
        assumptions = entry_info['data'].get('assumptions', [])
        is_reviewed = entry_info['review_status'] == 'reviewed'

        for i, assumption in enumerate(assumptions):
            if isinstance(assumption, str):
                # Check if it's a reference to a global assumption
                if assumption in global_assumptions:
                    continue  # Valid reference
                else:
                    # Invalid assumption reference
                    error_msg = f"Entry '{entry_id}' ({entry_info['filename']}) has invalid assumption ID '{assumption}' at index {i}"

                    if is_reviewed:
                        invalid_assumption_errors.append((entry_id, assumption, i))
                        errors.append(f"[ERROR] {error_msg} - reviewed entries must only reference global assumption IDs")
                    else:
                        invalid_assumption_warnings.append((entry_id, assumption, i))
                        warnings.append(f"[WARNING] {error_msg} - should reference global assumption IDs from globals/assumptions.json")

    total_invalid = len(invalid_assumption_errors) + len(invalid_assumption_warnings)
    if total_invalid > 0:
        print(f"  Found {total_invalid} invalid assumption references ({len(invalid_assumption_errors)} errors, {len(invalid_assumption_warnings)} warnings)")
    else:
        print("  [OK] All assumption references are valid")

    # 5. Check step-level assumption references
    print("\n5. Checking step-level assumption references...")
    undeclared_step_assumptions_errors = []
    undeclared_step_assumptions_warnings = []

    for entry_id, entry_info in entries.items():
        # Get declared prerequisites (assumptions + dependencies)
        declared_prerequisites = set(entry_info['data'].get('assumptions', []))
        declared_prerequisites.update(entry_info['data'].get('depends_on', []))

        # Get step-level assumption references
        derivation = entry_info['data'].get('derivation', [])
        is_reviewed = entry_info['review_status'] == 'reviewed'

        for step in derivation:
            step_assumptions = step.get('assumptions', [])
            for step_assumption in step_assumptions:
                if step_assumption and step_assumption not in declared_prerequisites:
                    step_num = step.get('step', '?')
                    error_msg = f"Entry '{entry_id}' ({entry_info['filename']}) step {step_num} references '{step_assumption}' which is not in assumptions or depends_on fields"

                    if is_reviewed:
                        undeclared_step_assumptions_errors.append((entry_id, step_num, step_assumption))
                        errors.append(f"[ERROR] {error_msg}")
                    else:
                        undeclared_step_assumptions_warnings.append((entry_id, step_num, step_assumption))
                        warnings.append(f"[WARNING] {error_msg}")

    total_undeclared = len(undeclared_step_assumptions_errors) + len(undeclared_step_assumptions_warnings)
    if total_undeclared > 0:
        print(f"  Found {total_undeclared} undeclared step-level assumptions ({len(undeclared_step_assumptions_errors)} errors, {len(undeclared_step_assumptions_warnings)} warnings)")
    else:
        print("  [OK] All step-level assumptions are declared in entry prerequisites")

    # 6. Validate 'used_in' field in global assumptions
    print("\n6. Checking 'used_in' field accuracy in global assumptions...")
    used_in_errors = []
    used_in_warnings = []

    # Build actual usage map: which entries actually use each assumption
    actual_usage = defaultdict(set)
    for entry_id, entry_info in entries.items():
        for assumption_id in entry_info['data'].get('assumptions', []):
            if assumption_id in global_assumptions:
                actual_usage[assumption_id].add(entry_id)

    # Check each assumption's used_in field
    for assumption_id, assumption_data in global_assumptions.items():
        declared_used_in = set(assumption_data.get('used_in', []))
        actual_users = actual_usage.get(assumption_id, set())

        # Check for entries in used_in that don't actually use the assumption
        false_positives = declared_used_in - actual_users
        for entry_id in false_positives:
            if entry_id in entries:
                is_reviewed = entries[entry_id]['review_status'] == 'reviewed'
                error_msg = f"Assumption '{assumption_id}' lists '{entry_id}' in used_in, but '{entry_id}' doesn't reference it"
                if is_reviewed:
                    used_in_errors.append((assumption_id, entry_id, 'false_positive'))
                    errors.append(f"[ERROR] {error_msg}")
                else:
                    used_in_warnings.append((assumption_id, entry_id, 'false_positive'))
                    warnings.append(f"[WARNING] {error_msg}")

        # Check for reviewed entries that use the assumption but aren't in used_in
        false_negatives = actual_users - declared_used_in
        for entry_id in false_negatives:
            if entry_id in entries and entries[entry_id]['review_status'] == 'reviewed':
                error_msg = f"Reviewed entry '{entry_id}' uses assumption '{assumption_id}' but is not listed in its used_in field"
                used_in_errors.append((assumption_id, entry_id, 'false_negative'))
                errors.append(f"[ERROR] {error_msg}")
            elif entry_id in entries:
                # Draft entry - just a warning
                warning_msg = f"Draft entry '{entry_id}' uses assumption '{assumption_id}' but is not listed in its used_in field"
                used_in_warnings.append((assumption_id, entry_id, 'false_negative'))
                warnings.append(f"[WARNING] {warning_msg}")

    total_used_in_issues = len(used_in_errors) + len(used_in_warnings)
    if total_used_in_issues > 0:
        print(f"  Found {total_used_in_issues} used_in field issues ({len(used_in_errors)} errors, {len(used_in_warnings)} warnings)")
    else:
        print("  [OK] All used_in fields are accurate")

    # 7. Summary statistics
    print("\n7. Dependency statistics...")
    reviewed_entries = [e for e in entries.values() if e['review_status'] == 'reviewed']
    draft_entries = [e for e in entries.values() if e['review_status'] == 'draft']
    
    total_deps = sum(len(e['dependencies']) for e in entries.values())
    reviewed_deps = sum(len(e['dependencies']) for e in reviewed_entries)
    
    print(f"  Total entries: {len(entries)} ({len(reviewed_entries)} reviewed, {len(draft_entries)} draft)")
    print(f"  Total dependencies: {total_deps} ({reviewed_deps} from reviewed entries)")
    print(f"  Global assumptions: {len(global_assumptions)}")
    
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
        print(f"\n[SUCCESS] All dependency and reference validation passed!")
        return True


def main():
    """Main entry point."""
    success = validate_dependencies_and_references()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()