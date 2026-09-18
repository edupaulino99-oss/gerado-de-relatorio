import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  MapPin,
  FileDown,
  Camera,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Inspection, InspectionTypeConfig, FieldRecord } from '../types';

interface InspectionsListViewProps {
  inspections: Inspection[];
  types: InspectionTypeConfig[];
  records: FieldRecord[];
  onSelectInspection: (inspectionId: string) => void;
  onNavigateTab: (tab: string) => void;
  onGenerateReport: (inspection: Inspection) => void;
}

export const InspectionsListView: React.FC<InspectionsListViewProps> = ({
  inspections,
  types,
  records,
  onSelectInspection,
  onNavigateTab,
  onGenerateReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredInspections = inspections.filter((insp) => {
    const matchesSearch =
      insp.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.unitAirport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.responsible.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || insp.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || insp.typeId === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campanhas de Inspeção Técnica</h2>
          <p className="text-xs text-slate-500">
            Acompanhe o status das inspeções periódicas, registros e relatórios emitidos
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('nova-inspecao')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Inspeção
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por número, local, área ou responsável..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Tipos</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Aprovada">Aprovada</option>
          </select>
        </div>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspections.map((insp) => {
          const currentType = types.find((t) => t.id === insp.typeId);
          const inspRecords = records.filter((r) => r.inspectionId === insp.id);
          const isDone = insp.status === 'Concluída' || insp.status === 'Aprovada';

          const ncCount = inspRecords.filter(
            (r) => r.conditionFound === 'NÃO CONFORMIDADE' || r.conditionFound === 'CRÍTICA'
          ).length;
          const normalCount = inspRecords.filter((r) => r.conditionFound === 'NORMAL').length;

          return (
            <div
              key={insp.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Header Box */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                    {insp.number}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {insp.status}
                  </span>
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {currentType?.code} — {currentType?.name || insp.typeId}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                  {insp.area}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{insp.unitAirport}</span>
                </p>
              </div>

              {/* Body stats */}
              <div className="p-5 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {insp.date}
                  </span>
                  <span>{insp.startTime} às {insp.endTime}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 truncate pr-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{insp.responsible}</span>
                  </span>
                </div>

                {/* Progress Mini Bar */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">
                      {inspRecords.length} Registros de Campo
                    </span>
                    <span className="font-bold text-slate-700">
                      {normalCount} Normais / {ncCount} NCs
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      style={{
                        width: `${inspRecords.length > 0 ? (normalCount / inspRecords.length) * 100 : 0}%`,
                      }}
                      className="h-full bg-emerald-500"
                    />
                    <div
                      style={{
                        width: `${inspRecords.length > 0 ? (ncCount / inspRecords.length) * 100 : 0}%`,
                      }}
                      className="h-full bg-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectInspection(insp.id);
                    onNavigateTab('registro-campo');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Campo</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onGenerateReport(insp)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Gerar Relatório Técnico Word (.docx)"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-400" />
                    <span>Word</span>
                  </button>

                  <button
                    onClick={() => onSelectInspection(insp.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Ver detalhes da inspeção"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
