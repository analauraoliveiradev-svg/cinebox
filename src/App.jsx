
import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [genero, setGenero] = useState("");
  const [clima, setClima] = useState("");
  const [filme, setFilme] = useState("");

  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const requisicaoAtiva = useRef(false);

  const buscarFilmes = async (e) => {
    e.preventDefault();

    if (requisicaoAtiva.current) return;

    requisicaoAtiva.current = true;
    setCarregando(true);
    setErro("");
    setFilmes([]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000);

    try {
      const resposta = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          genero,
          clima,
          filme,
        }),
        signal: controller.signal,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.error || "Não foi possível gerar as recomendações."
        );
      }

      if (!Array.isArray(dados.filmes) || dados.filmes.length !== 3) {
        throw new Error("A IA não retornou exatamente três filmes.");
      }

      const filmesValidos = dados.filmes.every((item) => {
        return (
          typeof item.titulo === "string" &&
          item.titulo.trim() !== "" &&
          Number.isInteger(item.ano) &&
          typeof item.genero === "string" &&
          typeof item.nota === "string" &&
          typeof item.motivo === "string" &&
          item.motivo.trim() !== ""
        );
      });

      if (!filmesValidos) {
        throw new Error("Algumas informações dos filmes estão incompletas.");
      }

      setFilmes(dados.filmes);
    } catch (error) {
      console.error("Erro no Cinebox:", error);

      if (error.name === "AbortError") {
        setErro(
          "A busca demorou mais que o esperado. Tente novamente em instantes."
        );
      } else {
        setErro(
          error.message || "Não foi possível encontrar os filmes. Tente novamente."
        );
      }
    } finally {
      clearTimeout(timeout);
      requisicaoAtiva.current = false;
      setCarregando(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🎬 Cinebox</div>
        <p>Seu próximo filme favorito está aqui.</p>
      </header>

      <main className="container">
        <section className="hero">
          <h1>Encontre seu próximo filme</h1>

          <p>
            Conte um pouco sobre o que você está procurando e deixe a
            inteligência artificial escolher por você.
          </p>
        </section>

        <form className="form-card" onSubmit={buscarFilmes}>
          <label htmlFor="genero">
            Qual gênero você quer assistir?
          </label>

          <select
            id="genero"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            disabled={carregando}
          >
            <option value="">Escolha um gênero</option>
            <option value="Terror">Terror</option>
            <option value="Comédia">Comédia</option>
            <option value="Romance">Romance</option>
            <option value="Ação">Ação</option>
            <option value="Fantasia">Fantasia</option>
            <option value="Ficção científica">Ficção científica</option>
            <option value="Drama">Drama</option>
            <option value="Animação">Animação</option>
          </select>

          <label htmlFor="clima">
            Qual clima você procura?
          </label>

          <select
            id="clima"
            value={clima}
            onChange={(e) => setClima(e.target.value)}
            disabled={carregando}
          >
            <option value="">Escolha um clima</option>
            <option value="Leve e divertido">Leve e divertido</option>
            <option value="Romântico">Romântico</option>
            <option value="Sombrio">Sombrio</option>
            <option value="Emocionante">Emocionante</option>
            <option value="Aventureiro">Aventureiro</option>
            <option value="Assustador">Assustador</option>
          </select>

          <label htmlFor="filme">
            Qual filme você gosta?
          </label>

          <input
            id="filme"
            type="text"
            value={filme}
            onChange={(e) => setFilme(e.target.value)}
            placeholder="Ex.: Coraline"
            disabled={carregando}
          />

          <button type="submit" disabled={carregando}>
            {carregando
              ? "🔎 Procurando..."
              : "🎬 Encontrar filmes"}
          </button>
        </form>

        {carregando && (
          <div className="loading" role="status" aria-live="polite">
            <div className="spinner">🎬</div>
            <p>Preparando sua próxima sessão de cinema...</p>
            <span>
              Nossa inteligência artificial está procurando filmes
              que combinam com você.
            </span>
          </div>
        )}

        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}

        {filmes.length === 3 && !carregando && (
          <section className="resultados">
            <h2>✨ Suas recomendações</h2>

            <div className="filmes-grid">
              {filmes.map((item, index) => (
                <article className="filme-card" key={`${item.titulo}-${index}`}>
                  <div className="filme-icon">🎬</div>

                  <h3>{item.titulo}</h3>

                  <div className="filme-info">
                    <span>{item.ano}</span>
                    <span>{item.genero}</span>
                    <span>⭐ {item.nota}</span>
                  </div>

                  <p>{item.motivo}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
