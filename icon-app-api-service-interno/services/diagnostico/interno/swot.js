'use strict'
const models = require('../../../models');
const { Swot_Forca_Fraqueza, Swot_FFC } = models;

/**
 * 
 * @param {*} empresa empresa que do SWOT
 * @param {*} smiles smiles que contem os pontos fortes e fracos
 * @param {*} resource orgem (financeiro, comercial, processos, pessoas)
 */
module.exports.gravarPontos = async (empresa, smiles, ano, resource = null) => {

  let _list_swot = [];

  async function check(field, value) {
    // verifica se é um campo válido para análise do swot.
    try {
      const result = await Swot_FFC.findOne({ where: { campo: field }, raw: true })
      if (result) {
        if (value.includes("Bom")) {
          _list_swot.push({
            status: 1,
            ...result
          }) // vai pra forte
        } else if (value.includes("Ruim")) {
          _list_swot.push({
            status: 2,
            ...result
          }) // vai pra fraca
        } else {
          _list_swot.push({
            status: 0,
            ...result
          }) // vai pra nada
        }
      }
    } catch (e) {
      console.info('errrr', e)
    }
  }

  async function pontosFortesUpdate(item) {
    console.info('Verificando ITEM', item)
    // verifica se o item já foi incluido para a empresa que está sendo analisada

    const filter = {
      where: {
        swot_codigo: item.id,
        EmpresaId: empresa,
        ano_exercicio: ano,
      },
      raw: true,
      logging: (str) => console.info(str),
    }

    try {
      const result = await Swot_Forca_Fraqueza.findOne(filter)
      console.info('BUSCA ->', result)
      if (result) {
        console.info(`Encontrado ${item.campo} mundando de ${result.status} para ${item.status}`);
        await Swot_Forca_Fraqueza.update({ status: item.status, }, { where: { swot_codigo: item.id, EmpresaId: empresa } });
      } else {
        console.info('NÃO ENCONTRADO, CRIANDO UM NOVO')
        await Swot_Forca_Fraqueza.create({
          swot_codigo: item.id,
          EmpresaId: empresa,
          ano_exercicio: ano,
          status: item.status,
        });
      }
    } catch (error) {
      console.error('ERRO ->', err)
    }

  }

  return new Promise(async (resolve, reject) => {
    try {

      // pontos fortes = (status=1)
      // pontes fracos = (status=2) 
      // pontes neutro = (status=0) 

      const keys = Object.keys(smiles);
      const values = Object.values(smiles);

      // aqui, eu processo todos os smiles que chegou, fazendo a verificação
      // dos pontos fortes, fracos e neutros para serem atualizados 
      // no relatório de SWOT.
      const promiseCheck = [];
      for (let i = 0; i < keys.length; i++) {
        promiseCheck.push(check(keys[i], values[i]));
      }
      await Promise.all(promiseCheck);

      console.info(`Atualizando ${resource} empresa ${empresa}`);

      // vamos atualizar os pontos fortes
      const updatePromises = [];
      for (const item of _list_swot) {
        updatePromises.push(pontosFortesUpdate(item));
      }
      await Promise.all(updatePromises);

      console.info('PROCESSO FINALIZADO')

      // e finaliza o processo...
      resolve({
        status: "done",
        message: `Pontos fortes e Fracos de ${resource} atualizados.`
      });

    } catch (error) {
      reject(error);
    }
  });
}