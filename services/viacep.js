// FATOR 4 (Backing Services): acesso a um serviço externo (a API ViaCEP).
// Este arquivo só sabe "buscar um CEP". As rotas não precisam saber como isso é feito:
// se o serviço for trocado, só este arquivo muda.
import config from '../config.js';

// Recebe o CEP (8 dígitos) e devolve os dados do endereço.
// Devolve null se o CEP não existir; lança erro se o serviço estiver fora do ar.
export async function buscarCep(cep) {
  // fetch faz uma requisição HTTP pela internet. O endereço base vem da config.
  // await espera a resposta chegar sem travar o servidor para os outros pedidos.
  const resp = await fetch(`${config.viacepUrl}/${cep}/json/`);

  // resp.ok é true quando o status é 200 a 299. Se não for, o serviço falhou.
  if (!resp.ok) {
    throw new Error(`ViaCEP respondeu com status ${resp.status}`);
  }

  // Converte o texto JSON da resposta em um objeto JavaScript.
  const dados = await resp.json();

  // Quando o CEP não existe, o ViaCEP responde com status 200 e { "erro": true }.
  if (dados.erro) {
    return null;
  }
  return dados;
}