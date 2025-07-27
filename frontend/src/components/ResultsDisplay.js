const ResultsDisplay = ({ data }) => {
  if (!data) return null;

  return (
    <div className="results-container">
      <h2>Resultados do Processamento</h2>
      
      <div className="result-card">
        <h3>Transcrição Original (Google)</h3>
        <p>{data.transcricao_original || 'N/A'}</p>
      </div>

      <div className="result-card">
        <h3>Transcrição Corrigida (IA via OpenRouter)</h3>
        <p>{data.transcricao_melhorada || 'N/A'}</p>
      </div>

      <div className="result-card">
        <h3>Informações Extraídas (spaCy)</h3>
        <pre>{JSON.stringify(data.informacoes_extraidas, null, 2)}</pre>
      </div>

      <div className="result-card">
        <h3>Metadados</h3>
        <pre>{JSON.stringify(data.metadados, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ResultsDisplay;