# MoriPath

Web application and portal service for the Morino Party (もりのパーティ) Minecraft server network. It provides players with access to in-game account data, balances, land claims, quests, and server statuses through a modern web dashboard.

## Features

- **Player dashboard**: View player profile, statistics, and in-game status
- **Minecraft authentication**: Secure sign-in integrated with MineAuth (OAuth2 / OpenID Connect)
- **Economy & Claims**: Check Vault balances, view land claim boundaries, and purchase claim blocks directly from the web
- **Server status**: Monitor online players and active server states across the network
- **Storybook integration**: Component catalog developed with Storybook and bundled under `/storybook`
- **Edge rendering**: High-performance SSR and edge execution powered by Cloudflare Workers

The live portal is available at [moripath.morinoparty.workers.dev](https://moripath.morinoparty.workers.dev), and the component catalog is accessible at [moripath.morinoparty.workers.dev/storybook](https://moripath.morinoparty.workers.dev/storybook/).

## Modules

| Module | Description |
|--------|-------------|
| `app` | Main web application (TanStack Start, Vite, Cloudflare Workers) |
| `storybook` | Component catalog and documentation built with Storybook 10 |

## Tech stack

- **TanStack Start** / **TanStack Router** - full-stack React framework with SSR and file-based routing
- **React** 19 / **TypeScript** 5.9
- **Cloudflare Workers** (`cf` CLI / workerd) - edge serverless runtime
- **[Vite+](https://viteplus.dev)** 1.5 (`vite-plus`, `vp` CLI) - unified toolchain: Vite 8 + Rolldown for builds, Vite Task for cached task runs
- **TanStack Query** - asynchronous server state synchronization and data fetching
- **Chlorophyll** (`@morinoparty/chlorophyll-react`) - Morino Party design system component library
- **Ark UI** / **Panda CSS** - accessible headless UI primitives and zero-runtime CSS-in-JS
- **Better Auth** - authentication framework integrated with MineAuth OIDC provider
- **Oxlint** / **Oxfmt** (via `vp check`) - linter and code formatter
- **Storybook** 10 - UI component development and preview

## Requirements

- **Node.js** 26+
- **pnpm** 12 (version pinned by `packageManager` in `package.json`)
- **[Vite+ global CLI](https://viteplus.dev/guide/global-cli)** (optional) - `vite-plus` is a devDependency, so `pnpm run <script>` and `pnpm exec vp <command>` work without it. A global `vp` delegates `vp build`, `vp run`, etc. to the project's version (pinned in the `catalog` of `pnpm-workspace.yaml`)

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Setup git hooks (lefthook is a devDependency)
pnpm lefthook install
```

The lefthook `pre-commit` hook runs `vp check --fix` on staged files. Git hooks are managed by lefthook only: do not run `vp config` or `vp hooks enable`, which set `core.hooksPath` to the Vite+ hook dispatcher and bypass lefthook.

### Environment variables

Copy the example environment configuration in `app`:

```bash
cp app/.env.example app/.env
```

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID used by the `cf` CLI (not passed to the Worker) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token used by the `cf` CLI (not passed to the Worker) |
| `AUTH_SECRET` | Secret key used for session encryption (at least 32 characters) |
| `SERVER_URL` | Base API endpoint for Morino Party services (e.g. `https://api.morino.party/`). The server list is fetched from `${SERVER_URL}servers`, and the first reachable server in that list is used as the MineAuth server |
| `MC_API_URL` | Player API used for player names and images |
| `CLIENT_ID` | MineAuth OAuth2 client ID (defined as a var in `app/cloudflare.config.ts`; set it in `.env` only to override it locally). The redirect URI to register on MineAuth is `<origin>/api/auth/callback/MineAuth` |

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
# Format (Oxfmt) and lint (Oxlint) with autofix
pnpm check

# Same checks without autofix, as run in CI
pnpm check:ci

# Type-check the app (tsc)
pnpm typecheck

# Build Storybook and the web app
pnpm build

# Preview production build locally
cd app && pnpm preview
```

Lint, format and task settings live in the root `vite.config.ts`. `vp check` does not type-check here, so run `pnpm typecheck` as well.

`pnpm build:storybook` empties `storybook/storybook-static` and then runs the `build-storybook` Vite Task defined in the root `vite.config.ts`. When its inputs are unchanged, it restores `storybook/storybook-static` from the task cache (`node_modules/.vite/task-cache`) instead of rebuilding. The inputs are an explicit list, so add new locations there if stories start reading files from elsewhere. To force a rebuild:

```bash
pnpm exec vp run --no-cache build-storybook
```

## Deployment

The app is deployed with the `cf` CLI as the Worker `moripath` and served only on `https://moripath.morinoparty.workers.dev` (no custom domain).

A single workflow, `.github/workflows/deploy.yml`, runs on pull requests, on push to `main` and on manual dispatch. Every run executes `check:ci`, `typecheck`, the Storybook build (with the Vite Task cache restored from the GitHub Actions cache), `vp build` and `cf deploy --prebuilt --mode production --dry-run`. Then:

- **Push to `main`**: deploys to production with `cf deploy --prebuilt --mode production --secrets-file`.
- **Pull requests**: uploads a Worker Version with `cf workers versions create` (not deployed to production) and gives it the preview alias `pr-<N>`. PR runs check out and build the PR head commit (not the merge commit), so each upload matches one commit. This yields two preview URLs:
  - the PR alias URL (`pr-<N>`), which always points to the latest commit of the PR
  - the Version URL, which stays pinned to that commit

  Storybook is served under `/storybook/` on both. The URLs, the Worker Version ID and the head commit are posted as a PR comment, which is edited in place on later pushes, and are also written to the run's job summary.
- A re-run of an older run whose head is no longer the PR head skips the upload and the comment, so the PR alias does not go back to old code.
- Previews use the production Worker secrets. MineAuth sign-in may fail on preview origins, because the redirect URI `<origin>/api/auth/callback/MineAuth` is not registered for them.
- Previews are skipped for pull requests from forks and from Dependabot, which do not receive repository secrets.

Secrets are read from GitHub Actions secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for the `cf` CLI, and `AUTH_SECRET`, `SERVER_URL` and `MC_API_URL`, which CI uploads as Worker secrets with `cf deploy --secrets-file`. Register them from your local `.env`:

```bash
gh secret set -f app/.env
```

To build and deploy manually (`cf` reads `CLOUDFLARE_*` from `app/.env`):

```bash
pnpm run deploy
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start web application dev server (`app`) |
| `pnpm dev:storybook` | Start Storybook dev server (`storybook`) |
| `pnpm dev:all` | Start both web application and Storybook concurrently |
| `pnpm build` | Build Storybook and web application |
| `pnpm build:storybook` | Build Storybook static assets (cached Vite Task) |
| `pnpm check` | Format and lint with autofix (`vp check --fix`: Oxfmt + Oxlint) |
| `pnpm check:ci` | Format and lint checks without autofix (`vp check`) |
| `pnpm typecheck` | Type-check the web application with `tsc` |
| `pnpm run deploy` | Build Storybook and deploy application via `cf deploy` |
| `pnpm cf-typegen` | Generate Cloudflare Worker environment bindings |

## Design system

MoriPath utilizes [Chlorophyll](https://github.com/morinoparty/chlorophyll), Morino Party's component library and design token system. Color schemes and base tokens are defined in accordance with the [Morino Party BaseToken specification](https://color-palette.nikomaru.workers.dev/?data=%5B%7B%22colorValue%22%3A%22rgba%2894%2C+161%2C+129%2C+1%29%22%2C%22colorId%22%3A%22leaf%22%2C%22uniqueId%22%3A3%7D%2C%7B%22colorValue%22%3A%22rgba%2859%2C+149%2C+155%2C+1%29%22%2C%22colorId%22%3A%22sea%22%2C%22uniqueId%22%3A4%7D%2C%7B%22colorValue%22%3A%22rgba%28226%2C+131%2C+117%2C+1%29%22%2C%22colorId%22%3A%22red%22%2C%22uniqueId%22%3A5%7D%2C%7B%22colorValue%22%3A%22rgba%28155%2C+150%2C+2%2C+1%29%22%2C%22colorId%22%3A%22yellow%22%2C%22uniqueId%22%3A6%7D%2C%7B%22colorValue%22%3A%22rgba%28236%2C+72%2C+153%2C+1%29%22%2C%22colorId%22%3A%22pink%22%2C%22uniqueId%22%3A7%7D%2C%7B%22colorValue%22%3A%22rgba%28207%2C+250%2C+254%2C+1%29%22%2C%22colorId%22%3A%22cyan%22%2C%22uniqueId%22%3A8%7D%2C%7B%22colorValue%22%3A%22rgba%28168%2C+85%2C+247%2C+1%29%22%2C%22colorId%22%3A%22purple%22%2C%22uniqueId%22%3A9%7D%2C%7B%22colorValue%22%3A%22rgba%2859%2C+130%2C+246%2C+1%29%22%2C%22colorId%22%3A%22blue%22%2C%22uniqueId%22%3A10%7D%2C%7B%22colorValue%22%3A%22rgba%2820%2C+184%2C+166%2C+1%29%22%2C%22colorId%22%3A%22teal%22%2C%22uniqueId%22%3A11%7D%2C%7B%22colorValue%22%3A%22rgba%2822%2C+163%2C+74%2C+1%29%22%2C%22colorId%22%3A%22green%22%2C%22uniqueId%22%3A12%7D%2C%7B%22colorValue%22%3A%22rgba%28251%2C+146%2C+60%2C+1%29%22%2C%22colorId%22%3A%22orange%22%2C%22uniqueId%22%3A13%7D%2C%7B%22colorValue%22%3A%22rgba%2882%2C+82%2C+91%2C+1%29%22%2C%22colorId%22%3A%22gray%22%2C%22uniqueId%22%3A14%7D%5D&mode=chakra).

## License

Written in 2025-2026 by Morinoparty developer team. No Rights Reserved.

To the extent possible under law, morinoparty has waived all copyright and related or neighboring rights to MoriPath. This work is published from: Japan.

You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see http://creativecommons.org/publicdomain/zero/1.0/.

This CC0 dedication applies to the source code only. Non-code assets (images, icons, logos, and other media) are **not** covered and remain under their respective rights unless stated otherwise.
