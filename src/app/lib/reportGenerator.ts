import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageBreak,
  ShadingType,
} from 'docx';

// Lista standard ESRS (duplicata qui per evitare dipendenze circolari)
const ESRS_STANDARDS = [
  { code: 'ESRS 2', name: 'General Disclosures' },
  { code: 'ESRS E1', name: 'Climate Change' },
  { code: 'ESRS E2', name: 'Pollution' },
  { code: 'ESRS E3', name: 'Water and marine resources' },
  { code: 'ESRS E4', name: 'Biodiversity and ecosystems' },
  { code: 'ESRS E5', name: 'Resource use and circular economy' },
  { code: 'ESRS S1', name: 'Own workforce' },
  { code: 'ESRS S2', name: 'Workers in the value chain' },
  { code: 'ESRS S3', name: 'Affected communities' },
  { code: 'ESRS S4', name: 'Consumers and end-users' },
  { code: 'ESRS G1', name: 'Business conduct' },
];

const normalizeStandardCode = (code: string): string => {
  if (!code) return code || '';
  const trimmed = code.trim();
  if (trimmed === 'ESRS 2' || trimmed === 'ESRS-2' || trimmed === 'ESRS2' || trimmed === '2') return 'ESRS 2';
  const normalized = trimmed.replace(/^ESRS[\s-]+/i, '').trim();
  return normalized || trimmed;
};

// Colori per le celle header delle tabelle
const HEADER_SHADING = {
  type: ShadingType.SOLID as const,
  color: '1e3a5f',
  fill: '1e3a5f',
};

const LIGHT_SHADING = {
  type: ShadingType.SOLID as const,
  color: 'f1f5f9',
  fill: 'f1f5f9',
};

// Bordi standard per le tabelle
const TABLE_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
};

// Helper: crea una cella header
function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: 'ffffff', size: 20, font: 'Calibri' })],
        alignment: AlignmentType.LEFT,
      }),
    ],
    shading: HEADER_SHADING,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: TABLE_BORDERS,
  });
}

// Helper: crea una cella normale
function cell(text: string, options?: { bold?: boolean; color?: string; shading?: boolean }): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '—',
            bold: options?.bold,
            color: options?.color || '334155',
            size: 20,
            font: 'Calibri',
          }),
        ],
      }),
    ],
    shading: options?.shading ? LIGHT_SHADING : undefined,
    borders: TABLE_BORDERS,
  });
}

// Interfaccia dei parametri
export interface ReportData {
  allAssessedStandards: any[];
  materialStandards: any[];
  activeDatapoints: any[];
  dbDataPoints: any[];
  userName: string;
  userRole: string;
}

export async function generateESRSReport(data: ReportData): Promise<Blob> {
  const {
    allAssessedStandards,
    materialStandards,
    activeDatapoints,
    dbDataPoints,
    userName,
    userRole,
  } = data;

  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const approvedCount = dbDataPoints.filter((d) => d.status === 'Approved').length;
  const rejectedCount = dbDataPoints.filter((d) => d.status === 'Rejected').length;
  const pendingCount = dbDataPoints.filter((d) => d.status === 'In Progress').length;

  // ============================================================
  // SEZIONI DEL DOCUMENTO
  // ============================================================

  const sections: Paragraph[] = [];

  // --- COPERTINA ---
  sections.push(
    new Paragraph({ spacing: { after: 600 } }),
    new Paragraph({ spacing: { after: 600 } }),
    new Paragraph({
      children: [new TextRun({ text: 'REPORT ESRS', size: 56, bold: true, color: '1e3a5f', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Bozza di Compliance CSRD', size: 32, color: '64748b', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'European Sustainability Reporting Standards', size: 24, color: '94a3b8', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Generato il ${dateStr} alle ${timeStr}`, size: 22, color: '64748b', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `Utente: ${userName} (${userRole})`, size: 22, color: '64748b', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // --- SEZIONE 1: RIEPILOGO KPI ---
  sections.push(
    new Paragraph({
      text: '1. Riepilogo KPI',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Panoramica sintetica dello stato di compliance ESRS.', size: 22, color: '64748b', font: 'Calibri' })],
      spacing: { after: 200 },
    })
  );

  const kpiTable = new Table({
    rows: [
      new TableRow({
        children: [headerCell('Indicatore', 60), headerCell('Valore', 40)],
      }),
      new TableRow({
        children: [cell('Standard valutati'), cell(String(allAssessedStandards.length), { bold: true })],
      }),
      new TableRow({
        children: [cell('Standard materiali', { shading: true }), cell(String(materialStandards.length), { bold: true, shading: true })],
      }),
      new TableRow({
        children: [cell('Requisiti attivi (datapoint)'), cell(String(activeDatapoints.length), { bold: true })],
      }),
      new TableRow({
        children: [cell('Dati inseriti totali', { shading: true }), cell(String(dbDataPoints.length), { bold: true, shading: true })],
      }),
      new TableRow({
        children: [cell('Dati approvati'), cell(String(approvedCount), { bold: true, color: '16a34a' })],
      }),
      new TableRow({
        children: [cell('Dati rifiutati', { shading: true }), cell(String(rejectedCount), { bold: true, color: 'dc2626', shading: true })],
      }),
      new TableRow({
        children: [cell('Dati in revisione'), cell(String(pendingCount), { bold: true, color: 'd97706' })],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  sections.push(kpiTable as any);
  sections.push(new Paragraph({ spacing: { after: 400 } }));

  // --- SEZIONE 2: ANALISI DI MATERIALITÀ ---
  sections.push(
    new Paragraph({
      text: '2. Analisi di Materialità',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Risultati della valutazione di doppia materialità per ogni standard ESRS. Soglia: punteggio ≥ 3.0.', size: 22, color: '64748b', font: 'Calibri' })],
      spacing: { after: 200 },
    })
  );

  if (allAssessedStandards.length > 0) {
    const matRows = [
      new TableRow({
        children: [
          headerCell('Codice', 15),
          headerCell('Standard', 30),
          headerCell('Impatto', 15),
          headerCell('Finanziario', 15),
          headerCell('Materiale', 15),
        ],
      }),
    ];

    allAssessedStandards.forEach((std, idx) => {
      const normalizedCode = normalizeStandardCode(std.standard_code);
      const displayCode =
        ESRS_STANDARDS.find((s) => normalizeStandardCode(s.code) === normalizedCode)?.code || std.standard_code;
      const displayName =
        ESRS_STANDARDS.find((s) => normalizeStandardCode(s.code) === normalizedCode)?.name || std.topic_name || '';
      const isMat = std.is_material;
      const shade = idx % 2 === 1;

      matRows.push(
        new TableRow({
          children: [
            cell(displayCode, { bold: true, shading: shade }),
            cell(displayName, { shading: shade }),
            cell(String(std.impact_score ?? '—'), { shading: shade }),
            cell(String(std.financial_score ?? '—'), { shading: shade }),
            cell(isMat ? 'Sì' : 'No', {
              bold: true,
              color: isMat ? '16a34a' : 'dc2626',
              shading: shade,
            }),
          ],
        })
      );
    });

    sections.push(
      new Table({
        rows: matRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }) as any
    );
  } else {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Nessuno standard è stato ancora valutato.', italics: true, color: '94a3b8', size: 22, font: 'Calibri' })],
      })
    );
  }

  sections.push(new Paragraph({ spacing: { after: 400 } }));

  // --- SEZIONE 3: DATI RACCOLTI ---
  sections.push(
    new Paragraph({
      text: '3. Dati Raccolti',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Valori inseriti per ogni datapoint, raggruppati per standard materiale.', size: 22, color: '64748b', font: 'Calibri' })],
      spacing: { after: 200 },
    })
  );

  if (materialStandards.length === 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Nessuno standard materiale identificato. Non sono presenti dati da riportare.', italics: true, color: '94a3b8', size: 22, font: 'Calibri' })],
      })
    );
  } else {
    materialStandards.forEach((std) => {
      const normalizedStdCode = normalizeStandardCode(std.standard_code);
      const displayCode =
        ESRS_STANDARDS.find((s) => normalizeStandardCode(s.code) === normalizedStdCode)?.code || std.standard_code;
      const displayName =
        ESRS_STANDARDS.find((s) => normalizeStandardCode(s.code) === normalizedStdCode)?.name || std.topic_name || '';

      sections.push(
        new Paragraph({
          text: `${displayCode} — ${displayName}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );

      // Trova i datapoint del catalogo per questo standard
      const stdDatapoints = activeDatapoints.filter(
        (dp) => dp.standard_code && normalizeStandardCode(dp.standard_code) === normalizedStdCode
      );

      // Trova i dati inseriti per questi datapoint
      const filledDatapoints = stdDatapoints
        .map((dp) => {
          const saved = dbDataPoints.find(
            (entry) => entry.catalog_id === dp.id || entry.code === dp.datapoint_code
          );
          return { ...dp, savedValue: saved?.value, savedEvidence: saved?.evidence_url, savedStatus: saved?.status };
        })
        .filter((dp) => dp.savedValue);

      if (filledDatapoints.length === 0) {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: 'Nessun dato inserito per questo standard.', italics: true, color: '94a3b8', size: 20, font: 'Calibri' })],
            spacing: { after: 200 },
          })
        );
      } else {
        const dataRows = [
          new TableRow({
            children: [
              headerCell('Codice', 18),
              headerCell('Descrizione', 37),
              headerCell('Valore', 20),
              headerCell('Tipo', 15),
              headerCell('Stato', 10),
            ],
          }),
        ];

        filledDatapoints.forEach((dp, idx) => {
          const shade = idx % 2 === 1;
          const statusColor =
            dp.savedStatus === 'Approved' ? '16a34a' : dp.savedStatus === 'Rejected' ? 'dc2626' : 'd97706';
          dataRows.push(
            new TableRow({
              children: [
                cell(dp.datapoint_code, { bold: true, shading: shade }),
                cell((dp.label || '').substring(0, 120), { shading: shade }),
                cell(dp.savedValue, { bold: true, shading: shade }),
                cell(dp.data_type || '—', { shading: shade }),
                cell(dp.savedStatus || 'In Progress', { bold: true, color: statusColor, shading: shade }),
              ],
            })
          );
        });

        sections.push(
          new Table({
            rows: dataRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }) as any
        );
        sections.push(new Paragraph({ spacing: { after: 200 } }));
      }
    });
  }

  sections.push(new Paragraph({ spacing: { after: 200 } }));

  // --- SEZIONE 4: STATO AUDIT ---
  sections.push(
    new Paragraph({
      text: '4. Stato Audit',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Stato di revisione di tutti i dati inseriti nella piattaforma.', size: 22, color: '64748b', font: 'Calibri' })],
      spacing: { after: 200 },
    })
  );

  if (dbDataPoints.length === 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Nessun dato presente nel sistema di audit.', italics: true, color: '94a3b8', size: 22, font: 'Calibri' })],
      })
    );
  } else {
    const auditRows = [
      new TableRow({
        children: [
          headerCell('Data', 15),
          headerCell('Codice', 15),
          headerCell('Valore', 35),
          headerCell('Stato', 15),
          headerCell('Evidenza', 20),
        ],
      }),
    ];

    dbDataPoints.forEach((row, idx) => {
      const shade = idx % 2 === 1;
      const statusColor =
        row.status === 'Approved' ? '16a34a' : row.status === 'Rejected' ? 'dc2626' : 'd97706';
      auditRows.push(
        new TableRow({
          children: [
            cell(row.updated_at ? new Date(row.updated_at).toLocaleDateString('it-IT') : '—', { shading: shade }),
            cell(row.code, { bold: true, shading: shade }),
            cell((row.value || '').substring(0, 80), { shading: shade }),
            cell(row.status || 'In Progress', { bold: true, color: statusColor, shading: shade }),
            cell(row.evidence_url ? 'Allegata' : 'Mancante', {
              color: row.evidence_url ? '16a34a' : 'dc2626',
              shading: shade,
            }),
          ],
        })
      );
    });

    sections.push(
      new Table({
        rows: auditRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }) as any
    );
  }

  sections.push(new Paragraph({ spacing: { after: 400 } }));

  // --- SEZIONE 5: EVIDENZE ---
  sections.push(
    new Paragraph({
      text: '5. Registro Evidenze',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Elenco dei documenti di evidenza allegati ai datapoint.', size: 22, color: '64748b', font: 'Calibri' })],
      spacing: { after: 200 },
    })
  );

  const evidences = dbDataPoints.filter((d) => d.evidence_url);
  if (evidences.length === 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Nessuna evidenza caricata.', italics: true, color: '94a3b8', size: 22, font: 'Calibri' })],
      })
    );
  } else {
    const evRows = [
      new TableRow({
        children: [
          headerCell('Codice Datapoint', 25),
          headerCell('Valore', 30),
          headerCell('URL Evidenza', 45),
        ],
      }),
    ];

    evidences.forEach((row, idx) => {
      const shade = idx % 2 === 1;
      evRows.push(
        new TableRow({
          children: [
            cell(row.code, { bold: true, shading: shade }),
            cell((row.value || '').substring(0, 60), { shading: shade }),
            cell(row.evidence_url, { color: '2563eb', shading: shade }),
          ],
        })
      );
    });

    sections.push(
      new Table({
        rows: evRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }) as any
    );
  }

  // --- FOOTER ---
  sections.push(
    new Paragraph({ spacing: { after: 600 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: '— Fine del Report —',
          size: 20,
          color: '94a3b8',
          italics: true,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Documento generato automaticamente dalla piattaforma ESRS Compliance. Questa è una bozza soggetta a revisione.',
          size: 18,
          color: 'cbd5e1',
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  // ============================================================
  // COMPOSIZIONE DOCUMENTO
  // ============================================================

  const doc = new Document({
    creator: userName,
    title: 'Report ESRS - Bozza',
    description: 'Bozza di report di compliance ESRS generata dalla piattaforma',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '334155' },
        },
        heading1: {
          run: { font: 'Calibri', size: 32, bold: true, color: '1e3a5f' },
        },
        heading2: {
          run: { font: 'Calibri', size: 26, bold: true, color: '334155' },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        children: sections,
      },
    ],
  });

  return Packer.toBlob(doc);
}
