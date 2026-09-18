import {
  Inspection,
  FieldRecord,
  Asset,
  InspectionTypeConfig,
  ReferenceDocument,
  NonConformity,
  TechnicalRecommendation,
  GeneratedReport,
} from '../types';
import {
  INITIAL_INSPECTIONS,
  INITIAL_RECORDS,
  INITIAL_ASSETS,
  INITIAL_INSPECTION_TYPES,
  INITIAL_DOCUMENTS,
  INITIAL_NON_CONFORMITIES,
  INITIAL_RECOMMENDATIONS,
} from '../data/initialData';

const KEYS = {
  INSPECTIONS: 'sit_ia_inspections',
  RECORDS: 'sit_ia_records',
  ASSETS: 'sit_ia_assets',
  TYPES: 'sit_ia_types',
  DOCUMENTS: 'sit_ia_documents',
  NON_CONFORMITIES: 'sit_ia_non_conformities',
  RECOMMENDATIONS: 'sit_ia_recommendations',
  REPORTS: 'sit_ia_reports',
  CURRENT_USER: 'sit_ia_current_user',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

export const StorageService = {
  getInspections: (): Inspection[] => safeGet<Inspection[]>(KEYS.INSPECTIONS, INITIAL_INSPECTIONS),
  saveInspections: (data: Inspection[]) => safeSet(KEYS.INSPECTIONS, data),

  getRecords: (): FieldRecord[] => safeGet<FieldRecord[]>(KEYS.RECORDS, INITIAL_RECORDS),
  saveRecords: (data: FieldRecord[]) => safeSet(KEYS.RECORDS, data),

  getAssets: (): Asset[] => safeGet<Asset[]>(KEYS.ASSETS, INITIAL_ASSETS),
  saveAssets: (data: Asset[]) => safeSet(KEYS.ASSETS, data),

  getInspectionTypes: (): InspectionTypeConfig[] => safeGet<InspectionTypeConfig[]>(KEYS.TYPES, INITIAL_INSPECTION_TYPES),
  saveInspectionTypes: (data: InspectionTypeConfig[]) => safeSet(KEYS.TYPES, data),

  getDocuments: (): ReferenceDocument[] => safeGet<ReferenceDocument[]>(KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  saveDocuments: (data: ReferenceDocument[]) => safeSet(KEYS.DOCUMENTS, data),

  getNonConformities: (): NonConformity[] => safeGet<NonConformity[]>(KEYS.NON_CONFORMITIES, INITIAL_NON_CONFORMITIES),
  saveNonConformities: (data: NonConformity[]) => safeSet(KEYS.NON_CONFORMITIES, data),

  getRecommendations: (): TechnicalRecommendation[] => safeGet<TechnicalRecommendation[]>(KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS),
  saveRecommendations: (data: TechnicalRecommendation[]) => safeSet(KEYS.RECOMMENDATIONS, data),

  getReports: (): GeneratedReport[] => safeGet<GeneratedReport[]>(KEYS.REPORTS, []),
  saveReports: (data: GeneratedReport[]) => safeSet(KEYS.REPORTS, data),

  resetToInitial: () => {
    safeSet(KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
    safeSet(KEYS.RECORDS, INITIAL_RECORDS);
    safeSet(KEYS.ASSETS, INITIAL_ASSETS);
    safeSet(KEYS.TYPES, INITIAL_INSPECTION_TYPES);
    safeSet(KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    safeSet(KEYS.NON_CONFORMITIES, INITIAL_NON_CONFORMITIES);
    safeSet(KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
    safeSet(KEYS.REPORTS, []);
  },
};
