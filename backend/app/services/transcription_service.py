import speech_recognition as sr
from pydub import AudioSegment
import io

def transcribe_audio_from_blob(audio_blob):
    """
    Transcreve um blob de áudio (formato webm/ogg do navegador) para texto.
    """
    recognizer = sr.Recognizer()
    
    try:
        # Converte o formato de áudio do navegador para WAV em memória
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_blob.read()), format="webm")
        wav_data = io.BytesIO()
        audio_segment.export(wav_data, format="wav")
        wav_data.seek(0)

        with sr.AudioFile(wav_data) as source:
            audio_data = recognizer.record(source)
        
        print("Transcrevendo áudio com Google Speech Recognition...")
        text = recognizer.recognize_google(audio_data, language='pt-BR')
        return text
    except sr.UnknownValueError:
        print("Google Speech Recognition não pôde entender o áudio.")
        return None
    except sr.RequestError as e:
        print(f"Erro na requisição ao Google Speech Recognition: {e}")
        return None
    except Exception as e:
        print(f"Erro ao processar o áudio: {e}")
        return None