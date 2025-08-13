#!/usr/bin/env python3
"""
Generate form.html from entry schema

This script reads the schema from entry.schema.json and generates
static HTML form content with guidelines from the schema, replacing
the hardcoded guidelines in the form.
"""

import json
import os
import re
from pathlib import Path


def format_guidelines_html(guidelines):
    """Format guidelines as HTML list items"""
    if not guidelines:
        return ""
    
    items = []
    for guideline in guidelines:
        items.append(f"        {guideline}")
    
    return ". ".join(items)


def format_example_html(example):
    """Format example for HTML display"""
    if not example:
        return ""
    
    if isinstance(example, list):
        return f"<pre><code>{json.dumps(example, indent=2)}</code></pre>"
    elif isinstance(example, dict):
        return f"<pre><code>{json.dumps(example, indent=2)}</code></pre>"
    else:
        return f"<code>{example}</code>"


def get_field_guideline_text(field_data):
    """Get the guideline text for a field"""
    guidelines = field_data.get('guidelines', [])
    description = field_data.get('description', '')
    
    if guidelines:
        # Join guidelines and escape backticks for HTML
        text = ". ".join(guidelines)
        # Replace backticks with code tags to preserve them
        text = text.replace('``', '<code>``</code>')
        return text
    elif description:
        # Escape backticks in description too
        return description.replace('``', '<code>``</code>')
    else:
        return "No guidelines available"


def update_form_guidelines(form_content, schema_data):
    """Update form content with schema-based guidelines"""
    properties = schema_data.get('properties', {})
    
    # Pattern to match guideline sections with data-field attributes
    guideline_pattern = r'<div class="guidelines"[^>]*data-field="([^"]+)"[^>]*>.*?<span class="guideline-text">.*?</span>.*?</div>'
    
    def replace_guideline(match):
        field_name = match.group(1)
        if field_name in properties:
            field_data = properties[field_name]
            guideline_text = get_field_guideline_text(field_data)
            
            # Replace the entire guidelines div
            return f'''<div class="guidelines" data-field="{field_name}">
                    <strong>Guidelines:</strong> <span class="guideline-text">{guideline_text}</span>
                </div>'''
        return match.group(0)
    
    # Replace guidelines with data-field attributes
    updated_content = re.sub(guideline_pattern, replace_guideline, form_content, flags=re.DOTALL)
    
    # Now handle hardcoded guidelines without data-field attributes  
    # Map current form text to schema fields
    form_to_schema_mapping = {
        'equations_assumptions': 'equations_assumptions',
        'definitions': 'definitions', 
        'derivation': 'derivation',
        'derivation_assumptions': 'derivation_assumptions',
        'derivation_explanation': 'derivation_explanation',
        'programmatic_verification': 'programmatic_verification',
        'domain': 'domain',
        'validity_regime': 'validity_regime',
        'dependencies': 'dependencies',
        'superseded_by': 'superseded_by',
        'historical_context': 'historical_context',
        'references': 'references',
        'attribution': 'created_by'
    }
    
    # Replace hardcoded guidelines by finding and replacing any guideline text in sections without data-field
    # Find all guidelines divs without data-field attribute
    guidelines_without_datafield = re.findall(
        r'<div class="guidelines"(?![^>]*data-field)[^>]*>\s*<strong>Guidelines:</strong>\s*([^<]+)</div>',
        updated_content, re.DOTALL
    )
    
    # Replace each found guideline with schema-based content
    for match in guidelines_without_datafield:
        current_text = match.strip()
        
        # Try to identify which schema field this corresponds to based on context
        # Look for the section heading above this guideline
        pattern = rf'<h3>[^<]*</h3>\s*<div class="guidelines"(?![^>]*data-field)[^>]*>\s*<strong>Guidelines:</strong>\s*{re.escape(current_text)}</div>'
        section_match = re.search(pattern, updated_content, re.DOTALL)
        
        if section_match:
            # Extract section heading to determine schema field
            heading_pattern = r'<h3>([^<]+)</h3>'
            heading_match = re.search(heading_pattern, section_match.group(0))
            
            if heading_match:
                heading = heading_match.group(1).strip()
                schema_field = None
                
                # Map section headings to schema fields
                if 'Equations Assumptions' in heading:
                    schema_field = 'equations_assumptions'
                elif 'Symbol Definitions' in heading:
                    schema_field = 'definitions'
                elif 'Derivation' in heading and 'Assumptions' not in heading and 'Explanation' not in heading:
                    schema_field = 'derivation'
                elif 'Derivation Assumptions' in heading:
                    schema_field = 'derivation_assumptions'
                elif 'Derivation Explanation' in heading:
                    schema_field = 'derivation_explanation'
                elif 'Programmatic Verification' in heading:
                    schema_field = 'programmatic_verification'
                elif 'Metadata' in heading:
                    schema_field = 'domain'
                elif 'Validity Regime' in heading:
                    schema_field = 'validity_regime'
                elif 'Dependencies' in heading:
                    schema_field = 'dependencies'
                elif 'Superseded By' in heading:
                    schema_field = 'superseded_by'
                elif 'Historical Context' in heading:
                    schema_field = 'historical_context'
                elif 'References' in heading:
                    schema_field = 'references'
                elif 'Attribution' in heading:
                    schema_field = 'created_by'
                
                if schema_field and schema_field in properties:
                    field_data = properties[schema_field]
                    schema_text = get_field_guideline_text(field_data)
                    
                    # Replace the guideline text
                    updated_content = updated_content.replace(current_text, schema_text)
    
    # Final pass: replace any remaining backtick references with code tags
    updated_content = updated_content.replace('``', '<code>``</code>')
    updated_content = updated_content.replace('(&#96;&#96;)', '(<code>``</code>)')
    updated_content = updated_content.replace('&#96;&#96;', '<code>``</code>')
    
    return updated_content


def generate_form_html(schema_file, form_template_file, output_file):
    """Generate static form HTML from schema"""
    
    # Load schema
    with open(schema_file, 'r', encoding='utf-8') as f:
        schema_data = json.load(f)
    
    # Load form template
    with open(form_template_file, 'r', encoding='utf-8') as f:
        form_content = f.read()
    
    # Update guidelines in form content
    updated_content = update_form_guidelines(form_content, schema_data)
    
    # Remove dynamic loading JavaScript and references
    # Remove the form_requirements.js script tag
    updated_content = re.sub(
        r'\s*<!-- Form Requirements -->\s*\n\s*<script src="form_requirements\.js"></script>\s*\n',
        '\n',
        updated_content
    )
    
    # Remove the dynamic loading initialization script
    dynamic_script_pattern = r'<script>\s*// Initialize form guidelines from requirements.*?</script>'
    updated_content = re.sub(dynamic_script_pattern, '', updated_content, flags=re.DOTALL)
    
    # Write the updated form
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print(f"Generated static form HTML from {schema_file}")


if __name__ == "__main__":
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    schema_file = project_root / "schemas" / "entry.schema.json"
    form_template_file = project_root / "docs" / "contribute" / "form.html"
    output_file = form_template_file  # Update in place
    
    generate_form_html(schema_file, form_template_file, output_file)