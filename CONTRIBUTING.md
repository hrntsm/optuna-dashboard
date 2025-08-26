# Developers Guide

Thank you for your interest in contributing to the Optuna Dashboard project!
This document will provide you with an overview of the repository structure and instructions on how to build optuna-dashboard.

## Repository Structure

The repository is organized as follows:

```
.
├── optuna_dashboard/         # The Python package.
│   └── ts/                   # TypeScript code for the Python package.
│      ├── index.tsx          # Entry point for the Python package.
│      └── pkg_index.tsx      # Entry point for Jupyter Lab extension, output placed under `optuna_dashboard/pkg/`.
├── standalone_app/           # Standalone application that can be run in browser or within the WebView of the VS Code extension.
│   ├── browser_app_entry.tsx # Entry point for browser app, hosted on GitHub pages.
│   └── vscode_entry.tsx      # Entry point for VS Code extension, output placed under `vscode/assets`.
├── vscode/                   # The VS Code extension.
├── jupyterlab/               # The Jupyter Lab extension.
├── rustlib/                  # Rust library exporting Wasm functions.
│   └── pkg/                  # Output directory for rustlib, installed from package.json via `"./rustlib/pkg"`.
└── tslib/                    # TypeScript library shared for common use.
    ├── react/                # Common React components.
    ├── storage/              # Common code for handling storage.
    └── types/                # Common TypeScript types.
```

## Python package

#### Building TypeScript packages

```
$ make tslib
```

#### Compiling TypeScript files

Node.js v16 is required to compile TypeScript files.

```
$ cd optuna_dashboard/
$ npm install
$ npm run build:dev
```

<details>
<summary>Watch for files changes</summary>

```
$ cd optuna_dashboard/
$ npm run watch
```

</details>

<details>
<summary>Production builds</summary>

```
$ cd optuna_dashboard/
$ npm run build:prd
```

</details>

#### Building a Docker image

```
$ docker build -t optuna-dashboard .
```

When failed above command due to the out of heap memory error (Exit code: 137), please check "Resources" tab on your Docker engine's preference since it requires a lot of memory to compile TypeScript files.
You can use the Docker image like below:

```
# SQLite3
$ docker run -it --rm -p 127.0.0.1:8080:8080 -v `pwd`:/app -w /app optuna-dashboard sqlite:///db.sqlite3
```

#### Running dashboard server

Install dependencies and run the dashboard using uv:

```
$ uv sync
$ OPTUNA_DASHBOARD_DEBUG=1 uv run optuna-dashboard sqlite:///db.sqlite3
```

Or using pip:

```
$ pip install .
$ OPTUNA_DASHBOARD_DEBUG=1 optuna-dashboard sqlite:///db.sqlite3
```

> [!NOTE]
> `OPTUNA_DASHBOARD_DEBUG=1` makes the server will automatically restart when the source codes are changed.

### Running tests, lint checks and formatters

#### Running unit tests for `tslib/`

```
$ npx playwright install --with-deps
$ make tslib-test
```

#### Running unit tests for `python_tests/`

```
$ uv sync --all-extras --group test
$ uv run pytest python_tests/
```

#### Running e2e tests using pytest playwright

```
$ uv sync --all-extras --group test
$ uv run playwright install
$ uv run pytest e2e_tests
```

If you want to create a screenshot for each test, please run a following command, then check screenshots in `tmp/` directory.

```
$ uv run pytest e2e_tests --screenshot on --output tmp
```

If you want to generate a locator in each webpage, please use the playwright codegen. See [this page](https://playwright.dev/python/docs/codegen-intro) for more details.
For more detail options, you can check [this page](https://playwright.dev/python/docs/test-runners).

#### Linters (ruff and mypy)

Using uv (recommended):
```
$ uv sync --group lint
$ uv run ruff check .
$ uv run ruff format --check .
$ uv run mypy optuna_dashboard python_tests
```

#### Auto-formatting Python and TypeScript files

```
$ make fmt
```

### Release the new version

The release process(compiling TypeScript files, packaging Python distributions and uploading to PyPI) is fully automated by GitHub Actions.

1. **Create release branch**: Create a release branch from main (e.g. `git checkout -b release/v0.8.0`).
2. **Update version**: Replace a `__version__` variable in `optuna_dashboard/__init__.py` to the next version (e.g. 0.8.0).
3. **Push to fork**: Commit the changes and push the branch to your fork (e.g. `git push <your-forked-repo> release/v0.8.0`).
4. **Create PR and merge**: Create a PR from your fork's release branch to the main repository's main branch, wait for CI to pass, get approval from maintainers, and merge the PR.
5. **Create tag**: Pull the latest main branch (`git checkout main && git pull origin main`) and create a git tag (`git tag v0.8.0`).
6. **Push tag**: Push the tag to trigger the release process (`git push origin v0.8.0`). GitHub Action will build sdist/wheel packages and create a draft GitHub release.
7. **Publish release**: Edit the GitHub release, generate release notes, write highlights if needed, and mark "Create [a discussion](https://github.com/optuna/optuna-dashboard/discussions/categories/announcements) for this release" checkbox. Then publish the release. GitHub Action will release the new version to PyPI.


## Standalone Single-page Application

Please install [wasm-bindgen-cli](https://rustwasm.github.io/wasm-bindgen/reference/cli.html) and [wasm-opt](https://docs.rs/wasm-opt/latest/wasm_opt/), and then execute the following command.

```
$ cargo install wasm-bindgen-cli wasm-opt
$ make serve-browser-app
```

Open http://localhost:5173/

## VS Code Extension

```
$ npm i -g vsce
$ make vscode-extension
```

## Jupyter Lab Extension

### How to build sdist and wheel distributions

For how to build Python distributions (sdist and wheel) of jupyterlab-optuna, please refer to [jupyterlab-tests.yml](.github/workflows/jupyterlab-tests.yml).

```bash
pushd jupyterlab/
uv venv
uv pip install build jupyterlab
popd
make jupyterlab-extension
```

### Development Install

```bash
cd jupyterlab/
uv venv
uv pip install -e .

# Link your development version of the extension with JupyterLab
uv run jupyter labextension develop . --overwrite
# Server extension must be manually installed in develop mode
uv run jupyter server extension enable jupyterlab_optuna
# Rebuild extension Typescript source after making changes
uv run jlpm build

# Start Jupyter Lab server
jupyter lab
```

By default, the `jlpm` build command generates the source maps for this extension to make it easier to debug using the browser dev tools.
To also generate source maps for the JupyterLab core extensions, you can run the following command:

```
jupyter lab build --minimize=False
```

### Development Uninstall

```
# Server extension must be manually disabled in develop mode
jupyter server extension disable jupyterlab_optuna
pip uninstall jupyterlab_optuna
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop` command.
To find its location, you can run `jupyter labextension list` to figure out where the labextensions folder is located.
Then you can remove the symlink named jupyterlab-optuna within that folder.

