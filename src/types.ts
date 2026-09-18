export type ConditionClassification = 'NORMAL' | 'ATENÇÃO' | 'NÃO CONFORMIDADE' | 'CRÍTICA';
export type SeverityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type ConfidenceRating = 'Alta' | 'Média' | 'Baixa';
export type RecordStatus = 'Rascunho' | 'Em Análise IA' | 'Revisado' | 'Aprovado' | 'Rejeitado';
export type InspectionStatus = 'Em Andamento' | 'Concluída' | 'Aprovada';
export type NCStatus = 'Aberta' | 'Em análise' | 'Em tratamento' | 'Resolvida' | 'Encerrada';

export interface InspectionTypeConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  scopeItems: string[];
  referenceStandard: string;
  iconName: string;
  color: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  typeId: string; // references InspectionTypeConfig.id
  area: string;
  locationDetails: string;
  latitude?: number;
  longitude?: number;
  status: 'Ativo' | 'Em Manutenção' | 'Interditado';
  lastInspectionDate?: string;
  manufacturer?: string;
  installationYear?: number;
  notes?: string;
}

export interface GPSCoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface PhotoEvidence {
  id: string;
  type: 'geral' | 'antes' | 'depois' | 'detalhe';
  url: string; // data URL or path
  caption: string;
  observation?: string;
  capturedAt: string;
  gps?: GPSCoordinate;
}

export interface AIAnalysisResult {
  itemIdentificado: string;
  condicaoVisual: string;
  anomaliaIdentificada: string;
  classificacaoSugerida: ConditionClassification;
  severidadeSugerida: SeverityLevel;
  nivelConfiancaPercentual: number;
  nivelConfiancaClassificacao: ConfidenceRating;
  fatosObservados: string[];
  interpretacaoVisual: string;
  possivelCausa: string;
  recomendacaoTecnica: string;
  necessidadeAvaliacaoComplementar: boolean;
  justificativaAvaliacaoComplementar?: string;
  comparacaoHistorica: string;
  fontesUtilizadas: string[];
  analyzedAt: string;
}

export interface HumanValidation {
  status: 'Aprovado' | 'Alterado' | 'Rejeitado';
  validatedBy: string;
  validatedAt: string;
  originalAIClassification?: ConditionClassification;
  finalClassification: ConditionClassification;
  finalSeverity: SeverityLevel;
  finalRecommendation: string;
  inspectorNotes?: string;
}

export interface FieldRecord {
  id: string;
  inspectionId: string;
  inspectionNumber: string;
  inspectionTypeId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  area: string;
  location: string;
  gps: GPSCoordinate | null;
  date: string;
  time: string;
  responsible: string;
  itemInspected: string;
  conditionFound: ConditionClassification;
  inspectorDescription: string;
  observations?: string;
  severity: SeverityLevel;
  status: RecordStatus;
  workOrderNumber?: string;
  instrumentalData?: string;
  evidences: PhotoEvidence[];
  aiAnalysis?: AIAnalysisResult;
  humanValidation?: HumanValidation;
}

export interface Inspection {
  id: string;
  number: string;
  typeId: string;
  unitAirport: string;
  area: string;
  date: string;
  startTime: string;
  endTime: string;
  responsible: string;
  team: string;
  generalNotes?: string;
  status: InspectionStatus;
  createdAt: string;
  recordIds: string[];
}

export interface ReferenceDocument {
  id: string;
  title: string;
  fileName: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'TXT' | 'IMG';
  category: 'Norma Técnica' | 'Manual de Fabricante' | 'Procedimento Operacional' | 'Planta / Desenho' | 'Checklist Padrão' | 'Relatório Anterior';
  scope: 'Geral' | 'Tipo de Inspeção' | 'Ativo Específico' | 'Inspeção';
  scopeTargetId?: string;
  scopeTargetName?: string;
  summary: string;
  uploadDate: string;
  fileSize: string;
  isUsedByAI: boolean;
}

export interface NonConformity {
  id: string;
  code: string;
  inspectionId: string;
  inspectionNumber: string;
  recordId?: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  date: string;
  description: string;
  evidenceThumbnail?: string;
  classification: ConditionClassification;
  severity: SeverityLevel;
  responsible: string;
  recommendation: string;
  deadline: string;
  status: NCStatus;
  closureDate?: string;
  closureEvidence?: string;
}

export interface TechnicalRecommendation {
  id: string;
  inspectionId: string;
  recordId?: string;
  assetName: string;
  description: string;
  priority: SeverityLevel;
  deadline: string;
  responsible: string;
  status: 'Pendente' | 'Em Andamento' | 'Implementada';
  origin: 'IA' | 'Inspetor';
}

export interface GeneratedReport {
  id: string;
  inspectionId: string;
  inspectionNumber: string;
  inspectionType: string;
  title: string;
  airportUnit: string;
  area: string;
  period: string;
  responsible: string;
  team: string;
  documentId: string;
  issueDate: string;
  version: string;
  consolidation: {
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
  metrics: {
    totalAssets: number;
    inspectedAssets: number;
    totalRecords: number;
    normalCount: number;
    attentionCount: number;
    nonConformityCount: number;
    criticalCount: number;
    recommendationsCount: number;
    openNCount: number;
  };
}
