import express from 'express';
import { buscarCep } from '../services/viacep.js';

const router = express.Router();

// GET /cep/85801000  ->  consulta o endereço no serviço externo.
// ":cep" é um parâmetro: o valor digitado na URL fica em req.params.cep.
router.get('/:cep', async (req, res) => {
  // \D = qualquer caractere que NÃO é dígito. Remove traço e espaços: 85801-000 vira 85801000.
  const cep = req.params.cep.replace(/\D/g, '');

  // Um CEP válido tem 8 dígitos. 400 = pedido inválido (erro de quem chamou).
  if (cep.length !== 8) {
    return res.status(400).json({ erro: 'CEP deve ter 8 dígitos.' });
  }

  try {
    const endereco = await buscarCep(cep);

    // null = o serviço respondeu, mas esse CEP não existe. 404 = não encontrado.
    if (!endereco) {
      return res.status(404).json({ erro: 'CEP não encontrado.' });
    }
    return res.json(endereco); // 200 com o endereço em JSON
  } catch (e) {
    // O serviço externo falhou. 502 = o problema está fora do nosso app.
    // O try/catch evita que a falha derrube a resposta com um erro feio.
    return res.status(502).json({ erro: 'Serviço de CEP indisponível.' });
  }
});

export default router;