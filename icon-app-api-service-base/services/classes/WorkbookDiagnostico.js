const { WorkbookBase } = require("./WorkbookBase");

class WorkbookDiagnostico extends WorkbookBase {
  #data = null;

  get data() {
    return this.#data;
  }

  #mappingDiagnostico(column) {
    const ociosidade = 100 - this.getItem(`${column}22`, 0, "perc");

    return {
      ano_exercicio: this.getItem(`${column}5`, null, "int"),
      // comercial
      carteira_de_clientes_ativa: this.getItem(`${column}7`, 0, "int"),
      novos_clientes_no_ano: this.getItem(`${column}8`, 0, "int"),
      base_clientes: this.getItem(`${column}9`, 0, "int"),
      propostas_enviadas_no_ano: this.getItem(`${column}10`, 0, "int"),
      propostas_aprovadas_no_ano: this.getItem(`${column}11`, 0, "int"),
      notas_fiscais_emitidas: this.getItem(`${column}12`, 0, "int"),
      clientes_fidelizados: this.getItem(`${column}13`, 0, "int"),
      reclamacoes_clientes: this.getItem(`${column}14`, 0, "int"),
      clientes_perdidos: this.getItem(`${column}15`, 0, "int"),
      // processos internos
      funcionarios: this.getItem(`${column}17`, 0, "int"),
      volume_produzido_no_ano: this.getItem(`${column}18`, 0, "int"),
      capacidade_produzida: this.getItem(`${column}19`, 0, "int"),
      refugo_retrabalho: this.getItem(`${column}20`, 0, "perc"),
      custos_garantia: this.getItem(`${column}21`, 0, "float"),
      percentual_disponibilidade_equipamento:
        ociosidade > 0 ? ociosidade : ociosidade,
      valor_do_estoque: this.getItem(`${column}23`, 0, "float"),
      entregas_no_prazo: this.getItem(`${column}24`, 0, "perc"),
      // pessoas
      funcionarios_antigos: this.getItem(`${column}26`, 0, "perc"),
      rotatividade: this.getItem(`${column}27`, 0, "perc"),
      absenteismo: this.getItem(`${column}28`, 0, "perc"),
    };
  }

  #mapping() {
    this.setWorksheetByIndex(1);

    const cnpjCleansed = this.getItem("B2", "").match(/\d+/g);

    this.#data = {
      razaoSocial: this.getItem("B1"),
      cnpj: this.getItem("B2"),
      cnpjCleansed: cnpjCleansed ? cnpjCleansed.join("") : null,
      diagnostico: [
        this.#mappingDiagnostico("B"),
        this.#mappingDiagnostico("C"),
        this.#mappingDiagnostico("D"),
      ],
    };
  }

  async setCompanyContext(razaoSocial, cnpj, anoCorrente, companyData) {
    this.#mapping();

    this.#data.razaoSocial = razaoSocial;
    this.setItem("B1", razaoSocial);

    this.#data.cnpj = cnpj;
    this.setItem("B2", cnpj);

    this.setItem("B5", anoCorrente);
    this.setItem("C5", { formula: "B5-1" });
    this.setItem("D5", { formula: "C5-1" });

    const colById = {
      0: "B",
      1: "C",
      2: "D",
    };

    for (let i = 0; i < 3; i++) {
      const year = anoCorrente - i;
      this.#data.diagnostico[i].ano_exercicio = year;

      // comercial
      const commercialYear = await companyData.getCommercialByYear(year);
      this.setItem(
        `${colById[i]}7`,
        commercialYear ? commercialYear.carteira_de_clientes_ativa || 0 : 0
      );
      this.setItem(
        `${colById[i]}8`,
        commercialYear ? commercialYear.novos_clientes_no_ano || 0 : 0
      );
      this.setItem(
        `${colById[i]}9`,
        commercialYear ? commercialYear.base_clientes || 0 : 0
      );
      this.setItem(
        `${colById[i]}10`,
        commercialYear ? commercialYear.propostas_enviadas_no_ano || 0 : 0
      );
      this.setItem(
        `${colById[i]}11`,
        commercialYear ? commercialYear.propostas_aprovadas_no_ano || 0 : 0
      );
      this.setItem(
        `${colById[i]}12`,
        commercialYear ? commercialYear.notas_fiscais_emitidas || 0 : 0
      );
      this.setItem(
        `${colById[i]}13`,
        commercialYear ? commercialYear.clientes_fidelizados || 0 : 0
      );
      this.setItem(
        `${colById[i]}14`,
        commercialYear ? commercialYear.reclamacoes_clientes || 0 : 0
      );
      this.setItem(
        `${colById[i]}15`,
        commercialYear ? commercialYear.clientes_perdidos || 0 : 0
      );

      // processos
      const processesYear = await companyData.getProcessesByYear(year);
      this.setItem(
        `${colById[i]}17`,
        processesYear ? processesYear.funcionarios || 0 : 0
      );
      this.setItem(
        `${colById[i]}18`,
        processesYear ? processesYear.volume_produzido_no_ano || 0 : 0
      );
      this.setItem(
        `${colById[i]}19`,
        processesYear ? processesYear.capacidade_produzida || 0 : 0
      );
      const refugo_retrabalho = processesYear
        ? processesYear.refugo_retrabalho || 0
        : 0;
      this.setItem(
        `${colById[i]}20`,
        refugo_retrabalho > 0 ? refugo_retrabalho / 100 : refugo_retrabalho
      );
      this.setItem(
        `${colById[i]}21`,
        processesYear ? processesYear.custos_garantia || 0 : 0
      );
      const ociosidade = processesYear
        ? processesYear.percentual_disponibilidade_equipamento || 0
        : 0;
      this.setItem(
        `${colById[i]}22`,
        ociosidade > 0 ? (100 - ociosidade) / 100 : ociosidade
      );
      this.setItem(
        `${colById[i]}23`,
        processesYear ? processesYear.valor_do_estoque || 0 : 0
      );
      const entregas_no_prazo = processesYear
        ? processesYear.entregas_no_prazo || 0
        : 0;
      this.setItem(
        `${colById[i]}24`,
        entregas_no_prazo > 0 ? entregas_no_prazo / 100 : 0
      );

      // pessoas
      const peopleYear = await companyData.getPeopleByYear(year);
      const funcionarios_antigos = peopleYear
        ? peopleYear.funcionarios_antigos || 0
        : 0;
      this.setItem(
        `${colById[i]}26`,
        funcionarios_antigos > 0
          ? funcionarios_antigos / 100
          : funcionarios_antigos
      );
      const rotatividade = peopleYear ? peopleYear.rotatividade || 0 : 0;
      this.setItem(
        `${colById[i]}27`,
        funcionarios_antigos > 0 ? rotatividade / 100 : rotatividade
      );
      const absenteismo = peopleYear ? peopleYear.absenteismo || 0 : 0;
      this.setItem(
        `${colById[i]}28`,
        absenteismo > 0 ? absenteismo / 100 : rotatividade
      );
    }
  }

  getData() {
    this.#mapping();
    return this.#data;
  }
}

module.exports.WorkbookDiagnostico = WorkbookDiagnostico;
