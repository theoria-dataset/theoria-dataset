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

    # Add AI badge and color-coding for draft entries
    card_class = 'entry-card entry-card-draft' if is_draft else 'entry-card'

    # Only show DRAFT badge, not REVIEWED
    status_html = ''
    if is_draft:
        status_html = '<a href="contribute/" class="entry-status status-draft" title="Click to help review this AI-generated entry">🤖 DRAFT</a>'

    # Add ai-entry class to AI-generated entries
    link_class = 'entry-card-link ai-entry' if is_draft else 'entry-card-link'

    return f'''
    <a href="entries.html?entry={filename}" class="{link_class}">
      <div class="{card_class}">
        <h3 class="entry-title">
          {entry.get('result_name', '')}
        </h3>
        <p class="entry-description">{short_desc}</p>
        {status_html}
      </div>
    </a>
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
    
    # Generate category dropdown links
    category_dropdown_links = []
    for domain, group in sorted(domain_groups.items(), key=lambda x: x[1]['displayName']):
        anchor = re.sub(r'[^a-zA-Z0-9]', '-', domain)
        category_dropdown_links.append(f'<a href="#{anchor}" class="category-dropdown-link">{group["displayName"]}</a>')

    category_dropdown_html = chr(10).join(f'            {link}' for link in category_dropdown_links)

    # Floating nav HTML with refined SVG icons and category dropdown
    floating_nav = f'''
    <!-- Floating Navigation Bar -->
    <nav class="floating-nav">
      <a href="index.html" class="nav-item" data-page="home">
        <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span class="nav-label">Home</span>
      </a>
      <div class="nav-item nav-item-with-dropdown active" data-page="entries">
        <a href="entries_index.html" class="nav-dropdown-trigger">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span class="nav-label">Entries</span>
          <span class="nav-dropdown-indicator"></span>
        </a>
        <div class="category-dropdown">
{category_dropdown_html}
        </div>
      </div>
      <a href="assumptions.html" class="nav-item" data-page="assumptions">
        <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
        </svg>
        <span class="nav-label">Assumptions</span>
      </a>
      <a href="contribute/" class="nav-item" data-page="contribute">
        <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span class="nav-label">Contribute</span>
      </a>
      <a href="https://github.com/theoria-dataset/theoria-dataset" class="nav-item" target="_blank">
        <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span class="nav-label">GitHub</span>
      </a>
    </nav>'''

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
    {floating_nav}

    <header class="main-header">
      <h1>TheorIA Dataset</h1>
      <p class="subtitle">Browse All Physics Entries • Version {version}</p>
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

    <div class="entries-layout">
      <main class="entries-browser hide-ai-entries">
        {domain_sections}
      </main>
    </div>

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
      
      // Subtitle is already set in HTML - no dynamic update needed

      // Scroll spy for category sidebar
      const categoryLinks = document.querySelectorAll('.category-link');
      const domainSections = document.querySelectorAll('.domain-section');

      function updateActiveCategory() {{
        let currentSection = '';
        const scrollPos = window.scrollY + 150; // Offset for header

        domainSections.forEach(section => {{
          if (section.offsetTop <= scrollPos) {{
            currentSection = section.id;
          }}
        }});

        categoryLinks.forEach(link => {{
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${{currentSection}}`) {{
            link.classList.add('active');
          }}
        }});
      }}

      window.addEventListener('scroll', updateActiveCategory);
      updateActiveCategory(); // Initialize on load

      // Smooth scroll for category links
      categoryLinks.forEach(link => {{
        link.addEventListener('click', (e) => {{
          e.preventDefault();
          const target = document.querySelector(link.getAttribute('href'));
          if (target) {{
            target.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
          }}
        }});
      }});
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