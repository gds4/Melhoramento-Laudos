import os
import json
import requests
from datetime import datetime

# --- CONFIGURAÇÃO DA API DO OPENROUTER ---
API_URL = "https://openrouter.ai/api/v1/chat/completions"
API_KEY = os.getenv("OPENROUTER_API_KEY")
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
# ----------------------------------------

# O prompt do sistema agora instrui a IA a extrair dados em um formato JSON específico.
SYSTEM_PROMPT = """
Você é um assistente de IA especialista em processar laudos de ultrassonografia.
Sua tarefa é analisar a transcrição de um ditado médico e extrair as informações em um formato JSON estruturado.
Apenas retorne o objeto JSON, sem nenhum texto adicional ou explicações.

O formato do JSON deve ser:
{
  "paciente": {
    "nome": "extraia o nome do paciente aqui"
  },
  "orgaos": {
    "figado": "descreva os achados para o fígado",
    "vesicula_biliar": "descreva os achados para a vesícula biliar",
    "baco": "descreva os achados para o baço",
    "utero": "descreva os achados para o útero",
    "ovarios": "descreva os achados para os ovários"
  },
  "conclusao": "descreva a conclusão ou impressão diagnóstica, se houver"
}

Se alguma informação não for mencionada no texto, deixe o campo correspondente como uma string vazia "".
"""

def processar_laudo_com_ia(texto_transcrito):
    """
    Usa um modelo de linguagem via OpenRouter para corrigir o texto
    E extrair as informações em um formato JSON estruturado.
    """
    if not texto_transcrito:
        return None

    model_to_use = "nousresearch/nous-hermes-2-mixtral-8x7b-dpo"
    
    user_prompt = f"Analise o seguinte ditado médico e extraia as informações no formato JSON solicitado: \"{texto_transcrito}\""
    
    payload = {
        "model": model_to_use,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"} # Pede para a IA forçar uma resposta em JSON
    }

    try:
        print(f"Enviando texto para o modelo '{model_to_use}' para extração estruturada...")
        response = requests.post(API_URL, json=payload, headers=HEADERS, timeout=90)
        response.raise_for_status()
        
        response_data = response.json()
        json_string_content = response_data["choices"][0]["message"]["content"]
        
        print("Dados estruturados recebidos.")
        # O conteúdo recebido é uma string JSON, então precisamos convertê-la para um dicionário Python
        structured_data = json.loads(json_string_content)
        
        # Adicionamos os metadados ao resultado final
        final_result = {
            "laudo_estruturado": structured_data,
            "metadados": {
                "data_processamento": datetime.now().isoformat(),
                "modelo_usado": f"openrouter/{model_to_use}"
            }
        }
        return final_result

    except requests.exceptions.RequestException as e:
        print(f"ERRO de API: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"ERRO: A IA não retornou um JSON válido. Resposta recebida: {json_string_content}")
        return None
    except Exception as e:
        print(f"ERRO inesperado: {e}")
        return None