FROM node:24.14.0-trixie-slim

# Install building and signing tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    fakeroot \
    dpkg \
    binutils \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Switch to the non-root user
# USER node

WORKDIR /home/node/app
