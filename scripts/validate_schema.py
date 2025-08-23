#!/usr/bin/env python3
"""
Schema validation with clear error messages for TheorIA dataset contributors.
"""

import json
import sys
from pathlib import Path

# Get project root
ROOT = Path(__file__).resolve().parents[1]


def validate_entry_schema(entry_path):
    """
    Validate a single entry against the schema with helpful error messages.
    Returns (is_valid, error_messages).
    """
    errors = []
    
    try:
        with open(entry_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return False, [f"[ERROR] Invalid JSON syntax: {e}"]
    except FileNotFoundError:
        return False, [f"[ERROR] File not found: {entry_path}"]
    
    # Check required fields with specific guidance
    required_fields = {
        'result_id': "Unique identifier (must match filename without .json)",
        'result_name': "Brief title (max 100 characters)",
        'result_equations': "Array of equations with 'id' and 'equation' fields",
        'explanation': "2-5 sentence summary (≤100 words)",
        'definitions': "Array defining all symbols used",
        'assumptions': "Array of assumptions that lead to the result equations",
        'derivation': "Array of derivation steps with 'step', 'description', and 'equation'", 
        'programmatic_verification': "Object with 'language', 'library', and 'code'",
        'domain': "arXiv category (e.g., 'hep-th', 'gr-qc')",
        'theory_status': "One of: current, historical, approximation, limiting_case, superseded",
        'references': "Array of 1-3 references with 'id' and 'citation'",
        'contributors': "Array of contributors with 'full_name' and 'identifier'",
        'review_status': "Either 'draft' or 'reviewed'"
    }
    
    for field, description in required_fields.items():
        if field not in data:
            errors.append(f"[ERROR] Missing required field '{field}': {description}")
    
    if errors:
        return False, errors
    
    # Detailed validation for specific fields
    filename_stem = entry_path.stem
    if data.get('result_id') != filename_stem:
        errors.append(f"[ERROR] result_id mismatch:")
        errors.append(f"   → Expected: '{filename_stem}' (based on filename)")
        errors.append(f"   → Got: '{data.get('result_id')}'")
        errors.append(f"   → Fix: Rename file to '{data.get('result_id')}.json' or change result_id")
    
    # Validate result_name length
    if len(data.get('result_name', '')) > 100:
        errors.append(f"[ERROR] result_name too long: {len(data['result_name'])} chars (max 100)")
    
    # Validate explanation length (approximately 100 words = ~800 characters)
    explanation = data.get('explanation', '')
    if len(explanation) > 800:
        errors.append(f"[ERROR] explanation too long: ~{len(explanation.split())} words (max ~100 words)")
    
    # Validate result_equations structure
    equations = data.get('result_equations', [])
    if not equations:
        errors.append(f"[ERROR] result_equations cannot be empty")
    else:
        for i, eq in enumerate(equations):
            if not isinstance(eq, dict):
                errors.append(f"[ERROR] result_equations[{i}] must be an object with 'id' and 'equation' fields")
            else:
                if 'id' not in eq:
                    errors.append(f"[ERROR] result_equations[{i}] missing 'id' field")
                if 'equation' not in eq:
                    errors.append(f"[ERROR] result_equations[{i}] missing 'equation' field")
    
    # Validate definitions structure
    definitions = data.get('definitions', [])
    if not definitions:
        errors.append(f"[ERROR] definitions cannot be empty - define all symbols used in equations")
    else:
        for i, defn in enumerate(definitions):
            if not isinstance(defn, dict):
                errors.append(f"[ERROR] definitions[{i}] must be an object with 'symbol' and 'definition' fields")
            else:
                if 'symbol' not in defn:
                    errors.append(f"[ERROR] definitions[{i}] missing 'symbol' field")
                if 'definition' not in defn:
                    errors.append(f"[ERROR] definitions[{i}] missing 'definition' field")
    
    # Validate derivation structure  
    derivation = data.get('derivation', [])
    if not derivation:
        errors.append(f"[ERROR] derivation cannot be empty")
    else:
        steps = set()
        for i, step_obj in enumerate(derivation):
            if not isinstance(step_obj, dict):
                errors.append(f"[ERROR] derivation[{i}] must be an object with 'step' and 'equation' fields")
            else:
                if 'step' not in step_obj:
                    errors.append(f"[ERROR] derivation[{i}] missing 'step' field")
                elif not isinstance(step_obj['step'], int) or step_obj['step'] < 1:
                    errors.append(f"[ERROR] derivation[{i}] 'step' must be a positive integer")
                else:
                    step_num = step_obj['step']
                    if step_num in steps:
                        errors.append(f"[ERROR] derivation step {step_num} is duplicated")
                    steps.add(step_num)
                
                if 'equation' not in step_obj:
                    errors.append(f"[ERROR] derivation[{i}] missing 'equation' field")
    
    # Validate theory_status
    valid_statuses = ['current', 'historical', 'approximation', 'limiting_case', 'superseded']
    if data.get('theory_status') not in valid_statuses:
        errors.append(f"[ERROR] Invalid theory_status: '{data.get('theory_status')}'")
        errors.append(f"   → Must be one of: {', '.join(valid_statuses)}")
    
    # Validate references
    references = data.get('references', [])
    if not references:
        errors.append(f"[ERROR] references cannot be empty - provide 1-3 references")
    elif len(references) > 3:
        errors.append(f"[ERROR] Too many references: {len(references)} (max 3)")
    else:
        for i, ref in enumerate(references):
            if not isinstance(ref, dict):
                errors.append(f"[ERROR] references[{i}] must be an object with 'id' and 'citation' fields")
            else:
                if 'id' not in ref:
                    errors.append(f"[ERROR] references[{i}] missing 'id' field")
                if 'citation' not in ref:
                    errors.append(f"[ERROR] references[{i}] missing 'citation' field")
    
    # Validate programmatic_verification
    pv = data.get('programmatic_verification', {})
    if pv:
        required_pv_fields = ['language', 'library', 'code']
        for field in required_pv_fields:
            if field not in pv:
                errors.append(f"[ERROR] programmatic_verification missing '{field}' field")
        
        if 'language' in pv:
            # Should be format "python X.Y.Z"
            lang_parts = pv['language'].split()
            if len(lang_parts) != 2 or lang_parts[0] != 'python':
                errors.append(f"[ERROR] programmatic_verification.language format should be 'python X.Y.Z', got '{pv['language']}'")
        
        if 'library' in pv:
            # Should be format "library_name X.Y.Z" or "none"
            if pv['library'].lower() != 'none':
                lib_parts = pv['library'].split()
                if len(lib_parts) != 2:
                    errors.append(f"[ERROR] programmatic_verification.library format should be 'library_name X.Y.Z' or 'none', got '{pv['library']}'")
        
        if 'code' in pv:
            if not isinstance(pv['code'], list) or not pv['code']:
                errors.append(f"[ERROR] programmatic_verification.code must be a non-empty array of strings")
    
    return len(errors) == 0, errors


def main():
    """Main entry point for schema validation."""
    if len(sys.argv) < 2:
        print("Usage: python scripts/validate_schema.py <entry_file.json>")
        sys.exit(1)
    
    entry_file = sys.argv[1]
    if not entry_file.endswith('.json'):
        entry_file += '.json'
    
    # Try relative to entries/ directory first
    entry_path = ROOT / 'entries' / entry_file
    if not entry_path.exists():
        # Try as absolute path
        entry_path = Path(entry_file)
        if not entry_path.exists():
            print(f"[ERROR] File not found: {entry_file}")
            print(f"   → Make sure the file is in the entries/ directory")
            sys.exit(1)
    
    try:
        print(f"📋 Validating schema for: {entry_path.name}")
    except UnicodeEncodeError:
        print(f"[VALIDATE] Validating schema for: {entry_path.name}")
    print("="*50)
    
    is_valid, errors = validate_entry_schema(entry_path)
    
    if is_valid:
        print("[OK] Schema validation passed!")
        print(f"   Entry '{entry_path.name}' follows the correct structure")
    else:
        print(f"[ERROR] Schema validation failed ({len(errors)} issues):")
        for error in errors:
            if error.startswith('[ERROR]'):
                print(f"  {error}")
            else:
                print(f"    {error}")
        
        print(f"\nNext steps:")
        print(f"  1. Fix the issues listed above")
        print(f"  2. Check CONTRIBUTING.md for detailed field descriptions")
        print(f"  3. Use scripts/test_entry.py to test programmatic verification")
        
        sys.exit(1)


if __name__ == "__main__":
    main()