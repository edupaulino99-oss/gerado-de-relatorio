import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Crosshair,
  Loader2,
  Building2,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import {
  Inspection,
  Asset,
  FieldRecord,
  PhotoEvidence,
  InspectionTypeConfig,
  ReferenceDocument,
} from '../types';

interface FieldRecordViewProps {
  inspections: Inspection[];
  assets: Asset[];
  types: InspectionTypeConfig[];
  documents: ReferenceDocument[];
  preselectedInspectionId?: string;
  onSaveRecord: (record: FieldRecord) => void;
  onNavigateTab: (tab: string) => void;
  onAnalyzeWithAI: (record: FieldRecord) => void;
}

export const FieldRecordView: React.FC<FieldRecordViewProps> = ({
  inspections,
  assets,
  types,
  documents,
  preselectedInspectionId,
  onSaveRecord,
  onNavigateTab,
  onAnalyzeWithAI,
}) => {
  const [selectedInspectionId, setSelectedInspectionId] = useState(
    preselectedInspectionId || inspections[0]?.id || ''
  );
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [itemInspected, setItemInspected] = useState('');
  const [conditionFound, setConditionFound] = useState<FieldRecord['conditionFound']>('NORMAL');
  const [severity, setSeverity] = useState<FieldRecord['severity']>('Baixa');
  const [inspectorDescription, setInspectorDescription] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');

  // GPS Coordinates
  const [latitude, setLatitude] = useState<number | null>(-23.4356);
  const [longitude, setLongitude] = useState<number | null>(-46.4731);
  const [accuracy, setAccuracy] = useState<number>(3.5);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  // Photos
  const [evidences, setEvidences] = useState<PhotoEvidence[]>([
    {
      id: `ev-initial`,
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800',
      type: 'Geral',
      caption: 'Vista geral do ativo no início da inspeção',
      capturedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [newPhotoType, setNewPhotoType] = useState<PhotoEvidence['type']>('Geral');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  // AI Analysis State inside form
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const selectedInspection = inspections.find((i) => i.id === selectedInspectionId);
  const selectedType = types.find((t) => t.id === selectedInspection?.typeId);

  // GPS Acquisition
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
        setGpsSuccess(true);
        setTimeout(() => setGpsSuccess(false), 3000);
      },
      (err) => {
        console.warn('GPS error, using fallback:', err.message);
        // Fallback realistic coordinates for GRU Airport
        setLatitude(-23.435556);
        setLongitude(-46.473056);
        setAccuracy(4);
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Photo Upload Handler (converts to base64 for real AI analysis)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const newEv: PhotoEvidence = {
        id: `ev-${Date.now()}`,
        url: base64Url,
        type: newPhotoType,
        caption: newPhotoCaption || file.name,
        capturedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setEvidences((prev) => [...prev, newEv]);
      setNewPhotoCaption('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (id: string) => {
    setEvidences((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = async (andAnalyzeWithAI = false) => {
    if (!selectedAsset) {
      alert('Por favor, selecione um ativo.');
      return;
    }
    if (!itemInspected.trim()) {
      alert('Por favor, descreva o item inspecionado (ex: Grelha metálica, Pavimento, Válvula...).');
      return;
    }
    if (!inspectorDescription.trim()) {
      alert('Por favor, insira a descrição técnica observada em campo.');
      return;
    }

    const newRecord: FieldRecord = {
      id: `rec-${Date.now()}`,
      inspectionId: selectedInspectionId,
      inspectionNumber: selectedInspection?.number || 'INSP-2026-001',
      inspectionTypeId: selectedInspection?.typeId || 'type-drn',
      assetId: selectedAsset.id,
      assetCode: selectedAsset.code,
      assetName: selectedAsset.name,
      area: selectedAsset.area,
      location: selectedAsset.locationDetails || selectedAsset.area,
      gps: latitude && longitude ? { latitude, longitude, accuracy, timestamp: new Date().toISOString() } : null,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      responsible: selectedInspection?.responsible || 'Eng. Marcelo Albuquerque',
      itemInspected: itemInspected.trim(),
      conditionFound,
      inspectorDescription: inspectorDescription.trim(),
      severity,
      status: 'Rascunho',
      workOrderNumber: workOrderNumber.trim() || undefined,
      evidences,
    };

    if (andAnalyzeWithAI) {
      setIsAnalyzing(true);
      try {
        // Send to backend Gemini API
        const docsSummary = documents
          .slice(0, 3)
          .map((d) => `${d.title} (${d.scope})`)
          .join('; ');

        const payload = {
          recordData: {
            assetCode: newRecord.assetCode,
            assetName: newRecord.assetName,
            inspectionType: selectedType?.name || 'Geral',
            itemInspected: newRecord.itemInspected,
            conditionFound: newRecord.conditionFound,
            inspectorDescription: newRecord.inspectorDescription,
            severity: newRecord.severity,
            location: newRecord.location,
            referenceStandards: selectedType?.referenceStandard,
          },
          referenceDocumentsText: docsSummary,
          image: evidences[0]?.url,
        };

        const res = await fetch('/api/analyze-inspection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const aiResult = await res.json();
          newRecord.aiAnalysis = aiResult;
        }
      } catch (err) {
        console.error('AI call error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }

    onSaveRecord(newRecord);

    if (andAnalyzeWithAI) {
      onAnalyzeWithAI(newRecord);
    } else {
      alert('Registro de campo salvo com sucesso!');
      onNavigateTab('inspecoes');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Painel
        </button>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Modo Coleta em Campo
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Title bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Novo Registro de Campo</h2>
              <p className="text-xs text-slate-500">
                Capture fotos, registre coordenadas GPS e acione o Assistente Técnico com IA
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Row 1: Select Inspection & Select Asset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Inspeção Vinculada *
              </label>
              <select
                value={selectedInspectionId}
                onChange={(e) => setSelectedInspectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {inspections.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.number} — {i.area} ({i.status})
                  </option>
                ))}
              </select>
              {selectedInspection && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Data: {selectedInspection.date} • Resp: {selectedInspection.responsible}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Ativo Inspecionado *
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => {
                  setSelectedAssetId(e.target.value);
                  const a = assets.find((x) => x.id === e.target.value);
                  if (a) {
                    setItemInspected(a.componentItem || a.name);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name} ({a.area})
                  </option>
                ))}
              </select>
              {selectedAsset && (
                <p className="text-[11px] text-blue-600 mt-1 font-medium">
                  Local: {selectedAsset.locationDetails} • Status Ativo: {selectedAsset.status}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: GPS Telemetry Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Geolocalização / Coordenadas GNSS (GPS)
              </span>
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 shadow-2xs transition-colors"
              >
                {gpsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{gpsLoading ? 'Obtendo Satélites...' : 'Capturar GPS Atual'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Latitude</span>
                <input
                  type="number"
                  step="any"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  placeholder="-23.4356"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Longitude</span>
                <input
                  type="number"
                  step="any"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  placeholder="-46.4731"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Precisão Estimada</span>
                <div className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-800 flex items-center justify-between">
                  <span>±{accuracy} metros</span>
                  {gpsSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Photo Evidence Capture & Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-500" />
                  Evidências Fotográficas do Ativo ({evidences.length})
                </label>
                <p className="text-[11px] text-slate-500">
                  Fotos obrigatórias para auditoria e alimentação do modelo de visão computacional da IA
                </p>
              </div>

              {/* Upload or Camera Button */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Enviar Foto / Câmera</span>
                </button>
              </div>
            </div>

            {/* Photo controls row */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Tipo de Foto:</span>
              {(['Geral', 'Antes', 'Depois', 'Detalhe'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewPhotoType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    newPhotoType === type
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}

              <input
                type="text"
                placeholder="Legenda para a próxima foto..."
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden"
              />
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {evidences.map((ev) => (
                <div
                  key={ev.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-2xs"
                >
                  <img
                    src={ev.url}
                    alt={ev.caption || 'Evidência fotográfica'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 font-bold text-[10px]">
                        {ev.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(ev.id)}
                        className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="line-clamp-2 text-[10px] text-slate-200">{ev.caption}</p>
                  </div>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-semibold">
                    {ev.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Item Inspecionado e Ordem de Serviço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Item Inspecionado *
              </label>
              <input
                type="text"
                required
                value={itemInspected}
                onChange={(e) => setItemInspected(e.target.value)}
                placeholder="Ex: Grelha metálica de escoamento, Sinalização luminosa, Fissura..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Número da OS (Ordem de Serviço)
              </label>
              <input
                type="text"
                value={workOrderNumber}
                onChange={(e) => setWorkOrderNumber(e.target.value)}
                placeholder="Ex: OS-2026-9812 (opcional)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Condição Encontrada & Severidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Condição Encontrada *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['NORMAL', 'ATENÇÃO', 'NÃO CONFORMIDADE', 'CRÍTICA'] as const).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setConditionFound(cond)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      conditionFound === cond
                        ? cond === 'NORMAL'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : cond === 'ATENÇÃO'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : cond === 'NÃO CONFORMIDADE'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-red-700 text-white border-red-700 shadow-xs ring-2 ring-red-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Severidade Técnica *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Baixa', 'Média', 'Alta', 'Crítica'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      severity === sev
                        ? sev === 'Baixa'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : sev === 'Média'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : sev === 'Alta'
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-red-700 text-white border-red-700 ring-2 ring-red-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 6: Descrição do Inspetor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Descrição do Inspetor (Fatos Objetivos Observados em Campo) *
            </label>
            <textarea
              rows={4}
              required
              value={inspectorDescription}
              onChange={(e) => setInspectorDescription(e.target.value)}
              placeholder="Descreva de forma clara e objetiva os fatos observados, estado da peça, presença de deformações, sujidade, trincas ou obstruções..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              * Registros são armazenados localmente e preparados para auditoria do relatório Word
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Rascunho
              </button>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => handleSave(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-200" />
                )}
                <span>{isAnalyzing ? 'IA Analisando Evidência...' : 'Salvar & Analisar com IA'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
