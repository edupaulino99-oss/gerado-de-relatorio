import React, { useState, useRef } from 'react';
import {
  FolderArchive,
  Upload,
  FileText,
  Search,
  BookOpen,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  Building2,
  Filter,
} from 'lucide-react';
import { ReferenceDocument, InspectionTypeConfig, Asset, Inspection } from '../types';

interface ReferenceDocsViewProps {
  documents: ReferenceDocument[];
  types: InspectionTypeConfig[];
  assets: Asset[];
  inspections: Inspection[];
  onSaveDocument: (doc: ReferenceDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const ReferenceDocsView: React.FC<ReferenceDocsViewProps> = ({
  documents,
  types,
  assets,
  inspections,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Document State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<ReferenceDocument['scope']>('GERAL');
  const [inspectionTypeId, setInspectionTypeId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [inspectionId, setInspectionId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('PDF');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const ext = file.name.split('.').pop()?.toUpperCase() || 'DOC';
    setFileType(ext);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName) {
      alert('Por favor, selecione um arquivo e informe o título do documento.');
      return;
    }

    const newDoc: ReferenceDocument = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      fileName,
      type: (['PDF', 'DOCX', 'XLSX', 'TXT', 'IMG'].includes(fileType) ? fileType : 'PDF') as any,
      category: 'Norma Técnica',
      scope: (scope === 'TIPO_INSPECAO' ? 'Tipo de Inspeção' : scope === 'ATIVO_ESPECIFICO' ? 'Ativo Específico' : 'Geral') as any,
      scopeTargetId: scope === 'TIPO_INSPECAO' ? inspectionTypeId : scope === 'ATIVO_ESPECIFICO' ? assetId : undefined,
      summary: description.trim() || title.trim(),
      uploadDate: new Date().toLocaleDateString('pt-BR'),
      fileSize: fileSize || '1.5 MB',
      isUsedByAI: true,
    };

    onSaveDocument(newDoc);
    setShowUploadModal(false);
    setTitle('');
    setDescription('');
    setFileName('');
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = scopeFilter === 'ALL' || doc.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              REPOSITÓRIO TÉCNICO NORMATIVO
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Base de Conhecimento IA
            </span>
          </div>
          <h2 className="text-xl font-bold">Documentos para Análise da IA</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Anexe regulamentos técnicos (RBAC, NBRs), manuais de fabricantes, projetos executivos e laudos anteriores.
            A IA utiliza estes documentos para fundamentar critérios, tolerâncias e recomendações oficiais.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all shrink-0"
        >
          <Upload className="w-4 h-4" />
          Anexar Documento Técnico
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por título, norma, RBAC, manual ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">Todos os Escopos</option>
            <option value="GERAL">Geral (Todo o Sistema)</option>
            <option value="TIPO_INSPECAO">Por Tipo de Inspeção</option>
            <option value="ATIVO_ESPECIFICO">Por Ativo Específico</option>
            <option value="INSPECAO_ESPECIFICA">Por Inspeção Específica</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const typeObj = types.find((t) => t.id === doc.scopeTargetId);
          const assetObj = assets.find((a) => a.id === doc.scopeTargetId);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-200">
                    {doc.type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {doc.scope}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{doc.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {doc.summary}
                </p>

                {/* Scope Binding info */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                  {typeObj && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Tipo:</span>
                      <span className="font-bold text-slate-800">{typeObj.name}</span>
                    </div>
                  )}
                  {assetObj && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Ativo:</span>
                      <span className="font-bold text-blue-700 font-mono">{assetObj.code}</span>
                    </div>
                  )}
                  <div className="text-slate-400">
                    {doc.fileName} • {doc.fileSize}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Envio: {doc.uploadDate}</span>
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Excluir documento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Anexar Documento Técnico de Apoio</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
              {/* File input */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,image/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="font-bold text-slate-700">
                    {fileName ? fileName : 'Clique para selecionar arquivo técnico'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Suporta PDF, Word (.docx), Excel (.xlsx), Imagens ou TXT
                  </span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: RBAC 153 — Emenda 07 ou Manual da Válvula Borboleta"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição / Instruções para a IA</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tabela 3.2 define tolerância máxima de 10mm para desnível de tampas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Escopo de Associação *</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                >
                  <option value="GERAL">Geral (Disponível em todas as inspeções)</option>
                  <option value="TIPO_INSPECAO">Associar a um Tipo de Inspeção</option>
                  <option value="ATIVO_ESPECIFICO">Associar a um Ativo Específico</option>
                  <option value="INSPECAO_ESPECIFICA">Associar a uma Inspeção Específica</option>
                </select>
              </div>

              {scope === 'TIPO_INSPECAO' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selecione o Tipo de Inspeção:</label>
                  <select
                    value={inspectionTypeId}
                    onChange={(e) => setInspectionTypeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="">Selecione...</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} — {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {scope === 'ATIVO_ESPECIFICO' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selecione o Ativo Técnico:</label>
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="">Selecione...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
