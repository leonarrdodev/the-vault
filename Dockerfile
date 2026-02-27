# Usa uma imagem Node.js leve, baseada em Debian
FROM node:20-bullseye-slim

# Define a pasta de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de configuração de pacotes primeiro (aproveita o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o restante do código
COPY . .

# Faz o build do TypeScript para JavaScript
# (Certifique-se de que o script "build" no package.json roda o `tsc`)
RUN npm run build

# Cria a pasta onde o banco de dados SQLite vai morar
RUN mkdir -p /usr/src/app/data

# Expõe a porta que a API vai rodar
EXPOSE 3000

# Inicia a aplicação a partir do código compilado (ajuste o caminho se necessário, ex: dist/server.js)
CMD ["npm", "start"]