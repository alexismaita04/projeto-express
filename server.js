import express from 'express';
import config from './config.js';
import pool, { iniciarBanco } from './db.js';
import pessoasRouter from './router/pessoas.js';

const app = express();

// Middlewares: funções que rodam ANTES das rotas, na ordem em que aparecem.
app.use(express.static('public')); // entrega os arquivos da pasta public (index.html, css)
app.use(express.json());           // transforma o corpo JSON da requisição em req.body

// Rota de diagnóstico: mostra a configuração em uso e se o banco responde (sem exibir a senha!).
app.get('/saude', async (req, res) => {
  let statusBanco = 'conectado';
  try {
    await pool.query('SELECT 1'); // pergunta simples só para testar a conexão
  } catch (e) {
    statusBanco = 'indisponivel';
  }
  res.json({
    app: config.nomeApp,
    ambiente: config.ambiente,
    porta: config.porta,
    banco: { host: config.db.host, nome: config.db.database, status: statusBanco },
  });
});

// Todas as rotas que começam com /pessoas são tratadas pelo router.
app.use('/pessoas', pessoasRouter);

// Tratador de erros (tem 4 parâmetros: é assim que o Express o reconhece).
// Qualquer erro não tratado nas rotas (ex.: banco fora do ar) cai aqui.
app.use((erro, req, res, next) => {
  console.error('Erro:', erro.message || erro.code);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// Antes de aceitar requisições, garante que o banco está acessível e pronto.
try {
  await iniciarBanco();
} catch (e) {
  console.error('Não foi possível conectar ao PostgreSQL:', e.message || e.code);
  console.error('Confira se o PostgreSQL está rodando e se os dados do arquivo .env estão corretos.');
  process.exit(1); // encerra o programa com código de erro
}

app.listen(config.porta, () => {
  console.log(`${config.nomeApp} [${config.ambiente}] rodando na porta ${config.porta}`);
  console.log(`Banco: ${config.db.database} em ${config.db.host}:${config.db.port}`);
  console.log(`Acesse: http://localhost:${config.porta}/`);
});
