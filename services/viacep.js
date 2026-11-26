import config from '../config.js';

export async function buscarCep(cep) {
  const resp = await fetch(`${config.viacepUrl}/${cep}/json/`);
  if (!resp.ok) {
    throw new Error(`ViaCEP respondeu com status ${resp.status}`);
  }
  const dados = await resp.json();
  if (dados.erro) {
    return null;
  }
  return dados;
}