
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    });
  }

  try {
    const { genero, clima, filme } = req.body;

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content:
            'Você é um especialista em cinema para o público brasileiro. Recomende exatamente 3 filmes reais. Use o título oficial de lançamento no Brasil quando existir. Escreva em português brasileiro. Pelo menos 2 dos 3 filmes devem ser menos conhecidos pelo grande público; priorize obras cult, independentes, internacionais ou pouco divulgadas. Evite recomendar apenas blockbusters famosos. Retorne somente JSON válido neste formato: {"filmes":[{"titulo":"string","ano":2000,"genero":"string","nota":"string","motivo":"string"}]}. Não use markdown e não invente informações.',
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
        "A IA não retornou exatamente 3 filmes no formato esperado."
      );
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("ERRO NO CINEBOX:", error);

    return res.status(error.status || 500).json({
      error: error.message || "Erro ao gerar recomendações.",
    });
  }
}
