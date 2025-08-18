# Contributing to TheorIA Dataset

Welcome to TheorIA dataset! This dataset provides a high-quality collection of theoretical physics equations, derivations, and explanations in a structured format. We encourage contributions from researchers, educators, and enthusiasts in the field of theoretical physics.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
- Git for version control

### Fork and Clone

1. **Fork** this repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/theoria-dataset.git
   cd theoria-dataset
   ```

## Development Setup

### Running Tests Locally

To ensure your environment exactly matches our CI, we use Docker for all testing:

#### Quick Test Run
```bash
# Run all tests (same as CI)
docker-compose run --rm theoria-tests
```

This will:
1. Build the Docker image with the exact CI environment
2. Validate all JSON entries against the schema
3. Run programmatic verifications for physics equations
4. Execute unit tests

#### Development Shell
For interactive development and debugging:
```bash
docker-compose run --rm theoria-dev
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

#### Testing Individual Entries
```bash
# Test a specific entry
make test-entry FILE=your_entry_name

# Test all entries
make test
```

### Environment Details

The Docker environment includes:
- **Python 3.11.12** (exact CI version)
- **Node.js 18** with **ajv-cli** for JSON validation
- **SymPy 1.12.0** (exact CI version) 
- **pytest** for unit testing

### Building Documentation

Our documentation is auto-generated from the schema. To rebuild:
```bash
make build
```

This runs the consolidated build script that generates:
- CONTRIBUTING.md (this file when generated)
- Form requirements JavaScript
- Static form HTML

## Entry Guidelines

### Creating a New Entry

1. **Create a JSON file** in the `entries/` directory
2. **Follow the naming convention**: Use lowercase letters, numbers, and underscores (e.g., `newtons_laws_of_motion.json`)
3. **Ensure the `result_id` matches the filename** (without .json extension)
4. **Validate your entry** against the schema using the testing commands above

### Entry Requirements

Each entry should be a self-contained, relevant physics result. The structure and requirements are defined in `schemas/entry.schema.json`. The auto-generated section below provides detailed field requirements.

### Testing Your Contributions

Before submitting:
1. **Run tests locally** using the Docker commands above
2. **Ensure all validation passes** - CI will automatically check this
3. **Test your specific entry**: `make test-entry FILE=your_entry_name`

## Submission Process

1. **Create a branch** for your contribution:
   ```bash
   git checkout -b add-quantum-harmonic-oscillator
   ```

2. **Add your entry** and test it thoroughly

3. **Commit your changes**:
   ```bash
   git add entries/your_entry.json
   git commit -m "Add quantum harmonic oscillator entry"
   ```

4. **Push to your fork**:
   ```bash
   git push origin add-quantum-harmonic-oscillator
   ```

5. **Submit a pull request** on GitHub

### Review Process

- CI will automatically validate your JSON against the schema
- Maintainers will review the physics content and derivations
- We may request changes or improvements
- Once approved, your contribution will be merged

## Automatic Jupyter Notebooks

Every entry automatically gets a corresponding Jupyter notebook generated for interactive exploration:

- **Location**: `notebooks/{result_id}_verification.ipynb`
- **Content**: Complete programmatic verification code with exact library versions
- **Google Colab Integration**: Each entry page includes an 'Open in Colab' badge
- **Automatic Generation**: Notebooks are regenerated automatically via GitHub Actions

When you contribute an entry, the system will automatically:
1. Generate a Jupyter notebook from your `programmatic_verification` code
2. Include proper library installation commands with exact versions
3. Add links back to the original entry for context
4. Make it available via Google Colab for interactive exploration

No manual action is needed - notebooks are maintained automatically!

## Troubleshooting

- **Permission issues**: Ensure Docker has proper permissions on Linux/macOS
- **Build failures**: Try `docker-compose build --no-cache` to rebuild from scratch
- **File changes**: Your local files are mounted into the container, so changes are immediately reflected

## Version Control & Collaboration

- We use Git and GitHub for versioning
- Submit pull requests for new entries or changes
- Ensure your JSON files validate against the schema (CI will check this automatically)
- Files are mounted into containers, so local changes are immediately reflected

## Example

See `entries/special_relativity_transformations.json` for a complete, compliant example.

---

**Happy contributing!** 🧬