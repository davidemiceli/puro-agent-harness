# Development

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v22 or higher) and npm/yarn/pnpm.
- *(Optional)* **Ollama** for running local models.

## Development Mode

Start the development server with hot reloading and Electron debugging tools.

```bash
npm run dev
```

Runs the app in the development mode with hot reloading.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

In another terminal start Electron in development mode.

```bash
npm run electron:dev
```

### Running Unit Tests

The project uses Vitest for unit testing. To run tests in watch mode during development:

```bash
npm test
```

For a single run (CI/CD friendly):

```bash
npm run test:ci
```

## Production Mode

To run in production mode, at first buil the frontend

```bash
npm run build
```

Then run Electron in production mode

```bash
npm run electron
```

## Deployment & Build Instructions

The software is currently available for Linux via native Debian and RPM packages. Full support for macOS and Windows is planned for future releases.

### Building .deb Packages

To generate a distributable Debian package (`.deb`), this project employs a Dockerized build environment.

#### Build and Run the Builder

Execute the following commands to build the builder image and subsequently generate the package.

```bash
# Build the secure builder Docker image
docker build -t puro/electron-secure-builder -f docker/Dockerfile .

# Run the builder container
docker run --rm -it -v $(pwd):/home/node/app -e DISABLE_ELECTRON_SANDBOX=1 --name electron-builder puro/electron-secure-builder bash build-deb.sh

# Refresh System Icon Cache (optional) to ensure the new icon appears in your system menus and taskbar.
sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
```

#### Output Location

After the build process completes successfully, you will find the generated installer file `out/puro_*.deb` in the root directory of the repository.

## CI/CD

The project uses GitHub Actions for automated quality checks and releases.

### CI — Pull Request Checks

Every pull request targeting `main` automatically runs:

- **Linting** (`npm run lint`) — ensures code style consistency
- **Unit tests** (`npm run test:ci`) — ensures existing functionality is not broken

If either check fails, the PR is blocked from merging (branch protection rule on `main`).

### CD — Automated Release Pipeline

When a PR is merged into `main`, the release workflow triggers automatically:

1. **Version bump** — semantic-release analyzes conventional commits since the last tag and determines the new version (major/minor/patch).
2. **Build** — the `.deb` package is built inside the Docker container.
3. **Release** — a GitHub Release is created with:
   - Auto-generated changelog from commit history
   - The built `.deb` file attached as a download asset

### Conventional Commits

Version bumps are determined by the commit message prefix:

| Prefix | Version bump | Example |
|---|---|---|
| `BREAKING CHANGE` or `feat!:` | Major | `feat!: redesign API` |
| `feat:` | Minor | `feat: add dark mode` |
| `fix:` | Patch | `fix: correct typo` |
| `chore:`, `docs:`, `refactor:` | No release | `docs: update README` |

## Project Structure

```text
.
├── .github/workflows/ # CI/CD GitHub Actions workflows
├── .releaserc.json    # semantic-release configuration
├── build-deb.sh       # Debian package build script
├── docker/            # Docker build environment for .deb packaging
├── docs/              # Documentation
├── forge.config.js    # Electron Forge configuration
├── vite.config.js     # Vite bundler configuration
├── eslint.config.js   # ESLint configuration
├── postcss.config.js  # PostCSS configuration
├── vitest.config.js   # Vitest test runner configuration
├── package.json       # Project metadata and scripts
├── electron/
│   ├── main.js        # Electron main process entry
│   ├── assets/        # Application icons
│   ├── ipc/           # IPC API handlers
│   ├── preload/       # Preload scripts
│   ├── protocol/      # Custom protocol handlers
│   └── dist/          # Electron build output
├── src/
│   ├── app.jsx        # Root application component
│   ├── index.jsx      # Application entry point
│   ├── index.html     # HTML shell
│   ├── index.css      # Global styles
│   ├── assets/        # Static assets
│   ├── components/    # Shared UI components
│   ├── contexts/      # React contexts
│   ├── directives/    # Custom directives
│   ├── errors/        # Error handling
│   ├── features/      # UI features
│   │   ├── agent/     # Configuring agents, skills, and rules
│   │   ├── prompt/    # Prompt engineering tools
│   │   ├── session/   # Session management
│   │   ├── settings/  # Global configurations
│   │   └── workspace/ # Workspace management
│   ├── routes/        # Route definitions
│   ├── services/      # Bridges to Electron APIs
│   ├── libs/          # Shared utilities
│   ├── stores/        # Global state
│   └── agent-engine/  # Model inference & tool execution
```
