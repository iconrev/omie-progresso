import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableResultados from "./TableResultados";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";
import { toast } from "react-toastify";

class VendasForm extends Component {
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
			"comercial",
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

	loadStates = async (vendas, ano) => {
		this.setState({
			ano: ano,
			vendas: vendas.id,
			ano_exercicio: vendas.ano_exercicio,
			propostas_enviadas_no_ano: vendas.propostas_enviadas_no_ano,
			novos_clientes_no_ano: vendas.novos_clientes_no_ano,
			notas_fiscais_emitidas: vendas.notas_fiscais_emitidas,
			clientes_fidelizados: vendas.clientes_fidelizados,
			carteira_de_clientes_ativa: vendas.carteira_de_clientes_ativa,
			reclamacoes_clientes: vendas.reclamacoes_clientes,
			clientes_perdidos: vendas.clientes_perdidos,
			propostas_aprovadas_no_ano: vendas.propostas_aprovadas_no_ano,
			base_clientes: vendas.base_clientes,
			nivel_relacionamento_clientes: vendas.nivel_relacionamento_clientes,
			processos_politica_relacionamento_cliente:
				vendas.processos_politica_relacionamento_cliente,
			canais_comunicacao_estruturado: vendas.canais_comunicacao_estruturado,
			equipe_treinada_para_relacionamento:
				vendas.equipe_treinada_para_relacionamento,
			execucao_plano_relacionamento: vendas.execucao_plano_relacionamento,
			atuacao_demanda_identificadas: vendas.atuacao_demanda_identificadas,
		});
	};

	loaded = () => {
		const options = [
			{ value: "MuitoBom", label: "Muito Bom" },
			{ value: "Bom", label: "Bom" },
			{ value: "Deficiente", label: "Deficiente" },
			{ value: "NaoTem", label: "NaoTem" },
		];

		return (
			<TableResultados
				resource={"comercial"}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"Dados Comerciais"}
				history={this.props.history}
				return={`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/comercial`}
				years={this.state.ano_exercicio}
				data={[
					{
						categoria: "Marketing",
						color: "success",
						itens: [
							{
								title: "Carteira de Clientes Ativa",
								values: this.state.carteira_de_clientes_ativa,
								id: "carteira_de_clientes_ativa",
								tipo: "int",
							},
							{
								title: "Novos Clientes no Ano",
								values: this.state.novos_clientes_no_ano,
								id: "novos_clientes_no_ano",
								tipo: "int",
							},
							{
								title: "Base de Clientes Cadastrados",
								values: this.state.base_clientes,
								id: "base_clientes",
								tipo: "int",
							},
						],
					},
					{
						categoria: "Comercial",
						color: "primary",
						itens: [
							{
								title: "Propostas enviadas no ano",
								values: this.state.propostas_enviadas_no_ano,
								id: "propostas_enviadas_no_ano",
								tipo: "int",
							},
							{
								title: "Propostas aprovadas no ano",
								values: this.state.propostas_aprovadas_no_ano,
								id: "propostas_aprovadas_no_ano",
								tipo: "int",
							},
							{
								title: "Notas fiscais emitidas",
								values: this.state.notas_fiscais_emitidas,
								id: "notas_fiscais_emitidas",
								tipo: "int",
							},
						],
					},
					{
						categoria: "Relacionamento",
						color: "warning",
						itens: [
							{
								title: "Clientes fidelizados",
								values: this.state.clientes_fidelizados,
								id: "clientes_fidelizados",
								tipo: "int",
							},
							{
								title: "Processo e política de relaciomento com cliente",
								values: this.state.processos_politica_relacionamento_cliente,
								id: "processos_politica_relacionamento_cliente",
								tipo: "select",
								options: options,
							},
							{
								title: "Canais de comunicação estruturados",
								values: this.state.canais_comunicacao_estruturado,
								id: "canais_comunicacao_estruturado",
								tipo: "select",
								options: options,
							},
							{
								title: "Equipe treinada para relacionamento com cliente",
								values: this.state.equipe_treinada_para_relacionamento,
								id: "equipe_treinada_para_relacionamento",
								tipo: "select",
								options: options,
							},
							{
								title: "Execução do plano de relacionamento com cliente",
								values: this.state.execucao_plano_relacionamento,
								id: "execucao_plano_relacionamento",
								tipo: "select",
								options: options,
							},
							{
								title: "Atuação nas demandas identificadas nos clientes",
								values: this.state.atuacao_demanda_identificadas,
								id: "atuacao_demanda_identificadas",
								tipo: "select",
								options: options,
							},
						],
					},
					{
						categoria: "Satisfação do Cliente",
						color: "danger",
						itens: [
							{
								title: "Reclamações clientes",
								values: this.state.reclamacoes_clientes,
								id: "reclamacoes_clientes",
								tipo: "int",
							},
							{
								title: "Clientes perdidos",
								values: this.state.clientes_perdidos,
								id: "clientes_perdidos",
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

export default VendasForm;
