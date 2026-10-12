import { useState } from "react";
import "./App.css";

function App() {
  const [genero, setGenero] = useState("");
  const [clima, setClima] = useState("");
  const [filme, setFilme] = useState("");

  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const buscarFilmes = async () => {
    setCarregando(true);
    setErro("");
    setFilmes([]);

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
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao buscar recomendações.");
      }

      setFilmes(dados.filmes);
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível encontrar os filmes. Verifique a configuração da API."
      );
    } finally {
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

        <section className="form-card">
          <label>Qual gênero você quer assistir?</label>

          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
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

          <label>Qual clima você procura?</label>

          <select
            value={clima}
            onChange={(e) => setClima(e.target.value)}
          >
            <option value="">Escolha um clima</option>
            <option value="Leve e divertido">Leve e divertido</option>
            <option value="Romântico">Romântico</option>
            <option value="Sombrio">Sombrio</option>
            <option value="Emocionante">Emocionante</option>
            <option value="Aventureiro">Aventureiro</option>
            <option value="Assustador">Assustador</option>
          </select>

          <label>Qual filme você gosta?</label>

          <input
            type="text"
            value={filme}
            onChange={(e) => setFilme(e.target.value)}
            placeholder="Ex.: Coraline"
          />

          <button onClick={buscarFilmes} disabled={carregando}>
            {carregando ? "🔎 Procurando..." : "🎬 Encontrar filmes"}
          </button>
        </section>

        {erro && <p className="erro">{erro}</p>}

        {filmes.length > 0 && (
          <section className="resultados">
            <h2>✨ Suas recomendações</h2>

            <div className="filmes-grid">
              {filmes.map((item, index) => (
                <article className="filme-card" key={index}>
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