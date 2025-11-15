#!/usr/bin/env python3
"""
Build ML Dataset Script for TheorIA Dataset

This script creates a unified dataset for machine learning by:
1. Loading all reviewed entries (non-draft status)
2. Loading global assumptions and resolving assumption IDs to full text
3. Creating a single JSON file with all necessary data

Usage:
    python scripts/build_ml_dataset.py [--include-drafts] [--output dataset.json]
"""

import json
import glob
import argparse
import os
import re
from pathlib import Path

def load_global_assumptions(globals_path="globals/assumptions.json"):
    """Load the global assumptions database."""
    try:
        with open(globals_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Create lookup by ID
            assumptions_lookup = {}
            for assumption in data['assumptions']:
                assumptions_lookup[assumption['id']] = assumption
            return assumptions_lookup
    except FileNotFoundError:
        print(f"Warning: Could not find {globals_path}. Assumption resolution will be skipped.")
        return {}
    except Exception as e:
        print(f"Error loading global assumptions: {e}")
        return {}

def resolve_assumption(assumption_string, global_assumptions):
    """
    Resolve an assumption string to its full details.
    Returns either the global assumption object or a simple text assumption.
    """
    # Check if it matches the assumption ID pattern
    assumption_id_pattern = re.compile(r'^[a-z0-9_]+$')

    if assumption_id_pattern.match(assumption_string) and assumption_string in global_assumptions:
        # It's a global assumption ID
        assumption = global_assumptions[assumption_string]
        return {
            'type': 'global',
            'id': assumption['id'],
            'text': assumption['text'],
            'assumption_type': assumption['type'],
            'mathematical_expressions': assumption.get('mathematical_expressions', []),
            'symbol_definitions': assumption.get('symbol_definitions', [])
        }
    else:
        # It's direct text
        return {
            'type': 'direct',
            'text': assumption_string,
            'assumption_type': 'unspecified'
        }

def process_entry(entry_data, global_assumptions):
    """Process a single entry, resolving assumptions and cleaning up data."""
    processed_entry = entry_data.copy()

    # Resolve assumptions if present
    if 'assumptions' in processed_entry and processed_entry['assumptions']:
        resolved_assumptions = []
        for assumption_string in processed_entry['assumptions']:
            resolved = resolve_assumption(assumption_string, global_assumptions)
            resolved_assumptions.append(resolved)
        processed_entry['assumptions'] = resolved_assumptions

    return processed_entry

def load_entries(entries_pattern="entries/*.json", include_drafts=False):
    """Load all entries, optionally filtering out drafts."""
    entries = []
    entry_files = glob.glob(entries_pattern)

    print(f"Found {len(entry_files)} entry files")

    for entry_file in sorted(entry_files):
        try:
            with open(entry_file, 'r', encoding='utf-8') as f:
                entry_data = json.load(f)

                # Check review status
                review_status = entry_data.get('review_status', 'draft')

                if not include_drafts and review_status == 'draft':
                    continue  # Skip draft entries

                entries.append(entry_data)

        except Exception as e:
            print(f"Error loading {entry_file}: {e}")
            continue

    return entries

def load_version():
    """Load version from manifest.json."""
    try:
        with open('manifest.json', 'r', encoding='utf-8') as f:
            manifest = json.load(f)
            return manifest.get('dataset_version', '0.5.0')
    except Exception as e:
        print(f"Warning: Could not load version from manifest.json: {e}")
        return '0.5.0'

def build_dataset(include_drafts=False, output_file="dataset.json"):
    """Build the complete ML dataset."""
    print("Building TheorIA ML Dataset...")

    # Load version from manifest
    version = load_version()

    # Load global assumptions
    print("Loading global assumptions...")
    global_assumptions = load_global_assumptions()
    print(f"Loaded {len(global_assumptions)} global assumptions")

    # Load entries
    print("Loading entries...")
    entries = load_entries(include_drafts=include_drafts)

    if include_drafts:
        print(f"Loaded {len(entries)} entries (including drafts)")
    else:
        print(f"Loaded {len(entries)} reviewed entries (drafts excluded)")

    # Process entries to resolve assumptions
    print("Processing entries and resolving assumptions...")
    processed_entries = []
    for entry in entries:
        processed_entry = process_entry(entry, global_assumptions)
        processed_entries.append(processed_entry)

    # Build final dataset structure
    dataset = {
        'dataset_info': {
            'name': 'TheorIA Dataset',
            'version': version,
            'description': 'Curated dataset of theoretical physics derivations with resolved assumptions',
            'total_entries': len(processed_entries),
            'includes_drafts': include_drafts,
            'global_assumptions_count': len(global_assumptions)
        },
        'global_assumptions': list(global_assumptions.values()),
        'entries': processed_entries
    }

    # Write output
    print(f"Writing dataset to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    print(f"Successfully created {output_file}")
    print(f"   Dataset contains {len(processed_entries)} entries")
    print(f"   Resolved {len(global_assumptions)} global assumptions")

    return dataset

def main():
    parser = argparse.ArgumentParser(description='Build TheorIA ML Dataset')
    parser.add_argument('--include-drafts', action='store_true',
                        help='Include draft entries (default: only reviewed entries)')
    parser.add_argument('--output', default='dataset.json',
                        help='Output file path (default: dataset.json)')

    args = parser.parse_args()

    # Change to repository root if script is run from scripts/ directory
    if os.path.basename(os.getcwd()) == 'scripts':
        os.chdir('..')

    build_dataset(include_drafts=args.include_drafts, output_file=args.output)

if __name__ == '__main__':
    main()