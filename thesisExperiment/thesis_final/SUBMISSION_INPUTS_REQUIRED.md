# Remaining user inputs before TUM deposit

This list is the remainder after filling every field that the repository can
verify. Do not treat labelled drafts as official artefacts. Do not invent
values. Do not commit `.env`.

Evidence used for the filled fields is recorded in
`thesisExperiment/thesis_final/THESIS_LOG.md` (round-2 P0 pass).

Search the compiled PDF for the string `USER INPUT REQUIRED`.

## Must supply (examination office / chair)

| Field | Why it is still blank | Where it prints | What to insert |
|---|---|---|---|
| Matriculation number | Not present in the repository | Title page | Official TUM student ID exactly as the office requires |
| Official title metadata | Manuscript title is the working scholarly title; registered office title is unconfirmed | Title page; compare with cover and `hyperref` `pdftitle` | Confirm or replace with the title registered with the examination office |
| Official chair / programme / degree wording | Proposal extract supports *M.Sc. Data & Society* and *School of Social Sciences and Technology*; template labels are unconfirmed | Title page | Verbatim chair, school, and degree lines from the current official template |
| First examiner / advisor terminology | Proposal names Prof. Dr. Jürgen Pfeffer (primary supervisor) and Dr. Ramit Debnath (external co-supervisor); TUM first-examiner/advisor labels are unconfirmed | Title page | Office-approved labels and order |
| Official submission date | No formal deposit date is recorded | Title page; declaration date field | Date of official submission, not a draft date |
| Official school/programme LaTeX template | Named template `6aaeb12d2d2eaea03e67a80b` is absent | Title-page fallback note | Current TUM cover/document class; then remove the KOMA-Script fallback note |
| Statutory declaration (verbatim) | No official wording, place, or signature artefact is in the repository | Declaration chapter | Current TUM statutory text from the responsible office; do not paraphrase |
| Generative-AI disclosure (verbatim) | Required text is office-specific and not in the repository | Declaration chapter | Current required AI-use wording |
| Place and date of signature | Not recorded | Declaration chapter | Place and date matching the signed original |
| Wet-ink or accepted electronic signature | Must be the candidate’s signature | Declaration chapter | Signed original; this PDF only reserves the field |
| CRediT / contribution statement confirmation | Front-matter page is a conservative draft from git/bibliography; not supervisor-certified | Individual-contribution chapter; Methods § “Prior-work boundary” | Confirm, correct, or replace every `[CANDIDATE MUST CONFIRM]` line; obtain supervisor confirmation; do not claim sole authorship of `maurya2025simulating` |
| Ethics determination | No review, exemption, or not-required artefact for this thesis is in the repository | Chapter 7, privacy/ethics section | Written determination from the responsible TUM school or ethics body. Do not claim exemption without that artefact. Debnath-corpus IRBs named in a proposal extract are not this thesis’s determination. |
| Archive licence | No `LICENSE` file at repo root. README badge says MIT; `package.json` says ISC | Appendix data-availability section | Chosen licence file in the repository, restated in the PDF |
| Archive DOI | No DOI is present; none was invented | Appendix data-availability section | Persistent DOI if one is minted; otherwise leave the explicit “no DOI” sentence |

## Optional / template-conditional

| Field | Status | Action |
|---|---|---|
| Acknowledgements | Omitted from this PDF so it does not print “insert thanks” | Add a personal acknowledgements page only if the official template requires it |
| German abstract | Written in academic German from the English abstract | Confirm with the office that a *Zusammenfassung* is required; replace only if the office supplies a different form |
| Restricted-access statement | Not used | If raw runs cannot be published, replace the GitHub URL paragraph with an explicit restricted-access statement; do not invent a DOI |

## Already filled from repository evidence (do not “correct” without new evidence)

| Field | Value used | Source |
|---|---|---|
| Candidate name | Raj Gaurav Maurya | Proposal extract; git author; GitHub `RajGM`; first author of `maurya2025simulating` |
| `hyperref` `pdfauthor` | Raj Gaurav Maurya | Same |
| University | Technical University of Munich | Cover; proposal footer |
| School (provisional) | School of Social Sciences and Technology | Proposal footer; still flagged for official wording |
| Programme (provisional) | M.Sc. Data & Society | Proposal extract; `latex_phase2/main.tex`; chapter skeleton |
| Primary supervisor | Prof. Dr. Jürgen Pfeffer | Proposal extract |
| External co-supervisor | Dr. Ramit Debnath | Proposal extract |
| Repository URL | https://github.com/RajGM/LLM_Society | `git remote` / README |
| Archive git SHA | `042023488cefb343e739ad4b4bdba5d23171ff48` | `git rev-parse origin/main` at fill time (2026-09-19 17:12:23 UTC) |
| Licence status | No `LICENSE` file found | Root tree search; not MIT/ISC as a deposited fact |
| Ethics status | No determination artefact present; exemption not claimed | Repository search; Chapter 7 disclosure |
| Harvest checksums | SHA-256 of five canonical index files | Working-tree `sha256sum` at fill time |

## Must not invent

Matriculation number; official chair/degree lines beyond the proposal extract;
submission date; statutory declaration text; signature; contribution
percentages; ethics approval or exemption; archive DOI.
