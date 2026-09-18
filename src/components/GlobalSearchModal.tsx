import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Layers,
  ClipboardList,
  Camera,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';
import { Asset, Inspection, FieldRecord, NonConformity } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  inspections: Inspection[];
  records: FieldRecord[];
  nonConformities: NonConformity[];
  onNavigateToRecord: (recordId: string) => void;
  onNavigateToInspection: (inspectionId: string) => void;
  onNavigateToAsset: (assetId: string) => void;
  onNavigateToNC: (ncId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  inspections,
  records,
  nonConformities,
  onNavigateToRecord,
  onNavigateToInspection,
  onNavigateToAsset,
  onNavigateToNC,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return { assets: [], inspections: [], records: [], ncs: [] };

    const matchedAssets = assets.filter(
      (a) =>
        a.code.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term) ||
        a.area.toLowerCase().includes(term) ||
        a.locationDetails.toLowerCase().includes(term)
    );

    const matchedInspections = inspections.filter(
      (i) =>
        i.number.toLowerCase().includes(term) ||
        i.unitAirport.toLowerCase().includes(term) ||
        i.responsible.toLowerCase().includes(term) ||
        i.area.toLowerCase().includes(term) ||
        i.status.toLowerCase().includes(term)
    );

    const matchedRecords = records.filter(
      (r) =>
        r.assetCode.toLowerCase().includes(term) ||
        r.assetName.toLowerCase().includes(term) ||
        r.itemInspected.toLowerCase().includes(term) ||
        r.inspectorDescription.toLowerCase().includes(term) ||
        (r.workOrderNumber && r.workOrderNumber.toLowerCase().includes(term)) ||
        r.location.toLowerCase().includes(term) ||
        r.conditionFound.toLowerCase().includes(term)
    );

    const matchedNCs = nonConformities.filter(
      (nc) =>
        nc.code.toLowerCase().includes(term) ||
        nc.assetName.toLowerCase().includes(term) ||
        nc.description.toLowerCase().includes(term) ||
        nc.responsible.toLowerCase().includes(term) ||
        nc.status.toLowerCase().includes(term)
    );

    return {
      assets: matchedAssets.slice(0, 5),
      inspections: matchedInspections.slice(0, 5),
      records: matchedRecords.slice(0, 5),
      ncs: matchedNCs.slice(0, 5),
    };
  }, [searchTerm, assets, inspections, records, nonConformities]);

  if (!isOpen) return null;

  const totalHits =
    results.assets.length +
    results.inspections.length +
    results.records.length +
    results.ncs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por ativo, código, inspeção, OS, ocorrência, local, data ou responsável..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 bg-slate-200/80 hover:bg-slate-300 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {!searchTerm ? (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium">Digite qualquer termo para pesquisa global</p>
              <p className="text-xs text-slate-400 mt-1">
                Exemplos: "DRN", "Canal", "Pintura", "OS-8821", "Crítica", "Albuquerque"
              </p>
            </div>
          ) : totalHits === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-semibold text-slate-700">Nenhum resultado encontrado</p>
              <p className="text-xs text-slate-400 mt-1">
                Não localizamos registros correspondentes a "{searchTerm}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Records */}
              {results.records.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    Registros de Campo ({results.records.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.records.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onNavigateToRecord(r.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-700 font-mono">
                              {r.assetCode}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                r.conditionFound === 'NORMAL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.conditionFound === 'ATENÇÃO'
                                  ? 'bg-amber-100 text-amber-800'
                                  : r.conditionFound === 'NÃO CONFORMIDADE'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-red-200 text-red-900 font-black'
                              }`}
                            >
                              {r.conditionFound}
                            </span>
                            {r.workOrderNumber && (
                              <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {r.workOrderNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                            {r.itemInspected}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {r.inspectorDescription}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Non Conformities */}
              {results.ncs.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Não Conformidades ({results.ncs.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.ncs.map((nc) => (
                      <div
                        key={nc.id}
                        onClick={() => {
                          onNavigateToNC(nc.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-100/60 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-700 font-mono">
                              {nc.code}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                              {nc.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5">
                            {nc.assetName}
                          </p>
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            {nc.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-rose-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assets */}
              {results.assets.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Ativos ({results.assets.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.assets.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onNavigateToAsset(a.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/60 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-700 font-mono">
                              {a.code}
                            </span>
                            <span className="text-xs text-slate-700 font-medium">{a.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {a.area}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspections */}
              {results.inspections.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                    Inspeções ({results.inspections.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.inspections.map((i) => (
                      <div
                        key={i.id}
                        onClick={() => {
                          onNavigateToInspection(i.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/60 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 font-mono">
                              {i.number}
                            </span>
                            <span className="text-xs text-slate-800 font-medium">{i.area}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {i.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {i.responsible}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
