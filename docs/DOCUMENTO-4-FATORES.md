# Aplicação dos 4 primeiros fatores do Twelve-Factor App

**Projeto:** projeto-express — JavaScript + Express.js + PostgreSQL

## 1. Codebase — uma base de código, muitos deploys

- **Repositório:** `projeto-express`, hospedado no GitHub (um único repositório para o app).
- **Estratégia de branches: GitHub Flow.** É a mais simples: existe a `main` (sempre estável) e branches curtas de trabalho que voltam a ela por Pull Request. Git Flow foi descartado por ter branches demais (develop, release, hotfix) para um projeto pequeno; Trunk-Based exige testes automatizados fortes, que o projeto ainda não tem.
- **Ambientes:** o mesmo código roda em desenvolvimento, homologação e produção. O que muda é apenas a configuração (Fator 3). A produção usaria uma tag de versão (ex.: `v1.0.0`) da `main`.

## 2. Dependencies — dependências declaradas explicitamente

- **Ferramenta:** npm (gerenciador do Node.js).
- **Arquivos:** `package.json` lista o que o projeto usa (`express`, `pg`, `dotenv`) e a versão mínima do Node (`engines`); `package-lock.json` trava as versões exatas.
- **Novo desenvolvedor:** `npm ci` instala tudo. O resto do passo a passo está no README.
- **Versões compatíveis:** o `package-lock.json` é versionado e o `npm ci` instala exatamente o que está nele, então todos usam as mesmas versões. A pasta `node_modules` não é versionada (`.gitignore`).

## 3. Config — configuração separada do código

- O que muda entre ambientes fica em variáveis de ambiente: `NODE_ENV`, `APP_NAME`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- O arquivo `config.js` é o único que lê `process.env`; o restante do código importa `config`.
- `.env.example` (versionado, valores fictícios) é o modelo. O `.env` (real, com a senha) está no `.gitignore` e nunca vai ao GitHub.
- Demonstração: trocar `PORT` no `.env` muda a porta do app sem alterar nenhuma linha de código. A rota `GET /saude` mostra a configuração em uso e o status do banco, sem expor a senha.

## 4. Backing Services — serviços de apoio como recursos anexados

| Serviço | Tecnologia | Situação | Como o app se conecta |
|---|---|---|---|
| Banco de dados | PostgreSQL (administrado pelo pgAdmin) | **Implementado** | biblioteca `pg` com `Pool`; host, porta, usuário, senha e nome do banco vêm do `.env` |
| Cache | Redis | Hipotético (produção) | biblioteca `redis`, endereço em variável `REDIS_URL` |

- O app não tem o banco "embutido": ele só recebe os dados de conexão pela configuração. Para usar outro PostgreSQL (de homologação ou produção), basta mudar as variáveis.
- **Substituição:** PostgreSQL → MySQL ou MariaDB exige trocar a biblioteca (`pg` por `mysql2`) e pequenos ajustes de sintaxe SQL; as rotas e o resto do app continuam iguais, porque todo o acesso ao banco passa por `db.js` e pelo `router/pessoas.js`. Redis → Memcached: trocar a biblioteca e a variável de endereço.
- **Falha do serviço:** se o banco estiver fora do ar ao iniciar, o app avisa o motivo e encerra; se cair depois, as rotas respondem erro 500 e o app volta a funcionar sozinho quando o banco retorna.

O diagrama da arquitetura está no `README.md`.
