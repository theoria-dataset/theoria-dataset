# Contributing to TheorIA Dataset

Welcome to TheorIA dataset! This dataset is being built, and it is designed to provide a high quality collection of theoretical physics equations, derivations, and explanations in a structured format. We encourage contributions from researchers, educators, and enthusiasts in the field of theoretical physics. We need your help to expand the dataset with new entries, peer review existing enties, and ensure the high quality of the content.

To facilitate your contributions, please follow the guidelines below, that explain the structure of each entry in the dataset, as well as its requirements.

IMPORTANT: this CONTRIBUTING.md file is auotmatically generated based on the `entry.shema.json` file, which holds the source of truth on the requirements for each entry.
## Dataset Entry structure

Each entry of the dataset should be a self contained relevant physics result. They are expressed in JSON format, and the following fields are required in each entry. All entries should be valid according to the schema defined in `schemas/entry.schema.json`.

- **`result_id`:**
  - Unique identifier that must exactly match the filename (without
  - json extension)
  - Use lowercase letters, numbers, and underscores only
  - Choose descriptive names that clearly identify the physics concept
  - Example:
    `lagrangian_mechanics`

- **`result_name`:**
  - Brief title to identify the entry
  - Keep concise (max 100 characters) and descriptive
  - Should clearly identify the physics concept

- **`result_equations`:**
  - List of equations in AsciiMath format
  - Provide each equation with a unique ID (e
  - g
  - , 'eq1', 'eq2')
  - Use AsciiMath format for all equations
  - Example:
    ```json
    [
      {
        "id": "eq1",
        "equation": "t' = gamma*(t - (v/c^2)*x)"
      }
    ]
    ```

- **`explanation`:**
  - Provide a brief (2–5 sentences, max 100 words) conceptual summary of the theoretical result or equation
  - Assume the reader has a graduate-level understanding of physics
  - Use clear and concise language to explain the significance, usage, and context of the theoretical result
  - Content should include: Definition or main concept, Why it matters in physics, How it's used or where it appears
  - Avoid derivation steps (covered in the derivation section), dense notation or inline math, empty generalities (e
  - g
  - , "This is important in physics"), or overly technical jargon
  - If, exceptionally, there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format
  - Example:
    `Lorentz transformations describe how space and time coordinates change between inertial frames moving relative to each other, ensuring the invariance of the speed of light and the spacetime interval. They are foundational to special relativity and crucial for understanding time dilation and length contraction.`

- **`definitions`:**
  - Define every symbol used in the result_equations to ensure the entry is self-contained by defining all symbols
  - Each definition should include a symbol field, with the symbol represented in AsciiMath format and a definition field
  - If there are math symbols or equations included in the definition, they must be enclosed in backticks (``) and written in AsciiMath format
  - Example:
    ```json
    [
      {
        "symbol": "c",
        "definition": "Speed of light in vacuum."
      }
    ]
    ```

- **`assumptions`:**
  - Assumptions that lead to the result equations, which usually are either first principles, results from another entry specified in 'dependencies' or empirical results
  - List all assumptions required for the derivation
  - Use sequential IDs like 'assumption1', 'assumption2'
  - If there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format

- **`derivation`:**
  - Provide a formal derivation of the result, including all steps, equations in AsciiMath format, and descriptions
  - Derivation should start from either first principles (listed in the field 'assumptions') or from other results derived in another entry, which should be specified in the 'dependencies' field
  - Each step should contain the `step` (an integer, in sequential order), `description` (textual rationale), and `equation` (AsciiMath format) fields
  - Include all steps for complete derivation
  - Use very explicit detail level for easy following
  - Example:
    ```json
    [
      {
        "step": 1,
        "description": "Apply general linear transformation between reference frames.",
        "equation": "x' = A*x + B*t; t' = D*x + E*t"
      },
      {
        "step": 2,
        "description": "For an object at rest in the moving frame, x'=0 always.",
        "equation": "0 = A*v*t + B*t"
      }
    ]
    ```

- **`programmatic_verification`:**
  - Code that verifies the derivation correctness
  - Use minimal dependencies (pure Python or sympy)
  - Should follow the steps of the derivation, explicitly in the comments
  - Include assert statements to verify correctness

- **`domain`:**
  - ArXiv category identifier (e
  - g
  - , 'gr-qc', 'hep-th') from https://arxiv
  - org/category_taxonomy
  - Use official arXiv taxonomy identifiers

- **`theory_status`:**
  - Current scientific status of the theory
  - current: Modern theories widely accepted by scientific community
  - historical: Important for development but superseded by better theories
  - approximation: Valid simplifications of more general theories
  - limiting_case: Special cases with restricted applicability
  - superseded: Completely replaced by more accurate theories

- `validity_regime`:
  - Physical conditions where theory applies and limitations
  - Use for theories with specific applicability ranges
  - Include both conditions where valid and limitations

- `superseded_by`:
  - Theories that supersede or generalize this result
  - Use exact result_id values (without
  - json extension)
  - Must reference existing entries in the dataset

- `approximation_of`:
  - The more general theory this approximates
  - Use exact result_id value (without
  - json extension)

- `historical_context`:
  - Educational context about theory's development
  - Provide importance, development period, and key insights

- **`references`:**
  - Academic citations (1-3 references in APA style)
  - Use APA format: Author(s)
  - (Year)
  - Title
  - Publisher/Journal, volume(issue), pages
  - DOI/URL
  - Example:
    ```json
    [
      {
        "id": "R1",
        "citation": "Einstein, A. (1905). 'On the Electrodynamics of Moving Bodies.' *Annalen der Physik*, 17, 891\u2013921."
      }
    ]
    ```

- `dependencies`:
  - Other entries this result relies on
  - Use exact result_id values (without
  - json extension)
  - Only include direct dependencies

- **`review_status`:**
  - Review status of the entry
  - Use 'draft' for initial submissions
  - Use 'reviewed' for entries approved for main dataset

## Testing

To ensure the quality and correctness of entries, run these commands:

```bash
make test
make test-entry FILE=name
make validate FILE=name
docker-compose run --rm theoria-tests
```

## Version Control & Collaboration

- We will use Git and GitHub for versioning.
- Submit pull requests for new entries or changes.
- Ensure your JSON files validate against the schema (CI will check this automatically).

## Example

See `entries/special_relativity.json` for a complete, compliant example.

Happy contributing!
