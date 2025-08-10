// Structured Entry Editor System
class StructuredEntryEditor {
    constructor() {
        this.originalEntry = null;
        this.currentEntry = null;
        this.entryId = null;
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
        // Get entry ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.entryId = urlParams.get('entry');
        
        if (!this.entryId) {
            this.showError('No entry specified. Please access this page through an entry link.<br><br>Example: <code>edit-entry.html?entry=schroedingen_equation</code>');
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
            
            // Show the entry editor by changing class
            const entryEditor = document.getElementById('entry-editor');
            entryEditor.classList.remove('entry-editor-hidden');
            entryEditor.classList.add('entry-editor-visible');
            
            // Make all form sections visible by adding 'active' class
            const allFormSections = document.querySelectorAll('.form-section');
            allFormSections.forEach(section => {
                section.classList.add('active');
            });
            
            // Populate all form sections
            this.populateForm();
            
        } catch (error) {
            console.error('Error loading entry:', error);
            this.showError(`Failed to load entry: ${error.message}`);
        }
    }

    populateForm() {
        // Basic Information
        document.getElementById('result_id').value = this.currentEntry.result_id || '';
        document.getElementById('result_name').value = this.currentEntry.result_name || '';
        
        // Explanation
        document.getElementById('explanation').value = this.currentEntry.explanation || '';
        
        // Equations
        this.populateEquations();
        
        // Equations Assumptions
        this.populateEquationsAssumptions();
        
        // Definitions
        this.populateDefinitions();
        
        // Derivation
        this.populateDerivation();
        
        // Derivation Assumptions
        this.populateDerivationAssumptions();
        
        // Derivation Explanation
        this.populateDerivationExplanation();
        
        // Programmatic Verification
        if (this.currentEntry.programmatic_verification) {
            document.getElementById('prog_language').value = this.currentEntry.programmatic_verification.language || '';
            document.getElementById('prog_library').value = this.currentEntry.programmatic_verification.library || '';
            document.getElementById('prog_code').value = (this.currentEntry.programmatic_verification.code || []).join('\n');
        }
        
        // Metadata
        document.getElementById('domain').value = this.currentEntry.domain || '';
        document.getElementById('theory_status').value = this.currentEntry.theory_status || '';
        
        // Validity Regime
        this.populateValidityRegime();
        
        // Dependencies
        this.populateDependencies();
        
        // Superseded By
        this.populateSupersededBy();
        
        // Historical Context
        this.populateHistoricalContext();
        
        // References
        this.populateReferences();
        
        // Attribution
        document.getElementById('created_by').value = this.currentEntry.created_by || '';
        document.getElementById('review_status').value = this.currentEntry.review_status || 'draft';
    }

    populateEquations() {
        const container = document.getElementById('equations_container');
        container.innerHTML = '';
        
        if (this.currentEntry.result_equations && this.currentEntry.result_equations.length > 0) {
            this.currentEntry.result_equations.forEach((eq, index) => {
                this.addEquation(eq.id, eq.equation);
            });
        } else {
            this.addEquation('', '');
        }
    }

    populateEquationsAssumptions() {
        const container = document.getElementById('equations_assumptions_container');
        container.innerHTML = '';
        
        if (this.currentEntry.equations_assumptions && this.currentEntry.equations_assumptions.length > 0) {
            this.currentEntry.equations_assumptions.forEach((assumption) => {
                this.addEquationAssumption(assumption.id, assumption.text);
            });
        }
    }

    populateDefinitions() {
        const container = document.getElementById('definitions_container');
        container.innerHTML = '';
        
        if (this.currentEntry.definitions && this.currentEntry.definitions.length > 0) {
            this.currentEntry.definitions.forEach((def) => {
                this.addDefinition(def.symbol, def.definition);
            });
        } else {
            this.addDefinition('', '');
        }
    }

    populateDerivation() {
        const container = document.getElementById('derivation_container');
        container.innerHTML = '';
        
        if (this.currentEntry.derivation && this.currentEntry.derivation.length > 0) {
            this.currentEntry.derivation.forEach((step) => {
                this.addDerivationStep(step.step, step.equation);
            });
        }
    }

    populateDerivationAssumptions() {
        const container = document.getElementById('derivation_assumptions_container');
        container.innerHTML = '';
        
        if (this.currentEntry.derivation_assumptions && this.currentEntry.derivation_assumptions.length > 0) {
            this.currentEntry.derivation_assumptions.forEach((assumption) => {
                this.addDerivationAssumption(assumption.id, assumption.text);
            });
        }
    }

    populateDerivationExplanation() {
        const container = document.getElementById('derivation_explanation_container');
        container.innerHTML = '';
        
        if (this.currentEntry.derivation_explanation && this.currentEntry.derivation_explanation.length > 0) {
            this.currentEntry.derivation_explanation.forEach((exp) => {
                this.addDerivationExplanation(exp.step, exp.text);
            });
        }
    }

    populateValidityRegime() {
        // Populate validity conditions
        const conditionsContainer = document.getElementById('validity_conditions_container');
        conditionsContainer.innerHTML = '';
        
        if (this.currentEntry.validity_regime && this.currentEntry.validity_regime.conditions) {
            this.currentEntry.validity_regime.conditions.forEach((condition) => {
                this.addValidityCondition(condition);
            });
        }
        
        // Populate validity limitations
        const limitationsContainer = document.getElementById('validity_limitations_container');
        limitationsContainer.innerHTML = '';
        
        if (this.currentEntry.validity_regime && this.currentEntry.validity_regime.limitations) {
            this.currentEntry.validity_regime.limitations.forEach((limitation) => {
                this.addValidityLimitation(limitation);
            });
        }
    }
    
    populateDependencies() {
        const container = document.getElementById('dependencies_container');
        container.innerHTML = '';
        
        if (this.currentEntry.dependencies && this.currentEntry.dependencies.length > 0) {
            this.currentEntry.dependencies.forEach((entry) => {
                this.addDependency(entry);
            });
        }
    }
    
    populateSupersededBy() {
        const container = document.getElementById('superseded_by_container');
        container.innerHTML = '';
        
        if (this.currentEntry.superseded_by && this.currentEntry.superseded_by.length > 0) {
            this.currentEntry.superseded_by.forEach((entry) => {
                this.addSupersededBy(entry);
            });
        }
    }
    
    populateHistoricalContext() {
        if (this.currentEntry.historical_context) {
            document.getElementById('historical_importance').value = this.currentEntry.historical_context.importance || '';
            document.getElementById('development_period').value = this.currentEntry.historical_context.development_period || '';
            
            // Populate key insights
            const container = document.getElementById('key_insights_container');
            container.innerHTML = '';
            
            if (this.currentEntry.historical_context.key_insights) {
                this.currentEntry.historical_context.key_insights.forEach((insight) => {
                    this.addKeyInsight(insight);
                });
            }
        }
    }

    populateReferences() {
        const container = document.getElementById('references_container');
        container.innerHTML = '';
        
        if (this.currentEntry.references && this.currentEntry.references.length > 0) {
            this.currentEntry.references.forEach((ref) => {
                this.addReference(ref.id, ref.citation);
            });
        } else {
            this.addReference('', '');
        }
    }

    // Dynamic item creation methods
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
                <label>Equation ID*</label>
                <input type="text" class="eq-id" value="${id}" placeholder="e.g., eq1" required>
            </div>
            <div class="form-group">
                <label>Equation (AsciiMath)*</label>
                <textarea class="eq-equation" rows="2" placeholder="Enter equation in AsciiMath format..." required>${equation}</textarea>
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
                <label>Assumption Text*</label>
                <textarea class="assumption-text" rows="2" placeholder="Describe the assumption..." required>${text}</textarea>
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
                <label>Symbol*</label>
                <input type="text" class="def-symbol" value="${symbol}" placeholder="e.g., psi" required>
            </div>
            <div class="form-group">
                <label>Definition*</label>
                <input type="text" class="def-definition" value="${definition}" placeholder="e.g., wavefunction" required>
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
                <label>Step Number*</label>
                <input type="number" class="step-number" value="${step || index}" min="1" required>
            </div>
            <div class="form-group">
                <label>Equation (AsciiMath)*</label>
                <textarea class="step-equation" rows="2" placeholder="Enter derivation step equation..." required>${equation}</textarea>
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
                <label>Assumption Text*</label>
                <textarea class="deriv-assumption-text" rows="2" placeholder="Describe the derivation assumption..." required>${text}</textarea>
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
                <label>Step Number*</label>
                <input type="number" class="exp-step-number" value="${step || index}" min="1" required>
            </div>
            <div class="form-group">
                <label>Explanation Text*</label>
                <textarea class="exp-text" rows="3" placeholder="Explain the reasoning for this step..." required>${text}</textarea>
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
                <label>Condition*</label>
                <textarea class="validity-condition" rows="2" placeholder="Physical condition where this theory applies..." required>${condition}</textarea>
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
                <label>Limitation*</label>
                <textarea class="validity-limitation" rows="2" placeholder="Limitation or boundary of this theory..." required>${limitation}</textarea>
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
                <label>Entry ID*</label>
                <input type="text" class="dependency-entry" value="${entry}" placeholder="e.g., einstein_field_equations" required>
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
                <label>Entry ID*</label>
                <input type="text" class="superseded-entry" value="${entry}" placeholder="e.g., dirac_equation_free" required>
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
                <label>Insight*</label>
                <textarea class="key-insight" rows="2" placeholder="Key scientific insight or breakthrough..." required>${insight}</textarea>
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
                <label>Citation*</label>
                <textarea class="ref-citation" rows="3" placeholder="Full APA citation..." required>${citation}</textarea>
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

    setupEventListeners() {
        // Form change handler
        document.getElementById('entry-form').addEventListener('change', () => {
            this.collectFormData();
        });
    }

    collectFormData() {
        // Collect all form data into currentEntry
        this.currentEntry = {
            result_id: document.getElementById('result_id').value,
            result_name: document.getElementById('result_name').value,
            result_equations: this.collectEquations(),
            explanation: document.getElementById('explanation').value,
            equations_assumptions: this.collectEquationsAssumptions(),
            definitions: this.collectDefinitions(),
            derivation: this.collectDerivation(),
            derivation_assumptions: this.collectDerivationAssumptions(),
            derivation_explanation: this.collectDerivationExplanation(),
            programmatic_verification: {
                language: document.getElementById('prog_language').value,
                library: document.getElementById('prog_library').value,
                code: document.getElementById('prog_code').value.split('\n').filter(line => line.trim())
            },
            domain: document.getElementById('domain').value,
            theory_status: document.getElementById('theory_status').value,
            validity_regime: this.collectValidityRegime(),
            dependencies: this.collectDependencies(),
            superseded_by: this.collectSupersededBy(),
            historical_context: this.collectHistoricalContext(),
            references: this.collectReferences(),
            created_by: document.getElementById('created_by').value,
            review_status: document.getElementById('review_status').value
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
        return equations;
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
        return assumptions;
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
        return definitions;
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
        return derivation.sort((a, b) => a.step - b.step);
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
        return assumptions;
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
        return explanations.sort((a, b) => a.step - b.step);
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
        return null;
    }
    
    collectDependencies() {
        const entries = [];
        document.querySelectorAll('#dependencies_container .dynamic-item').forEach(item => {
            const entry = item.querySelector('.dependency-entry').value;
            if (entry.trim()) {
                entries.push(entry);
            }
        });
        return entries.length > 0 ? entries : null;
    }
    
    collectSupersededBy() {
        const entries = [];
        document.querySelectorAll('#superseded_by_container .dynamic-item').forEach(item => {
            const entry = item.querySelector('.superseded-entry').value;
            if (entry.trim()) {
                entries.push(entry);
            }
        });
        return entries.length > 0 ? entries : null;
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
        return null;
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
        return references;
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

    previewChanges() {
        this.collectFormData();
        
        const preview = document.getElementById('preview-content');
        preview.innerHTML = this.generateFullPreview(this.currentEntry);
        
        document.getElementById('preview-modal').style.display = 'flex';
        this.safeTypesetMathJax([preview]);
    }

    generateFullPreview(entry) {
        return `
            <div class="preview-section">
                <h2>${entry.result_name}</h2>
                
                <div class="explanation">
                    <p>${entry.explanation}</p>
                </div>
                
                ${entry.result_equations?.length ? `
                <section id="equations">
                    <h2>Main Equations</h2>
                    <div class="equations-content">
                        ${entry.result_equations.map(eq => `<p>\`${eq.equation}\`</p>`).join('')}
                    </div>
                </section>` : ''}
                
                ${entry.equations_assumptions?.length ? `
                <section id="assumptions">
                    <h2>Equations Assumptions</h2>
                    <ul>
                        ${entry.equations_assumptions.map(ass => `<li>${ass.text}</li>`).join('')}
                    </ul>
                </section>` : ''}
                
                ${entry.definitions?.length ? `
                <section id="definitions">
                    <h2>Symbol Definitions</h2>
                    <table>
                        <thead>
                            <tr><th>Symbol</th><th>Definition</th></tr>
                        </thead>
                        <tbody>
                            ${entry.definitions.map(def => {
                                const symbol = def.symbol.startsWith('`') ? def.symbol : `\`${def.symbol}\``;
                                return `<tr><td>${symbol}</td><td>${def.definition}</td></tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </section>` : ''}
                
                ${entry.derivation?.length ? `
                <section id="derivation">
                    <h2>Derivation</h2>
                    <div id="derivationSteps">
                        <ol>
                            ${entry.derivation.map(step => {
                                const explanationMap = {};
                                (entry.derivation_explanation || []).forEach(e => explanationMap[e.step] = e.text);
                                let html = '';
                                if (explanationMap[step.step]) {
                                    html += `<div class='step-expl'>${explanationMap[step.step]}</div>`;
                                }
                                if (step.equation) {
                                    html += `<div class='step-eq'>\`${step.equation}\`</div>`;
                                }
                                return `<li>${html}</li>`;
                            }).join('')}
                        </ol>
                    </div>
                </section>` : ''}
                
                ${entry.derivation_assumptions?.length ? `
                <section id="derivationAssumptions">
                    <h2>Derivation Assumptions</h2>
                    <ul>
                        ${entry.derivation_assumptions.map(ass => `<li>${ass.text}</li>`).join('')}
                    </ul>
                </section>` : ''}
                
                ${entry.programmatic_verification ? `
                <section id="programmaticVerification">
                    <h2>Programmatic Verification</h2>
                    <div><strong>Language:</strong> ${entry.programmatic_verification.language || 'Not specified'}</div>
                    <div><strong>Library:</strong> ${entry.programmatic_verification.library || 'Not specified'}</div>
                    ${entry.programmatic_verification.code?.length ? 
                        `<pre><code>${entry.programmatic_verification.code.join('\\n')}</code></pre>` : 
                        '<p>No code provided</p>'}
                </section>` : ''}
                
                ${entry.validity_regime ? `
                <section id="validityRegime">
                    <h2>Validity Regime</h2>
                    ${entry.validity_regime.conditions?.length ? `
                        <div id="validity-conditions">
                            <h3>Conditions</h3>
                            <ul>${entry.validity_regime.conditions.map(cond => `<li>${cond}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${entry.validity_regime.limitations?.length ? `
                        <div id="validity-limitations">
                            <h3>Limitations</h3>
                            <ul>${entry.validity_regime.limitations.map(lim => `<li>${lim}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </section>` : ''}
                
                ${entry.historical_context ? `
                <section id="historicalContext">
                    <h2>Historical Context</h2>
                    ${entry.historical_context.importance ? `
                        <div id="historical-importance">
                            <h3>Importance</h3>
                            <p>${entry.historical_context.importance}</p>
                        </div>
                    ` : ''}
                    ${entry.historical_context.development_period ? `
                        <div id="historical-period">
                            <h3>Development Period</h3>
                            <p>${entry.historical_context.development_period}</p>
                        </div>
                    ` : ''}
                    ${entry.historical_context.key_insights?.length ? `
                        <div id="historical-insights">
                            <h3>Key Insights</h3>
                            <ul>${entry.historical_context.key_insights.map(insight => `<li>${insight}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </section>` : ''}
                
                ${entry.dependencies?.length ? `
                <section id="dependencies">
                    <h2>Dependencies</h2>
                    <ul>${entry.dependencies.map(item => `<li><a href="entries.html?entry=${item}.json">${item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</a></li>`).join('')}</ul>
                </section>` : ''}
                
                ${entry.superseded_by?.length ? `
                <section id="superseded-by">
                    <h2>Superseded By</h2>
                    <ul>${entry.superseded_by.map(item => `<li><a href="entries.html?entry=${item}.json">${item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</a></li>`).join('')}</ul>
                </section>` : ''}
                
                ${entry.references?.length ? `
                <section id="references">
                    <h2>References</h2>
                    <ul>
                        ${entry.references.map(ref => `<li>${ref.citation}</li>`).join('')}
                    </ul>
                </section>` : ''}
                
                <section class="metadata">
                    <h2>Metadata</h2>
                    <div id="meta-domain"><strong>Domain:</strong> ${entry.domain}</div>
                    <div id="meta-created"><strong>Created by:</strong> ${entry.created_by}</div>
                    <div id="meta-status"><strong>Review Status:</strong> ${entry.review_status}</div>
                </section>
            </div>
        `;
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
        
        this.collectFormData();
        // Email submission removed - use GitHub issues or manual submission
    }

    createEmailSubmission() {
        const subject = `[MODIFY] ${this.currentEntry.result_name}`;
        const emailBody = this.formatEmailBody();
        
        const contributorEmail = document.getElementById('contributor-email').value;
        
        // Create mailto link
        const mailtoUrl = `mailto:theoriadataset@gmail.com${contributorEmail ? `?cc=${encodeURIComponent(contributorEmail)}` : '?'}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Open email client with JSON already in body
        window.location.href = mailtoUrl;
        
        // Show success message
        alert('Opening your email client with the modification request and JSON content pre-filled. Please review and send the email. Thank you for contributing!');
    }

    formatEmailBody() {
        const changes = this.getChanges();
        
        return `Entry Modification Request

Entry ID: ${this.entryId}
Entry Name: ${this.currentEntry.result_name}

Change Summary:
${document.getElementById('change-summary').value}

Reason for Changes:
${document.getElementById('change-reason').value}

Changes Made:
${changes}

Contributor: ${document.getElementById('contributor-info').value}

Modified JSON Content:
${JSON.stringify(this.currentEntry, null, 2)}

---
Submitted via TheorIA structured entry editor`;
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

    copyToClipboard() {
        this.collectFormData();
        navigator.clipboard.writeText(JSON.stringify(this.currentEntry, null, 2)).then(() => {
            alert('Entry JSON copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy to clipboard. Please use the browser\'s copy functionality.');
        });
    }

    resetForm() {
        if (confirm('Are you sure you want to reset all changes?')) {
            this.currentEntry = JSON.parse(JSON.stringify(this.originalEntry));
            this.populateForm();
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

// Global functions for dynamic items
function addEquation() {
    if (window.entryEditor) {
        window.entryEditor.addEquation();
    }
}

function addEquationAssumption() {
    if (window.entryEditor) {
        window.entryEditor.addEquationAssumption();
    }
}

function addDefinition() {
    if (window.entryEditor) {
        window.entryEditor.addDefinition();
    }
}

function addDerivationStep() {
    if (window.entryEditor) {
        window.entryEditor.addDerivationStep();
    }
}

function addDerivationAssumption() {
    if (window.entryEditor) {
        window.entryEditor.addDerivationAssumption();
    }
}

function addDerivationExplanation() {
    if (window.entryEditor) {
        window.entryEditor.addDerivationExplanation();
    }
}

function addValidityCondition() {
    if (window.entryEditor) {
        window.entryEditor.addValidityCondition();
    }
}

function addValidityLimitation() {
    if (window.entryEditor) {
        window.entryEditor.addValidityLimitation();
    }
}

function addDependency() {
    if (window.entryEditor) {
        window.entryEditor.addDependency();
    }
}

function addSupersededBy() {
    if (window.entryEditor) {
        window.entryEditor.addSupersededBy();
    }
}

function addKeyInsight() {
    if (window.entryEditor) {
        window.entryEditor.addKeyInsight();
    }
}

function addReference() {
    if (window.entryEditor) {
        window.entryEditor.addReference();
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

function copyToClipboard() {
    if (window.entryEditor) {
        window.entryEditor.copyToClipboard();
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
        window.entryEditor = new StructuredEntryEditor();
    }, 500);
});