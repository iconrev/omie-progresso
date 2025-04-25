import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableResultados from "./TableResultados";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";
import { toast } from "react-toastify";

class PessoasForm extends Component {
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
			"pessoas",
			yearsLoad
		);
		const { status, data, message } = result;

		if (status !== "success") {
			toast.error(message ? message : "Não foi possível carregar os dados");
			this.props.history.push(
				`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/pessoas`
			);
			return;
		}

		await this.loadStates(data, yearsLoad);
	}

	loadStates = async (pessoas, ano) => {
		this.setState({
			ano: ano,
			pessoas: pessoas.id,
			ano_exercicio: pessoas.ano_exercicio,
			funcionarios_antigos: pessoas.funcionarios_antigos,
			rotatividade: pessoas.rotatividade,
			absenteismo: pessoas.absenteismo,
			competencia_operacao: pessoas.competencia_operacao,
			competencia_adm: pessoas.competencia_adm,
			competencia_gerenciais: pessoas.competencia_gerenciais,
			engajamento_relacionamento_interpessoal:
				pessoas.engajamento_relacionamento_interpessoal,
			engajamento_motivacao_comprometimento:
				pessoas.engajamento_motivacao_comprometimento,
			engajamento_comunicacao_interna: pessoas.engajamento_comunicacao_interna,
			engajamento_clima_organizacional:
				pessoas.engajamento_clima_organizacional,
			retencao_plano_carreira: pessoas.retencao_plano_carreira,
			retencao_cargo_salario: pessoas.retencao_cargo_salario,
			retencao_avaliacao_desempenho: pessoas.retencao_avaliacao_desempenho,
			retencao_reconhecimento_pessoas: pessoas.retencao_reconhecimento_pessoas,
			retencao_recompensa: pessoas.retencao_recompensa,
			faturamento_oriundo_inovacao: pessoas.faturamento_oriundo_inovacao,
			total_inovacao_implementada_empresa:
				pessoas.total_inovacao_implementada_empresa,
		});
	};

	loaded = () => {
		const optionsCompetencias = [
			{ value: "Plena", label: "Plena" },
			{ value: "Parcial", label: "Parcial" },
			{ value: "Deficiente", label: "Deficiente" },
		];
		const optionsEngajamento = [
			{ value: "Excelente", label: "Excelente" },
			{ value: "Bom", label: "Bom" },
			{ value: "Baixa", label: "Baixa" },
			{ value: "Ruim", label: "Ruim" },
		];
		const optionsRetencao = [
			{ value: "ImplantadoEficaz", label: "Implantado e Eficaz" },
			{ value: "ImplantadoParcial", label: "Implantado e Parcial" },
			{ value: "Emimplantacao", label: "Em implantação" },
			{ value: "NaoImplantado", label: "Não implantado" },
		];

		return (
			<TableResultados
				resource={"pessoas"}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"Dados de Pessoas"}
				history={this.props.history}
				return={`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/pessoas`}
				years={this.state.ano_exercicio}
				data={[
					{
						categoria: "Indicadores",
						color: "success",
						itens: [
							{
								title: "% Funcionários + 12 meses",
								values: this.state.funcionarios_antigos,
								id: "funcionarios_antigos",
								tipo: "%",
							},
							{
								title: "% Rotatividade",
								values: this.state.rotatividade,
								id: "rotatividade",
								tipo: "%",
							},
							{
								title: "% Absenteísmo",
								values: this.state.absenteismo,
								id: "absenteismo",
								tipo: "%",
							},
						],
					},
					{
						categoria: "Competências",
						color: "primary",
						itens: [
							{
								title: "Competências Técnicas na Operação",
								values: this.state.competencia_operacao,
								id: "competencia_operacao",
								tipo: "select",
								options: optionsCompetencias,
							},
							{
								title: "Competências Técnicas Adm",
								values: this.state.competencia_adm,
								id: "competencia_adm",
								tipo: "select",
								options: optionsCompetencias,
							},
							{
								title: "Competências Gerenciais",
								values: this.state.competencia_gerenciais,
								id: "competencia_gerenciais",
								tipo: "select",
								options: optionsCompetencias,
							},
						],
					},
					{
						categoria: "Engajamento",
						color: "warning",
						itens: [
							{
								title: "Relacionamento Interpessoal",
								values: this.state.engajamento_relacionamento_interpessoal,
								id: "engajamento_relacionamento_interpessoal",
								tipo: "select",
								options: optionsEngajamento,
							},
							{
								title: "Motivação e Comprometimento",
								values: this.state.engajamento_motivacao_comprometimento,
								id: "engajamento_motivacao_comprometimento",
								tipo: "select",
								options: optionsEngajamento,
							},
							{
								title: "Comunicação interna",
								values: this.state.engajamento_comunicacao_interna,
								id: "engajamento_comunicacao_interna",
								tipo: "select",
								options: optionsEngajamento,
							},
							{
								title: "Clima Organizacional",
								values: this.state.engajamento_clima_organizacional,
								id: "engajamento_clima_organizacional",
								tipo: "select",
								options: optionsEngajamento,
							},
						],
					},
					{
						categoria: "Retenção",
						color: "danger",
						itens: [
							{
								title: "Plano de Carreira",
								values: this.state.retencao_plano_carreira,
								id: "retencao_plano_carreira",
								tipo: "select",
								options: optionsRetencao,
							},
							{
								title: "Cargos e Salários",
								values: this.state.retencao_cargo_salario,
								id: "retencao_cargo_salario",
								tipo: "select",
								options: optionsRetencao,
							},
							{
								title: "Avaliação de Desempenho",
								values: this.state.retencao_avaliacao_desempenho,
								id: "retencao_avaliacao_desempenho",
								tipo: "select",
								options: optionsRetencao,
							},
							{
								title: "Reconhecimento das pessoas",
								values: this.state.retencao_reconhecimento_pessoas,
								id: "retencao_reconhecimento_pessoas",
								tipo: "select",
								options: optionsRetencao,
							},
							{
								title: "Recompensa",
								values: this.state.retencao_recompensa,
								id: "retencao_recompensa",
								tipo: "select",
								options: optionsRetencao,
							},
						],
					},
					{
						categoria: "Inovação",
						color: "success",
						itens: [
							{
								title: "O % de faturamento oriundo de inovação é:",
								values: this.state.faturamento_oriundo_inovacao,
								id: "faturamento_oriundo_inovacao",
								tipo: "%",
							},
							{
								title:
									"O total de inovações implementadas na empresa nos ultimos 12 meses foi:",
								values: this.state.total_inovacao_implementada_empresa,
								id: "total_inovacao_implementada_empresa",
								tipo: "int",
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
export default PessoasForm;
