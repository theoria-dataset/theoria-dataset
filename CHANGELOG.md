# Changelog

All notable changes to the Theoretical Physics Inference Dataset will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - Multiple assumptions per derivation step, hbar fixes - 2025-01-19

### Changed

- **Breaking change**: Derivation step `assumption` field renamed to `assumptions` (array)
  - Schema change in `schemas/entry.schema.json`: `assumption` (string) → `assumptions` (array of strings)
  - Each derivation step can now reference multiple global assumptions or dependencies
  - Format: `"assumptions": ["assumption_id_1", "assumption_id_2"]`
  - All 11 existing entries with step-level assumptions migrated to new format
  - Updated validation scripts: `validate_assumptions_usage.py`, `validate_dependencies.py`
  - Updated frontend display: `docs/script.js` now renders multiple assumption badges per step
  - Auto-generated documentation updated: `CONTRIBUTING.md`, `docs/contribute/form_requirements.js`

### Migration Notes

- Entries migrated: blackbody_radiation, born_rule, keplers_laws, least_action_principle, maxwell_equations, noethers_theorem, relativistic_energy_momentum, schrodinger_equation, special_relativity_transformations, speed_of_light, vis_viva
- Old format: `"assumption": "id"` → New format: `"assumptions": ["id"]`
- All entries pass schema validation with new structure

### Fixed

- **hbar rendering**: Fixed rendering of reduced Planck constant symbol (ℏ) across all pages
  - Centralized MathJax configuration in `docs/mathjax-config.js`
  - Added hbar → ℏ replacement in `docs/script.js` for equations, derivations, definitions, and assumptions
  - Added hbar → ℏ replacement in `scripts/generate_assumptions_page.py` for static HTML generation
  - Now renders correctly in: equations, derivation steps, step descriptions, definitions table, assumptions boxes, and assumptions page

## [0.6.2] - New assumption page and better checks for integration - 2025-01-18

### Added

- New assumptions browser page (`docs/assumptions.html`):
  - Browse all global assumptions organized by type (Principles, Empirical, Approximations)
  - View mathematical expressions, symbol definitions, and explanatory text for each assumption
  - Clickable cross-references showing which entries use each assumption
  - Integrated into main navigation from homepage and entries index
  - Automatically generated via `scripts/generate_assumptions_page.py`
  - Added to `make pre-push` workflow for automatic updates
- New global assumption for quantum field theory:
  - `electromagnetic_field_quantization` (principle): Electromagnetic field quantization with discrete energy levels `E_n = n*h*nu`
- Enhanced `validate_dependencies.py` with three new validation checks for CI:
  - **Assumption ID validation (Section 4)**: Strictly enforces that all assumption references must be valid global assumption IDs from `globals/assumptions.json`
    - ERROR for reviewed entries with invalid assumption IDs
    - WARNING for draft entries with invalid assumption IDs (old inline format)
  - **Step-level assumption validation (Section 5)**: Ensures all assumptions referenced in derivation steps are declared in entry's `assumptions` or `depends_on` fields
    - ERROR for reviewed entries with undeclared step assumptions
    - WARNING for draft entries with undeclared step assumptions
  - **`used_in` field validation (Section 6)**: Bidirectional validation between assumptions and entries
    - ERROR if reviewed entry uses assumption but isn't listed in assumption's `used_in` field
    - ERROR if assumption's `used_in` lists reviewed entry that doesn't reference it
    - WARNING for similar issues with draft entries
- Added `validate_dependencies.py` to CI/CD workflow (`validate_entries.yaml`)

### Fixed

- Fixed invalid assumption reference in `blackbody_radiation.json` (now uses `electromagnetic_field_quantization` global assumption)
- Reviewed entries now strictly validated for assumption reference correctness
- Prevents reviewed entries from being merged with invalid assumption IDs or missing `used_in` declarations

## [0.6.1] - Maxwell equations review and global assumptions consolidation - 2025-01-17

### Added

- New global assumptions for electromagnetism:
  - `classical_electromagnetism_framework` (principle): Classical field theory framework with vector calculus theorems
  - `vacuum_linear_isotropic` (approximation): Linear, homogeneous, isotropic vacuum properties with constitutive relations
  - `no_magnetic_monopoles` (empirical): Empirical absence of isolated magnetic charges
  - `coulomb_law` (empirical): Coulomb's inverse-square law for electric charges
  - `faraday_induction` (empirical): Faraday's law of electromagnetic induction
  - `ampere_biot_savart` (empirical): Ampère-Biot-Savart law for steady currents
- New entry: `speed_of_light` - Speed of light in vacuum

### Changed

- Maxwell equations entry: reviewed.
- Removed magnetic_field.json and electric_field.json as they are redundant.
- Upgraded SymPy from 1.12.0 to 1.13.1 across all infrastructure (Dockerfile, CI, documentation, entries, and notebooks)
- Fixed reynolds_number.json programmatic verification for SymPy 1.13.1 compatibility (stricter type comparison between sympy.Float and Python int)
- Deleted the Faraday's law, Gauss law, sthe Ampere's law and the Coulomb law entries as they are now part of the Mazwell law entry.

### Fixed

- Logical separation between fundamental empirical statements (in global assumptions) and their mathematical consequences (in entry derivations)
- Eliminated redundancy in electromagnetic assumptions across the dataset

## [0.6.0] - `assumption` field added to each derivation steps - 2025-01-16

### Added

- Step-level assumption references: Derivation steps can now reference specific assumptions or dependencies using an optional `assumption` field
- Global assumptions now have required `title` field for better UI display and step-level references
- New validation script `validate_assumptions_usage.py` that checks:
  - No ID conflicts between assumption IDs and entry IDs
  - All prerequisites are used in derivation steps (ERROR for reviewed entries, WARNING for drafts)
- Web viewer enhancements:
  - Step-level assumption badges with "Use: [Assumption Title]" format
  - Color-coded badges by type (green=principle, blue=empirical, purple=approximation, cyan=dependencies)
  - Clickable badges that scroll to prerequisite section with smooth animations
  - Assumptions display with prominent titles in Prerequisites section
- CI/CD integration: Assumption usage validation now runs in GitHub Actions workflow
- Added to `make pre-push` workflow as validation step 6/7

### Changed

- Renamed `dependencies` field to `depends_on` across all entries, schema, and scripts for improved clarity and consistency
- Updated all 8 reviewed entries to include step-level assumption references
- Validation script returns exit code 1 for reviewed entries with unused prerequisites (fails CI/CD)
- Prerequisites section now unified, displaying both assumptions and dependencies with color-coded badges

## [0.5.1] - 2025-01-15

### Added

- CLAUDE.md file with comprehensive guidance for Claude Code (AI coding assistant) when working in this repository
- Born rule entry for quantum mechanics measurement postulate

### Changed

- Automated release workflow to trigger on CHANGELOG.md updates to main branch instead of manual tag creation

## [0.5.0] - Consolidation of assumptions - 2025-01-14

Instead of having assumptions, regime and dependencies on each entry, we are consolidating them into one single place. All assumptions and regimes will be in one json file, and the entry will refer to them using tags.

We also classify the assumptions into different types: undamental, empirical, simplification, regime.

### Added

- Script to build the whole dataset for training ML models using the entries and the assumptions and its testing
- Centralized assumptions system (globals/assumptions.json) with three standardized types: principle, empirical, approximation
- In the html: Color-coded visual hierarchy and enhanced mathematical expression rendering for assumptions

### Changed

- Unified assumptions into centralized system, integrating regimes and dependencies into unified assumptions display
- Updated schema to support new assumptions structure with global assumption ID references and direct text options
- Modified all reviewed entries to use new centralized assumption system with consistent terminology and mathematical expressions
- Updated all frontend code - HTML display, forms, and JavaScript logic for new assumptions system
- Updated documentation and contribution guidelines to reflect new assumptions structure and usage
- New change log moved from the manifest json to changelog.md and automatically feed the github release information.
- Completely removed `approximation_of` field from schema and entries.

## [0.4.8] - 2025-08-19

### Added

- Comprehensive AI-generated content indicators: robot badges in DRAFT status tags, color-coded backgrounds for draft entries, sticky disclaimer banners
- Clear pathways for users to contribute to reviewing AI-generated content
- AI entry visibility toggle: toggle switch to entries index page allowing users to show/hide AI-generated entries
- Persistent user preference storage for AI entry visibility using localStorage

### Changed

- Reviewed entries shown by default for better user experience

## [0.4.6] - 2025-08-16

### Added

- Principle of least action entry with comprehensive derivation and harmonic oscillator verification

### Changed

- Split special_relativity entry into two focused entries: special_relativity_transformations (coordinate transformations, time dilation, length contraction) and relativistic_energy_momentum (energy-momentum relations, mass-energy equivalence)

## [0.4.5] - 2025-08-14

### Added

- Google Colab integration with pre-generated Jupyter notebooks for all programmatic verifications

### Changed

- Reviewed Planck radiation law and Kepler's laws entry
- Merged derivation and derivation_explanation fields into unified derivation structure with inline descriptions

## [0.4.4] - 2025-08-14

### Added

- Special relativity reviewed entry
- Comprehensive FAQ page with common questions about the dataset
- Contributors array structure to better support collaborative entries with multiple contributors
- Each contributor now has 'full_name' and 'identifier' fields supporting ORCID, website, LinkedIn, or other identifiers

### Changed

- Updated GitHub issue templates to allow blank issues without enforcing templates
- Successfully migrated all 100 existing entries while preserving attribution information
- Updated contribution forms, documentation, and validation scripts to support new contributors structure
- Unified assumption structure: removed redundant 'equations_assumptions' field and renamed 'derivation_assumptions' to 'assumptions'

### Removed

- Single 'created_by' field (replaced with contributors array)

## [0.4.3] - 2025-08-12

### Fixed

- GitHub Pages deployment issue where entry modification URLs failed to load existing entries

### Changed

- Make a single source of truth for the requirements of each entry in the schema file. CONTRIBUTING.md and Form will be automatically populated on the build based on the schema file

## [0.4.2] - 2025-08-12

### Added

- Comprehensive front-end contribution system to modify and add new entries in a user-friendly way
- Structured web forms for both new entry creation and existing entry modification with all dataset fields
- Automated email submission system using EmailJS for seamless contribution workflow

### Changed

- Updated main landing page messaging to better reflect project aspirations, current status, and community needs
- Updated contact email to theoriadataset@gmail.com

### Fixed

- Broken links in contribute site

## [0.4.1] - 2025-08-10

### Added

- Entries HTML now displays validity regime, historical context, and limitations fields

### Changed

- Consolidated redundant entries: merged lorentz_transformations into special_relativity, combined Newton's three law entries into unified newtons_laws_of_motion, consolidated doppler_effect variants, merged duplicate Archimedes and Bernoulli entries
- Standardized created_by field across all entries: replaced generic identifiers with either proper author names or standard AI-created entry message

## [0.4.0] - 2025-08-09

### Added

- Theory status and historical context framework across the dataset
- New theory classification system: current, historical, approximation, limiting_case, superseded
- validity_regime field describing physical conditions and limitations for each theory
- superseded_by and approximation_of fields for theory relationships
- historical_context field with importance, development period, and key insights
- result_id field to all entries that must match the filename (without .json extension)
- Validation tests to ensure result_id consistency and clean cross-references
- Alphabetical ordering requirement for new entries in CONTRIBUTING.md

### Changed

- Expanded dataset from 35 to 100 comprehensive physics entries with full derivations and programmatic verification
- Updated multiple existing entries with theory status classifications
- Enhanced domains to include specific physics subfields (physics.class-ph, cond-mat.stat-mech, physics.flu-dyn)
- Updated cross-reference fields (dependencies, superseded_by, approximation_of) to use result_id instead of filenames
- Updated CONTRIBUTING.md with result_id requirements and cleaner reference guidelines
- Enhanced data architecture for content independence from filesystem paths
- Updated index.json to include all entries from the entries folder and sorted them alphabetically

## [0.3.2] - 2025-05-27

### Added

- Entries for Euler-Lagrange equation, Hamilton's equations, Hamilton-Jacobi equation, Liouville's theorem, Coriolis force, Foucault pendulum and the continuity equation
- Programmatic verification for all entries
- Development environment based on docker, to allow local testing
- run_verifications() helper and version normalization logic
- Unit tests for verification logic

### Fixed

- Stefan–Boltzmann integral evaluation
- Maxwell equations and Noether theorem proofs execute cleanly

## [0.3.1] - 2025-05-20

### Added

- Optional dependencies field to entries
- Planck's radiation law entry
- Updated docs and schema to display entry dependencies

## [0.3.0] - 2025-05-18

### Added

- 14 new entries in draft mode
- .gitignore file with common patterns for development

## [0.2.5] - 2025-05-11

### Added

- Footer to each entry with licence in entries.html
- Draft watermark to entries.html

### Changed

- index.html shows version from manifest.json

### Fixed

- Link to contribute in readme.mds

### Removed

- Dataset version from entries

## [0.2.4] - 2025-05-06

### Changed

- Changing acronym from THEORIA to TheorIA
- Separating index.html and entries.html
- Reordering entries.html

## [0.2.3] - 2025-04-27

### Changed

- Changing acronym from THEORIA to TheorIA

## [0.2.2] - 2025-04-26

### Added

- New entries for Lorentz transformations and Maxwell equations
- index.html for better navigation
- README.md and CONTRIBUTING.md files with new contribution guidelines

### Changed

- Improved schema validation for equations and assumptions
- Updated references and citations
- Change schema to accept dots for the `domain` field
- Changing acronym from THEORIA to TheorIA

### Fixed

- Previous entries

## [0.1.0] - 2025-04-20

### Added

- Initial release with two entries
