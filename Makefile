# TheorIA Dataset - Simple commands for contributors
#
# Usage:
#   make test                    - Test all entries
#   make test-entry FILE=name    - Test a specific entry
#   make validate FILE=name      - Validate entry schema only
#   make help                    - Show this help

.PHONY: help test test-entry validate build-requirements build pre-push

help:
	@echo "🧬 TheorIA Dataset - Helper Commands"
	@echo "=================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make test                     - Test all entries (schema + verification)"
	@echo "  make test-entry FILE=<name>      - Test specific entry (e.g., FILE=carnot_efficiency)"
	@echo "  make validate FILE=<name>        - Validate entry schema only"
	@echo "  make build-requirements       - Rebuild CONTRIBUTING.md and form requirements from JSON"
	@echo "  make build                    - Generate entries index HTML"
	@echo "  make pre-push                 - Run all build steps and tests before pushing"
	@echo "  make help                     - Show this help"
	@echo ""
	@echo "Examples:"
	@echo "  make test-entry FILE=carnot_efficiency"
	@echo "  make validate FILE=my_new_entry"
	@echo ""
	@echo "Requirements:"
	@echo "  - Docker and docker-compose installed"
	@echo "  - Entry files in entries/ directory"

test:
	@echo "🧪 Testing all entries..."
	docker-compose run --rm theoria-tests python scripts/test_entry.py

test-entry:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: Please specify FILE=<entry_name>"; \
		echo "   Example: make test-entry FILE=carnot_efficiency"; \
		exit 1; \
	fi
	@echo "🧪 Testing entry: $(FILE)"
	docker-compose run --rm theoria-tests python scripts/test_entry.py $(FILE)

validate:
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: Please specify FILE=<entry_name>"; \
		echo "   Example: make validate FILE=carnot_efficiency"; \
		exit 1; \
	fi
	@echo "📋 Validating schema: $(FILE)"
	docker-compose run --rm theoria-tests python scripts/validate_schema.py $(FILE)

build-requirements:
	@echo "🏗️ Rebuilding requirement-dependent files..."
	python scripts/build_requirements.py

build:
	@echo "🏗️ Generating entries index HTML..."
	docker-compose run --rm theoria-tests python scripts/generate_index.py

pre-push:
	@echo "🚀 Running all build steps and tests before push..."
	@echo "📋 Step 1/4: Rebuilding requirements..."
	python scripts/build_requirements.py
	@echo "📔 Step 2/4: Generating notebooks..."
	python scripts/generate_notebooks.py
	@echo "🏗️ Step 3/4: Generating index..."
	docker-compose run --rm theoria-tests python scripts/generate_index.py
	@echo "🧪 Step 4/4: Running tests..."
	docker-compose run --rm theoria-tests python scripts/test_entry.py
	@echo "✅ All pre-push steps completed successfully!"

# Legacy support for original verification
verify:
	@echo "🔬 Running programmatic verification..."
	docker-compose run --rm theoria-tests python scripts/verify_programmatic.py