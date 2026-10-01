# MoriPath

Web application and portal service for the Morino Party (もりのパーティ) Minecraft server network. It provides players with access to in-game account data, balances, land claims, quests, and server statuses through a modern web dashboard.

## Features

- **Player dashboard**: View player profile, statistics, and in-game status
- **Minecraft authentication**: Secure sign-in integrated with MineAuth (OAuth2 / OpenID Connect)
- **Economy & Claims**: Check Vault balances, view land claim boundaries, and purchase claim blocks directly from the web
- **Server status**: Monitor online players and active server states across the network
- **Storybook integration**: Component catalog developed with Storybook and bundled under `/storybook`
- **Edge rendering**: High-performance SSR and edge execution powered by Cloudflare Workers

The live portal is available at [app.morino.party](https://app.morino.party), and the component catalog is accessible at [app.morino.party/storybook](https://app.morino.party/storybook).

## Modules

| Module | Description |
|--------|-------------|
| `app` | Main web application (TanStack Start, Vite, Cloudflare Workers) |
| `storybook` | Component catalog and documentation built with Storybook 10 |

## Tech stack

- **TanStack Start** / **TanStack Router** - full-stack React framework with SSR and file-based routing
- **React** 19 / **TypeScript** 5.9
- **Cloudflare Workers** (`cf` CLI / workerd) - edge serverless runtime
- **Vite** 7 - frontend tooling and build pipeline
- **TanStack Query** - asynchronous server state synchronization and data fetching
- **Chlorophyll** (`@morinoparty/chlorophyll-react`) - Morino Party design system component library
- **Ark UI** / **Panda CSS** - accessible headless UI primitives and zero-runtime CSS-in-JS
- **Better Auth** - authentication framework integrated with MineAuth OIDC provider
- **Biome** - linter and code formatter
- **Storybook** 10 - UI component development and preview

## Requirements

- **Node.js** 26+
- **pnpm** 10+
- **[Task](https://taskfile.dev/)** (optional)

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Setup git hooks
pnpm lefthook install
```

### Environment variables

Copy the example environment configuration in `app`:

```bash
cp app/.env.example app/.env
```

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Secret key used for session encryption (at least 32 characters) |
| `MAIN_SERVER_URL` | Main Minecraft server backend API endpoint (e.g. `https://api.morino.party/main`) |
| `SERVER_URL` | Base API endpoint for Morino Party services |
| `SERVERS` | Comma-separated list of server identifiers (e.g. `main,res,lobby`) |
| `CLIENT_ID` | MineAuth OAuth2 client ID |

### Running dev servers

```bash
# Start the web app (TanStack Start + Vite)
pnpm dev

# Start Storybook dev server
pnpm dev:storybook

# Or run both concurrently
pnpm dev:all
```

## Build & check

```bash
# Run Biome linter and formatter
pnpm check

# Build Storybook and the web app
pnpm build

# Preview production build locally
cd app && pnpm preview
```

## Deployment

Deployments to Cloudflare Workers are automated via GitHub Actions on push to `main` (and PR preview deployments).

To build and deploy manually:

```bash
pnpm deploy
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start web application dev server (`app`) |
| `pnpm dev:storybook` | Start Storybook dev server (`storybook`) |
| `pnpm dev:all` | Start both web application and Storybook concurrently |
| `pnpm build` | Build Storybook and web application |
| `pnpm build:storybook` | Build Storybook static assets |
| `pnpm check` | Run Biome linter and formatter checks with autofix |
| `pnpm deploy` | Build Storybook and deploy application via `cf deploy` |
| `pnpm cf-typegen` | Generate Cloudflare Worker environment bindings |

## Design system

MoriPath utilizes [Chlorophyll](https://github.com/morinoparty/chlorophyll), Morino Party's component library and design token system. Color schemes and base tokens are defined in accordance with the [Morino Party BaseToken specification](https://color-palette.nikomaru.workers.dev/?data=%5B%7B%22colorValue%22%3A%22rgba%2894%2C+161%2C+129%2C+1%29%22%2C%22colorId%22%3A%22leaf%22%2C%22uniqueId%22%3A3%7D%2C%7B%22colorValue%22%3A%22rgba%2859%2C+149%2C+155%2C+1%29%22%2C%22colorId%22%3A%22sea%22%2C%22uniqueId%22%3A4%7D%2C%7B%22colorValue%22%3A%22rgba%28226%2C+131%2C+117%2C+1%29%22%2C%22colorId%22%3A%22red%22%2C%22uniqueId%22%3A5%7D%2C%7B%22colorValue%22%3A%22rgba%28155%2C+150%2C+2%2C+1%29%22%2C%22colorId%22%3A%22yellow%22%2C%22uniqueId%22%3A6%7D%2C%7B%22colorValue%22%3A%22rgba%28236%2C+72%2C+153%2C+1%29%22%2C%22colorId%22%3A%22pink%22%2C%22uniqueId%22%3A7%7D%2C%7B%22colorValue%22%3A%22rgba%28207%2C+250%2C+254%2C+1%29%22%2C%22colorId%22%3A%22cyan%22%2C%22uniqueId%22%3A8%7D%2C%7B%22colorValue%22%3A%22rgba%28168%2C+85%2C+247%2C+1%29%22%2C%22colorId%22%3A%22purple%22%2C%22uniqueId%22%3A9%7D%2C%7B%22colorValue%22%3A%22rgba%2859%2C+130%2C+246%2C+1%29%22%2C%22colorId%22%3A%22blue%22%2C%22uniqueId%22%3A10%7D%2C%7B%22colorValue%22%3A%22rgba%2820%2C+184%2C+166%2C+1%29%22%2C%22colorId%22%3A%22teal%22%2C%22uniqueId%22%3A11%7D%2C%7B%22colorValue%22%3A%22rgba%2822%2C+163%2C+74%2C+1%29%22%2C%22colorId%22%3A%22green%22%2C%22uniqueId%22%3A12%7D%2C%7B%22colorValue%22%3A%22rgba%28251%2C+146%2C+60%2C+1%29%22%2C%22colorId%22%3A%22orange%22%2C%22uniqueId%22%3A13%7D%2C%7B%22colorValue%22%3A%22rgba%2882%2C+82%2C+91%2C+1%29%22%2C%22colorId%22%3A%22gray%22%2C%22uniqueId%22%3A14%7D%5D&mode=chakra).

## License

Written in 2025-2026 by Morinoparty developer team. No Rights Reserved.

To the extent possible under law, morinoparty has waived all copyright and related or neighboring rights to MoriPath. This work is published from: Japan.

You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see http://creativecommons.org/publicdomain/zero/1.0/.

This CC0 dedication applies to the source code only. Non-code assets (images, icons, logos, and other media) are **not** covered and remain under their respective rights unless stated otherwise.
