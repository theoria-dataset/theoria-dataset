// Entry modification system
class ModificationSystem {
    constructor() {
        this.entries = [];
        this.selectedEntry = null;
        this.init();
    }

    async init() {
        await this.loadEntries();
        this.setupEventListeners();
        this.displayEntries();
    }

    async loadEntries() {
        try {
            // Load index to get list of entries
            const indexResponse = await fetch('../index.json');
            const index = await indexResponse.json();
            
            // Load a few sample entries for demonstration
            const sampleEntries = index.slice(0, 10);
            
            for (const entryId of sampleEntries) {
                try {
                    const response = await fetch(`../../entries/${entryId}.json`);
                    const entry = await response.json();
                    this.entries.push(entry);
                } catch (error) {
                    console.warn(`Could not load entry ${entryId}:`, error);
                }
            }
        } catch (error) {
            console.error('Could not load entries:', error);
            // Fallback to common entries
            this.entries = [
                { result_id: 'schroedingen_equation', result_name: 'Schrödinger Equation', domain: 'quant-ph' },
                { result_id: 'maxwell_equations', result_name: 'Maxwell Equations', domain: 'physics.class-ph' },
                { result_id: 'einstein_field_equations', result_name: 'Einstein Field Equations', domain: 'gr-qc' },
                { result_id: 'dirac_equation_free', result_name: 'Dirac Equation (Free Particle)', domain: 'quant-ph' },
                { result_id: 'lagrangian_mechanics', result_name: 'Lagrangian Mechanics', domain: 'physics.class-ph' }
            ];
        }
    }

    setupEventListeners() {
        // Math preview for suggested changes
        document.getElementById('suggested-change').addEventListener('input', (e) => {
            const preview = document.getElementById('change-preview');
            const text = e.target.value;
            
            // Extract math expressions (text between backticks)
            const mathRegex = /`([^`]+)`/g;
            let previewHTML = text;
            
            previewHTML = previewHTML.replace(mathRegex, (match, math) => {
                return `<span class="math-inline">\`${math}\`</span>`;
            });
            
            preview.innerHTML = previewHTML;
            
            if (window.MathJax) {
                MathJax.typesetPromise([preview]);
            }
        });
    }

    displayEntries() {
        const entryList = document.getElementById('entry-list');
        entryList.innerHTML = '';

        this.entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry-item';
            entryDiv.innerHTML = `
                <div class="entry-header">
                    <h4>${entry.result_name}</h4>
                    <span class="entry-domain">${entry.domain}</span>
                </div>
                <div class="entry-id">ID: ${entry.result_id}</div>
                <button class="btn btn-sm btn-primary" onclick="window.modificationSystem.selectEntry('${entry.result_id}')">
                    Select for Modification
                </button>
            `;
            entryList.appendChild(entryDiv);
        });
    }

    selectEntry(entryId) {
        this.selectedEntry = this.entries.find(e => e.result_id === entryId);
        if (this.selectedEntry) {
            document.getElementById('selected-entry-name').textContent = this.selectedEntry.result_name;
            document.getElementById('modification-form').style.display = 'block';
            this.displayCurrentEntry();
            
            // Scroll to form
            document.getElementById('modification-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    async displayCurrentEntry() {
        const display = document.getElementById('current-entry-display');
        const content = document.getElementById('entry-content');
        
        try {
            // Try to load the full entry
            const response = await fetch(`../../entries/${this.selectedEntry.result_id}.json`);
            const fullEntry = await response.json();
            
            content.innerHTML = `
                <div class="entry-section">
                    <h4>Explanation</h4>
                    <p>${fullEntry.explanation}</p>
                </div>
                
                <div class="entry-section">
                    <h4>Main Equations</h4>
                    ${fullEntry.result_equations.map(eq => `
                        <div class="equation-display">
                            <strong>${eq.id}:</strong> \`${eq.equation}\`
                        </div>
                    `).join('')}
                </div>
                
                <div class="entry-section">
                    <h4>Definitions</h4>
                    ${fullEntry.definitions.map(def => `
                        <div class="definition-display">
                            <strong>${def.symbol}:</strong> ${def.definition}
                        </div>
                    `).join('')}
                </div>
                
                ${fullEntry.references ? `
                <div class="entry-section">
                    <h4>References</h4>
                    ${fullEntry.references.map(ref => `
                        <div class="reference-display">${ref.citation}</div>
                    `).join('')}
                </div>
                ` : ''}
            `;
            
            display.style.display = 'block';
            
            if (window.MathJax) {
                MathJax.typesetPromise([content]);
            }
        } catch (error) {
            content.innerHTML = `
                <div class="entry-section">
                    <h4>Entry: ${this.selectedEntry.result_name}</h4>
                    <p><em>Full entry content could not be loaded. Please refer to the 
                    <a href="../../entries/${this.selectedEntry.result_id}.json" target="_blank">JSON file</a> 
                    for current content.</em></p>
                </div>
            `;
            display.style.display = 'block';
        }
    }

    submitModification() {
        const form = document.getElementById('modifyForm');
        const formData = new FormData(form);
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Check required checkboxes
        const checkboxes = ['reviewed-entry', 'established-knowledge', 'can-provide-refs'];
        const allChecked = checkboxes.every(id => document.getElementById(id).checked);
        
        if (!allChecked) {
            alert('Please confirm all the requirements by checking the boxes.');
            return;
        }
        
        // Create GitHub issue
        this.createModificationIssue();
    }

    createModificationIssue() {
        const issueBody = this.formatModificationIssue();
        const issueTitle = `[MODIFY] ${this.selectedEntry.result_name}`;
        const issueUrl = `https://github.com/theoria-dataset/theoria-dataset/issues/new?title=${encodeURIComponent(issueTitle)}&labels=modification,contribution&body=${encodeURIComponent(issueBody)}`;
        
        window.open(issueUrl, '_blank');
        
        // Show success message
        alert('Opening GitHub issue form with your modification suggestion. Thank you for contributing!');
    }

    formatModificationIssue() {
        return `**Entry to Modify:** ${this.selectedEntry.result_id}

**Modification Type:** ${document.getElementById('modification-type').value}

**Current Issue:**
${document.getElementById('current-issue').value}

**Suggested Change:**
${document.getElementById('suggested-change').value}

**Justification:**
${document.getElementById('justification').value}

**Contributor Expertise:** ${document.getElementById('your-expertise').value}

**Contributor Name:** ${document.getElementById('contributor-name').value}

---
*Submitted via TheorIA modification system*`;
    }
}

// Utility functions
function filterEntries() {
    const searchTerm = document.getElementById('entry-search').value.toLowerCase();
    const entryItems = document.querySelectorAll('.entry-item');
    
    entryItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function cancelModification() {
    document.getElementById('modification-form').style.display = 'none';
    document.getElementById('current-entry-display').style.display = 'none';
    document.getElementById('modifyForm').reset();
}

function submitModification() {
    if (window.modificationSystem) {
        window.modificationSystem.submitModification();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.modificationSystem = new ModificationSystem();
});