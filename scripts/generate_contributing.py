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
        # Split the combined description by sentences for better formatting
        description = field_data['description']
        sentences = [s.strip() for s in description.split('.') if s.strip()]
        for sentence in sentences:
            if sentence:
                lines.append(f"  - {sentence}")

    # Example
    if 'example' in field_data:
        lines.append("  - Example:")
        example_text = format_example(field_data['example'])
        for line in example_text.split('\n'):
            lines.append(f"    {line}")

    lines.append("")  # Empty line after each field
    return lines


def generate_contributing_md(requirements_file, output_file):
    """Generate CONTRIBUTING.md from requirements JSON"""

    # Load requirements
    with open(requirements_file, 'r', encoding='utf-8') as f:
        requirements = json.load(f)

    lines = []

    # Header
    lines.extend([
        "# Contributing to TheorIA Dataset",
        "",
        "Welcome to TheorIA dataset! This dataset is being built, and it is designed to provide a high quality collection of theoretical physics equations, derivations, and explanations in a structured format. We encourage contributions from researchers, educators, and enthusiasts in the field of theoretical physics. We need your help to expand the dataset with new entries, peer review existing enties, and ensure the high quality of the content.",
        "",
        "To facilitate your contributions, please follow the guidelines below, that explain the structure of each entry in the dataset, as well as its requirements.",
        "",
        "IMPORTANT: this CONTRIBUTING.md file is auotmatically generated based on the `entry.shema.json` file, which holds the source of truth on the requirements for each entry."
        "",
        "## Dataset Entry structure",
        "",
        "Each entry of the dataset should be a self contained relevant physics result. They are expressed in JSON format, and the following fields are required in each entry. All entries should be valid according to the schema defined in `schemas/entry.schema.json`.",
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

    # Footer
    lines.extend([
        "## Version Control & Collaboration",
        "",
        "- We will use Git and GitHub for versioning.",
        "- Submit pull requests for new entries or changes.",
        "- Ensure your JSON files validate against the schema (CI will check this automatically).",
        "",
        "## Example",
        ""
    ])

    # Add hardcoded example reference since we removed x-examples from schema for strict mode compatibility
    lines.append("See `entries/special_relativity.json` for a complete, compliant example.")

    lines.extend([
        "",
        "Happy contributing!",
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
    output_file = project_root / "CONTRIBUTING.md"

    generate_contributing_md(requirements_file, output_file)
