import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableResultados from "./TableResultados";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";
import { toast } from "react-toastify";

class FinanceiroDre extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			key: Math.random(),
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			despesasParsed: [],
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		const lastYear = parseInt(this.state.exercicio_definido) - 1;
		const yearsLoad = [];

		for (let i = 0; yearsLoad.length < 3; i++) {
			yearsLoad.push(lastYear - i);
		}

		const result = await AmbienteInternoService.getResourceInternoData(
			"financeiro",
			yearsLoad
		);

		const { status, data, message } = result;

		if (status !== "success") {
			toast.error(message ? message : "Não foi possível carregar os dados");
			this.props.history.push(
				`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/comercial`
			);
			return;
		}

		await this.loadStates(data, yearsLoad);
	};

	loadStates = async (dre, ano) => {
		const despesas = await this.parsedDespesas(dre.despesas);
		this.setState({
			key: Math.random(),
			ano: ano,
			ano_exercicio: dre.ano_exercicio,
			receita_bruta: dre.receita_bruta,
			receita_servico: dre.receita_servico,
			receita_produto: dre.receita_produto,
			outras_receitas: dre.outras_receitas,
			deducoes_receitas: dre.deducoes_receitas,
			imposto_sobre_receitas: dre.imposto_sobre_receitas,
			devolucao_abatimentos: dre.devolucao_abatimentos,
			receita_liquida: dre.receita_liquida,
			custo_total: dre.custo_total,
			custo_dos_produtos_industrializados:
				dre.custo_dos_produtos_industrializados,
			lucro_bruto: dre.lucro_bruto,
			despesas_operacionais: dre.despesas_operacionais,
			despesas: dre.despesas,
			ebitda: dre.ebitda,
			depreciacao_amortizacao: dre.depreciacao_amortizacao,
			resultado_exercicio: dre.resultado_exercicio,
			despesas_financeiras: dre.despesas_financeiras,
			receitas_financeiras: dre.receitas_financeiras,
			lucro_operacional: dre.lucro_operacional,
			imposto_de_renda: dre.imposto_de_renda,
			constribuicao_social: dre.constribuicao_social,
			lucro_liquido: dre.lucro_liquido,
			ebit: dre.ebit,
			endividamento: dre.endividamento,
			inadimplencia: dre.inadimplencia,
			despesasParsed: despesas,
		});
	};

	parsedDespesas = async (despesasUser) => {
		const despesas = [];

		for (let i = 0; i < despesasUser.length; i++) {
			const despesasYear = despesasUser[i];
			for (let j = 0; j < despesasYear.length; j++) {
				const despesa = despesasYear[j];
				if (despesa.isDreDespesa) {
					const foundedDespesa = despesas.find(
						(element) => element.title === despesa.description
					);
					if (!foundedDespesa) {
						const row = {
							title: despesa.description,
							title_id: despesa.id,
							values: [],
							tipo: "R$",
							title_editable: !!(
								despesa.editable === 1 || despesa.editable === true
							),
							custom_ids: [],
							id: "despesa",
						};
						despesas.push(row);
					}
				}
			}
		}
		for (let i = 0; i < despesas.length; i++) {
			const despesa = despesas[i];
			for (let j = 0; j < despesasUser.length; j++) {
				const despesasYear = despesasUser[j];
				const foundedDespesa = despesasYear.find(
					(element) => element.description === despesa.title
				);
				if (foundedDespesa) {
					despesa.values.push(foundedDespesa.value);
					despesa.custom_ids.push(foundedDespesa.id);
				} else {
					despesa.values.push(0);
					despesa.custom_ids.push(null);
				}
			}
		}
		return despesas;
	};

	handleDespesas = async (newTitle, oldTitle) => {
		const indexDespesa = this.state.despesasParsed.findIndex(
			(element) => element.title === oldTitle
		);
		if (indexDespesa > -1) {
			this.state.despesasParsed[indexDespesa].title = newTitle;
			await this.setState({
				...this.state,
			});
		}
	};

	loaded = () => {
		return (
			<TableResultados
				key={`${this.state.key}`}
				resource={"financeiro"}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"DRE"}
				history={this.props.history}
				return={`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/financeiro`}
				years={this.state.ano_exercicio}
				// refresh={this.loadData}
				updateCategoryTitle={this.handleDespesas}
				data={[
					{
						categoria: "RECEITA BRUTA",
						data: this.state.receita_bruta,
						tipo: "R$",
						itens: [
							{
								title: "Receita de Serviços",
								values: this.state.receita_servico,
								id: "receita_servico",
								tipo: "R$",
							},
							{
								title: "Receita de Produto",
								values: this.state.receita_produto,
								id: "receita_produto",
								tipo: "R$",
							},
							{
								title: "( + ) Outras Receitas",
								values: this.state.outras_receitas,
								id: "outras_receitas",
								tipo: "R$",
							},
						],
					},
					{
						categoria: "DEDUÇÕES SOBRE RECEITAS",
						data: this.state.deducoes_receitas,
						tipo: "R$",
						itens: [
							{
								title: "Impostos sobre as receitas",
								values: this.state.imposto_sobre_receitas,
								id: "imposto_sobre_receitas",
								tipo: "R$",
							},
							{
								title: "Devolução e Abatimentos",
								values: this.state.devolucao_abatimentos,
								id: "devolucao_abatimentos",
								tipo: "R$",
							},
						],
					},
					{
						categoria: "RECEITA LÍQUIDA",
						data: this.state.receita_liquida,
						tipo: "R$",
					},
					{
						categoria: "CUSTOS",
						data: this.state.custo_total,
						tipo: "R$",
						itens: [
							{
								title: "Custos de Mercadorias Vendidas",
								values: this.state.custo_dos_produtos_industrializados,
								id: "custo_dos_produtos_industrializados",
								tipo: "R$",
							},
						],
					},
					{
						categoria: "LUCRO BRUTO",
						data: this.state.lucro_bruto,
						tipo: "R$",
					},
					{
						categoria: "DESPESAS",
						data: this.state.despesas_operacionais,
						tipo: "R$",
						itens: this.state.despesasParsed,
					},
					{
						categoria: "EBITDA",
						data: this.state.ebitda,
						tipo: "R$",
						itens: [
							{
								title: "( - ) Depreciação e Amortização",
								values: this.state.depreciacao_amortizacao,
								id: "depreciacao_amortizacao",
								tipo: "R$",
							},
						],
					},
					{
						categoria: "RESULTADO FINANCEIRO",
						data: this.state.resultado_exercicio,
						tipo: "R$",
						itens: [
							{
								title: "Receitas Financeiras",
								values: this.state.receitas_financeiras,
								id: "receitas_financeiras",
								tipo: "R$",
							},
							{
								title: "Despesas Financeiras",
								values: this.state.despesas_financeiras,
								id: "despesas_financeiras",
								tipo: "R$",
							},
						],
					},
					{
						categoria: "LUCRO OPERACIONAL",
						data: this.state.lucro_operacional,
						tipo: "R$",
						itens: [
							{
								title: "Imposto de Renda",
								values: this.state.imposto_de_renda,
								id: "imposto_de_renda",
								tipo: "R$",
							},
							{
								title: "Contribuição Social",
								values: this.state.constribuicao_social,
								id: "constribuicao_social",
								tipo: "R$",
							},
						],
					},
					{
						categoria: "LUCRO/PREJUÍZO LÍQUIDO",
						data: this.state.lucro_liquido,
						tipo: "R$",
					},
					{
						categoria: "INFORMAÇÕES FINANCEIRAS",
						tipo: "R$",
						itens: [
							{
								title: "Valor da Dívida Total",
								values: this.state.endividamento,
								id: "endividamento",
								tip: "Valor da dívida total no dia 31/dez do exercício.",
								tipo: "R$",
							},
							{
								title: "Valor da Inadimplência Média Mensal",
								values: this.state.inadimplencia,
								id: "inadimplencia",
								tip: "Média de contas a receber em atraso na virada de cada mês do ano.",
								tipo: "R$",
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

export default FinanceiroDre;
