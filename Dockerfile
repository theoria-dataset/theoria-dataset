FROM python:3.11.12-slim

# Install Node.js 18 using binary distribution (faster and cleaner)
RUN apt-get update && \
    apt-get install -y curl xz-utils && \
    curl -fsSL https://nodejs.org/dist/v18.20.4/node-v18.20.4-linux-x64.tar.xz | tar -xJ -C /opt && \
    ln -sf /opt/node-v18.20.4-linux-x64/bin/node /usr/local/bin/node && \
    ln -sf /opt/node-v18.20.4-linux-x64/bin/npm /usr/local/bin/npm && \
    ln -sf /opt/node-v18.20.4-linux-x64/bin/npx /usr/local/bin/npx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up Node.js environment and install ajv-cli globally
ENV NODE_PATH="/opt/node-v18.20.4-linux-x64/lib/node_modules"
ENV PATH="/opt/node-v18.20.4-linux-x64/bin:$PATH"
RUN npm install -g ajv-cli && \
    ln -sf /opt/node-v18.20.4-linux-x64/bin/ajv /usr/local/bin/ajv

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
    if ! ajv validate -s schemas/entry.schema.json -d "$file"; then \n\
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