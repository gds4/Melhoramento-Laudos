from flask import Blueprint, request, jsonify
from app.services import transcription_service, nlp_service

api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/process-audio', methods=['POST'])
def process_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "Nenhum arquivo de áudio enviado"}), 400

    audio_file = request.files['audio']
    
    # Passo 1: Transcrever o áudio
    original_text = transcription_service.transcribe_audio_from_blob(audio_file)
    if not original_text:
        return jsonify({"error": "Não foi possível transcrever o áudio"}), 500
        
    # Passo 2: Chamar a IA para processar, corrigir e extrair tudo de uma vez
    final_json_data = nlp_service.processar_laudo_com_ia(original_text)
    
    if not final_json_data:
        return jsonify({"error": "A IA não conseguiu processar o laudo estruturado"}), 500
        
    # Adiciona a transcrição original para referência no frontend
    final_json_data['transcricao_original'] = original_text

    return jsonify(final_json_data), 200