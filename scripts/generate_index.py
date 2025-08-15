#!/usr/bin/env python3
"""
Generate entries_index.html from all entries in the dataset
Converts from Node.js to Python implementation
"""

import json
import os
import re
from pathlib import Path


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
    status_class = 'status-reviewed' if entry.get('review_status') == 'reviewed' else 'status-draft'
    status_text = 'REVIEWED' if entry.get('review_status') == 'reviewed' else 'DRAFT'
    
    return f'''
    <a href="entries.html?entry={filename}" class="entry-card-link">
      <div class="entry-card">
        <h3 class="entry-title">{entry.get('result_name', '')}</h3>
        <p class="entry-description">{short_desc}</p>
        <span class="entry-status {status_class}">{status_text}</span>
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


def generate_index_page():
    """Main function to generate the index page"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    entries_dir = project_root / 'entries'
    docs_dir = project_root / 'docs'
    
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
    
    # Read manifest for version info
    version = 'Unknown'
    try:
        with open(project_root / 'manifest.json', 'r', encoding='utf-8') as f:
            manifest = json.load(f)
            version = manifest.get('dataset_version', 'Unknown')
    except Exception as error:
        print(f"Could not read manifest version: {error}")
    
    # Generate complete HTML
    total_entries = sum(len(group['entries']) for group in domain_groups.values())
    
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
      <p class="subtitle">Browse All {total_entries} Physics Entries • Version {version}</p>
      <div class="header-actions">
        <a href="index.html" class="cta-button">← Back to Home</a>
      </div>
    </header>

    {navigation}

    <main class="entries-browser">
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