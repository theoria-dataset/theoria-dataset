// Initialize EmailJS
(function() {
    emailjs.init('M5nbs1JH2QHdHW2lC');
})();

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

    async init() {
        // Check if we're editing an existing entry
        const urlParams = new URLSearchParams(window.location.search);
        const entryId = urlParams.get('entry');
        
        if (entryId) {
            await this.loadExistingEntry(entryId);
        } else {
            // Initialize with one of each dynamic item for new entries
            this.addEquation();
            this.addDefinition();
            this.addReference();
        }
        
        this.setupEventListeners();
    }

    async loadExistingEntry(entryId) {
        try {
            // Construct the correct path for both local and GitHub Pages
            const basePath = window.location.hostname === 'theoria-dataset.github.io' 
                ? '/theoria-dataset/entries/'
                : '../../entries/';
            const response = await fetch(`${basePath}${entryId}.json`);
            if (!response.ok) throw new Error('Entry not found');
            
            const entry = await response.json();
            
            // Update page title and description
            document.getElementById('page-title').textContent = `Edit Entry: ${entry.result_name}`;
            document.getElementById('page-description').textContent = 'Modify this theoretical physics entry';
            
            // Update reassuring message
            document.querySelector('.reassuring-message h3').textContent = '💡 Making improvements? Great!';
            document.querySelector('.reassuring-message p').textContent = 'You only need to modify the fields you want to change. Leave everything else as-is, and focus on your specific improvements.';
            
            // Show change summary section for editing
            document.getElementById('change-summary-section').style.display = 'block';
            
            // Populate all form fields
            this.populateForm(entry);
            
        } catch (error) {
            console.error('Error loading entry:', error);
            alert('Could not load entry. Please check the URL or try again.');
        }
    }

    populateForm(entry) {
        // Basic fields
        document.getElementById('result_id').value = entry.result_id || '';
        document.getElementById('result_name').value = entry.result_name || '';
        document.getElementById('explanation').value = entry.explanation || '';
        document.getElementById('domain').value = entry.domain || '';
        document.getElementById('theory_status').value = entry.theory_status || '';
        document.getElementById('review_status').value = entry.review_status || 'draft';
        document.getElementById('created_by').value = entry.created_by || '';
        
        // Populate equations
        if (entry.result_equations) {
            entry.result_equations.forEach((eq, index) => {
                if (index === 0) {
                    // Use first equation slot
                    const container = document.getElementById('equations_container');
                    const firstEq = container.querySelector('.dynamic-item');
                    if (firstEq) {
                        firstEq.querySelector('input[placeholder*="ID"]').value = eq.id || '';
                        firstEq.querySelector('textarea').value = eq.equation || '';
                    }
                } else {
                    // Add additional equations
                    this.addEquation(eq.id || '', eq.equation || '');
                }
            });
        } else {
            this.addEquation(); // Add one empty equation if none exist
        }
        
        // Populate definitions
        if (entry.definitions) {
            entry.definitions.forEach((def, index) => {
                if (index === 0) {
                    // Use first definition slot
                    const container = document.getElementById('definitions_container');
                    const firstDef = container.querySelector('.dynamic-item');
                    if (firstDef) {
                        firstDef.querySelector('input[placeholder*="symbol"]').value = def.symbol || '';
                        firstDef.querySelector('textarea').value = def.definition || '';
                    }
                } else {
                    // Add additional definitions
                    this.addDefinition(def.symbol || '', def.definition || '');
                }
            });
        } else {
            this.addDefinition(); // Add one empty definition if none exist
        }
        
        // Populate references
        if (entry.references) {
            entry.references.forEach((ref, index) => {
                if (index === 0) {
                    // Use first reference slot
                    const container = document.getElementById('references_container');
                    const firstRef = container.querySelector('.dynamic-item');
                    if (firstRef) {
                        firstRef.querySelector('input[placeholder*="ID"]').value = ref.id || '';
                        firstRef.querySelector('textarea').value = ref.citation || '';
                    }
                } else {
                    // Add additional references
                    this.addReference(ref.id || '', ref.citation || '');
                }
            });
        } else {
            this.addReference(); // Add one empty reference if none exist
        }
        
        // Populate other arrays (derivation, assumptions, etc.)
        this.populateArrayFields(entry);
    }

    populateArrayFields(entry) {
        // Populate equations assumptions
        if (entry.equations_assumptions && entry.equations_assumptions.length > 0) {
            entry.equations_assumptions.forEach((assumption, index) => {
                this.addEquationAssumption(assumption.id || '', assumption.text || '');
            });
        }

        // Populate derivation steps
        if (entry.derivation && entry.derivation.length > 0) {
            entry.derivation.forEach((step, index) => {
                this.addDerivationStep(step.step || index + 1, step.equation || '');
            });
        }

        // Populate derivation assumptions
        if (entry.derivation_assumptions && entry.derivation_assumptions.length > 0) {
            entry.derivation_assumptions.forEach((assumption, index) => {
                this.addDerivationAssumption(assumption.id || '', assumption.text || '');
            });
        }

        // Populate derivation explanations
        if (entry.derivation_explanation && entry.derivation_explanation.length > 0) {
            entry.derivation_explanation.forEach((explanation, index) => {
                this.addDerivationExplanation(explanation.step || index + 1, explanation.text || '');
            });
        }

        // Populate validity conditions
        if (entry.validity_regime && entry.validity_regime.conditions) {
            entry.validity_regime.conditions.forEach((condition, index) => {
                this.addValidityCondition(condition);
            });
        }

        // Populate validity limitations
        if (entry.validity_regime && entry.validity_regime.limitations) {
            entry.validity_regime.limitations.forEach((limitation, index) => {
                this.addValidityLimitation(limitation);
            });
        }

        // Populate dependencies
        if (entry.dependencies && entry.dependencies.length > 0) {
            entry.dependencies.forEach((dependency, index) => {
                this.addDependency(dependency);
            });
        }

        // Populate superseded by
        if (entry.superseded_by && entry.superseded_by.length > 0) {
            entry.superseded_by.forEach((superseded, index) => {
                this.addSupersededBy(superseded);
            });
        }

        // Populate key insights
        if (entry.historical_context && entry.historical_context.key_insights) {
            entry.historical_context.key_insights.forEach((insight, index) => {
                this.addKeyInsight(insight);
            });
        }

        // Populate programmatic verification
        if (entry.programmatic_verification) {
            document.getElementById('prog_language').value = entry.programmatic_verification.language || '';
            document.getElementById('prog_library').value = entry.programmatic_verification.library || '';
            if (entry.programmatic_verification.code) {
                document.getElementById('prog_code').value = entry.programmatic_verification.code.join('\n');
            }
        }

        // Populate historical context
        if (entry.historical_context) {
            if (entry.historical_context.importance) {
                document.getElementById('historical_importance').value = entry.historical_context.importance;
            }
            if (entry.historical_context.development_period) {
                document.getElementById('development_period').value = entry.historical_context.development_period;
            }
        }

        // Populate approximation_of
        if (entry.approximation_of && document.getElementById('approximation_of')) {
            document.getElementById('approximation_of').value = entry.approximation_of;
        }
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

    async createEmailSubmission() {
        try {
            const entry = this.collectFormData();
            
            // Validate required fields
            if (!entry.result_id || !entry.result_name) {
                alert('Please fill in required fields: Result ID and Result Name');
                return;
            }
            
            // Check if we're editing an existing entry
            const urlParams = new URLSearchParams(window.location.search);
            const entryId = urlParams.get('entry');
            const isEditing = !!entryId;
            
            // Additional validation for editing mode
            if (isEditing) {
                const changeSummary = document.getElementById('change-summary').value.trim();
                const changeReason = document.getElementById('change-reason').value.trim();
                
                if (!changeSummary || !changeReason) {
                    alert('Please fill in the Change Summary fields: What did you change and why?');
                    // Scroll to change summary section
                    document.getElementById('change-summary-section').scrollIntoView({ behavior: 'smooth' });
                    return;
                }
            }
            
            const contributorEmail = document.getElementById('contributor-email').value || '';
            
            // Template parameters for dataset team
            const teamParams = {
                submission_type: isEditing ? 'Entry Modification' : 'New Entry Submission',
                contributor_name: entry.created_by || 'Anonymous',
                contributor_email: contributorEmail || 'Not provided',
                submission_date: new Date().toLocaleDateString(),
                entry_id: entry.result_id,
                entry_title: entry.result_name,
                domain: entry.domain || 'Not specified',
                theory_status: entry.theory_status || 'Not specified',
                review_status: entry.review_status || 'draft',
                complete_json: JSON.stringify({
                    ...entry,
                    ...(isEditing && {
                        change_summary: {
                            what_changed: document.getElementById('change-summary').value,
                            why_changed: document.getElementById('change-reason').value
                        }
                    })
                }, null, 2)
            };
            
            // Send email to dataset team
            await emailjs.send('service_7owzwzd', 'template_p9e8vlg', {
                ...teamParams,
                to_email: 'theoriadataset@gmail.com'
            });
            
            // Note: Contributor confirmation emails disabled - only one template configured
            
            // Show success message
            this.showSuccessMessage(contributorEmail);
            
        } catch (error) {
            console.error('EmailJS error:', error);
            alert('❌ Submission failed: ' + error.text);
        }
    }

    showSuccessMessage(contributorEmail) {
        // Check if we're editing an existing entry
        const urlParams = new URLSearchParams(window.location.search);
        const entryId = urlParams.get('entry');
        const isEditing = !!entryId;
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <h4>✅ ${isEditing ? 'Changes' : 'Entry'} Submitted Successfully!</h4>
            <p>Your ${isEditing ? 'modifications' : 'physics entry'} ${isEditing ? 'have' : 'has'} been sent to the TheorIA dataset team for review.</p>
            <p>You should receive feedback within a few days. Thank you for ${isEditing ? 'improving' : 'contributing to'} ${isEditing ? 'the dataset' : 'science'}!</p>
        `;
        
        // Insert after the submit button
        const submitButton = document.querySelector('.btn[onclick="createEmailSubmission()"]');
        submitButton.parentNode.insertBefore(successDiv, submitButton.nextSibling);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth' });
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