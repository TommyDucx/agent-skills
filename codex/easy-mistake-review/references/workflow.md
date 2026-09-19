# Easy Mistake Review Workflow

## 1. Source Collection

For IMA knowledge-base tasks:

1. Use `ima-skill` and read its `knowledge-base/SKILL.md`.
2. Search the target knowledge base by subject keywords and exam scope.
3. Prefer high-signal files:
   - teacher PPT/PPTX
   - classroom notes
   - 易错点判断
   - 考点快问快答
   - answer/explanation PDFs
   - recent school test feedback
4. Use `get_media_info` to retrieve source URLs when possible.
5. Download only the files needed for synthesis into a temporary directory.

For local files:

- Use `rg --files` to inventory files.
- For PPTX, unzip and read `ppt/slides/slide*.xml`.
- For PDF, use available tools in this order: `pdftotext`, Python `pypdf`, OCR only if explicitly needed and available.
- For DOCX, unzip and read `word/document.xml`, or use a document skill/runtime if richer extraction is needed.

Track extraction status:

```text
readable: title, file type, extracted chars/pages
unreadable: title, reason, how it was still used (filename/topic only)
```

## 2. Web Research

Browse when the user asks to search online or when facts need current/authoritative verification.

Use sources in this priority order:

1. official curriculum standards, education ministry, exam authority
2. official textbook publisher pages or teacher resources
3. reputable educational institutions
4. stable encyclopedic/scientific references for concept verification

Avoid relying on random SEO summaries for final claims. Cite web sources in the Markdown "来源" section.

## 3. Synthesis Pattern

Recommended Markdown structure:

```markdown
# {subject/book/exam} 易错点与重点复习

> 适用范围：...
> 整理依据：...
> 说明：教材黑体字重点为复习转述，非逐字摘录。

![核心图示](assets/diagram.svg)

## 一、考前总抓手
## 二、教材黑体字/核心重点转述
## 三、期末高频易错点
### 易错 1：...
错因：...
正确理解：...
答题句式：...

## 四、核心专题速记
## 五、题型策略
## 六、考前快问快答
## 七、最后 30 分钟背诵清单
## 八、来源与限制
```

## 4. Visuals

Use diagrams for:

- process chains, e.g. DNA -> RNA -> protein
- concept maps, e.g. variation categories
- comparison flows, e.g. genotype -> phenotype
- decision trees, e.g. genetic pedigree judgment

Prefer simple SVG files in `assets/` for Markdown. If PDF export is required and no SVG renderer is available, either:

- create PNG/JPG assets, or
- redraw essential diagrams using the PDF renderer, or
- replace with a clean table if visual rendering would be unreliable.

## 5. PDF Export and Verification

If `pandoc`, `weasyprint`, or browser print-to-PDF is available, use the renderer that best preserves Markdown and images.

If not, use `scripts/markdown_to_pdf.py` from this skill:

```bash
python3 /path/to/easy-mistake-review/scripts/markdown_to_pdf.py review.md review.pdf
```

After generation, verify with `pypdf`:

```python
from pypdf import PdfReader
r = PdfReader("review.pdf")
assert len(r.pages) > 0
text = "\\n".join((p.extract_text() or "") for p in r.pages[:2])
assert "易错" in text or "复习" in text
```

## 6. Quality Checklist

Before final response:

- The requested subject/scope is reflected in the title and first section.
- The review uses source materials and does not merely produce a generic summary.
- Web sources are cited when online research was requested.
- Scanned/unreadable files are disclosed.
- Markdown links to assets are relative and valid.
- PDF page count and extractable text are verified when PDF is requested.
- Final response links to the created files with absolute paths.
