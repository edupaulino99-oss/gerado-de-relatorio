import React from 'react';
import {
  ClipboardList,
  Layers,
  Camera,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileDown,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Inspection, FieldRecord, Asset, NonConformity, TechnicalRecommendation, GeneratedReport, InspectionTypeConfig } from '../types';

interface DashboardViewProps {
  inspections: Inspection[];
  records: FieldRecord[];
  assets: Asset[];
  types: InspectionTypeConfig[];
  nonConformities: NonConformity[];
  recommendations: TechnicalRecommendation[];
  reports: GeneratedReport[];
  onNavigateTab: (tab: string) => void;
  onSelectInspection: (inspectionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inspections,
  records,
  assets,
  types,
  nonConformities,
  recommendations,
  reports,
  onNavigateTab,
  onSelectInspection,
}) => {
  // Metric calculations
  const totalInspections = inspections.length;
  const completedInspections = inspections.filter((i) => i.status === 'Concluída' || i.status === 'Aprovada').length;
  const pendingInspections = inspections.filter((i) => i.status === 'Em Andamento').length;

  const totalAssets = assets.length;
  const totalRecords = records.length;

  const normalCount = records.filter((r) => r.conditionFound === 'NORMAL').length;
  const attentionCount = records.filter((r) => r.conditionFound === 'ATENÇÃO').length;
  const ncRecordsCount = records.filter((r) => r.conditionFound === 'NÃO CONFORMIDADE').length;
  const criticalCount = records.filter((r) => r.conditionFound === 'CRÍTICA').length;

  const openNCCount = nonConformities.filter((nc) => nc.status !== 'Encerrada' && nc.status !== 'Resolvida').length;
  const pendingRecommendations = recommendations.filter((r) => r.status === 'Pendente' || r.status === 'Em Andamento').length;

  // 1. Chart Data: Conditions Distribution
  const conditionChartData = [
    { name: 'Normal', value: normalCount, color: '#10B981' },
    { name: 'Atenção', value: attentionCount, color: '#F59E0B' },
    { name: 'Não Conformidade', value: ncRecordsCount, color: '#F43F5E' },
    { name: 'Crítica', value: criticalCount, color: '#DC2626' },
  ];

  // 2. Chart Data: Records by Inspection Type
  const typeMap = new Map<string, string>();
  types.forEach((t) => typeMap.set(t.id, t.code.split(' — ')[1] || t.name));

  const recordsByType = types.map((t) => {
    const recs = records.filter((r) => r.inspectionTypeId === t.id);
    const ncs = recs.filter((r) => r.conditionFound === 'NÃO CONFORMIDADE' || r.conditionFound === 'CRÍTICA').length;
    const warns = recs.filter((r) => r.conditionFound === 'ATENÇÃO').length;
    const goods = recs.filter((r) => r.conditionFound === 'NORMAL').length;
    return {
      typeCode: t.code.split(' — ')[1] || t.code,
      name: t.name,
      Normais: goods,
      Atenção: warns,
      NãoConformidades: ncs,
      total: recs.length,
    };
  });

  // 3. Severity Distribution
  const severityChartData = [
    {
      severidade: 'Baixa',
      quantidade: records.filter((r) => r.severity === 'Baixa').length,
      fill: '#0284C7',
    },
    {
      severidade: 'Média',
      quantidade: records.filter((r) => r.severity === 'Média').length,
      fill: '#F59E0B',
    },
    {
      severidade: 'Alta',
      quantidade: records.filter((r) => r.severity === 'Alta').length,
      fill: '#EA580C',
    },
    {
      severidade: 'Crítica',
      quantidade: records.filter((r) => r.severity === 'Crítica').length,
      fill: '#DC2626',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Corporate Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              SISTEMA CORPORATIVO DE AUDITORIA & ENGENHARIA
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Assistente IA Ativo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Painel Executivo de Inspeções Técnicas Periódicas
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Supervisão contínua de ativos aeroportuários e prediais com conformidade regulamentar,
            validação humana de evidências e consolidação automatizada de relatórios em Word (.docx).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('nova-inspecao')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nova Inspeção
          </button>
          <button
            onClick={() => onNavigateTab('registro-campo')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            Coleta em Campo
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (10 Required Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Inspections */}
        <div
          onClick={() => onNavigateTab('inspecoes')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Inspeções
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalInspections}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{completedInspections} concluídas</span>
            <span className="text-blue-600 font-semibold">{pendingInspections} em andamento</span>
          </div>
        </div>

        {/* Total Assets */}
        <div
          onClick={() => onNavigateTab('ativos')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Ativos
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalAssets}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cadastrados em 6 modalidades técnicas
          </div>
        </div>

        {/* Total Records */}
        <div
          onClick={() => onNavigateTab('registro-campo')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registros Campo
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRecords}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Fotos + GPS + Evidências
          </div>
        </div>

        {/* Normal Conditions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Condições Normais
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{normalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalRecords > 0 ? Math.round((normalCount / totalRecords) * 100) : 0}% da infraestrutura conforme
          </div>
        </div>

        {/* Attention Conditions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Em Atenção
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{attentionCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Requerem manutenção preventiva
          </div>
        </div>

        {/* Non-Conformities */}
        <div
          onClick={() => onNavigateTab('nao-conformidades')}
          className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs hover:shadow-md hover:border-rose-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Não Conformidades
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{openNCCount}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            {criticalCount > 0 ? `${criticalCount} em estado crítico` : 'Sem apontamentos críticos'}
          </div>
        </div>

        {/* Critical Conditions */}
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Condições Críticas
            </span>
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700">{criticalCount}</div>
          <div className="text-[11px] text-red-800 font-bold mt-1">
            Prioridade máxima de resposta
          </div>
        </div>

        {/* Pending Recommendations */}
        <div
          onClick={() => onNavigateTab('recomendacoes')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recomendações
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingRecommendations}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ações técnicas validadas
          </div>
        </div>

        {/* Reports Generated */}
        <div
          onClick={() => onNavigateTab('relatorios')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Relatórios Word
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{reports.length}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            Emitidos em formato .docx
          </div>
        </div>

        {/* IA Confidence Index */}
        <div
          onClick={() => onNavigateTab('analise-ia')}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 shadow-2xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Confiabilidade IA
            </span>
            <div className="p-2 rounded-lg bg-purple-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900">92.4%</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            100% com validação humana
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Ocorrências por Tipo de Inspeção */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Condições por Tipo de Inspeção
              </h3>
              <p className="text-xs text-slate-500">
                Distribuição de registros entre normalidade, atenção e não conformidade por disciplina
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Dados Reais
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recordsByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="typeCode" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Normais" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Atenção" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NãoConformidades" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Donut Distribution of Conditions */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">
                Condições Encontradas
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Total: {totalRecords}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Percentual global da qualidade dos ativos auditados
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {conditionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {conditionChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Active Inspections & Recent Critical Non-Conformities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Inspections List */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Campanhas de Inspeção em Destaque
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe o andamento das vistorias e gere o relatório Word de cada uma
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('inspecoes')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {inspections.slice(0, 3).map((insp) => {
              const currentType = types.find((t) => t.id === insp.typeId);
              const inspRecords = records.filter((r) => r.inspectionId === insp.id);
              const isFinished = insp.status === 'Concluída';

              return (
                <div
                  key={insp.id}
                  onClick={() => onSelectInspection(insp.id)}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                        {insp.number}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {currentType?.name || insp.typeId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFinished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {insp.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-900 mt-1 truncate">
                      {insp.unitAirport} — {insp.area}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Data: {insp.date} ({insp.startTime} às {insp.endTime}) • Resp: {insp.responsible}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right sm:pr-3 sm:border-r border-slate-200">
                      <div className="text-sm font-black text-slate-900">{inspRecords.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Registros</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInspection(insp.id);
                        onNavigateTab('relatorios');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-blue-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Bars Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Distribuição por Grau de Severidade
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Classificação técnica de impacto operacional e segurança
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityChartData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 15, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="severidade" type="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="quantidade" radius={[0, 6, 6, 0]}>
                  {severityChartData.map((entry, index) => (
                    <Cell key={`sev-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Classificação conforme critérios técnicos da engenharia</span>
            <button
              onClick={() => onNavigateTab('configuracoes')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Ver critérios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
