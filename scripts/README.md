# Build Scripts

This directory contains build scripts for generating the TheorIA dataset documentation.

## generate_index.py

Generates the main entries_index.html page that displays all entries organized by physics domains.

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