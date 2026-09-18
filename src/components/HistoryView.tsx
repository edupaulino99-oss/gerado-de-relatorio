import React, { useState } from 'react';
import {
  History,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { Asset, FieldRecord, Inspection } from '../types';

interface HistoryViewProps {
  assets: Asset[];
  records: FieldRecord[];
  inspections: Inspection[];
  onNavigateToRecord: (recordId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  assets,
  records,
  inspections,
  onNavigateToRecord,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const assetRecords = records
    .filter((r) => r.assetId === selectedAssetId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Histórico e Comparação Temporal de Ativos
        </h2>
        <p className="text-xs text-slate-500">
          Analise o ciclo de vida, a reincidência de anomalias e a eficácia das intervenções realizadas
        </p>
      </div>

      {/* Asset Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Selecione o Ativo para Análise Temporal:
        </label>
        <select
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="w-full max-w-md px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name} ({a.area})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Asset Header Overview */}
      {selectedAsset && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-blue-300">{selectedAsset.code}</div>
            <h3 className="text-lg font-bold text-white mt-0.5">{selectedAsset.name}</h3>
            <p className="text-xs text-slate-300 mt-1">{selectedAsset.locationDetails} • {selectedAsset.area}</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">Total Vistorias</span>
              <span className="text-base font-black text-white">{assetRecords.length}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">Status Atual</span>
              <span className="text-xs font-bold text-emerald-300">{selectedAsset.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Linha do Tempo das Constatações Técnicas
        </h3>

        {assetRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Nenhum registro de campo prévio para este ativo.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {assetRecords.map((rec, index) => {
              const photo = rec.evidences[0]?.url;
              const isNormal = rec.conditionFound === 'NORMAL';
              const isAttention = rec.conditionFound === 'ATENÇÃO';

              return (
                <div key={rec.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                      isNormal
                        ? 'bg-emerald-500'
                        : isAttention
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />

                  {/* Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4">
                    {photo && (
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={photo}
                          alt={rec.itemInspected}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {rec.date} ({rec.time})
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isNormal
                                ? 'bg-emerald-100 text-emerald-800'
                                : isAttention
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rec.conditionFound}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          Severidade: <strong>{rec.severity}</strong>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {rec.itemInspected}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.inspectorDescription}
                      </p>

                      {rec.aiAnalysis?.recomendacaoTecnica && (
                        <div className="text-xs text-blue-900 bg-blue-50/70 p-2 rounded-lg border border-blue-100 mt-2">
                          <strong>Recomendação Técnica:</strong> {rec.aiAnalysis.recomendacaoTecnica}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {rec.gps ? `GPS: ${rec.gps.latitude.toFixed(4)}, ${rec.gps.longitude.toFixed(4)}` : 'Sem GPS'}
                        </span>

                        <button
                          onClick={() => onNavigateToRecord(rec.id)}
                          className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          Abrir Registro Completo <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
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
