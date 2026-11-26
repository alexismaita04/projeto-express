import express from 'express';
import { buscarCep } from '../services/viacep.js';

const router = express.Router();

router.get('/:cep', async (req, res) => {
  const cep = req.params.cep.replace(/\D/g, '');

  if (cep.length !== 8) {
    return res.status(400).json({ erro: 'CEP deve ter 8 dígitos.' });
  }

  try {
    const endereco = await buscarCep(cep);
    if (!endereco) {
      return res.status(404).json({ erro: 'CEP não encontrado.' });
    }
    return res.json(endereco);
  } catch (e) {
    return res.status(502).json({ erro: 'Serviço de CEP indisponível.' });
  }
});

export default router;