# Experiment: Automating a Python Library Discovery System

**Type:** Experiment

---

The idea: extract library names and what they're used for, track new packages daily, add them to a database, and when a user asks a question, search that database and return matching libraries.

## The clean boundary

This system is not a recommendation engine. It is not a coding assistant. It is not a teacher.

**It is a capability catalog.**

The flow:

```
Human:
"I need libraries for data manipulation"

Tool:
"Here are things that exist:"

Pandas   → Data manipulation and analysis
Polars   → Fast dataframe operations
Dask     → Parallel and large-scale data processing
DuckDB   → Analytical queries on data
NumPy    → Numerical arrays and computation
PyArrow  → Columnar data processing
```

From there, the human brain takes over — which one fits my project, which one is easier, which one works with my hardware, how do I combine them, how do I learn it. That part needs context and judgment the system doesn't try to replace.

The database structure can be almost this simple:

```
id | name    | capability
-----------------------------------
1  | pandas  | dataframe manipulation and analysis
2  | numpy   | numerical computation
3  | pytorch | deep learning and neural networks
4  | opencv  | image processing
```

Search works by capability:

```
Input: "data visualization"

Output:
Matplotlib → Creating charts and graphs
Plotly     → Interactive data visualization
Seaborn    → Statistical visualization
```

**The important insight: a tool's existence is information.** Before the internet, knowing a book existed in a library was half the battle — you didn't need the librarian to read the whole book to you, just to confirm "this book exists, it covers X." This project is basically a librarian's index for software. The software ecosystem keeps expanding, and no one can memorize a growing universe of it — the goal isn't to replace learning, it's to prevent blindness. A person who knows a tool exists has a chance to master it; a person who never discovers it may spend weeks rebuilding what already exists.

---

## Architecture

```
          Python Ecosystem
                 |
                 ↓
        Library Collector
                 |
                 ↓
        Extract:
        - Name
        - Capability
                 |
                 ↓
          Database
                 |
                 ↓
        Search Engine
                 |
                 ↓
        User Query → Libraries
```

No agent. No complicated reasoning. Just an automated index.

---

## 1. Collect library names

Python packages are listed on PyPI, and package information can be fetched periodically via the PyPI API.

```python
import requests

package = "pandas"
url = f"https://pypi.org/pypi/{package}/json"
data = requests.get(url).json()

name = data["info"]["name"]
description = data["info"]["summary"]

print(name)
print(description)
```

```
pandas
Powerful data structures for data analysis
```

---

## 2. Extract "what it is used for"

The raw description is often messy and needs to be converted into something clean.

```
Input:
"A fast, powerful, flexible open source data analysis and manipulation tool"

Output:
"Data manipulation, data analysis, structured data processing"
```

```
Input:
"Machine learning framework for building neural networks"

Output:
"Deep learning, neural networks, AI model training"
```

This can be done with a small local LLM, keyword extraction, or hand-written rules. Only the clean sentence gets stored.

---

## 3. Database

SQLite is enough for this.

**Table: libraries**
```
id
name
capability
last_updated
```

| Name | Capability |
|---|---|
| pandas | data manipulation and analysis |
| torch | deep learning and neural networks |
| opencv | image processing |

---

## 4. Daily tracking

A scheduled script runs on a loop:

```
Run collector
      ↓
Check new PyPI packages
      ↓
For each new package:
   Extract name
   Extract capability
   Save to database
```

Pseudocode:

```python
while True:
    packages = get_latest_packages()
    for package in packages:
        if not exists(package):
            add_to_database(package)
    sleep(24 hours)
```

---

## 5. Search

```
User: "I need data manipulation libraries"
```

Convert query into keywords: `data`, `manipulation`, `analysis`

```sql
SELECT *
FROM libraries
WHERE capability LIKE "%data%";
```

```
Pandas → Data manipulation and analysis
Polars → Fast dataframe operations
Dask   → Large-scale data processing
```

The first version is honestly small:

```
Python
 |
 ├── requests   (collect PyPI data)
 ├── SQLite     (store data)
 ├── scheduler  (daily update)
 └── simple web UI (search)
```

A working first version can be built without AI at all. An LLM is only an optional cleaner layer for converting messy package descriptions into human-friendly capability statements. The core idea is simply: continuously build a dictionary of what tools exist and what powers they provide — a surprisingly simple machine for solving a surprisingly human problem, forgetting that someone already invented the thing you're about to spend three weeks reinventing.

---

## 6. Why embeddings fit this problem well

The real problem isn't "search for exact words" — it's "search for similar meanings."

**Normal (keyword) search:**
```
User: "I need tools for handling tables"
Database: "Pandas → data manipulation"
Result: possibly nothing, since "tables" ≠ "data manipulation"
```

Keyword search behaves like an overly literal librarian: "You asked for tables. I only know books with the exact word table."

**With embeddings:**

Both the user query and the library descriptions get converted into numerical vectors.

```
"Pandas → data manipulation and analysis"
        ↓ embedding
[0.23, -0.41, 0.82, ...]

"I need to work with spreadsheet-like data"
        ↓ embedding
[0.21, -0.39, 0.79, ...]
```

The system sees these vectors are close, even though the words are completely different, and correctly returns Pandas.

The updated database shape:

```
Library | Capability                                  | Embedding
--------|----------------------------------------------|----------
Pandas  | Data manipulation, analysis, structured data | [vector]
PyTorch | Deep learning, neural networks, AI models     | [vector]
OpenCV  | Image and video processing                    | [vector]
```

**Search flow:**

```
User question: "I want to process images"
      ↓
Create embedding
      ↓
Compare with library embeddings
      ↓
Closest matches
      ↓
OpenCV, Pillow, TorchVision, Diffusers
```

You don't need a huge model for this — small models built specifically for semantic search work well: Sentence Transformers, BGE embeddings, E5 embeddings. For storage: FAISS, ChromaDB, or Qdrant.

**Full architecture with embeddings:**

```
                PyPI
                 |
                 ↓
          Extract packages
                 |
                 ↓
        Capability description
                 |
                 ↓
          Embedding model
                 |
                 ↓
        Vector Database
                 |
                 ↓
             Search
                 |
                 ↓
          Library results
```

---

## 7. A future extension: relationship mapping

```
PyTorch
 |
 |-- works with
 |
Transformers

Pandas
 |
 |-- works with
 |
Scikit-learn
```

Over time this builds toward an actual map of the Python ecosystem. But the first version doesn't need this — starting with just **Name + Capability + Embedding** already solves the biggest discovery problem.

---

## Summary

The "intelligence" in this system isn't in generating answers — it's in building a good map. Maps get underestimated because they look simple, but civilization runs on them. A map of software tools is just a map where the mountains are libraries and the roads are concepts.

---

*Experiment log for an automated library discovery and semantic search system.*
