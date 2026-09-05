import { writeFile } from "fs/promises";
import { resolve } from "path";

import resume from "../src/data/resume.json";

enum Font {
  Regular = "F1",
  Strong = "F2",
}

enum TextRole {
  Body = "body",
  Entry = "entry",
  Footer = "footer",
  Link = "link",
  Name = "name",
  Section = "section",
  Small = "small",
  Title = "title",
}

interface TextStyle {
  font: Font;
  size: number;
  leading: number;
  color: readonly [number, number, number];
}

interface LinkAnnotation {
  rect: readonly [number, number, number, number];
  uri: string;
}

interface PdfPage {
  operations: string[];
  links: LinkAnnotation[];
}
type Point = readonly [number, number];
type ResumeLink = Readonly<{ label: string; href: string }>;
type ResumeProject = (typeof resume.projects)[number];
type PdfPlan = readonly [number, number, number[], PdfPage];
const OUTPUT_PATH = resolve(__dirname, "../public/docs/anthony_tropeano_resume.pdf");
const PAGE_WIDTH = 612;
const MARGIN = 35;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const TOP = 750;
const BOTTOM = 60;
const FOOTER_RULE_Y = 48;
const FOOTER_Y = 30;
const BULLET_INDENT = 24;
const BULLET_RADIUS = 1.7;
const CIRCLE_CONTROL_RATIO = 0.5523;
const SKILL_VALUE_X = 180;
const HEADER_INSET = 10;
const RULE_WIDTH = 0.7;
const STYLE_SCALE = 1.15;
const HEADER_SEPARATOR = " | ";
const SECTION_GAP = 8;
const ENTRY_GAP = 6;
const MINIMUM_ENTRY_HEIGHT = 34;
const ENTRY_DETAIL_GAP = 16;
const ASCII_START = 32;
const ASCII_END = 127;
const FONT_SCALE = 1000;
const FALLBACK_WIDTH = 556;
const FIRST_CONTENT_OBJECT_ID = 5;
const XREF_OFFSET_WIDTH = 10;
const PDF_ENCODING = "latin1";
const PDF_HEADER = "%PDF-1.7\n%\xE2\xE3\xCF\xD3\n";
const REFERENCE_SUFFIX = " 0 R";
const OBJECT_SEPARATOR = " ";
const LINE_SEPARATOR = "\n";
const BODY_METRICS =
  "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 " +
  "556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 " +
  "1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 " +
  "667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556 " +
  "333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 " +
  "556 556 333 500 278 556 500 722 500 500 500 334 260 334 584";
const BOLD_METRICS =
  "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 " +
  "556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 " +
  "975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 " +
  "667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556 " +
  "333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 " +
  "611 611 389 556 333 611 556 778 556 556 500 389 280 389 584";
const WIDTHS = new Map<Font, readonly number[]>([
  [Font.Regular, BODY_METRICS.split(OBJECT_SEPARATOR).map(Number)], [Font.Strong, BOLD_METRICS.split(OBJECT_SEPARATOR).map(Number)],
]);
const INK = [0, 0, 0] satisfies TextStyle["color"];
const MUTED = [0.333, 0.333, 0.333] satisfies TextStyle["color"];
const ACCENT = [0.18, 0.353, 0.541] satisfies TextStyle["color"];
const TEXT_STYLES = {
  [TextRole.Body]: { font: Font.Regular, size: 8.2, leading: 10.2, color: INK },
  [TextRole.Entry]: { font: Font.Strong, size: 9, leading: 11, color: INK },
  [TextRole.Footer]: { font: Font.Regular, size: 6.8, leading: 8, color: MUTED },
  [TextRole.Link]: { font: Font.Regular, size: 7.3, leading: 9, color: ACCENT },
  [TextRole.Name]: { font: Font.Strong, size: 21, leading: 23, color: INK },
  [TextRole.Section]: { font: Font.Strong, size: 9, leading: 11, color: ACCENT },
  [TextRole.Small]: { font: Font.Regular, size: 7.3, leading: 9, color: MUTED },
  [TextRole.Title]: { font: Font.Strong, size: 9.5, leading: 12, color: ACCENT },
} satisfies Record<TextRole, TextStyle>;

function styleFor(role: TextRole): TextStyle {
  const style = TEXT_STYLES[role];
  if (role === TextRole.Name || role === TextRole.Footer) return style;
  return { ...style, size: style.size * STYLE_SCALE, leading: style.leading * STYLE_SCALE };
}

function escapeText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", String.raw`\(`)
    .replaceAll(")", String.raw`\)`);
}

function textWidth(value: string, role: TextRole): number {
  const style = styleFor(role);
  const widths = WIDTHS.get(style.font);
  if (!widths) return 0;
  const units = [...value].reduce((total, character) => {
    const code = character.codePointAt(0) ?? ASCII_START;
    const width =
      code >= ASCII_START && code < ASCII_END
        ? widths[code - ASCII_START]
        : FALLBACK_WIDTH;
    return total + (width ?? FALLBACK_WIDTH);
  }, 0);
  return (units * style.size) / FONT_SCALE;
}

function wrapText(value: string, width: number, role: TextRole): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of value.split(OBJECT_SEPARATOR)) {
    const candidate = [current, word]
      .filter(Boolean)
      .join(OBJECT_SEPARATOR);
    if (!current || textWidth(candidate, role) <= width) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

function addText(
  page: PdfPage,
  value: string,
  point: Point,
  role: TextRole,
): void {
  const style = styleFor(role);
  const [red, green, blue] = role === TextRole.Link ? ACCENT : INK;
  const [x, y] = point;
  page.operations.push(
    `BT ${red.toFixed(3)} ${green.toFixed(3)} ${blue.toFixed(3)} rg ` +
      `/${style.font} ${style.size.toFixed(2)} Tf 1 0 0 1 ` +
      `${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapeText(value)}) Tj ET`,
  );
}

function addRule(page: PdfPage, y: number): void {
  page.operations.push(
    `q ${INK.join(" ")} RG ${RULE_WIDTH} w ${MARGIN.toFixed(2)} ` +
      `${y.toFixed(2)} m ${(PAGE_WIDTH - MARGIN).toFixed(2)} ` +
      `${y.toFixed(2)} l S Q`,
  );
}

function addBullet(page: PdfPage, point: Point): void {
  const [x, y] = point;
  const control = BULLET_RADIUS * CIRCLE_CONTROL_RATIO;
  page.operations.push(
    `q ${INK.join(" ")} rg ${x + BULLET_RADIUS} ${y} m ` +
      `${x + BULLET_RADIUS} ${y + control} ${x + control} ${y + BULLET_RADIUS} ` +
      `${x} ${y + BULLET_RADIUS} c ${x - control} ${y + BULLET_RADIUS} ` +
      `${x - BULLET_RADIUS} ${y + control} ${x - BULLET_RADIUS} ${y} c ` +
      `${x - BULLET_RADIUS} ${y - control} ${x - control} ${y - BULLET_RADIUS} ` +
      `${x} ${y - BULLET_RADIUS} c ${x + control} ${y - BULLET_RADIUS} ` +
      `${x + BULLET_RADIUS} ${y - control} ${x + BULLET_RADIUS} ${y} c f Q`,
  );
}

function references(numbers: readonly number[]): string {
  return numbers
    .map((number) => `${number}${REFERENCE_SUFFIX}`)
    .join(OBJECT_SEPARATOR);
}

function annotationBody(annotation: LinkAnnotation): string {
  const [left, bottom, right, top] = annotation.rect;
  return (
    `<</Type/Annot/Subtype/Link/Rect[${left.toFixed(2)} ` +
    `${bottom.toFixed(2)} ${right.toFixed(2)} ${top.toFixed(2)}]` +
    `/Border[0 0 0]/A<</S/URI/URI(${escapeText(annotation.uri)})>>>>`
  );
}

function pagePlan(pages: readonly PdfPage[]): readonly [PdfPlan[], number] {
  let nextId = FIRST_CONTENT_OBJECT_ID;
  const plan: PdfPlan[] = [];
  for (const page of pages) {
    const contentId = nextId;
    const pageId = contentId + 1;
    const linkIds = page.links.map((_, index) => pageId + index + 1);
    nextId = pageId + linkIds.length + 1;
    plan.push([contentId, pageId, linkIds, page]);
  }
  return [plan, nextId];
}

function pageBody(contentId: number, linkIds: readonly number[]): string {
  return (
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]" +
    "/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>" +
    `/Contents ${contentId} 0 R/Annots[${references(linkIds)}]>>`
  );
}

function buildObjects(plan: readonly PdfPlan[]): Map<number, string> {
  const bodies = new Map<number, string>();
  const pageIds: number[] = [];
  for (const [contentId, pageId, linkIds, page] of plan) {
    const stream = page.operations.join(LINE_SEPARATOR);
    const length = Buffer.byteLength(stream, PDF_ENCODING);
    bodies.set(
      contentId,
      `<</Length ${length}>>\nstream\n${stream}\nendstream`,
    );
    bodies.set(pageId, pageBody(contentId, linkIds));
    page.links.forEach((link, index) => {
      const linkId = linkIds[index];
      if (linkId !== undefined) bodies.set(linkId, annotationBody(link));
    });
    pageIds.push(pageId);
  }
  bodies.set(1, "<</Type/Catalog/Pages 2 0 R/Lang(en-US)>>");
  bodies.set(
    2,
    `<</Type/Pages/Kids[${references(pageIds)}]/Count ${pageIds.length}>>`,
  );
  bodies.set(3, "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>");
  bodies.set(4, "<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>");
  return bodies;
}

function serializePdf(pages: readonly PdfPage[]): Buffer {
  const [plan, top] = pagePlan(pages);
  const bodies = buildObjects(plan);
  let output = PDF_HEADER;
  const offsets: number[] = [0];
  for (let number = 1; number < top; number += 1) {
    const body = bodies.get(number) ?? "";
    offsets[number] = Buffer.byteLength(output, PDF_ENCODING);
    output += `${number} 0 obj\n${body}\nendobj\n`;
  }
  const xrefAt = Buffer.byteLength(output, PDF_ENCODING);
  output += `xref\n0 ${top}\n0000000000 65535 f \n`;
  for (let number = 1; number < top; number += 1) {
    const offset = String(offsets[number]).padStart(XREF_OFFSET_WIDTH, "0");
    output += `${offset} 00000 n \n`;
  }
  output += `trailer\n<</Size ${top}/Root 1 0 R>>\n`;
  output += `startxref\n${xrefAt}\n%%EOF\n`;
  return Buffer.from(output, PDF_ENCODING);
}

class ResumeLayout {
  readonly pages: PdfPage[] = [];
  private page: PdfPage = { operations: [], links: [] };
  private y = TOP;

  constructor() {
    this.newPage();
  }

  private newPage(): void {
    this.page = { operations: [], links: [] };
    this.pages.push(this.page);
    this.y = TOP;
  }

  private ensure(height: number): void {
    if (this.y - height < BOTTOM) this.newPage();
  }

  private rightText(value: string, y: number, role: TextRole): void {
    const x = PAGE_WIDTH - MARGIN - textWidth(value, role);
    addText(this.page, value, [x, y], role);
  }

  private centerText(value: string, y: number, role: TextRole): void {
    const x = (PAGE_WIDTH - textWidth(value, role)) / 2;
    addText(this.page, value, [x, y], role);
  }

  paragraph(value: string, role: TextRole): void {
    const style = styleFor(role);
    for (const line of wrapText(value, CONTENT_WIDTH, role)) {
      this.ensure(style.leading);
      addText(this.page, line, [MARGIN, this.y], role);
      this.y -= style.leading;
    }
    this.y -= ENTRY_GAP;
  }

  bullet(value: string): void {
    const style = styleFor(TextRole.Body);
    const lines = wrapText(value, CONTENT_WIDTH - BULLET_INDENT, TextRole.Body);
    lines.forEach((line, index) => {
      this.ensure(style.leading);
      if (index === 0) addBullet(this.page, [MARGIN + BULLET_INDENT / 2, this.y + 3]);
      addText(this.page, line, [MARGIN + BULLET_INDENT, this.y], TextRole.Body);
      this.y -= style.leading;
    });
    this.y -= 1.5;
  }

  section(title: string): void {
    const style = styleFor(TextRole.Section);
    this.ensure(style.leading + SECTION_GAP + MINIMUM_ENTRY_HEIGHT);
    this.y -= SECTION_GAP;
    addText(this.page, title.toUpperCase(), [MARGIN, this.y], TextRole.Section);
    addRule(this.page, this.y - 3);
    this.y -= style.leading + 2;
  }

  entryHeader(title: string, detail: string): void {
    const style = styleFor(TextRole.Entry);
    const detailWidth = textWidth(detail, TextRole.Small);
    const titleWidth = CONTENT_WIDTH - detailWidth - ENTRY_DETAIL_GAP;
    const lines = wrapText(title, titleWidth, TextRole.Entry);
    this.ensure(Math.max(MINIMUM_ENTRY_HEIGHT, lines.length * style.leading));
    this.rightText(detail, this.y, TextRole.Small);
    for (const line of lines) {
      addText(this.page, line, [MARGIN, this.y], TextRole.Entry);
      this.y -= style.leading;
    }
  }

  subline(value: string): void {
    addText(this.page, value, [MARGIN, this.y], TextRole.Small);
    this.y -= styleFor(TextRole.Small).leading;
  }

  links(links: readonly ResumeLink[], centered = false): void {
    const labels = links.map((link, index) =>
      index === 0 ? link.label : `${HEADER_SEPARATOR}${link.label}`,
    );
    const width = labels.reduce(
      (total, label) => total + textWidth(label, TextRole.Link),
      0,
    );
    let x = centered ? (PAGE_WIDTH - width) / 2 : MARGIN;
    links.forEach((link, index) => {
      const label = labels[index] ?? link.label;
      addText(this.page, label, [x, this.y], TextRole.Link);
      const width = textWidth(label, TextRole.Link);
      const rect = [x, this.y - 2, x + width, this.y + 8] satisfies LinkAnnotation["rect"];
      this.page.links.push({ rect, uri: link.href });
      x += width;
    });
    this.y -= styleFor(TextRole.Link).leading;
  }

  header(): void {
    this.y -= HEADER_INSET;
    this.centerText(resume.name.toUpperCase(), this.y, TextRole.Name);
    this.y -= styleFor(TextRole.Name).leading;
    this.centerText(resume.title, this.y, TextRole.Title);
    this.y -= styleFor(TextRole.Title).leading;
    const contactLine = [
      resume.location,
      resume.availability,
      resume.phone.label,
      resume.email.label,
    ].join(HEADER_SEPARATOR);
    this.centerText(contactLine, this.y, TextRole.Small);
    this.y -= styleFor(TextRole.Small).leading;
    this.links(resume.profiles, true);
    this.y -= SECTION_GAP;
  }

  skill(label: string, value: string): void {
    const role = TextRole.Body;
    const lines = wrapText(value, PAGE_WIDTH - MARGIN - SKILL_VALUE_X, role);
    this.ensure(lines.length * styleFor(role).leading);
    addText(this.page, label, [MARGIN, this.y], role);
    for (const line of lines) {
      addText(this.page, line, [SKILL_VALUE_X, this.y], role);
      this.y -= styleFor(role).leading;
    }
    this.y -= ENTRY_GAP;
  }

  gap(): void {
    this.y -= ENTRY_GAP;
  }

  keep(height: number): void {
    this.ensure(height);
  }

  footers(): void {
    this.pages.forEach((page, index) => {
      const label = `Page ${index + 1} of ${this.pages.length}`;
      const x = PAGE_WIDTH - MARGIN - textWidth(label, TextRole.Footer);
      addRule(page, FOOTER_RULE_Y);
      addText(page, resume.name, [MARGIN, FOOTER_Y], TextRole.Footer);
      addText(page, label, [x, FOOTER_Y], TextRole.Footer);
    });
  }
}

function renderSkills(layout: ResumeLayout): void {
  layout.section("Technical Skills");
  for (const skill of resume.skills) {
    layout.skill(skill.label, skill.value);
  }
}

function renderExperience(layout: ResumeLayout): void {
  layout.section("Professional Experience");
  for (const item of resume.experience) {
    layout.entryHeader(`${item.role} | ${item.organization}`, item.dates);
    item.bullets.forEach((bullet) => layout.bullet(bullet));
    layout.gap();
  }
}

function projectHeight(project: ResumeProject): number {
  const titleWidth = CONTENT_WIDTH - ENTRY_DETAIL_GAP;
  const titleLines = wrapText(project.name, titleWidth, TextRole.Entry).length;
  const bulletStyle = styleFor(TextRole.Body);
  const bulletHeight = project.bullets.reduce((total, bullet) => {
    const lines = wrapText(
      bullet,
      CONTENT_WIDTH - BULLET_INDENT,
      TextRole.Body,
    ).length;
    return total + lines * bulletStyle.leading + 1.5;
  }, 0);
  const linkHeight = project.links.length > 0
    ? styleFor(TextRole.Link).leading
    : 0;
  return titleLines * styleFor(TextRole.Entry).leading +
    styleFor(TextRole.Small).leading + linkHeight + bulletHeight + ENTRY_GAP;
}

function renderProjects(layout: ResumeLayout): void {
  layout.section("Selected Projects");
  for (const project of resume.projects) {
    layout.keep(projectHeight(project));
    layout.entryHeader(project.name, "");
    layout.subline(project.technologies);
    if (project.links.length > 0) layout.links(project.links);
    project.bullets.forEach((bullet) => layout.bullet(bullet));
    layout.gap();
  }
}

function renderEducation(layout: ResumeLayout): void {
  layout.section("Education");
  for (const item of resume.education) {
    layout.entryHeader(item.institution, item.dates);
    layout.subline(item.program);
    if (item.honors) layout.paragraph(item.honors, TextRole.Small);
    else layout.gap();
  }
}

function renderResume(): PdfPage[] {
  const layout = new ResumeLayout();
  layout.header();
  layout.section("Summary");
  layout.paragraph(resume.summary, TextRole.Body);
  renderSkills(layout);
  renderExperience(layout);
  renderEducation(layout);
  layout.section("Certifications");
  resume.certifications.forEach((item) => layout.bullet(item));
  renderProjects(layout);
  layout.footers();
  return layout.pages;
}

async function main(): Promise<void> {
  await writeFile(OUTPUT_PATH, serializePdf(renderResume()));
}

void main();
