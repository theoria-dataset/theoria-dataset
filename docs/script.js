/* filepath: c:\Users\Manuel\Google Drive\TheorIA Dataset\docs\script.js */
// Helpers
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);

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
    .then((data) => {
      console.log("Entry data loaded successfully:", data.result_name);
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

// Render function
function render(data) {
  $("title").style.display = "";
  $("title").textContent = data.result_name;
  
  // Add edit button after title
  const editButton = document.createElement('button');
  editButton.className = 'cta-button edit-entry-btn';
  editButton.innerHTML = '✏️ Edit This Entry';
  editButton.onclick = () => {
    const params = new URLSearchParams(window.location.search);
    const entryFile = params.get("entry");
    if (entryFile) {
      const entryId = entryFile.replace('.json', '');
      window.open(`contribute/edit-entry.html?entry=${entryId}`, '_blank');
    }
  };
  
  // Insert edit button after title
  const titleElement = $("title");
  if (titleElement.nextElementSibling && titleElement.nextElementSibling.classList.contains('edit-entry-btn')) {
    titleElement.nextElementSibling.remove(); // Remove existing button
  }
  titleElement.insertAdjacentElement('afterend', editButton);
  
  $("explanation").innerHTML = data.explanation;
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
  // Render equations as <p> blocks, not as a list
  const eqDiv = $("equations-content");
  eqDiv.innerHTML = (data.result_equations || [])
    .map((eq) => `<p>\`${eq.equation}\`</p>`)
    .join("");
  safeTypesetMathJax([eqDiv]);
  renderList("#assumptions ul", data.equations_assumptions, (a) => a.text);
  safeTypesetMathJax([qs("#assumptions")]);

  // Ensure derivation sections are visible
  $("derivation").style.display = "";
  $("derivationAssumptions").style.display = "";
  $("derivationSteps").style.display = "";

  // Render derivation assumptions
  renderList(
    "#derivationAssumptions ul",
    data.derivation_assumptions,
    (a) => a.text
  );
  safeTypesetMathJax([qs("#derivationAssumptions")]);

  // Render derivation steps into #derivationSteps ol
  const ol = qs("#derivationSteps ol");
  ol.innerHTML = "";
  const explanationMap = {};
  (data.derivation_explanation || []).forEach(
    (e) => (explanationMap[e.step] = e.text)
  );
  (data.derivation || []).forEach((step) => {
    let html = "";
    if (explanationMap[step.step]) {
      html += `<div class='step-expl'>${explanationMap[step.step]}</div>`;
    }
    if (step.equation) {
      html += `<div class='step-eq'>\`${step.equation}\`</div>`;
    } else if (step.text) {
      html += `<div class='step-text'>${step.text}</div>`;
    }
    ol.insertAdjacentHTML("beforeend", `<li>${html}</li>`);
  });
  safeTypesetMathJax([qs("#derivationSteps")]);

  const tbody = qs("#definitions tbody");
  tbody.innerHTML = "";
  data.definitions.forEach((d) => {
    // Ensure symbol is wrapped in backticks if it's not already
    const symbol = d.symbol.startsWith("`") ? d.symbol : `\`${d.symbol}\``;
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr><td>${symbol}</td><td>${d.definition}</td></tr>`
    );
  });
  safeTypesetMathJax([qs("#definitions")]);

  // Programmatic verification
  $("pv-language").textContent = data.programmatic_verification.language;
  $("pv-library").textContent = data.programmatic_verification.library;
  const codeEl = $("pv-code");
  codeEl.textContent = data.programmatic_verification.code.join("\n");
  hljs.highlightElement(codeEl);
  safeTypesetMathJax([qs("#programmaticVerification")]);

  renderList("#references ul", data.references, (r) => r.citation);
  safeTypesetMathJax([qs("#references")]);

  // Render validity regime
  if (data.validity_regime) {
    renderList(
      "#validity-conditions ul",
      data.validity_regime.conditions || [],
      (c) => c
    );
    renderList(
      "#validity-limitations ul",
      data.validity_regime.limitations || [],
      (l) => l
    );
    safeTypesetMathJax([qs("#validityRegime")]);
  }

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

  renderList(
    "#dependencies ul",
    data.dependencies || [],
    (d) => `<a href="entries.html?entry=${d}.json">${d.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</a>`,
    true
  );
  safeTypesetMathJax([qs("#dependencies")]);

  $("meta-domain").textContent = data.domain;
  $("meta-created").textContent = data.created_by;
  $("meta-status").textContent = data.review_status;

  // Show/hide draft watermark based on review status
  const isDraft = data.review_status === "draft";
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
