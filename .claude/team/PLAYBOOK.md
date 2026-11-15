# Daily team cycle

You are the team lead for CappyCalc, running unattended once a day. The owner has authorised fully automatic shipping: changes that pass every check go straight to `main` and deploy. Read `CLAUDE.md`, this playbook, `backlog.md` and the last 3 entries of `log.md` before doing anything.

Delegate to the role agents in `.claude/agents/` with the Agent tool (one task each, with a self-contained brief). Run independent roles in parallel where noted. Budget: finish within ~90 minutes; ship at most 1 product change + 1 SEO change per day. Small and correct beats big and broken.

## 1. Plan (parallel)

- `product-research`: refresh `backlog.md` (full refresh on Mondays; otherwise only check GitHub issues and add anything urgent).
- `backend-engineer`: health check (duties 1–4; the live site is checked through the deploy workflow's `verify` job, since this sandbox cannot reach cappycalc.com). If the live site is broken, fixing it is today's only product work.

## 2. Build

1. Take the top open backlog item that is buildable in one day.
2. If it is user-facing: `ux-designer` writes the spec, then `frontend-engineer` implements it. Otherwise give it to the owning role directly.
3. In parallel with step 2, `seo-ads` makes its one focused SEO improvement (must not touch the same files).
4. Review gate (you, the lead): read the full diff. Reject and fix anything that breaks a rule in `CLAUDE.md`, any math you cannot verify, or any copy that sounds like filler. Then run `npm ci && npm run verify` (tests, type check, production build with the AdSense id, smoke) — it must pass.

## 3. Ship

- Commit with a clear message (what and why), one commit per change, and push to `main`. If pushing to `main` is refused, push a branch, open a PR with `gh pr create`, and merge it with `gh pr merge --squash --delete-branch` once its checks pass; if merging is not possible either, leave the PR open and say so in the report.
- `backend-engineer`: deploy verification (duty 5), including automatic revert if the live site breaks.
- Update `backlog.md` statuses and the spec's "Shipped" note.

## 4. Marketing (can start after step 1, parallel with step 2)

- `marketing` writes today's brief; `media` produces the files from the live site (or the local build of today's change once it is verified).
- Media lives on the `marketing` branch, never on `main`: `git fetch origin marketing && git worktree add ../mk marketing` (if the branch does not exist: `git worktree add --orphan -b marketing ../mk`), write to `../mk/<yyyy-mm-dd>/`, commit and push that branch.

## 5. Report

1. Append today's entry to `.claude/team/log.md` on `main` (≤ 25 lines): shipped (with live URLs), SEO change, health status, marketing pack location, blockers, what's next, anything the owner must do.
2. Post the same report as a new GitHub issue titled `Daily report <yyyy-mm-dd>` with label `daily-report` (create the label if missing; `gh issue create`), and close the previous day's report issue. If `gh` is unavailable, the log entry is the report.
3. The final message of the session is that report.

## Hard rules

- Never touch: `public/ads.txt`, AdSense ids, repo variables/secrets, Pages/domain/DNS settings, the deploy workflow's trigger and permissions, branch protection, other repositories.
- Never post to social media, email anyone, open accounts, or spend money.
- Never delete calculators or pages that are live (URLs are SEO assets); deprecate by improving or redirecting only with a backlog decision recorded in `decisions.md`.
- If anything is ambiguous or risky, do not ship it — write it up as a question for the owner in the report.
