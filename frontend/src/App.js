import React, { useState } from 'react';
import axios from 'axios';
import AudioRecorder from './components/AudioRecorder';
import LaudoForm from './components/LaudoForm'; // Importa o novo formulário
import './App.css';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [laudoResult, setLaudoResult] = useState(null);
  const [error, setError] = useState('');

  const handleAudioStop = async (audioBlob) => {
    setIsProcessing(true);
    setLaudoResult(null);
    setError('');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/process-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLaudoResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao processar o áudio.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Laudo por Voz com IA</h1>
        <p>Grave o laudo e a IA irá transcrever e preencher o formulário abaixo.</p>
      </header>
      <main>
        <AudioRecorder onStop={handleAudioStop} disabled={isProcessing} />
        
        {isProcessing && (
          <div className="processing-container">
            <div className="spinner"></div>
            <p>Processando... A IA está analisando e estruturando o laudo.</p>
          </div>
        )}

        {error && <p className="error">{error}</p>}
        
        {/* Renderiza o LaudoForm com os dados recebidos */}
        {laudoResult && (
          <>
            <div className="transcription-card">
              <strong>Transcrição Original:</strong> {laudoResult.transcricao_original}
            </div>
            <LaudoForm laudoData={laudoResult.laudo_estruturado} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;