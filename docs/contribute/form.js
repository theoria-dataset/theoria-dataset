// New Entry Form - Dynamic Sections Manager
class NewEntryForm {
    constructor() {
        this.formData = {};
        this.counters = {
            equations: 0,
            equations_assumptions: 0,
            definitions: 0,
            derivation: 0,
            derivation_assumptions: 0,
            derivation_explanation: 0,
            references: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Initialize with one of each dynamic item
        this.addEquation();
        this.addDefinition();
        this.addReference();
    }

    setupEventListeners() {
        // Auto-generate ID from name
        document.getElementById('result_name').addEventListener('input', (e) => {
            const id = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '_');
            document.getElementById('result_id').value = id;
        });

        // Set default review status
        document.getElementById('review_status').value = 'draft';
    }

    // Dynamic item creation methods (copied from edit-entry-structured.js)
    addEquation(id = '', equation = '') {
        const container = document.getElementById('equations_container');
        const index = ++this.counters.equations;
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Equation ${index}</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Equation ID</label>
                <input type="text" class="eq-id" value="${id}" placeholder="e.g., eq1">
            </div>
            <div class="form-group">
                <label>Equation (AsciiMath)</label>
                <textarea class="eq-equation" rows="2" placeholder="Enter equation in AsciiMath format...">${equation}</textarea>
                <div class="math-preview"></div>
            </div>
        `;
        
        container.appendChild(div);
        this.setupMathPreview(div.querySelector('.eq-equation'), div.querySelector('.math-preview'));
    }

    addEquationAssumption(id = '', text = '') {
        const container = document.getElementById('equations_assumptions_container');
        const index = ++this.counters.equations_assumptions;
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Assumption ${index}</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Assumption ID</label>
                <input type="text" class="assumption-id" value="${id}" placeholder="e.g., assumption1">
            </div>
            <div class="form-group">
                <label>Assumption Text</label>
                <textarea class="assumption-text" rows="2" placeholder="Describe the assumption...">${text}</textarea>
            </div>
        `;
        
        container.appendChild(div);
    }

    addDefinition(symbol = '', definition = '') {
        const container = document.getElementById('definitions_container');
        const index = ++this.counters.definitions;
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Definition ${index}</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Symbol</label>
                <input type="text" class="def-symbol" value="${symbol}" placeholder="e.g., psi">
            </div>
            <div class="form-group">
                <label>Definition</label>
                <input type="text" class="def-definition" value="${definition}" placeholder="e.g., wavefunction">
            </div>
        `;
        
        container.appendChild(div);
    }

    addDerivationStep(step = '', equation = '') {
        const container = document.getElementById('derivation_container');
        const index = ++this.counters.derivation;
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Step ${step || index}</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Step Number</label>
                <input type="number" class="step-number" value="${step || index}" min="1">
            </div>
            <div class="form-group">
                <label>Equation (AsciiMath)</label>
                <textarea class="step-equation" rows="2" placeholder="Enter derivation step equation...">${equation}</textarea>
                <div class="math-preview"></div>
            </div>
        `;
        
        container.appendChild(div);
        this.setupMathPreview(div.querySelector('.step-equation'), div.querySelector('.math-preview'));
    }

    addDerivationAssumption(id = '', text = '') {
        const container = document.getElementById('derivation_assumptions_container');
        const index = ++this.counters.derivation_assumptions;
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Derivation Assumption ${index}</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Assumption ID</label>
                <input type="text" class="deriv-assumption-id" value="${id}" placeholder="e.g., assumption1">
            </div>
            <div class="form-group">
                <label>Assumption Text</label>
                <textarea class="deriv-assumption-text" rows="2" placeholder="Describe the derivation assumption...">${text}</textarea>
            </div>
        `;
        
        container.appendChild(div);
    }

    addDerivationExplanation(step = '', text = '') {
        const container = document.getElementById('derivation_explanation_container');
        const index = ++this.counters.derivation_explanation;
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Explanation for Step ${step || index}</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Step Number</label>
                <input type="number" class="exp-step-number" value="${step || index}" min="1">
            </div>
            <div class="form-group">
                <label>Explanation Text</label>
                <textarea class="exp-text" rows="3" placeholder="Explain the reasoning for this step...">${text}</textarea>
            </div>
        `;
        
        container.appendChild(div);
    }

    addValidityCondition(condition = '') {
        const container = document.getElementById('validity_conditions_container');
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Condition</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Condition</label>
                <textarea class="validity-condition" rows="2" placeholder="Physical condition where this theory applies...">${condition}</textarea>
            </div>
        `;
        
        container.appendChild(div);
    }
    
    addValidityLimitation(limitation = '') {
        const container = document.getElementById('validity_limitations_container');
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Limitation</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Limitation</label>
                <textarea class="validity-limitation" rows="2" placeholder="Limitation or boundary of this theory...">${limitation}</textarea>
            </div>
        `;
        
        container.appendChild(div);
    }
    
    addDependency(entry = '') {
        const container = document.getElementById('dependencies_container');
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Dependency Entry</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Entry ID</label>
                <input type="text" class="dependency-entry" value="${entry}" placeholder="e.g., einstein_field_equations">
                <div class="help-text">Entry ID without .json extension</div>
            </div>
        `;
        
        container.appendChild(div);
    }
    
    addSupersededBy(entry = '') {
        const container = document.getElementById('superseded_by_container');
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Superseded By Entry</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Entry ID</label>
                <input type="text" class="superseded-entry" value="${entry}" placeholder="e.g., dirac_equation_free">
                <div class="help-text">Entry ID without .json extension</div>
            </div>
        `;
        
        container.appendChild(div);
    }
    
    addKeyInsight(insight = '') {
        const container = document.getElementById('key_insights_container');
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Key Insight</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Insight</label>
                <textarea class="key-insight" rows="2" placeholder="Key scientific insight or breakthrough...">${insight}</textarea>
            </div>
        `;
        
        container.appendChild(div);
    }

    addReference(id = '', citation = '') {
        const container = document.getElementById('references_container');
        const index = ++this.counters.references;
        
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="dynamic-item-header">
                <h4>Reference ${index}</h4>
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
            </div>
            <div class="form-group">
                <label>Reference ID</label>
                <input type="text" class="ref-id" value="${id || 'R' + index}" placeholder="e.g., R1">
            </div>
            <div class="form-group">
                <label>Citation</label>
                <textarea class="ref-citation" rows="3" placeholder="Full APA citation...">${citation}</textarea>
            </div>
        `;
        
        container.appendChild(div);
    }

    setupMathPreview(textarea, preview) {
        textarea.addEventListener('input', () => {
            if (textarea.value.trim()) {
                preview.innerHTML = `\`${textarea.value}\``;
                this.safeTypesetMathJax([preview]);
            } else {
                preview.innerHTML = '';
            }
        });
        
        // Trigger initial preview
        if (textarea.value.trim()) {
            preview.innerHTML = `\`${textarea.value}\``;
            this.safeTypesetMathJax([preview]);
        }
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

    // Export and submission methods
    exportToJSON() {
        const entry = this.collectFormData();
        const blob = new Blob([JSON.stringify(entry, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${entry.result_id || 'new_entry'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    createEmailSubmission() {
        const entry = this.collectFormData();
        const subject = `[NEW] ${entry.result_name || 'New Entry'}`;
        const emailBody = this.formatEmailBody(entry);
        
        const contributorEmail = document.getElementById('contributor-email').value;
        
        // Create mailto link
        const mailtoUrl = `mailto:theoriadataset@gmail.com${contributorEmail ? `?cc=${encodeURIComponent(contributorEmail)}` : '?'}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Open email client with JSON already in body
        window.location.href = mailtoUrl;
        
        // Show success message
        alert('Opening your email client with the new entry submission and JSON content pre-filled. Please review and send the email. Thank you for contributing!');
    }

    formatEmailBody(entry) {
        return `New Entry Submission

Entry ID: ${entry.result_id || 'Not specified'}
Entry Name: ${entry.result_name || 'Not specified'}
Contributor: ${entry.created_by || 'Not specified'}

Domain: ${entry.domain || 'Not specified'}
Theory Status: ${entry.theory_status || 'Not specified'}

Entry JSON Content:
${JSON.stringify(entry, null, 2)}

---
Submitted via TheorIA new entry form`;
    }

    togglePreview() {
        const previewSection = document.getElementById('preview-section');
        const button = document.querySelector('button[onclick="togglePreview()"]');
        
        if (previewSection.style.display === 'none') {
            // Show preview
            this.generatePreview();
            previewSection.style.display = 'block';
            button.textContent = '🙈 Hide Preview';
        } else {
            // Hide preview
            previewSection.style.display = 'none';
            button.textContent = '👁️ Preview Entry';
        }
    }

    generatePreview() {
        const entry = this.collectFormData();
        const preview = document.getElementById('full-preview');
        
        preview.innerHTML = `
            <div class="preview-content">
                <h2>${entry.result_name || 'Untitled Entry'}</h2>
                <p><strong>ID:</strong> ${entry.result_id || 'Not specified'}</p>
                <p><strong>Domain:</strong> ${entry.domain || 'Not specified'}</p>
                <p><strong>Theory Status:</strong> ${entry.theory_status || 'Not specified'}</p>
                
                ${entry.explanation ? `
                <div class="explanation">
                    <h3>Explanation</h3>
                    <p>${entry.explanation}</p>
                </div>` : ''}
                
                ${entry.result_equations?.length ? `
                <div class="equations">
                    <h3>Main Equations</h3>
                    ${entry.result_equations.map(eq => `
                        <div class="equation-item">
                            <strong>${eq.id}:</strong> \`${eq.equation}\`
                        </div>
                    `).join('')}
                </div>` : ''}
                
                ${entry.definitions?.length ? `
                <div class="definitions">
                    <h3>Symbol Definitions</h3>
                    <table>
                        <thead>
                            <tr><th>Symbol</th><th>Definition</th></tr>
                        </thead>
                        <tbody>
                            ${entry.definitions.map(def => `
                                <tr>
                                    <td>\`${def.symbol}\`</td>
                                    <td>${def.definition}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>` : ''}
                
                ${entry.derivation?.length ? `
                <div class="derivation">
                    <h3>Derivation</h3>
                    <ol>
                        ${entry.derivation.map(step => `
                            <li>
                                <div class="step-equation">\`${step.equation}\`</div>
                            </li>
                        `).join('')}
                    </ol>
                </div>` : ''}
                
                ${entry.references?.length ? `
                <div class="references">
                    <h3>References</h3>
                    <ul>
                        ${entry.references.map(ref => `
                            <li>${ref.citation}</li>
                        `).join('')}
                    </ul>
                </div>` : ''}
                
                <div class="metadata">
                    <h3>Metadata</h3>
                    <p><strong>Created by:</strong> ${entry.created_by || 'Not specified'}</p>
                    <p><strong>Review Status:</strong> ${entry.review_status || 'draft'}</p>
                </div>
            </div>
        `;
        
        // Render math
        this.safeTypesetMathJax([preview]);
    }

    copyToClipboard() {
        const entry = this.collectFormData();
        navigator.clipboard.writeText(JSON.stringify(entry, null, 2)).then(() => {
            alert('Entry JSON copied to clipboard!');
        });
    }


    collectFormData() {
        return {
            result_id: document.getElementById('result_id').value || '',
            result_name: document.getElementById('result_name').value || '',
            result_equations: this.collectEquations(),
            explanation: document.getElementById('explanation').value || '',
            equations_assumptions: this.collectEquationsAssumptions(),
            definitions: this.collectDefinitions(),
            derivation: this.collectDerivation(),
            derivation_assumptions: this.collectDerivationAssumptions(),
            derivation_explanation: this.collectDerivationExplanation(),
            programmatic_verification: this.collectProgrammaticVerification(),
            domain: document.getElementById('domain').value || '',
            theory_status: document.getElementById('theory_status').value || '',
            validity_regime: this.collectValidityRegime(),
            dependencies: this.collectDependencies(),
            superseded_by: this.collectSupersededBy(),
            historical_context: this.collectHistoricalContext(),
            references: this.collectReferences(),
            created_by: document.getElementById('created_by').value || '',
            review_status: document.getElementById('review_status').value || 'draft'
        };
    }

    collectEquations() {
        const equations = [];
        document.querySelectorAll('#equations_container .dynamic-item').forEach(item => {
            const id = item.querySelector('.eq-id').value;
            const equation = item.querySelector('.eq-equation').value;
            if (id && equation) {
                equations.push({ id, equation });
            }
        });
        return equations.length > 0 ? equations : undefined;
    }

    collectEquationsAssumptions() {
        const assumptions = [];
        document.querySelectorAll('#equations_assumptions_container .dynamic-item').forEach(item => {
            const id = item.querySelector('.assumption-id').value;
            const text = item.querySelector('.assumption-text').value;
            if (text) {
                assumptions.push({ id: id || `assumption${assumptions.length + 1}`, text });
            }
        });
        return assumptions.length > 0 ? assumptions : undefined;
    }

    collectDefinitions() {
        const definitions = [];
        document.querySelectorAll('#definitions_container .dynamic-item').forEach(item => {
            const symbol = item.querySelector('.def-symbol').value;
            const definition = item.querySelector('.def-definition').value;
            if (symbol && definition) {
                definitions.push({ symbol, definition });
            }
        });
        return definitions.length > 0 ? definitions : undefined;
    }

    collectDerivation() {
        const derivation = [];
        document.querySelectorAll('#derivation_container .dynamic-item').forEach(item => {
            const step = parseInt(item.querySelector('.step-number').value);
            const equation = item.querySelector('.step-equation').value;
            if (step && equation) {
                derivation.push({ step, equation });
            }
        });
        return derivation.length > 0 ? derivation.sort((a, b) => a.step - b.step) : undefined;
    }

    collectDerivationAssumptions() {
        const assumptions = [];
        document.querySelectorAll('#derivation_assumptions_container .dynamic-item').forEach(item => {
            const id = item.querySelector('.deriv-assumption-id').value;
            const text = item.querySelector('.deriv-assumption-text').value;
            if (text) {
                assumptions.push({ id: id || `assumption${assumptions.length + 1}`, text });
            }
        });
        return assumptions.length > 0 ? assumptions : undefined;
    }

    collectDerivationExplanation() {
        const explanations = [];
        document.querySelectorAll('#derivation_explanation_container .dynamic-item').forEach(item => {
            const step = parseInt(item.querySelector('.exp-step-number').value);
            const text = item.querySelector('.exp-text').value;
            if (step && text) {
                explanations.push({ step, text });
            }
        });
        return explanations.length > 0 ? explanations.sort((a, b) => a.step - b.step) : undefined;
    }

    collectProgrammaticVerification() {
        const language = document.getElementById('prog_language').value;
        const library = document.getElementById('prog_library').value;
        const code = document.getElementById('prog_code').value;
        
        if (language || library || code) {
            return {
                language: language || undefined,
                library: library || undefined,
                code: code ? code.split('\n').filter(line => line.trim()) : undefined
            };
        }
        return undefined;
    }

    collectValidityRegime() {
        const conditions = [];
        document.querySelectorAll('#validity_conditions_container .dynamic-item').forEach(item => {
            const condition = item.querySelector('.validity-condition').value;
            if (condition.trim()) {
                conditions.push(condition);
            }
        });
        
        const limitations = [];
        document.querySelectorAll('#validity_limitations_container .dynamic-item').forEach(item => {
            const limitation = item.querySelector('.validity-limitation').value;
            if (limitation.trim()) {
                limitations.push(limitation);
            }
        });
        
        if (conditions.length > 0 || limitations.length > 0) {
            return {
                conditions: conditions.length > 0 ? conditions : undefined,
                limitations: limitations.length > 0 ? limitations : undefined
            };
        }
        return undefined;
    }
    
    collectDependencies() {
        const entries = [];
        document.querySelectorAll('#dependencies_container .dynamic-item').forEach(item => {
            const entry = item.querySelector('.dependency-entry').value;
            if (entry.trim()) {
                entries.push(entry);
            }
        });
        return entries.length > 0 ? entries : undefined;
    }
    
    collectSupersededBy() {
        const entries = [];
        document.querySelectorAll('#superseded_by_container .dynamic-item').forEach(item => {
            const entry = item.querySelector('.superseded-entry').value;
            if (entry.trim()) {
                entries.push(entry);
            }
        });
        return entries.length > 0 ? entries : undefined;
    }
    
    collectHistoricalContext() {
        const importance = document.getElementById('historical_importance').value;
        const developmentPeriod = document.getElementById('development_period').value;
        
        const keyInsights = [];
        document.querySelectorAll('#key_insights_container .dynamic-item').forEach(item => {
            const insight = item.querySelector('.key-insight').value;
            if (insight.trim()) {
                keyInsights.push(insight);
            }
        });
        
        if (importance || developmentPeriod || keyInsights.length > 0) {
            return {
                importance: importance || undefined,
                development_period: developmentPeriod || undefined,
                key_insights: keyInsights.length > 0 ? keyInsights : undefined
            };
        }
        return undefined;
    }

    collectReferences() {
        const references = [];
        document.querySelectorAll('#references_container .dynamic-item').forEach(item => {
            const id = item.querySelector('.ref-id').value;
            const citation = item.querySelector('.ref-citation').value;
            if (citation) {
                references.push({ id: id || `R${references.length + 1}`, citation });
            }
        });
        return references.length > 0 ? references : undefined;
    }
}

// Global functions for dynamic items
function addEquation() {
    if (window.newEntryForm) {
        window.newEntryForm.addEquation();
    }
}

function addEquationAssumption() {
    if (window.newEntryForm) {
        window.newEntryForm.addEquationAssumption();
    }
}

function addDefinition() {
    if (window.newEntryForm) {
        window.newEntryForm.addDefinition();
    }
}

function addDerivationStep() {
    if (window.newEntryForm) {
        window.newEntryForm.addDerivationStep();
    }
}

function addDerivationAssumption() {
    if (window.newEntryForm) {
        window.newEntryForm.addDerivationAssumption();
    }
}

function addDerivationExplanation() {
    if (window.newEntryForm) {
        window.newEntryForm.addDerivationExplanation();
    }
}

function addValidityCondition() {
    if (window.newEntryForm) {
        window.newEntryForm.addValidityCondition();
    }
}

function addValidityLimitation() {
    if (window.newEntryForm) {
        window.newEntryForm.addValidityLimitation();
    }
}

function addDependency() {
    if (window.newEntryForm) {
        window.newEntryForm.addDependency();
    }
}

function addSupersededBy() {
    if (window.newEntryForm) {
        window.newEntryForm.addSupersededBy();
    }
}

function addKeyInsight() {
    if (window.newEntryForm) {
        window.newEntryForm.addKeyInsight();
    }
}

function addReference() {
    if (window.newEntryForm) {
        window.newEntryForm.addReference();
    }
}

function exportToJSON() {
    if (window.newEntryForm) {
        window.newEntryForm.exportToJSON();
    }
}


function createEmailSubmission() {
    if (window.newEntryForm) {
        window.newEntryForm.createEmailSubmission();
    }
}

function togglePreview() {
    if (window.newEntryForm) {
        window.newEntryForm.togglePreview();
    }
}

function copyToClipboard() {
    if (window.newEntryForm) {
        window.newEntryForm.copyToClipboard();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for MathJax to load
    setTimeout(() => {
        window.newEntryForm = new NewEntryForm();
    }, 500);
});