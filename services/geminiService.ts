import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Recommendation } from "../types";

// Access API key exclusively from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We manually parse JSON to avoid model hanging on strict schema generation for large PDFs
export const analyzeResumeWithGemini = async (
  base64Data: string,
  mimeType: string,
  jobTitle: string,
  requirements: string
): Promise<AnalysisResult> => {
  
  // Prompt instructions updated to request Portuguese output while keeping JSON structure
  const prompt = `
    Atue como um recrutador especialista e experiente.
    
    Vaga: ${jobTitle}
    Requisitos da Vaga:
    ${requirements}
    
    Tarefa: Analise o currículo anexo (PDF ou Imagem) comparando com os requisitos.
    
    Instruções de Saída:
    1. Retorne APENAS um objeto JSON válido. Não coloque blocos de código markdown (\`\`\`json).
    2. Todo o conteúdo de texto (summary, pros, cons) DEVE ser escrito em PORTUGUÊS (pt-BR).
    3. Seja direto e profissional.
    
    Estrutura Obrigatória do JSON:
    {
      "recommendation": "INTERVIEW" | "DISCARD",
      "matchScore": número (0-100),
      "summary": "Resumo breve do perfil do candidato em relação à vaga (em português).",
      "pros": ["Ponto forte 1", "Ponto forte 2"],
      "cons": ["Ponto de atenção 1", "Ponto de atenção 2"]
    }
  `;

  try {
    // Implement a 60-second timeout race
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Tempo limite de análise excedido (60s). O arquivo pode ser muito grande ou complexo.")), 60000)
    );

    const apiCallPromise = ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType, // Ensure this is valid (e.g., 'application/pdf')
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // We DO NOT set responseMimeType: "application/json" to prevent 
        // potential hangs on large context schema validation. 
        // We rely on the prompt to get JSON.
        temperature: 0.1,
      },
    });

    const response: any = await Promise.race([apiCallPromise, timeoutPromise]);

    let textResponse = response.text;
    if (!textResponse) {
      throw new Error("Resposta vazia da IA. O documento pode estar ilegível.");
    }

    // Sanitization: Find the JSON object boundaries
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      textResponse = textResponse.substring(firstBrace, lastBrace + 1);
    }

    let result: any;
    try {
        result = JSON.parse(textResponse);
    } catch (e) {
        console.error("JSON Parse Error:", textResponse);
        throw new Error("Erro ao ler resposta da IA. Formato inválido.");
    }

    // Validate and Map fields
    return {
        recommendation: (result.recommendation === 'INTERVIEW' || result.recommendation === 'DISCARD') 
            ? result.recommendation 
            : Recommendation.DISCARD,
        matchScore: typeof result.matchScore === 'number' ? result.matchScore : 0,
        summary: result.summary || "Sem resumo disponível.",
        pros: Array.isArray(result.pros) ? result.pros : [],
        cons: Array.isArray(result.cons) ? result.cons : []
    };

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    const msg = error.message || "Erro desconhecido";
    if (msg.includes("400")) throw new Error("Erro 400: Arquivo inválido ou corrompido.");
    if (msg.includes("429")) throw new Error("Muitas requisições. Tente novamente em instantes.");
    throw new Error(msg);
  }
};