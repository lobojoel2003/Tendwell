# Contributing to Tendwell

Thank you for helping. Tendwell is used by people on some of the hardest days of their lives, so
every improvement, from a clearer sentence to a bug fix, matters.

## Improving the guides (no coding needed)

Every step, guide and letter is a plain text file in [`content/`](content/). The
[content style guide](content/README.md) explains the format and the tone we aim for.

The quickest way to suggest a change:

1. Open the file on GitHub and press the pencil icon (“Edit this file”).
2. Make your change and describe it briefly.
3. Choose “Propose changes”. GitHub will make a pull request for you.

Automated checks will tell you if a file needs fixing, and a maintainer will help. If you'd rather
not edit files, [open an issue](https://github.com/lobojoel2003/Tendwell/issues/new/choose) in plain
words instead.

Content is licensed under [CC BY-SA 4.0](content/LICENSE). By contributing to `content/`, you agree
to license your contribution under it.

## Working on the code

You need [Node.js](https://nodejs.org/) 22.17 or newer (24 recommended; see `.nvmrc`).

```bash
git clone https://github.com/lobojoel2003/Tendwell.git
cd Tendwell
npm install
npm run dev
```

The app runs at http://localhost:5173 and keeps its SQLite database in `data/tendwell.db`.

### Scripts

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Start the development server                             |
| `npm run build`         | Build for production into `build/`                       |
| `npm start`             | Run the production build (`node build`)                  |
| `npm run check`         | Type-check Svelte and TypeScript                         |
| `npm run lint`          | Check formatting (Prettier) and lint (ESLint)            |
| `npm run format`        | Fix formatting                                           |
| `npm run content:check` | Validate everything in `content/`                        |
| `npm run test:unit`     | Unit tests (Vitest), in watch mode                       |
| `npm run test:e2e`      | End-to-end tests (Playwright), builds and starts the app |
| `npm test`              | Unit and end-to-end tests once                           |
| `npm run screenshots`   | Regenerate the README screenshots (see `scripts/`)       |

The first time you run end-to-end tests, install a browser with `npx playwright install chromium`.

### Project layout

```text
content/            Guides, checklist steps, letters and questions (CC BY-SA 4.0)
src/lib/content/    Content schema, Markdown/YAML parsing and the letter template language
src/lib/server/     Database, migrations, auth, plans, PDF rendering (server only)
src/lib/plan.ts     The "three things this week" logic, shared and unit tested
src/lib/components/ Svelte components
src/routes/         Pages and endpoints (SvelteKit)
tests/e2e/          Playwright tests
scripts/            Screenshot and admin scripts
```

### Database changes

Migrations live in `src/lib/server/db/migrations/` as numbered SQL files (`002_add_x.sql`). They
run automatically, in order, when the server starts. Never edit a migration that has been released;
add a new one.

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/): `feat: …`, `fix: …`,
`content: …`, `docs: …`, `ci: …`, `chore: …`. Keep the first line short and describe the change for
a person, not the code.

## Releasing

Tendwell uses [Semantic Versioning](https://semver.org/). Every CI run also has a build number
(the GitHub Actions run number), shown in the footer and at `/healthz`.

1. Move the notes under “Unreleased” in `CHANGELOG.md` into a new version section, with the date.
2. Bump the version and create the tag: `npm version 1.1.0 -m "chore(release): %s"`.
3. Push the commit and the tag: `git push origin main --follow-tags`.

The [Release workflow](.github/workflows/release.yml) then runs the full test suite, creates the
GitHub Release with the changelog notes and a ready-to-run bundle, and publishes the Docker image
to `ghcr.io/lobojoel2003/tendwell` with the tags `1.1.0`, `1.1`, `1`, `latest` and
`build-<number>`. You can also start it by hand from the Actions tab.

## Code of conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md). In short: be kind. Many people here are
grieving.
