#!/usr/bin/env python3
"""
Generate assumptions.html from globals/assumptions.json
Follows the same structure as generate_index.py

Requires: Python 3.11.12 (or compatible)
"""

import json
import os
import re
import sys
from pathlib import Path

# Check Python version compatibility
if sys.version_info < (3, 8):
    print("Error: Python 3.8 or higher is required")
    sys.exit(1)


# Type display names and ordering
TYPE_CATEGORIES = {
    'principle': {'displayName': 'Principles', 'order': 1},
    'empirical': {'displayName': 'Empirical', 'order': 2},
    'approximation': {'displayName': 'Approximations', 'order': 3}
}


def format_math_expression(expr):
    """Format mathematical expression for display with backticks for MathJax"""
    return f'`{expr}`'


def generate_assumption_card(assumption):
    """Generate assumption card HTML reusing entry card structure"""
    assumption_id = assumption.get('id', '')
    title = assumption.get('title', '')
    text = assumption.get('text', '')
    assumption_type = assumption.get('type', 'principle')
    math_expressions = assumption.get('mathematical_expressions', [])
    symbol_definitions = assumption.get('symbol_definitions', [])
    used_in = assumption.get('used_in', [])

    # Type badge styling (reusing entry status badges)
    type_display = assumption_type.upper()
    status_class = f'status-{assumption_type}'

    # Build math expressions section
    math_section = ''
    if math_expressions:
        math_items = '\n            '.join(
            f'<div class="assumption-math">{format_math_expression(expr)}</div>'
            for expr in math_expressions
        )
        math_section = f'''
        <div class="assumption-math-section">
          <h4>Mathematical Form:</h4>
          {math_items}
        </div>'''

    # Build symbol definitions section
    symbols_section = ''
    if symbol_definitions:
        symbol_items = '\n            '.join(
            f'<div class="assumption-symbol-def"><strong>{format_math_expression(sym.get("symbol", ""))}</strong>: {sym.get("definition", "")}</div>'
            for sym in symbol_definitions
        )
        symbols_section = f'''
        <div class="assumption-symbols">
          <h4>Symbols:</h4>
          {symbol_items}
        </div>'''

    # Build "used in" section with links to entries
    used_in_section = ''
    if used_in:
        entry_links = ', '.join(
            f'<a href="entries.html?entry={entry_id}.json">{entry_id.replace("_", " ").title()}</a>'
            for entry_id in used_in
        )
        used_in_section = f'''
        <div class="assumption-usage">
          <strong>Used in:</strong> {entry_links}
        </div>'''

    return f'''
    <div class="entry-card assumption-card assumption-{assumption_type}">
      <h3 class="entry-title">
        {title}
      </h3>
      <p class="entry-description">{text}</p>{math_section}{symbols_section}{used_in_section}
      <span class="entry-status {status_class}">{type_display}</span>
    </div>
  '''


def generate_navigation(type_groups):
    """Generate navigation HTML"""
    nav_items = []
    for assumption_type, group in sorted(type_groups.items(), key=lambda x: x[1]['order']):
        anchor = assumption_type
        nav_items.append(
            f'<a href="#{anchor}" class="nav-link">{group["displayName"]} ({len(group["assumptions"])})</a>'
        )

    return f'''
    <nav class="domain-navigation">
      <h2>Assumption Types</h2>
      <div class="nav-links">
        {chr(10).join(f"        {item}" for item in nav_items)}
      </div>
    </nav>
  '''


def generate_type_section(assumption_type, group):
    """Generate type section HTML"""
    anchor = assumption_type
    sorted_assumptions = sorted(group['assumptions'], key=lambda x: x.get('title', ''))

    cards_html = '\n      '.join(
        generate_assumption_card(assumption)
        for assumption in sorted_assumptions
    )

    return f'''
    <section id="{anchor}" class="domain-section">
      <h2 class="domain-title">{group['displayName']}</h2>
      <div class="entry-grid">
        {cards_html}
      </div>
    </section>
  '''


def get_version_from_changelog(changelog_path):
    """
    Extract the latest version from CHANGELOG.md

    Parses CHANGELOG.md following the Keep a Changelog format
    Returns the first version found in format: ## [X.Y.Z]
    """
    try:
        with open(changelog_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Match version in format: ## [X.Y.Z] - Description - Date
        pattern = r'^##\s+\[(\d+\.\d+\.\d+)\]'
        matches = re.findall(pattern, content, re.MULTILINE)

        if matches:
            return matches[0]  # Return the first (most recent) version
        else:
            raise ValueError("No version found in CHANGELOG.md")

    except FileNotFoundError:
        raise ValueError(f"CHANGELOG.md not found at {changelog_path}")
    except Exception as e:
        raise ValueError(f"Error reading CHANGELOG.md: {e}")


def generate_assumptions_page():
    """Main function to generate the assumptions page"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    assumptions_file = project_root / 'globals' / 'assumptions.json'
    docs_dir = project_root / 'docs'

    # Get version from CHANGELOG.md
    try:
        changelog_path = project_root / 'CHANGELOG.md'
        version = get_version_from_changelog(changelog_path)
        print(f"Using version from CHANGELOG.md: {version}")
    except ValueError as error:
        print(f"Warning: Could not parse version from CHANGELOG.md: {error}")
        version = 'Unknown'

    # Read assumptions file
    try:
        with open(assumptions_file, 'r', encoding='utf-8') as f:
            assumptions_data = json.load(f)
    except Exception as error:
        print(f"Error reading assumptions.json: {error}")
        sys.exit(1)

    assumptions = assumptions_data.get('assumptions', [])

    # Group assumptions by type and sort by type order
    type_groups = {}
    for assumption in assumptions:
        assumption_type = assumption.get('type', 'principle')

        if assumption_type not in type_groups:
            type_info = TYPE_CATEGORIES.get(assumption_type, {
                'displayName': assumption_type.title(),
                'order': 999
            })
            type_groups[assumption_type] = {
                'displayName': type_info['displayName'],
                'order': type_info['order'],
                'assumptions': []
            }

        type_groups[assumption_type]['assumptions'].append(assumption)

    # Generate HTML sections
    navigation = generate_navigation(type_groups)

    type_sections = '\n\n    '.join(
        generate_type_section(assumption_type, group)
        for assumption_type, group in sorted(type_groups.items(), key=lambda x: x[1]['order'])
    )

    # Generate complete HTML
    total_assumptions = len(assumptions)

    # Count by type
    type_counts = {
        assumption_type: len(group['assumptions'])
        for assumption_type, group in type_groups.items()
    }

    html = f'''<!DOCTYPE html>
<html lang="en" class="text-justify latex-dark">
  <head>
    <meta charset="utf-8" />
    <title>TheorIA — Browse All Assumptions</title>
    <!-- LaTeX.css dark theme -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/latex.css@1.8.0/style.min.css"
    />
    <!-- MathJax for AsciiMath -->
    <script>
      window.MathJax = {{
        loader: {{ load: ["input/asciimath", "output/chtml"] }},
        asciimath: {{ delimiters: [["`", "`"]] }},
      }};
    </script>
    <script
      src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/startup.js"
      async
    ></script>
    <!-- External CSS -->
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <button id="themeToggle" aria-label="Toggle theme">☀︎</button>

    <header class="main-header">
      <h1>TheorIA Dataset</h1>
      <p class="subtitle">Browse All {total_assumptions} Assumptions • Version {version}</p>
      <div class="header-actions">
        <a href="index.html" class="cta-button">← Back to Home</a>
        <a href="entries_index.html" class="cta-button">Browse Entries</a>
      </div>
    </header>

    <section style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
      <h2>About Assumptions</h2>
      <p>
        Every physics derivation rests on a foundation of assumptions. The TheorIA dataset maintains a <strong>centralized database of assumptions</strong> that are referenced across all entries, ensuring consistent terminology and clear logical dependencies.
      </p>
      <p>
        Assumptions are categorized into three types:
      </p>
      <ul>
        <li><strong>Principles</strong>: Core theoretical and mathematical postulates that form the foundation of physical theories (e.g., conservation laws, variational principles)</li>
        <li><strong>Empirical</strong>: Experimentally established facts and measured constants validated by observation (e.g., speed of light, Coulomb's law)</li>
        <li><strong>Approximations</strong>: Validity restrictions and simplifying modeling choices that define the regime of applicability (e.g., nonrelativistic regime, point mass approximation)</li>
      </ul>
      <p>
        Each assumption can be referenced by multiple entries, and clicking on the "Used in" links shows which physics results depend on that particular assumption.
      </p>
    </section>

    {navigation}

    <main class="entries-browser">
      {type_sections}
    </main>

    <footer class="main-footer">
      <p>
        <strong>License:</strong>
        <a href="https://creativecommons.org/licenses/by/4.0/deed.en"
           target="_blank" rel="noopener">CC-BY 4.0</a>
      </p>
      <p>
        Want to contribute? Check our
        <a href="https://github.com/theoria-dataset/theoria-dataset/blob/main/CONTRIBUTING.md"
           target="_blank" rel="noopener">contribution guidelines</a>
      </p>
    </footer>

    <script>
      // Dark mode toggle (same as entries_index.html)
      const btn = document.getElementById('themeToggle');
      const htmlEl = document.documentElement;

      function enableDark() {{
        htmlEl.classList.add('latex-dark');
        btn.textContent = '☀︎';
        localStorage.setItem('theme', 'dark');
      }}

      function enableLight() {{
        htmlEl.classList.remove('latex-dark');
        btn.textContent = '☾';
        localStorage.setItem('theme', 'light');
      }}

      // Initialize theme
      (localStorage.getItem('theme') === 'light' ? enableLight : enableDark)();
      btn.addEventListener('click', () => {{
        htmlEl.classList.contains('latex-dark') ? enableLight() : enableDark();
      }});

      // Smooth scrolling for navigation links
      document.querySelectorAll('.nav-link').forEach(link => {{
        link.addEventListener('click', (e) => {{
          e.preventDefault();
          const target = document.querySelector(link.getAttribute('href'));
          if (target) {{
            target.scrollIntoView({{ behavior: 'smooth' }});
          }}
        }});
      }});
    </script>
  </body>
</html>'''

    # Write the generated HTML
    output_path = docs_dir / 'assumptions.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Generated assumptions.html with {total_assumptions} assumptions across {len(type_groups)} types")
    print(f"Output written to: {output_path}")


if __name__ == "__main__":
    generate_assumptions_page()
