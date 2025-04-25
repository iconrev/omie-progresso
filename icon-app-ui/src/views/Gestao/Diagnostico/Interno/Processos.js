import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableResultados from "./TableResultados";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";
import { toast } from "react-toastify";

class ProcessosForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.currentYear = new Date().getFullYear();
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

	async loadData() {
		const lastYear = parseInt(this.state.exercicio_definido) - 1;
		const yearsLoad = [];

		for (let i = 0; yearsLoad.length < 3; i++) {
			yearsLoad.push(lastYear - i);
		}

		const result = await AmbienteInternoService.getResourceInternoData(
			"processos",
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
	}

	loadStates = async (processos, ano) => {
		this.setState({
			ano: ano,
			...processos,
		});
	};

	loaded = () => {
		return (
			<TableResultados
				resource={"processos"}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"Dados de Processos"}
				history={this.props.history}
				return={`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/processos`}
				years={this.state.ano_exercicio}
				data={[
					{
						categoria: null,
						itens: [
							{
								title: "Total de Funcionários",
								values: this.state.funcionarios,
								id: "funcionarios",
								tipo: "int",
							},
							{
								title: "Volume produzido no ano",
								values: this.state.volume_produzido_no_ano,
								id: "volume_produzido_no_ano",
								tipo: "int",
							},
							{
								title: "Capacidade Produtiva Anual",
								values: this.state.capacidade_produzida,
								id: "capacidade_produzida",
								tipo: "int",
							},
							{
								title: "% Refugo retrabalho",
								values: this.state.refugo_retrabalho,
								id: "refugo_retrabalho",
								tipo: "%",
							},
							{
								title: "Custos de garantia",
								values: this.state.custos_garantia,
								id: "custos_garantia",
								tipo: "R$",
							},
							{
								title: "% Entrega no prazo",
								values: this.state.entregas_no_prazo,
								id: "entregas_no_prazo",
								tipo: "%",
							},
							{
								title: "Valor médio de Estoque",
								values: this.state.valor_do_estoque,
								id: "valor_do_estoque",
								tipo: "R$",
							},
							{
								title: "% Ociosidade de Equipamentos/Recursos",
								values: this.state.percentual_disponibilidade_equipamento,
								id: "percentual_disponibilidade_equipamento",
								tipo: "%",
							},
						],
					},
				]}
			/>
		);
	};

	render() {
		return this.state.isLoading ? (
			<LoadingSpinner isLoading={this.state.isLoading} />
		) : (
			this.loaded()
		);
	}
}
export default ProcessosForm;
