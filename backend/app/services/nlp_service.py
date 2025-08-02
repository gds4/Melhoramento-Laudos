import os
import json
from datetime import datetime
from openai import OpenAI, APIError # <-- MUDANÇA: Importa o cliente OpenAI e seus erros

# --- CONFIGURAÇÃO DO CLIENTE OPENAI PARA USAR O OPENROUTER ---

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
)

# -----------------------------------------------------------------

# --- CONFIGURAÇÃO DO MODELO DE IA ---

MODEL_TO_USE = "google/gemma-3-12b-it:free"


# --- Modelos Pagos ---
# MODEL_TO_USE = "nousresearch/nous-hermes-2-mixtral-8x7b-dpo"
# MODEL_TO_USE = "anthropic/claude-sonnet-4"
# MODEL_TO_USE = "openai/gpt-4o"

# ------------------------------------------------


SYSTEM_PROMPT = """
Você é um assistente de IA especialista em processar laudos de ultrassonografia.
Sua tarefa é dupla:
1.  Corrigir e refinar o texto da transcrição, transformando a linguagem falada e informal em uma prosa clínica profissional. Corrija erros gramaticais, de digitação e pontuação.
2.  Extrair as informações JÁ CORRIGIDAS para um formato JSON estruturado.
Apenas retorne o objeto JSON, sem nenhum texto adicional ou explicações.

O formato do JSON deve ser:
{
  "paciente": { "nome": "extraia o nome do paciente aqui" },
  "orgaos": {
    "figado": "descreva os achados para o fígado",
    "vesicula_biliar": "descreva os achados para a vesícula biliar",
    "baco": "descreva os achados para o baço",
    "utero": "descreva os achados para o útero",
    "ovarios": "descreva os achados para os ovários"
  },
  "conclusao": "descreva a conclusão ou impressão diagnóstica, e informações adicionais se houver"
}
Se alguma informação não for mencionada no texto, deixe o campo correspondente como uma string vazia "".
"""

def processar_laudo_com_ia(texto_transcrito):
    if not texto_transcrito:
        return None
    
    user_prompt = f"Analise o seguinte ditado médico e extraia as informações no formato JSON solicitado: \"{texto_transcrito}\""
    
    try:
        print(f"Enviando texto para o modelo '{MODEL_TO_USE}' via cliente OpenAI...")
        
        completion = client.chat.completions.create(
            model=MODEL_TO_USE,
            
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            #response_format={"type": "json_object"},
            #max_tokens=1096
        )
        raw_content = completion.choices[0].message.content
        
        # Extrai o JSON de forma segura do texto bruto
        start_index = raw_content.find('{')
        end_index = raw_content.rfind('}')
        if start_index != -1 and end_index != -1:
            json_string_content = raw_content[start_index : end_index + 1]
        else:
            print(f"ERRO: Nenhum objeto JSON foi encontrado na resposta da IA. Resposta: {raw_content}")
            return None

        print("Dados estruturados recebidos.")
        structured_data = json.loads(json_string_content)

        final_result = {
            "laudo_estruturado": structured_data,
            "metadados": {
                "data_processamento": datetime.now().isoformat(),
                "modelo_usado": f"openrouter/{MODEL_TO_USE}",
            }
        }
        return final_result

    except APIError as e:
        print(f"ERRO de API (OpenAI Client): {e}")
        return None
    except json.JSONDecodeError:
        print(f"ERRO: A IA não retornou um JSON válido. Resposta recebida: {json_string_content}")
        return None
    except Exception as e:
        print(f"ERRO inesperado: {e}")
        return None



IMPROVE_TEXT_PROMPT = """
Você é um assistente de IA especialista em redação de textos médicos, fluente em Português do Brasil.
Sua única tarefa é refinar o texto a seguir, transformando-o em uma prosa clínica clara, concisa e profissional.
Corrija erros gramaticais, de digitação, pontuação e melhore a fluidez, mantendo o significado técnico original.
A resposta deve ser obrigatoriamente em Português do Brasil.
Apenas retorne o texto corrigido, sem aspas, sem formatação markdown e sem nenhum texto adicional ou explicações.
"""


def improve_single_text_with_ia(text_to_improve):
    if not text_to_improve:
        return ""
    
    user_prompt = f"Refine o seguinte texto: \"{text_to_improve}\""
    
    try:
        print(f"Enviando texto para o modelo '{MODEL_TO_USE}' para melhoria...")
        
        completion = client.chat.completions.create(
            model=MODEL_TO_USE,
            messages=[
                {"role": "system", "content": IMPROVE_TEXT_PROMPT},
                {"role": "user", "content": user_prompt}
            ]
        )
        improved_text = completion.choices[0].message.content.strip()

        print("Texto melhorado recebido.")
        return improved_text

    except Exception as e:
        print(f"ERRO ao melhorar o texto: {e}")
        return text_to_improve