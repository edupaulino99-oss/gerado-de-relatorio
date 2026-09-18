import React, { useState, useEffect } from 'react';
import { StorageService } from './utils/storage';
import {
  Inspection,
  FieldRecord,
  Asset,
  InspectionTypeConfig,
  ReferenceDocument,
  NonConformity,
  TechnicalRecommendation,
  GeneratedReport,
} from './types';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Views
import { DashboardView } from './components/DashboardView';
import { NewInspectionView } from './components/NewInspectionView';
import { InspectionsListView } from './components/InspectionsListView';
import { InspectionDetailView } from './components/InspectionDetailView';
import { FieldRecordView } from './components/FieldRecordView';
import { AIAnalysisView } from './components/AIAnalysisView';
import { AssetsView } from './components/AssetsView';
import { ReferenceDocsView } from './components/ReferenceDocsView';
import { NonConformitiesView } from './components/NonConformitiesView';
import { RecommendationsView } from './components/RecommendationsView';
import { ReportsView } from './components/ReportsView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // State loaded from StorageService
  const [inspections, setInspections] = useState<Inspection[]>(() => StorageService.getInspections());
  const [records, setRecords] = useState<FieldRecord[]>(() => StorageService.getRecords());
  const [assets, setAssets] = useState<Asset[]>(() => StorageService.getAssets());
  const [types, setTypes] = useState<InspectionTypeConfig[]>(() => StorageService.getInspectionTypes());
  const [documents, setDocuments] = useState<ReferenceDocument[]>(() => StorageService.getDocuments());
  const [nonConformities, setNonConformities] = useState<NonConformity[]>(() => StorageService.getNonConformities());
  const [recommendations, setRecommendations] = useState<TechnicalRecommendation[]>(() => StorageService.getRecommendations());
  const [reports, setReports] = useState<GeneratedReport[]>(() => StorageService.getReports());

  // Navigation and UI state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    StorageService.saveInspections(inspections);
  }, [inspections]);

  useEffect(() => {
    StorageService.saveRecords(records);
  }, [records]);

  useEffect(() => {
    StorageService.saveAssets(assets);
  }, [assets]);

  useEffect(() => {
    StorageService.saveInspectionTypes(types);
  }, [types]);

  useEffect(() => {
    StorageService.saveDocuments(documents);
  }, [documents]);

  useEffect(() => {
    StorageService.saveNonConformities(nonConformities);
  }, [nonConformities]);

  useEffect(() => {
    StorageService.saveRecommendations(recommendations);
  }, [recommendations]);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleSaveInspection = (newInsp: Inspection) => {
    setInspections((prev) => [newInsp, ...prev]);
    setSelectedInspectionId(newInsp.id);
  };

  const handleUpdateInspectionStatus = (inspectionId: string, status: Inspection['status']) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === inspectionId ? { ...i, status } : i))
    );
  };

  const handleSaveRecord = (record: FieldRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });

    // Update inspection recordIds list
    setInspections((prev) =>
      prev.map((i) => {
        if (i.id === record.inspectionId && !i.recordIds.includes(record.id)) {
          return { ...i, recordIds: [...i.recordIds, record.id] };
        }
        return i;
      })
    );

    // If condition is Non-Conformity or Critical, automatically register in RNC table
    if (record.conditionFound === 'NÃO CONFORMIDADE' || record.conditionFound === 'CRÍTICA') {
      const existingNC = nonConformities.find((nc) => nc.recordId === record.id);
      if (!existingNC) {
        const newNC: NonConformity = {
          id: `nc-${Date.now()}`,
          code: `NC-${String(nonConformities.length + 1).padStart(3, '0')}`,
          inspectionId: record.inspectionId,
          inspectionNumber: record.inspectionNumber,
          recordId: record.id,
          assetId: record.assetId,
          assetCode: record.assetCode,
          assetName: record.assetName,
          date: record.date,
          description: record.inspectorDescription,
          evidenceThumbnail: record.evidences[0]?.url,
          classification: record.conditionFound,
          severity: record.severity,
          responsible: 'Equipe de Manutenção Corretiva',
          recommendation: record.humanValidation?.finalRecommendation || record.aiAnalysis?.recomendacaoTecnica || 'Inspeção e reparo prioritário.',
          deadline: '7 dias úteis',
          status: 'Aberta',
        };
        setNonConformities((prev) => [newNC, ...prev]);
      }
    }
  };

  const handleUpdateRecord = (updated: FieldRecord) => {
    handleSaveRecord(updated);
  };

  const handleSaveAsset = (newAsset: Asset) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleSaveDocument = (newDoc: ReferenceDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleUpdateNC = (updatedNC: NonConformity) => {
    setNonConformities((prev) =>
      prev.map((nc) => (nc.id === updatedNC.id ? updatedNC : nc))
    );
  };

  const handleUpdateRecommendation = (updatedRec: TechnicalRecommendation) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === updatedRec.id ? updatedRec : r))
    );
  };

  const handleSaveType = (newType: InspectionTypeConfig) => {
    setTypes((prev) => [...prev, newType]);
  };

  const handleResetData = () => {
    StorageService.resetToInitial();
    setInspections(StorageService.getInspections());
    setRecords(StorageService.getRecords());
    setAssets(StorageService.getAssets());
    setTypes(StorageService.getInspectionTypes());
    setDocuments(StorageService.getDocuments());
    setNonConformities(StorageService.getNonConformities());
    setRecommendations(StorageService.getRecommendations());
    setReports([]);
    setCurrentTab('dashboard');
  };

  // Counts for sidebar badges
  const openNCCount = nonConformities.filter(
    (nc) => nc.status !== 'Encerrada' && nc.status !== 'Resolvida'
  ).length;
  const pendingRecCount = recommendations.filter(
    (r) => r.status === 'Pendente' || r.status === 'Em Andamento'
  ).length;
  const activeInspectionCount = inspections.filter((i) => i.status === 'Em Andamento').length;

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || records[0];
  const selectedInspection =
    inspections.find((i) => i.id === selectedInspectionId) || inspections[0];

  return (
    <div className="flex h-screen bg-slate-100/70 overflow-hidden font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'inspecoes') {
            setSelectedInspectionId('');
          }
        }}
        openNCCount={openNCCount}
        pendingRecCount={pendingRecCount}
        activeInspectionCount={activeInspectionCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onQuickNewRecord={() => setCurrentTab('registro-campo')}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <DashboardView
              inspections={inspections}
              records={records}
              assets={assets}
              types={types}
              nonConformities={nonConformities}
              recommendations={recommendations}
              reports={reports}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onSelectInspection={(id) => {
                setSelectedInspectionId(id);
                setCurrentTab('inspecoes');
              }}
            />
          )}

          {/* TAB: NOVA INSPEÇÃO */}
          {currentTab === 'nova-inspecao' && (
            <NewInspectionView
              types={types}
              onSaveInspection={handleSaveInspection}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onSelectInspection={(id) => setSelectedInspectionId(id)}
            />
          )}

          {/* TAB: INSPEÇÕES (List or Detail) */}
          {currentTab === 'inspecoes' && (
            <>
              {selectedInspectionId ? (
                <InspectionDetailView
                  inspection={
                    inspections.find((i) => i.id === selectedInspectionId) || inspections[0]
                  }
                  types={types}
                  records={records}
                  nonConformities={nonConformities}
                  recommendations={recommendations}
                  onBack={() => setSelectedInspectionId('')}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onOpenNewRecordForInspection={(id) => {
                    setSelectedInspectionId(id);
                    setCurrentTab('registro-campo');
                  }}
                  onOpenRecordDetail={(record) => {
                    setSelectedRecordId(record.id);
                    setCurrentTab('analise-ia');
                  }}
                  onGenerateDocxReport={(insp) => {
                    setSelectedInspectionId(insp.id);
                    setCurrentTab('relatorios');
                  }}
                  onUpdateInspectionStatus={handleUpdateInspectionStatus}
                />
              ) : (
                <InspectionsListView
                  inspections={inspections}
                  types={types}
                  records={records}
                  onSelectInspection={(id) => setSelectedInspectionId(id)}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onGenerateReport={(insp) => {
                    setSelectedInspectionId(insp.id);
                    setCurrentTab('relatorios');
                  }}
                />
              )}
            </>
          )}

          {/* TAB: REGISTRO DE CAMPO */}
          {currentTab === 'registro-campo' && (
            <FieldRecordView
              inspections={inspections}
              assets={assets}
              types={types}
              documents={documents}
              preselectedInspectionId={selectedInspectionId}
              onSaveRecord={handleSaveRecord}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onAnalyzeWithAI={(rec) => {
                setSelectedRecordId(rec.id);
                setCurrentTab('analise-ia');
              }}
            />
          )}

          {/* TAB: ANÁLISE COM IA & VALIDAÇÃO HUMANA */}
          {currentTab === 'analise-ia' && (
            <AIAnalysisView
              record={selectedRecord}
              types={types}
              documents={documents}
              onUpdateRecord={handleUpdateRecord}
              onBack={() => setCurrentTab('registro-campo')}
            />
          )}

          {/* TAB: ATIVOS */}
          {currentTab === 'ativos' && (
            <AssetsView
              assets={assets}
              records={records}
              onSaveAsset={handleSaveAsset}
              onNavigateToRecord={(recId) => {
                setSelectedRecordId(recId);
                setCurrentTab('analise-ia');
              }}
            />
          )}

          {/* TAB: DOCUMENTOS PARA ANÁLISE DA IA */}
          {currentTab === 'documentos' && (
            <ReferenceDocsView
              documents={documents}
              types={types}
              assets={assets}
              inspections={inspections}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {/* TAB: NÃO CONFORMIDADES (RNC) */}
          {currentTab === 'nao-conformidades' && (
            <NonConformitiesView
              nonConformities={nonConformities}
              onUpdateNC={handleUpdateNC}
            />
          )}

          {/* TAB: RECOMENDAÇÕES TÉCNICAS */}
          {currentTab === 'recomendacoes' && (
            <RecommendationsView
              recommendations={recommendations}
              onUpdateRecommendation={handleUpdateRecommendation}
            />
          )}

          {/* TAB: RELATÓRIOS WORD (.DOCX) */}
          {currentTab === 'relatorios' && (
            <ReportsView
              inspections={inspections}
              records={records}
              types={types}
              nonConformities={nonConformities}
              recommendations={recommendations}
              documents={documents}
              selectedInspectionId={selectedInspectionId}
              onSelectInspectionId={(id) => setSelectedInspectionId(id)}
            />
          )}

          {/* TAB: HISTÓRICO & COMPARAÇÃO TEMPORAL */}
          {currentTab === 'historico' && (
            <HistoryView
              assets={assets}
              records={records}
              inspections={inspections}
              onNavigateToRecord={(recId) => {
                setSelectedRecordId(recId);
                setCurrentTab('analise-ia');
              }}
            />
          )}

          {/* TAB: CONFIGURAÇÕES */}
          {currentTab === 'configuracoes' && (
            <SettingsView
              types={types}
              onSaveType={handleSaveType}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        assets={assets}
        inspections={inspections}
        records={records}
        nonConformities={nonConformities}
        onNavigateToRecord={(id) => {
          setSelectedRecordId(id);
          setCurrentTab('analise-ia');
        }}
        onNavigateToInspection={(id) => {
          setSelectedInspectionId(id);
          setCurrentTab('inspecoes');
        }}
        onNavigateToAsset={(id) => {
          setCurrentTab('ativos');
        }}
        onNavigateToNC={(id) => {
          setCurrentTab('nao-conformidades');
        }}
      />
    </div>
  );
}
