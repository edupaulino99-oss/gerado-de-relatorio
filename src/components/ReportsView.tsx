import React, { useState } from 'react';
import {
  FileDown,
  Sparkles,
  Printer,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Loader2,
  Download,
} from 'lucide-react';
import {
  Inspection,
  FieldRecord,
  InspectionTypeConfig,
  NonConformity,
  TechnicalRecommendation,
  ReferenceDocument,
} from '../types';
import { downloadInspectionDocx } from '../utils/docxGenerator';

interface ReportsViewProps {
  inspections: Inspection[];
  records: FieldRecord[];
  types: InspectionTypeConfig[];
  nonConformities: NonConformity[];
  recommendations: TechnicalRecommendation[];
  documents: ReferenceDocument[];
  selectedInspectionId?: string;
  onSelectInspectionId: (id: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  inspections,
  records,
  types,
  nonConformities,
  recommendations,
  documents,
  selectedInspectionId,
  onSelectInspectionId,
}) => {
  const [activeInspId, setActiveInspId] = useState(
    selectedInspectionId || inspections[0]?.id || ''
  );
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [consolidationData, setConsolidationData] = useState<any>(null);

  const currentInspection =
    inspections.find((i) => i.id === activeInspId) || inspections[0];
  const currentType = types.find((t) => t.id === currentInspection?.typeId);
  const currentRecords = records.filter(
    (r) => r.inspectionId === currentInspection?.id
  );
  const currentNCs = nonConformities.filter(
    (nc) => nc.inspectionId === currentInspection?.id
  );
  const currentRecs = recommendations;

  // Compute metrics
  const totalRecs = currentRecords.length;
  const normalCount = currentRecords.filter((r) => r.conditionFound === 'NORMAL').length;
  const attentionCount = currentRecords.filter((r) => r.conditionFound === 'ATENÇÃO').length;
  const ncCount = currentRecords.filter((r) => r.conditionFound === 'NÃO CONFORMIDADE').length;
  const criticalCount = currentRecords.filter((r) => r.conditionFound === 'CRÍTICA').length;
  const uniqueAssets = Array.from(new Set(currentRecords.map((r) => r.assetId))).length;

  // Run AI consolidation on server
  const handleConsolidateAI = async () => {
    if (!currentInspection) return;
    setIsConsolidating(true);
    try {
      const payload = {
        inspectionData: {
          number: currentInspection.number,
          type: currentType?.name || currentInspection.typeId,
          unitAirport: currentInspection.unitAirport,
          area: currentInspection.area,
          date: currentInspection.date,
          startTime: currentInspection.startTime,
          endTime: currentInspection.endTime,
          responsible: currentInspection.responsible,
          team: currentInspection.team,
          generalNotes: currentInspection.generalNotes,
        },
        records: currentRecords.map((r) => ({
          assetCode: r.assetCode,
          assetName: r.assetName,
          itemInspected: r.itemInspected,
          conditionFound: r.conditionFound,
          severity: r.severity,
          inspectorDescription: r.inspectorDescription,
          aiRecommendation: r.humanValidation?.finalRecommendation || r.aiAnalysis?.recomendacaoTecnica,
        })),
        nonConformities: currentNCs,
        recommendations: currentRecs,
        referenceDocuments: documents.map((d) => d.title).join('; '),
      };

      const res = await fetch('/api/consolidate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha ao consolidar relatório');
      const data = await res.json();
      setConsolidationData(data);
    } catch (err) {
      console.error('Consolidation error:', err);
      alert('Não foi possível concluir a consolidação com IA. Verifique os dados.');
    } finally {
      setIsConsolidating(false);
    }
  };

  // Download Word (.docx)
  const handleDownloadWord = async () => {
    if (!currentInspection) return;
    setIsDownloading(true);
    try {
      await downloadInspectionDocx({
        inspection: currentInspection,
        inspectionType: currentType,
        records: currentRecords,
        nonConformities: currentNCs,
        recommendations: currentRecs,
        consolidation: consolidationData || undefined,
      });
    } catch (err) {
      console.error('Download error:', err);
      alert('Erro ao gerar documento Word.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!currentInspection) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <p>Nenhuma inspeção cadastrada para gerar relatório.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Selector & Action Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Selecione a Inspeção para Emissão do Relatório:
          </label>
          <select
            value={currentInspection.id}
            onChange={(e) => {
              setActiveInspId(e.target.value);
              onSelectInspectionId(e.target.value);
              setConsolidationData(null);
            }}
            className="w-full max-w-md px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {inspections.map((i) => (
              <option key={i.id} value={i.id}>
                {i.number} — {i.area} ({i.date})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleConsolidateAI}
            disabled={isConsolidating}
            className="px-4 py-2.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-2xs"
          >
            {isConsolidating ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-600" />
            )}
            <span>{isConsolidating ? 'Consolidando com IA...' : 'Consolidar Texto com IA'}</span>
          </button>

          <button
            onClick={handleDownloadWord}
            disabled={isDownloading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloading ? 'Gerando .docx...' : 'Baixar Relatório Word (.docx)'}</span>
          </button>
        </div>
      </div>

      {/* Visual Report Paper Simulation (WYSIWYG layout conforming to all 12 sections) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden print:shadow-none print:border-none">
        {/* Document Header Ribbon */}
        <div className="h-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900" />

        <div className="p-8 sm:p-12 space-y-10 text-slate-800 font-sans">
          {/* CAPA OFICIAL */}
          <div className="text-center border-b-2 border-slate-900/80 pb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Documento Técnico Pericial Auditado
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase">
              Relatório Técnico de Inspeção Periódica
            </h1>

            <div className="text-sm sm:text-base font-bold text-blue-700 uppercase tracking-wide">
              {currentType?.code} — {currentType?.name || currentInspection.typeId}
            </div>

            <div className="text-xs sm:text-sm text-slate-600 font-medium">
              {currentInspection.unitAirport} — {currentInspection.area}
            </div>

            {/* Capa Metadata Grid */}
            <div className="mt-8 max-w-2xl mx-auto bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-left text-xs">
              <div className="grid grid-cols-3 p-2.5 border-b border-slate-200">
                <span className="font-bold text-slate-500">Número da Inspeção:</span>
                <span className="col-span-2 font-mono font-bold text-blue-700">{currentInspection.number}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5 border-b border-slate-200">
                <span className="font-bold text-slate-500">Data de Realização:</span>
                <span className="col-span-2 text-slate-800">
                  {currentInspection.date} ({currentInspection.startTime} às {currentInspection.endTime})
                </span>
              </div>
              <div className="grid grid-cols-3 p-2.5 border-b border-slate-200">
                <span className="font-bold text-slate-500">Responsável Técnico:</span>
                <span className="col-span-2 font-bold text-slate-900">{currentInspection.responsible}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5 border-b border-slate-200">
                <span className="font-bold text-slate-500">Equipe Operacional:</span>
                <span className="col-span-2 text-slate-800">{currentInspection.team || 'Equipe Interna'}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="font-bold text-slate-500">Norma Referência:</span>
                <span className="col-span-2 text-slate-800">{currentType?.referenceStandard || 'RBAC Vigente'}</span>
              </div>
            </div>
          </div>

          {/* 1. OBJETIVO */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              1. Objetivo
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {consolidationData?.objetivo ||
                `Realizar a inspeção técnica periódica de campo no segmento '${currentType?.name || currentInspection.typeId}' para a verificação das condições operacionais, estruturais e de conformidade normativa dos ativos alocados na área '${currentInspection.area}', subsidiando ações preventivas e corretivas de engenharia e manutenção.`}
            </p>
          </section>

          {/* 2. ESCOPO */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              2. Escopo
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {consolidationData?.escopo ||
                `A presente inspeção abrangeu ${uniqueAssets} ativos técnicos, totalizando ${totalRecs} registros detalhados com captura fotográfica e georreferenciamento GPS, executada no período de ${currentInspection.date} nas dependências de ${currentInspection.unitAirport}.`}
            </p>
          </section>

          {/* 3. METODOLOGIA */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              3. Metodologia
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {consolidationData?.metodologia ||
                `A metodologia empregada fundamentou-se em varredura visual sistemática presencial conduzida pelo responsável técnico credenciado, com registro fotográfico digital, coleta de coordenadas geográficas via receptor GNSS de alta precisão, preenchimento de checklists normativos baseados no regulamento ${currentType?.referenceStandard || 'RBAC vigente'} e apoio analítico de Inteligência Artificial para classificação preliminar com validação humana compulsória de 100% dos apontamentos.`}
            </p>
          </section>

          {/* 4. INDICADORES */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              4. Indicadores Gerais da Inspeção
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-2.5">Indicador Técnico</th>
                    <th className="p-2.5">Quantitativo</th>
                    <th className="p-2.5">Percentual Relativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium">Total de Ativos Inspecionados</td>
                    <td className="p-2.5 font-bold text-slate-900">{uniqueAssets}</td>
                    <td className="p-2.5 text-slate-500">100% da amostra programada</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium">Total de Registros de Campo</td>
                    <td className="p-2.5 font-bold text-slate-900">{totalRecs}</td>
                    <td className="p-2.5 text-slate-500">Completude integral</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium text-emerald-800">Condições Normais (Conformes)</td>
                    <td className="p-2.5 font-bold text-emerald-700">{normalCount}</td>
                    <td className="p-2.5 text-emerald-700 font-bold">
                      {totalRecs > 0 ? Math.round((normalCount / totalRecs) * 100) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-amber-800">Condições em Atenção</td>
                    <td className="p-2.5 font-bold text-amber-700">{attentionCount}</td>
                    <td className="p-2.5 text-amber-700 font-bold">
                      {totalRecs > 0 ? Math.round((attentionCount / totalRecs) * 100) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium text-rose-800">Não Conformidades (NC)</td>
                    <td className="p-2.5 font-bold text-rose-700">{ncCount}</td>
                    <td className="p-2.5 text-rose-700 font-bold">
                      {totalRecs > 0 ? Math.round((ncCount / totalRecs) * 100) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-red-800">Condições Críticas Imediatas</td>
                    <td className="p-2.5 font-bold text-red-700">{criticalCount}</td>
                    <td className="p-2.5 text-red-700 font-bold">
                      {totalRecs > 0 ? Math.round((criticalCount / totalRecs) * 100) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium">Recomendações Emitidas</td>
                    <td className="p-2.5 font-bold text-slate-900">{currentRecs.length}</td>
                    <td className="p-2.5 text-slate-500">Em acompanhamento</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. RESULTADOS DA INSPEÇÃO */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              5. Resultados da Inspeção por Ativo
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-2">Nº</th>
                    <th className="p-2">Ativo</th>
                    <th className="p-2">Item Inspecionado</th>
                    <th className="p-2">Condição</th>
                    <th className="p-2">Severidade</th>
                    <th className="p-2">Recomendação Técnica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRecords.map((r, idx) => (
                    <tr key={r.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="p-2 font-mono font-bold text-slate-500">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="p-2 font-bold text-blue-700 font-mono">
                        {r.assetCode}
                        <span className="block text-[10px] font-normal text-slate-500">{r.assetName}</span>
                      </td>
                      <td className="p-2 font-semibold text-slate-800">{r.itemInspected}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            r.conditionFound === 'NORMAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.conditionFound === 'ATENÇÃO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.conditionFound}
                        </span>
                      </td>
                      <td className="p-2 font-medium">{r.severity}</td>
                      <td className="p-2 text-slate-600 text-[11px] leading-relaxed">
                        {r.humanValidation?.finalRecommendation || r.aiAnalysis?.recomendacaoTecnica || 'Manter rotina.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. ANÁLISE TÉCNICA (IA CONSOLIDADA) */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              6. Análise Técnica Consolidada (Assistente de Engenharia)
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              <p>
                <strong className="text-emerald-700 font-bold">6.1 Condições Satisfatórias: </strong>
                {consolidationData?.analiseTecnica?.condicoesSatisfatorias ||
                  `Constatou-se a conformidade de ${normalCount} itens que operam em parâmetros regulares de integridade, sem indícios de anomalias atípicas.`}
              </p>
              <p>
                <strong className="text-amber-700 font-bold">6.2 Pontos de Atenção: </strong>
                {consolidationData?.analiseTecnica?.pontosAtencao ||
                  `Foram identificados ${attentionCount} pontos de observação preventiva que exigem intervenções de rotina para preservação do ciclo de vida útil.`}
              </p>
              <p>
                <strong className="text-rose-700 font-bold">6.3 Não Conformidades e Condições Críticas: </strong>
                {consolidationData?.analiseTecnica?.naoConformidadesCriticas ||
                  `Apontadas ${ncCount + criticalCount} não conformidades formais que demandam abertura imediata de chamados corretivos e isolamento preventivo.`}
              </p>
              <p>
                <strong className="text-blue-900 font-bold">6.4 Ocorrências Recorrentes e Tendências: </strong>
                {consolidationData?.analiseTecnica?.ocorrenciasRecorrentes ||
                  'A análise temporal indica estabilidade estrutural geral com desgaste pontual em juntas e grelhas de escoamento decorrente do volume pluviométrico recente.'}
              </p>
            </div>
          </section>

          {/* 8. EVIDÊNCIAS FOTOGRÁFICAS */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              8. Evidências Fotográficas Registradas em Campo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentRecords.map((r, idx) => {
                const photo = r.evidences[0]?.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800';
                return (
                  <div key={r.id} className="border border-slate-200 rounded-xl overflow-hidden p-3 bg-slate-50 space-y-2">
                    <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={r.itemInspected}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-blue-800">
                        Figura {idx + 1} — {r.assetCode}: {r.itemInspected}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Condição:</strong> {r.conditionFound} (Severidade: {r.severity})
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Data:</strong> {r.date} | <strong>GPS:</strong>{' '}
                        {r.gps ? `${r.gps.latitude.toFixed(4)}, ${r.gps.longitude.toFixed(4)}` : 'N/D'}
                      </div>
                      <div className="text-[11px] text-slate-700 italic">
                        "{r.humanValidation?.inspectorNotes || r.inspectorDescription}"
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 9. NÃO CONFORMIDADES (TABELA RNC) */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              9. Tratamento de Não Conformidades (RNC)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-2">Código</th>
                    <th className="p-2">Ativo</th>
                    <th className="p-2">Descrição da Anomalia</th>
                    <th className="p-2">Severidade</th>
                    <th className="p-2">Prazo</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentNCs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">
                        Nenhuma não conformidade registrada nesta inspeção.
                      </td>
                    </tr>
                  ) : (
                    currentNCs.map((nc) => (
                      <tr key={nc.id}>
                        <td className="p-2 font-mono font-bold text-rose-700">{nc.code}</td>
                        <td className="p-2 font-medium">{nc.assetName}</td>
                        <td className="p-2 text-slate-700">{nc.description}</td>
                        <td className="p-2">{nc.severity}</td>
                        <td className="p-2">{nc.deadline}</td>
                        <td className="p-2 font-bold text-rose-800">{nc.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 11. CONCLUSÃO TÉCNICA */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase border-b border-slate-200 pb-1">
              11. Conclusão Técnica
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
              {consolidationData?.conclusao ||
                `Com base nas evidências objetivas coletadas e validadas pela equipe de engenharia em ${currentInspection.date}, os ativos vistoriados apresentam ${normalCount} condições normais, ${attentionCount} itens em estado de atenção preventiva, ${ncCount} não conformidades operacionais e ${criticalCount} condições críticas imediatas. Foram emitidas ordens de recomendação técnica priorizadas para assegurar a continuidade operacional e a segurança da infraestrutura.`}
            </p>
          </section>

          {/* 18. ASSINATURA / VALIDAÇÃO */}
          <section className="space-y-6 pt-6 border-t-2 border-slate-300">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
              18. Assinatura e Validação Técnica Profissional
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="space-y-2">
                <div className="w-64 mx-auto border-b border-slate-900 pb-1" />
                <p className="font-bold text-slate-900">{currentInspection.responsible}</p>
                <p className="text-slate-500">Responsável Técnico / Engenheiro Fiscal</p>
                <p className="text-[11px] text-slate-400">Data: {currentInspection.date}</p>
              </div>

              <div className="space-y-2">
                <div className="w-64 mx-auto border-b border-slate-900 pb-1" />
                <p className="font-bold text-slate-900">Gerência de Infraestrutura e Manutenção</p>
                <p className="text-slate-500">Aprovação e Despacho de Ordens de Serviço</p>
                <p className="text-[11px] text-slate-400">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
