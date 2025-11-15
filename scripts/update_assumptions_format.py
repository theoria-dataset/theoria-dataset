#!/usr/bin/env python3
"""
Script to update draft entries from old assumption format to new simplified format.

Converts from:
"assumptions": [
  {
    "id": "assumption1",
    "text": "Some assumption text",
    "type": "unclassified"
  },
  {
    "id": "dependency2", 
    "type": "dependency",
    "dependency_id": "some_entry"
  }
]

To:
"assumptions": [
  "Some assumption text"
],
"dependencies": [
  "some_entry"
]
"""

import json
import os
from pathlib import Path

def update_entry_assumptions(entry_path):
    """Update a single entry from old to new assumption format."""
    print(f"Processing {entry_path.name}...")
    
    try:
        with open(entry_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"  Error reading {entry_path}: {e}")
        return False
    
    # Check if entry is draft
    if data.get('review_status') != 'draft':
        print(f"  Skipping {entry_path.name} - not a draft")
        return False
    
    # Check if assumptions field exists and is a list
    assumptions = data.get('assumptions', [])
    if not isinstance(assumptions, list) or not assumptions:
        print(f"  Skipping {entry_path.name} - no assumptions to convert")
        return False
    
    # Check if already in new format (assumptions are strings)
    if all(isinstance(a, str) for a in assumptions):
        print(f"  Skipping {entry_path.name} - already in new format")
        return False
    
    # Check if in old format (assumptions are objects with 'id' field)
    if not all(isinstance(a, dict) and 'id' in a for a in assumptions):
        print(f"  Skipping {entry_path.name} - unexpected assumption format")
        return False
    
    # Convert assumptions
    new_assumptions = []
    new_dependencies = []
    
    for assumption in assumptions:
        assumption_type = assumption.get('type', '')
        
        if assumption_type == 'dependency':
            # Extract dependency
            dependency_id = assumption.get('dependency_id', '')
            if isinstance(dependency_id, dict):
                # Handle nested dependency_id objects
                dependency_id = dependency_id.get('result_id', '')
            if dependency_id:
                new_dependencies.append(dependency_id)
        else:
            # Extract text assumption
            text = assumption.get('text', '')
            if text:
                new_assumptions.append(text)
    
    # Update the data structure
    data['assumptions'] = new_assumptions
    data['dependencies'] = new_dependencies
    
    # Write back to file
    try:
        with open(entry_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  [OK] Updated {entry_path.name}")
        print(f"     Assumptions: {len(new_assumptions)}")
        print(f"     Dependencies: {len(new_dependencies)}")
        return True
    except Exception as e:
        print(f"  Error writing {entry_path}: {e}")
        return False

def main():
    """Main function to update all draft entries."""
    entries_dir = Path(__file__).parent.parent / 'entries'
    
    if not entries_dir.exists():
        print(f"Error: Entries directory not found at {entries_dir}")
        return
    
    print("Updating draft entries from old to new assumption format...")
    print("=" * 60)
    
    # Find all JSON files in entries directory
    json_files = list(entries_dir.glob('*.json'))
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for entry_path in sorted(json_files):
        try:
            success = update_entry_assumptions(entry_path)
            if success:
                updated_count += 1
            else:
                skipped_count += 1
        except Exception as e:
            print(f"  [ERROR] Error processing {entry_path.name}: {e}")
            error_count += 1
    
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"   Updated: {updated_count} entries")
    print(f"   Skipped: {skipped_count} entries")
    print(f"   Errors:  {error_count} entries")
    print(f"   Total:   {len(json_files)} entries processed")
    
    if updated_count > 0:
        print("\n[SUCCESS] Assumption format update completed successfully!")
        print("   All updated entries now use the simplified format:")
        print("   - assumptions: array of strings")
        print("   - dependencies: array of entry IDs")
    else:
        print("\n[INFO] No entries needed updating.")

if __name__ == "__main__":
    main()