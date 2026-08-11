#!/usr/bin/env python3
"""Build a single-page reading edition of the book from the chapter markdown."""
import re, glob, os, html

SRC = "/home/user/schoolhouse-mobile/book"
OUT = "/home/user/schoolhouse-mobile/book/the-art-of-doubting-clearly.html"


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s, flags=re.S)
    s = re.sub(r"\*(.+?)\*", r"<em>\1</em>", s, flags=re.S)
    return s


def blocks(lines):
    """Yield ('p'|'ol'|'hr'|'h2'|'h3', payload) from markdown lines."""
    buf, olbuf = [], []

    def flush_p():
        nonlocal buf
        if buf:
            yield_p = " ".join(x.strip() for x in buf)
            buf = []
            return yield_p
        return None

    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if stripped.startswith("## "):
            p = flush_p()
            if p: out.append(("p", p))
            if olbuf: out.append(("ol", olbuf)); olbuf = []
            out.append(("h2", stripped[3:].strip()))
        elif stripped.startswith("### "):
            p = flush_p()
            if p: out.append(("p", p))
            out.append(("h3", stripped[4:].strip().strip("*")))
        elif stripped == "---":
            p = flush_p()
            if p: out.append(("p", p))
            if olbuf: out.append(("ol", olbuf)); olbuf = []
            out.append(("hr", None))
        elif re.match(r"^\d+\.\s", stripped):
            p = flush_p()
            if p: out.append(("p", p))
            olbuf.append(re.sub(r"^\d+\.\s+", "", stripped))
        elif stripped == "":
            p = flush_p()
            if p: out.append(("p", p))
            if olbuf: out.append(("ol", olbuf)); olbuf = []
        else:
            # continuation of a list item (indented) or normal prose
            if olbuf and line.startswith("   ") and not buf:
                olbuf[-1] += " " + stripped
            else:
                buf.append(line)
        i += 1
    p = flush_p()
    if p: out.append(("p", p))
    if olbuf: out.append(("ol", olbuf))
    return out


def render(bl, chapter_ctx=False):
    parts = []
    for kind, payload in bl:
        if kind == "p":
            cls = ""
            if payload.startswith("**In conclusion"):
                cls = ' class="instruction"'
            elif payload.startswith("*") and not payload.startswith("**"):
                cls = ' class="lede"'
            parts.append(f"<p{cls}>{inline(payload)}</p>")
        elif kind == "ol":
            items = "".join(f"<li>{inline(x)}</li>" for x in payload)
            parts.append(f"<ol>{items}</ol>")
        elif kind == "hr":
            parts.append('<hr class="break" />')
        elif kind == "h2":
            parts.append(f"<h3 class=\"section-head\">{inline(payload)}</h3>")
        elif kind == "h3":
            parts.append(f'<p class="eyebrow">{inline(payload)}</p>')
    return "\n".join(parts)


# ---------- front matter ----------
front_raw = open(f"{SRC}/00-front-matter.md").read()
front_body = front_raw.split("\n---\n", 1)[1]
front_html = render(blocks(front_body.split("\n")))

# ---------- chapters ----------
files = sorted(glob.glob(f"{SRC}/ch*.md"))
chapters, toc, current_part = [], [], None

for f in files:
    raw = open(f).read()
    part_title, part_lede = None, ""
    if raw.startswith("# "):
        head, rest = raw.split("\n---\n", 1)
        hlines = head.split("\n")
        part_title = hlines[0][2:].strip()
        lede_src = "\n".join(hlines[1:]).strip()
        if lede_src:
            part_lede = render(blocks(lede_src.split("\n")))
        raw = rest

    lines = raw.strip().split("\n")
    title_raw = next(l for l in lines if l.startswith("## "))
    title_line = title_raw[3:].strip()
    err_raw = next((l for l in lines if l.startswith("### ")), None)
    err_line = err_raw[4:].strip().strip("*") if err_raw else ""
    body_start = lines.index(err_raw if err_raw else title_raw) + 1
    body = render(blocks(lines[body_start:]))

    num, title = title_line.split(". ", 1)
    cid = f"ch{num}"

    if part_title:
        pid = "part-" + part_title.split("—")[0].strip().lower().replace(" ", "-")
        chapters.append(
            f'<section class="part-opener" id="{pid}">'
            f'<h2>{html.escape(part_title)}</h2>'
            f'{part_lede}</section>'
        )
        toc.append(("part", part_title, pid))

    chapters.append(
        f'<article class="chapter" id="{cid}">'
        f'<header class="chapter-head">'
        f'<span class="chapter-num">{num}</span>'
        f'<h2>{html.escape(title)}</h2>'
        + (f'<p class="error-name">{html.escape(err_line)}</p>' if err_line else "")
        + f'</header>{body}</article>'
    )
    toc.append(("ch", (num, title, err_line), cid))

# ---------- table of contents ----------
toc_rows = []
for kind, payload, anchor in toc:
    if kind == "part":
        toc_rows.append(f'<li class="toc-part"><a href="#{anchor}">{html.escape(payload)}</a></li>')
    else:
        num, title, err = payload
        toc_rows.append(
            f'<li class="toc-ch"><a href="#{anchor}">'
            f'<span class="toc-num">{num}</span>'
            f'<span class="toc-title">{html.escape(title)}</span>'
            + (f'<span class="toc-err">{html.escape(err)}</span>' if err else "")
            + '</a></li>'
        )
toc_html = "\n".join(toc_rows)

shell = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "shell.html")).read()
page = (shell
        .replace("{{TOC}}", toc_html)
        .replace("{{FRONT}}", front_html)
        .replace("{{CHAPTERS}}", "\n".join(chapters)))
open(OUT, "w").write(page)
words = len(re.findall(r"\w+", re.sub(r"<[^>]+>", " ", page)))
print(f"wrote {OUT}  ({len(page)/1024:.0f} KB, ~{words} words, {len(files)} chapters)")
