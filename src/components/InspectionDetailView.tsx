import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  MapPin,
  Building2,
  FileDown,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Inspection, FieldRecord, InspectionTypeConfig, NonConformity, TechnicalRecommendation } from '../types';

interface InspectionDetailViewProps {
  inspection: Inspection;
  types: InspectionTypeConfig[];
  records: FieldRecord[];
  nonConformities: NonConformity[];
  recommendations: TechnicalRecommendation[];
  onBack: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewRecordForInspection: (inspectionId: string) => void;
  onOpenRecordDetail: (record: FieldRecord) => void;
  onGenerateDocxReport: (inspection: Inspection) => void;
  onUpdateInspectionStatus: (inspectionId: string, status: Inspection['status']) => void;
}

export const InspectionDetailView: React.FC<InspectionDetailViewProps> = ({
  inspection,
  types,
  records,
  nonConformities,
  recommendations,
  onBack,
  onNavigateTab,
  onOpenNewRecordForInspection,
  onOpenRecordDetail,
  onGenerateDocxReport,
  onUpdateInspectionStatus,
}) => {
  const currentType = types.find((t) => t.id === inspection.typeId);
  const inspRecords = records.filter((r) => r.inspectionId === inspection.id);

  const normalCount = inspRecords.filter((r) => r.conditionFound === 'NORMAL').length;
  const attentionCount = inspRecords.filter((r) => r.conditionFound === 'ATENÇÃO').length;
  const ncCount = inspRecords.filter((r) => r.conditionFound === 'NÃO CONFORMIDADE').length;
  const criticalCount = inspRecords.filter((r) => r.conditionFound === 'CRÍTICA').length;
  const validatedCount = inspRecords.filter((r) => r.humanValidation?.status === 'APPROVED').length;

  const isClosed = inspection.status === 'Concluída' || inspection.status === 'Aprovada';

  return (
    <div className="space-y-6 pb-16">
      {/* Back button and quick title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Lista de Inspeções
        </button>

        <div className="flex items-center gap-2">
          {!isClosed ? (
            <button
              onClick={() => onUpdateInspectionStatus(inspection.id, 'Concluída')}
              className="px-3.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Finalizar Inspeção
            </button>
          ) : (
            <button
              onClick={() => onUpdateInspectionStatus(inspection.id, 'Em Andamento')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Reabrir Inspeção
            </button>
          )}

          <button
            onClick={() => onGenerateDocxReport(inspection)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            Gerar Relatório Word (.docx)
          </button>
        </div>
      </div>

      {/* Main Inspection Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-sm font-mono font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                {inspection.number}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {currentType?.code} — {currentType?.name || inspection.typeId}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isClosed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {inspection.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{inspection.area}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {inspection.unitAirport}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenNewRecordForInspection(inspection.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              + Novo Registro de Campo
            </button>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Data & Horário
            </div>
            <div className="font-bold text-slate-900">{inspection.date}</div>
            <div className="text-slate-500 text-[11px]">{inspection.startTime} às {inspection.endTime}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Responsável Técnico
            </div>
            <div className="font-bold text-slate-900 line-clamp-1">{inspection.responsible}</div>
            <div className="text-slate-500 text-[11px]">CREA Registrado</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Equipe Operacional
            </div>
            <div className="font-bold text-slate-900 line-clamp-1">{inspection.team || 'Não informado'}</div>
            <div className="text-slate-500 text-[11px]">Técnicos de Campo</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Norma Referência
            </div>
            <div className="font-bold text-slate-900 line-clamp-1">
              {currentType?.referenceStandard || 'Norma Geral'}
            </div>
            <div className="text-slate-500 text-[11px]">Conformidade Legal</div>
          </div>
        </div>

        {/* Inspection-specific KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-center">
            <span className="text-[11px] uppercase font-bold text-slate-500 block">Total Registros</span>
            <span className="text-xl font-black text-slate-900">{inspRecords.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[11px] uppercase font-bold text-emerald-700 block">Normais</span>
            <span className="text-xl font-black text-emerald-700">{normalCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-[11px] uppercase font-bold text-amber-700 block">Em Atenção</span>
            <span className="text-xl font-black text-amber-700">{attentionCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-[11px] uppercase font-bold text-rose-700 block">Não Conformes</span>
            <span className="text-xl font-black text-rose-700">{ncCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <span className="text-[11px] uppercase font-bold text-purple-700 block">Validados IA</span>
            <span className="text-xl font-black text-purple-700">{validatedCount}/{inspRecords.length}</span>
          </div>
        </div>
      </div>

      {/* Field Records Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registros de Campo Desta Inspeção</h3>
            <p className="text-xs text-slate-500">
              Fotografias técnicas, diagnósticos preliminares e análises auditadas pela IA
            </p>
          </div>
          <button
            onClick={() => onOpenNewRecordForInspection(inspection.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
          >
            <Camera className="w-4 h-4" />
            Adicionar Registro
          </button>
        </div>

        {inspRecords.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">Nenhum registro de campo cadastrado</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-4">
              Esta inspeção ainda não possui evidências registradas. Use a câmera ou envie imagens para que o Assistente de IA inicie a análise técnica.
            </p>
            <button
              onClick={() => onOpenNewRecordForInspection(inspection.id)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Inserir Primeiro Registro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspRecords.map((rec) => {
              const primaryPhoto = rec.evidences[0]?.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800';
              const isApproved = rec.humanValidation?.status === 'APPROVED';

              return (
                <div
                  key={rec.id}
                  onClick={() => onOpenRecordDetail(rec)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-4 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={primaryPhoto}
                        alt={rec.itemInspected}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                        {rec.evidences.length} foto{rec.evidences.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {rec.assetCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.conditionFound === 'NORMAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.conditionFound === 'ATENÇÃO'
                              ? 'bg-amber-100 text-amber-800'
                              : rec.conditionFound === 'NÃO CONFORMIDADE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-red-200 text-red-900 font-black'
                          }`}
                        >
                          {rec.conditionFound}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {rec.itemInspected}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{rec.assetName}</p>

                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5">
                        {rec.inspectorDescription}
                      </p>
                    </div>
                  </div>

                  {/* Footer status row */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {rec.aiAnalysis ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          <Sparkles className="w-3 h-3" />
                          IA: Confiança {rec.aiAnalysis.confiancaPercentual || 90}%
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Pendente de IA</span>
                      )}

                      {isApproved && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Validado por Perito
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                      Abrir Análise →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
