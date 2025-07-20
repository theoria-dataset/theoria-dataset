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
