const Handler = require("../handler");
const models = require("../../models");

const { Objetivo_Receitas, Dre } = models;
const { ConvertStringToFloat } = require("../generico/ConvertStringToFloat");
const {
  LimiteDeEstrategias,
  SalvarAtualizarEstrategias,
  getEstrategiasDisponiveis,
  getEstrategiasCadastradas,
} = require("../generico/FuncoesDeEstrategias");
const AnoExercicioEmpresa = require("../generico/AnoExercicioEmpresa");

exports.criar = async (event, action) => {
  const { companyId } = action;
  const { objetivo, estrategias } = JSON.parse(event.body);
  const queryEmpresa = {
    where: { EmpresaId: companyId, dreId: objetivo.dreId },
    raw: true,
  };
  objetivo.EmpresaId = companyId;
  objetivo.percentage = ConvertStringToFloat(objetivo.percentage);
  objetivo['meta'] = ConvertStringToFloat(objetivo['meta']);

  const result = await Objetivo_Receitas.findOne(queryEmpresa);

  if (result) {

    await Objetivo_Receitas.update(objetivo, { where: { id: result.id }, raw: true, })

    await SalvarAtualizarEstrategias(
      'financeiro',
      'receitas',
      estrategias,
      companyId,
      objetivo.dreId
    )

    return Handler.Ok({
      message: 'Objetivo de Faturamento atualizado com sucesso',
    });

  } else {

    await Objetivo_Receitas.create(objetivo)

    await SalvarAtualizarEstrategias(
      'financeiro',
      'receitas',
      estrategias,
      companyId,
      objetivo.dreId
    )
    return Handler.Ok({
      message: 'Objetivo de Faturamento incluído com sucesso',
    });
  }

};

exports.definicao_objetivo_financeiro = async (event, action) => {

  const { companyId } = action;
  const anos = await AnoExercicioEmpresa.getAll(companyId);

  const estrategias_disponiveis = await getEstrategiasDisponiveis('financeiro', 'receitas');
  const metas = {};

  for (let ano of anos) {
    ano = parseInt(ano)
    let dreId, message;
    let status = 'fatal_error'
    let filterDre = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: (ano - 1)
      }
    }
    await Dre.findOne(filterDre)
      .then(result => {
        if (result) {
          dreId = result['id']
          status = 'success'
        } else {
          console.info('Nenhum DRE encontrado')
          status = 'dre_not_found'
          message = 'DRE não localizado'
        }
      })
      .catch(err => {
        console.error('Erro ao buscar DRE', err)
        message = 'Erro ao buscar DRE';
      })

    if (status !== 'success') {
      metas[ano] = {
        status: status,
        message: message,
      }
      continue
    }

    let objetivos, estrategias_definidas;
    message = undefined;
    const filterCompany = {
      where: {
        EmpresaId: companyId,
        dreId: dreId
      }
    }

    status = 'fatal_error'

    await Objetivo_Receitas.findOne(filterCompany)
      .then(async objetivo => {

        if (objetivo) {

          status = 'success'
          objetivos = {
            percentagem: objetivo.percentage,
            dreId: objetivo.dreId,
            tipo: objetivo.tipo,
            descricao: objetivo.descricao,
            meta: objetivo.meta
          }

          estrategias_definidas = await getEstrategiasCadastradas(
            companyId, objetivo.dreId, 'financeiro', 'receitas'
          );

        } else {
          status = 'objectives_not_found'
          message = 'Não há objetivos cadastrado para Faturamento'
        }

        let outros_objetivos = {
          sugestao_crescimento: 30,
        }

        metas[ano] = {
          status: status,
          message: message,
          objetivo: objetivos,                 
          estrategias_definidas: estrategias_definidas,
          outros_objetivos: outros_objetivos,
        }

      })
      .catch(err => {
        console.error('Erro ao buscar Definição:', err);
        metas[ano] = {
          status: 'fatal_error',
          message: `Ocorreu um problema ao buscar a definição anterior.`,
        }
      });

  }

  return Handler.Ok({
    metas,
    estrategias_disponiveis,
    limite_estrategias: LimiteDeEstrategias(),
  });

};
