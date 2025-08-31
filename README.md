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

## Como rodar o projeto com Docker Compose

1. Crie o arquivo .env dentro da pasta agenda_telefonica e configure sua chave da HG Weather:
<pre><code>PORT=3000
HG_WEATHER_KEY=sua_chave
</code></pre>

2. Execute com o Docker Compose:
<pre><code>docker compose up -d --build</code></pre>

3. Como parar o projeto:
<pre><code>docker compose down</code></pre>

> ⚠️ Observação: para rodar o projeto:
<pre><code>docker compose up</code></pre>

## Como rodar o projeto sem Docker Compose

1. Crie o arquivo .env dentro da pasta agenda_telefonica e configure sua chave da HG Weather:
<pre><code>PORT=3000
HG_WEATHER_KEY=sua_chave
</code></pre>

2. Inicie o servidor em modo dev:
<pre><code>cd agenda_telefonica
npm install
npm run dev
</code></pre>



## Após iniciar o projeto, acesse:

API rodando em: http://localhost:3000

Documentação Swagger: http://localhost:3000/docs

Healthcheck: http://localhost:3000/health
</p>



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
<p>Para rodar teste unitário usando docker-compose.test:</p>
<pre><code>docker compose -f docker-compose.test.yaml up</code></pre>







