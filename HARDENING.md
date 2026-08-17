<!-- markdownlint-disable -->

# Hardening Report: stethoscope-js--action/v1.2.10

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **stethoscope-js--action/v1.2.10** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Every workflow file references external actions using mutable tags or branch names instead of pinned 40-character commit SHAs. This exposes the workflows to supply-chain attacks if any referenced action is compromised or its tag is moved. Affected references include: automerge.yml — `pascalgn/automerge-action@v0.13.0`, `koj-co/delete-merged-action@master`; build.yml — `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `actions/cache@v2`, `stefanzweifel/git-auto-commit-action@v4.8.0`; codeql.yml — `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `github/codeql-action/init@v1`, `actions/cache@v2`, `github/codeql-action/analyze@v1`; dependabot.yml — `koj-co/dependabot-pr-action@master`; feature-pr.yml — `vsoch/pull-request-action@1.0.13`; hotfix-pr.yml — `vsoch/pull-request-action@1.0.13`; labeler.yml — `actions/labeler@master`, `koj-co/label-approved-action@master`; node.yml — `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `actions/cache@v2`; pull-request.yml — `actions/github-script@v3`, `vsoch/pull-request-action@1.0.13`; release-scheduler.yml — `koj-co/release-scheduler@master`; release.yml — `actions/checkout@v2.3.4`, `actions/setup-node@v2.1.4`, `actions/cache@v2`; stale.yml — `actions/stale@v3`.

Locations:

- `.github/workflows/automerge.yml:18`
- `.github/workflows/automerge.yml:23`
- `.github/workflows/build.yml:12`
- `.github/workflows/build.yml:17`
- `.github/workflows/build.yml:21`
- `.github/workflows/build.yml:33`
- `.github/workflows/codeql.yml:12`
- `.github/workflows/codeql.yml:15`
- `.github/workflows/codeql.yml:18`
- `.github/workflows/codeql.yml:22`
- `.github/workflows/codeql.yml:28`
- `.github/workflows/dependabot.yml:10`
- `.github/workflows/feature-pr.yml:11`
- `.github/workflows/hotfix-pr.yml:11`
- `.github/workflows/labeler.yml:8`
- `.github/workflows/labeler.yml:12`
- `.github/workflows/node.yml:11`
- `.github/workflows/node.yml:14`
- `.github/workflows/node.yml:18`
- `.github/workflows/pull-request.yml:12`
- `.github/workflows/pull-request.yml:44`
- `.github/workflows/release-scheduler.yml:8`
- `.github/workflows/release.yml:12`
- `.github/workflows/release.yml:17`
- `.github/workflows/release.yml:21`
- `.github/workflows/stale.yml:7`

### missing-permissions (severity: medium)

None of the 12 workflow files define a top-level `permissions:` block, and no job within any of these files defines a job-level `permissions:` block. Without explicit permissions, workflows run with the default (often broad) token permissions, violating the principle of least privilege.

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

Three `run:` steps in pull-request.yml directly interpolate `${{ steps.*.outputs.result }}` expressions into shell commands (sub-rule a). These step outputs are derived from attacker-controlled data: `steps.set-branch-name.outputs.result` comes from `context.payload.ref` (the branch name), and `steps.set-pr-body.outputs.result` includes `context.payload.head_commit.author.username` and commit count — all values that can be controlled by an attacker pushing to a branch. Injecting these directly into shell via `echo "VAR=${{steps.set-branch-name.outputs.result}}"` allows shell metacharacter injection. The expressions should be passed via `env:` and the env vars double-quoted in the shell script.

Offending lines:
- `run: echo "PULL_REQUEST_TITLE=${{steps.set-branch-name.outputs.result}}" >> $GITHUB_ENV`
- `run: echo "PULL_REQUEST_BODY=${{steps.set-pr-body.outputs.result}}" >> $GITHUB_ENV`
- `run: echo "PULL_REQUEST_DRAFT=${{steps.set-pr-draft.outputs.result}}" >> $GITHUB_ENV`

Locations:

- `.github/workflows/pull-request.yml:30`
- `.github/workflows/pull-request.yml:43`
- `.github/workflows/pull-request.yml:52`

### github-env-injection (severity: high)

Three `run:` steps in pull-request.yml write values derived from attacker-controlled step outputs directly to `$GITHUB_ENV` without sanitization (no `printf '%s' ... | tr -d '\n\r'` applied before the write). The values originate from `context.payload.ref` (branch name), `context.payload.head_commit.author.username`, and commit data — all controllable by an attacker. Writing unsanitized newline-containing values to GITHUB_ENV allows environment variable injection, enabling an attacker to set arbitrary environment variables for subsequent steps.

Offending lines:
- `run: echo "PULL_REQUEST_TITLE=${{steps.set-branch-name.outputs.result}}" >> $GITHUB_ENV`
- `run: echo "PULL_REQUEST_BODY=${{steps.set-pr-body.outputs.result}}" >> $GITHUB_ENV`
- `run: echo "PULL_REQUEST_DRAFT=${{steps.set-pr-draft.outputs.result}}" >> $GITHUB_ENV`

Locations:

- `.github/workflows/pull-request.yml:30`
- `.github/workflows/pull-request.yml:43`
- `.github/workflows/pull-request.yml:52`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection

**Notes:**

Fixed all 12 workflow files: (1) Pinned all 26 action references to full commit SHAs using lookup_action_sha, preserving original tags as comments. (2) Added top-level permissions blocks to all 12 workflows with minimal required permissions. (3) Fixed 3 script-injection instances in pull-request.yml by moving ${{ steps.*.outputs.result }} expressions into env: blocks. (4) Fixed 3 github-env-injection instances in pull-request.yml by sanitizing values with printf '%s' | tr -d '\n\r' before writing to GITHUB_ENV. Note: actions/labeler@master was not found; used the main branch SHA instead.

