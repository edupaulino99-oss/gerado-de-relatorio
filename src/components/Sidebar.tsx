import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Camera,
  Layers,
  Sparkles,
  FolderArchive,
  AlertTriangle,
  CheckSquare,
  FileDown,
  History,
  Settings,
  ChevronRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openNCCount: number;
  pendingRecCount: number;
  activeInspectionCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openNCCount,
  pendingRecCount,
  activeInspectionCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'nova-inspecao', label: 'Nova Inspeção', icon: PlusCircle, badge: 'Criar' },
    { id: 'inspecoes', label: 'Inspeções', icon: ClipboardList, count: activeInspectionCount > 0 ? activeInspectionCount : undefined },
    { id: 'registro-campo', label: 'Registro de Campo', icon: Camera, highlight: true },
    { id: 'ativos', label: 'Ativos', icon: Layers },
    { id: 'analise-ia', label: 'Análise com IA', icon: Sparkles, aiGlow: true },
    { id: 'documentos', label: 'Documentos de Referência', icon: FolderArchive },
    { id: 'nao-conformidades', label: 'Não Conformidades', icon: AlertTriangle, count: openNCCount, danger: true },
    { id: 'recomendacoes', label: 'Recomendações', icon: CheckSquare, count: pendingRecCount },
    { id: 'relatorios', label: 'Relatórios (.docx)', icon: FileDown },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-18 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                SIT — Engenharia
              </div>
              <div className="text-sm font-bold text-white tracking-tight leading-tight">
                Inspeções Técnicas IA
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Operational Status Pill */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Modo Campo & Offline
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ATIVO
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 transition-colors ${
                      isActive
                        ? 'text-white'
                        : item.aiGlow
                        ? 'text-purple-400 group-hover:text-purple-300'
                        : item.danger
                        ? 'text-rose-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.danger
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {!isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info / Inspector */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
              MA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">
                Eng. Marcelo Albuquerque
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                CREA 506.291-SP | Perito
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
