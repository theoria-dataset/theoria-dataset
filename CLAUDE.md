# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

**Always read these files for context:**
- [README.md](README.md) - Project overview, structure, and scripts
- [CONTRIBUTING.md](CONTRIBUTING.md) - Entry requirements and field definitions
- [DEVELOPMENT.md](DEVELOPMENT.md) - Docker commands, testing, and release process

## Quick Commands

```bash
make test                          # Test all entries
make test-entry FILE=entry_name    # Test specific entry
make pre-push                      # Full validation before pushing
make build-requirements            # Rebuild CONTRIBUTING.md from schema
```

## Critical Conventions

### Entry IDs
- `result_id` must EXACTLY match filename (without .json)
- Use `lowercase_with_underscores` only

### AsciiMath Formatting
See [CONTRIBUTING.md](CONTRIBUTING.md) for AsciiMath notation requirements.
