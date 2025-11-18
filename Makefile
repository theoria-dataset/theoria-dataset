# TheorIA Dataset - Simple commands for contributors
#
# Usage:
#   make test                    - Test all entries
#   make test-entry FILE=name    - Test a specific entry
#   make help                    - Show this help

.PHONY: help test test-entry pre-push

help:
	@echo "TheorIA Dataset - Helper Commands"
	@echo "=================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make test                     - Test all entries (schema + verification)"
	@echo "  make test-entry FILE=<name>      - Test specific entry (e.g., FILE=carnot_efficiency)"
	@echo "  make pre-push                 - Run all build steps and tests before pushing"
	@echo "  make help                     - Show this help"
	@echo ""
	@echo "Examples:"
	@echo "  make test-entry FILE=carnot_efficiency"
	@echo ""
	@echo "Requirements:"
	@echo "  - Docker and docker-compose installed"
	@echo "  - Entry files in entries/ directory"

test:
	@echo "[TEST] Testing all entries..."
	docker-compose run --rm theoria-tests python scripts/test_entry.py

test-entry:
	@if [ -z "$(FILE)" ]; then \
		echo "[ERROR] Please specify FILE=<entry_name>"; \
		echo "   Example: make test-entry FILE=carnot_efficiency"; \
		exit 1; \
	fi
	@echo "[TEST] Testing entry: $(FILE)"
	docker-compose run --rm theoria-tests python scripts/test_entry.py $(FILE)


pre-push:
	@echo "[PRE-PUSH] Running all build steps and tests before push..."
	@echo "[STEP 1/8] Rebuilding requirements..."
	docker-compose run --rm theoria-tests python scripts/build_requirements.py
	@echo "[STEP 2/8] Generating notebooks..."
	docker-compose run --rm theoria-tests python scripts/generate_notebooks.py
	@echo "[STEP 3/8] Generating entries index..."
	docker-compose run --rm theoria-tests python scripts/generate_index.py
	@echo "[STEP 4/8] Generating assumptions page..."
	docker-compose run --rm theoria-tests python scripts/generate_assumptions_page.py
	@echo "[STEP 5/8] Validating schemas..."
	docker-compose run --rm theoria-tests python scripts/validate_all_schemas.py
	@echo "[STEP 6/8] Validating dependencies..."
	docker-compose run --rm theoria-tests python scripts/validate_dependencies.py
	@echo "[STEP 7/8] Validating assumption usage..."
	docker-compose run --rm theoria-tests python scripts/validate_assumptions_usage.py
	@echo "[STEP 8/8] Running tests..."
	docker-compose run --rm theoria-tests python scripts/test_ml_dataset.py
	docker-compose run --rm theoria-tests python scripts/test_entry.py
	@echo "[SUCCESS] All pre-push steps completed successfully!"