# GitHub Workflows & Automation

This directory contains GitHub Actions workflows and automation configuration for the Stricture monorepo.

## 🚀 Workflows

### CI Pipeline (`workflows/ci.yml`)

**Purpose:** Runs continuous integration checks on every push and pull request to ensure code quality.

**Triggers:**
- Push to `main` branch
- Pull requests targeting `main` branch
- Manual dispatch via GitHub UI

**What it does:**
1. ✅ **Install Dependencies** - Uses pnpm 8.15.0 with caching for fast installs
2. 🏗️ **Build** - Compiles all packages using Turbo for parallel builds
3. 🧪 **Test** - Runs the full test suite across all packages
4. 🔍 **Lint** - Checks code style and quality with ESLint
5. 📋 **Type Check** - Validates TypeScript types across the monorepo

**Performance:**
- **Cold run:** ~5-8 minutes
- **Cached run:** < 3 minutes (with pnpm + Turbo cache hits)

**Artifacts:**
- Build outputs are uploaded and retained for 7 days
- Includes compiled packages (dist/) and Next.js builds

#### Running Manually

You can trigger the CI workflow manually from the GitHub Actions tab:

1. Go to **Actions** > **CI**
2. Click **Run workflow**
3. Select the branch
4. Click **Run workflow**

#### Viewing Results

- **In PR:** Check status appears at the bottom of the PR
- **Actions Tab:** Full logs and artifacts at `https://github.com/stricture-dev/stricture/actions`
- **Job Summary:** Expandable summary with emoji status indicators

### Status Badge

Add this badge to your README.md to show CI status:

```markdown
[![CI](https://github.com/stricture-dev/stricture/actions/workflows/ci.yml/badge.svg)](https://github.com/stricture-dev/stricture/actions/workflows/ci.yml)
```

Renders as:

[![CI](https://github.com/stricture-dev/stricture/actions/workflows/ci.yml/badge.svg)](https://github.com/stricture-dev/stricture/actions/workflows/ci.yml)

## 🤖 Dependabot (`dependabot.yml`)

**Purpose:** Automatically keeps dependencies up-to-date.

**Configuration:**

### npm (pnpm workspace)
- **Schedule:** Daily at 3:00 AM UTC
- **Grouping:** Minor and patch updates are grouped together
  - Development dependencies grouped separately
  - Production dependencies grouped separately
- **Labels:** `dependencies`, `automated`
- **PR Limit:** 10 concurrent PRs

### GitHub Actions
- **Schedule:** Weekly on Mondays at 3:00 AM UTC
- **Labels:** `dependencies`, `github-actions`, `automated`
- **PR Limit:** 5 concurrent PRs

### Best Practices

**For maintainers:**
1. Review and merge Dependabot PRs regularly
2. Check if CI passes before merging
3. Consider enabling auto-merge for patch updates to dev dependencies
4. Major version updates require manual review

**Auto-merge setup (optional):**
```bash
# Enable auto-merge for patch dev dependencies
gh pr merge <PR-NUMBER> --auto --squash
```

## 📊 Workflow Optimization

### Caching Strategy

The CI workflow uses three levels of caching:

1. **pnpm Cache** - Cached via `actions/setup-node` with cache: 'pnpm'
2. **pnpm Store** - Explicit cache of pnpm store directory
3. **Turbo Cache** - Caches build outputs for incremental builds

### When Cache Works

✅ **Cache hits occur when:**
- `pnpm-lock.yaml` hasn't changed (pnpm cache)
- Source files haven't changed (Turbo cache)
- Previous run on same branch/commit (Turbo cache)

❌ **Cache misses occur when:**
- Dependencies are updated
- Source files are modified
- Running on a new branch for the first time

### Improving Performance

**For contributors:**
- Keep PRs focused to minimize rebuild scope
- Run `pnpm build` locally before pushing
- Turbo will cache unchanged packages

**For maintainers:**
- Consider artifact caching between jobs for larger monorepos
- Monitor workflow run times in Actions insights
- Update cache keys if storage grows too large

## 🔧 Local Development

Test your changes locally before pushing:

```bash
# Install dependencies
pnpm install

# Run all checks (same as CI)
pnpm build
pnpm test
pnpm lint
pnpm type-check

# Or run all at once
pnpm build && pnpm test && pnpm lint && pnpm type-check
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io/)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

## 🐛 Troubleshooting

### CI is failing but works locally

1. Check Node.js version matches (20.x)
2. Verify pnpm version matches (8.15.0)
3. Clear caches: Re-run workflow with cache cleared
4. Check for environment-specific issues (filesystem, permissions)

### Dependabot PRs are failing

1. Check if lockfile needs regeneration
2. Look for peer dependency conflicts
3. Review breaking changes in the dependency
4. May need manual intervention for complex updates

### Slow workflow runs

1. Check cache hit rates in workflow logs
2. Look for cache: "Cache restored from key" messages
3. Consider reducing test parallelism if runners are overloaded
4. Review Turbo pipeline configuration in `turbo.json`

## 📝 Maintenance

### Updating Workflows

When modifying workflows:
1. Test changes on a feature branch first
2. Check workflow syntax: `gh workflow view ci.yml`
3. Monitor first run for issues
4. Update this README if behavior changes

### Updating Node.js Version

1. Update in `ci.yml` under `actions/setup-node`
2. Update `engines.node` in root `package.json`
3. Test locally with new version
4. Update this README

### Updating pnpm Version

1. Update in `ci.yml` under `pnpm/action-setup`
2. Update `packageManager` in root `package.json`
3. Run `pnpm install` to update lockfile
4. Commit lockfile changes
