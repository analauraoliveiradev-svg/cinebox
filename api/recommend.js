
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",

  // Tempo máximo de espera por tentativa
  timeout: 20000,

  // Uma nova tentativa em caso de falha temporária
  maxRetries: 1,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    const { genero, clima, filme } = req.body || {};

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content:
            'Você é um especialista em cinema para o público brasileiro. Recomende exatamente 3 filmes reais. Use o título oficial de lançamento no Brasil quando existir. Escreva em português brasileiro. Pelo menos 2 filmes devem ser menos conhecidos pelo grande público. Priorize obras cult, independentes e internacionais. Retorne somente JSON válido no formato: {"filmes":[{"titulo":"string","ano":2000,"genero":"string","nota":"string","motivo":"string"}]}. Não use markdown e não invente informações.',
        },
        {
          role: "user",
          content: `Recomende exatamente 3 filmes de acordo com estas preferências:

Gênero: ${genero || "qualquer gênero"}
Clima: ${clima || "qualquer clima"}
Filme favorito: ${filme || "nenhum informado"}

Escolha 1 filme relativamente conhecido e 2 menos conhecidos.
Todos devem combinar com as preferências.
Use títulos oficiais brasileiros quando existirem.
Escreva motivos curtos em português brasileiro.`,
        },
      ],

      response_format: {
        type: "json_object",
      },

      max_tokens: 2000,
      temperature: 0.5,
    });

    const conteudo = response.choices?.[0]?.message?.content;

    if (!conteudo) {
      throw new Error("A IA retornou uma resposta vazia.");
    }

    const resultado = JSON.parse(conteudo);

    if (
      !Array.isArray(resultado.filmes) ||
      resultado.filmes.length !== 3
    ) {
      throw new Error(
        "A IA não retornou exatamente 3 filmes."
      );
    }

    // Verifica se todos os filmes possuem os campos necessários
    const filmesValidos = resultado.filmes.every((filme) => {
      return (
        typeof filme.titulo === "string" &&
        filme.titulo.trim() !== "" &&
        Number.isInteger(filme.ano) &&
        typeof filme.genero === "string" &&
        typeof filme.nota === "string" &&
        typeof filme.motivo === "string" &&
        filme.motivo.trim() !== ""
      );
    });

    if (!filmesValidos) {
      throw new Error(
        "A IA retornou filmes com informações incompletas."
      );
    }

    // Só retorna os resultados depois de receber os três filmes
    return res.status(200).json(resultado);

  } catch (error) {
    console.error("ERRO NO CINEBOX:", error);

    const mensagem = error.message || "";

    if (
      error.name === "APIConnectionTimeoutError" ||
      error.name === "APIConnectionError" ||
      mensagem.toLowerCase().includes("timed out")
    ) {
      return res.status(504).json({
        error:
          "A IA demorou para responder. Tente novamente em alguns instantes.",
      });
    }

    return res.status(error.status || 500).json({
      error:
        error.status === 429
          ? "A IA está recebendo muitas solicitações. Aguarde um pouco e tente novamente."
          : mensagem || "Não foi possível gerar as recomendações.",
    });
  }
}
