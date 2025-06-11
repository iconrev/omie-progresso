const Concorrentes = require("../diagnostico/data/Concorrentes");
const Clientes = require("../diagnostico/data/clientes");
const Fornecedores = require("../diagnostico/data/fornecedores");
const Macros = require("../diagnostico/data/Macros");

const getResource = (resource) => {
  switch (resource) {
    case "Concorrentes":
    case "Concorrentes_Swot":
      return Concorrentes;
    case "Clientes":
    case "Clientes_Swot":
      return Clientes;
    case "Fornecedores":
    case "Fornecedores_Swot":
      return Fornecedores;
    case "Macros":
      return Macros;
    default:
      return null;
  }
};

const insertTemplate = async (companyId, year, resourceName) => {
  const resource = getResource(resourceName);

  if (resource) {
    if (resourceName.includes("Swot")) {
      await resource.setupSwot(companyId, year);
    } else {
      await resource.setupData(companyId, year);
    }
  }
};

const getAll = async (companyId, model, year, rawData = true) => {
  const filter = {
    where: {
      EmpresaId: companyId,
    },
    raw: rawData,
  };
  if (year) {
    filter.where.ano_exercicio = year;
  }

  const questionarios = await model.findAll(filter);

  if (questionarios.length === 0 && year) {
    const resource = model.tableName;
    await insertTemplate(companyId, year, resource);
    return getAll(companyId, model, year);
  }

  return questionarios;
};

exports.getAll = getAll;
