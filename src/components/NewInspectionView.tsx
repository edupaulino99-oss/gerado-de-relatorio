import React, { useState } from 'react';
import {
  ClipboardList,
  Calendar,
  Clock,
  User,
  Users,
  MapPin,
  Building2,
  FileText,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Inspection, InspectionTypeConfig } from '../types';

interface NewInspectionViewProps {
  types: InspectionTypeConfig[];
  onSaveInspection: (inspection: Inspection) => void;
  onNavigateTab: (tab: string) => void;
  onSelectInspection: (inspectionId: string) => void;
}

export const NewInspectionView: React.FC<NewInspectionViewProps> = ({
  types,
  onSaveInspection,
  onNavigateTab,
  onSelectInspection,
}) => {
  const currentYear = new Date().getFullYear();
  const nextSeq = String(Math.floor(Math.random() * 800) + 100);
  const autoNumber = `INSP-${currentYear}-${nextSeq}`;

  const [number, setNumber] = useState(autoNumber);
  const [typeId, setTypeId] = useState(types[0]?.id || 'type-drn');
  const [unitAirport, setUnitAirport] = useState('SBGR — Aeroporto Internacional de Guarulhos');
  const [area, setArea] = useState('Lado Ar — Pátio de Aeronaves e Faixa de Pista');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('12:00');
  const [responsible, setResponsible] = useState('Eng. Marcelo Albuquerque (CREA 506.291-SP)');
  const [team, setTeam] = useState('Equipe Técnica de Infraestrutura e Pavimentos');
  const [generalNotes, setGeneralNotes] = useState('');
  const [createdSuccess, setCreatedSuccess] = useState<Inspection | null>(null);

  const selectedType = types.find((t) => t.id === typeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !unitAirport.trim() || !responsible.trim()) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const newInsp: Inspection = {
      id: `insp-${Date.now()}`,
      number: number.trim(),
      typeId,
      unitAirport: unitAirport.trim(),
      area: area.trim(),
      date,
      startTime,
      endTime,
      responsible: responsible.trim(),
      team: team.trim(),
      generalNotes: generalNotes.trim(),
      status: 'Em Andamento',
      createdAt: new Date().toISOString(),
      recordIds: [],
    };

    onSaveInspection(newInsp);
    setCreatedSuccess(newInsp);
  };

  if (createdSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Inspeção {createdSuccess.number} Aberta com Sucesso!
        </h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          A campanha técnica foi cadastrada no sistema corporativo. Você já pode registrar os ativos inspecionados em campo, fotografar e utilizar o Assistente de IA.
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-md mx-auto mb-8 space-y-1.5 text-xs text-slate-700">
          <div><strong className="text-slate-900">Tipo:</strong> {selectedType?.name}</div>
          <div><strong className="text-slate-900">Unidade:</strong> {createdSuccess.unitAirport}</div>
          <div><strong className="text-slate-900">Área:</strong> {createdSuccess.area}</div>
          <div><strong className="text-slate-900">Responsável:</strong> {createdSuccess.responsible}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              onSelectInspection(createdSuccess.id);
              onNavigateTab('registro-campo');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <span>Inserir Registros de Campo Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab('inspecoes')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm"
          >
            Ver Todas as Inspeções
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Formulário de Nova Inspeção</h2>
              <p className="text-xs text-slate-500">
                Preencha os dados da ordem de inspeção periódica conforme os procedimentos técnicos
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Number and Inspection Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Número da Inspeção *
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
              <p className="text-[11px] text-slate-500 mt-1">Identificador unívoco do documento técnico</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tipo de Inspeção *
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>
              {selectedType && (
                <p className="text-[11px] text-blue-600 mt-1 font-medium">
                  Norma de referência: {selectedType.referenceStandard}
                </p>
              )}
            </div>
          </div>

          {/* Scope description card */}
          {selectedType && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700">
              <strong className="text-blue-900 block mb-1">Itens Abrangidos neste Tipo ({selectedType.code}):</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                {selectedType.scopeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 2: Unidade/Aeroporto and Área */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Unidade / Aeroporto *
              </label>
              <input
                type="text"
                required
                value={unitAirport}
                onChange={(e) => setUnitAirport(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Área / Setor *
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Data, Horas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Data da Inspeção *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Hora Inicial *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Hora Final
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Responsável e Equipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Responsável Técnico (Nome e CREA) *
              </label>
              <input
                type="text"
                required
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Equipe Operacional / Técnicos
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Observações Gerais */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Observações Gerais e Condições Meteorológicas
            </label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Ex: Condições de tempo seco, visibilidade irrestrita, pista sem tráfego no horário..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('inspecoes')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              Criar e Iniciar Inspeção
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
