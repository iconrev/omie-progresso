const { WorkbookBase } = require("./WorkbookBase");
const { DRE_Despesa } = require("../../auth/CompanyService");

class WorkbookDre extends WorkbookBase {
  #data = null;

  get data() {
    return this.#data;
  }

  #mappingExterno(column, startLine) {
    return [
      this.getItem(`${column}${startLine}`),
      this.getItem(`${column}${startLine + 1}`),
      this.getItem(`${column}${startLine + 2}`),
      this.getItem(`${column}${startLine + 3}`),
      this.getItem(`${column}${startLine + 4}`),
    ];
  }

  #mappingDespesas(column) {
    const despesas = [];
    const rowStartDespesas = 16;
    for (let row = 0; row < 8; row++) {
      despesas.push({
        key:
          row === 0
            ? "despesas_com_pessoal"
            : DRE_Despesa.nameNormalize(
                this.getItem(`A${rowStartDespesas + row}`, "")
              ),
        label:
          row === 0 ? "Pessoal" : this.getItem(`A${rowStartDespesas + row}`),
        value: this.getItem(`${column}${rowStartDespesas + row}`, "0", "float"),
      });
    }
    return despesas;
  }

  #mappingDre(column) {
    return {
      ano_exercicio: this.getItem(`${column}5`, "0", "int"),
      receita_servico: this.getItem(`${column}7`, "0", "float"),
      receita_produto: this.getItem(`${column}8`, "0", "float"),
      outras_receitas: this.getItem(`${column}9`, "0", "float"),
      imposto_sobre_receitas: this.getItem(`${column}11`, "0", "float"),
      devolucao_abatimentos: this.getItem(`${column}12`, "0", "float"),
      custo_dos_produtos_industrializados: this.getItem(
        `${column}14`,
        "0",
        "float"
      ),
      despesas: this.#mappingDespesas(column),
      depreciacao_amortizacao: this.getItem(`${column}25`, "0", "float"),
      endividamento: this.getItem(`${column}27`, "0", "float"),
      inadimplencia: this.getItem(`${column}28`, "0", "float"),
      despesas_financeiras: this.getItem(`${column}29`, "0", "float"),
      receitas_financeiras: this.getItem(`${column}30`, "0", "float"),
      imposto_de_renda: this.getItem(`${column}32`, "0", "float"),
      constribuicao_social: this.getItem(`${column}33`, "0", "float"),
    };
  }

  #mapping() {
    this.setWorksheetByIndex(1);

    const cnpjCleansed = this.getItem("B2", "").match(/\d+/g);

    this.#data = {
      razaoSocial: this.getItem("B1"),
      cnpj: this.getItem("B2"),
      cnpjCleansed: cnpjCleansed ? cnpjCleansed.join("") : null,
      dre: [
        this.#mappingDre("B"),
        this.#mappingDre("C"),
        this.#mappingDre("D"),
      ],
      clientes: this.#mappingExterno("A", 36),
      concorrentes: this.#mappingExterno("A", 42),
      fornecedores: this.#mappingExterno("A", 48),
    };
  }

  setCompanyContext(razaoSocial, cnpj, anoCorrente, companyDres) {
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
      const dre = companyDres[year];
      this.#data.dre[i].ano = year;

      if (dre) {
        this.setItem(`${colById[i]}7`, dre.inputs.receita_servico || 0);
        this.setItem(`${colById[i]}8`, dre.inputs.receita_produto || 0);
        this.setItem(`${colById[i]}9`, dre.inputs.outras_receitas || 0);

        this.setItem(`${colById[i]}11`, dre.inputs.imposto_sobre_receitas || 0);
        this.setItem(`${colById[i]}12`, dre.inputs.devolucao_abatimentos || 0);

        this.setItem(
          `${colById[i]}14`,
          dre.inputs.custo_dos_produtos_industrializados || 0
        );

        const linePessoal = 16;
        let lineDespesas = 17;

        for (const despesa of dre.despesas) {
          if (despesa.isDreDespesa) {
            if (despesa.editable) {
              this.setItem(`A${lineDespesas}`, despesa.description);
              this.setItem(`${colById[i]}${lineDespesas}`, despesa.value || 0);
              lineDespesas += 1;
            } else {
              this.setItem(`${colById[i]}${linePessoal}`, despesa.value || 0);
            }
          } else if (despesa.key === "financeiras") {
            this.setItem(
              `${colById[i]}29`,
              dre.inputs.depreciacao_amortizacao || 0
            );
          }
        }

        this.setItem(
          `${colById[i]}25`,
          dre.inputs.depreciacao_amortizacao || 0
        );

        this.setItem(`${colById[i]}27`, dre.inputs.endividamento || 0);
        this.setItem(`${colById[i]}28`, dre.inputs.inadimplencia || 0);

        this.setItem(`${colById[i]}30`, dre.inputs.receitas_financeiras || 0);
        this.setItem(`${colById[i]}32`, dre.inputs.imposto_de_renda || 0);
        this.setItem(`${colById[i]}33`, dre.inputs.constribuicao_social || 0);
      } else {
        this.setItem(`${colById[i]}7`, 0);
        this.setItem(`${colById[i]}8`, 0);
        this.setItem(`${colById[i]}9`, 0);
        this.setItem(`${colById[i]}11`, 0);
        this.setItem(`${colById[i]}12`, 0);
        this.setItem(`${colById[i]}14`, 0);
        this.setItem(`${colById[i]}16`, 0);
        this.setItem(`${colById[i]}17`, 0);
        this.setItem(`${colById[i]}18`, 0);
        this.setItem(`${colById[i]}19`, 0);
        this.setItem(`${colById[i]}20`, 0);
        this.setItem(`${colById[i]}21`, 0);
        this.setItem(`${colById[i]}22`, 0);
        this.setItem(`${colById[i]}23`, 0);
        this.setItem(`${colById[i]}25`, 0);
        this.setItem(`${colById[i]}27`, 0);
        this.setItem(`${colById[i]}28`, 0);
        this.setItem(`${colById[i]}29`, 0);
        this.setItem(`${colById[i]}30`, 0);
        this.setItem(`${colById[i]}32`, 0);
        this.setItem(`${colById[i]}33`, 0);
      }
    }
  }

  getData() {
    this.#mapping();
    return this.#data;
  }
}

module.exports.WorkbookDre = WorkbookDre;
