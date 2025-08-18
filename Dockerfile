FROM python:3.11.12-slim

# Install Node.js 18 using NodeSource repository (supports multiple architectures)
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install ajv-cli globally
RUN npm install -g ajv-cli

# Set working directory
WORKDIR /app

# Install Python dependencies
RUN pip install sympy==1.12.0 pytest

# Copy project files
COPY . .

# Create a script to run all tests
RUN echo '#!/bin/bash\n\
echo "==========================================" \n\
echo "Running THEORIA Dataset Tests in Docker" \n\
echo "==========================================" \n\
echo "" \n\
echo "1. Validating JSON entries against schema..." \n\
echo "=============================================" \n\
for file in entries/*.json; do \n\
    echo "Validating $file" \n\
    if ! ajv validate -s schemas/entry.schema.json -d "$file" --strict=false; then \n\
        echo "❌ JSON validation failed for $file" \n\
        exit 1 \n\
    fi \n\
done \n\
echo "✅ All JSON entries are valid" \n\
echo "" \n\
echo "2. Running programmatic verifications..." \n\
echo "========================================" \n\
if ! python scripts/verify_programmatic.py; then \n\
    echo "❌ Programmatic verification failed" \n\
    exit 1 \n\
fi \n\
echo "✅ All programmatic verifications passed" \n\
echo "" \n\
echo "3. Running unit tests..." \n\
echo "========================" \n\
if ! pytest tests/ -v; then \n\
    echo "❌ Unit tests failed" \n\
    exit 1 \n\
fi \n\
echo "✅ All unit tests passed" \n\
echo "" \n\
echo "🎉 All tests passed! Your changes are ready for CI."' > /usr/local/bin/run-tests \
    && chmod +x /usr/local/bin/run-tests

# Default command
CMD ["run-tests"] 