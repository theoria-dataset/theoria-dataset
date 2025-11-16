# TheorIA dataset, a curated, high quality dataset of Theoretical Physics equations

[![Latest Release](https://img.shields.io/github/v/release/theoria-dataset/theoria-dataset)](https://github.com/theoria-dataset/theoria-dataset/releases)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Validation](https://github.com/theoria-dataset/theoria-dataset/actions/workflows/validate_entries.yaml/badge.svg)](https://github.com/theoria-dataset/theoria-dataset/actions/workflows/validate_entries.yaml)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

TheorIA stands for Theoretical Physics Intelligent Anthology

> **🚀 Jump in!** We've kicked off THEORIA with a handful of entries, and we need your help to grow it. If you're into physics (researcher, educator, or enthusiast) now's the time to contribute your favorite equations, crisp derivations, and clear explanations.

**[Browse the TheorIA Dataset Online](https://theoria-dataset.github.io/theoria-dataset/)** - View and explore the equations and derivations through our interactive web interface.

## Why TheorIA?

There is a [lack of curated datasets](https://manuelsh.github.io/blog/2025/datasets-for-advancing-Theoretical-Physics/) with all important equations and derivations of theoretical physics to train better machine learning models, beyond raw text in papers and books.

TheorIA bridges that gap; it is the first datasets being built to provide a high-quality collection of theoretical physics equations, its respective derivations and explanations in a structured format.

We have an open license and encourage contributions from researchers, educators, and enthusiasts in the field of theoretical physics.

## What's inside?

Each entry in TheorIA represents a theoretical physics result: for example, the Lorentz transformations.

- **High quality**: Each entry is crafted and carefully reviewed by someone with a background in physics. Contributor name or ORCID is baked into the metadata.

- **Formal derivations and annotated proofs**: AsciiMath step by step, annotated for easier understanding and programmatic formalization to guarantee correctness.

- **One JSON per entry**: Individual JSON files under `entries/` folder: one file per physics result, enabling parallel contributions, clean version control, and conflict-free collaboration.

- **Domain tags**: ArXiv‑style categories (e.g., gr-qc, hep-th) for easy filtering.

- **Global manifest**: `manifest.json` with dataset metadata.

- **Open license**: `CC‑BY 4.0`. Use it, remix it, teach with it.

## Repository Layout

```
theoria-dataset/
├── .github/
│   └── workflows/
│       ├── validate_entries.yaml      # CI workflow for JSON Schema validation of entries
│       ├── process-contribution.yml   # Automated PR processing workflow
│       └── release.yml                # Release automation workflow
├── entries/                           # Individual dataset entries (one JSON file per entry)
├── globals/
│   └── assumptions.json               # Global assumptions referenced by entries
├── schemas/
│   ├── entry.schema.json              # Entry JSON Schema (source of truth)
│   └── assumptions.schema.json        # Assumptions JSON Schema
├── scripts/                           # Build and maintenance scripts
│   ├── build_ml_dataset.py            # Generate unified ML dataset
│   ├── build_requirements.py          # Regenerate CONTRIBUTING.md from schema
│   ├── generate_contributing.py       # Generate contributor guidelines
│   ├── generate_form_requirements.py  # Generate form requirements JavaScript
│   ├── generate_index.py              # Generate entry index page
│   ├── generate_notebooks.py          # Generate Jupyter notebooks from entries
│   ├── test_entry.py                  # Test individual entries
│   ├── validate_all_schemas.py        # Validate all schemas
│   ├── validate_dependencies.py       # Validate entry dependencies
│   ├── validate_assumptions_usage.py  # Validate assumption references
│   └── verify_programmatic.py         # Run programmatic verifications
├── docs/                              # Web interface for viewing the dataset
├── notebooks/                         # Auto-generated Jupyter notebooks
├── tests/                             # Test suite
├── manifest.json                      # Dataset metadata and version
├── docker-compose.yml                 # Docker development environment
├── Dockerfile                         # Docker image definition
├── Makefile                           # Common development commands
├── CHANGELOG.md                       # Version history and release notes
├── CONTRIBUTING.md                    # Contributor guidelines (auto-generated)
├── CLAUDE.md                          # Instructions for Claude Code
├── DEVELOPMENT.md                     # Developer documentation
└── README.md                          # Project overview (this file)
```

## How to Contribute

We are _tiny_ right now, every new entry counts! To contribute:

1. **Fork and clone**
2. **Create a JSON in `entries/`** following the instructions in the [CONTRIBUTING.md](CONTRIBUTING.md) file and the schema in `schemas/entry.schema.json`.
3. **Submit your Pull Request**. CI will automatically validate your JSON against the schema. If it passes, we will review and merge it.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## Testing Your Entries

Before submitting, test your entries with our scientist-friendly tools:

### Quick Testing (Recommended)

```bash
# Test a specific entry
make test-entry FILE=your_entry_name

# Validate schema only
make validate FILE=your_entry_name

# Test all entries
make test
```

### Manual Testing

```bash
# Test single entry with detailed feedback
python scripts/test_entry.py your_entry.json

# Schema validation only
python scripts/validate_schema.py your_entry.json

# All programmatic verifications
python scripts/verify_programmatic.py
```

These tools provide **clear error messages** that point to specific issues and suggest fixes, making it easier for scientists to get their contributions ready.

## 🏗️ Requirements Management System

TheorIA uses the JSON Schema file as the single source of truth for both validation and contributor guidelines:

### Structure

- **`schemas/entry.schema.json`**: JSON Schema with embedded field guidelines
- **`scripts/generate_contributing.py`**: Generates `CONTRIBUTING.md` from the schema
- **`scripts/generate_form_requirements.py`**: Generates JavaScript for the web form

### For Maintainers

When updating field requirements:

1. **Edit only `schemas/entry.schema.json`** - contains both validation rules and contributor guidelines
2. **Run build**: `make build-requirements`
3. **Commit all changes** - CONTRIBUTING.md and form stay synchronized

This approach uses one file for both JSON Schema validation and contributor documentation.

## Using THEORIA to train Machine Learning models

You can either use the individual JSON files or automatically generate a single merged file using a script (e.g., with `jq`):

```bash
jq -s '.' entries/*.json > dataset.json
```

Feed `dataset.json` (or per‑entry files) straight into your training pipeline.

## License & Citation

Licensed under [CC-BY 4.0 License](https://creativecommons.org/licenses/by/4.0/legalcode.en). If you use it please cite it as:

```
TheorIA Dataset, 2025, v0.2.5. Available at: https://github.com/theoria-dataset/theoria-dataset
```

## Contact

Issues, questions, or exciting physics ideas? Drop an issue on GitHub, and let’s build this thing together.
