import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { TechnicalRecommendation } from '../types';

interface RecommendationsViewProps {
  recommendations: TechnicalRecommendation[];
  onUpdateRecommendation: (rec: TechnicalRecommendation) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onUpdateRecommendation,
}) => {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = recommendations.filter((r) => {
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  const handleToggleStatus = (rec: TechnicalRecommendation, newStatus: TechnicalRecommendation['status']) => {
    onUpdateRecommendation({
      ...rec,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Recomendações Técnicas Priorizadas
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento das ordens de melhoria, corretivas e preventivas geradas pelas inspeções
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Prioridade:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Implementada">Implementada</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    rec.priority === 'Alta'
                      ? 'bg-rose-100 text-rose-800'
                      : rec.priority === 'Média'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Prioridade {rec.priority}
                </span>

                <span className="text-xs font-bold text-slate-900">{rec.assetName}</span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    rec.origin === 'IA'
                      ? 'bg-purple-100 text-purple-800'
                      : rec.origin === 'Inspetor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {rec.origin === 'IA' && <Sparkles className="w-3 h-3 text-purple-600" />}
                  {rec.origin === 'Inspetor' && <User className="w-3 h-3 text-blue-600" />}
                  {rec.origin === 'Norma' && <ShieldCheck className="w-3 h-3 text-slate-600" />}
                  Origem: {rec.origin}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {rec.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  Prazo sugerido: {rec.deadline}
                </span>
                <span className="text-slate-400">Ativo: {rec.assetName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              {(['Pendente', 'Em Andamento', 'Implementada'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleToggleStatus(rec, st)}
                  disabled={rec.status === st}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    rec.status === st
                      ? st === 'Implementada'
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-slate-900 text-white cursor-default'
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
