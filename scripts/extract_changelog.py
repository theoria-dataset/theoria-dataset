#!/usr/bin/env python3
"""
Extract changelog section for a specific version from CHANGELOG.md
Usage: python extract_changelog.py <version>
Example: python extract_changelog.py 0.5.0
"""

import sys
import re


def extract_changelog_for_version(version, changelog_path='CHANGELOG.md'):
    """
    Extract the changelog section for a specific version.

    Args:
        version: Version number (e.g., "0.5.0")
        changelog_path: Path to CHANGELOG.md file

    Returns:
        String containing the changelog section for the version
    """
    try:
        with open(changelog_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        return f"Error: {changelog_path} not found"

    # Pattern to match version headers like ## [0.5.0] - ... or ## [0.5.0] ...
    # Need to match [version] at the start of the heading
    version_pattern = f"## [{version}]"

    # Find the start of this version's section
    lines = content.split('\n')
    start_idx = None
    end_idx = None

    for i, line in enumerate(lines):
        # Check if this line contains our version at the start
        if line.startswith(version_pattern):
            start_idx = i
            # Look for the next version header (starts with ## [)
            for j in range(i + 1, len(lines)):
                if lines[j].startswith('## ['):
                    end_idx = j
                    break
            break

    if start_idx is None:
        return f"Error: Version {version} not found in CHANGELOG.md"

    # Extract the section (excluding the version header itself)
    if end_idx is None:
        # This is the last/latest version, include everything until the end
        section_lines = lines[start_idx + 1:]
    else:
        section_lines = lines[start_idx + 1:end_idx]

    # Remove leading/trailing empty lines
    while section_lines and not section_lines[0].strip():
        section_lines.pop(0)
    while section_lines and not section_lines[-1].strip():
        section_lines.pop()

    changelog_section = '\n'.join(section_lines)

    # Add a header for the release notes
    release_notes = f"# Release {version}\n\n{changelog_section}"

    return release_notes


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python extract_changelog.py <version>", file=sys.stderr)
        print("Example: python extract_changelog.py 0.5.0", file=sys.stderr)
        sys.exit(1)

    version = sys.argv[1]
    result = extract_changelog_for_version(version)
    print(result)
