import { useState, useRef } from 'react';

const AudioRecorder = ({ onStop, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    // Verifica se o navegador suporta a API de Mídia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Seu navegador não suporta a gravação de áudio.");
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onStop(audioBlob);
        audioChunksRef.current = [];
        // Para a trilha de áudio para desligar o ícone de "gravando" na aba do navegador
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar o microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do navegador (geralmente um ícone de cadeado na barra de endereço).");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="recorder-container">
      <button 
        onClick={isRecording ? stopRecording : startRecording} 
        disabled={disabled}
        className={`record-button ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
      </button>
      {isRecording && <div className="recording-indicator">Gravando...</div>}
    </div>
  );
};

export default AudioRecorder;