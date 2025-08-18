#!/usr/bin/env python3
"""
Generate CONTRIBUTING.md from entry_requirements.json

This script reads the structured requirements from entry_requirements.json
and generates the CONTRIBUTING.md file with all field guidelines, examples,
and instructions.
"""

import json
import os
from pathlib import Path


def format_example(example):
    """Format example data for markdown display"""
    if isinstance(example, dict):
        if 'value' in example:
            if isinstance(example['value'], list):
                return f"```json\n{json.dumps(example['value'], indent=2)}\n```"
            elif isinstance(example['value'], dict):
                return f"```json\n{json.dumps(example['value'], indent=2)}\n```"
            else:
                return f"`{example['value']}`"
        else:
            return f"```json\n{json.dumps(example, indent=2)}\n```"
    elif isinstance(example, (list, dict)):
        return f"```json\n{json.dumps(example, indent=2)}\n```"
    else:
        return f"`{example}`"


def format_field_section(field_name, field_data, is_required=False):
    """Format a field section for the markdown"""
    lines = []

    # Field header
    required_marker = "**" if is_required else ""
    lines.append(f"- {required_marker}`{field_name}`:{required_marker}")

    # Description (now contains both description and guidelines)
    if 'description' in field_data:
        # Don't split on periods since they can appear in examples like (e.g., ...)
        # Just use the description as one block
        description = field_data['description']
        lines.append(f"  - {description}")

    # Example
    if 'example' in field_data:
        lines.append("  - Example:")
        example_text = format_example(field_data['example'])
        for line in example_text.split('\n'):
            lines.append(f"    {line}")

    lines.append("")  # Empty line after each field
    return lines


def generate_contributing_md(requirements_file, static_file, output_file):
    """Generate CONTRIBUTING.md from static content + requirements JSON"""

    # Load requirements
    with open(requirements_file, 'r', encoding='utf-8') as f:
        requirements = json.load(f)

    lines = []

    # Load static content if it exists
    if Path(static_file).exists():
        with open(static_file, 'r', encoding='utf-8') as f:
            static_content = f.read()
        lines.extend(static_content.split('\n'))
        lines.append("")
    else:
        # Fallback to original header if no static file
        lines.extend([
            "# Contributing to TheorIA Dataset",
            "",
            "Welcome to TheorIA dataset! This dataset is being built, and it is designed to provide a high quality collection of theoretical physics equations, derivations, and explanations in a structured format. We encourage contributions from researchers, educators, and enthusiasts in the field of theoretical physics. We need your help to expand the dataset with new entries, peer review existing enties, and ensure the high quality of the content.",
            "",
            "To facilitate your contributions, please follow the guidelines below, that explain the structure of each entry in the dataset, as well as its requirements.",
            "",
        ])

    # Add schema-generated section
    lines.extend([
        "## Dataset Entry Structure",
        "",
        "Each entry should be a self-contained relevant physics result in JSON format.",
        "All entries must be valid according to the schema in `schemas/entry.schema.json`.",
        ""
    ])

    # Process fields in specific order for readability
    field_order = [
        'result_id', 'result_name', 'result_equations', 'explanation',
        'definitions', 'assumptions', 'derivation',
        'derivation_explanation', 'programmatic_verification', 'domain',
        'theory_status', 'validity_regime', 'superseded_by', 'approximation_of',
        'historical_context', 'references', 'dependencies', 'created_by', 'review_status'
    ]

    # Add field sections
    required_fields = requirements.get('required', [])
    for field_name in field_order:
        if field_name in requirements['properties']:
            is_required = field_name in required_fields
            field_lines = format_field_section(
                field_name, requirements['properties'][field_name], is_required)
            lines.extend(field_lines)

    # Add theory status section
    theory_status_field = requirements['properties'].get('theory_status', {})
    if 'guidelines' in theory_status_field:
        lines.extend([
            "## Theory Status Options",
            ""
        ])

        for guideline in theory_status_field['guidelines']:
            lines.append(f"- {guideline}")

        lines.append("")

    # Testing section - hardcoded since we removed testing_commands from schema for strict mode compatibility
    lines.extend([
        "## Testing",
        "",
        "To ensure the quality and correctness of entries, run these commands:",
        "",
        "```bash",
        "make test",
        "make test-entry FILE=name",
        "make validate FILE=name",
        "docker-compose run --rm theoria-tests",
        "```",
        ""
    ])

    # Add auto-generation notice
    lines.extend([
        "",
        "---",
        "",
        "**IMPORTANT**: This CONTRIBUTING.md file is automatically generated from `CONTRIBUTING.static.md` and `schemas/entry.schema.json`. To update the guidelines, edit those source files and run the build script.",
        ""
    ])

    # Write output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"Generated CONTRIBUTING.md from {requirements_file}")


if __name__ == "__main__":
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    requirements_file = project_root / "schemas" / "entry.schema.json"
    static_file = project_root / "CONTRIBUTING.static.md"
    output_file = project_root / "CONTRIBUTING.md"

    generate_contributing_md(requirements_file, static_file, output_file)
