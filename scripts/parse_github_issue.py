#!/usr/bin/env python3
"""
Parse GitHub issue content and convert to JSON entry format.
This script processes structured issue submissions and creates valid dataset entries.
"""

import sys
import json
import re
from typing import Dict, List, Any

def parse_issue_body(body: str) -> Dict[str, Any]:
    """Parse GitHub issue body into structured data."""
    
    # Extract form fields using regex patterns
    patterns = {
        'entry_name': r'### Entry Name\s*\n\s*([^\n]+)',
        'result_id': r'### Entry ID\s*\n\s*([^\n]+)',
        'main_equations': r'### Main Equation\(s\)\s*\n\s*(.*?)(?=###|\Z)',
        'explanation': r'### Explanation\s*\n\s*(.*?)(?=###|\Z)',
        'symbol_definitions': r'### Symbol Definitions\s*\n\s*(.*?)(?=###|\Z)',
        'derivation_steps': r'### Derivation Steps.*?\s*\n\s*(.*?)(?=###|\Z)',
        'arxiv_domain': r'### ArXiv Domain\s*\n\s*([^\n]+)',
        'theory_status': r'### Theory Status\s*\n\s*([^\n]+)',
        'references': r'### References\s*\n\s*(.*?)(?=###|\Z)',
        'created_by': r'### Your Name/ORCID\s*\n\s*([^\n]+)',
    }
    
    extracted = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, body, re.DOTALL | re.MULTILINE)
        if match:
            extracted[key] = match.group(1).strip()
    
    return extracted

def parse_equations(equations_text: str) -> List[Dict[str, str]]:
    """Parse equations from text format."""
    equations = []
    if not equations_text:
        return equations
    
    lines = equations_text.strip().split('\n')
    for i, line in enumerate(lines):
        line = line.strip()
        if ':' in line:
            parts = line.split(':', 1)
            eq_id = parts[0].strip()
            equation = parts[1].strip()
        else:
            eq_id = f"eq{i+1}"
            equation = line
        
        if equation:
            equations.append({
                'id': eq_id,
                'equation': equation
            })
    
    return equations

def parse_definitions(definitions_text: str) -> List[Dict[str, str]]:
    """Parse symbol definitions from text format."""
    definitions = []
    if not definitions_text:
        return definitions
    
    lines = definitions_text.strip().split('\n')
    for line in lines:
        line = line.strip()
        if ':' in line:
            parts = line.split(':', 1)
            symbol = parts[0].strip()
            definition = parts[1].strip()
            
            if symbol and definition:
                definitions.append({
                    'symbol': symbol,
                    'definition': definition
                })
    
    return definitions

def parse_references(references_text: str) -> List[Dict[str, str]]:
    """Parse references into structured format."""
    references = []
    if not references_text:
        return references
    
    lines = references_text.strip().split('\n')
    for i, line in enumerate(lines):
        line = line.strip()
        if line:
            references.append({
                'id': f"R{i+1}",
                'citation': line
            })
    
    return references

def parse_derivation_steps(derivation_text: str) -> tuple:
    """Parse derivation steps into derivation and explanation arrays."""
    derivation = []
    derivation_explanation = []
    
    if not derivation_text:
        return derivation, derivation_explanation
    
    lines = derivation_text.strip().split('\n')
    step_num = 1
    
    for line in lines:
        line = line.strip()
        if line.startswith('Step '):
            # Extract step content
            step_content = line.split(':', 1)
            if len(step_content) > 1:
                explanation_text = step_content[1].strip()
                derivation_explanation.append({
                    'step': step_num,
                    'text': explanation_text
                })
                step_num += 1
    
    return derivation, derivation_explanation

def build_json_entry(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """Build complete JSON entry from parsed data."""
    
    # Parse complex fields
    equations = parse_equations(parsed_data.get('main_equations', ''))
    definitions = parse_definitions(parsed_data.get('symbol_definitions', ''))
    references = parse_references(parsed_data.get('references', ''))
    derivation, derivation_explanation = parse_derivation_steps(parsed_data.get('derivation_steps', ''))
    
    # Extract theory status from dropdown text
    theory_status = parsed_data.get('theory_status', '').lower()
    if 'current' in theory_status:
        theory_status = 'current'
    elif 'historical' in theory_status:
        theory_status = 'historical'
    elif 'approximation' in theory_status:
        theory_status = 'approximation'
    elif 'limiting' in theory_status:
        theory_status = 'limiting_case'
    elif 'superseded' in theory_status:
        theory_status = 'superseded'
    else:
        theory_status = 'current'  # default
    
    # Build the complete entry
    entry = {
        'result_id': parsed_data.get('result_id', '').lower().replace(' ', '_'),
        'result_name': parsed_data.get('entry_name', ''),
        'result_equations': equations,
        'explanation': parsed_data.get('explanation', ''),
        'equations_assumptions': [],  # Will be filled manually if needed
        'definitions': definitions,
        'derivation': derivation,
        'derivation_assumptions': [],  # Will be filled manually if needed
        'derivation_explanation': derivation_explanation,
        'programmatic_verification': {
            'language': 'python 3.11.0',
            'library': 'sympy 1.13.0',
            'code': ['# TODO: Add verification code']
        },
        'domain': parsed_data.get('arxiv_domain', '').replace('(', '').replace(')', '').split(' ')[0],
        'theory_status': theory_status,
        'references': references,
        'created_by': parsed_data.get('created_by', 'GitHub Issue Submission'),
        'review_status': 'draft'
    }
    
    return entry

def main():
    """Main function to process GitHub issue body."""
    if len(sys.argv) != 2:
        print("Usage: python parse_github_issue.py <issue_body>", file=sys.stderr)
        sys.exit(1)
    
    issue_body = sys.argv[1]
    
    try:
        # Parse the issue body
        parsed_data = parse_issue_body(issue_body)
        
        # Build JSON entry
        entry = build_json_entry(parsed_data)
        
        # Validate required fields
        required_fields = ['result_id', 'result_name', 'result_equations', 'explanation', 'definitions']
        missing_fields = [field for field in required_fields if not entry.get(field)]
        
        if missing_fields:
            print(f"Error: Missing required fields: {missing_fields}", file=sys.stderr)
            sys.exit(1)
        
        # Output JSON
        print(json.dumps(entry, indent=2))
        
        # Output GitHub Actions variables
        print(f"::set-output name=entry_name::{entry['result_name']}", file=sys.stderr)
        print(f"::set-output name=entry_id::{entry['result_id']}", file=sys.stderr)
        print(f"::set-output name=domain::{entry['domain']}", file=sys.stderr)
        print(f"::set-output name=created_by::{entry['created_by']}", file=sys.stderr)
        
    except Exception as e:
        print(f"Error parsing issue: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()