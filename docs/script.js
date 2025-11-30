/* filepath: c:\Users\Manuel\Google Drive\TheorIA Dataset\docs\script.js */
// Helpers
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);

// Format long equations by breaking them at logical points
function formatLongEquation(equation) {
  // Replace hbar with Unicode ℏ for correct rendering
  equation = equation.replace(/\bhbar\b/g, "ℏ");

  // If equation is short enough, return as is
  if (equation.length <= 80) {
    return `\`${equation}\``;
  }
  
  // Define break points in order of preference
  const breakPatterns = [
    /(\s*=\s*)/g,           // Equals signs (highest priority)
    /(\s*\+\s*)/g,          // Plus signs
    /(\s*-\s*)/g,           // Minus signs (but be careful with negative numbers)
    /(\s*\*\s*)/g,          // Multiplication
    /(\s*\/\s*)/g,          // Division
    /(\s*\^\s*)/g,          // Exponentiation
    /(\s*,\s*)/g,           // Commas (for function arguments)
    /(\s*;\s*)/g,           // Semicolons
    /(\s+and\s+)/g,         // Logical AND
    /(\s+or\s+)/g,          // Logical OR
    /(\s*\|\s*)/g,          // Pipes (for conditions)
    /(\s*&\s*)/g,           // Ampersands
  ];
  
  // Try each break pattern until we find one that works
  for (const pattern of breakPatterns) {
    const parts = equation.split(pattern);
    
    if (parts.length > 1) {
      const lines = groupPartsIntoLines(parts);
      if (lines.length > 1) {
        return lines.map(line => `\`${line}\``).join('<br>');
      }
    }
  }
  
  // If no good break points found, try breaking at parentheses or brackets
  const parenParts = equation.split(/(\s*[\(\)\[\]]\s*)/);
  if (parenParts.length > 1) {
    const lines = groupPartsIntoLines(parenParts);
    if (lines.length > 1) {
      return lines.map(line => `\`${line}\``).join('<br>');
    }
  }
  
  // Last resort: break at word boundaries
  const words = equation.split(/(\s+)/);
  if (words.length > 1) {
    const lines = groupWordsIntoLines(words, 80);
    if (lines.length > 1) {
      return lines.map(line => `\`${line}\``).join('<br>');
    }
  }
  
  // If all else fails, return original
  return `\`${equation}\``;
}

// Helper function to group parts into lines with reasonable length
function groupPartsIntoLines(parts) {
  const lines = [];
  let currentLine = parts[0] || '';
  
  for (let i = 1; i < parts.length; i += 2) {
    const separator = parts[i] || '';
    const nextPart = parts[i + 1] || '';
    
    // Check if adding the next part would make line too long
    if (currentLine.length + separator.length + nextPart.length > 80) {
      // Start new line
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = separator + nextPart;
    } else {
      // Add to current line
      currentLine += separator + nextPart;
    }
  }
  
  // Add the last line
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
}

// Helper function to group words into lines
function groupWordsIntoLines(words, maxLength) {
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine.length + word.length > maxLength && currentLine.trim()) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += word;
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
}

// View toggling
const homeView = $("homeView");
const entryView = $("entryView");
const viewToggleBtn = $("viewToggleBtn");

if (viewToggleBtn) {
  viewToggleBtn.addEventListener("click", () => {
    entryView.classList.add("hidden");
    homeView.classList.remove("hidden");
  });
}

// Dark mode toggle using latex-dark class
const btn = $("themeToggle");
const htmlEl = document.documentElement;
function enableDark() {
  htmlEl.classList.add("latex-dark");
  btn.textContent = "☀︎";
  localStorage.setItem("theme", "dark");
}
function enableLight() {
  htmlEl.classList.remove("latex-dark");
  btn.textContent = "☾";
  localStorage.setItem("theme", "light");
}
// Initialize theme
(localStorage.getItem("theme") === "light" ? enableLight : enableDark)();
btn.addEventListener("click", () => {
  htmlEl.classList.contains("latex-dark") ? enableLight() : enableDark();
});

// Get the base URL for GitHub Pages or local development
const isGitHubPages = window.location.hostname.includes("github.io");
const baseUrl = isGitHubPages
  ? "https://raw.githubusercontent.com/theoria-dataset/theoria-dataset/main"
  : "..";

console.log("Base URL:", baseUrl, "GitHub Pages:", isGitHubPages);

// Global assumptions cache
let globalAssumptions = null;

// Load global assumptions from globals/assumptions.json
async function loadGlobalAssumptions() {
  if (globalAssumptions !== null) {
    return globalAssumptions; // Return cached version
  }

  try {
    const assumptionsUrl = `${baseUrl}/globals/assumptions.json`;
    console.log("Loading global assumptions from:", assumptionsUrl);

    const response = await fetch(assumptionsUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    globalAssumptions = {};

    // Create a lookup map by assumption ID
    data.assumptions.forEach(assumption => {
      globalAssumptions[assumption.id] = assumption;
    });

    console.log("Loaded", Object.keys(globalAssumptions).length, "global assumptions");
    return globalAssumptions;
  } catch (error) {
    console.error('Error loading global assumptions:', error);
    globalAssumptions = {}; // Set to empty object to avoid repeated failures
    return globalAssumptions;
  }
}

// Resolve an assumption or dependency string to its full details
function resolveAssumption(assumptionString, data) {
  // Check if it matches the assumption ID pattern
  const assumptionIdPattern = /^[a-z0-9_]+$/;

  // First check if it's a global assumption
  if (assumptionIdPattern.test(assumptionString) && globalAssumptions && globalAssumptions[assumptionString]) {
    const assumption = globalAssumptions[assumptionString];
    return {
      type: 'global',
      id: assumption.id,
      title: assumption.title || assumption.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      text: assumption.text,
      assumptionType: assumption.type,
      mathematicalExpressions: assumption.mathematical_expressions || [],
      symbolDefinitions: assumption.symbol_definitions || []
    };
  }

  // Check if it's a dependency (entry reference)
  if (assumptionIdPattern.test(assumptionString) && data && data.depends_on && data.depends_on.includes(assumptionString)) {
    const dependencyName = assumptionString.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      type: 'dependency',
      id: assumptionString,
      title: dependencyName,
      text: `Builds upon: ${dependencyName}`,
      assumptionType: 'dependency'
    };
  }

  // Treat as direct text assumption
  return {
    type: 'direct',
    text: assumptionString,
    assumptionType: 'unspecified'
  };
}

// Render prerequisites section (assumptions + dependencies)
function renderPrerequisites(data) {
  const prerequisitesList = [];

  // Process assumptions
  if (data.assumptions && data.assumptions.length > 0) {
    data.assumptions.forEach(assumptionString => {
      const resolved = resolveAssumption(assumptionString, data);

      let displayText = '';
      let tooltip = '';

      if (resolved.type === 'global') {
        // Display title prominently, then text
        const textFixed = resolved.text.replace(/\bhbar\b/g, "ℏ");
        displayText = `<strong class="assumption-title" id="assumption-${resolved.id}">${resolved.title}</strong><br>${textFixed}`;
        tooltip = `Assumption type: ${resolved.assumptionType}`;

        // Add mathematical expressions on new lines if available
        if (resolved.mathematicalExpressions && resolved.mathematicalExpressions.length > 0) {
          const mathExpressions = resolved.mathematicalExpressions.map(expr => {
            const exprFixed = expr.replace(/\bhbar\b/g, "ℏ");
            return `<div class="assumption-math">\`${exprFixed}\`</div>`;
          }).join('');
          displayText += mathExpressions;
        }

        // Add symbol definitions if available
        if (resolved.symbolDefinitions && resolved.symbolDefinitions.length > 0) {
          const symbolDefs = resolved.symbolDefinitions.map(def => {
            const symbolFixed = def.symbol.replace(/\bhbar\b/g, "ℏ");
            const definitionFixed = def.definition.replace(/\bhbar\b/g, "ℏ");
            return `<div class="assumption-symbol-def"><span class="symbol">\`${symbolFixed}\`</span>: ${definitionFixed}</div>`;
          }).join('');
          displayText += `<div class="assumption-symbols">${symbolDefs}</div>`;
        }
      } else {
        // Direct text assumption
        displayText = resolved.text;
        tooltip = 'Direct assumption';
      }

      prerequisitesList.push({
        type: 'assumption',
        html: displayText,
        tooltip: tooltip,
        id: resolved.id,
        cssClass: resolved.type === 'global' ? `assumption-${resolved.assumptionType}` : 'assumption-unspecified'
      });
    });
  }

  // Process dependencies
  if (data.depends_on && data.depends_on.length > 0) {
    data.depends_on.forEach(dependencyId => {
      const dependencyName = dependencyId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const dependencyLink = `<a href="entries.html?entry=${dependencyId}.json">${dependencyName}</a>`;

      prerequisitesList.push({
        type: 'dependency',
        html: dependencyLink,
        tooltip: `Builds upon: ${dependencyName}`,
        cssClass: 'dependency-type'
      });
    });
  }

  // Render the list
  const prerequisitesContainer = qs("#assumptions ol");
  if (prerequisitesContainer) {
    prerequisitesContainer.innerHTML = "";

    if (prerequisitesList.length === 0) {
      prerequisitesContainer.innerHTML = "<li><em>No specific prerequisites</em></li>";
    } else {
      prerequisitesList.forEach(item => {
        const tooltip = item.tooltip ? ` title="${item.tooltip}"` : '';
        const cssClass = item.cssClass ? ` class="${item.cssClass}"` : '';
        prerequisitesContainer.insertAdjacentHTML("beforeend", `<li${cssClass}${tooltip}>${item.html}</li>`);
      });
    }
  }

  // Add color legend
  const assumptionsSection = qs("#assumptions");
  if (assumptionsSection) {
    // Remove existing legend if any
    const existingLegend = assumptionsSection.querySelector('.assumption-legend');
    if (existingLegend) {
      existingLegend.remove();
    }

    // Create legend HTML
    const legendHTML = `
      <div class="assumption-legend">
        <div class="legend-item">
          <span class="legend-color assumption-principle"></span>
          <span class="legend-label">Principle</span>
        </div>
        <div class="legend-item">
          <span class="legend-color assumption-empirical"></span>
          <span class="legend-label">Empirical</span>
        </div>
        <div class="legend-item">
          <span class="legend-color assumption-approximation"></span>
          <span class="legend-label">Approximation</span>
        </div>
        <div class="legend-item">
          <span class="legend-color dependency-type"></span>
          <span class="legend-label">Builds upon</span>
        </div>
      </div>
    `;

    assumptionsSection.insertAdjacentHTML('beforeend', legendHTML);
  }
}

// Handle direct entry loading via URL parameter in entries.html only
function initializeEntryPage() {
  if (!window.location.pathname.includes("entries.html")) return;
  
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("entry");
  
  if (initial) {
    console.log("Loading entry:", initial);
    loadEntry(initial);
  } else {
    // Show default message when no entry is specified
    $("title").style.display = "";
    $("title").textContent = "Select an entry from the URL or Browse All Entries";
    $("explanation").innerHTML = 'Visit <a href="entries_index.html">Browse All Entries</a> to explore the dataset, or use the URL parameter <code>?entry=filename.json</code> to load a specific entry.';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEntryPage);
} else {
  initializeEntryPage();
}

function loadEntry(filename) {
  const sections = [
    "equations",
    "assumptions",
    "derivationAssumptions",
    "definitions",
    "derivation",
    "programmaticVerification",
    "validityRegime",
    "historicalContext",
    "references",
    "dependencies",
    "supersededBy",
    "meta-domain",
    "meta-created",
    "meta-status",
    "metadata",
  ];
  
  $("title").style.display = "";
  sections.forEach((id) => {
    const el = $(id) || qs(`.${id}`);
    if (el) el.style.display = "";
    if (el && el.querySelector && el.querySelector("h2")) {
      el.querySelector("h2").style.display = "";
    }
  });
  document
    .querySelectorAll("#entryView h2")
    .forEach((h) => (h.style.display = ""));
  
  // Load the entry using the appropriate base URL
  const entryUrl = `${baseUrl}/entries/${filename}`;
  console.log("Fetching entry from:", entryUrl);
  
  fetch(entryUrl)
    .then((r) => {
      console.log("Fetch response status:", r.status);
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      return r.json();
    })
    .then(async (data) => {
      console.log("Entry data loaded successfully:", data.result_name);
      // Load global assumptions before rendering
      await loadGlobalAssumptions();
      render(data);
    })
    .catch((error) => {
      console.error('Error loading entry:', error);
      console.error('Failed URL:', entryUrl);
      $("title").textContent = "Entry not found";
      $("explanation").innerHTML = `Could not load entry "${filename}". <a href="entries_index.html">Browse All Entries</a> to find the correct entry.<br><small>Error: ${error.message}</small>`;
    });
}

// Helper function to safely call MathJax
function safeTypesetMathJax(elements) {
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    return MathJax.typesetPromise(elements);
  } else {
    console.warn('MathJax not available for typesetting');
    return Promise.resolve();
  }
}

// Generate Google Colab link for programmatic verification using pre-generated notebooks
function generateColabLink(data) {
  const entryId = data.result_id;
  
  // Use pre-generated notebook from the repository
  const notebookFilename = `${entryId}_verification.ipynb`;
  const notebookUrl = `${baseUrl}/notebooks/${notebookFilename}`;
  
  // Create Colab link that opens the notebook directly from GitHub
  const colabUrl = `https://colab.research.google.com/github/theoria-dataset/theoria-dataset/blob/main/notebooks/${notebookFilename}`;
  
  const colabLink = $("colab-link");
  if (colabLink) {
    colabLink.href = colabUrl;
    colabLink.target = '_blank';
  }
}

// Render function
function render(data) {
  $("title").style.display = "";
  
  // Check if this is a draft entry
  const isDraft = data.review_status === "draft";
  
  // Set title with AI badge if draft
  if (isDraft) {
    $("title").innerHTML = `<span class="ai-badge" title="AI-generated content awaiting review">🤖</span>${data.result_name}`;
  } else {
    $("title").textContent = data.result_name;
  }
  
  // Show/hide AI disclaimer banner based on draft status
  const aiDisclaimer = document.querySelector('.ai-disclaimer-banner');
  if (aiDisclaimer) {
    aiDisclaimer.style.display = isDraft ? 'block' : 'none';
  }
  
  // Add edit button after title
  const editButton = document.createElement('button');
  editButton.className = 'cta-button edit-entry-btn';
  editButton.innerHTML = '✏️ Edit This Entry';
  editButton.onclick = () => {
    const params = new URLSearchParams(window.location.search);
    const entryFile = params.get("entry");
    if (entryFile) {
      const entryId = entryFile.replace('.json', '');
      window.open(`contribute/form.html?entry=${entryId}`, '_blank');
    }
  };
  
  // Insert edit button after title
  const titleElement = $("title");
  if (titleElement.nextElementSibling && titleElement.nextElementSibling.classList.contains('edit-entry-btn')) {
    titleElement.nextElementSibling.remove(); // Remove existing button
  }
  titleElement.insertAdjacentElement('afterend', editButton);
  
  $("explanation").innerHTML = data.explanation.replace(/\bhbar\b/g, "ℏ");
  // Show all sections and their headings
  [
    "equations",
    "assumptions",
    "derivationAssumptions",
    "definitions",
    "derivation",
    "programmaticVerification",
    "validityRegime",
    "historicalContext",
    "references",
    "dependencies",
    "meta-domain",
    "meta-created",
    "meta-status",
    "metadata",
  ].forEach((id) => {
    const el = $(id) || qs(`.${id}`);
    if (el) el.style.display = "";
    if (el && el.querySelector && el.querySelector("h2")) {
      el.querySelector("h2").style.display = "";
    }
  });
  document
    .querySelectorAll("#entryView h2")
    .forEach((h) => (h.style.display = ""));
  // Render equations as <p> blocks, with titles if present
  const eqDiv = $("equations-content");
  eqDiv.innerHTML = (data.result_equations || [])
    .map((eq) => {
      const titleSpan = eq.equation_title
        ? `<span class='equation-result-title'>${eq.equation_title}</span> `
        : '';
      return `<p>${titleSpan}${formatLongEquation(eq.equation)}</p>`;
    })
    .join("");
  safeTypesetMathJax([eqDiv]);
  // Render prerequisites (assumptions + dependencies) with unified structure
  renderPrerequisites(data);
  safeTypesetMathJax([qs("#assumptions")]);

  // Ensure derivation sections are visible
  $("derivation").style.display = "";
  $("derivationSteps").style.display = "";

  // Hide derivation assumptions section since assumptions are now unified above
  $("derivationAssumptions").style.display = "none";

  // Render derivation steps into #derivationSteps ol
  const ol = qs("#derivationSteps ol");
  ol.innerHTML = "";
  (data.derivation || []).forEach((step) => {
    let html = "";

    // Check if this step proves an equation from result_equations
    let equationTitle = null;
    if (step.equation_proven) {
      const resultEq = (data.result_equations || []).find(eq => eq.id === step.equation_proven);
      if (resultEq && resultEq.equation_title) {
        equationTitle = resultEq.equation_title;
      }
    }

    // Add assumption references if present
    if (step.assumptions && step.assumptions.length > 0) {
      step.assumptions.forEach((assumptionId) => {
        const resolved = resolveAssumption(assumptionId, data);
        if (resolved.type === 'global' || resolved.type === 'dependency') {
          const assumptionBadge = `<strong class="step-assumption-label">Use</strong> <a href="#assumption-${resolved.id}" class="step-assumption-ref assumption-${resolved.assumptionType}" title="${resolved.text}">${resolved.title}</a>`;
          html += `<div class='step-assumption'>${assumptionBadge}</div>`;
        }
      });
    }

    if (step.description) {
      const descriptionFixed = step.description.replace(/\bhbar\b/g, "ℏ");
      html += `<div class='step-expl'>${descriptionFixed}</div>`;
    }
    if (step.equation) {
      // Break long equations at logical points
      const formattedEquation = formatLongEquation(step.equation);
      // Add proven badge with equation title if applicable
      let provenBadge = '';
      if (step.equation_proven && equationTitle) {
        provenBadge = `<span class='equation-proven-badge' title='Proven equation: ${equationTitle}'><span class='proven-checkmark'>✓</span> ${equationTitle}</span>`;
      }
      html += `<div class='step-eq'>${formattedEquation}${provenBadge}</div>`;
    } else if (step.text) {
      const textFixed = step.text.replace(/\bhbar\b/g, "ℏ");
      html += `<div class='step-text'>${textFixed}</div>`;
    }
    ol.insertAdjacentHTML("beforeend", `<li>${html}</li>`);
  });
  safeTypesetMathJax([qs("#derivationSteps")]);

  const tbody = qs("#definitions tbody");
  tbody.innerHTML = "";
  data.definitions.forEach((d) => {
    // Replace hbar with Unicode ℏ for correct rendering
    const symbolFixed = d.symbol.replace(/\bhbar\b/g, "ℏ");
    const definitionFixed = d.definition.replace(/\bhbar\b/g, "ℏ");
    // Ensure symbol is wrapped in backticks if it's not already
    const symbol = symbolFixed.startsWith("`") ? symbolFixed : `\`${symbolFixed}\``;
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr><td>${symbol}</td><td>${definitionFixed}</td></tr>`
    );
  });
  safeTypesetMathJax([qs("#definitions")]);

  // Programmatic verification
  $("pv-language").textContent = data.programmatic_verification.language;
  $("pv-library").textContent = data.programmatic_verification.library;
  const codeEl = $("pv-code");
  codeEl.textContent = data.programmatic_verification.code.join("\n");
  hljs.highlightElement(codeEl);
  
  // Generate Google Colab link
  generateColabLink(data);
  
  safeTypesetMathJax([qs("#programmaticVerification")]);

  renderList("#references ul", data.references, (r) => r.citation);
  safeTypesetMathJax([qs("#references")]);

  // Render validity regime
  // validity_regime section removed - now integrated into assumptions

  // Render historical context
  if (data.historical_context) {
    const importanceEl = qs("#historical-importance p");
    if (importanceEl) {
      importanceEl.textContent = data.historical_context.importance || "";
    }
    
    const periodEl = qs("#historical-period p");
    if (periodEl) {
      periodEl.textContent = data.historical_context.development_period || "";
    }
    
    renderList(
      "#historical-insights ul",
      data.historical_context.key_insights || [],
      (i) => i
    );
    safeTypesetMathJax([qs("#historicalContext")]);
  }

  // Dependencies section - now integrated into prerequisites section
  qs("#dependencies").style.display = "none";

  // Superseded by section - only show if data exists
  if (data.superseded_by && data.superseded_by.length > 0) {
    renderList(
      "#supersededBy ul",
      data.superseded_by,
      (d) => `<a href="entries.html?entry=${d}.json">${d.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</a>`,
      true
    );
    safeTypesetMathJax([qs("#supersededBy")]);
  } else {
    qs("#supersededBy").style.display = "none";
  }

  $("meta-domain").textContent = data.domain;
  $("meta-created").textContent = data.contributors?.map(c => c.full_name).join(', ') || 'Unknown';
  $("meta-status").textContent = data.review_status;

  // Show/hide draft watermark based on review status (isDraft already defined above)
  console.log("Review status:", data.review_status, "Is draft:", isDraft); // Debug log

  const draftWatermarks = document.querySelectorAll(".draft-watermark");
  draftWatermarks.forEach((watermark) => {
    watermark.style.display = isDraft ? "block" : "none";
  });

  // Add draft class to derivation sections if in draft status
  const derivationSections = document.querySelectorAll(".derivation-section");
  derivationSections.forEach((section) => {
    if (isDraft) {
      section.classList.add("draft");
    } else {
      section.classList.remove("draft");
    }
  });

  // Ensure metadata section is visible
  const metaSection = qs(".metadata");
  if (metaSection) metaSection.style.display = "";

  // Typeset math for the whole entry view as a fallback
  safeTypesetMathJax([qs("#entryView")]);
}

function renderList(sel, arr, fn, rawHtml = false) {
  const el = qs(sel);
  if (!el) return;
  el.innerHTML = "";
  arr.forEach((item) => {
    const text = fn(item);
    if (rawHtml) {
      el.insertAdjacentHTML("beforeend", `<li>${text}</li>`);
      return;
    }
    const wrappedText = text.replace(/`([^`]+)`/g, (match, expr) => {
      // Replace hbar token with unicode ℏ for correct rendering
      const exprFixed = expr.replace(/\bhbar\b/g, "ℏ");
      // If the expression contains an equals sign, split and wrap
      if (exprFixed.includes("=")) {
        return exprFixed
          .split("=")
          .map((part) => `\`${part.trim()}\``)
          .join(" = ");
      }
      return `\`${exprFixed}\``;
    });
    el.insertAdjacentHTML("beforeend", `<li>${wrappedText}</li>`);
  });
}
