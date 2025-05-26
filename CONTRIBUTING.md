# Contributing to TheorIA Dataset

Welcome to TheorIA dataset! This dataset is being built, and it is designed to provide a high quality collection of theoretical physics equations, derivations, and explanations in a structured format. We encourage contributions from researchers, educators, and enthusiasts in the field of theoretical physics. We need your help to expand the dataset with new entries, peer review existing enties, and ensure the high quality of the content.

To facilitate your contributions, please follow the guidelines below, that explain the structure of each entry in the dataset, as well as its requirements.

## Fields Guidelines

The following fields are required in each entry JSON file. Ensure that all entries are valid according to the schema defined in `schemas/entry.schema.json`.

- **`result_name`:** A brief title (max 100 characters) to identify the entry.

- **`result_equations`:**
  - Provide each equation as a list with representations in [AsciiMath](https://asciimath.org/).
  - Include an `equation_id` for each equation (e.g., "eq1", "eq2" or a short tag that identifies the equation).
  - The equation should be added under the `equation` field.
  - For example:
    ```json
    "result_equations": [
        {
            "id": "eq1",
            "equation": "t' = gamma*(t - (v/c^2)*x)"
        }
    ]
    ```
- **`explanation`:**

  - Provide a brief (2–5 sentences, max 100 words) conceptual summary of the theoretical result or equation.
  - Assume the reader has a graduate-level understanding of physics.
  - Use clear and concise language to explain the significance, usage, and context of the theoretical result.
  - Content should include:
    - Definition or main concept.
    - Why it matters in physics.
    - How it's used or where it appears.
  - Avoid derivation steps (covered in the `derivation_explanation` section), dense notation or inline math, empty generalities (e.g., "This is important in physics"), or overly technical jargon.
  - If, exceptionally, there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format.
  - For example:

  ```json
  "explanation": "Lorentz transformations describe how space and time coordinates change between inertial frames moving relative to each other, ensuring the invariance of the speed of light and the spacetime interval. They are foundational to special relativity and crucial for understanding time dilation and length contraction."
  ```

- **`equations_assumptions`:**

  - List any assumptions directly related to the equations.
  - If there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format.
  - For example:

  ```json
      {
      "id": "eq_assump1",
      "text": "The transformation is performed only along the x-axis, meaning that the `y` and `z` coordinates remain unchanged."
    },
  ```

- **`definitions`:**

  - Define every symbol used in the `result_equations` field, to ensure the entry is self-contained.
  - Each definition should include a `symbol` field, with the symbol represented in AsciiMath format and a `definition` field.
  - If there are math symbols or equations included in the definition, they must be enclosed in backticks (``) and written in AsciiMath format.
  - For example:

  ```json
  "definitions": [
      {
          "symbol": "c",
          "definition": "Speed of light in vacuum."
      }
  ]

  ```

  - **`derivation`:**
  - Provide a formal derivation of the result, including all steps and equations in AsciiMath format. If the equation cannot be derived from other first principles, the
  - Each step should contain the `id` and `equation` fields.
  - The `step` field should be an integer, following the sequential order of the reasoning process.
  - The `equation` field should contain the equation in AsciiMath format, without any additional text such as explanations or assumptions.
  - Ensure a very explicit detail level that makes it trivial to follow the derivation.

  - For example:

  ```json
   "derivation": [
    {
      "step": 1,
      "equation": "x' = A*x + B*t; t' = D*x + E*t"
    },
    {
      "step": 2,
      "equation": "0 = A*v*t + B*t"
    },
    {
      "step": 3,
      "equation": "B = -A*v"
    }
    ... ]
  ```

  - Refer to the [lorentz transformation](entries\lorentz_transformations.json) entry for a full example.

- **`derivation_assumptions`:**

  - Specify the assumptions behind the derivation.
  - Each assumption should have a unique "id" ("assumption1", "assumption2",...) and a "text" description.
  - If there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format.
  - For example:

  ```json
  "derivation_assumptions": [
      {
          "id": "assumption1",
          "text": "The speed of light is constant in all inertial frames."
      }
  ]
  ```

- **`derivation_explanation`:**

  - Add textual explanations for each step. Not all steps need explanations, as some may be self-evident.
  - If new symbols appear, define them.
  - Each explanation object consists of:
    - "step": An integer that must coincide with the corresponding one in the `derivation`.
    - "text": A concise and clear description of the rationale behind certain steps in the derivation process.
  - If there are math symbols or equations included in the `text`, they must be enclosed in backticks (``) and written in AsciiMath format.
  - For example:

  ```json
    "derivation_explanation": [
    {
      "step": 1,
      "text": "Postulate the most general linear transformation between coordinates in two inertial frames."
    },
    {
      "step": 2,<>
      "text": "Impose that the spatial origin of S' (x' = 0) moves as x = v·t in S."
    },
    {
      "step": 3,
      "text": "Get the relationship between coefficients A and B."
    },
    ...
    ]
  ```

  - Refer to the [lorentz transformation](entries\lorentz_transformations.json) entry for a full example.

- **`programmatic_verification`:**

  - Includes a programmatic verification of the derivation, ensuring correctness and verifiability.
  - Should be a JSON object that includes:
    - `language`: The programming language used for the verification and its version (e.g. `python 3.11.12`). Note that you can obtain the version using `python --version` in the terminal or `import sys; print(sys.version)` in the runtime.
    - `library`: The library used for the verification and its version (e.g. `sympy 1.31.1`). You can obtain the version using `pip show sympy` in the terminal or `import sympy; print(sympy.__version__)` in the runtime.
  - Comment the code to explain the logic of the verification, mentioning the steps of the `derivation_explanation`.
  - Include short comments before each part of the code referencing the relevant derivation step (e.g. `# Step 2: integrate by parts`).
  - Include an `assert` or equivalent statement in the end to verify the correctness of the derivation.
  - See a full example in the [lorentz transformation](entries/lorentz_transformations.json) entry.
  - Note that in the json each line is a string with quotes and a comma. To make it easier to run, you can use a code like this, where you can copy and paste the lines of code directly from the JSON to the `lines` variable:

  ```python
  # List of code lines as strings
  lines = [
      "import sympy as sp",
      "",
      "# symbols and function",
      "k, hbar, m, V = sp.symbols('k hbar m V', real=True)",
      "x, t = sp.symbols('x t')",
      "psi = sp.exp(sp.I*(k*x - (k**2*hbar/(2*m) + V/hbar)*t))",
      "",
      "# define Schrödinger LHS and RHS",
      "lhs = sp.I*hbar*sp.diff(psi, t)",
      "rhs = -hbar**2/(2*m)*sp.diff(psi, x, 2) + V*psi",
      "",
      "# verify that LHS - RHS simplifies to zero",
      "assert sp.simplify(lhs - rhs) == 0"
  ]

  # Join the lines into a single code block and execute
  code = "\n".join(lines)
  exec(code)

  # If no assertion error, we know it passed
  print("Verification successful!")
  ```

- **`domain`:** Identifier coming from the [arXiv category taxonomy](https://arxiv.org/category_taxonomy) (e.g., "gr-qc") .

- **`references`:**
  - Include 1–3 full citations, using APA style where possible. Should be formatted as: `Author(s). (Year). *Title*. Publisher / Journal, volume(issue), pages. DOI/URL` unless is not possible.
- For example:

```json
"references": [
{
  "id": "R1",
  "citation": "Einstein, A. (1905). 'On the Electrodynamics of Moving Bodies.' *Annalen der Physik*, 17, 891–921."
},
{
  "id": "R2",
  "citation": "Taylor, E. F., & Wheeler, J. A. (1992). *Spacetime Physics*. W. H. Freeman and Company."
}
]
```

- **`dependencies`:**
  - Optional list of other entry filenames that this result relies on.
  - Use the `.json` filenames exactly as listed in `docs/index.json`.
  - Example:

  ```json
  "dependencies": [
    "dirac_equation_free.json",
    "maxwell_equations.json"
  ]
  ```

- **`created_ by`:** Full name or ORCID of author of the entry.

- **`review_status`:** Use "draft" for initial submissions. Final datasets published in main must be marked as "reviewed".

## Version Control & Collaboration

- We will use Git and GitHub for versioning.
- Submit pull requests for new entries or changes.
- Ensure your JSON files validate against the schema (CI will check this automatically).

## Example

See `entries/lorentz_transformations.json` for a complete, compliant example.

Happy contributing!
