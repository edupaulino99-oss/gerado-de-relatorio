import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Sparkles,
  Building2,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onQuickNewRecord: () => void;
  onSelectTab: (tab: string) => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Painel Geral e Indicadores', subtitle: 'Visão executiva em tempo real de ativos, condições e conformidades' },
  'nova-inspecao': { title: 'Abertura de Nova Inspeção', subtitle: 'Cadastre os parâmetros da inspeção periódica para iniciar o trabalho em campo' },
  inspecoes: { title: 'Inspeções Técnicas', subtitle: 'Gerenciamento de campanhas de inspeção em andamento e concluídas' },
  'registro-campo': { title: 'Registro de Campo', subtitle: 'Coleta otimizada para celular/tablet: fotos, GPS, observações e análise IA' },
  ativos: { title: 'Inventário de Ativos', subtitle: 'Cadastro técnico, geolocalização e histórico de intervenções' },
  'analise-ia': { title: 'Assistente Técnico de IA', subtitle: 'Análise criteriosa de evidências fotográficas e validação humana compulsória' },
  documentos: { title: 'Documentos para Análise da IA', subtitle: 'Repositório de normas (RBAC/NBR), manuais de fabricantes e relatórios' },
  'nao-conformidades': { title: 'Gestão de Não Conformidades (RNC)', subtitle: 'Tratamento de apontamentos, severidade, prazos e encerramentos' },
  recomendacoes: { title: 'Recomendações Técnicas', subtitle: 'Plano de ação prioritário consolidado a partir das inspeções' },
  relatorios: { title: 'Gerador Automático de Relatórios Word', subtitle: 'Emissão formal em formato Word (.docx) com capa, tabelas, evidências e parecer' },
  historico: { title: 'Histórico & Comparação Temporal', subtitle: 'Rastreabilidade de ocorrências recorrentes, agravamentos ou melhorias' },
  configuracoes: { title: 'Configurações do Sistema', subtitle: 'Tipos de inspeção modulares, critérios de severidade e manutenção do banco' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenSearch,
  onQuickNewRecord,
  onSelectTab,
}) => {
  const currentInfo = TAB_TITLES[currentTab] || {
    title: 'Sistema de Inspeções Técnicas',
    subtitle: 'Assistente Corporativo com IA',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Building2 className="w-3 h-3 text-blue-600" />
              SBGR — Aeroporto Int. Guarulhos
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {currentTab.replace('-', ' ')}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors"
          title="Pesquisa Global no Sistema"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Pesquisar ativos, inspeções, OS...</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
            Buscar
          </kbd>
        </button>

        {/* Quick field record button */}
        <button
          onClick={onQuickNewRecord}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Registro de Campo</span>
          <span className="sm:hidden">Campo</span>
        </button>

        {/* Quick Report generator shortcut */}
        <button
          onClick={() => onSelectTab('relatorios')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
          title="Gerador de Relatório em Word"
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>Relatório .docx</span>
        </button>
      </div>
    </header>
  );
};
