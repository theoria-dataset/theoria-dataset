// Entry Editor System
class EntryEditor {
    constructor() {
        this.originalEntry = null;
        this.currentEntry = null;
        this.entryId = null;
        this.init();
    }

    async init() {
        // Get entry ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.entryId = urlParams.get('entry');
        
        if (!this.entryId) {
            this.showError('No entry specified. Please access this page through an entry link.');
            return;
        }
        
        await this.loadEntry();
        this.setupEventListeners();
    }

    async loadEntry() {
        try {
            document.getElementById('loading-message').innerHTML = '<p>Loading entry data...</p>';
            
            // Load the entry JSON
            const response = await fetch(`../../entries/${this.entryId}.json`);
            
            if (!response.ok) {
                throw new Error(`Entry not found: ${this.entryId} (HTTP ${response.status})`);
            }
            
            this.originalEntry = await response.json();
            this.currentEntry = JSON.parse(JSON.stringify(this.originalEntry)); // Deep copy
            
            // Update UI
            document.getElementById('entry-title').textContent = this.originalEntry.result_name;
            document.getElementById('loading-message').style.display = 'none';
            document.getElementById('entry-editor').style.display = 'block';
            
            // Populate JSON editor
            this.populateJSONEditor();
            
        } catch (error) {
            console.error('Error loading entry:', error);
            this.showError(`Failed to load entry: ${error.message}`);
        }
    }


    populateJSONEditor() {
        document.getElementById('json-editor').value = JSON.stringify(this.currentEntry, null, 2);
    }

    // Helper function to safely call MathJax
    safeTypesetMathJax(elements) {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            return MathJax.typesetPromise(elements).catch(error => {
                console.warn('MathJax typesetting failed:', error);
            });
        } else {
            console.warn('MathJax not available for typesetting');
            return Promise.resolve();
        }
    }

    setupEventListeners() {
        // Sync between visual and JSON editors
        document.getElementById('visual-form').addEventListener('change', () => {
            this.updateFromVisualEditor();
        });

        document.getElementById('json-editor').addEventListener('input', () => {
            this.updateFromJSONEditor();
        });
    }

    updateFromVisualEditor() {
        // Update current entry from visual form
        this.currentEntry.result_name = document.getElementById('v-result-name').value;
        this.currentEntry.explanation = document.getElementById('v-explanation').value;
        
        // Update equations
        const equations = [];
        document.querySelectorAll('.equation-editor-item').forEach(item => {
            const id = item.querySelector('.eq-id').value;
            const equation = item.querySelector('.eq-equation').value;
            if (id && equation) {
                equations.push({ id, equation });
            }
        });
        this.currentEntry.result_equations = equations;
        
        // Update definitions
        const definitions = [];
        document.querySelectorAll('.definition-editor-item').forEach(item => {
            const symbol = item.querySelector('.def-symbol').value;
            const definition = item.querySelector('.def-definition').value;
            if (symbol && definition) {
                definitions.push({ symbol, definition });
            }
        });
        this.currentEntry.definitions = definitions;
        
        // Update references
        const references = [];
        document.querySelectorAll('.reference-editor-item').forEach((item, index) => {
            const citation = item.querySelector('.ref-citation').value;
            if (citation) {
                references.push({ 
                    id: `R${index + 1}`,
                    citation 
                });
            }
        });
        this.currentEntry.references = references;
        
        // Update JSON editor
        document.getElementById('json-editor').value = JSON.stringify(this.currentEntry, null, 2);
    }

    updateFromJSONEditor() {
        try {
            const jsonText = document.getElementById('json-editor').value;
            this.currentEntry = JSON.parse(jsonText);
            
            // Update visual editor
            this.populateVisualEditor();
            
            // Clear any previous validation errors
            document.getElementById('json-validation-result').innerHTML = '';
        } catch (error) {
            // JSON is invalid, but don't update - let user fix it
            console.warn('Invalid JSON:', error);
        }
    }

    validateJSON() {
        try {
            const jsonText = document.getElementById('json-editor').value;
            const parsed = JSON.parse(jsonText);
            
            document.getElementById('json-validation-result').innerHTML = 
                '<div class="validation-success">✓ Valid JSON</div>';
            
            this.currentEntry = parsed;
            this.populateVisualEditor();
        } catch (error) {
            document.getElementById('json-validation-result').innerHTML = 
                `<div class="validation-error">✗ Invalid JSON: ${error.message}</div>`;
        }
    }

    previewChanges() {
        this.updateFromVisualEditor();
        
        const preview = document.getElementById('preview-content');
        preview.innerHTML = `
            <div class="preview-section">
                <h3>${this.currentEntry.result_name}</h3>
                <p><strong>ID:</strong> ${this.currentEntry.result_id}</p>
                
                <h4>Explanation:</h4>
                <p>${this.currentEntry.explanation}</p>
                
                <h4>Equations:</h4>
                ${this.currentEntry.result_equations?.map(eq => 
                    `<div><strong>${eq.id}:</strong> \`${eq.equation}\`</div>`
                ).join('') || '<p>No equations</p>'}
                
                <h4>Definitions:</h4>
                ${this.currentEntry.definitions?.map(def => 
                    `<div><strong>${def.symbol}:</strong> ${def.definition}</div>`
                ).join('') || '<p>No definitions</p>'}
                
                <h4>References:</h4>
                ${this.currentEntry.references?.map(ref => 
                    `<div>${ref.citation}</div>`
                ).join('') || '<p>No references</p>'}
            </div>
        `;
        
        document.getElementById('preview-modal').style.display = 'flex';
        
        this.safeTypesetMathJax([preview]);
    }

    submitChanges() {
        // Validate required fields
        const summary = document.getElementById('change-summary').value.trim();
        const reason = document.getElementById('change-reason').value.trim();
        const contributor = document.getElementById('contributor-info').value.trim();
        
        if (!summary || !reason || !contributor) {
            alert('Please fill in all required fields in the Change Summary section.');
            return;
        }
        
        this.updateFromVisualEditor();
        this.createGitHubIssue();
    }

    createGitHubIssue() {
        const issueTitle = `[MODIFY] ${this.currentEntry.result_name}`;
        const issueBody = this.formatIssueBody();
        
        const githubUrl = `https://github.com/theoria-dataset/theoria-dataset/issues/new?title=${encodeURIComponent(issueTitle)}&labels=modification,entry-edit&body=${encodeURIComponent(issueBody)}`;
        
        // Open in new tab
        window.open(githubUrl, '_blank');
        
        // Show success message
        alert('Opening GitHub issue with your changes. Thank you for contributing!');
    }

    formatIssueBody() {
        const changes = this.getChanges();
        
        return `## Entry Modification Request

**Entry ID:** ${this.entryId}
**Entry Name:** ${this.currentEntry.result_name}

## Change Summary
${document.getElementById('change-summary').value}

## Reason for Changes
${document.getElementById('change-reason').value}

## Modified Content

\`\`\`json
${JSON.stringify(this.currentEntry, null, 2)}
\`\`\`

## Changes Made
${changes}

**Contributor:** ${document.getElementById('contributor-info').value}

---
*Submitted via TheorIA entry editor*`;
    }

    getChanges() {
        const changes = [];
        
        // Compare with original
        if (this.originalEntry.result_name !== this.currentEntry.result_name) {
            changes.push(`- **Name changed:** "${this.originalEntry.result_name}" → "${this.currentEntry.result_name}"`);
        }
        
        if (this.originalEntry.explanation !== this.currentEntry.explanation) {
            changes.push(`- **Explanation modified**`);
        }
        
        if (JSON.stringify(this.originalEntry.result_equations) !== JSON.stringify(this.currentEntry.result_equations)) {
            changes.push(`- **Equations modified**`);
        }
        
        if (JSON.stringify(this.originalEntry.definitions) !== JSON.stringify(this.currentEntry.definitions)) {
            changes.push(`- **Definitions modified**`);
        }
        
        if (JSON.stringify(this.originalEntry.references) !== JSON.stringify(this.currentEntry.references)) {
            changes.push(`- **References modified**`);
        }
        
        return changes.length > 0 ? changes.join('\n') : '- Various modifications made';
    }

    resetForm() {
        if (confirm('Are you sure you want to reset all changes?')) {
            this.currentEntry = JSON.parse(JSON.stringify(this.originalEntry));
            this.populateVisualEditor();
            this.populateJSONEditor();
            document.getElementById('change-summary').value = '';
            document.getElementById('change-reason').value = '';
            document.getElementById('contributor-info').value = '';
        }
    }

    showError(message) {
        document.getElementById('loading-message').innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
                <a href="../" class="btn btn-primary">← Back to Contribute</a>
            </div>
        `;
    }
}

// Tab management
function showTab(tabName, clickedButton) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the correct button
    const targetButton = Array.from(document.querySelectorAll('.tab-button')).find(btn => 
        btn.textContent.includes(tabName === 'visual' ? 'Visual' : 'JSON')
    );
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
        console.log('Activated tab:', targetTab.id);
    } else {
        console.error('Tab not found:', `${tabName}-tab`);
    }
    
    // Sync data when switching tabs
    if (window.entryEditor) {
        if (tabName === 'json') {
            window.entryEditor.updateFromVisualEditor();
        } else if (tabName === 'visual') {
            window.entryEditor.updateFromJSONEditor();
        }
    }
}

// Global functions
function addEquationEditor() {
    if (window.entryEditor) {
        window.entryEditor.addEquationEditor();
    }
}

function addDefinitionEditor() {
    if (window.entryEditor) {
        window.entryEditor.addDefinitionEditor();
    }
}

function addReferenceEditor() {
    if (window.entryEditor) {
        window.entryEditor.addReferenceEditor();
    }
}

function validateJSON() {
    if (window.entryEditor) {
        window.entryEditor.validateJSON();
    }
}

function previewChanges() {
    if (window.entryEditor) {
        window.entryEditor.previewChanges();
    }
}

function submitChanges() {
    if (window.entryEditor) {
        window.entryEditor.submitChanges();
    }
}

function resetForm() {
    if (window.entryEditor) {
        window.entryEditor.resetForm();
    }
}

function closePreview() {
    document.getElementById('preview-modal').style.display = 'none';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for MathJax to load
    setTimeout(() => {
        window.entryEditor = new EntryEditor();
    }, 500);
});