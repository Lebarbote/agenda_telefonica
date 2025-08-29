# Agenda Telefônica API
<h1> API REST em Node.js + Express para gerenciar contatos de uma agenda telefônica. </h1>
Inclui CRUD completo, validações, integração com a API HG Weather para trazer clima/sugestões, documentação via Swagger e testes automatizados com Jest + Supertest.

## Estrutura do projeto
> ⚠️ Observação: o código está dentro da pasta `agenda-telefonica/`.


## 🚀 Como rodar o projeto
1. Clone o repositório
  <pre><code> npm install </code></pre>

2. Crie o arquivo .env baseado no .env.example e configure sua chave da HG Weather:
<pre><code>PORT=3000
HG_WEATHER_KEY=sua_chave_aqui </code></pre>

3. Inicie o servidor em modo dev:
<pre><code>npm run dev </code></pre>

4. Acesse:
API rodando em: http://localhost:3000
Documentação Swagger: http://localhost:3000/docs
Healthcheck: http://localhost:3000/health


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
  
<h2>Testes </h2>
Rodar todos os testes (unitários + integração):
<pre><code>npm test</code></pre>
Unitários: validam regras de negócio isoladas (buildSuggestion, normalizePhone, validação de contatos).

Integração: validam os principais endpoints do CRUD com banco de teste isolado e mock da API de clima. 



