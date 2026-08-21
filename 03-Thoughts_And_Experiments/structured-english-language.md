# Building a Structured-English Programming Language: A Practical Path

**Author:** Surya Prakash Reddy Muli
**Status:** Working notes — language design + implementation roadmap.

---

## Abstract

Computers cannot execute free-form English directly, not because of a technical limitation but because natural English is ambiguous and infinite in its variation. What *is* achievable without AI in the loop is a **controlled, structured English** — a domain-specific language that reads like sentences but parses like any strict grammar. This note lays out why direct English fails, why structured English succeeds, and a concrete implementation path from lexer to interpreter to real, shippable applications, including a working toy interpreter.

---

## 1. Why Not Just Run English Directly?

Three concrete obstacles:

**Ambiguity.** "Tell the user the number is big" — does "tell" mean print to screen, speak audio, or send an email? Humans resolve this from context; a parser cannot.

**Infinite variation.** "Print Hello," "Say Hello," "Tell user Hello," "Write Hello" all mean the same thing. A compiler would need to enumerate every synonym in the language — not feasible without a learned model in the loop.

**Flexible grammar.** English permits both "if number > 10 then say hello" and "say hello if number is bigger than ten." A parser needs exactly one grammar rule per construct, not a family of equivalent phrasings.

Given this, there are exactly three tiers of "English as a programming language," in increasing order of difficulty:

| Tier | Description | Feasible without AI? |
|---|---|---|
| Direct English | Fully free-form natural language | No — too ambiguous |
| Controlled English | Looks like English, strict fixed grammar | **Yes** |
| General English | Arbitrary phrasing, AI resolves intent | Only with an AI layer in the middle (English → AI → Code → Run) |

---

## 2. Controlled English: The Actual Target

A controlled English language is a **domain-specific language (DSL)** with English-like surface syntax and a strict underlying grammar. Example:

```
Ask the user for a number.
If the number is greater than 10 then
    Speak "Big number".
Otherwise
    Speak "Small number".
End the decision.
```

This reads as English but is fully unambiguous to a parser because:
- Every command starts with a fixed, known verb (`Ask`, `Speak`, `If`).
- Sentences follow fixed patterns (`If … then … Otherwise … End`).
- Block boundaries are marked explicitly (indentation or `End` keywords).

This is not a new idea — it's the same approach older languages took:

**COBOL:**
```cobol
IF AMOUNT > 10
   DISPLAY "BIG NUMBER"
ELSE
   DISPLAY "SMALL NUMBER"
END-IF
```

**Inform 7** (interactive fiction language):
```
Instead of taking the apple:
    say "You pick up the apple."
```

The moment English has structure — fixed verbs, fixed sentence patterns, explicit block markers — it stops being "ambiguous natural language" and becomes a formal grammar wearing an English costume. At that point it's just a language design problem, not an AI problem.

---

## 3. Design Decisions Before Writing Any Code

**Purpose first.** Educational toy? A DSL for a specific domain (data pipelines, game scripting)? General-purpose language? The answer shapes every decision downstream.

**Core axes to fix early:**
- **Paradigm** — imperative, functional, object-oriented, hybrid.
- **Typing** — static vs. dynamic; inferred or explicit.
- **Memory model** — garbage collected, manual, ownership-based.
- **Execution target:**
  - *Interpreter* — fastest to build, good for a REPL and experimentation.
  - *Transpiler* — compile to Python/JS/C, inherit their entire ecosystem quickly.
  - *Bytecode VM* — custom virtual machine, like CPython or the JVM.
  - *Native compiler via LLVM* — highest performance, highest implementation cost.
  - *WASM backend* — runs in-browser and natively.

**Minimal grammar target.** Start small. A toy expression/statement grammar in EBNF:

```
program    ::= statement*
statement  ::= "let" IDENT "=" expr ";"
             | "print" "(" expr ")" ";"
             | expr ";"
expr       ::= term (("+"|"-") term)*
term       ::= factor (("*"|"/") factor)*
factor     ::= NUMBER | IDENT | "(" expr ")" | "-" factor
IDENT      ::= /[a-zA-Z_][a-zA-Z0-9_]*/
NUMBER     ::= /[0-9]+(\.[0-9]+)?/
```

Resist the urge to design the whole language at once — ship variables, arithmetic, `if`, loops, and functions before anything else.

---

## 4. Implementation Path

**Pipeline:** tokenizer → parser → AST → evaluator (or bytecode + VM, or transpilation target).

**Parser options:**
- Handwritten recursive-descent — simplest, most flexible, best for learning.
- Parser generators — ANTLR, Bison/Yacc, Menhir, PEG-based tools.
- Pratt parsing — clean handling of operator precedence in expressions.

**Milestone order** (each one should run before moving to the next):
1. Lexer + parser for expressions and statements.
2. AST evaluator: variables, arithmetic.
3. Control flow: `if`, `while`, `for`.
4. Functions, scoping, closures.
5. Standard library: I/O, collections.
6. Performance layer: bytecode VM or LLVM backend.
7. Tooling: REPL, formatter, LSP (editor support), package manager.
8. Docs, examples, community.

**Common pitfalls:**
- Designing error messages late — they define whether the language feels usable at all.
- Trying to spec the entire language before writing an interpreter — build the smallest working core first.
- Ignoring interoperability (FFI, transpilation targets) until it's expensive to retrofit.

---

## 5. Minimal Working Interpreter (Python)

A complete tokenizer + recursive-descent parser for the grammar in Section 3, runnable immediately as a starting point:

```python
# toy_lang.py - minimal interpreter
import re

# ---- Lexer ----
TOKEN_SPEC = [
    ('NUMBER',  r'\d+(\.\d+)?'),
    ('IDENT',   r'[A-Za-z_][A-Za-z0-9_]*'),
    ('SKIP',    r'[ \t]+'),
    ('NEWLINE', r'\n'),
    ('OP',      r'[\+\-\*/=;()\{\}]'),
    ('MISMATCH',r'.'),
]
tok_regex = '|'.join('(?P<%s>%s)' % pair for pair in TOKEN_SPEC)

def lex(code):
    for mo in re.finditer(tok_regex, code):
        kind = mo.lastgroup
        val = mo.group()
        if kind == 'NUMBER':
            yield ('NUMBER', float(val) if '.' in val else int(val))
        elif kind == 'IDENT':
            yield ('IDENT', val)
        elif kind == 'OP':
            yield (val, val)
        elif kind in ('SKIP', 'NEWLINE'):
            continue
        else:
            raise SyntaxError(f'Unexpected token: {val}')
    yield ('EOF', None)

# ---- Parser (recursive descent) ----
class Parser:
    def __init__(self, tokens):
        self.tokens = iter(tokens)
        self.cur = None
        self._advance()

    def _advance(self):
        self.cur = next(self.tokens)

    def _expect(self, t):
        if self.cur[0] == t:
            v = self.cur[1]
            self._advance()
            return v
        raise SyntaxError(f'Expected {t}, got {self.cur}')

    def parse(self):
        stmts = []
        while self.cur[0] != 'EOF':
            stmts.append(self.statement())
        return ('block', stmts)

    def statement(self):
        if self.cur[0] == 'IDENT' and self.cur[1] == 'let':
            self._advance()
            name = self._expect('IDENT')
            self._expect('=')
            expr = self.expr()
            self._expect(';')
            return ('let', name, expr)
        if self.cur[0] == 'IDENT' and self.cur[1] == 'print':
            self._advance()
            self._expect('(')
            e = self.expr()
            self._expect(')')
            self._expect(';')
            return ('print', e)
        expr = self.expr()
        self._expect(';')
        return ('expr', expr)

    def expr(self):
        node = self.term()
        while self.cur[0] in ('+', '-'):
            op = self.cur[0]
            self._advance()
            node = (op, node, self.term())
        return node

    def term(self):
        node = self.factor()
        while self.cur[0] in ('*', '/'):
            op = self.cur[0]
            self._advance()
            node = (op, node, self.factor())
        return node

    def factor(self):
        if self.cur[0] == 'NUMBER':
            v = self.cur[1]
            self._advance()
            return ('num', v)
        if self.cur[0] == 'IDENT':
            name = self.cur[1]
            self._advance()
            return ('var', name)
        if self.cur[0] == '-':
            self._advance()
            return ('neg', self.factor())
        if self.cur[0] == '(':
            self._advance()
            node = self.expr()
            self._expect(')')
            return node
        raise SyntaxError('Bad factor: ' + str(self.cur))
```

Natural next extensions: `if`/`while`, function definitions and closures, a bytecode emitter with a small VM in place of direct AST evaluation, string support, a standard library, and error messages with line/column info.

---

## 6. From Toy Language to Real Applications

The same interpreter architecture generalizes into an actual app-building path via two routes:

**Interpreter route** — your language runs directly inside a host interpreter (Python/JS/Java). Produces console apps, scripts, and automation tools.

**Transpiler route** — your language is translated into an existing language (Python, JavaScript, C#), then you inherit that host language's entire ecosystem: GUI toolkits, web frameworks, package managers.

Example transpilation:

Source (controlled English):
```
The user is asked for a number.
Speak "Hello".
```

Transpiled output (Python):
```python
number = input("Enter a number: ")
print("Hello")
```

From there, standard packaging tools apply directly — `PyInstaller` for a desktop executable, `Flask`/`FastAPI` if transpiling into a backend service, `Pygame` or a JS canvas target for basic 2D games.

**What each route unlocks:**

| Route | App types |
|---|---|
| Interpreter only | Console / text-based apps |
| Transpile to Python/JS | Desktop, web, and mobile apps — full ecosystem inherited |
| Transpile + AI parsing layer | Natural-language app building (closer to AI-assisted coding than a traditional compiler) |

The practical conclusion: a structured-English language doesn't need to reinvent an OS or runtime. It's a translation layer sitting on top of proven platforms — the language's job is syntax and semantics, not reimplementing GUIs, networking, or file systems from scratch.

---

## 7. Summary

- Free-form English cannot be executed directly — not a limitation of effort, but of ambiguity and unbounded variation.
- Structured/controlled English — fixed verbs, fixed sentence patterns, explicit block markers — is a full DSL and is entirely parseable with standard compiler techniques, no AI required.
- The fastest path to something real: handwritten recursive-descent parser → AST evaluator → control flow → functions → either a bytecode VM (for standalone performance) or a transpiler to Python/JS (for fast access to a mature ecosystem).
- "My code has structure" is the entire justification for why this is tractable — structure is what turns natural-sounding text into a formal, executable grammar.

---

## 8. Open Threads

- Where's the right boundary between "controlled English" and "verbose but ordinary syntax" — at what point does adding more permitted phrasings reintroduce the ambiguity this design avoids?
- For the transpile-to-Python route: how much of the target language's error semantics should leak through to the controlled-English layer, versus being caught and re-worded at the DSL level?
- Is a bytecode VM worth building before there's a real workload that needs the performance, or is transpilation the better default until a concrete bottleneck appears?

---

*This note originated from a dialogue exploring how to design and implement a structured, English-like programming language; the framing, decisions, and conclusions above are the author's own.*
