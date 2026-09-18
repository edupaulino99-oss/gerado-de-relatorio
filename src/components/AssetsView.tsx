import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  History,
  Tag,
  Building2,
} from 'lucide-react';
import { Asset, FieldRecord } from '../types';

interface AssetsViewProps {
  assets: Asset[];
  records: FieldRecord[];
  onSaveAsset: (asset: Asset) => void;
  onNavigateToRecord: (recordId: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  records,
  onSaveAsset,
  onNavigateToRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<Asset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Asset state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [area, setArea] = useState('Lado Ar — Pátio 1');
  const [typeId, setTypeId] = useState('type-drn');
  const [locationDetails, setLocationDetails] = useState('');

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      area: area.trim(),
      typeId,
      locationDetails: locationDetails.trim() || area.trim(),
      status: 'Ativo',
    };

    onSaveAsset(newAsset);
    setShowAddModal(false);
    setCode('');
    setName('');
    setLocationDetails('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventário Corporativo de Ativos</h2>
          <p className="text-xs text-slate-500">
            Cadastre, georreferencie e audite o histórico de intervenções e vistorias por ativo
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Ativo
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por código (ex: DRN-PL-001), nome ou área..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
        >
          <option value="ALL">Todos os Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Em Manutenção">Em Manutenção</option>
          <option value="Interditado">Interditado</option>
        </select>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => {
          const assetRecords = records.filter((r) => r.assetId === asset.id);
          const hasNC = assetRecords.some((r) => r.conditionFound === 'NÃO CONFORMIDADE' || r.conditionFound === 'CRÍTICA');
          const hasWarn = assetRecords.some((r) => r.conditionFound === 'ATENÇÃO');

          return (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {asset.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      asset.status === 'Ativo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : asset.status === 'Em Manutenção'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{asset.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{asset.locationDetails}</span>
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Área</span>
                    <span className="text-slate-700 font-medium">{asset.area}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vistorias</span>
                    <span className="text-slate-900 font-bold">{assetRecords.length} registros</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {hasNC && (
                    <span className="p-1 rounded bg-rose-100 text-rose-700" title="Possui não conformidades abertas">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {hasWarn && (
                    <span className="p-1 rounded bg-amber-100 text-amber-700" title="Possui observações de atenção">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {!hasNC && !hasWarn && (
                    <span className="p-1 rounded bg-emerald-100 text-emerald-700" title="Todas as condições normais">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedAssetForHistory(asset)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" />
                  Ver Histórico
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      {selectedAssetForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {selectedAssetForHistory.code}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Histórico de Inspeções: {selectedAssetForHistory.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetForHistory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {records.filter((r) => r.assetId === selectedAssetForHistory.id).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhum registro de campo encontrado para este ativo.
                </div>
              ) : (
                records
                  .filter((r) => r.assetId === selectedAssetForHistory.id)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => {
                        setSelectedAssetForHistory(null);
                        onNavigateToRecord(rec.id);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          {rec.date} às {rec.time}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.conditionFound === 'NORMAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.conditionFound === 'ATENÇÃO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.conditionFound}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{rec.itemInspected}</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{rec.inspectorDescription}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Cadastrar Novo Ativo Técnico</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código do Ativo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DRN-PL-005 ou ELE-SUB-02"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Ativo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Canal Coletor Secundário Norte"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Área / Setor *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ID do Tipo de Inspeção</label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="type-drn">DRN — Drenagem</option>
                  <option value="type-ele">ELE — Elétrica</option>
                  <option value="type-snh">SNH — Sinalização Horizontal</option>
                  <option value="type-avs">AVS — Auxílios Visuais</option>
                  <option value="type-civ">CIV — Infraestrutura Civil</option>
                  <option value="type-rac">RAC — Resposta a Emergências</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detalhes de Localização</label>
                <input
                  type="text"
                  placeholder="Ex: Ao lado do Box 14, Pátio 1"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Salvar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
