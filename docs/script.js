/* filepath: c:\Users\Manuel\Google Drive\TheorIA Dataset\docs\script.js */
// Helpers
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);

// View toggling
const homeView = $("homeView");
const entryView = $("entryView");
const viewToggleBtn = $("viewToggleBtn");

function showEntryView() {
  homeView.classList.add("hidden");
  entryView.classList.remove("hidden");
}

viewToggleBtn.addEventListener("click", () => {
  entryView.classList.add("hidden");
  homeView.classList.remove("hidden");
});

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

// Populate entries for both selectors
fetch("index.json")
  .then((r) => r.json())
  .then((list) => {
    list.forEach((fn) => {
      // For the main entry view
      const o1 = document.createElement("option");
      o1.value = fn;
      o1.textContent = fn.replace(".json", "");
      $("entrySelector").appendChild(o1);

      // For the home page entry selector
      const o2 = document.createElement("option");
      o2.value = fn;
      o2.textContent = fn.replace(".json", "");
      $("homeEntrySelector").appendChild(o2);
    });
  });

// Handler for entry selector on home page
$("homeEntrySelector").addEventListener("change", () => {
  const file = $("homeEntrySelector").value;
  if (!file) return; // If "View entries" is selected

  // Set the same value to the other selector
  $("entrySelector").value = file;

  // Show entry view
  showEntryView();

  // Load the entry using the appropriate base URL
  fetch(`${baseUrl}/entries/${file}`)
    .then((r) => r.json())
    .then(render)
    .catch(console.error);
});

// Handler for entry selector in entry view
$("entrySelector").addEventListener("change", () => {
  const file = $("entrySelector").value;
  if (!file) return;

  // Load the entry using the appropriate base URL
  fetch(`${baseUrl}/entries/${file}`)
    .then((r) => r.json())
    .then(render)
    .catch(console.error);
});

// Render function
function render(data) {
  $("title").textContent = data.result_name;
  $("explanation").innerHTML = data.explanation;
  renderList(
    "#equations ul",
    data.result_equations,
    (eq) => "`" + eq.equation + "`"
  );
  renderList("#assumptions ul", data.equations_assumptions, (a) => a.text);
  renderList(
    "#derivationAssumptions ul",
    data.derivation_assumptions,
    (a) => a.text
  );

  const tbody = qs("#definitions tbody");
  tbody.innerHTML = "";
  data.definitions.forEach((d) => {
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr><td>${d.symbol}</td><td>${d.definition}</td></tr>`
    );
  });

  const ol = qs("#derivation ol");
  ol.innerHTML = "";
  const map = {};
  (data.derivation_explanation || []).forEach((e) => (map[e.step] = e.text));
  data.derivation.forEach((step) => {
    const expl = map[step.step]
      ? `<p class='step-expl'>${map[step.step]}</p>`
      : "";
    const body = step.equation
      ? `<p class='step-eq'>\`${step.equation}\`</p>`
      : `<p>${step.text || ""}</p>`;
    ol.insertAdjacentHTML("beforeend", `<li>${expl}${body}</li>`);
  });

  $("pv-language").textContent = data.programmatic_verification.language;
  $("pv-library").textContent = data.programmatic_verification.library;
  const codeEl = $("pv-code");
  codeEl.textContent = data.programmatic_verification.code.join("\n");
  hljs.highlightElement(codeEl);

  renderList("#references ul", data.references, (r) => r.citation);

  $("meta-domain").textContent = data.domain;
  $("meta-dataset").textContent = data.dataset_version;
  $("meta-created").textContent = data.created_by;
  $("meta-status").textContent = data.review_status;

  // Typeset math
  MathJax.typesetPromise();
}

function renderList(sel, arr, fn) {
  const el = qs(sel);
  if (!el) return;
  el.innerHTML = "";
  arr.forEach((item) =>
    el.insertAdjacentHTML("beforeend", `<li>${fn(item)}</li>`)
  );
}
