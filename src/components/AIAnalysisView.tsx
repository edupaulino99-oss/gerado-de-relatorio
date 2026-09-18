import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Edit3,
  AlertTriangle,
  FileText,
  Clock,
  User,
  BookOpen,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Maximize2,
} from 'lucide-react';
import {
  FieldRecord,
  HumanValidation,
  ReferenceDocument,
  InspectionTypeConfig,
  AIAnalysisResult,
} from '../types';

interface AIAnalysisViewProps {
  record: FieldRecord;
  types: InspectionTypeConfig[];
  documents: ReferenceDocument[];
  onUpdateRecord: (updated: FieldRecord) => void;
  onBack: () => void;
}

export const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({
  record,
  types,
  documents,
  onUpdateRecord,
  onBack,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Human validation form fields
  const [editedCondition, setEditedCondition] = useState(
    record.humanValidation?.finalCondition || record.conditionFound
  );
  const [editedSeverity, setEditedSeverity] = useState(
    record.humanValidation?.finalSeverity || record.severity
  );
  const [inspectorNotes, setInspectorNotes] = useState(
    record.humanValidation?.inspectorNotes || ''
  );
  const [finalRecommendation, setFinalRecommendation] = useState(
    record.humanValidation?.finalRecommendation ||
      record.aiAnalysis?.recomendacaoTecnica ||
      ''
  );
  const [validationSuccess, setValidationSuccess] = useState(false);

  const currentType = types.find((t) => t.id === record.inspectionTypeId);
  const relevantDocs = documents.filter(
    (d) =>
      d.scope === 'GERAL' ||
      d.inspectionTypeId === record.inspectionTypeId ||
      d.assetId === record.assetId
  );

  const currentPhoto =
    record.evidences[selectedPhotoIndex]?.url ||
    record.evidences[0]?.url ||
    'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800';

  // Trigger Gemini AI analysis
  const handleRunAI = async () => {
    setIsAnalyzing(true);
    try {
      const docsSummary = relevantDocs
        .map((d) => `${d.title}: ${d.scope}`)
        .join('; ');

      const payload = {
        recordData: {
          assetCode: record.assetCode,
          assetName: record.assetName,
          inspectionType: currentType?.name || 'Geral',
          itemInspected: record.itemInspected,
          conditionFound: record.conditionFound,
          inspectorDescription: record.inspectorDescription,
          severity: record.severity,
          location: record.location,
          referenceStandards: currentType?.referenceStandard,
        },
        referenceDocumentsText: docsSummary,
        image: currentPhoto,
      };

      const res = await fetch('/api/analyze-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha na comunicação com o assistente IA');
      const aiResult: AIAnalysisResult = await res.json();

      const updatedRecord: FieldRecord = {
        ...record,
        aiAnalysis: aiResult,
      };

      onUpdateRecord(updatedRecord);
      setFinalRecommendation(aiResult.recomendacaoTecnica);
    } catch (err) {
      console.error('AI error:', err);
      alert('Não foi possível concluir a análise de IA. Verifique os dados ou tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Human validation submission
  const handleValidate = (status: 'APPROVED' | 'EDITED' | 'REJECTED') => {
    const statusMap: Record<string, 'Aprovado' | 'Alterado' | 'Rejeitado'> = {
      APPROVED: 'Aprovado',
      EDITED: 'Alterado',
      REJECTED: 'Rejeitado',
    };

    const validation: HumanValidation = {
      status: statusMap[status] || 'Aprovado',
      validatedBy: 'Eng. Marcelo Albuquerque (CREA 506.291-SP)',
      validatedAt: new Date().toLocaleString('pt-BR'),
      inspectorNotes: inspectorNotes.trim(),
      finalClassification: editedCondition,
      finalSeverity: editedSeverity,
      finalRecommendation: finalRecommendation.trim(),
    };

    const updatedRecord: FieldRecord = {
      ...record,
      conditionFound: editedCondition,
      severity: editedSeverity,
      humanValidation: validation,
    };

    onUpdateRecord(updatedRecord);
    setValidationSuccess(true);
    setTimeout(() => setValidationSuccess(false), 4000);
  };

  const confidenceScore = record.aiAnalysis?.confiancaPercentual || 88;
  const isHighConfidence = confidenceScore >= 80;
  const isMediumConfidence = confidenceScore >= 60 && confidenceScore < 80;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
        >
          ← Voltar ao Registro
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Ativo: <strong className="text-blue-700 font-mono">{record.assetCode}</strong> ({record.assetName})
          </span>
        </div>
      </div>

      {/* Main Dual Grid: Left = Visual Evidence & Asset Context; Right = AI Analysis & Human Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Evidence & Technical Context (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Photo viewer card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center">
              <img
                src={currentPhoto}
                alt={record.itemInspected}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[11px] font-bold text-white">
                Evidência {selectedPhotoIndex + 1} de {record.evidences.length}
              </span>
            </div>

            {/* Thumbnail switcher if multiple photos */}
            {record.evidences.length > 1 && (
              <div className="p-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto bg-slate-50">
                {record.evidences.map((ev, idx) => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedPhotoIndex === idx
                        ? 'border-blue-600 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={ev.url}
                      alt={ev.caption || 'Miniatura'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Field Observation Details */}
            <div className="p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Item Inspecionado
                </span>
                <span className="font-bold text-slate-900 text-sm">{record.itemInspected}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500 block">Condição de Campo:</span>
                  <span className="font-bold text-slate-800">{record.conditionFound}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Severidade:</span>
                  <span className="font-bold text-slate-800">{record.severity}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-bold block mb-1">Fato Registrado pelo Inspetor:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {record.inspectorDescription}
                </p>
              </div>

              {record.gps && (
                <div className="text-[11px] text-slate-500 pt-1">
                  GPS: {record.gps.latitude.toFixed(6)}, {record.gps.longitude.toFixed(6)} (±{record.gps.accuracy}m)
                </div>
              )}
            </div>
          </div>

          {/* Reference Documents Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Documentos de Referência Consultados pela IA ({relevantDocs.length})
            </h4>
            <div className="space-y-1.5">
              {relevantDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-500">{doc.scope} • {doc.fileType}</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    Norma Ativa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Results & Compulsory Human Validation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Output Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header with trigger button */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Assistente de Inspeção com IA</h3>
                  <p className="text-[11px] text-slate-300">
                    Visão computacional e raciocínio fundamentado em normas de engenharia
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAI}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isAnalyzing ? 'Processando IA...' : 'Reanalisar com IA'}</span>
              </button>
            </div>

            {/* AI Body */}
            {record.aiAnalysis ? (
              <div className="p-6 space-y-5">
                {/* Confidence Level Pill */}
                <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        isHighConfidence
                          ? 'bg-emerald-500 ring-4 ring-emerald-100'
                          : isMediumConfidence
                          ? 'bg-amber-500 ring-4 ring-amber-100'
                          : 'bg-rose-500 ring-4 ring-rose-100'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Nível de Confiabilidade da Análise: {confidenceScore}% (
                        {isHighConfidence ? 'Alta Confiabilidade' : isMediumConfidence ? 'Média Confiabilidade' : 'Baixa Confiabilidade'}
                        )
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Classificação fundamentada em evidência visual e cruzamento normativo
                      </div>
                    </div>
                  </div>

                  {!isHighConfidence && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Requer conferência presencial
                    </span>
                  )}
                </div>

                {/* 10 Required Items from Prompt */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        1. Item Identificado
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {record.aiAnalysis.itemIdentificado}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        2. Condição Aparente / Severidade Sugerida
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {record.aiAnalysis.condicaoVisualAparente}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {record.aiAnalysis.severidadeSugerida}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block mb-1">
                      3. Anomalia Identificada
                    </span>
                    <p className="text-slate-900 font-semibold">{record.aiAnalysis.anomaliaIdentificada}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      4. Fatos Estritamente Observados
                    </span>
                    <p className="text-slate-700 leading-relaxed">{record.aiAnalysis.fatosObservados}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
                    <span className="text-[10px] font-bold uppercase text-indigo-700 block mb-1">
                      5. Interpretação Visual Fundamentada
                    </span>
                    <p className="text-slate-800 leading-relaxed">{record.aiAnalysis.interpretacaoVisual}</p>
                  </div>

                  {record.aiAnalysis.possivelCausa && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        6. Possível Causa (Evidenciada)
                      </span>
                      <p className="text-slate-700">{record.aiAnalysis.possivelCausa}</p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                    <span className="text-[10px] font-bold uppercase text-blue-800 block mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      7. Recomendação Técnica Proposta pela IA
                    </span>
                    <p className="text-blue-950 font-medium leading-relaxed">
                      {record.aiAnalysis.recomendacaoTecnica}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        8. Avaliação Complementar
                      </span>
                      <span className="font-semibold text-slate-800">
                        {record.aiAnalysis.necessidadeAvaliacaoComplementar ? 'Sim (Exame instrumental)' : 'Não necessária'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        9. Comparação com Histórico
                      </span>
                      <span className="text-slate-700 line-clamp-2">
                        {record.aiAnalysis.comparacaoHistorico || 'Primeiro registro estruturado.'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1">
                    <strong>10. Fontes / Normas de Engenharia Consultadas:</strong>{' '}
                    {record.aiAnalysis.fontesConsultadas?.join(', ') || 'RBAC 153, NBRs vigentes'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Nenhuma análise executada ainda</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Clique no botão acima para acionar a visão computacional e o raciocínio técnico sobre a foto e as anotações.
                </p>
                <button
                  onClick={handleRunAI}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  Executar Assistente Técnico IA
                </button>
              </div>
            )}
          </div>

          {/* HUMAN VALIDATION PANEL (MANDATORY HUMAN-IN-THE-LOOP) */}
          <div className="bg-white rounded-2xl border-2 border-blue-500/40 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Painel de Validação Técnica do Engenheiro (Compulsório)
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Human-in-the-Loop
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              A inteligência artificial atua exclusivamente como assistente técnico preliminar. O engenheiro ou fiscal
              deve validar, ajustar ou rejeitar as conclusões antes da incorporação oficial ao relatório Word (.docx).
            </p>

            {validationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Validação gravada com sucesso! O registro e o relatório oficial estão sincronizados.
              </div>
            )}

            {/* Editable validation fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condição Final Aprovada pelo Perito:
                </label>
                <select
                  value={editedCondition}
                  onChange={(e) => setEditedCondition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="ATENÇÃO">ATENÇÃO</option>
                  <option value="NÃO CONFORMIDADE">NÃO CONFORMIDADE</option>
                  <option value="CRÍTICA">CRÍTICA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Severidade Final Aprovada:
                </label>
                <select
                  value={editedSeverity}
                  onChange={(e) => setEditedSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Recomendação Técnica Oficial (Texto para o Relatório Word):
              </label>
              <textarea
                rows={3}
                value={finalRecommendation}
                onChange={(e) => setFinalRecommendation(e.target.value)}
                placeholder="Insira ou refine a recomendação de engenharia..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações Adicionais do Inspetor / Justificativa Técnica:
              </label>
              <input
                type="text"
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Ex: Concordo integralmente com a leitura da IA. Encaminhado para a equipe de caldeiraria..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            {/* Validation Actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Responsável: <strong>Eng. Marcelo Albuquerque (CREA 506.291-SP)</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleValidate('REJECTED')}
                  className="px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Rejeitar Parecer IA
                </button>

                <button
                  type="button"
                  onClick={() => handleValidate('EDITED')}
                  className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Salvar Ajustes
                </button>

                <button
                  type="button"
                  onClick={() => handleValidate('APPROVED')}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Aprovar & Chancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
