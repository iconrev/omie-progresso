const models = require("../../../models");
const {
  Concorrentes_Swot,
  Concorrentes_Swot_Opcoes_Ameacas,
  Concorrentes_Swot_Opcoes_Oportunidades,
  Clientes_Swot,
  Clientes_Swot_Opcoes_Ameacas,
  Clientes_Swot_Opcoes_Oportunidades,
  Fornecedores_Swot,
  Fornecedores_Swot_Opcoes_Ameacas,
  Fornecedores_Swot_Opcoes_Oportunidades,
  Macros,
  Macros_Swot_Opcoes_Ameacas,
  Macros_Swot_Opcoes_Oportunidades,
} = models;
const Handler = require("../../handler");

const _pontos = [3, 2, 1];

exports.tabela = (event, context, callback) => {
  try {
    const { nome } = event.queryStringParameters;
    switch (nome) {
      case "concorrentes":
        const Concorrentes = require("./Concorrentes");
        return Concorrentes.concorrentes_tabela_swot(event, context, callback);
      case "fornecedores":
        const Fornecedores = require("./Fonecedores");
        return Fornecedores.fornecedores_tabela_swot(event, context, callback);
      case "clientes":
        const Clientes = require("./Clientes");
        return Clientes.clientes_tabela_swot(event, context, callback);
      case "macro":
        const Macro = require("./Macro");
        return Macro.macros_tabela_swot(event, context, callback);
      default:
        return Handler.Ok({
          oportunidades: [],
          ameacas: [],
        });
    }
  } catch (error) {
    return Handler.Error({
      message: "Erro executando instruções no Servidor",
    });
  }
};

exports.calcularPontosSwot = async (recurso, item) => {
  if (recurso.includes("OP")) {
    return (
      _pontos[item.atratividade_da_oportunidade] *
      _pontos[item.probabilidade_de_sucesso_da_oportunidade]
    );
  }
  return (
    _pontos[item.relevancia_da_ameaca] *
    _pontos[item.probabilidade_de_ocorrer_a_ameaca]
  );
};

exports.gravarPontosSwot = async (objeto, item) => {
  try {
    await objeto
      .findOne({
        where: {
          valorId: item.valorId,
          EmpresaId: item.empresa,
          origem: item.origem,
          ano_exercicio: item.ano_exercicio,
        },
        raw: true,
      })
      .then(async (result) => {
        if (result)
          await objeto
            .update(
              {
                descricao: item.descricao,
                pontos: item.pontos,
                origem: item.origem,
              },
              {
                where: {
                  valorId: item.valorId,
                  EmpresaId: item.empresa,
                  origem: item.origem,
                  ano_exercicio: item.ano_exercicio,
                },
                raw: true,
              }
            )
            .then((result) => {
              console.info(
                "DONE",
                `As informações de ${item.origem} na tabela de SWOT (relatório) foram atualizadas com sucesso`
              );
            });
        else {
          await objeto
            .create({
              valorId: item.valorId,
              EmpresaId: item.empresa,
              descricao: item.descricao,
              pontos: item.pontos,
              origem: item.origem,
              ano_exercicio: item.ano_exercicio,
            })
            .then((result) => {
              console.info(
                "DONE",
                `As informações de ${item.origem} na tabela de SWOT (relatório) foram criadas com sucesso`
              );
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (error) {
    console.error(error);
  }
};

exports.removerPontosSwot = async (objeto, item) => {
  try {
    await objeto
      .findOne({
        where: {
          valorId: item.valorId,
          EmpresaId: item.empresa,
          origem: item.origem,
          ano_exercicio: item.ano_exercicio,
        },
        raw: true,
      })
      .then(async (result) => {
        if (result) {
          objeto.destroy({ where: { id: result.id } }).then((result) => {
            console.info(
              "DONE",
              `As informações de SWOT (relatório) foram atualizadas com sucesso`
            );
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

const tableDB = {
  concorrentes: {
    swot: Concorrentes_Swot,
    ameaca: Concorrentes_Swot_Opcoes_Ameacas,
    oportunidade: Concorrentes_Swot_Opcoes_Oportunidades
  },
  clientes: {
    swot: Clientes_Swot,
    ameaca: Clientes_Swot_Opcoes_Ameacas,
    oportunidade: Clientes_Swot_Opcoes_Oportunidades
  },
  fornecedores: {
    swot: Fornecedores_Swot,
    ameaca: Fornecedores_Swot_Opcoes_Ameacas,
    oportunidade: Fornecedores_Swot_Opcoes_Oportunidades
  },
  macro: {
    swot: Macros,
    ameaca: Macros_Swot_Opcoes_Ameacas,
    oportunidade: Macros_Swot_Opcoes_Oportunidades
  }
};

exports.criar_tabela_swot_opcao = async (event) => {

  try {
    const body = JSON.parse(event.body);
    const { companyId, nome, origem } = event.pathParameters;

    const { descricao } = body;
    if (!descricao) return Handler.BadRequest({ message: "Opção Inválida" });

    const externoSwot = tableDB[nome]
    if (!externoSwot) return Handler.NotFound({ message: "Tabela não encontrada" });

    const modelTable = externoSwot[origem];
    if (!modelTable) return Handler.NotFound({ message: "Origem não encontrada" });

    const query = {
      where: {
        EmpresaId: companyId,
        descricao
      }
    };

    const optionItem = await modelTable.findOne(query);
    if (optionItem) return Handler.BadRequest({ message: "Opção já criada" });

    await modelTable.create({
      EmpresaId: companyId,
      descricao,
    });
  } catch (e) {
    console.error(e);
    return Handler.Error({
      message: "Erro ao criar opção swot",
    });
  }

  return Handler.Created({ message: "✅😎" });
};

exports.atualizar_tabela_swot_opcao = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { id, companyId, nome, origem } = event.pathParameters;

    if (!id) return Handler.BadRequest({ message: "id inválido" });
    const idRow = parseInt(id) + 1

    const { descricao } = body;
    if (!descricao) return Handler.BadRequest({ message: "Opção Inválida" });

    const externoSwot = tableDB[nome]
    if (!externoSwot) return Handler.NotFound({ message: "Tabela não encontrada" });

    const modelTable = externoSwot[origem];
    if (!modelTable) return Handler.NotFound({ message: "Origem não encontrada" });

    const query = {
      where: {
        id: idRow,
        EmpresaId: companyId
      }
    };
    const optionItem = await modelTable.findOne(query);
    if (!optionItem) return Handler.NotFound();
    optionItem.descricao = descricao;
    await optionItem.save();
  } catch (e) {
    console.error(e);
    return Handler.Error({
      message: "Erro ao atualizar opção swot",
    });
  }

  return Handler.Ok({ message: "✅😎" });
};

exports.deletar_tabela_swot_opcao = async (event) => {
  try {
    const { id, companyId, nome, origem } = event.pathParameters;

    if (!id) return Handler.BadRequest({ message: "id inválido" });

    const externoSwot = tableDB[nome]
    if (!externoSwot) return Handler.NotFound({ message: "Tabela não encontrada" });

    const modelTable = externoSwot[origem];
    if (!modelTable) return Handler.NotFound({ message: "Origem não encontrada" });

    const swotTable = externoSwot["swot"]

    const swotOptionIdFind = {
      ameaca: "ameacaId",
      oportunidade: "oportunidadeId"
    }

    const queryFindUsedOption = {
      where: {
        EmpresaId: companyId
      }
    };

    queryFindUsedOption.where[swotOptionIdFind[origem]] = id

    const usedOption = await swotTable.findOne(queryFindUsedOption)
    if (usedOption) return Handler.BadRequest({ message: "Não pode apagar uma opção que está em uso!" });

    const idRow = parseInt(id) + 1

    const query = {
      where: {
        id: idRow,
        EmpresaId: companyId
      }
    };
    const optionItem = await modelTable.findOne(query);
    if (!optionItem) return Handler.NotFound();
    await optionItem.destroy();
  } catch (e) {
    console.error(e);
    return Handler.Error({
      message: "Erro ao deletar opção swot",
    });
  }

  return Handler.Ok({ message: "✅😎" });
};
