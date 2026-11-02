import type { ChatMessage } from '@/lib/types';

type ExportFormat = 'docx' | 'pdf';

interface ChatExportMetadata {
  model: string;
  exportedAt?: Date;
}

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

type ChatBlock =
  | { type: 'paragraph'; segments: TextSegment[] }
  | { type: 'heading'; level: number; segments: TextSegment[] }
  | { type: 'listItem'; marker: string; segments: TextSegment[] }
  | { type: 'quote'; segments: TextSegment[] }
  | { type: 'code'; text: string };

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME = 'application/pdf';
const EXPORT_TITLE = 'Pathfinder Guard Chat Export';
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PDF_MARGIN = 52;

export function exportChat(
  messages: ChatMessage[],
  format: ExportFormat,
  metadata: ChatExportMetadata,
) {
  if (messages.length === 0) {
    throw new Error('There are no chat messages to export.');
  }

  const exportedAt = metadata.exportedAt ?? new Date();
  const fileName = getExportFileName(format, exportedAt);
  const normalizedMetadata = { ...metadata, exportedAt };
  const blob =
    format === 'docx'
      ? createDocxBlob(messages, normalizedMetadata)
      : createPdfBlob(messages, normalizedMetadata);

  downloadBlob(blob, fileName);
}

function createDocxBlob(
  messages: ChatMessage[],
  metadata: Required<ChatExportMetadata>,
) {
  const documentXml = buildDocumentXml(messages, metadata);
  const files: Record<string, string> = {
    '[Content_Types].xml': buildContentTypesXml(),
    '_rels/.rels': buildRootRelsXml(),
    'docProps/app.xml': buildAppPropertiesXml(),
    'docProps/core.xml': buildCorePropertiesXml(metadata.exportedAt),
    'word/_rels/document.xml.rels': buildDocumentRelsXml(),
    'word/document.xml': documentXml,
    'word/styles.xml': buildStylesXml(),
  };

  return new Blob([createZip(files)], { type: DOCX_MIME });
}

function buildDocumentXml(
  messages: ChatMessage[],
  metadata: Required<ChatExportMetadata>,
) {
  const body: string[] = [
    paragraphXml([{ text: EXPORT_TITLE }], 'Title'),
    paragraphXml(
      [
        {
          text: `Exported ${formatDateTime(metadata.exportedAt.getTime())} | ${messages.length} messages | Model: ${metadata.model}`,
        },
      ],
      'Subtitle',
    ),
  ];

  messages.forEach((message, index) => {
    const style = message.role === 'user' ? 'UserHeader' : 'AssistantHeader';
    const roleLabel = message.role === 'user' ? 'User' : 'Assistant';
    const status = message.isStreaming ? ' | Streaming' : '';
    body.push(
      paragraphXml(
        [
          { text: roleLabel, bold: true },
          {
            text: ` | Iteration ${message.iterationNumber} | ${formatDateTime(message.timestamp)}${status}`,
          },
        ],
        style,
      ),
    );

    const blocks = parseMessageBlocks(message.content);
    if (blocks.length === 0) {
      body.push(paragraphXml([{ text: '[Empty message]' }], 'BodyText'));
    } else {
      blocks.forEach((block) => body.push(...docxBlockXml(block)));
    }

    if (index < messages.length - 1) {
      body.push(paragraphXml([{ text: '' }], 'Spacer'));
    }
  });

  return xmlDeclaration(
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        ${body.join('')}
        <w:sectPr>
          <w:pgSz w:w="11906" w:h="16838"/>
          <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
        </w:sectPr>
      </w:body>
    </w:document>`,
  );
}

function docxBlockXml(block: ChatBlock): string[] {
  switch (block.type) {
    case 'heading':
      return [
        paragraphXml(
          block.segments,
          block.level === 1 ? 'Heading1' : 'Heading2',
        ),
      ];
    case 'listItem':
      return [
        paragraphXml(
          [{ text: `${block.marker} ` }, ...block.segments],
          'ListParagraph',
        ),
      ];
    case 'quote':
      return [paragraphXml(block.segments, 'Quote')];
    case 'code': {
      const lines = block.text.split('\n');
      return lines.map((line) =>
        paragraphXml([{ text: line || ' ', code: true }], 'CodeBlock'),
      );
    }
    case 'paragraph':
    default:
      return [paragraphXml(block.segments, 'BodyText')];
  }
}

function paragraphXml(segments: TextSegment[], styleId: string) {
  const runXml =
    segments.length === 0 || segments.every((segment) => segment.text === '')
      ? runXmlForSegment({ text: ' ' })
      : segments.map(runXmlForSegment).join('');

  return `<w:p><w:pPr><w:pStyle w:val="${styleId}"/></w:pPr>${runXml}</w:p>`;
}

function runXmlForSegment(segment: TextSegment) {
  const props: string[] = [];

  if (segment.bold) props.push('<w:b/>');
  if (segment.italic) props.push('<w:i/>');
  if (segment.code) {
    props.push(
      '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/>',
      '<w:color w:val="102A43"/>',
    );
  }

  const rPr = props.length > 0 ? `<w:rPr>${props.join('')}</w:rPr>` : '';

  return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(segment.text)}</w:t></w:r>`;
}

function buildContentTypesXml() {
  return xmlDeclaration(
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
      <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    </Types>`,
  );
}

function buildRootRelsXml() {
  return xmlDeclaration(
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
      <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
    </Relationships>`,
  );
}

function buildDocumentRelsXml() {
  return xmlDeclaration(
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    </Relationships>`,
  );
}

function buildAppPropertiesXml() {
  return xmlDeclaration(
    `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
      <Application>Pathfinder Guard</Application>
    </Properties>`,
  );
}

function buildCorePropertiesXml(exportedAt: Date) {
  const isoDate = exportedAt.toISOString();

  return xmlDeclaration(
    `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <dc:title>${escapeXml(EXPORT_TITLE)}</dc:title>
      <dc:creator>Pathfinder Guard</dc:creator>
      <cp:lastModifiedBy>Pathfinder Guard</cp:lastModifiedBy>
      <dcterms:created xsi:type="dcterms:W3CDTF">${isoDate}</dcterms:created>
      <dcterms:modified xsi:type="dcterms:W3CDTF">${isoDate}</dcterms:modified>
    </cp:coreProperties>`,
  );
}

function buildStylesXml() {
  return xmlDeclaration(
    `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:docDefaults>
        <w:rPrDefault>
          <w:rPr>
            <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
            <w:color w:val="1A1A2E"/>
          </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
          <w:pPr>
            <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
          </w:pPr>
        </w:pPrDefault>
      </w:docDefaults>
      <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
        <w:name w:val="Normal"/>
        <w:qFormat/>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Title">
        <w:name w:val="Title"/>
        <w:basedOn w:val="Normal"/>
        <w:qFormat/>
        <w:pPr><w:spacing w:after="120"/></w:pPr>
        <w:rPr><w:b/><w:color w:val="102A43"/><w:sz w:val="34"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Subtitle">
        <w:name w:val="Subtitle"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:after="360"/></w:pPr>
        <w:rPr><w:color w:val="627D98"/><w:sz w:val="18"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="UserHeader">
        <w:name w:val="User Header"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:before="180" w:after="100"/><w:shd w:val="clear" w:color="auto" w:fill="3B82F6"/></w:pPr>
        <w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="AssistantHeader">
        <w:name w:val="Assistant Header"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:before="180" w:after="100"/><w:shd w:val="clear" w:color="auto" w:fill="F0F4F8"/></w:pPr>
        <w:rPr><w:b/><w:color w:val="243B53"/><w:sz w:val="20"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="BodyText">
        <w:name w:val="Body Text"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:after="180" w:line="300" w:lineRule="auto"/></w:pPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="Heading 1"/>
        <w:basedOn w:val="Normal"/>
        <w:qFormat/>
        <w:pPr><w:spacing w:before="180" w:after="80"/></w:pPr>
        <w:rPr><w:b/><w:color w:val="102A43"/><w:sz w:val="28"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading2">
        <w:name w:val="Heading 2"/>
        <w:basedOn w:val="Normal"/>
        <w:qFormat/>
        <w:pPr><w:spacing w:before="120" w:after="80"/></w:pPr>
        <w:rPr><w:b/><w:color w:val="243B53"/><w:sz w:val="24"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="ListParagraph">
        <w:name w:val="List Paragraph"/>
        <w:basedOn w:val="BodyText"/>
        <w:pPr><w:ind w:left="360" w:hanging="240"/><w:spacing w:after="80"/></w:pPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Quote">
        <w:name w:val="Quote"/>
        <w:basedOn w:val="BodyText"/>
        <w:pPr><w:ind w:left="360"/><w:spacing w:after="120"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:pPr>
        <w:rPr><w:i/><w:color w:val="486581"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="CodeBlock">
        <w:name w:val="Code Block"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:pPr>
        <w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="18"/><w:color w:val="102A43"/></w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Spacer">
        <w:name w:val="Spacer"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr><w:spacing w:after="120"/></w:pPr>
        <w:rPr><w:sz w:val="6"/></w:rPr>
      </w:style>
    </w:styles>`,
  );
}

function createPdfBlob(
  messages: ChatMessage[],
  metadata: Required<ChatExportMetadata>,
) {
  const pages = layoutPdfPages(messages, metadata);
  const pdf = buildPdf(pages);

  return new Blob([pdf], { type: PDF_MIME });
}

function layoutPdfPages(
  messages: ChatMessage[],
  metadata: Required<ChatExportMetadata>,
) {
  const pages: string[][] = [[]];
  let pageIndex = 0;
  let y = A4_HEIGHT - PDF_MARGIN;
  const maxWidth = A4_WIDTH - PDF_MARGIN * 2;

  const currentPage = () => pages[pageIndex];

  const addPage = () => {
    pages.push([]);
    pageIndex += 1;
    y = A4_HEIGHT - PDF_MARGIN;
  };

  const ensureSpace = (height: number) => {
    if (y - height < PDF_MARGIN) {
      addPage();
    }
  };

  const drawText = (
    text: string,
    x: number,
    baseline: number,
    font: 'F1' | 'F2' | 'F3',
    size: number,
    color = '0.102 0.102 0.180',
  ) => {
    currentPage().push(
      `BT /${font} ${formatPdfNumber(size)} Tf ${color} rg ${formatPdfNumber(x)} ${formatPdfNumber(baseline)} Td (${escapePdfText(text)}) Tj ET`,
    );
  };

  const drawRect = (
    x: number,
    bottom: number,
    width: number,
    height: number,
    color: string,
  ) => {
    currentPage().push(
      `${color} rg ${formatPdfNumber(x)} ${formatPdfNumber(bottom)} ${formatPdfNumber(width)} ${formatPdfNumber(height)} re f`,
    );
  };

  const drawWrappedText = (
    text: string,
    options: {
      x?: number;
      width?: number;
      font?: 'F1' | 'F2' | 'F3';
      size?: number;
      lineHeight?: number;
      color?: string;
      prefix?: string;
    } = {},
  ) => {
    const x = options.x ?? PDF_MARGIN;
    const width = options.width ?? maxWidth;
    const font = options.font ?? 'F1';
    const size = options.size ?? 10;
    const lineHeight = options.lineHeight ?? 14;
    const color = options.color ?? '0.102 0.102 0.180';
    const lines = wrapText(text, width, size, font);

    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      drawText(index === 0 ? `${options.prefix ?? ''}${line}` : line, x, y, font, size, color);
      y -= lineHeight;
    });
  };

  drawText(EXPORT_TITLE, PDF_MARGIN, y, 'F2', 18, '0.063 0.165 0.263');
  y -= 22;
  drawWrappedText(
    `Exported ${formatDateTime(metadata.exportedAt.getTime())} | ${messages.length} messages | Model: ${metadata.model}`,
    {
      font: 'F1',
      size: 9,
      lineHeight: 12,
      color: '0.384 0.490 0.596',
    },
  );
  y -= 12;

  messages.forEach((message, messageIndex) => {
    ensureSpace(40);
    const isUser = message.role === 'user';
    const roleLabel = isUser ? 'User' : 'Assistant';
    const status = message.isStreaming ? ' | Streaming' : '';
    const header = `${roleLabel} | Iteration ${message.iterationNumber} | ${formatDateTime(message.timestamp)}${status}`;
    const headerFill = isUser ? '0.231 0.510 0.965' : '0.941 0.957 0.973';
    const headerTextColor = isUser ? '1 1 1' : '0.141 0.231 0.325';
    const headerTop = y;
    const headerHeight = 22;

    drawRect(PDF_MARGIN, headerTop - headerHeight, maxWidth, headerHeight, headerFill);
    drawText(header, PDF_MARGIN + 8, headerTop - 14, 'F2', 9, headerTextColor);
    y -= 32;

    const blocks = parseMessageBlocks(message.content);
    if (blocks.length === 0) {
      drawWrappedText('[Empty message]', {
        color: '0.384 0.490 0.596',
        size: 10,
        lineHeight: 14,
      });
    } else {
      blocks.forEach((block) => {
        switch (block.type) {
          case 'heading':
            y -= block.level === 1 ? 4 : 2;
            drawWrappedText(blockToPlainText(block), {
              font: 'F2',
              size: block.level === 1 ? 13 : 11,
              lineHeight: block.level === 1 ? 17 : 15,
              color: '0.063 0.165 0.263',
            });
            y -= 2;
            break;
          case 'listItem':
            drawWrappedText(blockToPlainText(block), {
              x: PDF_MARGIN + 14,
              width: maxWidth - 14,
              prefix: `${block.marker} `,
            });
            break;
          case 'quote':
            drawWrappedText(blockToPlainText(block), {
              x: PDF_MARGIN + 14,
              width: maxWidth - 14,
              color: '0.282 0.396 0.506',
            });
            y -= 2;
            break;
          case 'code': {
            const codeLines = block.text.split('\n');
            codeLines.forEach((line) => {
              const wrappedCode = wrapText(line || ' ', maxWidth - 18, 8.5, 'F3');
              wrappedCode.forEach((codeLine) => {
                ensureSpace(14);
                drawRect(PDF_MARGIN, y - 3, maxWidth, 13, '0.973 0.980 0.988');
                drawText(codeLine, PDF_MARGIN + 8, y, 'F3', 8.5, '0.063 0.165 0.263');
                y -= 12;
              });
            });
            y -= 4;
            break;
          }
          case 'paragraph':
          default:
            drawWrappedText(blockToPlainText(block));
            y -= 2;
            break;
        }
      });
    }

    if (messageIndex < messages.length - 1) {
      y -= 12;
    }
  });

  return pages.map((commands) => commands.join('\n'));
}

function buildPdf(pageStreams: string[]) {
  const encoder = new TextEncoder();
  const objects = new Map<number, string>();
  const pageIds = pageStreams.map((_, index) => 6 + index * 2);
  const contentIds = pageStreams.map((_, index) => 7 + index * 2);
  const maxObjectId = contentIds[contentIds.length - 1] ?? 5;

  objects.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objects.set(
    2,
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`,
  );
  objects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.set(
    4,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  );
  objects.set(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');

  pageStreams.forEach((stream, index) => {
    const pageId = pageIds[index];
    const contentId = contentIds[index];
    objects.set(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH} ${A4_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.set(
      contentId,
      `<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream`,
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let id = 1; id <= maxObjectId; id += 1) {
    const object = objects.get(id);
    if (!object) continue;
    offsets[id] = encoder.encode(pdf).length;
    pdf += `${id} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${maxObjectId + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let id = 1; id <= maxObjectId; id += 1) {
    pdf += `${String(offsets[id] ?? 0).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function parseMessageBlocks(content: string): ChatBlock[] {
  const normalized = content.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const blocks: ChatBlock[] = [];
  let paragraphLines: string[] = [];
  let codeLines: string[] = [];
  let isCodeBlock = false;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({
      type: 'paragraph',
      segments: parseInlineMarkdown(paragraphLines.join(' ')),
    });
    paragraphLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (isCodeBlock) {
      if (trimmed.startsWith('```')) {
        blocks.push({ type: 'code', text: codeLines.join('\n') });
        codeLines = [];
        isCodeBlock = false;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith('```')) {
      flushParagraph();
      codeLines = [];
      isCodeBlock = true;
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        segments: parseInlineMarkdown(headingMatch[2]),
      });
      continue;
    }

    const unorderedMatch = /^\s*[-*+]\s+(.+)$/.exec(line);
    if (unorderedMatch) {
      flushParagraph();
      blocks.push({
        type: 'listItem',
        marker: '-',
        segments: parseInlineMarkdown(unorderedMatch[1]),
      });
      continue;
    }

    const orderedMatch = /^\s*(\d+)[.)]\s+(.+)$/.exec(line);
    if (orderedMatch) {
      flushParagraph();
      blocks.push({
        type: 'listItem',
        marker: `${orderedMatch[1]}.`,
        segments: parseInlineMarkdown(orderedMatch[2]),
      });
      continue;
    }

    const quoteMatch = /^\s*>\s?(.*)$/.exec(line);
    if (quoteMatch) {
      flushParagraph();
      blocks.push({
        type: 'quote',
        segments: parseInlineMarkdown(quoteMatch[1]),
      });
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();

  if (isCodeBlock) {
    blocks.push({ type: 'code', text: codeLines.join('\n') });
  }

  return blocks;
}

function parseInlineMarkdown(input: string): TextSegment[] {
  const linkExpanded = input.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_)/g;
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(linkExpanded))) {
    if (match.index > lastIndex) {
      segments.push({ text: linkExpanded.slice(lastIndex, match.index) });
    }

    const token = match[0];
    if (token.startsWith('`')) {
      segments.push({ text: token.slice(1, -1), code: true });
    } else if (token.startsWith('**') || token.startsWith('__')) {
      segments.push({ text: token.slice(2, -2), bold: true });
    } else {
      segments.push({ text: token.slice(1, -1), italic: true });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < linkExpanded.length) {
    segments.push({ text: linkExpanded.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text: input }];
}

function blockToPlainText(block: Extract<ChatBlock, { segments: TextSegment[] }>) {
  return block.segments.map((segment) => segment.text).join('');
}

function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: 'F1' | 'F2' | 'F3',
) {
  const sanitized = normalizePdfText(text);
  const words = sanitized.split(/(\s+)/).filter((part) => part.length > 0);
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current}${word}` : word.trimStart();

    if (estimatePdfTextWidth(candidate, fontSize, font) <= maxWidth) {
      current = candidate;
      return;
    }

    if (current.trim()) {
      lines.push(current.trimEnd());
      current = word.trimStart();
    }

    while (estimatePdfTextWidth(current, fontSize, font) > maxWidth) {
      const splitAt = findTextSplit(current, maxWidth, fontSize, font);
      lines.push(current.slice(0, splitAt));
      current = current.slice(splitAt);
    }
  });

  if (current.trim() || lines.length === 0) {
    lines.push(current.trimEnd());
  }

  return lines;
}

function findTextSplit(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: 'F1' | 'F2' | 'F3',
) {
  for (let index = 1; index < text.length; index += 1) {
    if (estimatePdfTextWidth(text.slice(0, index), fontSize, font) > maxWidth) {
      return Math.max(1, index - 1);
    }
  }

  return text.length;
}

function estimatePdfTextWidth(
  text: string,
  fontSize: number,
  font: 'F1' | 'F2' | 'F3',
) {
  if (font === 'F3') return text.length * fontSize * 0.6;

  return text.split('').reduce((width, char) => {
    if (char === ' ') return width + fontSize * 0.28;
    if ('il.,:;|!'.includes(char)) return width + fontSize * 0.23;
    if ('mwMW@#%&'.includes(char)) return width + fontSize * 0.82;
    if (/[A-Z0-9]/.test(char)) return width + fontSize * 0.58;
    return width + fontSize * 0.5;
  }, 0);
}

function createZip(files: Record<string, string>): ArrayBuffer {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  const now = new Date();
  const dosTime = getDosTime(now);
  const dosDate = getDosDate(now);

  Object.entries(files).forEach(([path, content]) => {
    const fileNameBytes = encoder.encode(path);
    const data = encoder.encode(content);
    const crc = crc32(data);

    const localHeader = new Uint8Array(30 + fileNameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, fileNameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(fileNameBytes, 30);

    localParts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + fileNameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, fileNameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(fileNameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + data.length;
  });

  const centralDirectorySize = centralParts.reduce(
    (size, part) => size + part.length,
    0,
  );
  const centralDirectoryOffset = offset;
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, centralParts.length, true);
  endView.setUint16(10, centralParts.length, true);
  endView.setUint32(12, centralDirectorySize, true);
  endView.setUint32(16, centralDirectoryOffset, true);
  endView.setUint16(20, 0, true);

  const parts = [...localParts, ...centralParts, end];
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const zip = new Uint8Array(totalLength);
  let position = 0;

  parts.forEach((part) => {
    zip.set(part, position);
    position += part.length;
  });

  return zip.buffer;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (let index = 0; index < data.length; index += 1) {
    crc ^= data[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function getDosTime(date: Date) {
  return (
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2)
  );
}

function getDosDate(date: Date) {
  return (
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate()
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getExportFileName(format: ExportFormat, exportedAt: Date) {
  const stamp = exportedAt.toISOString().slice(0, 19).replace(/[:T]/g, '-');

  return `pathfinder-guard-chat-${stamp}.${format}`;
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function xmlDeclaration(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${xml}`;
}

function escapeXml(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapePdfText(value: string) {
  return normalizePdfText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function normalizePdfText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
}

function formatPdfNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
