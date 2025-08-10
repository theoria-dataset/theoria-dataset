#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Domain mapping to readable categories
const DOMAIN_CATEGORIES = {
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
};

// Get first two sentences from explanation
function getShortDescription(explanation) {
  if (!explanation) return '';
  
  // Split by sentence endings, take first 2
  const sentences = explanation.match(/[^\.!?]+[\.!?]+/g) || [];
  return sentences.slice(0, 2).join(' ').trim();
}

// Generate entry card HTML
function generateEntryCard(entry, filename) {
  const shortDesc = getShortDescription(entry.explanation);
  const statusClass = entry.review_status === 'reviewed' ? 'status-reviewed' : 'status-draft';
  const statusText = entry.review_status === 'reviewed' ? 'REVIEWED' : 'DRAFT';
  
  return `
    <a href="entries.html?entry=${filename}" class="entry-card-link">
      <div class="entry-card">
        <h3 class="entry-title">${entry.result_name}</h3>
        <p class="entry-description">${shortDesc}</p>
        <span class="entry-status ${statusClass}">${statusText}</span>
      </div>
    </a>
  `;
}

// Generate navigation HTML
function generateNavigation(domainGroups) {
  const navItems = Object.entries(domainGroups)
    .sort(([, a], [, b]) => a.displayName.localeCompare(b.displayName))
    .map(([domain, group]) => {
      const anchor = domain.replace(/[^a-zA-Z0-9]/g, '-');
      return `<a href="#${anchor}" class="nav-link">${group.displayName} (${group.entries.length})</a>`;
    });
  
  return `
    <nav class="domain-navigation">
      <h2>Domains</h2>
      <div class="nav-links">
        ${navItems.join('\n        ')}
      </div>
    </nav>
  `;
}

// Generate domain section HTML
function generateDomainSection(domain, group) {
  const anchor = domain.replace(/[^a-zA-Z0-9]/g, '-');
  const sortedEntries = group.entries.sort((a, b) => a.entry.result_name.localeCompare(b.entry.result_name));
  
  const cardsHtml = sortedEntries
    .map(({entry, filename}) => generateEntryCard(entry, filename))
    .join('\n      ');
  
  return `
    <section id="${anchor}" class="domain-section">
      <h2 class="domain-title">${group.displayName}</h2>
      <div class="entry-grid">
        ${cardsHtml}
      </div>
    </section>
  `;
}

// Main function
function generateIndexPage() {
  const entriesDir = path.join(__dirname, '../entries');
  const docsDir = path.join(__dirname, '../docs');
  
  // Read all entry files
  const entryFiles = fs.readdirSync(entriesDir).filter(file => file.endsWith('.json'));
  
  // Group entries by domain
  const domainGroups = {};
  
  entryFiles.forEach(filename => {
    try {
      const filePath = path.join(entriesDir, filename);
      const entryData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const domain = entryData.domain || 'physics';
      const displayName = DOMAIN_CATEGORIES[domain] || domain;
      
      if (!domainGroups[domain]) {
        domainGroups[domain] = {
          displayName,
          entries: []
        };
      }
      
      domainGroups[domain].entries.push({
        entry: entryData,
        filename: filename
      });
    } catch (error) {
      console.error(`Error processing ${filename}:`, error.message);
    }
  });
  
  // Generate HTML sections
  const navigation = generateNavigation(domainGroups);
  
  const domainSections = Object.entries(domainGroups)
    .sort(([, a], [, b]) => a.displayName.localeCompare(b.displayName))
    .map(([domain, group]) => generateDomainSection(domain, group))
    .join('\n\n    ');
  
  // Read manifest for version info
  let version = 'Unknown';
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));
    version = manifest.dataset_version;
  } catch (error) {
    console.warn('Could not read manifest version:', error.message);
  }
  
  // Generate complete HTML
  const totalEntries = Object.values(domainGroups).reduce((sum, group) => sum + group.entries.length, 0);
  
  const html = `<!DOCTYPE html>
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
      <p class="subtitle">Browse All ${totalEntries} Physics Entries • Version ${version}</p>
      <div class="header-actions">
        <a href="index.html" class="cta-button">← Back to Home</a>
      </div>
    </header>

    ${navigation}

    <main class="entries-browser">
      ${domainSections}
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
      
      function enableDark() {
        htmlEl.classList.add('latex-dark');
        btn.textContent = '☀︎';
        localStorage.setItem('theme', 'dark');
      }
      
      function enableLight() {
        htmlEl.classList.remove('latex-dark');
        btn.textContent = '☾';
        localStorage.setItem('theme', 'light');
      }
      
      // Initialize theme
      (localStorage.getItem('theme') === 'light' ? enableLight : enableDark)();
      btn.addEventListener('click', () => {
        htmlEl.classList.contains('latex-dark') ? enableLight() : enableDark();
      });

      // Smooth scrolling for navigation links
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.querySelector(link.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    </script>
  </body>
</html>`;
  
  // Write the generated HTML
  const outputPath = path.join(docsDir, 'entries_index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`✅ Generated entries_index.html with ${totalEntries} entries across ${Object.keys(domainGroups).length} domains`);
  console.log(`📝 Output written to: ${outputPath}`);
}

// Run the generator
if (require.main === module) {
  generateIndexPage();
}

module.exports = { generateIndexPage };