# Development Guide

This guide covers the complete development workflow for TheorIA dataset, including testing, building documentation, generating notebooks, and using all available scripts.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Running Tests

### Quick Test Run

To run all tests (same as CI):

```bash
docker-compose run theoria-tests
```

This will:

1. Build the Docker image with the exact CI environment
2. Validate all JSON entries against the schema
3. Run programmatic verifications for physics equations
4. Execute unit tests

### Development Shell

For interactive development and debugging:

```bash
docker-compose run theoria-dev
```

This gives you a bash shell inside the container where you can:

```bash
# Run individual test components
ajv validate -s schemas/entry.schema.json -d entries/your_file.json
python scripts/verify_programmatic.py
pytest tests/ -v

# Or run the full test suite
run-tests
```

### Building the Image

If you need to rebuild the Docker image (e.g., after changing dependencies):

```bash
docker-compose build
```

## Environment Details

The Docker environment includes:

- **Python 3.11.12** (exact CI version)
- **Node.js 14** with **ajv-cli** for JSON validation
- **SymPy 1.12.0** (exact CI version)
- **pytest** for unit testing

## Troubleshooting

- **Permission issues**: If you encounter permission issues on Linux/macOS, ensure Docker has proper permissions
- **Port conflicts**: The development containers don't expose ports by default
- **Build failures**: Try `docker-compose build --no-cache` to rebuild from scratch

## File Changes

Your local files are mounted into the container, so any changes you make locally will be immediately reflected in the container environment.

## Available Scripts

The `scripts/` directory contains build, validation, and utility scripts for the TheorIA dataset.

### Build & Generation Scripts

#### build_requirements.py
Orchestrates building of all requirement-dependent files from the schema.

**Usage:**
```bash
docker-compose run --rm theoria-tests python scripts/build_requirements.py
```

**What it does:**
- Runs generate_contributing.py, generate_form_requirements.py, generate_form.py
- Ensures all documentation stays synchronized with schema changes

#### generate_contributing.py
Generates CONTRIBUTING.md from static content + schema field requirements.

**What it does:**
- Merges CONTRIBUTING.static.md with auto-generated schema documentation
- Creates comprehensive contributor guidelines

#### generate_form_requirements.py
Generates JavaScript requirements for the web contribution form.

**What it does:**
- Converts schema to JavaScript for dynamic form validation
- Outputs to docs/contribute/form_requirements.js

#### generate_form.py
Updates the static HTML contribution form with schema-based guidelines.

**What it does:**
- Embeds field requirements directly into form HTML
- Eliminates need for dynamic JavaScript loading

#### generate_index.py
Generates the main entries browsing interface.

**Usage:**
```bash
docker-compose run --rm theoria-tests python scripts/generate_index.py
```

**What it does:**
- Creates docs/entries_index.html with all 100+ entries organized by domain
- Generates entry cards with titles, descriptions, and review status
- Provides user-friendly browsing interface

#### generate_notebooks.py
Generates Jupyter notebooks for programmatic verification of all entries.

**Usage:**
```bash
# Generate all notebooks
docker-compose run --rm theoria-tests python scripts/generate_notebooks.py

# Generate single notebook
docker-compose run --rm theoria-tests python scripts/generate_notebooks.py entry_id
```

**What it does:**
- Creates `notebooks/{entry_id}_verification.ipynb` for each entry
- Includes exact library versions and Google Colab integration
- Enables interactive exploration of physics derivations

**Notebook Structure:**
1. **Installation cell**: Installs exact library versions required
2. **Verification code**: Complete programmatic verification from the entry
3. **Documentation**: Entry description and source attribution

**Google Colab Integration:**
You can open any notebook directly in Google Colab using:
```
https://colab.research.google.com/github/theoria-dataset/theoria-dataset/blob/main/notebooks/{entry_id}_verification.ipynb
```

Or click the "Open in Colab" badge on entry pages at https://theoria-dataset.org

### Validation & Testing Scripts

#### test_entry.py
Primary testing script for entry validation.

**Usage:**
```bash
# Test specific entry
docker-compose run --rm theoria-tests python scripts/test_entry.py entry_name

# Test all entries
docker-compose run --rm theoria-tests python scripts/test_entry.py

# Or use make commands
make test-entry FILE=entry_name
make test
```

**What it does:**
- Validates JSON schema compliance
- Runs programmatic verification code
- Tests individual entries or entire dataset

#### validate_schema.py
JSON schema validation utility.

**What it does:**
- Validates individual JSON files against entry.schema.json
- Provides detailed error reporting for schema violations

#### verify_programmatic.py
Runs programmatic verification code for physics equations.

**What it does:**
- Executes verification code in isolated environment
- Ensures mathematical derivations are computationally correct
- Reports any errors in physics calculations

### Utility Scripts

#### parse_github_issue.py
Parses GitHub issues for new entry submissions.

**What it does:**
- Extracts structured entry data from GitHub issue templates
- Facilitates community contributions via issue forms

### Common Workflow

For typical development tasks:

```bash
# Make changes to an entry
vim entries/your_entry.json

# Test your changes
make test-entry FILE=your_entry

# Rebuild documentation if you changed schema
docker-compose run --rm theoria-tests python scripts/build_requirements.py

# Run full pre-push pipeline
make pre-push
```
