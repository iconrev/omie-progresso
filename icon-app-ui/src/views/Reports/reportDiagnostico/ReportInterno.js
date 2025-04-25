import React from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Row,
	CardFooter,
	Badge,
} from "reactstrap";
import TableAvaliacao from "../table/TableAvaliacao";

import GaugeChart from "react-gauge-chart";

import style from './Page.module.css'
const gauge_color = {
	colors: ["#EA4228", "#F5CD19", "#5BE12C"],
};

export default function ReportInterno(props) {
	const { params } = props;

	const questionario = params.interno ? params.interno : [];


	const renderChart = (title, data) => {

		const percent = (Math.floor(data) / 100).toFixed(2);

		return (
			<Col xs="12" className={"p-2"}>
				<div>
					<Card className={"h-100"} style={{ margin: '20px auto', width: '615px' }}>
						<CardHeader>
							<Row className={"align-items-center"}>
								<Col>{title}</Col>
							</Row>
						</CardHeader>
						<CardBody className={""}>
							<GaugeChart
								className="chart-wrapper"
								id={title}
								textColor="#212121"
								needleColor="#CDC9C9"
								needleBaseColor="#CDC9C9"
								percent={percent}
								colors={gauge_color.colors}
							/>
						</CardBody>
					</Card>
				</div>
			</Col>
		);
	};

	const loadedFinanceiro = (data) => {
		const dre = data.dre;
		return (
			<TableAvaliacao
				resource={"financeiro"}
				dreId={dre}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"Análise de Desempenho Financeiro"}
				data={[
					{
						categoria: "FATURAMENTO",
						color: "success",
						itens: [
							{
								analise: "Receita Bruta",
								resultado: data?.receita_bruta,
								avaliacao: data.smiles?.smile_receita_bruta ?? "-", 
								id: "smile_receita_bruta",
								tipo: "R$",
								tooltip: "Soma de todas as receitas no período",
							},
							{
								analise: "% Crescimento da Receita",
								resultado: data?.crescimento,
								avaliacao: data.smiles?.smile_crescimento ?? "-",
								tipo: "%",
								id: "smile_crescimento",
								tooltip: "Crescimento % da receita nos últimos 2 exercícios",
							},
						],
					},
					{
						categoria: "RENTABILIDADE",
						color: "info",
						itens: [
							{
								analise: "% Rentabilidade",
								resultado: data?.rentabilidade,
								avaliacao: data.smiles?.smile_rentabilidade_ultimo ?? "-",
								tipo: "%",
								id: "smile_rentabilidade_ultimo",
								tooltip: "Relação % do Lucro Liquido com Receita Bruta",
							},
							{
								analise: "EBITDA",
								resultado: data?.ebitda,
								avaliacao: data.smiles?.smile_ebitda_ultimo ?? "-",
								tipo: "R$",
								id: "smile_ebitda_ultimo",
								tooltip: "EBTIDA calculado no DRE",
							},
						],
					},
					{
						categoria: "DESPESAS",
						color: "warning",
						itens: [
							{
								analise: "% Custos de Mercadorias Vendidas",
								resultado: data?.custo_dos_produtos_industrializados,
								avaliacao: data.smiles?.smile_custo_mercadoria ?? "-",
								tipo: "%",
								id: "smile_custo_mercadoria",
								tooltip: "Relação % do CMV com Receita Bruta",
							},
							{
								analise: "% Despesas sobre o faturamento Bruto",
								resultado: data?.percentual_total_despesas,
								avaliacao: data.smiles?.smile_percentual_total_despesas,
								tipo: "%",
								id: "smile_percentual_total_despesas",
								tooltip: "Relação % do total de despesas com Receita Bruta",
							},
						],
					},
					{
						categoria: "ENDIVIDAMENTO",
						color: "danger",
						itens: [
							{
								analise: "Anos para quitar a dívida com o Lucro Líquido ",
								resultado: data?.taxa,
								avaliacao: data.smiles?.smile_taxa_divida_lucro,
								id: "smile_taxa_divida_lucro",
								tooltip:
									"Anos para quitar dívida caso utilize 100% do Lucro Liquido",
							},
							{
								analise: "% Inadimplência (base mensal)",
								resultado: data?.inadimplencia,
								avaliacao: data.smiles?.smile_inadimplencia,
								tipo: "%",
								id: "smile_inadimplencia",
								tooltip:
									"Relação % do valor de inadimplência média mensal pela receita média mensal",
							},
						],
					},
				]}
			/>
		);
	};

	const loadedComercial = (data) => {
		return (
			<div>
				<TableAvaliacao
					resource={"comercial"}
					title={"Diagnóstico de Ambiente Interno"}
					subtitle={"Análise de Desempenho Comercial"}
					data={[
						{
							categoria: "MARKTING",
							color: "success",
							itens: [
								{
									analise: "% Clientes Ativos",
									resultado: data?.percentual_clientes_ativos,
									avaliacao: data?.avaliacao?.smile_percentual_clientes_ativos,
									id: "smile_percentual_clientes_ativos",
									tipo: "%",
									tooltip:
										"Relação % da base de clientes ativos com a base de clientes cadastrados",
								},
								{
									analise: "# Novos Clientes",
									resultado: data?.vendas?.novos_clientes_no_ano,
									avaliacao: data?.avaliacao?.smile_novos_clientes_no_ano,
									id: "smile_novos_clientes_no_ano",
									tipo: "int",
									tooltip: "Número de clientes novos no período",
								},
							],
						},
						{
							categoria: "VENDAS",
							color: "primary",
							itens: [
								{
									analise: "% Conversão de Propostas",
									resultado: data?.taxa_conversao,
									avaliacao: data?.avaliacao?.smile_taxa_conversao,
									tipo: "%",
									id: "smile_taxa_conversao",
									tooltip:
										"Relação % das propostas aprovadas com relação as enviadas",
								},
								{
									analise: "Ticket Médio",
									resultado: data?.ticket_medio,
									avaliacao: data?.avaliacao?.smile_ticket_medio,
									tipo: "R$",
									id: "smile_ticket_medio",
									tooltip: "Média do valor das NF emitidas no período",
								},
							],
						},
						{
							categoria: "RELACIONAMENTO",
							color: "warning",
							itens: [
								{
									analise: "% Clientes Fidelizados",
									resultado: data?.percentual_clientes_fidelizados,
									avaliacao: data?.avaliacao?.smile_clientes_fidelizados,
									tipo: "%",
									id: "smile_clientes_fidelizados",
									tooltip:
										"Relação % dos clientes fidelizados com relação ao total de clientes ativos",
								},
								{
									analise: "% Nível de relacionamento com Cliente",
									resultado: data?.vendas?.nivel_relacionamento_clientes,
									avaliacao: data?.avaliacao?.smile_nivel_relacionamento_clientes,
									tipo: "%",
									id: "smile_nivel_relacionamento_clientes",
									tooltip:
										"Estabelece o % de implementação dos processos chave de relacionamento com clientes",
								},
							],
						},
						{
							categoria: "SATISFAÇÃO",
							color: "danger",
							itens: [
								{
									analise: "# Clientes Perdidos",
									resultado: data?.vendas?.clientes_perdidos,
									avaliacao: data?.avaliacao?.smile_clientes_perdidos,
									id: "smile_clientes_perdidos",
									tipo: "int",
									tooltip:
										"Total de clientes que deixaram de ser ativos no período",
								},
								{
									analise: "% Reclamações/NF emitida",
									resultado: data?.taxa_reclamacao_nf,
									avaliacao: data?.avaliacao?.smile_taxa_reclamacao_nf,
									tipo: "%",
									id: "smile_taxa_reclamacao_nf",
									tooltip:
										"Relação % entre número de reclamações com relação a quantidade de NF emitidas no período",
								},
							],
						},
					]}
				/>
			</div>
		);
	};

	const loadedProcessos = (data) => {
		return (
			<div>
				<TableAvaliacao
					resource={"processos"}
					title={"Diagnóstico de Ambiente Interno"}
					subtitle={"Análise de Desempenho Processos"}
					data={[
						{
							categoria: "PRODUTIVIDADE",
							color: "success",
							itens: [
								{
									analise: "Receita Bruta / Custo de Pessoal",
									resultado: data?.faturamento_custo_folha,
									avaliacao: data?.avaliacao?.smile_faturamento_custo_folha,
									id: "smile_faturamento_custo_folha",
									tipo: "R$",
									tooltip:
										"Múltiplo ($) da receita a cada 1 real investido em pessoas",
								},
								{
									analise: "Quantidade de Entregas por Funcionários",
									resultado: data?.quantidade_entregue_funcionarios,
									avaliacao: data?.avaliacao?.smile_quantidade_entregue_funcionarios,
									id: "smile_quantidade_entregue_funcionarios",
									tooltip: "Múltiplo do volume produzido por funcionário",
								},
							],
						},
						{
							categoria: "QUALIDADE",
							color: "info",
							itens: [
								{
									analise: "% Refugo / Produzido",
									resultado: data?.processos?.refugo_retrabalho,
									avaliacao: data?.avaliacao?.smile_refugo_retrabalho,
									tipo: "%",
									id: "smile_refugo_retrabalho",
									tooltip:
										"Relação % do total de perdas e/ou retrabalhos realizados com relação ao volume de serviços ou produtos entregues no período",
								},
								{
									analise: "% Custo Garantia / Receita Bruta",
									resultado: data?.custos_garantia,
									avaliacao: data?.avaliacao?.smile_custos_garantia,
									id: "smile_custos_garantia",
									tipo: "%",
									tooltip:
										"Relação % do custo de garantia com relação a receita bruta",
								},
							],
						},
						{
							categoria: "EFICIÊNCIA",
							color: "warning",
							itens: [
								{
									analise: "% Utilização da Capacidade Produtiva",
									resultado: data?.percentual_capacidade_produtiva,
									avaliacao: data?.avaliacao?.smile_percentual_capacidade_produtiva,
									id: "smile_percentual_capacidade_produtiva",
									tipo: "%",
									tooltip:
										"Relação % do volume de produtos ou serviços produzidos com relação a capacidade atual de pessoas e/ou máquinas",
								},
								{
									analise: "% Eficiência Operacional",
									resultado: data?.processos?.percentual_disponibilidade_equipamento,
									avaliacao: data?.avaliacao?.smile_percentual_disponibilidade_equipamento,
									id: "smile_percentual_disponibilidade_equipamento",
									tipo: "%",
								},
								{
									analise: "% Entrega no Prazo",
									resultado: data?.processos?.entregas_no_prazo,
									avaliacao: data?.avaliacao?.smile_entregas_no_prazo,
									id: "smile_entregas_no_prazo",
									tipo: "%",
									tooltip:
										"Relação % das entregas feitas no prazo com relação ao total de entregas feitas no período",
								},
							],
						},
						{
							categoria: "LOGÍSTICA",
							color: "danger",
							itens: [
								{
									analise: "Quantidade de Giro de Estoque",
									resultado: data?.quantidade_giro_estoque,
									avaliacao: data?.avaliacao?.smile_quantidade_giro_estoque,
									id: "smile_quantidade_giro_estoque",
									tooltip: "Número de vezes no ano que o estoque será renovado",
								},
								{
									analise: "Valor de Estoque (R$)",
									resultado: data?.processos?.valor_do_estoque,
									avaliacao: data?.avaliacao?.smile_valor_do_estoque,
									id: "smile_valor_do_estoque",
									tipo: "R$",
									tooltip: "Valor médio do estoque no período",
								},
							],
						},
					]}
				/>
			</div>
		);
	}

	const loadedPessoas = (data) => {
		return (
			<TableAvaliacao
				resource={"pessoas"}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"Análise de Desempenho Pessoas"}
				data={[
					{
						categoria: "COMPETÊNCIA",
						color: "success",
						itens: [
							{
								analise: "% Competências Atuais/Requeridas",
								resultado: data?.nivel_competencia,
								avaliacao: data?.avaliacao?.smile_nivel_competencia,
								id: "smile_nivel_competencia",
								tipo: "%",
								tooltip:
									"Estabelece o % do nível de competência na operação, administrativo e gestores",
							},
						],
					},
					{
						categoria: "ENGAJAMENTO",
						color: "info",
						itens: [
							{
								analise: "% Absenteísmo",
								resultado: data?.pessoas?.absenteismo,
								avaliacao: data?.avaliacao?.smile_absenteismo,
								tipo: "%",
								id: "smile_absenteismo",
								tooltip:
									"Relação % entre o tempo efetivo de trabalho com relação ao tempo planejado de trabalho dos colaboradores",
							},
							{
								analise: "% de Engajamento",
								resultado: data?.nivel_engajamento,
								avaliacao: data?.avaliacao?.smile_nivel_engajamento,
								tipo: "%",
								id: "smile_nivel_engajamento",
								tooltip:
									"Estabelece o % do nível de engajamento de acordo com a avaliação realizado nos fatores chave de engajamento dos colaboradores",
							},
						],
					},
					{
						categoria: "RETENÇÃO",
						color: "warning",
						itens: [
							{
								analise: "% Rotatividade",
								resultado: data?.pessoas?.rotatividade,
								avaliacao: data?.avaliacao?.smile_rotatividade,
								tipo: "%",
								id: "smile_rotatividade",
								tooltip:
									"Relação % entre o total de colaboradores desligados pelo total de colaboradores da empresa",
							},
							{
								analise: "% Funcionários com > 12 meses",
								resultado: data?.pessoas?.funcionarios_antigos,
								avaliacao: data?.avaliacao?.smile_funcionarios_antigos,
								tipo: "%",
								id: "smile_funcionarios_antigos",
								tooltip:
									"Relação % do total de colaboradores com mais de 12 meses na empresa com relação ao total de colaboradores na empresa.",
							},
							{
								analise: "% Nivel dos Processos de Retenção",
								resultado: data?.nivel_retencao,
								avaliacao: data?.avaliacao?.smile_nivel_retencao,
								tipo: "%",
								id: "smile_nivel_retencao",
								tooltip:
									"Estabelece o % do nível de implementação dos processos chave de gestão de pessoas",
							},
						],
					},
					{
						categoria: "INOVAÇÃO",
						color: "danger",
						itens: [
							{
								analise: "# Inovações no ano",
								resultado: data?.pessoas?.total_inovacao_implementada_empresa,
								avaliacao: data?.avaliacao?.smile_total_inovacao_implementada_empresa,
								tipo: "int",
								id: "smile_total_inovacao_implementada_empresa",
								tooltip:
									"Número de inovações introduzidos nos processos, sistemas, produtos e/ou serviços implementadas no período na empresa",
							},
							{
								analise: "% Faturamento para Inovação",
								resultado: data?.pessoas?.faturamento_oriundo_inovacao,
								avaliacao: data?.avaliacao?.smile_faturamento_oriundo_inovacao,
								tipo: "%",
								id: "smile_faturamento_oriundo_inovacao",
								tooltip:
									"Relação % das receitas oriundas de novos produtos e/ou serviços introduzidos nos últimos 12 meses com relação ao total da receita da empresa.",
							},
						],
					},
				]}
			/>
		);
	}

	return (
		<>
			<div className={style.page}>
				{loadedFinanceiro(questionario.analiseFinanceiro.analise)}
				{renderChart('Financeiro', questionario.analiseFinanceiro.media_gauge.percentual)}
			</div>

			<div className={style.page}>
				{loadedComercial(questionario.analiseComercial.analise)}
				{renderChart('Comercial', questionario.analiseComercial.media_gauge.percentual)}
			</div>

			<div className={style.page}>
				{loadedProcessos(questionario.analiseProcessos.analise)}
				{renderChart('Processos', questionario.analiseProcessos.media_gauge.percentual)}
			</div>

			<div className={style.page}>
				{loadedPessoas(questionario.analisePessoas.analise)}
				{renderChart('Pessoas', questionario.analisePessoas.media_gauge.percentual)}
			</div>
		</>
	);
}
