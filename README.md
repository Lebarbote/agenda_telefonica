# Agenda Telefônica - API REST em Node.js + Express para gerenciar contatos de uma agenda telefônica.

Inclui CRUD completo, validações, integração com a API HG Weather para trazer clima/sugestões, documentação via Swagger e testes automatizados com Jest + Supertest.
Utiliza uma arquitetura em camadas (MVC-ish para API), organizada por responsabilidade. Não tem “View”: é Router → Controller → (Domínio/Utils) → Persistência (Mongoose), com integrações externas (clima) e cross-cutting (erros/log).

## Estrutura do projeto
> ⚠️ Observação: o código está dentro da pasta `agenda-telefonica/`.

## STACK
Node.js (Express)

MongoDB + Mongoose

Swagger (OpenAPI 3)

Jest + Supertest

Docker & Docker Compose

<hr>

## Como rodar o projeto
1. Clone o repositório
  <pre><code> npm install </code></pre>

2. Crie o arquivo .env baseado no .env.example e configure sua chave da HG Weather:
<pre><code>PORT=3000
HG_WEATHER_KEY=sua_chave_aqui </code></pre>

3. Inicie o servidor em modo dev:
<pre><code>cd agenda_telefonica
npm install
npm run dev
</code></pre>

4. Acesse:

API rodando em: http://localhost:3000

Documentação Swagger: http://localhost:3000/docs

Healthcheck: http://localhost:3000/health


## Como rodar com Docker Compose
<pre><code>docker compose up -d --build</code></pre>
Mongo: porta 27017 publicada (usuário root / senha rootpassword)

Parar
<pre><code>docker compose down</code></pre>


<h2>Endpoints principais<h2> 
<p>
POST /contacts → Cria contato
  
GET /contacts → Lista contatos (com filtros por nome, email, endereço, telefone)

GET /contacts/{id} → Exibe contato + clima + sugestão

PUT /contacts/{id} → Atualiza contato

DELETE /contacts/{id} → Soft delete (exclusão lógica)</p>


<h2>Regras de negócio </h2>
 <p>E-mail deve ser válido.

Telefones normalizados e sem duplicados por contato.

Soft delete respeitado em todas as consultas.

Clima consultado na cidade do contato (HG Weather).

Sugestões exibidas de acordo com a temperatura/condição:

≤ 18° → “Ofereça um chocolate quente...”

≥ 30° e ensolarado → “Convide seu contato para ir à praia...”

≥ 30° e chuvoso → “Convide seu contato para tomar um sorvete”

18–30° ensolarado → “Atividade ao ar livre”

18–30° chuvoso → “Ver um filme” </p>


<h2>Documentação</h2>
<p>A documentação da API está disponível via Swagger em /docs.
Você pode visualizar os endpoints, parâmetros e testar as requisições diretamente no navegador. </p>
  
<h2>Testes Unitários </h2>
<p>Fora do Docker (usando Mongo local/Compose pela porta 27017):</p>
<pre><code># Banco de teste separado:
export NODE_ENV=test
export MONGO_URI="mongodb://root:rootpassword@localhost:27017/agenda_test?authSource=admin"
npm test</code></pre>

<p>Dentro do Docker:</p>
<pre><code>docker compose exec \
  -e NODE_ENV=test \
  -e MONGO_URI="mongodb://root:rootpassword@mongo:27017/agenda_test?authSource=admin" \
  api npm test</code></pre>

<p>Só unitários:</p>
<pre><code>npm run test:unit</code></pre>
Unitários: validam regras de negócio isoladas (buildSuggestion, normalizePhone, validação de contatos).






