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
fetch("index.json")
  .then((r) => r.json())
  .then((list) => {
    list.forEach((fn) => {
      const o1 = document.createElement("option");
      o1.value = fn;
      o1.textContent = fn.replace(".json", "");
      $("entrySelector").appendChild(o1);
    });
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
    "meta-domain",
    "meta-dataset",
    "meta-created",
    "meta-status",
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
    "meta-domain",
    "meta-dataset",
    "meta-created",
    "meta-status",
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
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr><td>${d.symbol}</td><td>${d.definition}</td></tr>`
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

  $("meta-domain").textContent = data.domain;
  $("meta-dataset").textContent = data.dataset_version;
  $("meta-created").textContent = data.created_by;
  $("meta-status").textContent = data.review_status;

  // Ensure metadata section is visible
  const metaSection = qs(".metadata");
  if (metaSection) metaSection.style.display = "";

  // Typeset math for the whole entry view as a fallback
  MathJax.typesetPromise([qs("#entryView")]);
}

function renderList(sel, arr, fn) {
  const el = qs(sel);
  if (!el) return;
  el.innerHTML = "";
  arr.forEach((item) =>
    el.insertAdjacentHTML("beforeend", `<li>${fn(item)}</li>`)
  );
}
