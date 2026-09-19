---
name: easy-mistake-review
description: Create subject review materials focused on exam-prone mistakes, textbook boldface/key statements, and final-review summaries from course files, IMA knowledge-base materials, local Markdown, PDFs, PPTX, DOCX, and web research. Use when the user asks to identify/read course materials, search online, summarize 易错点/黑体字/重点/期末复习资料, generate illustrated Markdown, or convert that review sheet to PDF.
---

# Easy Mistake Review

Use this skill to turn scattered school/course materials into a concise, illustrated review sheet centered on:

- 易错点 and misconception traps
- 教材黑体字/核心概念/必背表述
- final-exam or unit-test review structure
- Markdown output, with optional PDF export

## Workflow

1. **Scope the task.** Identify subject, grade/book/chapter range, target exam, source location, and requested output format.
2. **Collect source materials.**
   - If the user references IMA/知识库/资料库, use the relevant IMA skill first.
   - If the user references local files, inspect filenames and extract readable text.
   - If the user asks to search online, browse and prefer authoritative/primary education sources where available.
3. **Extract and triage content.**
   - Prioritize teacher PPTs, classroom notes, 易错点判断, 快问快答, answer keys, and recent school materials.
   - Deduplicate repeated student/answer versions.
   - Record which files were readable and which were scanned/image-only.
4. **Synthesize the review sheet.**
   - Organize by exam logic, not by file order.
   - Include diagrams/tables/checklists where they reduce cognitive load.
   - Clearly label textbook key statements as paraphrases unless exact official text is provided.
5. **Generate artifacts.**
   - Write Markdown with relative image links under an `assets/` folder.
   - For PDF export, use `scripts/markdown_to_pdf.py` or another verified renderer.
6. **Verify.**
   - Confirm output files exist.
   - For PDF, check page count and extractable title/body text.

Read [references/workflow.md](references/workflow.md) for the detailed procedure, extraction commands, structure template, and quality checklist.

## Output Standards

- Keep the final review practical for a student: dense, scannable, and exam-facing.
- Include a "来源与限制" section naming material categories used and any unreadable/scanned files.
- Do not paste long copyrighted textbook passages. Summarize or paraphrase key statements.
- Use concrete "错因 → 正解 → 答题句式" blocks for common mistakes.
- Prefer tables for comparisons and SVG/PNG diagrams for process chains.

## PDF Export

Use:

```bash
python3 scripts/markdown_to_pdf.py input.md output.pdf
```

The script supports Chinese text, headings, lists, tables, code blocks, links, and common image formats. If SVG conversion libraries are unavailable, convert SVG diagrams to PNG first or recreate essential diagrams directly in the PDF workflow.
