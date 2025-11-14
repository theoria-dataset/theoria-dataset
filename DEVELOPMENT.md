# Development Guide

This guide explains how to run tests locally using Docker to ensure your environment exactly matches the CI.

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

## Release Process

The project uses automated GitHub releases. When you push a version tag, a GitHub Action automatically creates a release with changelog notes.

### Creating a Release

1. **Update the CHANGELOG.md** with the new version and changes following the [Keep a Changelog](https://keepachangelog.com/) format:
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD

   ### Added
   - New features

   ### Changed
   - Changes to existing functionality

   ### Fixed
   - Bug fixes
   ```

2. **Commit the changelog**:
   ```bash
   git add CHANGELOG.md
   git commit -m "Prepare release vX.Y.Z"
   git push
   ```

3. **Create and push a version tag**:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

4. **Automatic release creation**: The GitHub Action will automatically:
   - Extract the changelog section for version X.Y.Z
   - Create a GitHub release at https://github.com/theoria-dataset/theoria-dataset/releases
   - Populate the release notes with the extracted changelog

### Release Workflow Details

The release is handled by [.github/workflows/release.yml](.github/workflows/release.yml) which:
- Triggers on any tag push matching `v*` (e.g., v0.5.0, v1.0.0)
- Uses [scripts/extract_changelog.py](scripts/extract_changelog.py) to extract the version-specific changelog
- Creates the GitHub release with the extracted notes

### Manual Release (if needed)

If you need to create a release manually or edit an existing one:
```bash
gh release create vX.Y.Z --title "Release X.Y.Z" --notes-file <(python3 scripts/extract_changelog.py X.Y.Z)
```
