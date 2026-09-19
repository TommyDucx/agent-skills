#!/usr/bin/env python3
"""Convert a practical Markdown review sheet to PDF with Chinese text support.

This intentionally supports a compact subset useful for review sheets:
headings, paragraphs, blockquotes, lists, fenced code blocks, pipe tables,
links, and PNG/JPG images. SVG images are represented by a labeled box unless
optional conversion tooling is installed by the caller.
"""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def register_font(font_path: str | None) -> str:
    candidates = [
        font_path,
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
    ]
    for item in candidates:
        if item and Path(item).exists():
            pdfmetrics.registerFont(TTFont("ReviewCJK", item))
            return "ReviewCJK"
    return "Helvetica"


def escape_inline(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r'<font backColor="#f1f3f5">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" color="blue">\1</a>', text)
    return text


def make_styles(font: str):
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "ReviewTitle",
            parent=base["Title"],
            fontName=font,
            fontSize=22,
            leading=30,
            alignment=TA_CENTER,
            spaceAfter=18,
            textColor=colors.HexColor("#183044"),
        ),
        "h1": ParagraphStyle(
            "ReviewH1",
            parent=base["Heading1"],
            fontName=font,
            fontSize=17,
            leading=24,
            spaceBefore=16,
            spaceAfter=8,
            textColor=colors.HexColor("#183044"),
        ),
        "h2": ParagraphStyle(
            "ReviewH2",
            parent=base["Heading2"],
            fontName=font,
            fontSize=14,
            leading=21,
            spaceBefore=12,
            spaceAfter=6,
            textColor=colors.HexColor("#2b5b84"),
        ),
        "body": ParagraphStyle(
            "ReviewBody",
            parent=base["BodyText"],
            fontName=font,
            fontSize=10.3,
            leading=16,
            spaceAfter=6,
            alignment=TA_LEFT,
        ),
        "quote": ParagraphStyle(
            "ReviewQuote",
            parent=base["BodyText"],
            fontName=font,
            fontSize=9.5,
            leading=15,
            leftIndent=14,
            rightIndent=10,
            textColor=colors.HexColor("#4a6478"),
            backColor=colors.HexColor("#f7fbff"),
            borderColor=colors.HexColor("#d7e8f5"),
            borderWidth=0.6,
            borderPadding=6,
            spaceAfter=8,
        ),
        "small": ParagraphStyle(
            "ReviewSmall",
            parent=base["BodyText"],
            fontName=font,
            fontSize=8.7,
            leading=12,
        ),
        "code": ParagraphStyle(
            "ReviewCode",
            parent=base["Code"],
            fontName=font,
            fontSize=8.5,
            leading=12,
            backColor=colors.HexColor("#f6f8fa"),
            borderPadding=6,
            leftIndent=8,
            rightIndent=8,
            spaceAfter=8,
        ),
    }


def image_flowable(md_dir: Path, src: str, styles, max_width: float):
    path = (md_dir / src).resolve()
    if not path.exists():
        return Paragraph(f"[missing image: {escape_inline(src)}]", styles["quote"])
    if path.suffix.lower() == ".svg":
        return Paragraph(f"[SVG diagram: {escape_inline(src)}]", styles["quote"])
    img = Image(str(path))
    if img.drawWidth > max_width:
        scale = max_width / img.drawWidth
        img.drawWidth *= scale
        img.drawHeight *= scale
    return img


def parse_markdown(md_path: Path, styles, max_width: float):
    lines = md_path.read_text(encoding="utf-8").splitlines()
    story = []
    i = 0
    in_code = False
    code_lines: list[str] = []

    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("```"):
            if not in_code:
                in_code = True
                code_lines = []
            else:
                story.append(Preformatted("\n".join(code_lines), styles["code"]))
                in_code = False
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        if not line.strip():
            i += 1
            continue

        image_match = re.match(r"!\[[^\]]*\]\(([^)]+)\)", line.strip())
        if image_match:
            story.append(Spacer(1, 6))
            story.append(image_flowable(md_path.parent, image_match.group(1), styles, max_width))
            story.append(Spacer(1, 8))
            i += 1
            continue

        if line.startswith("# "):
            story.append(Paragraph(escape_inline(line[2:].strip()), styles["title"]))
            i += 1
            continue
        if line.startswith("## "):
            story.append(Paragraph(escape_inline(line[3:].strip()), styles["h1"]))
            i += 1
            continue
        if line.startswith("### "):
            story.append(Paragraph(escape_inline(line[4:].strip()), styles["h2"]))
            i += 1
            continue

        if line.startswith(">"):
            parts = []
            while i < len(lines) and lines[i].startswith(">"):
                parts.append(lines[i].lstrip(">").strip())
                i += 1
            story.append(Paragraph("<br/>".join(escape_inline(p) for p in parts), styles["quote"]))
            continue

        if line.strip().startswith("|") and i + 1 < len(lines) and re.match(
            r"^\s*\|?\s*:?-{3,}", lines[i + 1]
        ):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.match(r"^:?-{3,}:?$", c.replace(" ", "")) for c in cells):
                    rows.append([Paragraph(escape_inline(c), styles["small"]) for c in cells])
                i += 1
            if rows:
                table = Table(rows, colWidths=[max_width / len(rows[0])] * len(rows[0]), repeatRows=1)
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eaf3fb")),
                            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#aebdcc")),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("LEFTPADDING", (0, 0), (-1, -1), 4),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                        ]
                    )
                )
                story.extend([table, Spacer(1, 8)])
            continue

        if re.match(r"^\s*[-*]\s+", line):
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                item = re.sub(r"^\s*[-*]\s+", "", lines[i]).strip()
                story.append(Paragraph(escape_inline("• " + item), styles["body"]))
                i += 1
            continue

        if re.match(r"^\s*\d+\.\s+", line):
            while i < len(lines) and re.match(r"^\s*\d+\.\s+", lines[i]):
                item = re.sub(r"^\s*(\d+\.)\s+", r"\1 ", lines[i]).strip()
                story.append(Paragraph(escape_inline(item), styles["body"]))
                i += 1
            continue

        parts = [line.strip()]
        i += 1
        while (
            i < len(lines)
            and lines[i].strip()
            and not lines[i].startswith(("#", ">", "```"))
            and not lines[i].strip().startswith(("|", "!["))
            and not re.match(r"^\s*([-*]|\d+\.)\s+", lines[i])
        ):
            parts.append(lines[i].strip())
            i += 1
        story.append(Paragraph(escape_inline(" ".join(parts)), styles["body"]))

    return story


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_md", type=Path)
    parser.add_argument("output_pdf", type=Path)
    parser.add_argument("--font", help="Optional path to a TTF/TTC font with CJK support")
    args = parser.parse_args()

    font = register_font(args.font)
    styles = make_styles(font)
    width = A4[0] - 3.2 * cm
    story = parse_markdown(args.input_md, styles, width)

    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont(font, 8)
        canvas.setFillColor(colors.HexColor("#6b7785"))
        canvas.drawCentredString(A4[0] / 2, 0.85 * cm, str(doc.page))
        canvas.restoreState()

    doc = SimpleDocTemplate(
        str(args.output_pdf),
        pagesize=A4,
        rightMargin=1.6 * cm,
        leftMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.4 * cm,
    )
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)


if __name__ == "__main__":
    main()
