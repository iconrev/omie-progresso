/* eslint-disable max-len */
import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableAvaliacao from "./TableAvaliacao";
import { toast } from "react-toastify";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";

class PessoasAvaliacaoForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			showModalRedirect: false,
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
			"pessoas"
		);

		const { status, message } = response;

		if (status === "unauthorized") {
			console.warn("Usuário não possui acesso ao recurso comercial");
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

		if (!analise) {
			console.error("Não há dados para o ano");
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/pessoas/editar`
			);
		}

		if (analise.status === "diagnostic_not_found") {
			toast.warn(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/pessoas/editar`
			);
		}

		if (status !== "success") {
			toast.warn(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/pessoas/editar`
			);
		}

		const {
			pessoas,
			avaliacao,
			comercial,
			nivel_competencia,
			nivel_engajamento,
			nivel_retencao,
		} = analise;

		const pessoasStates = pessoas
			? {
					pessoasId: pessoas.id,
					funcionarios_antigos: pessoas.funcionarios_antigos,
					rotatividade: pessoas.rotatividade,
					absenteismo: pessoas.absenteismo,
					faturamento_oriundo_inovacao: pessoas.faturamento_oriundo_inovacao,
					total_inovacao_implementada_empresa:
						pessoas.total_inovacao_implementada_empresa,
			  }
			: {};

		const comercialStates = comercial
			? {
					smile_carteira_de_clientes_ativa:
						comercial.carteira_de_clientes_ativa || "",
					smile_propostas_aprovadas_no_ano:
						comercial.propostas_aprovadas_no_ano || "",
			  }
			: {};

		this.setState({
			nivel_competencia: nivel_competencia,
			nivel_engajamento: nivel_engajamento,
			nivel_retencao: nivel_retencao,
			...avaliacao,
			...pessoasStates,
			...comercialStates,
		});
	};

	loaded() {
		const id = this.state.companyId;
		const ano = this.state.exercicio_definido;
		return (
			<TableAvaliacao
				resource={"pessoas"}
				title={"Diagnóstico de Ambiente Interno"}
				subtitle={"Análise de Desempenho Pessoas"}
				ano={ano}
				history={this.props.history}
				edit={`/hub/${id}/gestao/categoria/diagnostico/interno/pessoas/editar`}
				data={[
					{
						categoria: "COMPETÊNCIA",
						color: "success",
						itens: [
							{
								analise: "% Competências Atuais/Requeridas",
								resultado: this.state.nivel_competencia,
								avaliacao: this.state.smile_nivel_competencia,
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
								resultado: this.state.absenteismo,
								avaliacao: this.state.smile_absenteismo,
								tipo: "%",
								id: "smile_absenteismo",
								tooltip:
									"Relação % entre o tempo efetivo de trabalho com relação ao tempo planejado de trabalho dos colaboradores",
							},
							{
								analise: "% de Engajamento",
								resultado: this.state.nivel_engajamento,
								avaliacao: this.state.smile_nivel_engajamento,
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
								resultado: this.state.rotatividade,
								avaliacao: this.state.smile_rotatividade,
								tipo: "%",
								id: "smile_rotatividade",
								tooltip:
									"Relação % entre o total de colaboradores desligados pelo total de colaboradores da empresa",
							},
							{
								analise: "% Funcionários com > 12 meses",
								resultado: this.state.funcionarios_antigos,
								avaliacao: this.state.smile_funcionarios_antigos,
								tipo: "%",
								id: "smile_funcionarios_antigos",
								tooltip:
									"Relação % do total de colaboradores com mais de 12 meses na empresa com relação ao total de colaboradores na empresa.",
							},
							{
								analise: "% Nivel dos Processos de Retenção",
								resultado: this.state.nivel_retencao,
								avaliacao: this.state.smile_nivel_retencao,
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
								resultado: this.state.total_inovacao_implementada_empresa,
								avaliacao: this.state.smile_total_inovacao_implementada_empresa,
								tipo: "int",
								id: "smile_total_inovacao_implementada_empresa",
								tooltip:
									"Número de inovações introduzidos nos processos, sistemas, produtos e/ou serviços implementadas no período na empresa",
							},
							{
								analise: "% Faturamento para Inovação",
								resultado: this.state.faturamento_oriundo_inovacao,
								avaliacao: this.state.smile_faturamento_oriundo_inovacao,
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

	render() {
		return this.state.isLoading ? <LoadingSpinner /> : this.loaded();
	}
}
export default PessoasAvaliacaoForm;
