import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Layers,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Database,
} from 'lucide-react';
import { InspectionTypeConfig } from '../types';

interface SettingsViewProps {
  types: InspectionTypeConfig[];
  onSaveType: (newType: InspectionTypeConfig) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  types,
  onSaveType,
  onResetData,
}) => {
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newStandard, setNewStandard] = useState('RBAC 153 / NBR aplicável');
  const [newScopeItems, setNewScopeItems] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const items = newScopeItems
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const created: InspectionTypeConfig = {
      id: `type-${Date.now()}`,
      code: newCode.trim(),
      name: newName.trim(),
      description: `Módulo técnico para inspeção periódica de ${newName.trim()}`,
      referenceStandard: newStandard.trim(),
      scopeItems: items.length > 0 ? items : ['Itens gerais de fiscalização técnica'],
      iconName: 'Layers',
      color: '#2563eb',
    };

    onSaveType(created);
    setShowAddTypeModal(false);
    setNewCode('');
    setNewName('');
    setNewScopeItems('');
  };

  const handleConfirmReset = () => {
    if (
      window.confirm(
        'Tem certeza que deseja redefinir os dados para o padrão de demonstração? Quaisquer novos registros serão restaurados aos dados iniciais.'
      )
    ) {
      onResetData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Configurações do Sistema de Inspeção
        </h2>
        <p className="text-xs text-slate-500">
          Gerenciamento de módulos de inspeção, parâmetros técnicos e manutenção de dados locais
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Dados restaurados com sucesso para o banco corporativo padrão!
        </div>
      )}

      {/* Section 1: Modular Inspection Types */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tipos de Inspeção Cadastrados (Arquitetura Modular)
            </h3>
            <p className="text-xs text-slate-500">
              O sistema suporta expansão contínua com novos módulos técnicos especializados
            </p>
          </div>
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Tipo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {types.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {t.code}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Módulo Ativo
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <strong>Norma de Referência:</strong> {t.referenceStandard}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Technical Severity Scales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Matriz de Classificação de Condição & Severidade
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-800 uppercase block">NORMAL</span>
            <p className="text-emerald-950">Ativo opera dentro dos parâmetros de projeto e normas vigentes.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="font-bold text-amber-800 uppercase block">ATENÇÃO</span>
            <p className="text-amber-950">Degradação inicial identificada. Requer manutenção preventiva programada.</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
            <span className="font-bold text-rose-800 uppercase block">NÃO CONFORMIDADE</span>
            <p className="text-rose-950">Descumprimento de requisito normativo ou técnico. Exige plano de ação (RNC).</p>
          </div>
          <div className="p-3 rounded-xl bg-red-100 border border-red-300 space-y-1">
            <span className="font-bold text-red-900 uppercase block">CRÍTICA</span>
            <p className="text-red-950">Risco operacional imediato à segurança. Intervenção ou interdição prioritária.</p>
          </div>
        </div>
      </div>

      {/* Section 3: Data Management & Reset */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            Manutenção dos Dados de Demonstração
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Restaura todas as inspeções, registros de campo com fotos e relatórios para o estado inicial corporativo.
          </p>
        </div>

        <button
          onClick={handleConfirmReset}
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Restaurar Dados Padrão
        </button>
      </div>

      {/* Add Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Novo Módulo de Tipo de Inspeção</h3>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateType} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sigla / Código *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SEG ou MEC"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo do Módulo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inspeção de Sistemas Mecânicos e HVAC"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Norma de Referência</label>
                <input
                  type="text"
                  value={newStandard}
                  onChange={(e) => setNewStandard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Itens de Escopo (um por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Compressores&#10;Dutos de exaustão&#10;Válvulas de alívio"
                  value={newScopeItems}
                  onChange={(e) => setNewScopeItems(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Cadastrar Tipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
