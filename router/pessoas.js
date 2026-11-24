import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Roda automaticamente nas rotas que têm ":id" no caminho.
// Garante que o id é um número inteiro antes de chegar ao banco.
router.param('id', (req, res, next, valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  req.id = id; // guarda o id já convertido para as rotas usarem
  next();      // segue para a rota
});

// Listar todas
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM pessoas ORDER BY id');
  res.json(rows);
});

// Listar por id
router.get('/:id', async (req, res) => {
  // $1 é um espaço reservado: o valor vai separado, o que impede SQL Injection
  const { rows } = await pool.query('SELECT * FROM pessoas WHERE id = $1', [req.id]);

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  }
  res.json(rows[0]);
});

// Inserir nova pessoa
router.post('/', async (req, res) => {
  const { nome, idade, cidade } = req.body;

  if (!nome || idade === undefined || !cidade) {
    return res.status(400).json({ erro: 'Nome, idade e cidade são obrigatórios.' });
  }

  // RETURNING * devolve a linha criada, já com o id gerado pelo banco
  const { rows } = await pool.query(
    'INSERT INTO pessoas (nome, idade, cidade) VALUES ($1, $2, $3) RETURNING *',
    [nome, idade, cidade]
  );
  return res.status(201).json(rows[0]);
});

// Editar pessoa (só os campos enviados)
router.patch('/:id', async (req, res) => {
  const { nome, idade, cidade } = req.body;

  // COALESCE(novo, atual): usa o valor novo; se for NULL (não enviado), mantém o atual
  const { rows } = await pool.query(
    `UPDATE pessoas
        SET nome   = COALESCE($1, nome),
            idade  = COALESCE($2, idade),
            cidade = COALESCE($3, cidade)
      WHERE id = $4
      RETURNING *`,
    [nome ?? null, idade ?? null, cidade ?? null, req.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  }
  return res.status(200).json(rows[0]);
});

// Remover pessoa
router.delete('/:id', async (req, res) => {
  const resultado = await pool.query('DELETE FROM pessoas WHERE id = $1', [req.id]);

  if (resultado.rowCount === 0) { // nenhuma linha apagada = id não existe
    return res.status(404).json({ erro: 'Pessoa não encontrada.' });
  }
  return res.status(204).send();
});

export default router;
