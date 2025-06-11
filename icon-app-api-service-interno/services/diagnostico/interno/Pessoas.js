/* eslint-disable no-param-reassign */
const Handler = require("../../handler");
const models = require("../../../models");
const Dre_Source = require("./dre");
const { gravarPontos } = require("./swot");

const { Pessoas, Pessoas_Avaliacao, Vendas_Avaliacao } = models;
const AnoExercicioEmpresa = require("../../generico/AnoExercicioEmpresa");
const Logger = require("../../../auth/logService");

function calcularNivelCompetencia(valor) {
  let pontos = 0.0;
  if (valor) {
    if (valor.includes("Deficiente")) {
      pontos += 1.0;
    } else if (valor.includes("Plena")) {
      pontos += 5.0;
    } else if (valor.includes("Parcial")) {
      pontos += 2.5;
    }
  }
  return pontos;
}

function calcularNivelEngajamento(valor) {
  let pontos = 0.0;
  if (valor) {
    if (valor.includes("Excelente")) {
      pontos += 5.0;
    } else if (valor.includes("Bom")) {
      pontos += 4.0;
    } else if (valor.includes("Baixa")) {
      pontos += 2.5;
    } else if (valor.includes("Ruim")) {
      pontos += 1.0;
    }
  }
  return pontos;
}

function calcularNivelRetencao(valor) {
  let pontos = 0.0;
  if (valor) {
    if (valor.includes("ImplantadoEficaz")) {
      pontos += 5.0;
    } else if (valor.includes("ImplantadoParcial")) {
      pontos += 3.0;
    } else if (valor.includes("Emimplantacao")) {
      pontos += 2.0;
    } else if (valor.includes("NaoImplantado")) {
      pontos += 1.0;
    }
  }
  return pontos;
}

const calcula_smile_points = (smile) => {
  if (smile) {
    if (smile.includes("Bom")) {
      return 3;
    }
    if (smile.includes("Neutro")) {
      return 2;
    }
    if (smile.includes("Ruim")) {
      return 1;
    }
  }
  return 0;
};

const updateEficienciaPessoas = async (
  company,
  ano_definido = null,
  avaliacao
) => {
  let ano_exercicio = 0;

  ano_exercicio = parseInt(ano_definido, 10) - 1;

  let total_smile_points = 0;
  let porcentagem_pessoas = 0;

  if (ano_exercicio > 0) {
    await Pessoas.findOne({
      where: { EmpresaId: company.id, ano_exercicio },
      raw: true,
    })
      .then(async (pessoas) => {
        if (pessoas) {
          await Pessoas_Avaliacao.findOne({
            where: { EmpresaId: company.id, ano_exercicio },
            raw: true,
          })
            .then(async (avaliacao) => {
              total_smile_points += calcula_smile_points(
                avaliacao.nivel_competencia
              );
              total_smile_points += calcula_smile_points(avaliacao.absenteismo);
              total_smile_points += calcula_smile_points(
                avaliacao.nivel_engajamento
              );
              total_smile_points += calcula_smile_points(
                avaliacao.funcionarios_antigos
              );
              total_smile_points += calcula_smile_points(
                avaliacao.rotatividade
              );
              total_smile_points += calcula_smile_points(
                avaliacao.nivel_retencao
              );
              total_smile_points += calcula_smile_points(
                avaliacao.faturamento_oriundo_inovacao
              );
              total_smile_points += calcula_smile_points(
                avaliacao.total_inovacao_implementada_empresa
              );

              if (total_smile_points > 0) {
                const pontos_maximos = 8 * 3;
                porcentagem_pessoas =
                  (total_smile_points / pontos_maximos) * 100;
              }
            })
            .catch((analise_objetivo_err) => {
              console.log(analise_objetivo_err);
            });
        }
      })
      .catch((analise_objetivo_err) => {
        console.error(analise_objetivo_err);
      });
  }

  await Dre_Source.atualizar_resumo(
    company.id,
    ano_exercicio,
    porcentagem_pessoas,
    "pessoas"
  );

  avaliacao[ano_definido] = {
    ano: ano_exercicio,
    percentual: porcentagem_pessoas,
  };
};

module.exports.gauge = async (event, action) => {
  const { company } = action;
  const anos = await company.getExercises();
  const avaliacao = {};

  const promises = anos.map((ano) =>
    updateEficienciaPessoas(company, ano, avaliacao)
  );
  await Promise.all(promises);

  return Handler.Ok({
    avaliacao,
  });
};

module.exports.obter_dados_avaliacao = async (event, action) => {
  const { company } = action;

  const anos = await company.getExercises();
  const analise = {};

  for (const ano of anos) {
    const ano_analise = parseInt(ano, 10) - 1;

    const pessoas = await company.getPeopleByYear(ano_analise);

    if (!pessoas) {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho de Pessoas para o ano de ${ano_analise}.`,
      };
      continue;
    }

    // calcular pontos de compentência
    const op = calcularNivelCompetencia(pessoas.competencia_operacao);
    const adm = calcularNivelCompetencia(pessoas.competencia_adm);
    const ger = calcularNivelCompetencia(pessoas.competencia_gerenciais);
    const media_competencia = ((op + adm + ger) / 15) * 100;

    // calcular pontos de engajamento
    const rel = calcularNivelEngajamento(
      pessoas.engajamento_relacionamento_interpessoal
    );
    const mot = calcularNivelEngajamento(
      pessoas.engajamento_motivacao_comprometimento
    );
    const com = calcularNivelEngajamento(
      pessoas.engajamento_comunicacao_interna
    );
    const cli = calcularNivelEngajamento(
      pessoas.engajamento_clima_organizacional
    );
    const media_engajamento = ((rel + mot + com + cli) / 20) * 100;

    // calcular pontos de rentenção
    const pc = calcularNivelRetencao(pessoas.retencao_plano_carreira);
    const cs = calcularNivelRetencao(pessoas.retencao_cargo_salario);
    const ra = calcularNivelRetencao(pessoas.retencao_avaliacao_desempenho);
    const rp = calcularNivelRetencao(pessoas.retencao_reconhecimento_pessoas);
    const rr = calcularNivelRetencao(pessoas.retencao_recompensa);
    const media_retencao = ((pc + cs + ra + rp + rr) / 25) * 100;

    const data = {
      pessoas,
      nivel_competencia: media_competencia,
      nivel_engajamento: media_engajamento,
      nivel_retencao: media_retencao,
    };

    const filter = {
      where: { EmpresaId: company.id, ano_exercicio: ano_analise },
      raw: true,
    };
    const [avaliacao, vendas] = await Promise.all([
      Pessoas_Avaliacao.findOne(filter),
      Vendas_Avaliacao.findOne(filter),
    ]);

    const avaliacaoResponse = {
      smile_nivel_competencia: avaliacao
        ? avaliacao.nivel_competencia || "NaoAvaliado"
        : "NaoAvaliado",
      smile_absenteismo: avaliacao
        ? avaliacao.absenteismo || "NaoAvaliado"
        : "NaoAvaliado",
      smile_nivel_engajamento: avaliacao
        ? avaliacao.nivel_engajamento || "NaoAvaliado"
        : "NaoAvaliado",
      smile_rotatividade: avaliacao
        ? avaliacao.rotatividade || "NaoAvaliado"
        : "NaoAvaliado",
      smile_funcionarios_antigos: avaliacao
        ? avaliacao.funcionarios_antigos || "NaoAvaliado"
        : "NaoAvaliado",
      smile_nivel_retencao: avaliacao
        ? avaliacao.nivel_retencao || "NaoAvaliado"
        : "NaoAvaliado",
      smile_total_inovacao_implementada_empresa: avaliacao
        ? avaliacao.total_inovacao_implementada_empresa || "NaoAvaliado"
        : "NaoAvaliado",
      smile_faturamento_oriundo_inovacao: avaliacao
        ? avaliacao.faturamento_oriundo_inovacao || "NaoAvaliado"
        : "NaoAvaliado",
    };

    analise[ano] = {
      ...data,
      avaliacao: avaliacaoResponse,
      comercial: vendas,
      status: "success",
    };
  }

  const logInfo = `Carregando avaliação do Ambiente Interno [pessoas]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    analise,
  });
};

module.exports.editar_pessoas = async (event, action) => {
  const { companyId } = action;

  let _ano = "";
  if (event.queryStringParameters) {
    const { ano } = event.queryStringParameters;
    _ano = ano;
  }
  const list = _ano.split(",");
  const params = [];
  for (const item of list) {
    if (item === "") continue;
    params.push(parseInt(item, 10));
  }

  const response_list = {
    id: [],
    ano_exercicio: [],
    funcionarios_antigos: [],
    rotatividade: [],
    absenteismo: [],
    competencia_operacao: [],
    competencia_adm: [],
    competencia_gerenciais: [],
    engajamento_relacionamento_interpessoal: [],
    engajamento_motivacao_comprometimento: [],
    engajamento_comunicacao_interna: [],
    engajamento_clima_organizacional: [],
    retencao_plano_carreira: [],
    retencao_cargo_salario: [],
    retencao_avaliacao_desempenho: [],
    retencao_reconhecimento_pessoas: [],
    retencao_recompensa: [],
    faturamento_oriundo_inovacao: [],
    total_inovacao_implementada_empresa: [],
  };

  for (const year of params) {
    const filter = {
      where: {
        ano_exercicio: year,
        EmpresaId: companyId,
      },
    };
    await Pessoas.findOne(filter)
      .then((pessoa) => {
        if (!pessoa) {
          for (const key in response_list) {
            const value = key === "ano_exercicio" ? year : null;
            response_list[key].push(value);
          }
        } else {
          response_list.id.push(pessoa.id);
          response_list.ano_exercicio.push(pessoa.ano_exercicio);
          response_list.funcionarios_antigos.push(pessoa.funcionarios_antigos);
          response_list.rotatividade.push(pessoa.rotatividade);
          response_list.absenteismo.push(pessoa.absenteismo);
          response_list.competencia_operacao.push(pessoa.competencia_operacao);
          response_list.competencia_adm.push(pessoa.competencia_adm);
          response_list.competencia_gerenciais.push(
            pessoa.competencia_gerenciais
          );
          response_list.engajamento_relacionamento_interpessoal.push(
            pessoa.engajamento_relacionamento_interpessoal
          );
          response_list.engajamento_motivacao_comprometimento.push(
            pessoa.engajamento_motivacao_comprometimento
          );
          response_list.engajamento_comunicacao_interna.push(
            pessoa.engajamento_comunicacao_interna
          );
          response_list.engajamento_clima_organizacional.push(
            pessoa.engajamento_clima_organizacional
          );
          response_list.retencao_plano_carreira.push(
            pessoa.retencao_plano_carreira
          );
          response_list.retencao_cargo_salario.push(
            pessoa.retencao_cargo_salario
          );
          response_list.retencao_avaliacao_desempenho.push(
            pessoa.retencao_avaliacao_desempenho
          );
          response_list.retencao_reconhecimento_pessoas.push(
            pessoa.retencao_reconhecimento_pessoas
          );
          response_list.retencao_recompensa.push(pessoa.retencao_recompensa);
          response_list.faturamento_oriundo_inovacao.push(
            pessoa.faturamento_oriundo_inovacao
          );
          response_list.total_inovacao_implementada_empresa.push(
            pessoa.total_inovacao_implementada_empresa
          );
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar pessoas", err);
        for (const key in response_list) {
          response_list[key].push(null);
        }
      });
  }

  const logInfo = `Carregando [pessoas] para os anos [${params}]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    data: response_list,
  });
};

module.exports.salvar_pessoas = async (event, action) => {
  const { company, companyId } = action;

  const body = JSON.parse(event.body);
  const { year } = body;

  const data = {
    EmpresaId: companyId,
    ano_exercicio: year,
    ...body.data,
  };

  const pessoa = await company.getPeopleByYear(year);

  if (pessoa) {
    const filter = {
      where: { EmpresaId: companyId, ano_exercicio: year },
      raw: true,
    };
    await Pessoas.update(data, filter);
  } else {
    await Pessoas.create(data);
  }

  const logInfo = `Dados [pessoas] do ano [${year}] atualizados com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: `Dados de Pessoas atualizados com sucesso`,
  });
};

module.exports.salvar_avaliacao = async (event, action) => {
  const { companyId } = action;
  const { year, smiles } = JSON.parse(event.body);

  const ano = parseInt(year, 10) - 1;

  for (const smile of Object.keys(smiles)) {
    const name = smile.replace("smile_", "");
    smiles[name] = smiles[smile];
  }

  const data = {
    EmpresaId: companyId,
    ano_exercicio: ano,
    ...smiles,
  };

  const filterAvaliacao = {
    where: { EmpresaId: companyId, ano_exercicio: ano },
    raw: true,
  };
  const avaliacao = await Pessoas_Avaliacao.findOne(filterAvaliacao);
  if (avaliacao) {
    await Pessoas_Avaliacao.update(smiles, filterAvaliacao);
  } else {
    await Pessoas_Avaliacao.create(data);
  }

  await gravarPontos(companyId, smiles, ano, "pessoas");

  const logInfo = `Avaliação do Ambiente Interno [pessoas] do ano [${
    ano + 1
  }] atualizado com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: "Dados atualizados com sucesso",
  });
};

module.exports.pessoas_detalhes = async (event, action) => {
  const { companyId } = action;
  const anos = await AnoExercicioEmpresa.getAll(companyId);
  const analise = {};

  for (const ano of anos) {
    const ano_analise = parseInt(ano, 10) - 1;

    const filterCompany = {
      where: { ano_exercicio: ano_analise, EmpresaId: companyId },
      raw: true,
    };

    await Pessoas.findOne(filterCompany)
      .then(async (pessoas) => {
        let data = {};
        let status;

        if (pessoas) {
          data = pessoas;
          delete data.EmpresaId;
          delete data.createdAt;
          delete data.updatedAt;

          // calcular pontos de compentência
          const op = calcularNivelCompetencia(pessoas.competencia_operacao);
          const adm = calcularNivelCompetencia(pessoas.competencia_adm);
          const ger = calcularNivelCompetencia(pessoas.competencia_gerenciais);
          const media_competencia = ((op + adm + ger) / 15) * 100;

          // calcular pontos de engajamento
          const rel = calcularNivelEngajamento(
            pessoas.engajamento_relacionamento_interpessoal
          );
          const mot = calcularNivelEngajamento(
            pessoas.engajamento_motivacao_comprometimento
          );
          const com = calcularNivelEngajamento(
            pessoas.engajamento_comunicacao_interna
          );
          const cli = calcularNivelEngajamento(
            pessoas.engajamento_clima_organizacional
          );
          const media_engajamento = ((rel + mot + com + cli) / 20) * 100;

          // calcular pontos de rentenção
          const plan = calcularNivelRetencao(pessoas.retencao_plano_carreira);
          const carg = calcularNivelRetencao(pessoas.retencao_cargo_salario);
          const aval = calcularNivelRetencao(
            pessoas.retencao_avaliacao_desempenho
          );
          const rep = calcularNivelRetencao(
            pessoas.retencao_reconhecimento_pessoas
          );
          const rec = calcularNivelRetencao(pessoas.retencao_recompensa);
          const media_retencao = ((plan + carg + aval + rep + rec) / 25) * 100;

          data = {
            ...data,
            nivel_competencia: media_competencia,
            nivel_engajamento: media_engajamento,
            nivel_retencao: media_retencao,
          };

          status = "success";

          await Pessoas_Avaliacao.findOne(filterCompany)
            .then((avaliacao) => {
              data = {
                ...data,
                avaliacao,
              };
            })
            .catch((err) => {
              console.info(err);
              status = "fatal_error";
              data.message =
                "Ocorreu um erro ao buscar os dados de Avaliações de Pessoas";
            });
        } else {
          status = "fail";
          data.message =
            "Não foi possível localizar nenhuma avaliação cadastrada.";
        }

        data.status = status;
        analise[ano] = data;
      })
      .catch((err) => {
        console.info(err);
        analise[ano] = {
          status: "fatal_error",
          message: "Ocorreu um erro ao buscar os dados de Pessoas",
        };
      });
  }

  return Handler.Ok({
    status: "success",
    analise,
  });
};

module.exports.calcularNivelCompetencia = calcularNivelCompetencia

module.exports.calcularNivelEngajamento = calcularNivelEngajamento

module.exports.calcularNivelRetencao = calcularNivelRetencao

module.exports.updateEficienciaPessoas = updateEficienciaPessoas