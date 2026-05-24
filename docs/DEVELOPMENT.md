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

## Project Structure

```text
.
├── electron/          # Electron main process, IPC API, and preload scripts
├── docs/              # Documentation
├── src/               # Frontend UI
│   ├── components/    # Shared UI components
│   ├── features/      # UI features
│   │   ├── agent/     # Configuring agents, skills, and rules in the context
│   │   ├── prompt/    # Prompt engineering tools and conversation history management
│   │   ├── session/   # Manage sessions
│   │   ├── settings/  # Global configurations and LLM provider management
│   │   └── workspace/ # Workspace management
│   ├── services/      # Bridges and communication with Electron APIs
│   ├── libs/          # Shared utilities and LLMProvider implementation
│   ├── stores/        # Global application state
│   └── agent-engine/  # Coordinates model inference, tool execution, and state updates
```
