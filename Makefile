# TheorIA Dataset - Simple commands for contributors
#
# Usage:
#   make test                    - Test all entries
#   make test-entry FILE=name    - Test a specific entry
#   make help                    - Show this help

.PHONY: help test test-entry pre-push

help:
	@echo "🧬 TheorIA Dataset - Helper Commands"
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


pre-push:
	@echo "🚀 Running all build steps and tests before push..."
	@echo "📋 Step 1/5: Rebuilding requirements..."
	docker-compose run --rm theoria-tests python scripts/build_requirements.py
	@echo "📔 Step 2/5: Generating notebooks..."
	docker-compose run --rm theoria-tests python scripts/generate_notebooks.py
	@echo "🏗️ Step 3/5: Generating index..."
	docker-compose run --rm theoria-tests python scripts/generate_index.py
	@echo "📐 Step 4/5: Validating schemas..."
	docker-compose run --rm theoria-tests python scripts/validate_all_schemas.py
	@echo "🧪 Step 5/5: Running tests..."
	docker-compose run --rm theoria-tests python scripts/test_entry.py
	@echo "✅ All pre-push steps completed successfully!"