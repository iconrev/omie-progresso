exports.calcula_campos_dinamicos = (dre) => {
  let dre_list = {
    receita_bruta: 0.0,
    receita_liquida: 0.0,
    custo_total: 0.0,
    rdd: 0.0,
    lucro_operacional: 0.0,
    lucro_liquido: 0.0,
    ebitda: 0.0,
    rentabilidade: 0.0,
  };

  let receita_bruta =
    dre.receita_servico + dre.receita_produto + dre.outras_receitas;

  dre_list['receita_bruta'] = receita_bruta;

  let despesas_operacionais =
    dre.despesas_administrativas +
    dre.despesas_com_pessoal +
    dre.despesas_ocupacao +
    dre.despesas_logistica +
    dre.despesas_vendas +
    dre.despesas_viagens +
    dre.despesas_servicos_pj +
    dre.despesas_tributarias +
    dre.depreciacao_amortizacao;

  let receita_liquida = receita_bruta - dre.imposto_sobre_receitas;
  dre_list['receita_liquida'] = receita_liquida;

  let custo_total =
    dre.custo_das_mercadorias_vendidas +
    dre.custo_dos_produtos_industrializados;

  dre_list['custo_total'] = custo_total;

  let lucro_bruto = receita_liquida - custo_total;
  dre_list['lucro_bruto'] = lucro_bruto;

  let rdd = dre.endividamento * 0.058;
  dre_list['rdd'] = rdd;

  let lucro_operacional =
    lucro_bruto +
    dre.receitas_financeiras -
    dre.despesas_financeiras -
    despesas_operacionais;
  dre_list['lucro_operacional'] = lucro_operacional;

  let lucro_liquido =
    lucro_operacional - dre.despesas_indedutiveis + dre.alienacao_ativo_fixo;
  dre_list['lucro_liquido'] = lucro_liquido;

  let ebitda =
    dre.receitas_financeiras +
    lucro_operacional +
    dre.imposto_sobre_receitas -
    dre.depreciacao_amortizacao;
  dre_list['ebitda'] = ebitda;

  let ebit = ebitda - dre.depreciacao_amortizacao;
  dre_list['ebit'] = ebit;

  let rentabilidade = (lucro_liquido / receita_bruta) * 100;
  dre_list['rentabilidade'] = rentabilidade;

  return dre_list;
};

exports.select_smile = (destaque) => {
  return destaque;
};
