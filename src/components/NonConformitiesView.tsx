import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { NonConformity } from '../types';

interface NonConformitiesViewProps {
  nonConformities: NonConformity[];
  onUpdateNC: (updated: NonConformity) => void;
}

export const NonConformitiesView: React.FC<NonConformitiesViewProps> = ({
  nonConformities,
  onUpdateNC,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);

  const filteredNCs = nonConformities.filter((nc) => {
    const matchesSearch =
      nc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || nc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (nc: NonConformity, newStatus: NonConformity['status']) => {
    const updated: NonConformity = {
      ...nc,
      status: newStatus,
      closureDate: newStatus === 'Resolvida' || newStatus === 'Encerrada' ? new Date().toLocaleDateString('pt-BR') : nc.closureDate,
    };
    onUpdateNC(updated);
    if (selectedNC?.id === nc.id) {
      setSelectedNC(updated);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Gestão de Não Conformidades (RNC)
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe planos de ação corretiva, prazos regulamentares e encerramento de apontamentos
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por código (ex: NC-001), ativo, responsável ou anomalia..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Aberta">Aberta</option>
            <option value="Em análise">Em análise</option>
            <option value="Em tratamento">Em tratamento</option>
            <option value="Resolvida">Resolvida</option>
            <option value="Encerrada">Encerrada</option>
          </select>
        </div>
      </div>

      {/* RNC List */}
      <div className="space-y-3">
        {filteredNCs.map((nc) => (
          <div
            key={nc.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  {nc.code}
                </span>
                <span className="text-xs font-bold text-slate-800">{nc.assetName}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    nc.status === 'Aberta'
                      ? 'bg-rose-100 text-rose-800'
                      : nc.status === 'Em tratamento'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {nc.status}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Severidade: {nc.severity}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 font-semibold">{nc.description}</p>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <strong className="text-slate-900">Recomendação Técnica:</strong> {nc.recommendation}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Resp: {nc.responsible}
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  Prazo: {nc.deadline}
                </span>
                {nc.closureDate && (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Encerrada em: {nc.closureDate}
                  </span>
                )}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <span className="text-xs font-semibold text-slate-500 mr-1">Alterar:</span>
              {(['Aberta', 'Em tratamento', 'Resolvida', 'Encerrada'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(nc, st)}
                  disabled={nc.status === st}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    nc.status === st
                      ? 'bg-slate-900 text-white cursor-default'
                      : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
