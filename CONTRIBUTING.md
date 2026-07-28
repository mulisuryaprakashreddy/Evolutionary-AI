# Contributing to AICrew

Thanks for looking at this. AICrew started as one person's attempt to trace how work moves from paper → software → AI-assisted software → digital employees → digital organizations. It's grown past what one person can build alone, and that's the point — the project only proves its own thesis if more than one mind is behind it.

If you've ever thought *"a calculator helps an accountant, but it isn't one"* and wondered what it'd take to build the accountant instead of the calculator — you're in the right place.

## Table of contents
- [How to get started](#how-to-get-started)
- [Open an issue first](#open-an-issue-first)
- [Good first contributions](#good-first-contributions)
- [Branches and pull requests](#branches-and-pull-requests)
- [PR checklist](#pr-checklist)
- [Design guidelines & scope](#design-guidelines--scope)
- [Licensing and contributor agreement](#licensing-and-contributor-agreement)
- [Code of Conduct](#code-of-conduct)
- [Communication](#communication)
- [Maintainers](#maintainers)

## How to get started

1. Read `README.md` — it explains the stage model (Stage 1 → Stage 5) and why the structure looks the way it does. Contributions that don't map to a stage are hard to place, so this is worth five minutes.
2. Right now **Business** is the priority domain. We're taking it end-to-end through the stages before spreading wide into Healthcare, Finance, etc. If you want maximum impact, work here first.
3. Browse open issues and the `Stage-1` .. `Stage-5` folders. If your idea doesn't match anything open, **open an issue before writing code** — see below.
4. Fork the repo, branch off the default branch.

Branch naming: `feature/<domain>/<short-description>` or `fix/<area>/<short-description>`
Example: `feature/business/break-even-calculator`

## Open an issue first

We prefer discussion before heavy implementation — it's a lot less painful to redirect an idea than a finished PR. Open an issue to propose:

- a new agent (e.g., a Financial Analyst agent for Stage 3)
- a new domain component, tool, or data schema
- an experiment spanning stages, or a multi-agent interaction

Include in the issue:
- a short summary of what you want to add
- **which stage it belongs to and why** (this is the one thing people most often skip)
- a minimal design sketch or reproducible steps

## Good first contributions

New and not sure where to start? These are the shapes of task that are genuinely useful without needing full project context:

- **Stage 1 example**: a small, well-documented traditional-software tool for an under-filled domain (e.g., a simple Healthcare intake form).
- **Stage 3 example**: a single deterministic sub-tool for an existing agent — e.g., a break-even calculator, a tax-bracket lookup, a unit converter — that the agent's reasoning layer can call. These are ideal first PRs: scoped, testable, and don't require touching the orchestrator.
- **Docs**: fill in a missing Stage README, add a diagram, or document an existing agent's assumption-transparency output.
- **Tests**: add a reproducible example or test for an agent/tool that doesn't have one yet.

Open an issue titled `good-first-contribution: <short idea>` and a maintainer will help scope it with you.

## Branches and pull requests

- Link your PR to an issue (`Fixes #<issue>` when appropriate).
- Keep PRs small and focused — a Stage-3 tool addition and an orchestrator refactor should never be the same PR.
- PR title format: `[stage-#] <short summary>` — e.g. `[stage-3] Add break-even calculator to Business Analyst agent`

## PR checklist

Before requesting review:

- [ ] New code has tests or a reproducible example
- [ ] Documentation updated (root README or the relevant Stage README)
- [ ] Code follows existing repo conventions
- [ ] Commit messages are clear and atomic
- [ ] Linters/formatters run, if applicable
- [ ] PR description explains how to validate the change locally
- [ ] If the PR adds a new agent or multi-agent interaction, it includes a short demo script or run instructions

## Design guidelines & scope

- **Modularity over cleverness.** A tool built for the Business Analyst should be reusable, not hard-wired to one prompt.
- **Deterministic tools stay separate from the reasoning layer.** If it's math, a lookup, or a fixed calculation — it's a tool, not a prompt. This is a hard rule for anything under `Stage-3` and beyond: an agent that can't tell you *which* of its outputs are computed versus guessed isn't a digital employee, it's a chatbot with a job title.
- **Assumption transparency is not optional.** Any agent-facing output that involves a judgment call (an estimate, a projection, a risk score) must show what it assumed, not just the number it landed on.
- **Prototype small, document the intent.** A well-documented 80%-solution beats an undocumented, brittle 100%-solution — the next contributor needs to understand *why*, not just *what*.
- **No private or copyrighted data.** Link to public datasets, or ship small synthetic examples.

## Licensing and contributor agreement

This repository is licensed under the **GNU General Public License v3 (GPL-3.0)** — see `LICENSE`.

By contributing (issues, PRs, code, or content), you agree that:
- your contribution is licensed under GPL-3.0
- you grant the maintainers the right to include it in the project under that license

Please do one of the following:
- add a `Signed-off-by: Your Name <your.email@example.com>` line to your commit (Developer Certificate of Origin style), **or**
- explicitly state in your PR description that you license your changes under GPL-3.0

If you're porting code or ideas from another project, confirm you have the right to relicense it under GPL-3.0 and state the provenance in your PR.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful and constructive. Harassment, hate speech, or discriminatory language will not be tolerated. To report an incident, email **mulisuryaprakashreddy07@gmail.com** directly. Reports are handled promptly and confidentially.

## Communication

- **GitHub Issues** — design proposals, bug reports, tracking work
- **Pull Requests** — code and documentation changes
- Synchronous chat (Discord/Slack/Matrix) isn't set up yet. If there's enough interest, open an issue and we'll pick one.

## Maintainers

- **Surya** — [@mulisuryaprakashreddy](https://github.com/mulisuryaprakashreddy) — project creator, currently focused on the Stage-3 Business Analyst agent
  Contact: mulisuryaprakashreddy07@gmail.com

---

This project exists to move ideas from paper to working digital employees, one domain, one stage at a time. Whatever you bring — code, a design sketch, a test, a documentation fix, even a sharp question in an issue — it moves the whole thing forward. Glad to have you building this with us.
