const Handler = require("../handler");
const models = require("../../models");
const { atualizarEstrategiaMapa } = require("../generico/FuncoesDeEstrategias");
const getModel = require("../generico/GetModel");

const { Estrategias } = models;

const getEstrategias = async (
  companyId,
  model,
  perspectiva,
  categoria,
  filterForeignKey
) => {
  const filterCompany = {
    include: [
      {
        model: Estrategias,
        where: {
          perspectiva: perspectiva.toLowerCase(),
          categoria,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "id"],
        },
      },
    ],
    where: {
      empresa_id: companyId,
      ...filterForeignKey,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt", "estrategia_id"],
    },
    order: [["descricao", "ASC"]],
    raw: true,
  };
  const result = await model.findAll(filterCompany);
  if (result.length > 0) {
    return result;
  }

  return [];
};

const getForeignKeyByYear = async (companyId, foreignKey, ano) => {
  const model = foreignKey.table;
  const { idName } = foreignKey;

  let id = 0;

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: ano,
    },
  };
  await model.findOne(filter).then(async (result) => {
    if (result) {
      id = result.id;
    }
  });

  return {
    [idName]: id,
  };
};

const findResults = async (company, ano) => {
  const companyId = company.id;
  const result = {
    estrategias: {
      name: "Estratégias",
      items: [],
    },
  };

  const tables = getModel.allCategory();

  const promises = Object.keys(tables).map(async (perspectiva) => {
    const table_estrategia = tables[perspectiva].estrategias;
    const categorias = Object.keys(tables[perspectiva].objetivos);
    const { foreignKey } = tables[perspectiva];
    const estrategiasPerspectiva = [];

    const promisesCategoria = categorias.map(async (categoria) => {
      const filterForeignKey = await getForeignKeyByYear(
        companyId,
        foreignKey,
        ano
      );

      const found = await getEstrategias(
        companyId,
        table_estrategia,
        perspectiva,
        categoria,
        filterForeignKey
      );

      for (let j = 0; j < found.length; j++) {
        const item = found[j];
        if (item.definida === 0) {
          result.estrategias.items.push(item);
        } else {
          estrategiasPerspectiva.push(item);
        }
      }
    });

    await Promise.all(promisesCategoria);

    result[perspectiva.toLowerCase()] = {
      name: perspectiva,
      items: estrategiasPerspectiva,
    };
  });

  await Promise.all(promises);

  return result;
};

const validaTotalQuantidade = (mapa, limite) => {
  const perspectivas = Object.keys(mapa).filter(
    (perspectiva) => perspectiva !== "estrategias"
  );

  const quantidadeEstrategias = perspectivas
    .map((perspectiva) => mapa[perspectiva].items.length)
    .reduce((a, b) => a + b, 0);

  return quantidadeEstrategias <= limite;
};

const validataPerspectivaQuantidade = async (mapa, limite) => {
  let status = "success";
  let message;
  const perspectivaErrors = [];
  const perspectivaZerada = [];

  const perspectivas = Object.keys(mapa).filter(
    (perspectiva) => perspectiva !== "estrategias"
  );
  const promises = perspectivas.map(async (perspectiva) => {
    const estrategias = mapa[perspectiva].items.length;

    if (estrategias > limite) {
      perspectivaErrors.push(
        perspectiva.charAt(0).toUpperCase() + perspectiva.slice(1)
      );
    }

    if (estrategias === 0) {
      perspectivaZerada.push(
        perspectiva.charAt(0).toUpperCase() + perspectiva.slice(1)
      );
    }
  });
  await Promise.all(promises);

  if (perspectivaZerada.length > 0) {
    status = "error";
    message = `Opa, você não definiu nenhuma estratégia em: ${perspectivaZerada.join(
      ", "
    )}. Verifique a(s) perspectiva(s) antes de continuar :)`;
  }
  if (perspectivaErrors.length > 0) {
    status = "error";
    message = `Opa, você ultrapassou o limite de estratégias em: ${perspectivaErrors.join(
      ", "
    )} . Verifique a(s) perspectiva(s) antes de continuar :)`;
  }

  return {
    status,
    message,
  };
};

module.exports.buscarDados = async (event, action) => {
  const { company } = action;
  const anos = await company.getExercises();
  const analise = {};

  const run = async (ano) => {
    analise[ano] = await findResults(company, ano - 1);
  };

  const promises = anos.map((ano) => run(ano));

  await Promise.all(promises);
  return Handler.Ok({
    status: "success",
    analise,
  });
};

module.exports.salvarDados = async (event, action) => {
  const { mapa } = JSON.parse(event.body);

  const limiteTotalEstrategias = 16;
  const limitePorPerspectiva = 6;

  if (!validaTotalQuantidade(mapa, limiteTotalEstrategias)) {
    return Handler.BadRequest({
      message: `Exagerou hein?! :( O limite total de estratégias é de ${limiteTotalEstrategias}.`,
    });
  }

  const valida = await validataPerspectivaQuantidade(
    mapa,
    limitePorPerspectiva
  );
  if (valida.status === "error") {
    return Handler.BadRequest(valida);
  }

  const perspectivas = Object.keys(mapa).filter(
    (perspectiva) => perspectiva !== "estrategias"
  );

  const promises = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const perspectiva of perspectivas) {
    console.info(`Atualizando perspectiva [${perspectiva}]`);
    const { items } = mapa[perspectiva];
    const status = perspectiva === "estrategias" ? 0 : 1;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      promises.push(atualizarEstrategiaMapa(item, status));
    }
  }

  await Promise.all(promises);

  return Handler.Ok({
    message: "Mapa salvo com sucesso",
  });
};
