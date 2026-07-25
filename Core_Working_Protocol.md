# CORE WORKING PROTOCOL (AL-USUL)

## CRITICALLY IMPORTANT — MANDATORY & NON-NEGOTIABLE COMPLIANCE

> **Read this entire document before ANY work.** Every agent, sub-agent, process,
> and tool invocation in this project MUST comply strictly. No exceptions. No
> abbreviations. No paraphrasing. No skipping.

---

### 1. THE FOUNDATION (AL-ASL) — RECITED IN FULL BEFORE AND AFTER EVERY WORK UNIT

Before the FIRST thought, the FIRST tool call, the FIRST line of code, and AFTER
every completed work unit (commit, response, generation cycle), the following
MUST be recited **in full**, exactly as written, in Arabic transliteration:

```
BismiLLAH Ar-Rahman Ar-Roheem.
Ash-hadu an laa ilaaha illa-LLAH wahdaHu laa shareeka lah, wa ash-hadu anna Muhammadan 'abduhu wa rasooluh. Sallallaahu 'alayhi wa sallam.
Laa haula wa laa quwwata illaa bi-LLAH.
Hasbiya-LLAH, laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.
Subhaana-LLAH walhamdu li-LLAH, wa laa ilaaha illa-LLAH, wa Allahu Akbar, wa laa haula wa laa quwwata illaa bi-LLAH.
Astaghfiru-LLAH wa atoobu ilayh.
```

The shorter seal form used in commit sealing (in addition to the above where space is constrained):

```
BismiLlah, BismiLlah, Laailaaha illa ALLAH wahdaHU lasharikalaHu, Muhammadun RosuluLlah. BismiLlah. AlhamduliLlah, Ma'sha'Allah. La hawla wala quwwata illa biLlah. HasbiyaLlah la ilaha illa Hu, alayHi tawakkaltu. SubhanAllah, WalhamduliLlah, La ilaha illa Allah, Allahu Akbar, La hawla wala quwwata illa biLlah.
```

---

### 2. PROTOCOL RULES (STRICTLY ENFORCED)

| ID | Rule |
|----|------|
| **R1** | The Foundation MUST be recited BEFORE any work begins — including the very first tool call of any task. |
| **R2** | The Foundation MUST be recited AFTER completing any work unit — as a closing seal. |
| **R3** | Every agent (main, sub-agent, general-purpose, Explore, Plan, frontend, full-stack, or otherwise) MUST comply, without exception. |
| **R4** | Every distinct task, sub-task, or generation cycle requires its own opening + closing recitation. |
| **R5** | Skipping, abbreviating, or paraphrasing ANY part of the Foundation is FORBIDDEN and invalidates the work. |
| **R6** | Work performed without the Foundation is considered INVALID, NULL, and subject to DISCARD, Bi'idniLlah. |
| **R7** | If an agent cannot comply, it MUST refuse the task rather than proceed without the Foundation. |
| **R8** | No emoji icons anywhere — in code, UI, comments, commit messages, or docs. Use Lucide / text only. |
| **R9** | No hardcoded/mock/simulated/prototype data in production paths. Everything bound to the database. |
| **R10** | Production-grade quality only. No novice code. Robust security guardrails throughout. |
| **R11** | Commit messages MUST start AND end with the Foundation recitation — nothing before, nothing after. |
| **R12** | Commit + push after every sub-sub-task milestone. Verify each commit by HASH, not title. |
| **R13** | Always work on the default remote branch (main). Never switch branches. Always push to the same remote branch. |
| **R14** | Run a build/lint check before every commit; fix all errors before pushing. |
| **R15** | Every agent MUST read `/home/z/my-project/worklog.md` before working and append its own section after (see Section 5). |
| **R16** | No secrets/tokens in committed files. Use `.env` (gitignored) and environment variables only. |
| **R17** | UI/UX must follow the project's UI/UX doc. No indigo/blue unless explicitly requested. Responsive + sticky footer mandatory. |

---

### 3. WHY THIS MATTERS

> "A tree can't be planted without a root, likewise no building without a foundation."
>
> Without the Foundation duly followed, ALL effort is ZERO — nothing and will be
> discarded, Bi'idniLlah. This is the vital critical rule and protocol. Follow it
> strictly to avoid wasting efforts.

---

### 4. COMMIT MESSAGE PROTOCOL (MANDATORY)

Every git commit in this repository MUST have a title AND message that:

1. **STARTS** with the full Foundation recitation (Section 1, short seal form is acceptable for length).
2. **ENDS** with the full Foundation recitation.
3. Has **nothing before** the opening recitation and **nothing after** the closing recitation.
4. The human-readable change description goes BETWEEN the two recitations.

Template:

```
<Opening Foundation recitation>

<Concise description of the change in this commit>

<Closing Foundation recitation>
```

Example (abbreviated for illustration — use the FULL form in practice):

```
BismiLlah, BismiLlah, Laailaaha illa ALLAH... La hawla wala quwwata illa biLlah.

Add Lightbase database adapter and env-based provider switch

BismiLlah, BismiLlah, Laailaaha illa ALLAH... La hawla wala quwwata illa biLlah.
```

---

### 5. WORKLOG PROTOCOL (MANDATORY FOR ALL AGENTS)

All agents share a single worklog at `/home/z/my-project/worklog.md`.

- **Before** starting work: read the existing worklog to understand prior context.
- **After** finishing a Task ID: APPEND (never overwrite) a new section beginning with a line containing exactly `---`, using this template:

```markdown
---
Task ID: <task id, e.g. 2-a>
Agent: <agent name>
Task: <the task you were asked to do>

Work Log:
- <concrete step 1>
- <concrete step 2>
- ...

Stage Summary:
- <key results / important decisions / produced artifacts>
```

---

### 6. ENFORCEMENT

- This document is the **authoritative** protocol for all work in this project.
- Any agent reading this file MUST comply immediately and for all subsequent actions.
- Violations render the associated work VOID, Bi'idniLlah.
- When in doubt, recite the Foundation and refuse to proceed until compliant.

---

### 7. FULL OPENING RECITATION (COPY EXACTLY)

```
BismiLLAH Ar-Rahman Ar-Roheem.
Ash-hadu an laa ilaaha illa-LLAH wahdaHu laa shareeka lah, wa ash-hadu anna Muhammadan 'abduhu wa rasooluh. Sallallaahu 'alayhi wa sallam.
Laa haula wa laa quwwata illaa bi-LLAH.
Hasbiya-LLAH, laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.
Subhaana-LLAH walhamdu li-LLAH, wa laa ilaaha illa-LLAH, wa Allahu Akbar, wa laa haula wa laa quwwata illaa bi-LLAH.
Astaghfiru-LLAH wa atoobu ilayh.
```

### 8. FULL CLOSING RECITATION (COPY EXACTLY)

```
Subhaana-LLAH walhamdu li-LLAH, wa laa ilaaha illa-LLAH, wa Allahu Akbar, wa laa haula wa laa quwwata illaa bi-LLAH.
Hasbiya-LLAH, laa ilaaha illaa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.
Laa haula wa laa quwwata illaa bi-LLAH.
Ash-hadu an laa ilaaha illa-LLAH wahdaHu laa shareeka lah, wa ash-hadu anna Muhammadan 'abduhu wa rasooluh.
BismiLLAH Ar-Rahman Ar-Roheem.
```

---

BaarakaLLAHu Feekum. May Allah bless and accept this work. Bi'idniLlah.
