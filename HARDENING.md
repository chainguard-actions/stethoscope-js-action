<!-- markdownlint-disable -->

# Hardening Report: stethoscope-js--action/v1.2.8

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **stethoscope-js--action/v1.2.8** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All `uses:` references across workflow files use mutable tags, version strings, or branch names instead of pinned 40-character SHA commits, making the workflows vulnerable to supply-chain attacks if a referenced action is compromised or its tag is moved.

Failing references include:
- automerge.yml: `pascalgn/automerge-action@v0.13.0`, `koj-co/delete-merged-action@master`
- build.yml: `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `actions/cache@v2`, `stefanzweifel/git-auto-commit-action@v4.8.0`
- codeql.yml: `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `github/codeql-action/init@v1`, `actions/cache@v2`, `github/codeql-action/analyze@v1`
- dependabot.yml: `koj-co/dependabot-pr-action@master`
- feature-pr.yml: `vsoch/pull-request-action@1.0.13`
- hotfix-pr.yml: `vsoch/pull-request-action@1.0.13`
- labeler.yml: `actions/labeler@master`, `koj-co/label-approved-action@master`
- node.yml: `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `actions/cache@v2`
- pull-request.yml: `actions/github-script@v3` (×4), `vsoch/pull-request-action@1.0.13`
- release-scheduler.yml: `koj-co/release-scheduler@master`
- release.yml: `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `actions/cache@v2`
- stale.yml: `actions/stale@v3`

Locations:

- `.github/workflows/automerge.yml:18`
- `.github/workflows/automerge.yml:23`
- `.github/workflows/build.yml:13`
- `.github/workflows/build.yml:18`
- `.github/workflows/build.yml:22`
- `.github/workflows/build.yml:33`
- `.github/workflows/codeql.yml:13`
- `.github/workflows/codeql.yml:16`
- `.github/workflows/codeql.yml:19`
- `.github/workflows/codeql.yml:24`
- `.github/workflows/codeql.yml:29`
- `.github/workflows/dependabot.yml:10`
- `.github/workflows/feature-pr.yml:12`
- `.github/workflows/hotfix-pr.yml:12`
- `.github/workflows/labeler.yml:8`
- `.github/workflows/labeler.yml:12`
- `.github/workflows/node.yml:13`
- `.github/workflows/node.yml:17`
- `.github/workflows/node.yml:21`
- `.github/workflows/pull-request.yml:13`
- `.github/workflows/pull-request.yml:36`
- `.github/workflows/pull-request.yml:46`
- `.github/workflows/pull-request.yml:52`
- `.github/workflows/pull-request.yml:58`
- `.github/workflows/pull-request.yml:66`
- `.github/workflows/release-scheduler.yml:8`
- `.github/workflows/release.yml:13`
- `.github/workflows/release.yml:18`
- `.github/workflows/release.yml:22`
- `.github/workflows/stale.yml:8`

### missing-permissions (severity: medium)

None of the workflow files define a top-level `permissions:` key, and none of the individual jobs define a `permissions:` key. Without explicit permissions, workflows run with the default (often broad) token permissions, violating the principle of least privilege.

Locations:

- `.github/workflows/automerge.yml:1`
- `.github/workflows/build.yml:1`
- `.github/workflows/codeql.yml:1`
- `.github/workflows/dependabot.yml:1`
- `.github/workflows/feature-pr.yml:1`
- `.github/workflows/hotfix-pr.yml:1`
- `.github/workflows/labeler.yml:1`
- `.github/workflows/node.yml:1`
- `.github/workflows/pull-request.yml:1`
- `.github/workflows/release-scheduler.yml:1`
- `.github/workflows/release.yml:1`
- `.github/workflows/stale.yml:1`

### script-injection (severity: high)

In pull-request.yml, three `run:` steps directly interpolate `${{ steps.*.outputs.result }}` expressions inside shell command strings (sub-rule a). The step outputs are derived from attacker-controllable git context (branch names containing commit author usernames, commit messages, etc.). An attacker could craft a branch name or commit to inject arbitrary shell commands.

Offending lines:
- Line 34: `run: echo "PULL_REQUEST_TITLE=${{steps.set-branch-name.outputs.result}}" >> $GITHUB_ENV`
- Line 47: `run: echo "PULL_REQUEST_BODY=${{steps.set-pr-body.outputs.result}}" >> $GITHUB_ENV`
- Line 54: `run: echo "PULL_REQUEST_DRAFT=${{steps.set-pr-draft.outputs.result}}" >> $GITHUB_ENV`

Locations:

- `.github/workflows/pull-request.yml:34`
- `.github/workflows/pull-request.yml:47`
- `.github/workflows/pull-request.yml:54`

### github-env-injection (severity: high)

In pull-request.yml, three `run:` steps write values derived from `steps.*.outputs.*` (which contain attacker-controllable data from git context such as branch names and commit author usernames) directly to `$GITHUB_ENV` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). This allows an attacker to inject arbitrary environment variables into subsequent steps by embedding newlines in a branch name or commit.

Offending lines:
- Line 34: `run: echo "PULL_REQUEST_TITLE=${{steps.set-branch-name.outputs.result}}" >> $GITHUB_ENV`
- Line 47: `run: echo "PULL_REQUEST_BODY=${{steps.set-pr-body.outputs.result}}" >> $GITHUB_ENV`
- Line 54: `run: echo "PULL_REQUEST_DRAFT=${{steps.set-pr-draft.outputs.result}}" >> $GITHUB_ENV`

Locations:

- `.github/workflows/pull-request.yml:34`
- `.github/workflows/pull-request.yml:47`
- `.github/workflows/pull-request.yml:54`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection

**Notes:**

Fixed all 12 workflow files:

**unpinned-uses**: Pinned all action references to full 40-char SHAs with original tag as comment:
- pascalgn/automerge-action@v0.13.0 → c6f2699cc4c19ea7ce7f560dbebd85565b744377
- koj-co/delete-merged-action@master → 63a03c35810a8a7d4840d18793c0f68ff8b59450
- actions/checkout@v2.3.4 → 5a4ac9002d0be2fb38bd78e4b4dbde5606d7042f
- actions/setup-node@v2.1.4 → c46424eee26de4078d34105d3de3cc4992202b1e
- actions/cache@v2 → 8492260343ad570701412c2f464a5877dc76bace
- stefanzweifel/git-auto-commit-action@v4.8.0 → 75802d269e7721b5146d08f6063ba3097c55ad2b
- github/codeql-action/init@v1 → 231aa2c8a89117b126725a0e11897209b7118144
- github/codeql-action/analyze@v1 → 231aa2c8a89117b126725a0e11897209b7118144
- koj-co/dependabot-pr-action@master → fdc117e45d5ee003c9a7d81fc3c111c95183b70c
- vsoch/pull-request-action@1.0.13 → ebce8e4918a162c11be918e7ace8cc75fdc8d18c
- actions/labeler@master (master not found, used main) → 2c2a2313b245ae5cb1ddbddf76be67b266211c91
- koj-co/label-approved-action@master → 5e7f8b5ab37030de670f7ba6ffa911fa9a4848b6
- actions/github-script@v3 → ffc2c79a5b2490bd33e0a41c1de74b877714d736
- koj-co/release-scheduler@master → c70ce29fbd1120532891e6b8efeca52d56ecc9e3
- actions/stale@v3 → 98ed4cb500039dbcccf4bd9bedada4d0187f2757

**missing-permissions**: Added minimal top-level permissions blocks to all 12 workflow files.

**script-injection + github-env-injection**: In pull-request.yml, moved all three ${{ steps.*.outputs.result }} expressions from run: shell strings into env: blocks, then sanitized with `printf '%s' "$VAR" | tr -d '\n\r'` before writing to $GITHUB_ENV.

