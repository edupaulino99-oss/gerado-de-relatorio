import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with ample limit for photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initialization or safe client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Inspection Analysis Endpoint
app.post("/api/analyze-inspection", async (req, res) => {
  try {
    const {
      imageBase64,
      imageMimeType = "image/jpeg",
      inspectorDescription,
      inspectionType,
      assetName,
      assetCode,
      itemInspected,
      referenceDocsSummary,
      historyPreviousRecord,
      instrumentalData,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY não configurada no servidor. Configure a chave para habilitar a análise de IA.",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é um Engenheiro Perito Especialista e Assistente Técnico Sênior de Inspeções Periódicas de Infraestrutura Aeroportuária e Patrimonial.
Sua missão é atuar como assistente técnico rigoroso, com total integridade e rastreabilidade técnica.

REGRAS INEGOCIÁVEIS:
1. Trabalhe EXCLUSIVAMENTE com as evidências disponíveis (foto, descrição do inspetor, dados do ativo, histórico fornecido e documentos técnicos).
2. NUNCA invente informações, defeitos, normas inexistentes ou medições instrumentais.
3. Se o tipo de inspeção for Sinalização Horizontal e NÃO houver medição instrumental de retrorefletividade declarada, declare explicitamente: "Parâmetro de retrorefletividade não medido instrumentalmente (não estimável exclusivamente por fotografia)".
4. Quando uma informação não puder ser determinada com segurança na imagem, utilize rigorosamente frases como:
   - "Não foi possível determinar pela evidência disponível."
   - "Não há evidência suficiente para confirmar esta condição."
   - "Recomenda-se avaliação técnica complementar."
5. Diferencie claramente:
   - Fato observado (o que está visível sem suposição)
   - Interpretação da imagem (leitura técnica do padrão visual)
   - Possível causa (apenas se houver indício objetivo visível, caso contrário indicar ausência de evidência)
   - Recomendação técnica (ação corretiva, preventiva ou de inspeção complementar)
   - Informação fornecida pelo inspetor
6. Avalie o Nível de Confiança da análise:
   - Alta (85% a 98%): Evidência visual nítida, sem obstrução e com foco adequado.
   - Média (60% a 84%): Evidência parcialmente visível, iluminação desfavorável ou ângulo indireto.
   - Baixa (abaixo de 60%): Resolução insuficiente, evidência inconclusiva. Solicite explicitamente revisão presencial do inspetor.
7. Compare com o histórico do mesmo ativo quando fornecido: identifique se é condição recorrente, ocorrência nova, condição resolvida, persistente ou se houve possível agravamento/melhoria com base estrita nos dados.
8. Classificação sugerida deve ser estritamente uma de: "NORMAL", "ATENÇÃO", "NÃO CONFORMIDADE", "CRÍTICA".
9. Severidade sugerida: "Baixa", "Média", "Alta", "Crítica".`;

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    let cleanBase64 = imageBase64;
    if (imageBase64 && imageBase64.includes("base64,")) {
      cleanBase64 = imageBase64.split("base64,")[1];
    }

    if (cleanBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const contextPrompt = `DADOS DO REGISTRO DE INSPEÇÃO:
- Tipo de Inspeção: ${inspectionType || "Não informado"}
- Ativo: ${assetName || "Não informado"} (Código: ${assetCode || "N/A"})
- Item Inspecionado: ${itemInspected || "Geral"}
- Descrição fornecida pelo Inspetor em campo: "${inspectorDescription || "Sem observações adicionais"}"
- Documentos de Referência / Critérios Técnicos aplicáveis: "${referenceDocsSummary || "Normas técnicas padrão da disciplina"}"
- Histórico de Inspeções Anteriores do Ativo: "${historyPreviousRecord || "Nenhum histórico anterior registrado"}"
- Dados Instrumentais Registrados: "${instrumentalData || "Nenhum dado instrumental registrado"}"

Analise os dados e a fotografia (se presente) e responda no formato JSON estruturado conforme o schema.`;

    parts.push({ text: contextPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemIdentificado: {
              type: Type.STRING,
              description: "Componente ou item técnico identificado na evidência.",
            },
            condicaoVisual: {
              type: Type.STRING,
              description: "Descrição técnica objetiva do estado visual aparente.",
            },
            anomaliaIdentificada: {
              type: Type.STRING,
              description: "Anomalia, falha ou irregularidade detectada, ou 'Nenhuma anomalia evidente'.",
            },
            classificacaoSugerida: {
              type: Type.STRING,
              description: "Uma entre: NORMAL, ATENÇÃO, NÃO CONFORMIDADE, CRÍTICA",
            },
            severidadeSugerida: {
              type: Type.STRING,
              description: "Baixa, Média, Alta ou Crítica",
            },
            nivelConfiancaPercentual: {
              type: Type.NUMBER,
              description: "Percentual numérico de confiança da IA (ex: 88)",
            },
            nivelConfiancaClassificacao: {
              type: Type.STRING,
              description: "Alta, Média ou Baixa",
            },
            fatosObservados: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de fatos estritamente observáveis sem suposições.",
            },
            interpretacaoVisual: {
              type: Type.STRING,
              description: "Interpretação técnica fundamentada do padrão visual.",
            },
            possivelCausa: {
              type: Type.STRING,
              description: "Possível causa se houver evidência clara, ou declaração de insuficiência de evidência.",
            },
            recomendacaoTecnica: {
              type: Type.STRING,
              description: "Recomendação técnica clara, direta e objetiva.",
            },
            necessidadeAvaliacaoComplementar: {
              type: Type.BOOLEAN,
              description: "Se há recomendação de avaliação técnica ou ensaio complementar.",
            },
            justificativaAvaliacaoComplementar: {
              type: Type.STRING,
              description: "Motivo da necessidade de avaliação complementar, se houver.",
            },
            comparacaoHistorica: {
              type: Type.STRING,
              description: "Comparação objetiva com inspeção anterior (recorrente, persistente, nova ou resolvida).",
            },
            fontesUtilizadas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Fontes e referências utilizadas na análise (fotografia, relato, histórico, normas).",
            },
          },
          required: [
            "itemIdentificado",
            "condicaoVisual",
            "anomaliaIdentificada",
            "classificacaoSugerida",
            "severidadeSugerida",
            "nivelConfiancaPercentual",
            "nivelConfiancaClassificacao",
            "fatosObservados",
            "interpretacaoVisual",
            "possivelCausa",
            "recomendacaoTecnica",
            "necessidadeAvaliacaoComplementar",
            "comparacaoHistorica",
            "fontesUtilizadas",
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("A IA não retornou resposta.");
    }

    const parsed = JSON.parse(text);
    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error("Erro na análise de IA:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Falha ao processar análise técnica com IA.",
    });
  }
});

// Consolidate Inspection Report with AI
app.post("/api/consolidate-report", async (req, res) => {
  try {
    const {
      inspectionNumber,
      inspectionType,
      unitName,
      area,
      inspectionDate,
      inspectorName,
      approvedRecords,
      nonConformities,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY não configurada no servidor.",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é um Engenheiro Perito e Auditor Técnico Chefe responsável pela consolidação do Relatório Técnico de Inspeção Periódica.
Você receberá os dados da inspeção e a lista de registros técnicos aprovados pelo inspetor responsável.
Sua missão é redigir uma análise técnica rigorosa, formal, técnica e concisa, estritamente alinhada aos fatos aprovados, sem inventar qualquer informação.`;

    const prompt = `DADOS DA INSPEÇÃO:
- Número: ${inspectionNumber}
- Tipo: ${inspectionType}
- Unidade/Aeroporto: ${unitName}
- Área: ${area}
- Data: ${inspectionDate}
- Responsável Técnico: ${inspectorName}

TOTAL DE REGISTROS APROVADOS: ${approvedRecords?.length || 0}
REGISTROS:
${JSON.stringify(approvedRecords || [], null, 2)}

NÃO CONFORMIDADES REGISTRADAS:
${JSON.stringify(nonConformities || [], null, 2)}

Elabore a consolidação técnica do relatório com as seguintes seções em JSON estruturado:
1. objetivo: Descrição técnica precisa do objetivo da inspeção para o tipo ${inspectionType}.
2. escopo: Descrição do escopo, áreas e quantitativo de ativos abrangidos.
3. metodologia: Descrição formal do método de inspeção visual, critérios normativos e processo de validação técnica.
4. analiseTecnica:
   - condicoesSatisfatorias: Resumo dos itens e ativos que apresentaram conformidade integral.
   - pontosAtencao: Resumo dos itens que demandam acompanhamento preventivo.
   - naoConformidadesCriticas: Resumo das anomalias graves e não conformidades.
   - ocorrenciasRecorrentes: Padrões ou reincidências identificadas.
   - tendenciasIdentificadas: Tendências de degradação observadas.
5. conclusao: Parecer técnico final objetivo e responsável com base estrita nas evidências.
6. recomendacoesPriorizadas: Lista ordenada por prioridade (Crítica, Alta, Média, Baixa) com ações recomendadas e prazos sugeridos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objetivo: { type: Type.STRING },
            escopo: { type: Type.STRING },
            metodologia: { type: Type.STRING },
            analiseTecnica: {
              type: Type.OBJECT,
              properties: {
                condicoesSatisfatorias: { type: Type.STRING },
                pontosAtencao: { type: Type.STRING },
                naoConformidadesCriticas: { type: Type.STRING },
                ocorrenciasRecorrentes: { type: Type.STRING },
                tendenciasIdentificadas: { type: Type.STRING },
              },
              required: [
                "condicoesSatisfatorias",
                "pontosAtencao",
                "naoConformidadesCriticas",
                "ocorrenciasRecorrentes",
                "tendenciasIdentificadas",
              ],
            },
            conclusao: { type: Type.STRING },
            recomendacoesPriorizadas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  prioridade: { type: Type.STRING },
                  ativo: { type: Type.STRING },
                  acaoRecomendada: { type: Type.STRING },
                  prazoSugerido: { type: Type.STRING },
                },
                required: ["prioridade", "ativo", "acaoRecomendada", "prazoSugerido"],
              },
            },
          },
          required: [
            "objetivo",
            "escopo",
            "metodologia",
            "analiseTecnica",
            "conclusao",
            "recomendacoesPriorizadas",
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Falha na geração do parecer consolidado.");
    }

    const parsed = JSON.parse(text);
    return res.json({ success: true, consolidation: parsed });
  } catch (error: any) {
    console.error("Erro na consolidação de relatório:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Erro ao consolidar relatório com IA.",
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corporativo de inspeções rodando em http://localhost:${PORT}`);
  });
}

start();
