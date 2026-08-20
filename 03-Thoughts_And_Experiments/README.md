# Thoughts and Experiments

This is a running archive of the thinking behind the work — not just the finished code. It holds three kinds of things: **thoughts** (ideas and theories worked out through reasoning), **experiments** (things actually tried, including the ones that broke), and **knowledge** (reference material and understanding worth keeping in a stable, findable form).

The premise is simple: most of what gets learned while building something never survives the build. A wrong turn gets overwritten, a good insight gets buried three chats deep, a working theory never gets written down because the code moved on. This repo exists so none of that has to be re-derived from memory later.

Each subdirectory has its own README with the specifics of how to add to it. This top-level file is about how they relate.

## The four categories

**Thoughts → `concept-notes/`**
A claim or model worked out clearly enough that someone else could evaluate, extend, or push back on it. No code required. These are written as standalone notes — abstract, body, open threads — so they can be cited later instead of half-remembered.

**Experiments → `experiments-failures/`**
Something that was actually run, including the runs that failed or produced broken output. The point isn't to hide the failures — it's to keep a reproducible record of what was tried, what happened, and why, so the same mistake doesn't get repeated six months later under a different name.

**Knowledge**
Not every entry fits neatly as a "new idea" or a "failed run" — some are just understanding worth preserving: a concept explained clearly, a comparison worked through, a mental model that clarified something. These live in `concept-notes/` alongside the thoughts, since the format (abstract, body, open threads) fits either.

**Raw / in-progress → `scratch/`**
Not everything is ready to be a clean concept note or a documented run. Half-formed thoughts, open questions still being sat with, exploration that hasn't resolved into a claim yet — these go in `scratch/` rather than being forced into a template early or lost entirely. Nothing here needs structure; it can graduate into `concept-notes/` or `experiments-failures/` later once it settles into one.

The line between these isn't always clean, and that's fine. A scratch thought can graduate into a concept note; a concept note can motivate an experiment; an experiment's failure can sharpen a concept note. When in doubt: if there's a run with input/output/logs, it's an experiment. If it's reasoning that stands on its own without a run, it's a thought. If it's neither yet, it's scratch.

## Why this exists

The two failure modes this is meant to prevent:

1. **Repeating a failed approach** because the first attempt only existed in a deleted chat or an overwritten script.
2. **Losing a good idea** because it was worked out once, sounded right, and then was never written down anywhere durable.

Keeping both in one place, organized honestly by what they actually are, means later work — new experiments, new notes, decisions about what to build next — can build on real history instead of a half-remembered version of it.

## Adding something new

- Reasoning, theory, or explained knowledge, fully worked out → go to `concept-notes/README.md` for the format.
- An actual run, especially a failed one → go to `experiments-failures/README.md` for the format.
- Not ready to be either yet → drop it in `scratch/`, no format required.
- Don't force something into the wrong shape just to fit a template — a thought padded out with fake "reproduction steps" is worse than a thought left as a clean note, and an unfinished idea forced into "concept note" shape is worse than one left in scratch.
