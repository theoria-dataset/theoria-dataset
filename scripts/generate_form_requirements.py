#!/usr/bin/env python3
"""
Generate JavaScript requirements data from entry_requirements.json for use in the contribution form

This script reads the structured requirements from entry_requirements.json
and generates a JavaScript file that can be used by the contribution form
to dynamically load field guidelines, examples, and validation rules.
"""

import json
import os
from pathlib import Path

def generate_js_requirements(requirements_file, output_file):
    """Generate JavaScript requirements file from requirements JSON"""
    
    # Load requirements
    with open(requirements_file, 'r', encoding='utf-8') as f:
        requirements = json.load(f)
    
    # Generate JavaScript content
    js_content = f"""// Auto-generated from {requirements_file}
// Do not edit manually - regenerate using scripts/generate_form_requirements.py

const FIELD_REQUIREMENTS = {json.dumps(requirements, indent=2)};

// Helper functions for accessing requirement data
function getFieldGuidelines(fieldName) {{
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.guidelines || [] : [];
}}

function getFieldDescription(fieldName) {{
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.description || '' : '';
}}

function getFieldExample(fieldName) {{
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.example || null : null;
}}

function getFieldConstraints(fieldName) {{
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    if (!field) return {{}};
    
    const constraints = {{}};
    if (field.type) constraints.type = field.type;
    if (field.required !== undefined) constraints.required = field.required;
    if (field.maxLength) constraints.maxLength = field.maxLength;
    if (field.minItems) constraints.minItems = field.minItems;
    if (field.pattern) constraints.pattern = field.pattern;
    if (field.enum) constraints.enum = field.enum;
    if (field.wordLimit) constraints.wordLimit = field.wordLimit;
    if (field.sentenceRange) constraints.sentenceRange = field.sentenceRange;
    
    return constraints;
}}

function isFieldRequired(fieldName) {{
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.required === true : false;
}}

function formatGuidelines(guidelines) {{
    if (!guidelines || guidelines.length === 0) return '';
    return guidelines.map(g => `• ${{g}}`).join('\\n');
}}

function formatExample(example) {{
    if (!example) return '';
    
    if (typeof example === 'object') {{
        if (example.value !== undefined) {{
            if (typeof example.value === 'string') {{
                return example.value;
            }} else {{
                return JSON.stringify(example.value, null, 2);
            }}
        }} else {{
            return JSON.stringify(example, null, 2);
        }}
    }}
    
    return String(example);
}}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{
        FIELD_REQUIREMENTS,
        getFieldGuidelines,
        getFieldDescription,
        getFieldExample,
        getFieldConstraints,
        isFieldRequired,
        formatGuidelines,
        formatExample
    }};
}}
"""
    
    # Write output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Generated JavaScript requirements from {requirements_file} -> {output_file}")

if __name__ == "__main__":
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    requirements_file = project_root / "schemas" / "entry.schema.json"
    output_file = project_root / "docs" / "contribute" / "form_requirements.js"
    
    generate_js_requirements(requirements_file, output_file)