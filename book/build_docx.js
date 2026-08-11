// Build a Word (.docx) edition of the book from the chapter markdown files.
//   node build_docx.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Footer, PageNumber, LevelFormat, BorderStyle, PageBreak,
} = require("docx");

const SRC = __dirname;
const OUT = path.join(SRC, "The-Art-of-Doubting-Clearly.docx");

const SERIF = "Georgia";
const ACCENT = "29477E";
const MUTED = "5A6473";
const FAINT = "8C97A6";

/* ---------------- markdown → block list ---------------- */

function parseBlocks(lines) {
  const out = [];
  let buf = [], ol = [];
  const flushP = () => {
    if (buf.length) { out.push({ t: "p", v: buf.map((l) => l.trim()).join(" ") }); buf = []; }
  };
  const flushOl = () => { if (ol.length) { out.push({ t: "ol", v: ol }); ol = []; } };

  for (const line of lines) {
    const s = line.trim();
    if (s.startsWith("## ")) { flushP(); flushOl(); out.push({ t: "h2", v: s.slice(3).trim() }); }
    else if (s.startsWith("### ")) { flushP(); flushOl(); out.push({ t: "h3", v: s.slice(4).trim().replace(/^\*|\*$/g, "") }); }
    else if (s === "---") { flushP(); flushOl(); out.push({ t: "hr" }); }
    else if (/^\d+\.\s/.test(s)) { flushP(); ol.push(s.replace(/^\d+\.\s+/, "")); }
    else if (s === "") { flushP(); flushOl(); }
    else if (ol.length && /^\s{3}/.test(line) && !buf.length) { ol[ol.length - 1] += " " + s; }
    else buf.push(line);
  }
  flushP(); flushOl();
  return out;
}

/* ---------------- inline **bold** / *italic* → runs ---------------- */

function runs(text, base = {}) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/gs;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    if (m[1] !== undefined) out.push(new TextRun({ ...base, text: m[1], bold: true }));
    else out.push(new TextRun({ ...base, text: m[2], italics: true }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(new TextRun({ ...base, text: text.slice(last) }));
  return out;
}

/* ---------------- block list → docx paragraphs ---------------- */

function renderBlocks(blocks, opts = {}) {
  const paras = [];
  for (const b of blocks) {
    if (b.t === "p") {
      const isInstruction = b.v.startsWith("**In conclusion");
      const isLede = b.v.startsWith("*") && !b.v.startsWith("**");
      if (isInstruction) {
        paras.push(new Paragraph({
          children: runs(b.v),
          indent: { left: 340 },
          spacing: { before: 320, after: 200, line: 300 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, space: 14, color: ACCENT } },
        }));
      } else if (isLede) {
        paras.push(new Paragraph({
          children: runs(b.v, { color: MUTED, italics: true }),
          spacing: { after: 200, line: 300 },
        }));
      } else {
        paras.push(new Paragraph({ children: runs(b.v) }));
      }
    } else if (b.t === "ol") {
      b.v.forEach((item) => paras.push(new Paragraph({
        children: runs(item),
        numbering: { reference: "book-list", level: 0 },
        spacing: { after: 140, line: 300 },
      })));
    } else if (b.t === "hr") {
      paras.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 260, after: 260 },
        children: [new TextRun({ text: "· · ·", color: FAINT })],
      }));
    } else if (b.t === "h2") {
      paras.push(new Paragraph({
        heading: opts.frontMatter ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
        children: runs(b.v),
      }));
    } else if (b.t === "h3") {
      paras.push(new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: b.v.toUpperCase(), color: ACCENT, size: 17, characterSpacing: 26 })],
      }));
    }
  }
  return paras;
}

/* ---------------- assemble ---------------- */

const body = [];
const contents = [];

// front matter (drop the title/subtitle block; the title page carries it)
const frontRaw = fs.readFileSync(path.join(SRC, "00-front-matter.md"), "utf8");
const front = frontRaw.split("\n---\n").slice(1).join("\n---\n");

const chapterFiles = fs.readdirSync(SRC).filter((f) => /^ch\d+.*\.md$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

const chapters = [];
for (const f of chapterFiles) {
  let raw = fs.readFileSync(path.join(SRC, f), "utf8");
  let partTitle = null, partLede = null;
  if (raw.startsWith("# ")) {
    const [head, ...rest] = raw.split("\n---\n");
    const hl = head.split("\n");
    partTitle = hl[0].slice(2).trim();
    const lede = hl.slice(1).join("\n").trim();
    if (lede) partLede = lede;
    raw = rest.join("\n---\n");
  }
  const lines = raw.trim().split("\n");
  const titleLine = lines.find((l) => l.startsWith("## "));
  const errLine = lines.find((l) => l.startsWith("### "));
  const bodyStart = lines.indexOf(errLine || titleLine) + 1;
  const [num, ...titleRest] = titleLine.slice(3).trim().split(". ");
  chapters.push({
    partTitle, partLede,
    num,
    title: titleRest.join(". "),
    error: errLine ? errLine.slice(4).trim().replace(/^\*|\*$/g, "") : "",
    blocks: parseBlocks(lines.slice(bodyStart)),
  });
}

/* contents listing */
contents.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Contents")], pageBreakBefore: true }));
for (const c of chapters) {
  if (c.partTitle) {
    contents.push(new Paragraph({
      spacing: { before: 300, after: 140 },
      children: [new TextRun({ text: c.partTitle.toUpperCase(), color: ACCENT, size: 17, characterSpacing: 26 })],
    }));
  }
  contents.push(new Paragraph({
    spacing: { after: 40, line: 260 },
    indent: { left: 420, hanging: 420 },
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({ text: `${c.num}.  `, color: FAINT }),
      new TextRun({ text: c.title }),
      ...(c.error ? [new TextRun({ text: `  ${c.error}`, italics: true, color: MUTED, size: 19 })] : []),
    ],
  }));
}

/* front matter */
body.push(...contents);
body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Before we begin")], pageBreakBefore: true }));
body.push(...renderBlocks(parseBlocks(front.split("\n")), { frontMatter: true }));

/* parts and chapters */
for (const c of chapters) {
  if (c.partTitle) {
    body.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      spacing: { before: 2400, after: 300 },
      children: runs(c.partTitle),
    }));
    if (c.partLede) body.push(...renderBlocks(parseBlocks(c.partLede.split("\n"))));
  }
  body.push(new Paragraph({
    pageBreakBefore: true,
    spacing: { after: 120 },
    children: [new TextRun({ text: c.num, color: FAINT, size: 40, font: SERIF })],
  }));
  body.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(c.title) }));
  if (c.error) {
    body.push(new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: c.error.toUpperCase(), color: ACCENT, size: 17, characterSpacing: 26 })],
    }));
  }
  body.push(...renderBlocks(c.blocks));
}

/* end note */
body.push(new Paragraph({
  pageBreakBefore: true,
  spacing: { after: 200 },
  children: [new TextRun({ text: "A NOTE ON SOURCES", color: ACCENT, size: 17, characterSpacing: 26 })],
}));
body.push(new Paragraph({
  children: runs(
    "The thinking errors named in this book belong to the research literature — Asch, Festinger, " +
    "Tversky and Kahneman, Aronson, Cialdini, Tajfel, Forer, Nisbett and Wilson, Tetlock, Taleb — and the " +
    "framing belongs to Rolf Dobelli, whose *The Art of Thinking Clearly* (2011; English translation 2013) " +
    "catalogues ninety-nine of them. Nothing here quotes him at length; where a chapter borrows one of his " +
    "examples or his name for an error, it says so."
  ),
}));

/* ---------------- document ---------------- */

const doc = new Document({
  creator: "",
  title: "The Art of Doubting Clearly",
  description: "How ordinary thinking errors build a god and fill a church",
  // justified body text reads badly without hyphenation
  hyphenation: { autoHyphenation: true },
  numbering: {
    config: [{
      reference: "book-list",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: 460, hanging: 320 } } },
      }],
    }],
  },
  styles: {
    default: {
      document: {
        run: { font: SERIF, size: 22 },
        paragraph: { spacing: { after: 180, line: 300 }, alignment: AlignmentType.JUSTIFIED },
      },
      heading1: {
        run: { font: SERIF, size: 40, bold: false, color: "161B23" },
        paragraph: { spacing: { before: 0, after: 320, line: 280 }, alignment: AlignmentType.LEFT },
      },
      heading2: {
        run: { font: SERIF, size: 32, bold: false, color: "161B23" },
        paragraph: { spacing: { before: 0, after: 160, line: 280 }, alignment: AlignmentType.LEFT },
      },
      heading3: {
        run: { font: SERIF, size: 24, bold: false, color: "161B23" },
        paragraph: { spacing: { before: 400, after: 160 }, alignment: AlignmentType.LEFT },
      },
    },
  },
  sections: [
    {
      // title page
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 2016, right: 2016 } },
      },
      children: [
        new Paragraph({
          spacing: { before: 2600, after: 420 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: "TWENTY-SEVEN CHAPTERS · ONE THINKING ERROR EACH", color: ACCENT, size: 17, characterSpacing: 26 })],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 240, line: 260 },
          children: [new TextRun({ text: "The Art of Doubting Clearly", size: 64, font: SERIF })],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 900 },
          children: [new TextRun({ text: "How ordinary thinking errors build a god and fill a church", italics: true, size: 26, color: MUTED })],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 60 },
          children: [new TextRun({ text: "Written in the format of Rolf Dobelli's ", size: 19, color: FAINT }),
            new TextRun({ text: "The Art of Thinking Clearly", size: 19, color: FAINT, italics: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: "Four parts · a practical program at Chapter 26", size: 19, color: FAINT })],
        }),
      ],
    },
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 2016, right: 2016 } },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240 },
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: FAINT })],
          })],
        }),
      },
      children: body,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(`wrote ${OUT} (${(buf.length / 1024).toFixed(0)} KB, ${chapters.length} chapters)`);
});
