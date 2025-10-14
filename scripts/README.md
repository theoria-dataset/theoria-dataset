# TheorIA Dataset Scripts

This directory contains utility scripts for the TheorIA dataset, including build scripts for documentation and ML dataset generation.

## generate_index.py

Generates the main entries_index.html page that displays all entries organized by physics domains.

**Requirements:** Python 3.8+ (tested with Python 3.11.12)

**Usage:**
```bash
# Run directly (requires Python)
python scripts/generate_index.py

# Or use make with Docker
make build

# Or run with Docker directly
docker-compose run --rm theoria-tests python scripts/generate_index.py
```

**What it does:**
- Reads all JSON entry files from the `entries/` directory
- Groups entries by their `domain` field using readable category names
- Generates entry cards showing title, description, and review status
- Creates navigation links between domain sections
- Outputs a complete HTML page to `docs/entries_index.html`

**When to run:**
- After adding new entries to the `entries/` directory
- When updating entry metadata (title, description, domain, review status)
- Before deploying to GitHub Pages

The generated page provides a browseable interface for all 100+ physics entries, making it much more user-friendly than the previous dropdown selector.

## build_ml_dataset.py

Creates a unified machine learning dataset from TheorIA entries with resolved assumptions.

**Requirements:** Python 3.6+ (standard library only)

**Usage:**
```bash
# Generate dataset with only reviewed entries (recommended)
python scripts/build_ml_dataset.py

# Include draft entries for larger dataset
python scripts/build_ml_dataset.py --include-drafts

# Specify custom output file
python scripts/build_ml_dataset.py --output my_dataset.json
```

**Features:**
- Filters draft entries by default (use `--include-drafts` to include them)
- Resolves assumption IDs to full text with mathematical expressions
- Creates unified JSON structure with metadata
- Handles both global assumption IDs and direct text assumptions

**Output Structure:**
```json
{
  "dataset_info": {
    "name": "TheorIA Dataset",
    "version": "0.5.0",
    "total_entries": 7,
    "includes_drafts": false,
    "global_assumptions_count": 14
  },
  "global_assumptions": [...],
  "entries": [...]
}
```

## test_ml_dataset.py

Comprehensive test runner for the ML dataset script.

**Usage:**
```bash
python scripts/test_ml_dataset.py
```

**What it tests:**
- Unit tests for all functions in `build_ml_dataset.py`
- Integration tests with real dataset data
- Error handling and edge cases
- Data structure validation

**When to run:**
- After modifying the ML dataset script
- Before deploying changes
- As part of CI/CD pipeline

## Testing

Run tests for the ML dataset functionality:
```bash
# Run comprehensive test suite
python scripts/test_ml_dataset.py

# Run only unit tests
python tests/test_build_ml_dataset.py
```