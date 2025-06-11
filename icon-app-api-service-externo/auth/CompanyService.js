/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const { Op } = require("sequelize");
const Models = require("../models");

const nameNormalize = (name) => {
  const normalized = name.normalize("NFD");
  const replaced = normalized.replace(/[\u0300-\u036f]/g, "");
  const space_replaced = replaced.replace(/\s/g, "_");
  const response = space_replaced.toLowerCase();
  return response;
};

class DRE_Despesa {
  constructor(despesa) {
    this.id = despesa.id || null;
    this.dre_id = despesa.dre_id || null;
    this.description = despesa.description || null;
    this.value = despesa.value;
    this.editable = !!despesa.editable;
    this.isDreDespesa =
      despesa.isDreDespesa === undefined
        ? true
        : !!(despesa.isDreDespesa === 1 || despesa.isDreDespesa === true);
    this.key = despesa.key || null;
  }

  static despesasDefaults = [
    {
      key: "despesas_com_pessoal",
      label: "Pessoal",
      editable: false,
      isDreDespesa: true,
    },
    {
      key: "despesas_vendas",
      label: "Comerciais",
      editable: true,
      isDreDespesa: true,
    },
    {
      key: "despesas_administrativas",
      label: "Administrativa",
      editable: true,
      isDreDespesa: true,
    },
    {
      key: "despesas_tributaria",
      label: "Tributárias",
      editable: true,
      isDreDespesa: true,
    },
    {
      key: "despesas_viagens",
      label: "Viagens",
      editable: true,
      isDreDespesa: true,
    },
    {
      key: "despesas_logistica",
      label: "Logística",
      editable: true,
      isDreDespesa: true,
    },
    {
      key: "despesas_servicos_pj",
      label: "Serviços",
      editable: true,
      isDreDespesa: true,
    },
    {
      key: "despesas_ocupacao",
      label: "Ocupação",
      editable: true,
      isDreDespesa: true,
    },
    {
      key: "custo_dos_produtos_industrializados",
      label: "Custos de Mercadorias Vendidas",
      editable: false,
      isDreDespesa: false,
    },
    {
      key: "despesas_financeiras",
      label: "Despesas Financeiras",
      editable: false,
      isDreDespesa: false,
    },
  ];

  static async createDefault(dreId) {
    await Promise.all(
      this.despesasDefaults.map((despesa) => {
        if (despesa.isDreDespesa) {
          return DRE_Despesa.create(dreId, despesa.label, 0, despesa.editable);
        }
        return null;
      })
    );
  }

  static async copyFromDre(dreIdToCopy, dreIdBase, companyId) {
    const dre = new DRE(companyId);
    await dre.loadById(dreIdBase);

    if (dre.despesas.length > 0) {
      await Promise.all(
        dre.despesas.map((despesa) => {
          if (despesa.isDreDespesa) {
            return DRE_Despesa.create(
              dreIdToCopy,
              despesa.description,
              0,
              despesa.editable,
              despesa.key
            );
          }
          return null;
        })
      );
    }
  }

  static async create(dreId, description, value, editable, key = null) {
    await Models.Dre_Despesas.create({
      dre_id: dreId,
      description,
      value,
      editable,
      key: key === null ? nameNormalize(description) : key,
    });
    console.info(`Despesa [${description}] criada com sucesso`);
  }

  static async findBy(dreId, key) {
    const filter = {
      where: {
        dre_id: dreId,
        key,
      },
      raw: true,
    };
    const response = await Models.Dre_Despesas.findOne(filter);

    if (!response) return null;

    return new DRE_Despesa(response);
  }

  async updateDespesasDre() {
    await Promise.all(
      this.despesasDefaults.map((despesa) => {
        if (despesa.isDreDespesa) {
          return this.createDespesaDre(
            this.dreId,
            despesa.label,
            this.dreStorage[despesa.key] || 0,
            despesa.editable
          );
        }
        return null;
      })
    );
  }

  async setDespesas() {
    const filter = {
      where: {
        dre_id: this.dreId,
      },
      attributes: ["id", "dre_id", "description", "value", "editable", "key"],
      raw: true,
    };
    const despesas = await Models.Dre_Despesas.findAll(filter);

    if (despesas.length === 0) {
      await this.updateDespesasDre();
      return this.getDespesasByDre();
    }

    return despesas;
  }

  static nameNormalize(name) {
    return nameNormalize(name);
  }
}

class DRE {
  #inputs;

  constructor(companyId) {
    this.companyId = companyId;
    this.year = undefined;
    this.id = undefined;
  }

  #camposCalculaveis() {
    const dre = this.inputs;
    // eslint-disable-next-line no-underscore-dangle
    const _dre = {};

    const receita_bruta =
      (dre.receita_servico || 0) +
      (dre.receita_produto || 0) +
      (dre.outras_receitas || 0);
    _dre.receita_bruta = receita_bruta;

    const deducoes_sobre_receita =
      dre.imposto_sobre_receitas + dre.devolucao_abatimentos;
    _dre.deducoes_sobre_receita = deducoes_sobre_receita;

    const receita_liquida = receita_bruta - deducoes_sobre_receita;
    _dre.receita_liquida = receita_liquida;

    const custo_dos_produtos_industrializados =
      dre.custo_dos_produtos_industrializados || 0;
    _dre.custo_dos_produtos_industrializados =
      custo_dos_produtos_industrializados;
    const custo_total = custo_dos_produtos_industrializados;
    _dre.custo_total = custo_dos_produtos_industrializados;

    const lucro_bruto = receita_liquida - custo_total;
    _dre.lucro_bruto = lucro_bruto;

    const despesas_operacionais = this.despesas.reduce(
      (prevItem, currentItem) => prevItem + (currentItem.value || 0),
      0
    );
    _dre.valor_total_despesas_operacionais = despesas_operacionais;

    const ebitda = lucro_bruto - despesas_operacionais;
    _dre.ebitda = ebitda;
    _dre.percentual_ebitda = ebitda > 0 ? (ebitda / receita_liquida) * 100 : 0;

    const resultado_financeiro =
      (dre.receitas_financeiras || 0) - (dre.despesas_financeiras || 0);
    _dre.resultado_financeiro = resultado_financeiro;

    const lucro_operacional =
      ebitda + resultado_financeiro - (dre.depreciacao_amortizacao || 0);
    _dre.lucro_operacional = lucro_operacional;

    const lucro_liquido =
      lucro_operacional -
      ((dre.imposto_de_renda || 0) + (dre.constribuicao_social || 0));
    _dre.lucro_liquido = lucro_liquido;

    _dre.rentabilidade =
      receita_bruta > 0 ? (100 / receita_bruta) * lucro_liquido : 0;

    const inadimplencia = dre.inadimplencia || 0;
    _dre.inadimplencia = inadimplencia;
    _dre.inadimplencia_perc =
      inadimplencia > 0 ? (inadimplencia / (receita_bruta / 12)) * 100 : 0;

    const endividamento = dre.endividamento || 0;
    _dre.anos_divida = endividamento > 0 ? endividamento / lucro_liquido : 0;

    _dre.percentual_custo_dos_produtos_industrializados =
      custo_dos_produtos_industrializados > 0
        ? (custo_dos_produtos_industrializados / receita_bruta) * 100
        : 0;

    _dre.valor_total_despesas = 0;

    this.despesas.push(
      new DRE_Despesa({
        description: "Financeiras",
        value: dre.despesas_financeiras,
        key: "financeiras",
        isDreDespesa: false,
      })
    );
    this.despesas.push(
      new DRE_Despesa({
        description: "Custo de Mercadorias Vendidas",
        value: dre.custo_dos_produtos_industrializados,
        key: "custo_dos_produtos_industrializados",
        isDreDespesa: false,
      })
    );

    this.despesas.forEach((despesa) => {
      const valueDespesa = despesa.value > 0 ? despesa.value : 0;
      _dre.valor_total_despesas += valueDespesa;
      const value = valueDespesa > 0 ? (valueDespesa / receita_bruta) * 100 : 0;
      const despesaNormalized = nameNormalize(despesa.description);
      despesa.field = `despesas_${despesaNormalized}`;
      _dre[`percentual_despesa_${despesaNormalized}`] = value;
      if (despesa.description === "Pessoal") {
        _dre.despesas_com_pessoal = despesa.value;
        despesa.field = "despesas_com_pessoal";
      }
      if (despesa.description === "Financeiras") {
        _dre.despesas_financeiras = despesa.value;
        despesa.field = "despesas_financeiras";
      }
      if (despesa.description === "Custo de Mercadorias Vendidas") {
        _dre.custo_dos_produtos_industrializados = despesa.value;
        despesa.field = "custo_dos_produtos_industrializados";
      }
    });

    this.despesas.forEach((despesa) => {
      const valueDespesa = despesa.value > 0 ? despesa.value : 0;
      despesa.percentage =
        (valueDespesa / _dre.valor_total_despesas) * 100 || 0;
    });

    this.#inputs = {
      ...this.#inputs,
      ..._dre,
    };
  }

  static async create(companyId, year) {
    const temp = await Models.Dre.create({
      EmpresaId: companyId,
      ano_exercicio: year,
    });
    console.info(`DRE ${year} criado com sucesso`);

    const filter = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: {
          [Op.ne]: year,
        },
      },
      order: [["ano_exercicio", "DESC"]],
      raw: true,
    };
    const dreStorage = await Models.Dre.findOne(filter);

    if (dreStorage) {
      await DRE_Despesa.copyFromDre(temp.id, dreStorage.id, companyId);
    } else {
      await DRE_Despesa.createDefault(temp.id);
    }
    console.info(`DRE Despesas para ${year} criadas com sucesso`);
  }

  async #loadDespesas() {
    const filter = {
      where: {
        dre_id: this.id,
      },
      attributes: ["id", "dre_id", "description", "value", "editable", "key"],
      raw: true,
    };
    try {
      const despesas = await Models.Dre_Despesas.findAll(filter);
      if (despesas.length === 0) {
        await Promise.all(
          DRE_Despesa.despesasDefaults.map((despesa) => {
            if (despesa.isDreDespesa) {
              return DRE_Despesa.create(
                this.id,
                despesa.label,
                this.#inputs[despesa.key] || 0,
                despesa.editable
              );
            }
            return null;
          })
        );
      }

      despesas.forEach((despesa) => {
        this.despesas.push(new DRE_Despesa(despesa));
      });
    } catch (e) {
      console.error(e);
      this.despesas = [];
    }
  }

  async #parseDreData(data) {
    this.#inputs = data;
    this.id = data.id;
    this.year = data.ano_exercicio;
    this.despesas = [];
    await this.#loadDespesas();
    return this.#camposCalculaveis();
  }

  get inputs() {
    return this.#inputs;
  }

  async loadByYear(year) {
    const filter = {
      where: {
        EmpresaId: this.companyId,
        ano_exercicio: year,
      },
      raw: true,
    };
    const dreStorage = await Models.Dre.findOne(filter);

    if (!dreStorage) {
      // create a new dre default
      return;
    }

    await this.#parseDreData(dreStorage);
  }

  async loadById(dreId) {
    const filter = {
      where: {
        EmpresaId: this.companyId,
        id: dreId,
      },
      raw: true,
    };
    const dreStorage = await Models.Dre.findOne(filter);

    if (!dreStorage) {
      // create a new dre default
      return;
    }

    await this.#parseDreData(dreStorage);
  }

  async loadFromDataSheet(data) {
    return this.#parseDreData(data);
  }
}

class Company {
  #companyData;

  #exercises = undefined;

  #dre = {};

  #commercial = {};

  #processes = {};

  #people = {};

  constructor(companyId) {
    this.id = companyId;
  }

  #wrapperFilterCompany(whereParams) {
    return {
      where: {
        EmpresaId: this.id,
        ...whereParams,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      raw: true,
    };
  }

  get exercises() {
    return this.#exercises;
  }

  get dre() {
    return this.#dre;
  }

  async getCompanyData() {
    if (this.#companyData) return this.#companyData;

    const filterEmpresaId = {
      where: {
        id: this.id,
      },
      raw: true,
    };
    const company = await Models.Empresas.findOne(filterEmpresaId);

    this.#companyData = company;

    return this.#companyData;
  }

  async getExercises() {
    if (this.#exercises) return this.#exercises;

    const filterEmpresaId = {
      where: {
        EmpresaId: this.id,
      },
      raw: true,
    };
    const exercises = await Models.Empresa_Exercicios.findAll(filterEmpresaId);

    this.#exercises = exercises.map((exercise) => exercise.ano);

    return this.#exercises;
  }

  async createNewDre(year) {
    await DRE.create(this.id, year);
    return this.getDreByYear(year);
  }

  async getDreById(dreId) {
    const dreCache = Object.keys(this.#dre);

    if (dreCache.length > 0) {
      const dreYearCache = dreCache.find(
        (year) => this.#dre[year].id === dreId
      );
      if (dreYearCache) {
        return this.#dre[dreYearCache];
      }
    }

    const dre = new DRE(this.id);
    await dre.loadById(dreId);

    if (dre.id && dre.year) {
      this.#dre[dre.year] = dre;
      return dre;
    }

    return null;
  }

  async getDreByYear(year) {
    if (this.#dre[year]) return this.#dre[year];

    const dre = new DRE(this.id);
    await dre.loadByYear(year);

    if (dre.id && dre.year) {
      this.#dre[year] = dre;

      return this.#dre[year];
    }

    return null;
  }

  async getProcessesByYear(year) {
    if (this.#processes[year]) return this.#processes[year];

    const filter = this.#wrapperFilterCompany({
      ano_exercicio: year,
    });
    const processes = await Models.Processos.findOne(filter);

    if (!processes) return null;

    if (processes.id && processes.ano_exercicio) {
      this.#processes[year] = processes;

      return this.#processes[year];
    }

    return null;
  }

  async getCommercialByYear(year) {
    if (this.#commercial[year]) return this.#commercial[year];

    const filter = this.#wrapperFilterCompany({
      ano_exercicio: year,
    });
    const commercial = await Models.Vendas.findOne(filter);

    if (!commercial) return null;

    if (commercial.id && commercial.ano_exercicio) {
      this.#commercial[year] = commercial;

      return this.#commercial[year];
    }

    return null;
  }

  async getPeopleByYear(year) {
    if (this.#people[year]) return this.#people[year];

    const filter = this.#wrapperFilterCompany({
      ano_exercicio: year,
    });
    const people = await Models.Pessoas.findOne(filter);

    if (!people) return null;

    if (people.id && people.ano_exercicio) {
      this.#people[year] = people;

      return this.#people[year];
    }

    return null;
  }

  async getObjetivoReceitasByDreId(dreId) {
    const filterCompany = this.#wrapperFilterCompany({
      dreId,
    });
    const response = await Models.Objetivo_Receitas.findOne(filterCompany);

    return response;
  }

  async getObjetivoRentabilidadeByDreId(dreId) {
    const filterCompany = this.#wrapperFilterCompany({
      dreId,
    });
    const response = await Models.Objetivo_Rentabilidade.findOne(filterCompany);
    return response;
  }

  async getObjetivoCustosByDreId(dreId) {
    const filterCompany = this.#wrapperFilterCompany({
      dreId,
    });
    const response = await Models.Objetivo_Custos.findOne(filterCompany);

    if (response) {
      const filter = {
        where: {
          objetivo_id: response.id,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        raw: true,
      };
      const objetivoCustosDespesas =
        await Models.Objetivo_Custos_Despesas.findAll(filter);
      if (objetivoCustosDespesas.length === 0) {
        const objetivoCustosKeys = Object.keys(response);
        const promises = DRE_Despesa.despesasDefaults.map(async (despesa) => {
          const despesaKey = despesa.key;
          if (
            objetivoCustosKeys.indexOf(despesaKey) >= 0 ||
            despesaKey === "despesas_tributaria"
          ) {
            const payload = {
              objetivo_id: response.id,
              description: despesaKey
                .replace("despesas_com_", "")
                .replace("despesas_", "")
                .replace("vendas", "comerciais")
                .replace("tributaria", "tributarias")
                .replace("servicos_pj", "servicos")
                .replace("administrativas", "administrativa"),
              value: response[despesaKey],
            };

            const dreDespesa = await DRE_Despesa.findBy(
              response.dreId,
              payload.description
            );
            if (dreDespesa) {
              payload.despesa_id = dreDespesa.id;
            }

            await Models.Objetivo_Custos_Despesas.create(payload);
            console.info("Despesa adicionada com sucesso");
          } else {
            console.info("não encontrou");
          }
          return "";
        });
        await Promise.all(promises);

        return this.getObjetivoCustosByDreId(dreId);
      }

      response.despesas = objetivoCustosDespesas;
      response.despesas_total = objetivoCustosDespesas
        .map((despesa) => despesa.value)
        .reduce((prev, next) => prev + next);
      const despesas_com_pessoal = objetivoCustosDespesas.find(
        (despesa) => despesa.description === "despesas_com_pessoal"
      );
      if (despesas_com_pessoal) {
        response.despesas_com_pessoal = despesas_com_pessoal.value;
      }
      const custo_dos_produtos_industrializados = objetivoCustosDespesas.find(
        (despesa) =>
          despesa.description === "custo_dos_produtos_industrializados"
      );
      if (custo_dos_produtos_industrializados) {
        response.custo_dos_produtos_industrializados =
          custo_dos_produtos_industrializados.value;
      }
    }

    return response;
  }

  async getObjetivoEndividamentoByDreId(dreId) {
    const filterCompany = this.#wrapperFilterCompany({
      dreId,
    });
    const response = await Models.Objetivo_Endividamento.findOne(filterCompany);

    return response;
  }
}

exports.Company = Company;
exports.DRE = DRE;
exports.DRE_Despesa = DRE_Despesa;
