const axios = require('axios');

const HOST_INTEGRACAO = 'https://crawler-api.omie.com.br/call/cnpj';

module.exports.validarCNPJ = (cnpj) => {

  if (!cnpj) return false

  // Aceita receber o valor como string, número ou array com todos os dígitos
  const isString = typeof cnpj === 'string'
  const validTypes = isString || Number.isInteger(cnpj) || Array.isArray(cnpj)

  // Elimina valor em formato inválido
  if (!validTypes) return false

  // Filtro inicial para entradas do tipo string
  if (isString) {
    // Limita ao máximo de 18 caracteres, para CNPJ formatado
    if (cnpj.length > 18) return false
  }

  // Guarda um array com todos os dígitos do valor
  const match = cnpj.toString().match(/\d/g)
  const numbers = Array.isArray(match) ? match.map(Number) : []

  // Valida a quantidade de dígitos
  if (numbers.length !== 14) return false

  // Elimina inválidos com todos os dígitos iguais
  const items = [...new Set(numbers)]
  if (items.length === 1) return false

  // Cálculo validador
  const calc = (x) => {
    const slice = numbers.slice(0, x)
    let factor = x - 7
    let sum = 0

    for (let i = x; i >= 1; i--) {
      const n = slice[x - i]
      sum += n * factor--
      if (factor < 2) factor = 9
    }

    const result = 11 - (sum % 11)

    return result > 9 ? 0 : result
  }

  // Separa os 2 últimos dígitos de verificadores
  const digits = numbers.slice(12)

  // Valida 1o. dígito verificador
  const digit0 = calc(12)
  if (digit0 !== digits[0]) return false

  // Valida 2o. dígito verificador
  const digit1 = calc(13)
  return digit1 === digits[1]

}

module.exports.formatCnpj = (cnpj) => {
  cnpj = cnpj.toString().match(/\d/g).join('');
  cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return cnpj;
}

module.exports.findCnpj = async (cnpj) => {
  cnpj = cnpj.match(/\d+/g).join('');
  return await axios.get(`${HOST_INTEGRACAO}/${cnpj}`);
}

module.exports.setCnpjIntegracao = async (cnpj) => {
  await this.findCnpj(cnpj)
    .then(response => {
      console.info('CNPJ enviado com sucesso para integração');
    })
    .catch(error => {
      console.error('Erro ao enviar CNPJ para integração');
      console.error(error);
    });
}