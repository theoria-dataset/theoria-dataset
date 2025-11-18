#!/usr/bin/env python3
"""
Generate entries_index.html from all entries in the dataset
Converts from Node.js to Python implementation

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


# Domain mapping to readable categories  
DOMAIN_CATEGORIES = {
    'physics.class-ph': 'Classical Physics',
    'physics': 'General Physics', 
    'physics.flu-dyn': 'Fluid Dynamics',
    'physics.atom-ph': 'Atomic Physics',
    'physics.cond-mat': 'Condensed Matter Physics',
    'physics.optics': 'Optics',
    'quant-ph': 'Quantum Physics',
    'cond-mat': 'Condensed Matter Physics',
    'cond-mat.stat-mech': 'Statistical Mechanics',
    'cond-mat.mes-hall': 'Mesoscale and Nanoscale Physics',
    'cond-mat.mtrl-sci': 'Materials Science',
    'hep-th': 'High Energy Physics (Theory)',
    'hep-ph': 'High Energy Physics (Phenomenology)',
    'hep-ex': 'High Energy Physics (Experiment)',
    'hep-lat': 'High Energy Physics (Lattice)',
    'nucl-th': 'Nuclear Theory',
    'astro-ph': 'Astrophysics',
    'gr-qc': 'General Relativity and Quantum Cosmology',
    'math-ph': 'Mathematical Physics'
}


def get_short_description(explanation):
    """Get first two sentences from explanation"""
    if not explanation:
        return ''
    
    # Split by sentence endings, take first 2
    sentences = re.findall(r'[^.!?]+[.!?]+', explanation)
    return ' '.join(sentences[:2]).strip()


def generate_entry_card(entry, filename):
    """Generate entry card HTML"""
    short_desc = get_short_description(entry.get('explanation', ''))
    is_draft = entry.get('review_status') != 'reviewed'
    status_class = 'status-reviewed' if entry.get('review_status') == 'reviewed' else 'status-draft'
    status_text = 'REVIEWED' if entry.get('review_status') == 'reviewed' else 'DRAFT'
    
    # Add AI badge and color-coding for draft entries
    card_class = 'entry-card entry-card-draft' if is_draft else 'entry-card'
    status_text_with_emoji = f'🤖 {status_text}' if is_draft else status_text
    status_link = f'<a href="contribute/" class="entry-status {status_class}" title="Click to help review this AI-generated entry">{status_text_with_emoji}</a>' if is_draft else f'<span class="entry-status {status_class}">{status_text_with_emoji}</span>'
    
    # Add ai-entry class to AI-generated entries
    link_class = 'entry-card-link ai-entry' if is_draft else 'entry-card-link'
    
    return f'''
    <a href="entries.html?entry={filename}" class="{link_class}">
      <div class="{card_class}">
        <h3 class="entry-title">
          {entry.get('result_name', '')}
        </h3>
        <p class="entry-description">{short_desc}</p>
        {status_link}
      </div>
    </a>
  '''


def generate_navigation(domain_groups):
    """Generate navigation HTML"""
    nav_items = []
    for domain, group in sorted(domain_groups.items(), key=lambda x: x[1]['displayName']):
        anchor = re.sub(r'[^a-zA-Z0-9]', '-', domain)
        nav_items.append(f'<a href="#{anchor}" class="nav-link">{group["displayName"]} ({len(group["entries"])})</a>')
    
    return f'''
    <nav class="domain-navigation">
      <h2>Domains</h2>
      <div class="nav-links">
        {chr(10).join(f"        {item}" for item in nav_items)}
      </div>
    </nav>
  '''


def generate_domain_section(domain, group):
    """Generate domain section HTML"""
    anchor = re.sub(r'[^a-zA-Z0-9]', '-', domain)
    sorted_entries = sorted(group['entries'], key=lambda x: x['entry'].get('result_name', ''))
    
    cards_html = '\n      '.join(
        generate_entry_card(item['entry'], item['filename'])
        for item in sorted_entries
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


def sync_manifest_version(project_root, version):
    """Update manifest.json with the version from CHANGELOG"""
    manifest_path = project_root / 'manifest.json'

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)

        old_version = manifest.get('dataset_version', 'Unknown')

        if old_version != version:
            manifest['dataset_version'] = version
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
                f.write('\n')  # Add trailing newline
            print(f"Updated manifest.json version: {old_version} → {version}")
        else:
            print(f"Manifest version already up to date: {version}")

    except Exception as error:
        print(f"Warning: Could not update manifest.json: {error}")


def generate_index_page():
    """Main function to generate the index page"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    entries_dir = project_root / 'entries'
    docs_dir = project_root / 'docs'

    # Get version from CHANGELOG.md (single source of truth)
    try:
        changelog_path = project_root / 'CHANGELOG.md'
        version = get_version_from_changelog(changelog_path)
        print(f"Using version from CHANGELOG.md: {version}")

        # Sync manifest.json with CHANGELOG version
        sync_manifest_version(project_root, version)
    except ValueError as error:
        print(f"Warning: Could not parse version from CHANGELOG.md: {error}")
        version = 'Unknown'

    # Read all entry files
    entry_files = [f for f in entries_dir.glob('*.json')]

    # Group entries by domain
    domain_groups = {}

    for entry_file in entry_files:
        try:
            with open(entry_file, 'r', encoding='utf-8') as f:
                entry_data = json.load(f)

            domain = entry_data.get('domain', 'physics')
            display_name = DOMAIN_CATEGORIES.get(domain, domain)

            if domain not in domain_groups:
                domain_groups[domain] = {
                    'displayName': display_name,
                    'entries': []
                }

            domain_groups[domain]['entries'].append({
                'entry': entry_data,
                'filename': entry_file.name
            })
        except Exception as error:
            print(f"Error processing {entry_file.name}: {error}")

    # Generate HTML sections
    navigation = generate_navigation(domain_groups)

    domain_sections = '\n\n    '.join(
        generate_domain_section(domain, group)
        for domain, group in sorted(domain_groups.items(), key=lambda x: x[1]['displayName'])
    )
    
    # Generate complete HTML
    total_entries = sum(len(group['entries']) for group in domain_groups.values())
    
    # Count reviewed vs AI entries
    reviewed_count = 0
    ai_count = 0
    for group in domain_groups.values():
        for item in group['entries']:
            if item['entry'].get('review_status') == 'reviewed':
                reviewed_count += 1
            else:
                ai_count += 1
    
    html = f'''<!DOCTYPE html>
<html lang="en" class="text-justify latex-dark">
  <head>
    <meta charset="utf-8" />
    <title>TheorIA — Browse All Entries</title>
    <!-- LaTeX.css dark theme -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/latex.css@1.8.0/style.min.css"
    />
    <!-- External CSS -->
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <button id="themeToggle" aria-label="Toggle theme">☀︎</button>
    
    <header class="main-header">
      <h1>TheorIA Dataset</h1>
      <p class="subtitle">Browse All {total_entries} Physics Entries ({reviewed_count} Reviewed, {ai_count} AI-Generated) • Version {version}</p>
      <div class="header-actions">
        <a href="index.html" class="cta-button">← Back to Home</a>
      </div>
    </header>

    <div class="ai-toggle-container">
      <div class="ai-toggle-wrapper">
        <label for="aiToggle" class="ai-toggle-label">
          <input type="checkbox" id="aiToggle" class="ai-toggle-checkbox">
          <span class="ai-toggle-slider"></span>
          <span class="ai-toggle-text">Show AI-generated entries</span>
        </label>
        <div class="entry-count-display">
          <span id="entryCountText">Showing reviewed entries only</span>
        </div>
      </div>
    </div>

    {navigation}

    <main class="entries-browser hide-ai-entries">
      {domain_sections}
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
      // Dark mode toggle (same as entries.html)
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

      // AI Toggle functionality
      const aiToggle = document.getElementById('aiToggle');
      const entryCountText = document.getElementById('entryCountText');
      const mainContainer = document.querySelector('main');
      
      // Count entries
      function countEntries() {{
        const totalEntries = document.querySelectorAll('.entry-card').length;
        const aiEntries = document.querySelectorAll('.entry-card-draft').length;
        const reviewedEntries = totalEntries - aiEntries;
        
        return {{ total: totalEntries, ai: aiEntries, reviewed: reviewedEntries }};
      }}
      
      // Update entry count display and navigation
      function updateDisplay(showAI) {{
        const counts = countEntries();
        
        if (showAI) {{
          mainContainer.classList.remove('hide-ai-entries');
          entryCountText.textContent = `Showing all ${{counts.total}} entries (${{counts.reviewed}} reviewed, ${{counts.ai}} AI-generated)`;
          updateNavigation(false); // Show original counts
        }} else {{
          mainContainer.classList.add('hide-ai-entries');
          entryCountText.textContent = `Showing ${{counts.reviewed}} reviewed entries only`;
          updateNavigation(true); // Show reduced counts
        }}
      }}
      
      // Update navigation counts and hide empty sections
      function updateNavigation(hideAI) {{
        document.querySelectorAll('.nav-link').forEach(link => {{
          const targetId = link.getAttribute('href').substring(1);
          const section = document.getElementById(targetId);
          
          if (section) {{
            const totalCards = section.querySelectorAll('.entry-card').length;
            const aiCards = section.querySelectorAll('.entry-card-draft').length;
            const visibleCount = hideAI ? (totalCards - aiCards) : totalCards;
            
            // Extract domain name from current text
            const currentText = link.textContent;
            const domainName = currentText.replace(/\\s*\\(\\d+\\)$/, '');
            
            // Update the count
            link.textContent = `${{domainName}} (${{visibleCount}})`;
            
            // Hide/show navigation links and entire domain sections
            if (visibleCount === 0) {{
              link.style.display = 'none';
              section.style.display = 'none'; // Hide the entire domain section
            }} else {{
              link.style.display = 'inline-block';
              section.style.display = 'block'; // Show the domain section
            }}
          }}
        }});
      }}
      
      // Initialize state from localStorage or default to hiding AI entries
      const showAIEntries = localStorage.getItem('showAIEntries') === 'true';
      aiToggle.checked = showAIEntries;
      updateDisplay(showAIEntries);
      
      // Handle toggle changes
      aiToggle.addEventListener('change', () => {{
        const showAI = aiToggle.checked;
        localStorage.setItem('showAIEntries', showAI.toString());
        updateDisplay(showAI);
      }});
      
      // Update subtitle with dynamic count
      const subtitle = document.querySelector('.subtitle');
      const counts = countEntries();
      subtitle.textContent = `Browse All ${{counts.total}} Physics Entries (${{counts.reviewed}} Reviewed, ${{counts.ai}} AI-Generated) • Version {version}`;
    </script>
  </body>
</html>'''
    
    # Write the generated HTML
    output_path = docs_dir / 'entries_index.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"Generated entries_index.html with {total_entries} entries across {len(domain_groups)} domains")
    print(f"Output written to: {output_path}")


if __name__ == "__main__":
    generate_index_page()