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

// Populate entries for the selector in entries.html only
if (window.location.pathname.includes("entries.html")) {
  fetch("index.json")
    .then((r) => r.json())
    .then((list) => {
      list.forEach((fn) => {
        const o1 = document.createElement("option");
        o1.value = fn;
        o1.textContent = fn.replace(".json", "");
        $("entrySelector").appendChild(o1);
      });
      const params = new URLSearchParams(window.location.search);
      const initial = params.get("entry");
      if (initial) {
        $("entrySelector").value = initial;
        $("entrySelector").dispatchEvent(new Event("change"));
      }
    });

  // Handler for entry selector in entry view
  $("entrySelector").addEventListener("change", () => {
    const file = $("entrySelector").value;
    const sections = [
      "equations",
      "assumptions",
      "derivationAssumptions",
      "definitions",
      "derivation",
      "programmaticVerification",
      "references",
      "dependencies",
      "meta-domain",
      "meta-created",
      "meta-status",
      "metadata",
    ];
    // Also hide all section titles (h2, h1, etc) when no entry is selected
    if (!file) {
      $("title").style.display = "none";
      $("explanation").textContent = "Select any entry to show it.";
      // Hide all sections and their headings
      sections.forEach((id) => {
        const el = $(id) || qs(`.${id}`);
        if (el) el.style.display = "none";
        // Hide section headings (h2) inside each section
        if (el && el.querySelector && el.querySelector("h2")) {
          el.querySelector("h2").style.display = "none";
        }
      });
      // Hide all h2s globally (for metadata section)
      document
        .querySelectorAll("#entryView h2")
        .forEach((h) => (h.style.display = "none"));
      return;
    }
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
    fetch(`${baseUrl}/entries/${file}`)
      .then((r) => r.json())
      .then(render)
      .catch(console.error);
  });
}

// Render function
function render(data) {
  $("title").style.display = "";
  $("title").textContent = data.result_name;
  $("explanation").innerHTML = data.explanation;
  // Show all sections and their headings
  [
    "equations",
    "assumptions",
    "derivationAssumptions",
    "definitions",
    "derivation",
    "programmaticVerification",
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
  MathJax.typesetPromise([eqDiv]);
  renderList("#assumptions ul", data.equations_assumptions, (a) => a.text);
  MathJax.typesetPromise([qs("#assumptions")]);

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
  MathJax.typesetPromise([qs("#derivationAssumptions")]);

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
  MathJax.typesetPromise([qs("#derivationSteps")]);

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
  MathJax.typesetPromise([qs("#definitions")]);

  // Programmatic verification
  $("pv-language").textContent = data.programmatic_verification.language;
  $("pv-library").textContent = data.programmatic_verification.library;
  const codeEl = $("pv-code");
  codeEl.textContent = data.programmatic_verification.code.join("\n");
  hljs.highlightElement(codeEl);
  MathJax.typesetPromise([qs("#programmaticVerification")]);

  renderList("#references ul", data.references, (r) => r.citation);
  MathJax.typesetPromise([qs("#references")]);

  renderList(
    "#dependencies ul",
    data.dependencies || [],
    (d) => `<a href="entries.html?entry=${d}">${d.replace(/\.json$/, "")}</a>`,
    true
  );
  MathJax.typesetPromise([qs("#dependencies")]);

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
  MathJax.typesetPromise([qs("#entryView")]);
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
