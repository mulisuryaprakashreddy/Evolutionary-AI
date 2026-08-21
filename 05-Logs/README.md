# 📜Logs

Welcome to my **development logs** — the place where I record the story behind the changes I make across my repositories, projects, experiments, and ideas.

This is **not a daily diary.**

I don't need to write something here every day.

Instead, whenever I make a meaningful update to a repository or project, I can create a log explaining:

* What I changed
* Why I changed it
* What I discovered while working on it
* What problems I encountered
* What ideas came from it
* What I might do next
* Anything important that future me should know

Think of it as the **context layer behind the code.**

---

## 🧭 Where This Fits

My projects are separated by purpose:

* **🧪 Lab** → Things I'm actively building, testing, and experimenting with.
* **🗑️ Recycle Bin** → Things that are officially dead, abandoned, or not worth continuing.
* **📜 Logs** → The history and reasoning behind what happened along the way.

The repository shows **what the code is now**.

The Logs show **how it got there.**

---

## 🏗️ Folder Structure

Logs are organized chronologically so they can be searched and reviewed later.

```text
📂 logs/
 ├── 📄 README.md
 │
 ├── 📂 2026/
 │    ├── 📄 2026-08-21-repository-update.md
 │    ├── 📄 2026-08-25-new-idea.md
 │    └── 📄 ...
 │
 └── 📄 YYYY-MM-DD-description.md
```

The date makes it easy to see **when something happened**, while the description makes it possible to understand **what happened without opening every file.**

---

## 📝 Log Entry Template

A log doesn't need to follow a strict diary format.

The purpose is to capture the useful context around an update.

```markdown
# 📜 Log: [Date] — [Short Description]

## 🔧 What I Updated

What repository, project, file, feature, or system did I change?

## 💡 Why I Updated It

What was the reason behind the change?

## 🧠 What I Discovered

What did I learn while working on it?

## 🧪 What I Tried

What approaches, experiments, or solutions did I test?

## 💭 Ideas That Came From It

Did this update lead to any new ideas, features, projects, or improvements?

## 🛑 Problems / Things That Didn't Work

What failed, behaved unexpectedly, or turned out to be a bad approach?

## 🚀 Next Direction

What might I continue, change, investigate, or build later?

## 📌 Notes

Anything else worth preserving for future reference.
```

Not every section needs to be filled.

**If there is nothing interesting to say, don't invent something just to make the log look complete.**

---

## 🧠 Why Keep These Logs?

Git already tells me **what changed**.

These logs try to capture **why it changed.**

For example, a Git commit might say:

```text
Updated parser
```

That's useful.

But a development log might say:

> I changed the parser because the previous structure became difficult to extend. While rewriting it, I realized the language could support a simpler syntax than I originally planned. This also gave me an idea for separating the parser and semantic layers.

That's the kind of information that can disappear from memory but remain extremely useful later.

---

## 🔍 Logs vs Git

These logs are **not meant to replace Git commits.**

They serve different purposes.

### Git

**"What changed?"**

```text
Added parser
Fixed tokenizer
Refactored compiler
```

### Development Logs

**"What happened while making those changes?"**

```text
Why did I build the parser this way?

What problems did I encounter?

What did I learn?

What ideas appeared during development?

Why did I choose this solution instead of another one?
```

Git records the **code history**.

Logs record the **thinking behind the history**.

---

## 🕰️ Future Me Is the Main Reader

The most important person reading these logs will probably be **me months or years from now.**

I may open an old repository and think:

> "Why did I design it like this?"

Instead of trying to reconstruct everything from old commits, I can check the logs and hopefully find the answer.

Or I might find an old idea and think:

> "Wait... I already thought about this."

Good.

Now I know.

**Past me has left evidence.** 😂

---

## 📚 What These Logs Become Over Time

Individually, a log might seem insignificant.

One update.

One idea.

One debugging session.

One architectural decision.

But after years of development, this folder becomes something much more useful:

**A searchable history of how my projects, ideas, and technical thinking evolved.**

The code shows the **result**.

The commits show the **changes**.

The Logs show the **journey between them.**

---

## ⚠️ One Important Rule

**Don't turn this into homework.**

There is no requirement to create a log every day.

No update?

**No log.**

Small change with nothing worth remembering?

**No log.**

Interesting discovery, major update, new idea, architectural decision, or useful lesson?

**That's worth logging.**

The goal isn't to produce more writing.

The goal is to **preserve information that would otherwise be forgotten.**

---

### 📜 Status

`Type: Development History`

`Frequency: Whenever something worth remembering happens`

`Purpose: Preserve the context behind the code`

`Side Effect: Future me may finally understand what past me was doing. 😂`
