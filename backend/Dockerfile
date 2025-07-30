# Estágio 1: Base com Python
FROM python:3.9-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Atualiza os pacotes do sistema operacional e instala as ferramentas de build e o ffmpeg
RUN apt-get update && apt-get install -y build-essential ffmpeg

# Copia o arquivo de dependências primeiro para aproveitar o cache do Docker
COPY requirements.txt .

# Instala as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código da aplicação para o diretório de trabalho no container
COPY . .

# Expõe a porta que o gunicorn irá usar dentro do container
EXPOSE 5000

# Comando para iniciar o servidor de produção Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "run:app"]