# --- Estágio 1: Build da aplicação React ---
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e o package-lock.json para aproveitar o cache
COPY package.json package-lock.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o resto do código da aplicação
COPY . .

# Gera a build de produção otimizada
RUN npm run build

# --- Estágio 2: Servidor de produção Nginx ---
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no estágio de build para a pasta padrão do Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# O comando para iniciar o Nginx já vem configurado na imagem base
CMD ["nginx", "-g", "daemon off;"]