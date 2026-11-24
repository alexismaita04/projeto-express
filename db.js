// FATOR 4 (Backing Services): conexão com o PostgreSQL.
// O app não sabe ONDE o banco está; só recebe host, porta, usuário e senha pela config.
import pg from 'pg';
import config from './config.js';

// Pool = grupo de conexões abertas que são reaproveitadas pelas requisições.
// Abrir uma conexão nova a cada requisição seria lento.
const pool = new pg.Pool(config.db);

// Se o banco cair com o app já rodando, o Pool avisa por este evento.
// Sem este tratador, o Node encerraria o programa inteiro. Aqui só registramos o erro.
pool.on('error', (erro) => {
  console.error('Conexão com o banco perdida:', erro.message || erro.code);
});

// Roda uma vez ao ligar o servidor: cria a tabela (se não existir) e coloca 3 pessoas iniciais.
export async function iniciarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pessoas (
      id     SERIAL PRIMARY KEY,
      nome   VARCHAR(100) NOT NULL,
      idade  INTEGER      NOT NULL,
      cidade VARCHAR(100) NOT NULL
    )
  `);

  // ::int converte o resultado de COUNT (que viria como texto) para número
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM pessoas');

  if (rows[0].total === 0) {
    await pool.query(`
      INSERT INTO pessoas (nome, idade, cidade) VALUES
        ('daniel', 22, 'cascavel'),
        ('maria',  25, 'cascavel'),
        ('diego',  33, 'cascavel')
    `);
  }
}

export default pool;
