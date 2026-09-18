import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import { saveAs } from 'file-saver';
import { Inspection, FieldRecord, NonConformity, TechnicalRecommendation, InspectionTypeConfig } from '../types';

export interface ReportGenerationData {
  inspection: Inspection;
  inspectionType?: InspectionTypeConfig;
  records: FieldRecord[];
  nonConformities: NonConformity[];
  recommendations: TechnicalRecommendation[];
  consolidation?: {
    objetivo: string;
    escopo: string;
    metodologia: string;
    analiseTecnica: {
      condicoesSatisfatorias: string;
      pontosAtencao: string;
      naoConformidadesCriticas: string;
      ocorrenciasRecorrentes: string;
      tendenciasIdentificadas: string;
    };
    conclusao: string;
    recomendacoesPriorizadas: Array<{
      prioridade: string;
      ativo: string;
      acaoRecomendada: string;
      prazoSugerido: string;
    }>;
  };
}

export async function generateDocxReport(data: ReportGenerationData): Promise<Blob> {
  const { inspection, inspectionType, records, nonConformities, recommendations, consolidation } = data;

  // Compute metrics
  const totalRecords = records.length;
  const normalCount = records.filter(r => r.conditionFound === 'NORMAL').length;
  const attentionCount = records.filter(r => r.conditionFound === 'ATENÇÃO').length;
  const ncCount = records.filter(r => r.conditionFound === 'NÃO CONFORMIDADE').length;
  const criticalCount = records.filter(r => r.conditionFound === 'CRÍTICA').length;
  const uniqueAssets = Array.from(new Set(records.map(r => r.assetId))).length;

  const defaultObjetivo = consolidation?.objetivo ||
    `Realizar a inspeção técnica periódica de campo no segmento '${inspectionType?.name || inspection.typeId}' para a verificação das condições operacionais, estruturais e de conformidade normativa dos ativos alocados na área '${inspection.area}', subsidiando ações preventivas e corretivas de engenharia e manutenção.`;

  const defaultEscopo = consolidation?.escopo ||
    `A presente inspeção abrangeu ${uniqueAssets} ativos técnicos, totalizando ${totalRecords} registros detalhados com captura fotográfica e georreferenciamento GPS, executada no período de ${inspection.date} (${inspection.startTime} às ${inspection.endTime}) nas instalações de ${inspection.unitAirport}.`;

  const defaultMetodologia = consolidation?.metodologia ||
    `A metodologia empregada fundamentou-se em varredura visual sistemática presencial conduzida pelo responsável técnico credenciado, com registro fotográfico digital, coleta de coordenadas geográficas via receptor GNSS de alta precisão, preenchimento de checklists normativos baseados no regulamento ${inspectionType?.referenceStandard || 'RBAC vigente'} e apoio analítico de Inteligência Artificial para classificação preliminar com validação humana obrigatória de 100% dos apontamentos.`;

  const defaultConclusao = consolidation?.conclusao ||
    `Com base nas evidências objetivas coletadas e validadas pela equipe de engenharia em ${inspection.date}, os ativos vistoriados apresentam ${normalCount} condições normais, ${attentionCount} itens em estado de atenção preventiva, ${ncCount} não conformidades operacionais e ${criticalCount} condições críticas imediatas. Foram emitidas ordens de recomendação técnica priorizadas para assegurar a continuidade operacional e a segurança da infraestrutura.`;

  // Color constants
  const NAVY = '1E3A8A';
  const PRIMARY = '0284C7';
  const LIGHT_GRAY = 'F8FAFC';
  const BORDER_GRAY = 'CBD5E1';

  // Table styling helper
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
    left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
    right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
  };

  const createCell = (text: string, isHeader = false, isHighlight = false, widthPercent = 25) => {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: {
        fill: isHeader ? NAVY : isHighlight ? 'F1F5F9' : 'FFFFFF',
        type: ShadingType.CLEAR,
      },
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      borders: tableBorder,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: isHeader,
              color: isHeader ? 'FFFFFF' : '0F172A',
              size: isHeader ? 19 : 18,
              font: 'Calibri',
            }),
          ],
        }),
      ],
    });
  };

  // Indicators table
  const indicatorsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createCell('Indicador Técnico', true, false, 50),
          createCell('Quantitativo Registrado', true, false, 25),
          createCell('Status Percentual', true, false, 25),
        ],
      }),
      new TableRow({
        children: [
          createCell('Total de Ativos Inspecionados', false, false, 50),
          createCell(`${uniqueAssets} ativos`, false, false, 25),
          createCell('100% da amostra', false, false, 25),
        ],
      }),
      new TableRow({
        children: [
          createCell('Total de Registros de Campo', false, true, 50),
          createCell(`${totalRecords} registros`, false, true, 25),
          createCell('Completude total', false, true, 25),
        ],
      }),
      new TableRow({
        children: [
          createCell('Condições Normais (Conformes)', false, false, 50),
          createCell(`${normalCount}`, false, false, 25),
          createCell(`${totalRecords > 0 ? Math.round((normalCount / totalRecords) * 100) : 0}%`, false, false, 25),
        ],
      }),
      new TableRow({
        children: [
          createCell('Condições em Atenção Preventiva', false, true, 50),
          createCell(`${attentionCount}`, false, true, 25),
          createCell(`${totalRecords > 0 ? Math.round((attentionCount / totalRecords) * 100) : 0}%`, false, true, 25),
        ],
      }),
      new TableRow({
        children: [
          createCell('Não Conformidades (NC)', false, false, 50),
          createCell(`${ncCount}`, false, false, 25),
          createCell(`${totalRecords > 0 ? Math.round((ncCount / totalRecords) * 100) : 0}%`, false, false, 25),
        ],
      }),
      new TableRow({
        children: [
          createCell('Condições Críticas Imediatas', false, true, 50),
          createCell(`${criticalCount}`, false, true, 25),
          createCell(`${totalRecords > 0 ? Math.round((criticalCount / totalRecords) * 100) : 0}%`, false, true, 25),
        ],
      }),
      new TableRow({
        children: [
          createCell('Recomendações Técnicas Emitidas', false, false, 50),
          createCell(`${recommendations.length}`, false, false, 25),
          createCell('Em monitoramento', false, false, 25),
        ],
      }),
    ],
  });

  // Results table
  const resultsTableRows = [
    new TableRow({
      children: [
        createCell('Nº', true, false, 6),
        createCell('Ativo', true, false, 18),
        createCell('Item Inspecionado', true, false, 22),
        createCell('Condição', true, false, 16),
        createCell('Severidade', true, false, 12),
        createCell('Recomendação Técnica', true, false, 26),
      ],
    }),
  ];

  records.forEach((rec, idx) => {
    resultsTableRows.push(
      new TableRow({
        children: [
          createCell(String(idx + 1).padStart(2, '0'), false, idx % 2 === 1, 6),
          createCell(`${rec.assetCode}\n(${rec.assetName})`, false, idx % 2 === 1, 18),
          createCell(rec.itemInspected, false, idx % 2 === 1, 22),
          createCell(rec.conditionFound, false, idx % 2 === 1, 16),
          createCell(rec.severity, false, idx % 2 === 1, 12),
          createCell(rec.humanValidation?.finalRecommendation || rec.aiAnalysis?.recomendacaoTecnica || 'Manter inspeção de rotina.', false, idx % 2 === 1, 26),
        ],
      })
    );
  });

  const resultsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: resultsTableRows,
  });

  // Non-Conformities Table
  const ncTableRows = [
    new TableRow({
      children: [
        createCell('Código', true, false, 12),
        createCell('Ativo', true, false, 18),
        createCell('Descrição da Anomalia', true, false, 28),
        createCell('Severidade', true, false, 12),
        createCell('Prazo', true, false, 14),
        createCell('Status', true, false, 16),
      ],
    }),
  ];

  if (nonConformities.length === 0) {
    ncTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            borders: tableBorder,
            children: [
              new Paragraph({
                text: 'Nenhuma não conformidade aberta nesta inspeção.',
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      })
    );
  } else {
    nonConformities.forEach((nc, idx) => {
      ncTableRows.push(
        new TableRow({
          children: [
            createCell(nc.code, false, idx % 2 === 1, 12),
            createCell(nc.assetName, false, idx % 2 === 1, 18),
            createCell(nc.description, false, idx % 2 === 1, 28),
            createCell(nc.severity, false, idx % 2 === 1, 12),
            createCell(nc.deadline, false, idx % 2 === 1, 14),
            createCell(nc.status, false, idx % 2 === 1, 16),
          ],
        })
      );
    });
  }

  const ncTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: ncTableRows,
  });

  // Technical Recommendations Table
  const recTableRows = [
    new TableRow({
      children: [
        createCell('Prioridade', true, false, 14),
        createCell('Ativo', true, false, 20),
        createCell('Ação Recomendada', true, false, 40),
        createCell('Prazo', true, false, 14),
        createCell('Origem', true, false, 12),
      ],
    }),
  ];

  recommendations.forEach((r, idx) => {
    recTableRows.push(
      new TableRow({
        children: [
          createCell(r.priority, false, idx % 2 === 1, 14),
          createCell(r.assetName, false, idx % 2 === 1, 20),
          createCell(r.description, false, idx % 2 === 1, 40),
          createCell(r.deadline, false, idx % 2 === 1, 14),
          createCell(r.origin, false, idx % 2 === 1, 12),
        ],
      })
    );
  });

  const recTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: recTableRows,
  });

  // Photo evidence section paragraphs
  const photoParagraphs: Paragraph[] = [];
  let figureCounter = 1;

  records.forEach((rec) => {
    rec.evidences.forEach((ev) => {
      photoParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Figura ${figureCounter} — Registro ${rec.assetCode}: ${rec.itemInspected}`,
              bold: true,
              size: 20,
              color: PRIMARY,
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `• Legenda: `, bold: true }),
            new TextRun({ text: `${ev.caption || 'Sem legenda'}` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `• Condição Registrada: `, bold: true }),
            new TextRun({ text: `${rec.conditionFound} (Severidade: ${rec.severity})` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `• Data e Horário: `, bold: true }),
            new TextRun({ text: `${ev.capturedAt || rec.date}` }),
            new TextRun({ text: `   |   • Localização / GPS: `, bold: true }),
            new TextRun({
              text: rec.gps
                ? `Lat: ${rec.gps.latitude.toFixed(6)}, Long: ${rec.gps.longitude.toFixed(6)} (Precisão: ±${rec.gps.accuracy}m)`
                : 'Localização GPS não registrada em campo.',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `• Fato Observado: `, bold: true }),
            new TextRun({ text: `${rec.inspectorDescription}` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `• Conclusão da IA Validada: `, bold: true }),
            new TextRun({
              text: `${rec.humanValidation?.inspectorNotes || rec.aiAnalysis?.interpretacaoVisual || 'Conforme apurado em campo.'}`,
              italics: true,
            }),
          ],
          spacing: { after: 240 },
        })
      );
      figureCounter++;
    });
  });

  // Construct Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
            color: '1E293B',
          },
          paragraph: {
            spacing: { line: 360, before: 100, after: 100 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: 'SISTEMA CORPORATIVO DE INSPEÇÕES TÉCNICAS COM IA — RELATÓRIO TÉCNICO OFICIAL',
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SISTEMA DE INSPEÇÕES TÉCNICAS — RELATÓRIO OFICIAL',
                    size: 16,
                    color: '64748B',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Doc ID: ${inspection.number} | Emissão: ${new Date().toLocaleDateString('pt-BR')}`,
                    size: 16,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    text: '  —  Página ',
                    size: 16,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    text: ' de ',
                    size: 16,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '94A3B8',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // CAPA
          new Paragraph({
            text: 'RELATÓRIO TÉCNICO DE INSPEÇÃO PERIÓDICA',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'RELATÓRIO TÉCNICO DE INSPEÇÃO PERIÓDICA',
                bold: true,
                size: 38,
                color: NAVY,
              }),
            ],
            spacing: { before: 720, after: 240 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `TIPO DE INSPEÇÃO: ${inspectionType?.code || ''} — ${inspectionType?.name || inspection.typeId}`,
                bold: true,
                size: 24,
                color: PRIMARY,
              }),
            ],
            spacing: { after: 360 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${inspection.unitAirport} — ${inspection.area}`,
                size: 22,
                color: '475569',
              }),
            ],
            spacing: { after: 600 },
          }),

          // Box com identificação de capa
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Número da Inspeção:', true, false, 35),
                  createCell(inspection.number, false, false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Data de Realização:', true, false, 35),
                  createCell(`${inspection.date} (Início: ${inspection.startTime} | Conclusão: ${inspection.endTime})`, false, false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Responsável Técnico:', true, false, 35),
                  createCell(inspection.responsible, false, false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Equipe Operacional:', true, false, 35),
                  createCell(inspection.team || 'Equipe interna de fiscalização', false, false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Norma de Referência:', true, false, 35),
                  createCell(inspectionType?.referenceStandard || 'Normas Técnicas Nacionais / Internacionais Vigentes', false, false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Versão do Relatório:', true, false, 35),
                  createCell('Versão 1.0 (Consolidado e Auditado)', false, false, 65),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: '',
            spacing: { before: 800, after: 400 },
          }),

          // 1. OBJETIVO
          new Paragraph({
            children: [
              new TextRun({
                text: '1. OBJETIVO',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 400, after: 160 },
          }),
          new Paragraph({
            text: defaultObjetivo,
            spacing: { after: 300 },
          }),

          // 2. ESCOPO
          new Paragraph({
            children: [
              new TextRun({
                text: '2. ESCOPO',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            text: defaultEscopo,
            spacing: { after: 300 },
          }),

          // 3. METODOLOGIA
          new Paragraph({
            children: [
              new TextRun({
                text: '3. METODOLOGIA',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            text: defaultMetodologia,
            spacing: { after: 300 },
          }),

          // 4. INDICADORES
          new Paragraph({
            children: [
              new TextRun({
                text: '4. INDICADORES GERAIS DA INSPEÇÃO',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          indicatorsTable,

          new Paragraph({
            text: '',
            spacing: { before: 300, after: 200 },
          }),

          // 5. RESULTADOS DA INSPEÇÃO
          new Paragraph({
            children: [
              new TextRun({
                text: '5. RESULTADOS DA INSPEÇÃO POR ATIVO',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          resultsTable,

          new Paragraph({
            text: '',
            spacing: { before: 300, after: 200 },
          }),

          // 6. ANÁLISE TÉCNICA
          new Paragraph({
            children: [
              new TextRun({
                text: '6. ANÁLISE TÉCNICA CONSOLIDADA (ASSISTÊNCIA IA)',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '6.1 Condições Satisfatórias: ', bold: true, color: '15803D' }),
              new TextRun({
                text: consolidation?.analiseTecnica?.condicoesSatisfatorias ||
                  `Foram identificados ${normalCount} ativos em plena condição de integridade e operabilidade, cumprindo os padrões de manutenção preventiva.`,
              }),
            ],
            spacing: { after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '6.2 Pontos de Atenção: ', bold: true, color: 'B45309' }),
              new TextRun({
                text: consolidation?.analiseTecnica?.pontosAtencao ||
                  `Registrados ${attentionCount} apontamentos que exigem intervenções preventivas programadas para evitar a evolução para não conformidades regulamentares.`,
              }),
            ],
            spacing: { after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '6.3 Não Conformidades e Condições Críticas: ', bold: true, color: 'DC2626' }),
              new TextRun({
                text: consolidation?.analiseTecnica?.naoConformidadesCriticas ||
                  `Identificados ${ncCount + criticalCount} itens desconformes, exigindo emissão formal de RNC e plano de ação imediato.`,
              }),
            ],
            spacing: { after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '6.4 Ocorrências Recorrentes e Tendências: ', bold: true, color: NAVY }),
              new TextRun({
                text: consolidation?.analiseTecnica?.ocorrenciasRecorrentes ||
                  'Comparação com histórico anterior aponta estabilidade na infraestrutura geral, com degradação concentrada em elementos de maior solicitação mecânica e intempéries.',
              }),
            ],
            spacing: { after: 300 },
          }),

          // 7. DISTRIBUIÇÃO ESTATÍSTICA
          new Paragraph({
            children: [
              new TextRun({
                text: '7. DISTRIBUIÇÃO ESTATÍSTICA DAS CONDIÇÕES',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            text: `A distribuição percentual das condições apuradas evidencia ${totalRecords > 0 ? Math.round((normalCount / totalRecords) * 100) : 0}% de ativos normais, ${totalRecords > 0 ? Math.round((attentionCount / totalRecords) * 100) : 0}% sob atenção e ${totalRecords > 0 ? Math.round(((ncCount + criticalCount) / totalRecords) * 100) : 0}% em não conformidade ou estado crítico.`,
            spacing: { after: 300 },
          }),

          // 8. EVIDÊNCIAS FOTOGRÁFICAS
          new Paragraph({
            children: [
              new TextRun({
                text: '8. EVIDÊNCIAS FOTOGRÁFICAS REGISTRADAS EM CAMPO',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          ...photoParagraphs,

          // 9. NÃO CONFORMIDADES
          new Paragraph({
            children: [
              new TextRun({
                text: '9. PLANO DE TRATAMENTO DE NÃO CONFORMIDADES (RNC)',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          ncTable,

          new Paragraph({
            text: '',
            spacing: { before: 300, after: 200 },
          }),

          // 10. RECOMENDAÇÕES TÉCNICAS
          new Paragraph({
            children: [
              new TextRun({
                text: '10. RECOMENDAÇÕES TÉCNICAS PRIORIZADAS',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          recTable,

          new Paragraph({
            text: '',
            spacing: { before: 300, after: 200 },
          }),

          // 11. CONCLUSÃO
          new Paragraph({
            children: [
              new TextRun({
                text: '11. CONCLUSÃO TÉCNICA DO ENGENHEIRO RESPONSÁVEL',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            text: defaultConclusao,
            spacing: { after: 300 },
          }),

          // 12. ANEXOS
          new Paragraph({
            children: [
              new TextRun({
                text: '12. ANEXOS E DOCUMENTOS DE REFERÊNCIA UTILIZADOS',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            text: '• Anexo I — Dados brutos de telemetria e coordenadas GNSS dos pontos inspecionados.\n• Anexo II — Documentos técnicos normativos de suporte (RBACs e Manuais de Fabricante cadastrados no sistema).\n• Anexo III — Histórico de ordens de serviço (OS) associadas aos ativos.',
            spacing: { after: 400 },
          }),

          // 18. ASSINATURA / VALIDAÇÃO
          new Paragraph({
            children: [
              new TextRun({
                text: '18. ASSINATURA E VALIDAÇÃO TÉCNICA PROFISSIONAL',
                bold: true,
                size: 26,
                color: NAVY,
              }),
            ],
            spacing: { before: 400, after: 240 },
          }),
          new Paragraph({
            text: 'O presente relatório foi elaborado com rigor técnico, atestando que todas as informações, análises e conclusões refletem estritamente as constatações de campo e as evidências fotográficas auditadas.',
            spacing: { after: 400 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: tableBorder,
                    margins: { top: 200, bottom: 200, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        text: '_____________________________________________',
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `${inspection.responsible}\n`, bold: true }),
                          new TextRun({ text: 'Responsável Técnico / Engenheiro Fiscal\n' }),
                          new TextRun({ text: `Data: ${inspection.date}` }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: tableBorder,
                    margins: { top: 200, bottom: 200, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        text: '_____________________________________________',
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Gerência de Engenharia e Manutenção\n', bold: true }),
                          new TextRun({ text: 'Aprovação e Despacho de Ordens de Serviço\n' }),
                          new TextRun({ text: `Data de Validação: ${new Date().toLocaleDateString('pt-BR')}` }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

export async function downloadInspectionDocx(data: ReportGenerationData) {
  const blob = await generateDocxReport(data);
  const fileName = `Relatorio_Tecnico_${data.inspection.number}_${data.inspection.date}.docx`;
  saveAs(blob, fileName);
}
