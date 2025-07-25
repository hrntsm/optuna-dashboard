FROM python:3.12

# Install uv - https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g vsce

# Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install wasm-bindgen-cli and wasm-opt
RUN cargo install -f wasm-bindgen-cli
RUN wget https://github.com/WebAssembly/binaryen/releases/download/version_113/binaryen-version_113-x86_64-linux.tar.gz && \
    tar -zxvf binaryen-version_113-x86_64-linux.tar.gz && \
    mv binaryen-version_113/ /root/.binaryen && \
    rm binaryen-version_113-x86_64-linux.tar.gz
ENV PATH="/root/.binaryen/bin:${PATH}"

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    pkg-config
