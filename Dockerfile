FROM python:3.11.12-slim

ARG TARGETARCH
ENV NODE_VERSION=18.20.4

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl xz-utils ca-certificates && \
    case "${TARGETARCH}" in \
      amd64) NODE_ARCH="x64" ;; \
      arm64) NODE_ARCH="arm64" ;; \
      arm) NODE_ARCH="armv7l" ;; \
      *) echo "Unsupported TARGETARCH: ${TARGETARCH}" >&2; exit 1 ;; \
    esac && \
    mkdir -p /opt/node && \
    curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" | \
      tar -xJ --strip-components=1 -C /opt/node && \
    ln -sf /opt/node/bin/node /usr/local/bin/node && \
    ln -sf /opt/node/bin/npm /usr/local/bin/npm && \
    ln -sf /opt/node/bin/npx /usr/local/bin/npx && \
    npm install -g ajv-cli && \
    ln -sf /opt/node/bin/ajv /usr/local/bin/ajv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_PATH=/opt/node/lib/node_modules
ENV PATH=/opt/node/bin:$PATH

WORKDIR /app

RUN pip install sympy==1.13.1 pytest

COPY . .

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
        echo "JSON validation failed for $file" \n\
        exit 1 \n\
    fi \n\
done \n\
echo "All JSON entries are valid" \n\
echo "" \n\
echo "2. Running programmatic verifications..." \n\
echo "========================================" \n\
if ! python scripts/verify_programmatic.py; then \n\
    echo "Programmatic verification failed" \n\
    exit 1 \n\
fi \n\
echo "All programmatic verifications passed" \n\
echo "" \n\
echo "3. Running unit tests..." \n\
echo "========================" \n\
if ! pytest tests/ -v; then \n\
    echo "Unit tests failed" \n\
    exit 1 \n\
fi \n\
echo "All unit tests passed" \n\
echo "" \n\
echo "All tests passed! Your changes are ready for CI."' > /usr/local/bin/run-tests \
    && chmod +x /usr/local/bin/run-tests

CMD ["run-tests"]