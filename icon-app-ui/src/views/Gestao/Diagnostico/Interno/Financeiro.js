import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableAvaliacao from "./TableAvaliacao";
import { toast } from "react-toastify";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";

class FinanceiroForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		const id = this.state.companyId;

		const response = await AmbienteInternoService.getResourceInternoAvaliacao(
			"financeiro"
		);

		const { status, message } = response;

		if (status === "unauthorized") {
			console.warn("Usuário não possui acesso ao recurso financeiro");
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno`
			);
		}

		if (status !== "success") {
			toast.error(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno`
			);
		}

		let { analise } = response;
		analise = analise[this.state.exercicio_definido];

		if (analise.status === "diagnostic_not_found") {
			toast.warn(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/financeiro/dre`
			);
		}

		const percentual_total_despesas =
			analise.receita_bruta > 0 && analise.despesas_totais >= 0
				? (analise.despesas_totais / analise.receita_bruta) * 100
				: 0;

		this.setState({
			dre: analise.dre,
			receita_bruta: analise.receita_bruta,
			crescimento_quatro: analise.crescimento_quatro,
			crescimento: analise.crescimento,
			lucro_liquido: analise.lucro_liquido,
			rentabilidade_media: analise.rentabilidade_media,
			rentabilidade: analise.rentabilidade,
			rentabilidade_ultimo: analise.rentabilidade_ultimo,
			ebitda: analise.ebitda,
			custo_mercadoria: analise.custo_mercadoria,
			ebitda_medio: analise.ebitda_medio,
			ebitda_ano_passado_diferenca: analise.ebitda_ano_passado_diferenca,
			percentual_custo_folha: analise.percentual_custo_folha,
			percentual_custo_comercial: analise.percentual_custo_comercial,
			percentual_despesas_administrativas:
				analise.percentual_despesas_administrativas,
			percentual_despesas_tributaria: analise.percentual_despesas_tributaria,
			percentual_despesas_viagens: analise.percentual_despesas_viagens,
			percentual_despesas_logistica: analise.percentual_despesas_logistica,
			percentual_despesas_servicos: analise.percentual_despesas_servicos,
			percentual_despesas_ocupacao: analise.percentual_despesas_ocupacao,
			percentual_total_despesas: percentual_total_despesas,
			custo_dos_produtos_industrializados:
				analise.custo_dos_produtos_industrializados,
			divida: analise.divida,
			taxa: analise.taxa,
			inadimplencia: analise.inadimplencia,
			smile_receita_bruta:
				analise.smiles["smile_receita_bruta"] || "NaoAvaliado",
			smile_crescimento: analise.smiles["smile_crescimento"] || "NaoAvaliado",
			smile_rentabilidade_ultimo:
				analise.smiles["smile_rentabilidade_ultimo"] || "NaoAvaliado",
			smile_ebitda_ultimo:
				analise.smiles["smile_ebitda_ultimo"] || "NaoAvaliado",
			smile_percentual_total_despesas:
				analise.smiles["smile_percentual_total_despesas"] || "NaoAvaliado",
			smile_custo_mercadoria:
				analise.smiles["smile_custo_mercadoria"] || "NaoAvaliado",
			smile_taxa_divida_lucro:
				analise.smiles["smile_taxa_divida_lucro"] || "NaoAvaliado",
			smile_inadimplencia:
				analise.smiles["smile_inadimplencia"] || "NaoAvaliado",
		});
	};

	loaded = () => {
		const id = this.state.companyId;
		const dre = this.state.dre;
		const ano = this.state.exercicio_definido;
		return (
			<TableAvaliacao
				resource={"financeiro"}
				dreId={dre}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"Análise de Desempenho Financeiro"}
				ano={ano}
				history={this.props.history}
				edit={`/hub/${id}/gestao/categoria/diagnostico/interno/financeiro/dre`}
				data={[
					{
						categoria: "FATURAMENTO",
						color: "success",
						itens: [
							{
								analise: "Receita Bruta",
								resultado: this.state.receita_bruta,
								avaliacao: this.state.smile_receita_bruta,
								id: "smile_receita_bruta",
								tipo: "R$",
								tooltip: "Soma de todas as receitas no período",
							},
							{
								analise: "% Crescimento da Receita",
								resultado: this.state.crescimento,
								avaliacao: this.state.smile_crescimento,
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
								resultado: this.state.rentabilidade,
								avaliacao: this.state.smile_rentabilidade_ultimo,
								tipo: "%",
								id: "smile_rentabilidade_ultimo",
								tooltip: "Relação % do Lucro Liquido com Receita Bruta",
							},
							{
								analise: "EBITDA",
								resultado: this.state.ebitda,
								avaliacao: this.state.smile_ebitda_ultimo,
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
								resultado: this.state.custo_dos_produtos_industrializados,
								avaliacao: this.state.smile_custo_mercadoria,
								tipo: "%",
								id: "smile_custo_mercadoria",
								tooltip: "Relação % do CMV com Receita Bruta",
							},
							{
								analise: "% Despesas sobre o faturamento Bruto",
								resultado: this.state.percentual_total_despesas,
								avaliacao: this.state.smile_percentual_total_despesas,
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
								resultado: this.state.taxa,
								avaliacao: this.state.smile_taxa_divida_lucro,
								id: "smile_taxa_divida_lucro",
								tooltip:
									"Anos para quitar dívida caso utilize 100% do Lucro Liquido",
							},
							{
								analise: "% Inadimplência (base mensal)",
								resultado: this.state.inadimplencia,
								avaliacao: this.state.smile_inadimplencia,
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

	render() {
		return this.state.isLoading ? <LoadingSpinner /> : this.loaded();
	}
}

export default FinanceiroForm;
